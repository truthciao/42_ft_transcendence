import { createZodDto } from 'nestjs-zod';
import { createDocumentSchema } from '@repo/shared-types';

export class CreateDocumentDto extends createZodDto(createDocumentSchema) {}
