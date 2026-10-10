import { z } from 'zod';

export const contentFormatSchema = z.enum([
  'reel',
  'long_video',
  'carousel',
  'static_post',
  'live',
  'stories_sequence',
]);

export const retinaTypeSchema = z.enum([
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
]);

export const platformSchema = z.enum([
  'instagram',
  'youtube',
  'tiktok',
  'linkedin',
]);

export const calendarStatusSchema = z.enum([
  'planned',
  'in_production',
  'recorded',
  'published',
]);

export const calendarStatusEnumSchema = z.enum(['active', 'archived']);

export const calendarObjectiveSchema = z.enum([
  'increase_audience',
  'warmup_sales',
  'reinforce_authority',
  'increase_relationship',
  'improve_engagement',
  'support_launch',
]);

export const periodTypeSchema = z.enum([
  'two_weeks',
  'one_month',
  'four_weeks_warmup',
  'pre_launch',
  'custom',
]);

const productionCapacitySchema = z.object({
  reelsPerWeek: z.coerce.number().int().min(0),
  longVideosPerWeek: z.coerce.number().int().min(0),
  carouselsPerWeek: z.coerce.number().int().min(0),
  staticPostsPerWeek: z.coerce.number().int().min(0),
  livesPerWeek: z.coerce.number().int().min(0),
  storySequencesPerDay: z.coerce.number().int().min(0),
});

export const calendarSetupSchema = z
  .object({
    editorialVersionId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de versão inválido.'),
    periodType: periodTypeSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    platforms: z
      .array(platformSchema)
      .min(1, 'Selecione ao menos uma plataforma.'),
    capacity: productionCapacitySchema,
    objective: calendarObjectiveSchema,
    customName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.periodType === 'custom' && !data.endDate) return false;
      return true;
    },
    {
      message: 'Informe a data final para período personalizado.',
      path: ['endDate'],
    },
  );

export const calendarPatchSchema = z.object({
  name: z.string().min(1).optional(),
  status: calendarStatusEnumSchema.optional(),
  editorialVersionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  capacity: productionCapacitySchema.optional(),
  objective: calendarObjectiveSchema.optional(),
});

export const calendarDuplicateSchema = z.object({
  periodType: periodTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const calendarItemUpdateSchema = z.object({
  provisionalName: z.string().optional(),
  theme: z.string().optional(),
  painDesireObjection: z.string().optional(),
  suggestedTime: z.string().optional(),
  observations: z.string().optional(),
  referenceUrl: z.string().optional(),
  exampleUrl: z.string().optional(),
  pillar: z.string().optional(),
  strategicObjective: z.string().optional(),
  status: calendarStatusSchema.optional(),
  retinaType: retinaTypeSchema.optional(),
  platforms: z.array(platformSchema).optional(),
  objective: z.string().optional(),
});

export type CalendarSetupInput = z.infer<typeof calendarSetupSchema>;
export type CalendarPatchInput = z.infer<typeof calendarPatchSchema>;
export type CalendarDuplicateInput = z.infer<typeof calendarDuplicateSchema>;
export type CalendarItemUpdateInput = z.infer<typeof calendarItemUpdateSchema>;
