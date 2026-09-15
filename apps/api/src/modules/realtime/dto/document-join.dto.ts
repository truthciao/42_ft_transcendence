import { createZodDto } from 'nestjs-zod';
import { documentJoinSchema } from '@repo/shared-types';

export class DocumentJoinDto extends createZodDto(
  documentJoinSchema,
) {}