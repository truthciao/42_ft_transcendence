import { z } from 'zod';

export const roomSchema = z.object({
  room: z
    .string({ message: 'room must be a string' })
    .min(1, { message: 'room is required' })
    .max(200, { message: 'room must not exceed 200 characters' }),
});

export type RoomPayload = z.infer<typeof roomSchema>;
