import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { multerOptions } from './config/multer.config';
// 完美复用你们已有的基础设施：
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard) // 保护所有文件路由，必须登录
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('context') context: string,
    @CurrentUser() user: any // 直接拿解析好的用户对象！
  ) {
    // 根据你的数据库记录，ID 已经被 migration 转成了 Int
    const result = await this.filesService.saveFileRecord(user.id, file, context || 'chat');
    return { data: result };
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.deleteFile(id, user.id);
  }
}