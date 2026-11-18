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
  'script_ready',
  'in_production',
  'recorded',
  'published',
]);

export const calendarStatusEnumSchema = z.enum([
  'active',
  'draft',
  'upcoming',
  'review_recommended',
  'expired',
  'archived',
]);

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
  storiesPerSequence: z.coerce.number().int().min(0).optional(),
});

export const calendarSetupSchema = z
  .object({
    editorialVersionId: z.string().min(1).optional(),
    periodType: periodTypeSchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    periodLabel: z.string().optional(),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    mainObjective: z.string().optional(),
    linkedLineName: z.string().optional(),
    platforms: z
      .array(platformSchema)
      .min(1, 'Selecione ao menos uma plataforma.'),
    capacity: productionCapacitySchema,
    objective: calendarObjectiveSchema,
    customName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.periodType === 'custom' && !data.endDate && !data.periodEnd) {
        return false;
      }
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
  editorialVersionId: z.string().min(1).optional(),
  capacity: productionCapacitySchema.optional(),
  objective: calendarObjectiveSchema.optional(),
  periodLabel: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  mainObjective: z.string().optional(),
  linkedLineName: z.string().optional(),
  platforms: z.array(z.string().min(1)).optional(),
  weeklyCapacity: z.record(z.unknown()).optional(),
  slots: z.array(z.record(z.unknown())).optional(),
  reviewSuggestions: z.array(z.record(z.unknown())).optional(),
});

export const calendarDuplicateSchema = z.object({
  periodType: periodTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  name: z.string().optional(),
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
  // Rich Slot fields used by CalendarioEditorialModule
  weekNumber: z.coerce.number().int().min(1).optional(),
  dayOfWeek: z.string().optional(),
  date: z.string().optional(),
  scheduledTime: z.string().optional(),
  format: z.string().optional(),
  formatLabel: z.string().optional(),
  platform: z.string().optional(),
  primaryObjective: z.string().optional(),
  secondaryObjective: z.string().optional(),
  editorialPillar: z.string().optional(),
  retinaBadge: z.string().optional(),
  mainTheme: z.string().optional(),
  provisionalTitle: z.string().optional(),
  icpPainDesireOrObjection: z.string().optional(),
  icpAwarenessLevel: z.string().optional(),
  executionNotes: z.string().optional(),
  referenceLink: z.string().optional(),
  themeId: z.string().nullable().optional(),
  scriptId: z.string().nullable().optional(),
  eligibleForComplementaryMaterial: z.boolean().optional(),
  complementaryMaterialType: z.string().optional(),
});

export const createCalendarSlotSchema = z.object({
  id: z.string().optional(),
  weekNumber: z.coerce.number().int().min(1).default(1),
  dayOfWeek: z.string().min(1).default('Segunda'),
  date: z.string().min(1),
  scheduledTime: z.string().default('12:00'),
  format: z.string().min(1),
  formatLabel: z.string().optional(),
  platform: z.string().min(1).default('Instagram'),
  primaryObjective: z.string().min(1),
  secondaryObjective: z.string().optional(),
  editorialPillar: z.string().min(1),
  retinaBadge: z.string().optional(),
  mainTheme: z.string().min(1),
  provisionalTitle: z.string().min(1),
  icpPainDesireOrObjection: z.string().optional(),
  icpAwarenessLevel: z.string().optional(),
  status: calendarStatusSchema.optional(),
  executionNotes: z.string().optional(),
  referenceLink: z.string().optional(),
  themeId: z.string().optional(),
  scriptId: z.string().optional(),
  eligibleForComplementaryMaterial: z.boolean().optional(),
  complementaryMaterialType: z.string().optional(),
});

export const calendarReviewRequestSchema = z.object({
  reason: z.string().optional(),
  forceRefresh: z.boolean().optional(),
});

export type CalendarSetupInput = z.infer<typeof calendarSetupSchema>;
export type CalendarPatchInput = z.infer<typeof calendarPatchSchema>;
export type CalendarDuplicateInput = z.infer<typeof calendarDuplicateSchema>;
export type CalendarItemUpdateInput = z.infer<typeof calendarItemUpdateSchema>;
export type CreateCalendarSlotInput = z.infer<typeof createCalendarSlotSchema>;
export type CalendarReviewRequestInput = z.infer<
  typeof calendarReviewRequestSchema
>;
