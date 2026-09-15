import { createZodDto } from 'nestjs-zod';

import { createConversationByUsernameSchema } from '@repo/shared-types';

export class CreateConversationByUsernameDto extends createZodDto(
  createConversationByUsernameSchema,
) {}