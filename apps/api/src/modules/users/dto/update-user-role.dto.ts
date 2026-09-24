import { updateUserRoleSchema } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserRoleDto extends createZodDto(updateUserRoleSchema) {}