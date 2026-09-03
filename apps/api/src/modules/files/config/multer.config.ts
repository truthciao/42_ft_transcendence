import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export const multerOptions = {
  storage: diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const query = req.query as { context?: string };
      const context = query?.context || 'chat';
      const subFolder = context === 'avatar' ? 'avatars' : 'attachments';
      const targetPath = `./uploads/${subFolder}`;

      // 如果对应的子文件夹不存在，自动递归创建
      if (!existsSync(targetPath)) {
        mkdirSync(targetPath, { recursive: true });
      }

      cb(null, targetPath);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const ext = extname(file.originalname).toLowerCase();
      const uniqueName = (uuidv4 as () => string)() + ext;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/zip'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpException('UNSUPPORTED_FILE_TYPE', HttpStatus.BAD_REQUEST), false
      );
    }
  },
};