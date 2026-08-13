import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from '@repo/shared-types';

export class CreateUserDto extends createZodDto(createUserSchema) {}
