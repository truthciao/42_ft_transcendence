import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  type Document,
  type CreateDocumentPayload,
} from '@/api/documents';

export const documentKeys = {
  all: ['documents'] as const,

  workspace: (workspaceId: number) => ['documents', workspaceId] as const,

  detail: (workspaceId: number, documentId: number) =>
    ['documents', workspaceId, documentId] as const,
};

export function useWorkspaceDocuments(workspaceId: number | undefined) {
  return useQuery<Document[]>({
    queryKey: documentKeys.workspace(workspaceId ?? -1),
    queryFn: () => getDocuments(workspaceId as number),
    enabled: workspaceId !== undefined && Number.isInteger(workspaceId),
  });
}

export function useDocument(
  workspaceId: number | undefined,
  documentId: number | undefined,
) {
  return useQuery<Document>({
    queryKey: documentKeys.detail(workspaceId ?? -1, documentId ?? -1),
    queryFn: () => getDocument(workspaceId as number, documentId as number),
    enabled:
      workspaceId !== undefined &&
      documentId !== undefined &&
      Number.isInteger(workspaceId) &&
      Number.isInteger(documentId),
  });
}

export function useCreateDocument(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) =>
      createDocument(workspaceId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.workspace(workspaceId),
      });
    },
  });
}

export function useDeleteDocument(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) => deleteDocument(workspaceId, documentId),

    onSuccess: (_, documentId) => {
      queryClient.removeQueries({
        queryKey: documentKeys.detail(workspaceId, documentId),
      });

      queryClient.invalidateQueries({
        queryKey: documentKeys.workspace(workspaceId),
      });
    },
  });
}
