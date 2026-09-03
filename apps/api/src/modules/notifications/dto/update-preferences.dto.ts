import { createZodDto } from 'nestjs-zod';
import { updateNotificationPreferencesSchema } from '@repo/shared-types';

export class UpdatePreferencesDto extends createZodDto(
  updateNotificationPreferencesSchema,
) {}
