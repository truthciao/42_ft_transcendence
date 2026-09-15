import { createZodDto } from 'nestjs-zod';
import { documentYjsUpdateSchema } from '@repo/shared-types';

export class DocumentYjsUpdateDto extends createZodDto(
  documentYjsUpdateSchema,
) {}