import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome da empresa deve ter no máximo 120 caracteres.'),
  acronym: z
    .string()
    .trim()
    .min(2, 'A sigla deve ter pelo menos 2 caracteres.')
    .max(4, 'A sigla deve ter no máximo 4 caracteres.')
    .transform((v) => v.toUpperCase()),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      'O slug deve conter apenas letras minúsculas, números e hífens.',
    )
    .optional(),
  cnpj: z.string().trim().max(20).optional(),
});

export const updateCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.')
    .max(120)
    .optional(),
  acronym: z
    .string()
    .trim()
    .min(2)
    .max(4)
    .transform((v) => v.toUpperCase())
    .optional(),
  cnpj: z.string().trim().max(20).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const updateCompanySettingsSchema = z.object({
  logoUrl: z.string().trim().optional(),
  headerUrl: z.string().trim().optional(),
  footerUrl: z.string().trim().optional(),
});

export const updateCompanyPlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanySettingsInput = z.infer<
  typeof updateCompanySettingsSchema
>;
export type UpdateCompanyPlanInput = z.infer<typeof updateCompanyPlanSchema>;
