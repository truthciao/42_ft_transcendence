import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { CreateUserDto } from '../../users/dto/create-user.dto';

//inheritance validation rules from CreateUserDto
export class RegisterDto extends CreateUserDto {
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(8, { message: 'password must be at leate 8 characters long' })
  @MaxLength(64, { message: 'password must not exceed 64 characters ' })
  password!: string;
}
