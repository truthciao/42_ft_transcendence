import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { type Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { UsersService } from '../users/users.service.js';
import { ConfigService } from '@nestjs/config';

interface AuthenticateUser {
  id: number;
  userId: number;
  email: string;
  isTwoFactorEnabled: boolean;
  [key: string]: any;
}

interface RequestWithUser extends Request {
  user: AuthenticateUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: RequestWithUser, @Res() res: Response): void {
    const user = req.user;

    const webOrigin =
      this.configService.get<string>('WEB_ORIGIN') ?? 'https://localhost:8443';

    if (user.isTwoFactorEnabled) {
      res.redirect(`${webOrigin}/login?requires2FA=true&userId=${user.id}`);
      return;
    }

    const tokenData = this.authService.generateToken({
      id: String(user.id),
      email: user.email,
    });

    const accessToken = tokenData.access_token || '';

    res.redirect(`${webOrigin}/login?token=${accessToken}`);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generate2FA(@Req() req: RequestWithUser) {
    const userId = Number(req.user.userId || req.user.id);
    return this.authService.generateTwoFactorSecret(userId);
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOn2FA(@Req() req: RequestWithUser, @Body() dto: { code: string }) {
    const userId = Number(req.user.userId || req.user.id);
    return this.authService.turnOnTwoFactor(userId, dto.code);
  }

  @Post('2fa/toggle')
  @UseGuards(JwtAuthGuard)
  async toggle2FA(
    @Req() req: RequestWithUser,
    @Body('enabled') enabled: boolean,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return this.usersService.enableTwoFactor(userId, enabled);
  }

  @Post('login-2fa')
  @HttpCode(HttpStatus.OK)
  async loginWith2fa(@Body() dto: { userId: number; code: string }) {
    return this.authService.loginWith2fa(dto.userId, dto.code);
  }
}
