import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service.js';
import { multerOptions } from './config/multer.config.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import {
  fileTypeFromFile,
  type FileTypeResult,
} from 'file-type';
import { extname } from 'node:path';
import { unlink } from 'node:fs/promises';

const allowedExtensions: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
};

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
    @CurrentUser() user: JwtUserPayload, // 使用明确的接口类型代替 any
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    let detectedType: FileTypeResult | undefined;

    try {
      detectedType = await fileTypeFromFile(file.path);
    } catch {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Invalid file');
    }

    const extension = extname(file.originalname).toLowerCase();

    const validExtensions = detectedType
      ? allowedExtensions[detectedType.mime]
      : undefined;

    if (!detectedType || !validExtensions?.includes(extension)) {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Invalid file');
    }
 
    const rawId = user.id ?? user.userId ?? user.sub;
    const uploaderId = Number(rawId);

    if (!Number.isSafeInteger(uploaderId) || uploaderId <= 0) {
      await unlink(file.path).catch(() => {});
      throw new UnauthorizedException('Invalid user identity');
    }

    try {
      const result = await this.filesService.saveFileRecord(
        uploaderId,
        file,
        'chat',
      );

      return { data: result };
    } catch (error) {
      await unlink(file.path).catch(() => {});
      throw error;
    }
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
