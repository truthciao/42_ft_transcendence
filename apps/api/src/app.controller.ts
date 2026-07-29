import { Body, Controller, Get, Post } from '@nestjs/common';
import { TestDto } from './app.dto';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return 'Hello World!';
  }

  @Post('test-validation')
  testValidation(@Body() dto: TestDto) {
    return {
      message: 'validation passed',
      data: dto,
    };
  }
}
