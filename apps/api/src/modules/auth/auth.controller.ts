import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
  email!: string;
  password!: string;
  username!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(
      dto.email,
      dto.password,
      dto.username,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
