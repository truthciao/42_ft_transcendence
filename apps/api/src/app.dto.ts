import { IsEmail, IsString, MinLength } from 'class-validator';

export class TestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  username!: string;
}

