import { z } from 'zod';

// Validação de ObjectId via Regex (padrão MongoDB 24 hex chars)
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID de referência inválido.');

export const ProjectCardSchema = z.object({
  id: objectIdSchema,
  name: z.string().min(1, 'O nome do projeto é obrigatório.'),
  niche: z.string(),
  subniche: z.string(),
  currentObjective: z.string(),
  editorialLineStatus: z.enum(['pending', 'active', 'archived']),
  calendarStatus: z.enum(['pending', 'active', 'archived']),
  updatedAt: z.date(),
});

export const EditorialOnboardingSchema = z.object({
  nicheData: z.object({
    niche: z.string().min(2, 'Nicho é obrigatório'),
    subniche: z.string().min(2, 'Subnicho é obrigatório'),
  }),
  offerData: z.object({
    product: z.string().min(2, 'Produto é obrigatório'),
    offer: z.string().min(2, 'Oferta é obrigatória'),
    promise: z.string().min(2, 'Promessa principal é obrigatória'),
    roma: z.string(),
    differentials: z.string(),
  }),
  audienceData: z.object({
    icp: z.string().min(10, 'Descreva o ICP com mais detalhes'),
    pains: z.string(),
    desires: z.string(),
    objections: z.string(),
    myths: z.string(),
  }),
  brandingData: z.object({
    puv: z.string(),
    muv: z.string(),
    bigIdea: z.string(),
    positioningPhrase: z.string(),
    communicationStyle: z.string().min(2, 'Estilo de comunicação é obrigatório'),
    brandPersonality: z.string(),
  }),
  capacityData: z.object({
    shortVideos: z.coerce.number().min(0),
    longVideos: z.coerce.number().min(0),
    carousels: z.coerce.number().min(0),
    staticPosts: z.coerce.number().min(0),
    weeklyLives: z.coerce.number().min(0),
    dailyStories: z.coerce.number().min(0),
  }),
});

export const ProjectCreateSchema = z.object({
  name: z.string().min(2, 'O nome do projeto é obrigatório.'),
  niche: z.string().min(2, 'O nicho é obrigatório.'),
  subniche: z.string().min(2, 'O subnicho é obrigatório.'),
  currentObjective: z.string().min(2, 'Defina o objetivo atual do projeto.'),
});

export const EditorialVersionSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  versionNumber: z.number().int().positive(),
  name: z.string().min(1, 'O nome da versão é obrigatório.'),
  status: z.enum(['active', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EditorialVersionUpdateSchema = z.object({
  name: z.string().min(1, 'O nome da versão não pode ficar vazio.').optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const EditorialMapaSchema = z.object({
  versionId: objectIdSchema,
  versionNumber: z.number().int().positive(),
  name: z.string().min(1, 'O nome do mapa é obrigatório.'),
  positioningPhrase: z.string().optional(),
  mensagemCentral: z.string(),
  pilares: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  tomDeVoz: z.object({
    traits: z.array(z.string()),
    rules: z.array(z.string()),
  }),
  retina: z.array(
    z.object({
      label: z.string(),
      weight: z.number().min(0).max(100),
    }),
  ),
});

export type ProjectCardDTO = z.infer<typeof ProjectCardSchema>;
export type ProjectCreateDTO = z.infer<typeof ProjectCreateSchema>;
export type OnboardingFormDTO = z.infer<typeof EditorialOnboardingSchema>;
export type EditorialVersionDTO = z.infer<typeof EditorialVersionSchema>;
export type EditorialVersionUpdateDTO = z.infer<typeof EditorialVersionUpdateSchema>;
export type EditorialMapaDTO = z.infer<typeof EditorialMapaSchema>;

// ===== Calendário Editorial =====

export const ContentFormatSchema = z.enum([
  'reel',
  'long_video',
  'carousel',
  'static_post',
  'live',
  'stories_sequence',
]);

export const RetinaTypeSchema = z.enum([
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
]);

export const PlatformSchema = z.enum(['instagram', 'youtube', 'tiktok', 'linkedin']);

export const CalendarStatusSchema = z.enum(['planned', 'in_production', 'recorded', 'published']);

export const CalendarObjectiveSchema = z.enum([
  'increase_audience',
  'warmup_sales',
  'reinforce_authority',
  'increase_relationship',
  'improve_engagement',
  'support_launch',
]);

export const PeriodTypeSchema = z.enum([
  'two_weeks',
  'one_month',
  'four_weeks_warmup',
  'pre_launch',
  'custom',
]);

export const ProductionCapacitySchema = z.object({
  reelsPerWeek: z.coerce.number().int().min(0),
  longVideosPerWeek: z.coerce.number().int().min(0),
  carouselsPerWeek: z.coerce.number().int().min(0),
  staticPostsPerWeek: z.coerce.number().int().min(0),
  livesPerWeek: z.coerce.number().int().min(0),
  storySequencesPerDay: z.coerce.number().int().min(0),
});

export const CalendarPeriodSchema = z.object({
  type: PeriodTypeSchema,
  label: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const CalendarItemSchema = z.object({
  id: objectIdSchema,
  date: z.coerce.date(),
  format: ContentFormatSchema,
  retinaType: RetinaTypeSchema,
  platforms: z.array(PlatformSchema).min(1),
  objective: z.string(),
  suggestedTime: z.string(),
  theme: z.string().optional(),
  referenceUrl: z.string().optional(),
  status: CalendarStatusSchema,
  provisionalName: z.string().optional(),
  strategicObjective: z.string().optional(),
  pillar: z.string().optional(),
  painDesireObjection: z.string().optional(),
  observations: z.string().optional(),
  exampleUrl: z.string().optional(),
});

export const StorySequenceSchema = z.object({
  id: objectIdSchema,
  date: z.coerce.date(),
  sequenceIndex: z.number().int().min(1),
  storiesCount: z.number().int().min(1),
  focus: z.string(),
  retinaType: RetinaTypeSchema,
  suggestedTime: z.string(),
  status: CalendarStatusSchema,
  theme: z.string().optional(),
});

export const CalendarDaySchema = z.object({
  date: z.coerce.date(),
  items: z.array(CalendarItemSchema),
  storySequences: z.array(StorySequenceSchema),
});

export const ReviewSuggestionSchema = z.object({
  id: objectIdSchema,
  type: z.enum(['increase', 'reduce', 'adjust', 'frequency']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
});

export const EditorialCalendarSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  editorialVersionId: objectIdSchema,
  name: z.string().min(1),
  period: CalendarPeriodSchema,
  platforms: z.array(PlatformSchema).min(1),
  capacity: ProductionCapacitySchema,
  objective: CalendarObjectiveSchema,
  status: z.enum(['active', 'archived']),
  days: z.array(CalendarDaySchema),
  reviewSuggestions: z.array(ReviewSuggestionSchema).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CalendarSetupSchema = z
  .object({
    editorialVersionId: objectIdSchema,
    periodType: PeriodTypeSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    platforms: z.array(PlatformSchema).min(1, 'Selecione ao menos uma plataforma.'),
    capacity: ProductionCapacitySchema,
    objective: CalendarObjectiveSchema,
    customName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.periodType === 'custom') {
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'Informe a data final para período personalizado.',
        });
      } else if (data.endDate <= data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'A data final deve ser posterior à inicial.',
        });
      }
    }
  });

export const CalendarPatchSchema = z.object({
  name: z.string().min(1, 'O nome não pode ficar vazio.').optional(),
  status: z.enum(['active', 'archived']).optional(),
  editorialVersionId: objectIdSchema.optional(),
  capacity: ProductionCapacitySchema.optional(),
  objective: CalendarObjectiveSchema.optional(),
});

export const CalendarDuplicateSchema = z.object({
  periodType: PeriodTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const CalendarItemUpdateSchema = z.object({
  provisionalName: z.string().optional(),
  theme: z.string().optional(),
  painDesireObjection: z.string().optional(),
  suggestedTime: z.string().optional(),
  observations: z.string().optional(),
  referenceUrl: z.string().optional(),
  exampleUrl: z.string().optional(),
  pillar: z.string().optional(),
  strategicObjective: z.string().optional(),
  status: CalendarStatusSchema.optional(),
  retinaType: RetinaTypeSchema.optional(),
  platforms: z.array(PlatformSchema).optional(),
  objective: z.string().optional(),
});

export type ContentFormat = z.infer<typeof ContentFormatSchema>;
export type RetinaType = z.infer<typeof RetinaTypeSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type CalendarStatus = z.infer<typeof CalendarStatusSchema>;
export type CalendarObjective = z.infer<typeof CalendarObjectiveSchema>;
export type PeriodType = z.infer<typeof PeriodTypeSchema>;
export type ProductionCapacity = z.infer<typeof ProductionCapacitySchema>;
export type CalendarPeriod = z.infer<typeof CalendarPeriodSchema>;
export type CalendarItem = z.infer<typeof CalendarItemSchema>;
export type StorySequence = z.infer<typeof StorySequenceSchema>;
export type CalendarDay = z.infer<typeof CalendarDaySchema>;
export type ReviewSuggestion = z.infer<typeof ReviewSuggestionSchema>;
export type EditorialCalendar = z.infer<typeof EditorialCalendarSchema>;
export type CalendarSetup = z.infer<typeof CalendarSetupSchema>;
export type CalendarPatch = z.infer<typeof CalendarPatchSchema>;
export type CalendarDuplicate = z.infer<typeof CalendarDuplicateSchema>;
export type CalendarItemUpdate = z.infer<typeof CalendarItemUpdateSchema>;