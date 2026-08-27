import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { WorkspaceRole } from '../../generated/prisma/client.js';
import type { WorkspaceMember } from '../../generated/prisma/client.js';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    workspaceId: number,
    membership: WorkspaceMember,
    dto: CreateDocumentDto,
  ) {
    return this.prisma.document.create({
      data: {
        workspaceId,
        creatorId: membership.userId,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async findAll(workspaceId: number) {
    return this.prisma.document.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(workspaceId: number, documentId: number) {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        workspaceId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    workspaceId: number,
    documentId: number,
    // membership: WorkspaceMember,
    dto: UpdateDocumentDto,
  ) {
    await this.findOne(workspaceId, documentId);

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }

  async remove(
    workspaceId: number,
    documentId: number,
    membership: WorkspaceMember,
  ) {
    await this.findOne(workspaceId, documentId);

    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only workspace admins can delete documents',
      );
    }

    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async findOneForUser(documentId: number, userId: number) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: document.workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    return document;
  }

  async findById(documentId: number) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findByIdForUser(documentId: number, userId: number) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: document.workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    return document;
  }

}