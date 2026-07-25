import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile() {
    return this.usersService.getProfile();
  }

  @Patch('me')
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(dto);
  }
}