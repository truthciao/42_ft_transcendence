import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';

import {
  WorkspaceRole,
} from '../../generated/prisma/client.js';

import type {
  WorkspaceMember,
} from '../../generated/prisma/client.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WorkspaceRoleGuard } from '../workspaces/guards/workspace-role.guard.js';
import { CurrentMembership } from '../workspaces/decorators/current-membership.decorator.js';
import { minWorkspaceRole } from '../workspaces/decorators/min-workspace-role.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Post()
  create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @CurrentMembership() membership: WorkspaceMember,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documents.create(workspaceId, membership, dto);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Get()
  findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.documents.findAll(workspaceId);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Get(':documentId')
  findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
  ) {
    return this.documents.findOne(workspaceId, documentId);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Patch(':documentId')
  update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(
        workspaceId,
        documentId,
        dto,
    );
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Delete(':documentId')
  remove(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentMembership() membership: WorkspaceMember,
  ) {
    return this.documents.remove(
      workspaceId,
      documentId,
      membership,
    );
  }
}