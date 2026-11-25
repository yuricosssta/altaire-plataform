import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da marca deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome da marca deve ter no máximo 120 caracteres.'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      'O slug da marca deve conter apenas letras minúsculas, números e hífens.',
    )
    .optional(),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().optional(),
  niche: z.string().trim().max(120).optional(),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da marca deve ter pelo menos 2 caracteres.')
    .max(120)
    .optional(),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().optional(),
  niche: z.string().trim().max(120).optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
