import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

type UsersServiceMock = {
  findByEmail: jest.MockedFunction<UsersService['findByEmail']>;
  findByUsername: jest.MockedFunction<UsersService['findByUsername']>;
  createUser: jest.MockedFunction<UsersService['createUser']>;
  findById: jest.MockedFunction<UsersService['findById']>;
  updateTwoFactorSecret: jest.MockedFunction<
    UsersService['updateTwoFactorSecret']
  >;
  enableTwoFactor: jest.MockedFunction<UsersService['enableTwoFactor']>;
};

type JwtServiceMock = {
  sign: jest.Mock<(payload: object) => string>;
  signAsync: jest.Mock<(payload: object) => Promise<string>>;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: UsersServiceMock;
  let jwtServiceMock: JwtServiceMock;

  beforeEach(async () => {
    usersServiceMock = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
      updateTwoFactorSecret: jest.fn(),
      enableTwoFactor: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(null);

      usersServiceMock.createUser.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
      } as Awaited<ReturnType<UsersService['createUser']>>);

      const dto: RegisterDto = {
        email: 'test@42.fr',
        password: 'password123',
        username: 'testuser',
      };

      const result = await service.register(dto);

      expect(result).toEqual({
        message: 'User registered successfully',
        userId: 1,
      });

      expect(usersServiceMock.createUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email or username already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'existing',
        passwordHash: null,
        profile: null,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      });

      usersServiceMock.findByUsername.mockResolvedValue(null);

      const dto: RegisterDto = {
        email: 'test@42.fr',
        password: 'password123',
        username: 'testuser',
      };

      await expect(service.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
        passwordHash: hashedPassword,
        profile: null,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      });

      jwtServiceMock.signAsync.mockResolvedValue('mocked_jwt_token');

      const dto: LoginDto = {
        email: 'test@42.fr',
        password: 'password123',
      };

      const result = await service.login(dto);

      expect(result).toHaveProperty(
        'access_token',
        'mocked_jwt_token',
      );

      expect(result.user).toEqual({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      const dto: LoginDto = {
        email: 'wrong@42.fr',
        password: 'password123',
      };

      await expect(service.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
        passwordHash: hashedPassword,
        profile: null,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      });

      const dto: LoginDto = {
        email: 'test@42.fr',
        password: 'WRONG_PASSWORD',
      };

      await expect(service.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
