import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { notificationTypeSchema } from '../../../../packages/shared-types/src/notifications.js';

const PreferenceItem = z.object({
  type: notificationTypeSchema,
  viaInApp: z.boolean().optional(),
  viaEmail: z.boolean().optional(),
  viaPush: z.boolean().optional(),
});

export const UpdatePreferencesSchema = z.object({
  preferences: z.array(PreferenceItem),
});

export class UpdatePreferencesDto extends createZodDto(UpdatePreferencesSchema) {}
