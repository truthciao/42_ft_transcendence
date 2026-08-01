import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @Min(1)
  conversationId!: number;

  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content is required' })
  @MaxLength(4000, { message: 'content must not exceed 4000 characters' })
  content!: string;
}
