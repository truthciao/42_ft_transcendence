import { createZodDto } from 'nestjs-zod';
import { getMessagesSchema } from '@repo/shared-types';

export class GetMessagesDto extends createZodDto(getMessagesSchema) {}
