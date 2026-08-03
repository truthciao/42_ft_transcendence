import { IsInt, Min } from 'class-validator';

export class SendFriendRequestDto {
  @IsInt({ message: 'addresseeId must be an integer' })
  @Min(1, { message: 'addresseeId must be a positive integer' })
  addresseeId!: number;
}
