import { createZodDto } from 'nestjs-zod';
import { documentTitleUpdatedSchema } from '@repo/shared-types';

export class DocumentTitleUpdatedDto extends createZodDto(
  documentTitleUpdatedSchema,
) {}