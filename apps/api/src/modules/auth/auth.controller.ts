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
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { type Response } from 'express';

interface AuthenticateUser {
  id: string;
  email: string;
  [key: string]: any;
}

interface RequestWithUser extends Request {
  user: AuthenticateUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const tokenData = this.authService.generateToken(user);

    const accessToken = tokenData.access_token || '';

    res.redirect(`http://localhost:5173/login?token=${accessToken}`);
  }
}
