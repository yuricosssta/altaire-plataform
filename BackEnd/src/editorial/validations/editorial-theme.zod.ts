import { z } from 'zod';
import {
  contentFormatSchema,
  platformSchema,
  retinaTypeSchema,
} from './editorial-calendar.zod';

export const themeOriginSchema = z.enum(['roma_avatar', 'market', 'objective']);

export const consciousnessLevelSchema = z.enum([
  'sintoma',
  'solucao',
  'objecao',
]);

export const journeyStageSchema = z.enum([
  'descoberta',
  'consideracao',
  'conversao',
  'experiencia',
  'compartilhamento',
]);

export const themeStatusSchema = z.enum([
  'active',
  'archived',
  'favorite',
  'test',
]);

export const themeFlagSchema = z.enum([
  'prioritario_proximo_ciclo',
  'guardado_para_vendas',
]);

export const themeObjectiveSchema = z.enum([
  'grow_audience',
  'increase_engagement',
  'increase_relationship',
  'warm_up_sales',
  'sell_launch',
  'sell_evergreen',
  'nurture_customers',
  'strengthen_authority',
]);

export const businessMomentSchema = z.enum([
  'building_audience',
  'building_authority',
  'pre_sale',
  'cart_open',
  'post_sale',
  'organic_maintenance',
]);

export const retinaPrioritySchema = z.enum([
  'balanced',
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
]);

export const themeApproachSchema = z.enum([
  'erro',
  'metodo',
  'historia',
  'bastidor',
  'estudo_caso',
  'outro',
]);

export const themeUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  pillar: z.string().optional(),
  retinaType: retinaTypeSchema.optional(),
  consciousnessLevel: consciousnessLevelSchema.optional(),
  journeyStage: journeyStageSchema.optional(),
  format: contentFormatSchema.optional(),
  platforms: z.array(platformSchema).optional(),
  status: themeStatusSchema.optional(),
  flags: z.array(themeFlagSchema).optional(),
  angle: z.string().optional(),
  approach: themeApproachSchema.optional(),
});

export const romaAvatarParamsSchema = z.object({
  volume: z.enum(['20', '50', '100']),
  pillars: z.array(z.string()).min(1),
  retinaPriority: retinaPrioritySchema,
});

export const marketParamsSchema = z.object({
  volume: z.enum(['20', '50', '100']).optional(),
  videoLinks: z.array(z.string().url()).max(5).optional(),
  comments: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
});

export const objectiveParamsSchema = z.object({
  objective: themeObjectiveSchema,
  businessMoment: businessMomentSchema,
  platforms: z.array(platformSchema).min(1),
  volume: z.enum(['20', '50', '100']).optional(),
});

export const generationRequestSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('roma_avatar'), params: romaAvatarParamsSchema }),
  z.object({ mode: z.literal('market'), params: marketParamsSchema }),
  z.object({ mode: z.literal('objective'), params: objectiveParamsSchema }),
]);

export const bulkStatusSchema = z.object({
  themeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  status: themeStatusSchema,
});

export const generateMoreSchema = z.object({
  count: z.number().int().min(1).max(50).optional(),
});

export const calendarSuggestionsRequestSchema = z.object({
  calendarId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const assignThemeSchema = z.object({
  calendarItemId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  themeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: z.string().optional(),
});

export const rebalanceRequestSchema = z.object({
  objective: themeObjectiveSchema.optional(),
  businessMoment: businessMomentSchema.optional(),
});

export const simulateRequestSchema = z.object({
  increase: z.array(retinaTypeSchema).optional(),
  decrease: z.array(retinaTypeSchema).optional(),
  label: z.string().optional(),
});

export const saveVersionSchema = z.object({
  name: z.string().min(1),
  objective: themeObjectiveSchema,
  businessMoment: businessMomentSchema,
});

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;
export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
export type GenerateMoreInput = z.infer<typeof generateMoreSchema>;
export type CalendarSuggestionsRequestInput = z.infer<
  typeof calendarSuggestionsRequestSchema
>;
export type AssignThemeInput = z.infer<typeof assignThemeSchema>;
export type RebalanceRequestInput = z.infer<typeof rebalanceRequestSchema>;
export type SimulateRequestInput = z.infer<typeof simulateRequestSchema>;
export type SaveVersionInput = z.infer<typeof saveVersionSchema>;
