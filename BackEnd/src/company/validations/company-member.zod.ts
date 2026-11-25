import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z
  .string()
  .regex(objectIdRegex, 'Identificador inválido.');

export const addCompanyMemberSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.').optional(),
  email: z.string().trim().email('E-mail inválido.'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .optional(),
  role: z.enum(['MEMBER', 'CLIENT', 'EXTERNAL']).default('MEMBER'),
  functionId: objectIdSchema.nullable().optional(),
  brandIds: z.array(objectIdSchema).optional().default([]),
  allowedProjects: z.array(objectIdSchema).optional().default([]),
  permissions: z.array(z.string()).optional().default([]),
  additionalCompanyIds: z.array(objectIdSchema).optional().default([]),
});

export const updateCompanyMemberSchema = z.object({
  role: z.enum(['MEMBER', 'CLIENT', 'EXTERNAL']).optional(),
  functionId: objectIdSchema.nullable().optional(),
  brandIds: z.array(objectIdSchema).optional(),
  allowedProjects: z.array(objectIdSchema).optional(),
  permissions: z.array(z.string()).optional(),
});

export type AddCompanyMemberInput = z.infer<typeof addCompanyMemberSchema>;
export type UpdateCompanyMemberInput = z.infer<
  typeof updateCompanyMemberSchema
>;
