import { createZodDto } from 'nestjs-zod';
import { joinConversationSchema } from '@repo/shared-types';

export class JoinConversationDto extends createZodDto(
  joinConversationSchema,
) {}