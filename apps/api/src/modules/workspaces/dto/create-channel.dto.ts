import { createZodDto } from 'nestjs-zod';
import { createChannelSchema } from '@repo/shared-types';

export class CreateChannelDto extends createZodDto(createChannelSchema) {}
