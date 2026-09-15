import { createZodDto } from 'nestjs-zod';
import { documentLeaveSchema } from '@repo/shared-types';

export class DocumentLeaveDto extends createZodDto(
  documentLeaveSchema,
) {}