// BackEnd/src/organization/validations/organization-function.zod.ts
import { z } from 'zod';

export const createOrganizationFunctionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da função deve ter pelo menos 2 caracteres')
    .max(80, 'O nome da função deve ter no máximo 80 caracteres'),
  description: z
    .string()
    .trim()
    .min(3, 'A descrição das atividades é obrigatória')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
});

export const updateOrganizationFunctionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da função deve ter pelo menos 2 caracteres')
    .max(80, 'O nome da função deve ter no máximo 80 caracteres')
    .optional(),
  description: z
    .string()
    .trim()
    .min(3, 'A descrição das atividades é obrigatória')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional(),
});

export type CreateOrganizationFunction = z.infer<
  typeof createOrganizationFunctionSchema
>;
export type UpdateOrganizationFunction = z.infer<
  typeof updateOrganizationFunctionSchema
>;
