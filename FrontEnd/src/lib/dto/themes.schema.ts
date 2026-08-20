import { z } from 'zod';
import { ContentFormatSchema, PlatformSchema, RetinaTypeSchema } from './editorial.schema';

// Validação de ObjectId via Regex (padrão MongoDB 24 hex chars) — nunca importar
// mongoose no frontend.
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID de referência inválido.');

// ===== Enumerações do Motor de Temas =====

export const ThemeOriginSchema = z.enum(['roma_avatar', 'market', 'objective']);

export const ConsciousnessLevelSchema = z.enum(['sintoma', 'solucao', 'objecao']);

export const JourneyStageSchema = z.enum([
  'descoberta',
  'consideracao',
  'conversao',
  'experiencia',
  'compartilhamento',
]);

export const ThemeStatusSchema = z.enum(['active', 'archived', 'favorite', 'test']);

export const ThemeFlagSchema = z.enum(['prioritario_proximo_ciclo', 'guardado_para_vendas']);

export const ThemeObjectiveSchema = z.enum([
  'grow_audience',
  'increase_engagement',
  'increase_relationship',
  'warm_up_sales',
  'sell_launch',
  'sell_evergreen',
  'nurture_customers',
  'strengthen_authority',
]);

export const BusinessMomentSchema = z.enum([
  'building_audience',
  'building_authority',
  'pre_sale',
  'cart_open',
  'post_sale',
  'organic_maintenance',
]);

export const RetinaPrioritySchema = z.enum([
  'balanced',
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
]);

// ===== Tema =====

export const ThemeSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  origin: ThemeOriginSchema,
  title: z.string().min(1, 'O título do tema é obrigatório.'),
  pillar: z.string(),
  retinaType: RetinaTypeSchema,
  consciousnessLevel: ConsciousnessLevelSchema,
  journeyStage: JourneyStageSchema,
  format: ContentFormatSchema,
  platforms: z.array(PlatformSchema).min(1),
  status: ThemeStatusSchema,
  flags: z.array(ThemeFlagSchema).optional(),
  sourceContext: z.string().optional(),
  batchId: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ThemeUpdateSchema = z.object({
  title: z.string().min(1, 'O título do tema não pode ficar vazio.').optional(),
  pillar: z.string().optional(),
  retinaType: RetinaTypeSchema.optional(),
  consciousnessLevel: ConsciousnessLevelSchema.optional(),
  journeyStage: JourneyStageSchema.optional(),
  format: ContentFormatSchema.optional(),
  platforms: z.array(PlatformSchema).optional(),
  status: ThemeStatusSchema.optional(),
  flags: z.array(ThemeFlagSchema).optional(),
});

// ===== Parâmetros de geração por modo =====

export const RomaAvatarParamsSchema = z.object({
  volume: z.enum(['20', '50', '100']),
  pillars: z.array(z.string()).min(1, 'Selecione ao menos um pilar.'),
  retinaPriority: RetinaPrioritySchema,
});

export const MarketParamsSchema = z.object({
  volume: z.enum(['20', '50', '100']).optional(),
  videoLinks: z.array(z.string().url('Link inválido.')).max(5, 'Máximo de 5 links.').optional(),
  comments: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
});

export const ObjectiveParamsSchema = z.object({
  objective: ThemeObjectiveSchema,
  businessMoment: BusinessMomentSchema,
  platforms: z.array(PlatformSchema).min(1, 'Selecione ao menos uma plataforma.'),
  volume: z.enum(['20', '50', '100']).optional(),
});

export const GenerationRequestSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('roma_avatar'), params: RomaAvatarParamsSchema }),
  z.object({ mode: z.literal('market'), params: MarketParamsSchema }),
  z.object({ mode: z.literal('objective'), params: ObjectiveParamsSchema }),
]);

export const GenerationResultSchema = z.object({
  batchId: z.string(),
  mode: ThemeOriginSchema,
  themes: z.array(ThemeSchema),
});

export const BulkStatusSchema = z.object({
  themeIds: z.array(objectIdSchema).min(1),
  status: ThemeStatusSchema,
});

export const GenerateMoreSchema = z.object({
  count: z.number().int().min(1).max(50).optional(),
});

// ===== Sugestões para o calendário =====

export const SlotSuggestionSchema = z.object({
  calendarItemId: objectIdSchema,
  suggestions: z.array(ThemeSchema).min(1).max(3),
});

export const CalendarSuggestionsRequestSchema = z.object({
  calendarId: objectIdSchema,
});

export const AssignThemeSchema = z.object({
  calendarItemId: objectIdSchema,
  themeId: objectIdSchema.optional(),
  title: z.string().optional(),
});

export const RebalanceRequestSchema = z.object({
  objective: ThemeObjectiveSchema.optional(),
  businessMoment: BusinessMomentSchema.optional(),
});

export const SimulateRequestSchema = z.object({
  increase: z.array(RetinaTypeSchema).optional(),
  decrease: z.array(RetinaTypeSchema).optional(),
  label: z.string().optional(),
});

// ===== Equilíbrio e versões do calendário =====

export const BalanceAlertSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  message: z.string(),
});

export const BalanceReportSchema = z.object({
  retina: z.array(
    z.object({
      retinaType: RetinaTypeSchema,
      count: z.number().int().min(0),
      share: z.number().min(0).max(100),
    }),
  ),
  journey: z.array(
    z.object({
      journeyStage: JourneyStageSchema,
      count: z.number().int().min(0),
    }),
  ),
  totalSlots: z.number().int().min(0),
  filledSlots: z.number().int().min(0),
  alerts: z.array(BalanceAlertSchema),
});

export const RebalanceResultSchema = z.object({
  report: BalanceReportSchema,
  slots: z.array(
    z.object({
      calendarItemId: objectIdSchema,
      theme: ThemeSchema,
    }),
  ),
});

export const CalendarThemeVersionSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  calendarId: objectIdSchema,
  name: z.string().min(1),
  period: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }),
  configuration: z.object({
    objective: ThemeObjectiveSchema,
    businessMoment: BusinessMomentSchema,
  }),
  slots: z.array(
    z.object({
      calendarItemId: objectIdSchema,
      theme: ThemeSchema,
    }),
  ),
  createdAt: z.coerce.date(),
});

export const SaveVersionSchema = z.object({
  name: z.string().min(1, 'Dê um nome à versão do calendário.'),
  objective: ThemeObjectiveSchema,
  businessMoment: BusinessMomentSchema,
});

// ===== Tipos inferidos =====

export type ThemeOrigin = z.infer<typeof ThemeOriginSchema>;
export type ConsciousnessLevel = z.infer<typeof ConsciousnessLevelSchema>;
export type JourneyStage = z.infer<typeof JourneyStageSchema>;
export type ThemeStatus = z.infer<typeof ThemeStatusSchema>;
export type ThemeFlag = z.infer<typeof ThemeFlagSchema>;
export type ThemeObjective = z.infer<typeof ThemeObjectiveSchema>;
export type BusinessMoment = z.infer<typeof BusinessMomentSchema>;
export type RetinaPriority = z.infer<typeof RetinaPrioritySchema>;

export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeUpdate = z.infer<typeof ThemeUpdateSchema>;

export type RomaAvatarParams = z.infer<typeof RomaAvatarParamsSchema>;
export type MarketParams = z.infer<typeof MarketParamsSchema>;
export type ObjectiveParams = z.infer<typeof ObjectiveParamsSchema>;
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
export type BulkStatus = z.infer<typeof BulkStatusSchema>;
export type GenerateMore = z.infer<typeof GenerateMoreSchema>;

export type SlotSuggestion = z.infer<typeof SlotSuggestionSchema>;
export type CalendarSuggestionsRequest = z.infer<typeof CalendarSuggestionsRequestSchema>;
export type AssignTheme = z.infer<typeof AssignThemeSchema>;
export type RebalanceRequest = z.infer<typeof RebalanceRequestSchema>;
export type SimulateRequest = z.infer<typeof SimulateRequestSchema>;

export type BalanceAlert = z.infer<typeof BalanceAlertSchema>;
export type BalanceReport = z.infer<typeof BalanceReportSchema>;
export type RebalanceResult = z.infer<typeof RebalanceResultSchema>;
export type CalendarThemeVersion = z.infer<typeof CalendarThemeVersionSchema>;
export type SaveVersion = z.infer<typeof SaveVersionSchema>;