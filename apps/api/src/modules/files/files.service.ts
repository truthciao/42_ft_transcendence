import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import * as fs from 'fs';
import * as path from 'path';
import { realpathSync } from 'node:fs';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveUploadPath(fileUrl: string): string | null {
  const uploadsRoot = path.resolve(process.cwd(), 'uploads');

  if (
    !fileUrl.startsWith('/uploads/attachments/') &&
    !fileUrl.startsWith('/uploads/avatars/')
  ) {
    return null;
  }

  const filePath = path.resolve(process.cwd(), `.${fileUrl}`);

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return null;
  }

  try {
    const realUploadsRoot = realpathSync(uploadsRoot);
    const realFilePath = realpathSync(filePath);

    if (!realFilePath.startsWith(`${realUploadsRoot}${path.sep}`)) {
      return null;
    }

    return realFilePath;
  } catch {
    return null;
  }
}

  async saveFileRecord(
    userId: number,
    file: Express.Multer.File,
    context: string,
  ) {
    const subFolder = context === 'avatar' ? 'avatars' : 'attachments';
    const fileUrl = `/uploads/${subFolder}/${file.filename}`;

    return this.prisma.attachment.create({
      data: {
        // 放弃直接写 uploaderId，改用 Prisma 的 connect 语法！
        // 这句话的意思是：“把这个文件，挂载到 ID 为 userId 的用户身上”
        uploader: {
          connect: { id: userId },
        },
        fileName: file.originalname,
        fileUrl: fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
  }

  async deleteFile(fileId: string, userId: number) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: fileId },
    });
    if (!attachment) {
      throw new NotFoundException('FILE_NOT_FOUND');
    }

    if (attachment.uploaderId !== userId) {
      throw new ForbiddenException('PERMISSION_DENIED');
    } 

    const filePath = this.resolveUploadPath(attachment.fileUrl);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.attachment.delete({ where: { id: fileId } });
    return { message: 'FILE_DELETED_SUCCESSFULLY' };
  }

  async getFileUrlsByUser(userId: number) {
    return this.prisma.attachment.findMany({
      where: { uploaderId: userId },
      select: { fileUrl: true },
    });
  }

  deletePhysicalFiles(fileUrls: string[]) {
    for (const fileUrl of fileUrls) {
      const filePath = this.resolveUploadPath(fileUrl);

      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
  deletePhysicalFile(fileUrl: string | null) {
    if (!fileUrl) {
      return;
    }

    const filePath = this.resolveUploadPath(fileUrl);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
