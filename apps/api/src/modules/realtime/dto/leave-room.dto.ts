import { createZodDto } from 'nestjs-zod';
import { roomSchema } from '@repo/shared-types';

export class LeaveRoomDto extends createZodDto(roomSchema) {}
