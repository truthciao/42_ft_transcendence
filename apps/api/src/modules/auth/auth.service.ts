import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  //Sign up a new user
  async register(email: string, password: string, username: string) {
    //step 1: non-blocking waiting for return data and assign pointer to existingUser
    const existingEmail = await this.userService.findByEmail(email);
    const existingUsername = await this.userService.findByUsername(username);
    if (existingEmail || existingUsername) {
      throw new BadRequestException('Email or username already exists');
    }

    //step 2: add new user info into the database
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userService.createUser({
      email: email,
      username: username,
      passwordHash: passwordHash,
    });
    return { message: 'User registered successfully', userId: user.id };
  }

  //log in an exising user
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Please log in using your OAuth provider (e.g 42 intra / Google account) ',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
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
