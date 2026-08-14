import { createZodDto } from 'nestjs-zod';
import { sendMessageSchema } from '@repo/shared-types';

export class SendMessageDto extends createZodDto(sendMessageSchema) {}