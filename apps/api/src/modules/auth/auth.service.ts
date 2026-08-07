import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../prisma/prisma.service';

import { generateSecret, verify, generateURI } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  //Sign up a new user
  async register(dto: RegisterDto) {
    //step 1: non-blocking waiting for return data and assign pointer to existingUser
    const existingEmail = await this.userService.findByEmail(dto.email);
    const existingUsername = await this.userService.findByUsername(
      dto.username,
    );
    if (existingEmail || existingUsername) {
      throw new BadRequestException('Email or username already exists');
    }

    //step 2: add new user info into the database
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.createUser({
      email: dto.email,
      username: dto.username,
      passwordHash: passwordHash,
    });
    return { message: 'User registered successfully', userId: user.id };
  }

  //log in an exising user
  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email not registered!');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Please log in using your OAuth provider (e.g 42 intra / Google account) ',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.isTwoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Please provide your 2FA code',
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  // Validate and link/create the OAuth user in the database
  async validateOAuthUser(dto: {
    provider: string;
    providerId: string;
    email: string;
    username: string;
  }) {
    // 1. check if a OAuth account has been linked with user account
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: dto.provider,
          providerId: dto.providerId,
        },
      },
      include: { user: true },
    });

    if (oauthAccount) {
      return oauthAccount.user;
    }

    // 2. No OAuth account has been linked before, check if email does exist?
    let user = await this.userService.findByEmail(dto.email);

    if (!user) {
      // 3. create a new user linked with OAuth account
      user = await this.userService.createUser({
        email: dto.email,
        username: dto.username,
        passwordHash: '', // No password for the OAuth account
      });
    }

    // 4. Update the OAuthAccount database
    await this.prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: dto.provider,
        providerId: dto.providerId,
      },
    });
    return user;
  }

  generateToken(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateTwoFactorSecret(userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = generateSecret();

    await this.userService.updateTwoFactorSecret(userId, secret);

    const otpauthUrl = generateURI({
      issuer: 'WorkSpaceApp',
      label: user.email,
      secret: secret,
    });

    return {
      secret,
      otpauthUrl,
    };
  }

  // Verify the initial 2FA code to enable 2FA for the user.
  async turnOnTwoFactor(userId: number, code: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA Secret not initialized');
    }

    const result = await verify({
      token: code,
      secret: user.twoFactorSecret,
      epochTolerance: 2,
    });

    if (!result.valid) {
      throw new BadRequestException('Invalid 2FA verification code');
    }

    await this.userService.enableTwoFactor(userId, true);

    return {
      success: true,
      message: '2FA enabled successfully',
    };
  }

  // Verify the 2FA code during routine login and issue the JWT access token.
  async loginWith2fa(userId: number, code: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('User not found or 2FA not initialized');
    }

    const result = await verify({
      token: code,
      secret: user.twoFactorSecret,
      epochTolerance: 2,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA verification code');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
