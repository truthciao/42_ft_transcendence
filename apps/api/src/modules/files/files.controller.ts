import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service.js';
import { multerOptions } from './config/multer.config.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

// 定义经过 JWT 解析后的用户载荷（Payload）结构，匹配你项目的实际字段
interface JwtUserPayload {
  id?: number;
  userId?: number;
  sub?: number;
  [key: string]: any;
}

@Controller('files')
@UseGuards(JwtAuthGuard) // 保护所有文件路由，必须登录
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('context') context: string,
    @CurrentUser() user: JwtUserPayload, // 使用明确的接口类型代替 any
  ) {
    // 增加一行打印，以后在终端里一眼就能看出队友给的用户对象长什么样
    console.log('当前登录用户 (Token Payload):', user);

    // 增强兼容性：优先取 id，如果没有就取 userId，再没有就取 sub，并确保转为数字类型
    const rawId = user.id ?? user.userId ?? user.sub;
    const uploaderId = Number(rawId);

    const result = await this.filesService.saveFileRecord(
      uploaderId,
      file,
      context || 'chat',
    );
    return { data: result };
  }

  @Delete(':id')
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    const userId = Number(user.id ?? user.userId ?? user.sub);
    return this.filesService.deleteFile(id, userId);
  }
}
