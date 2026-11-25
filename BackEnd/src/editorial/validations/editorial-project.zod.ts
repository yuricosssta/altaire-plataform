import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createProjectSchema = z.object({
  name: z.string().min(2, 'O nome do projeto é obrigatório.'),
  niche: z.string().min(2, 'O nicho é obrigatório.'),
  subniche: z.string().min(2, 'O subnicho é obrigatório.'),
  currentObjective: z.string().min(2, 'Defina o objetivo atual do projeto.'),
  brandId: z.string().regex(objectIdRegex, 'ID da marca inválido.'),
  brandOrClientName: z.string().optional(),
  operationTypeLabel: z.string().optional(),
  currentPhaseLabel: z.string().optional(),
  status: z
    .enum(['draft', 'active', 'paused', 'archived', 'in_setup', 'in_review'])
    .optional(),
  nextActionLabel: z.string().optional(),
  nextActionReason: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  niche: z.string().min(2).optional(),
  subniche: z.string().min(2).optional(),
  currentObjective: z.string().min(2).optional(),
  brandOrClientName: z.string().optional(),
  operationTypeLabel: z.string().optional(),
  currentPhaseLabel: z.string().optional(),
  status: z
    .enum(['draft', 'active', 'paused', 'archived', 'in_setup', 'in_review'])
    .optional(),
  editorialLineStatus: z.enum(['pending', 'active', 'archived']).optional(),
  calendarStatus: z.enum(['pending', 'active', 'archived']).optional(),
  nextActionLabel: z.string().optional(),
  nextActionReason: z.string().optional(),
});

export const duplicateProjectSchema = z.object({
  newName: z.string().min(2, 'Informe o nome do projeto duplicado.').optional(),
  name: z.string().min(2).optional(),
  brandOrClientName: z.string().optional(),
  copyStrategicBase: z.boolean().optional(),
  copyLineEditorial: z.boolean().optional(),
  copyThemes: z.boolean().optional(),
  copyCalendars: z.boolean().optional(),
  copyScripts: z.boolean().optional(),
  includeActiveLine: z.boolean().optional(),
});

export const projectIdSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID de projeto inválido.'),
});

export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type DuplicateProject = z.infer<typeof duplicateProjectSchema>;
