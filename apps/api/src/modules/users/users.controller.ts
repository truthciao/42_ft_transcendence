import { BadRequestException, Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getCurrentUser(@Req() req: Request) {
    return this.usersService.findById(this.getUserId(req));
  }

  private getUserId(req: Request): number {
    const rawUserId = req.headers['x-user-id'];
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      throw new BadRequestException('Missing X-User-Id header');
    }

    const parsed = Number(userId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid X-User-Id header');
    }

    return parsed;
  }
}
