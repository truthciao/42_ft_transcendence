import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // 对应你们的准确路径
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileRecord(userId: number, file: Express.Multer.File, context: string) {
    const fileUrl = `/uploads/${file.filename}`;

    return this.prisma.attachment.create({
      data: {
        uploaderId: userId,
        fileName: file.originalname,
        fileUrl: fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
  }

  async deleteFile(fileId: string, userId: number) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id: fileId } });
    if (!attachment) {
      throw new NotFoundException('FILE_NOT_FOUND');
    }

    if (attachment.uploaderId !== userId) {
      throw new ForbiddenException('PERMISSION_DENIED');
    }

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.attachment.delete({ where: { id: fileId } });
    return { message: 'FILE_DELETED_SUCCESSFULLY' };
  }
}