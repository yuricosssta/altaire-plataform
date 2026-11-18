import { z } from 'zod';

export const versionStatusSchema = z.enum([
  'active',
  'draft',
  'review_recommended',
  'archived',
]);

export const createVersionSchema = z.object({
  name: z.string().min(2, 'O nome da versão deve ter ao menos 2 caracteres.'),
  status: versionStatusSchema.optional(),
  phaseTag: z.string().optional(),
  reviewReason: z.string().optional(),
  strategicBase: z.record(z.unknown()).optional(),
  duplicateFromVersionId: z.string().optional(),
});

export const updateVersionSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome da versão deve ter ao menos 2 caracteres.')
    .optional(),
  status: versionStatusSchema.optional(),
  phaseTag: z.string().optional(),
  reviewReason: z.string().optional(),
  strategicBase: z.record(z.unknown()).optional(),
});

export const extractIcpSchema = z.object({
  rawText: z
    .string()
    .min(
      10,
      'Forneça ao menos 10 caracteres de transcrição ou anotações do ICP.',
    ),
  niche: z.string().optional(),
  brandOrClientName: z.string().optional(),
});

export const versionIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de versão inválido.'),
});

export type CreateVersion = z.infer<typeof createVersionSchema>;
export type UpdateVersion = z.infer<typeof updateVersionSchema>;
export type ExtractIcpInput = z.infer<typeof extractIcpSchema>;
