//BackEnd/src/users/validations/users.zod.ts
import { z } from 'zod';

export const userRoleEnum = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
  'CLIENT',
  'EXTERNAL',
]);

export const userPlanEnum = z.enum(['FREE', 'PRO', 'ENTERPRISE']);

export const updateUserPlanSchema = z.object({
  plan: userPlanEnum,
});

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  role: userRoleEnum.optional().default('MEMBER'),
  allowedProjects: z.array(z.string()).optional().default([]),
  permissions: z.array(z.string()).optional().default([]),
  invitedBy: z.string().optional(),
  functionId: z.string().nullable().optional(),
  memberships: z
    .array(
      z.object({
        organizationId: z.string(),
        role: z.string(),
      }),
    )
    .optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  avatarUrl: z.string().optional(),
  displayRole: z.string().optional(),
  editorialBio: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  preferences: z.record(z.unknown()).optional(),
  role: userRoleEnum.optional(),
  allowedProjects: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  invitedBy: z.string().optional(),
  functionId: z.string().nullable().optional(),
  memberships: z
    .array(
      z.object({
        organizationId: z.string(),
        role: z.string(),
      }),
    )
    .optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const oauthUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  googleId: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserPlan = z.infer<typeof updateUserPlanSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type OAuthUser = z.infer<typeof oauthUserSchema>;
