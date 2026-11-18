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
  'priority_next_cycle',
  'saved_for_sales',
  'market_test',
]);

export const themeFlagSchema = z.enum([
  'prioritario_proximo_ciclo',
  'guardado_para_vendas',
]);

export const themeVolumeSchema = z.enum([
  '12',
  '15',
  '18',
  '20',
  '24',
  '30',
  '45',
  '50',
  '100',
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
  techniqueUsed: z.string().optional(),
  romaPillar: z.string().optional(),
  consciousnessAxis: z.string().optional(),
  recommendedFormat: z.string().optional(),
  recommendedPlatform: z.string().optional(),
  painDesireOrObjection: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isPriorityNextCycle: z.boolean().optional(),
  isSavedForSales: z.boolean().optional(),
  isMarketTest: z.boolean().optional(),
  allocatedSlotIds: z.array(z.string()).optional(),
});

export const romaAvatarParamsSchema = z.object({
  volume: themeVolumeSchema.default('20'),
  pillars: z.array(z.string()).optional(),
  retinaPriority: retinaPrioritySchema.default('balanced'),
  niche: z.string().optional(),
  subniche: z.string().optional(),
});

export const marketParamsSchema = z.object({
  volume: themeVolumeSchema.optional(),
  videoLinks: z.array(z.string()).max(10).optional(),
  comments: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
  marketNotes: z.string().optional(),
});

export const objectiveParamsSchema = z.object({
  objective: themeObjectiveSchema,
  businessMoment: businessMomentSchema,
  platforms: z.array(platformSchema).optional(),
  volume: themeVolumeSchema.optional(),
});

export const generationRequestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('roma_avatar'),
    params: romaAvatarParamsSchema,
    persist: z.boolean().optional(),
  }),
  z.object({
    mode: z.literal('market'),
    params: marketParamsSchema,
    persist: z.boolean().optional(),
  }),
  z.object({
    mode: z.literal('objective'),
    params: objectiveParamsSchema,
    persist: z.boolean().optional(),
  }),
]);

export const createThemesBatchSchema = z.object({
  batchName: z.string().optional(),
  themes: z
    .array(
      z
        .object({
          title: z.string().min(1),
          pillar: z.string().optional(),
          retinaType: retinaTypeSchema.optional(),
          consciousnessLevel: consciousnessLevelSchema.optional(),
          journeyStage: journeyStageSchema.optional(),
          format: contentFormatSchema.optional(),
          platforms: z.array(platformSchema).optional(),
          origin: themeOriginSchema.optional(),
          status: themeStatusSchema.optional(),
          flags: z.array(themeFlagSchema).optional(),
          angle: z.string().optional(),
          approach: themeApproachSchema.optional(),
          techniqueUsed: z.string().optional(),
          romaPillar: z.string().optional(),
          consciousnessAxis: z.string().optional(),
          recommendedFormat: z.string().optional(),
          recommendedPlatform: z.string().optional(),
          painDesireOrObjection: z.string().optional(),
          isFavorite: z.boolean().optional(),
          isPriorityNextCycle: z.boolean().optional(),
          isSavedForSales: z.boolean().optional(),
          isMarketTest: z.boolean().optional(),
          allocatedSlotIds: z.array(z.string()).optional(),
        })
        .passthrough(),
    )
    .min(1),
});

export const bulkStatusSchema = z.object({
  themeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  status: themeStatusSchema,
});

export const generateMoreSchema = z.object({
  count: z.number().int().min(1).max(50).optional(),
});

export const calendarSuggestionsRequestSchema = z.object({
  calendarId: z.string().min(1),
  slotId: z.string().optional(),
});

export const assignThemeSchema = z.object({
  calendarItemId: z.string().min(1),
  calendarId: z.string().optional(),
  themeId: z.string().min(1).optional(),
  title: z.string().optional(),
  unassign: z.boolean().optional(),
});

export const rebalanceRequestSchema = z.object({
  objective: themeObjectiveSchema.optional(),
  businessMoment: businessMomentSchema.optional(),
  scenario: z.string().optional(),
  calendarId: z.string().optional(),
  slots: z.array(z.record(z.unknown())).optional(),
  persist: z.boolean().optional(),
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
export type CreateThemesBatchInput = z.infer<typeof createThemesBatchSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
export type GenerateMoreInput = z.infer<typeof generateMoreSchema>;
export type CalendarSuggestionsRequestInput = z.infer<
  typeof calendarSuggestionsRequestSchema
>;
export type AssignThemeInput = z.infer<typeof assignThemeSchema>;
export type RebalanceRequestInput = z.infer<typeof rebalanceRequestSchema>;
export type SimulateRequestInput = z.infer<typeof simulateRequestSchema>;
export type SaveVersionInput = z.infer<typeof saveVersionSchema>;
