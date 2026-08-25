import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

// 上传目录设置在项目根目录的 uploads 文件夹
const uploadPath = './uploads';
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
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
      cb(new HttpException('不支持的文件类型', HttpStatus.BAD_REQUEST), false);
    }
  },
};