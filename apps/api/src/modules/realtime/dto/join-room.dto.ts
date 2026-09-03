import { createZodDto } from 'nestjs-zod';
import { roomSchema } from '@repo/shared-types';

export class JoinRoomDto extends createZodDto(roomSchema) {}
