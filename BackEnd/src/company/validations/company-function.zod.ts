import { z } from 'zod';

export const createCompanyFunctionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome da função deve ter pelo menos 2 caracteres.')
    .max(80, 'O nome da função deve ter no máximo 80 caracteres.'),
  description: z
    .string()
    .trim()
    .min(3, 'A descrição das atividades deve ter pelo menos 3 caracteres.')
    .max(500, 'A descrição deve ter no máximo 500 caracteres.'),
});

export const updateCompanyFunctionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'O nome da função deve ter pelo menos 2 caracteres.')
      .max(80)
      .optional(),
    description: z
      .string()
      .trim()
      .min(3, 'A descrição das atividades deve ter pelo menos 3 caracteres.')
      .max(500)
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'Informe ao menos um campo para atualização.',
  });

export type CreateCompanyFunctionInput = z.infer<
  typeof createCompanyFunctionSchema
>;
export type UpdateCompanyFunctionInput = z.infer<
  typeof updateCompanyFunctionSchema
>;
