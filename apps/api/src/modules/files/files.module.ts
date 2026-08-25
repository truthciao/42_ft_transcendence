import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 引入你们封装好的 Prisma 模块
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}