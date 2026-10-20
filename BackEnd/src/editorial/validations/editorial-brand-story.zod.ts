import { z } from 'zod';

export const usableStorySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const upsertBrandStorySchema = z.object({
  originStory: z.string().optional(),
  keyTurnarounds: z.array(z.string()).optional(),
  failures: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  lifestyle: z.string().optional(),
  usableStories: z.array(usableStorySchema).optional(),
});

export type UpsertBrandStoryInput = z.infer<typeof upsertBrandStorySchema>;
