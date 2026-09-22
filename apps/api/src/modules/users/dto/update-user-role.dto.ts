import { UserRole } from '../../../generated/prisma/enums.js';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}