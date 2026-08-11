import { createZodDto } from 'nestjs-zod';
import { registerSchema } from '@repo/shared-types';

export class RegisterDto extends createZodDto(registerSchema) {}
