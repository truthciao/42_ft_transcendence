import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const userSearchResultSchema = userSchema.pick({
  id: true,
  username: true,
});

export const userSearchResultsSchema = z.array(
  userSearchResultSchema,
);

export type UserSearchResult = z.infer<
  typeof userSearchResultSchema
>;