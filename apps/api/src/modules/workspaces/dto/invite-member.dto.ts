import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { WorkspaceRole } from '../../../generated/prisma/enums.js';
export class InviteMemberDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER])
  role?: WorkspaceRole;
}

export class TransferOwnershipDto {
  @IsInt()
  @Min(1)
  targetUserId!: number;
}
