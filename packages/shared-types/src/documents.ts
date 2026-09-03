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

export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentPayload = z.input<typeof createDocumentSchema>;
export type UpdateDocumentPayload = z.infer<typeof updateDocumentSchema>;
