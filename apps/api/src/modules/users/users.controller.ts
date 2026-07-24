import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('test-validation')
  testValidation(@Body() dto: CreateUserDto) {
    return {
      message: 'validation passed',
      data: dto,
    };
  }
}

