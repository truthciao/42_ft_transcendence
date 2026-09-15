import { z } from 'zod';

export const documentSchema = z.object({
  id: z.number().int().positive(),

  title: z.string().min(1).max(200),

  content: z.string(),

  workspaceId: z.number().int().positive(),

  creatorId: z.number().int().positive(),

  createdAt: z.string(),

  updatedAt: z.string(),
});

export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title must not be empty')
    .max(200, 'title must be at most 200 characters'),

  content: z.string().default(''),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title must not be empty')
    .max(200, 'title must be at most 200 characters')
    .optional(),

  content: z.string().optional(),
});

export const documentJoinSchema = z.object({
  documentId: z.number().int().positive(),
});

export const documentLeaveSchema = z.object({
  documentId: z.number().int().positive(),
});

export const documentTitleUpdatedSchema = z.object({
  documentId: z.number().int().positive(),

  title: z
    .string()
    .trim()
    .min(1, 'title must not be empty')
    .max(200, 'title must be at most 200 characters'),
});

export const documentYjsUpdateSchema = z.object({
  documentId: z.number().int().positive(),

  update: z.array(
    z.number().int().min(0).max(255),
  ),
});

export type Document = z.infer<typeof documentSchema>;

export type CreateDocumentPayload =
  z.input<typeof createDocumentSchema>;

export type UpdateDocumentPayload =
  z.infer<typeof updateDocumentSchema>;

export type DocumentJoin =
  z.infer<typeof documentJoinSchema>;

export type DocumentLeave =
  z.infer<typeof documentLeaveSchema>;

export type DocumentTitleUpdated =
  z.infer<typeof documentTitleUpdatedSchema>;

export type DocumentYjsUpdate =
  z.infer<typeof documentYjsUpdateSchema>;
