import { createZodDto } from 'nestjs-zod';
import { searchMessagesSchema } from '@repo/shared-types';

export class SearchMessagesDto extends createZodDto(
  searchMessagesSchema,
) {}