import { z } from 'zod';

export const createWorkspaceTaskSchema = z.object({
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  title: z.string().min(2, 'Informe o título da tarefa.'),
  dueLabel: z.string().optional(),
  dueCategory: z.enum(['today', 'upcoming']).optional(),
  origin: z.enum(['Manual', 'IA sugerida', 'Automática']).optional(),
  completed: z.boolean().optional(),
  isDone: z.boolean().optional(),
  postponed: z.boolean().optional(),
  resourceLabel: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  linkedType: z
    .enum(['slot', 'theme', 'script', 'line', 'calendar', 'general'])
    .optional(),
  linkedEntityId: z.string().optional(),
});

export const updateWorkspaceTaskSchema = z.object({
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  title: z.string().min(2).optional(),
  dueLabel: z.string().optional(),
  dueCategory: z.enum(['today', 'upcoming']).optional(),
  completed: z.boolean().optional(),
  isDone: z.boolean().optional(),
  postponed: z.boolean().optional(),
  resourceLabel: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

export type CreateWorkspaceTaskInput = z.infer<
  typeof createWorkspaceTaskSchema
>;
export type UpdateWorkspaceTaskInput = z.infer<
  typeof updateWorkspaceTaskSchema
>;
