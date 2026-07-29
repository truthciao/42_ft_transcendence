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
  @MinLength(3, {
    message: 'displayName must be at least 3 characters long',
  })
  @MaxLength(30, {
    message: 'displayName must not exceed 30 characters',
  })
  displayName?: string;

  @IsOptional()
  @IsString({ message: 'bio must be a string' })
  @MaxLength(300, {
    message: 'bio must not exceed 300 characters',
  })
  bio?: string;

  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'avatarUrl must be a valid URL',
    },
  )
  avatarUrl?: string;
}
