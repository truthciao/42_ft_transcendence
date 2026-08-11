import { createZodDto } from 'nestjs-zod';
import { updateProfileSchema } from '@repo/shared-types';

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
