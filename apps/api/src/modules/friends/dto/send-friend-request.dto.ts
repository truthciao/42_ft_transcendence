import { createZodDto } from 'nestjs-zod';
import { sendFriendRequestSchema } from '@repo/shared-types';

export class SendFriendRequestDto extends createZodDto(
  sendFriendRequestSchema,
) {}