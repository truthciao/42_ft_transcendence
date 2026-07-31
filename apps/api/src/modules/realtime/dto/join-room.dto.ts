import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinRoomDto {
  @IsString({ message: 'room must be a string' })
  @IsNotEmpty({ message: 'room is required' })
  @MaxLength(200, { message: 'room must not exceed 200 characters' })
  room!: string;
}
