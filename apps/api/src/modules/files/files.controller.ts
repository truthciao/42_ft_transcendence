import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service.js';
import { multerOptions } from './config/multer.config.js';
// 完美复用你们已有的基础设施：
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

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
    // 增加一行打印，以后在终端里一眼就能看出队友给的用户对象长什么样
    console.log('当前登录用户 (Token Payload):', user);

    // 增强兼容性：优先取 id，如果没有就取 userId，再没有就取 sub
    const uploaderId = user.id || user.userId || user.sub;

    // 根据你的数据库记录，ID 已经被 migration 转成了 Int
    const result = await this.filesService.saveFileRecord(uploaderId, file, context || 'chat');
    return { data: result };
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.deleteFile(id, user.id);
  }
}