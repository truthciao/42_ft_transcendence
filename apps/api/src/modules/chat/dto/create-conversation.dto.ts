import { createZodDto } from 'nestjs-zod';
import { createConversationSchema } from '@repo/shared-types';

export class CreateConversationDto extends createZodDto(
  createConversationSchema,
) {}