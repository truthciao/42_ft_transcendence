import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { WorkspaceRole } from '../../../generated/prisma/enums.js';
export class InviteMemberDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}
