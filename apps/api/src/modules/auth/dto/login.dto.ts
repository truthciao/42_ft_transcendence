import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@repo/shared-types';

export class LoginDto extends createZodDto(loginSchema) {}
