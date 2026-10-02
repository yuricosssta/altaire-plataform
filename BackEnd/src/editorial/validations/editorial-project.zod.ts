import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'O nome do projeto é obrigatório.'),
  niche: z.string().min(2, 'O nicho é obrigatório.'),
  subniche: z.string().min(2, 'O subnicho é obrigatório.'),
  currentObjective: z.string().min(2, 'Defina o objetivo atual do projeto.'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  niche: z.string().min(2).optional(),
  subniche: z.string().min(2).optional(),
  currentObjective: z.string().min(2).optional(),
  editorialLineStatus: z.enum(['pending', 'active', 'archived']).optional(),
  calendarStatus: z.enum(['pending', 'active', 'archived']).optional(),
});

export const projectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de projeto inválido.'),
});

export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
