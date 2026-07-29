import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsString({ message: 'username must be a string' })
  @IsNotEmpty({ message: 'username is required' })
  @MinLength(3, {
    message: 'username must be at least 3 characters long',
  })
  @MaxLength(30, {
    message: 'username must not exceed 30 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username may only contain letters, numbers, and underscores',
  })
  username!: string;
}
