import { z } from 'zod';
import { contentFormatSchema } from './editorial-calendar.zod';

export const scriptModeSchema = z.enum(['seguranca', 'conexao']);
export const scriptStatusSchema = z.enum([
  'rascunho',
  'pronto',
  'publicado',
  'teste_ab',
]);

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const scriptBlockTypeSchema = z.enum([
  'gancho',
  'agitacao',
  'miolo',
  'retencao',
  'cta',
  'introducao',
  'contextualizacao',
  'bloco_ensino',
  'recompensa',
  'cta_final',
  'acolhimento',
  'ancoragem',
  'onda',
  'pico',
  'qa_encerramento',
  'slide_capa',
  'slide_contextualizacao',
  'slide_miolo',
  'slide_recompensa',
  'slide_cta',
  'outdoor',
  'bloco_1_gancho',
  'bloco_2_contextualizacao',
  'bloco_3_desenvolvimento',
  'bloco_4_objecao',
  'bloco_5_cta',
  'manha',
  'almoco',
  'tarde',
  'noite',
]);

export const scriptBlockSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  order: z.number().int().min(0),
  type: scriptBlockTypeSchema,
  title: z.string().optional(),
  content: z.string(),
  visualDirection: z.string().optional(),
  modeSpecificData: z.record(z.unknown()).optional(),
  timeRange: z.string().optional(),
});

export const createScriptSchema = z.object({
  format: contentFormatSchema,
  mode: scriptModeSchema.default('conexao'),
  calendarSlotId: z.string().regex(objectIdRegex).optional(),
  themeId: z.string().regex(objectIdRegex).optional(),
  title: z.string().optional(),
});

export const updateScriptSchema = z.object({
  title: z.string().optional(),
  provisionalName: z.string().optional(),
  status: scriptStatusSchema.optional(),
  mode: scriptModeSchema.optional(),
  caption: z.string().optional(),
  blocks: z.array(scriptBlockSchema).optional(),
});

export const generateScriptSchema = z.object({
  briefing: z.record(z.unknown()).optional(),
});

export const regenerateBlockSchema = z.object({
  context: z.string().optional(),
});

export const createVersionSchema = z.object({
  comment: z.string().optional(),
});

export const addAttachmentSchema = z.object({
  type: z.enum([
    'brand_story',
    'referencia_validada',
    'estudo_tema',
    'material_existente',
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  fileId: z.string().regex(objectIdRegex).optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().url().optional(),
  mimeType: z.string().optional(),
  parsedContent: z.string().optional(),
  source: z.enum(['platform', 'project', 'roteiro']).optional(),
  formatTag: contentFormatSchema.optional(),
});

export type CreateScriptInput = z.infer<typeof createScriptSchema>;
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>;
export type GenerateScriptInput = z.infer<typeof generateScriptSchema>;
export type RegenerateBlockInput = z.infer<typeof regenerateBlockSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
