import { httpGet, httpPatch } from '@/lib/http';

export interface Document {
  id: number;
  title: string;
  content: string;
  workspaceId: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: string;
}

export function getDocument(
  workspaceId: number,
  documentId: number,
) {
  return httpGet<Document>(
    `/workspaces/${workspaceId}/documents/${documentId}`,
  );
}

export function updateDocument(
  workspaceId: number,
  documentId: number,
  payload: UpdateDocumentPayload,
) {
  return httpPatch<Document>(
    `/workspaces/${workspaceId}/documents/${documentId}`,
    payload,
  );
}