import {
  inviteMemberSchema,
  transferOwnershipSchema,
} from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

export class InviteMemberDto extends createZodDto(inviteMemberSchema) {}
export class TransferOwnershipDto extends createZodDto(
  transferOwnershipSchema,
) {}
