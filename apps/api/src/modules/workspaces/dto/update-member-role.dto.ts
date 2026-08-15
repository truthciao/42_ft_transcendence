import { createZodDto } from 'nestjs-zod';
import { updateMemberRoleSchema } from '@repo/shared-types';

export class UpdateMemberRoleDto extends createZodDto(updateMemberRoleSchema) {}
