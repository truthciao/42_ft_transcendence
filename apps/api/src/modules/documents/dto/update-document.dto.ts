import { createZodDto } from 'nestjs-zod';
import { updateDocumentSchema } from '@repo/shared-types';

export class UpdateDocumentDto extends createZodDto(
  updateDocumentSchema,
) {}