import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { raw, type Request } from "express";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import { WorkspacesService } from "./workspaces.service";

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(this.getUserId(req), dto.name);
  }

  @Get()
  findMine(@Req() req: Request) {
    return this.workspacesService.findAllForUser(this.getUserId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') rawId: string) {
    return this.workspacesService.findOne(this.parseWorkspaceId(rawId), this.getUserId(req));
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') rawId: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update(this.parseWorkspaceId(rawId), this.getUserId(req), dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') rawId: string) {
    return this.workspacesService.remove(this.parseWorkspaceId(rawId), this.getUserId(req));
  }

  private getUserId(req: Request): number {
    const rawUserId = req.headers['x-user-id'];
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const parsed = Number(userId);

    if (!userId || !Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid X-User-Id header - Bad userId');
    }

    return parsed;
  }

  private parseWorkspaceId(rawId: string): number {
    const parsed = Number(rawId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid workspace ID');
    }

    return parsed;
  }
}
