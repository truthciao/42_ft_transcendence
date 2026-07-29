import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    // 1. Mock 伪造 PrismaService 句柄
    prismaMock = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    // 2. Mock 伪造 JwtService 句柄
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null); // 假装没有重复账号
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
      });

      const result = await service.register(
        'test@42.fr',
        'password123',
        'testuser',
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        userId: 1,
      });
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email or username already exists', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 1 }); // 假装找到了重复用户

      await expect(
        service.register('test@42.fr', 'password123', 'testuser'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
        passwordHash: hashedPassword,
      });

      const result = await service.login('test@42.fr', 'password123');

      expect(result).toHaveProperty('access_token', 'mocked_jwt_token');
      expect(result.user).toEqual({
        id: 1,
        email: 'test@42.fr',
        username: 'testuser',
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login('wrong@42.fr', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@42.fr',
        passwordHash: hashedPassword,
      });

      await expect(
        service.login('test@42.fr', 'WRONG_PASSWORD'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
