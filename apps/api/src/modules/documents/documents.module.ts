import { Module } from '@nestjs/common';

import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsYjsService } from './documents-yjs.service.js';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsYjsService,],
  exports: [DocumentsService, DocumentsYjsService,],
})
export class DocumentsModule {}