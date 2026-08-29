import { httpGet, httpPatch, httpPost, httpDelete } from '@/lib/http';

import type {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from '@repo/shared-types';

export type {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from '@repo/shared-types';

export function getDocuments(workspaceId: number) {
  return httpGet<Document[]>(
    `/workspaces/${workspaceId}/documents`,
  );
}

export function getDocument(
  workspaceId: number,
  documentId: number,
) {
  return httpGet<Document>(
    `/workspaces/${workspaceId}/documents/${documentId}`,
  );
}

export function createDocument(
  workspaceId: number,
  payload: CreateDocumentPayload,
) {
  return httpPost<Document>(
    `/workspaces/${workspaceId}/documents`,
    payload,
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

export async function deleteDocument(
  workspaceId: number,
  documentId: number,
) {
  return httpDelete<Document>(
    `/workspaces/${workspaceId}/documents/${documentId}`,
  );
}