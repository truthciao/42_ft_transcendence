/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    // 1. Mock 伪造 UsersService 句柄（对齐重构后的 AuthService 依赖）
    usersServiceMock = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      createUser: jest.fn(),
    };

    // 2. Mock 伪造 JwtService 句柄
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
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
      // 伪造 UsersService 查重返回 null
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(null);

      // 伪造 createUser 返回连带落盘结果
      usersServiceMock.createUser.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
      });

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
      // 假装查找到了重复邮箱
      usersServiceMock.findByEmail.mockResolvedValue({ id: 1 });
      usersServiceMock.findByUsername.mockResolvedValue(null);

      const dto: RegisterDto = {
        email: 'test@42.fr',
        password: 'password123',
        username: 'testuser',
      };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
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
      });

      const dto: LoginDto = {
        email: 'test@42.fr',
        password: 'password123',
      };

      const result = await service.login(dto);

      expect(result).toHaveProperty('access_token', 'mocked_jwt_token');
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

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        passwordHash: hashedPassword,
      });

      const dto: LoginDto = {
        email: 'test@42.fr',
        password: 'WRONG_PASSWORD',
      };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
