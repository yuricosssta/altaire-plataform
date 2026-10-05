import { z } from 'zod';

export const updateVersionSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome da versão deve ter ao menos 2 caracteres.')
    .optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const versionIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de versão inválido.'),
});

export type UpdateVersion = z.infer<typeof updateVersionSchema>;
