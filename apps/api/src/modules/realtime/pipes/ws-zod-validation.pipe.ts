import { ArgumentMetadata, Injectable } from '@nestjs/common';
import {
  ZodValidationException,
  ZodValidationPipe,
} from 'nestjs-zod';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsZodValidationPipe extends ZodValidationPipe {
  override transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): unknown {
    try {
      return super.transform(value, metadata);
    } catch (error: unknown) {
      if (error instanceof ZodValidationException) {
        const zodError = error.getZodError();

        if (
          zodError &&
          typeof zodError === 'object' &&
          'issues' in zodError
        ) {
          throw new WsException({
            message: 'Validation failed',
            errors: zodError.issues,
          });
        }

        throw new WsException('Validation failed');
      }

      throw error;
    }
  }
}