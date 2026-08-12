import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
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

export class UpdateMemberRoleDto {
  @IsIn([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER])
  role!: WorkspaceRole;
}

export class TransferOwnershipDto {
  @IsInt()
  @Min(1)
  targetUserId!: number;
}

export class CreateChannelDto {
  @IsString()
  @Length(1, 40)
  @Matches(/^[a-z0-9-_]+$/)
  name!: string;
}
