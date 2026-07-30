import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'displayName must be a string' })
  @MinLength(2, { message: 'displayName must be at least 2 characters long' })
  @MaxLength(100, { message: 'displayName must not exceed 100 characters' })
  displayName?: string;

  @IsOptional()
  @IsString({ message: 'bio must be a string' })
  @MaxLength(500, { message: 'bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'avatarUrl must be a valid HTTP/HTTPS URL' },
  )
  @MaxLength(2048, { message: 'avatarUrl must not exceed 2048 characters' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'preferredLanguage must be a string' })
  @MaxLength(20, { message: 'preferredLanguage must not exceed 20 characters' })
  preferredLanguage?: string;
}
