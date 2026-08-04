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
  googleLoginCallback(
    @Req() req: { user: AuthenticateUser },
    @Res() res: Response,
  ) {
    const user = req.user;
    const tokenData = this.authService.generateToken(req.user);

    return res.json({
      message: 'Log in success with Google account!',
      user: user,
      ...tokenData,
    });
    // return res.redirect(`http://localhost:5173/auth/success?token=${tokenData.access_token}`);
  }
}
