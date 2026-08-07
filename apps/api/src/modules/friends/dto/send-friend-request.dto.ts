import { IsInt, Min } from 'class-validator';
import type { SendFriendRequestDto as SendFriendRequestDtoInterface } from '@repo/shared-types';

export class SendFriendRequestDto implements SendFriendRequestDtoInterface {
  @IsInt({ message: 'addresseeId must be an integer' })
  @Min(1, { message: 'addresseeId must be a positive integer' })
  addresseeId!: number;
}
