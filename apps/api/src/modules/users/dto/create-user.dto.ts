import { createZodDto } from 'nestjs-zod';
import { userSchema } from '@repo/shared-types';

export class CreateUserDto extends createZodDto(userSchema) {}