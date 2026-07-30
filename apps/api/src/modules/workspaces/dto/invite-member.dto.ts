import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { WorkspaceRole } from 'src/generated/prisma/client';

export class InviteMemberDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}
