import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as Y from 'yjs';
import { DocumentsService } from './documents.service.js';

@Injectable()
export class DocumentsYjsService implements OnModuleDestroy {
  private readonly docs = new Map<number, Y.Doc>();

  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  async getDoc(
    documentId: number,
    userId: number,
  ): Promise<Y.Doc> {
    const existing = this.docs.get(documentId);

    if (existing) {
      return existing;
    }

    const state = await this.documentsService.getYDocState(
      documentId,
      userId,
    );

    const ydoc = new Y.Doc();

    if (state.length > 0) {
      Y.applyUpdate(ydoc, state);
    }

    this.docs.set(documentId, ydoc);

    return ydoc;
  }

  async applyUpdate(
    documentId: number,
    userId: number,
    update: Uint8Array,
  ): Promise<Y.Doc> {
    const ydoc = await this.getDoc(documentId, userId);

    Y.applyUpdate(ydoc, update);

    return ydoc;
  }

  async save(
    documentId: number,
    userId: number,
  ): Promise<void> {
    const ydoc = await this.getDoc(documentId, userId);

    const state = Y.encodeStateAsUpdate(ydoc);

    await this.documentsService.saveYDocState(
      documentId,
      userId,
      state,
    );
  }

  removeDoc(documentId: number): void {
    const ydoc = this.docs.get(documentId);

    if (!ydoc) {
      return;
    }

    ydoc.destroy();
    this.docs.delete(documentId);
  }

  onModuleDestroy(): void {
    for (const ydoc of this.docs.values()) {
      ydoc.destroy();
    }

    this.docs.clear();
  }
}