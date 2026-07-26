import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_048)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredLanguage?: string;
}
