import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerOptions = {
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      // 根据 URL query 中的 context 动态决定子目录
      const context = req.query?.context || 'chat';
      const subFolder = context === 'avatar' ? 'avatars' : 'attachments';
      const targetPath = `./uploads/${subFolder}`;

      // 如果对应的子文件夹不存在，自动递归创建
      if (!existsSync(targetPath)) {
        mkdirSync(targetPath, { recursive: true });
      }

      cb(null, targetPath);
    },
    filename: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/zip'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpException('UNSUPPORTED_FILE_TYPE', HttpStatus.BAD_REQUEST), 
        false
      );
    }
  },
};