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

// ===== Função 03 – Roteiros por Formato =====

export const ScriptFormatSchema = z.enum([
  'video_curto',
  'video_longo',
  'live',
  'carrossel',
  'post_estatico',
  'stories_sequence',
]);

export const ScriptModeSchema = z.enum(['seguranca', 'conexao']);

export const ScriptStatusSchema = z.enum(['rascunho', 'pronto', 'publicado', 'teste_ab']);

export const ScriptBlockTypeSchema = z.enum([
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

export const ScriptBlockSchema = z.object({
  id: objectIdSchema,
  order: z.number().int().min(0),
  type: ScriptBlockTypeSchema,
  title: z.string().optional(),
  content: z.string(),
  visualDirection: z.string().optional(),
  modeSpecificData: z.record(z.unknown()).optional(),
  timeRange: z.string().optional(),
});

export const TitleSuggestionSchema = z.object({
  id: objectIdSchema,
  title: z.string(),
  hookType: z.enum(['erro', 'metodo', 'estatistica', 'mito', 'bastidor', 'pergunta', 'promessa', 'outro']).optional(),
});

export const ThumbnailPromptSchema = z.object({
  id: objectIdSchema,
  promptEn: z.string(),
  description: z.string().optional(),
  format: z.enum(['9:16', '16:9', '4:5']).optional(),
});

export const ComplementaryMaterialSchema = z.object({
  id: objectIdSchema,
  type: z.enum(['pdf_checklist', 'pdf_guia', 'pdf_workbook', 'planilha_xlsx', 'video_extra']),
  title: z.string(),
  promise: z.string(),
  structure: z.array(z.string()),
  fileId: objectIdSchema.optional(),
  downloadUrl: z.string().optional(),
  status: z.enum(['gerando', 'pronto', 'erro']).default('gerando'),
});

export const ExplanationMaterialSchema = z.object({
  id: objectIdSchema,
  type: z.enum(['mapa_mental', 'pdf_explicativo', 'planilha_apoio']),
  title: z.string(),
  content: z.string(),
  fileId: objectIdSchema.optional(),
  downloadUrl: z.string().optional(),
  status: z.enum(['gerando', 'pronto', 'erro']).default('gerando'),
});

export const ScriptAttachmentSchema = z.object({
  id: objectIdSchema,
  scriptId: objectIdSchema,
  type: z.enum(['brand_story', 'referencia_validada', 'estudo_tema', 'material_existente']),
  title: z.string(),
  description: z.string().optional(),
  fileId: objectIdSchema.optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  mimeType: z.string().optional(),
  parsedContent: z.string().optional(),
  source: z.enum(['platform', 'project', 'roteiro']).optional(),
  formatTag: ScriptFormatSchema.optional(),
  createdAt: z.coerce.date(),
});

export const ScriptBriefingSchema = z.object({
  bloco1: z.object({
    format: ScriptFormatSchema,
    platform: PlatformSchema,
    retinaType: RetinaTypeSchema,
    objective: z.string(),
    theme: z.string(),
    materialQualified: z.boolean(),
    duration: z.string().optional(),
    projectContext: z.object({
      niche: z.string(),
      subniche: z.string(),
      offer: z.string(),
      roma: z.string(),
      puv: z.string(),
      muv: z.string(),
      icp: z.object({
        pains: z.string(),
        desires: z.string(),
        objections: z.string(),
        myths: z.string(),
        vocabulary: z.string(),
        awarenessLevel: z.string(),
      }),
      editorialLine: z.object({
        pillars: z.array(z.string()),
        toneOfVoice: z.string(),
        positioning: z.string(),
        narrativeType: z.string(),
        retinaDistribution: z.record(z.number()),
      }),
    }),
  }),
  bloco2: z.object({
    mandatoryExamples: z.array(z.string()).optional(),
    scriptMode: ScriptModeSchema.optional(),
  }),
  bloco3: z.object({
    location: z.string().optional(),
    equipment: z.array(z.string()).optional(),
    technicalNotes: z.string().optional(),
    toneNuance: z.string().optional(),
  }),
  bloco4: z.object({
    activateComplementaryMaterial: z.boolean().default(false),
    materialFocus: z.string().optional(),
    forcedMaterialType: ComplementaryMaterialSchema.shape.type.optional(),
  }),
});

export const ScriptVersionSchema = z.object({
  id: objectIdSchema,
  scriptId: objectIdSchema,
  versionNumber: z.number().int().positive(),
  comment: z.string().optional(),
  blocks: z.array(ScriptBlockSchema),
  caption: z.string().optional(),
  titles: z.array(TitleSuggestionSchema).optional(),
  thumbnailPrompts: z.array(ThumbnailPromptSchema).optional(),
  complementaryMaterials: z.array(ComplementaryMaterialSchema).optional(),
  explanationMaterials: z.array(ExplanationMaterialSchema).optional(),
  createdAt: z.coerce.date(),
  createdBy: objectIdSchema,
});

export const ScriptSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  calendarSlotId: objectIdSchema.optional(),
  themeId: objectIdSchema.optional(),
  format: ScriptFormatSchema,
  version: z.number().int().positive().default(1),
  mode: ScriptModeSchema,
  status: ScriptStatusSchema.default('rascunho'),
  title: z.string().optional(),
  provisionalName: z.string().optional(),
  blocks: z.array(ScriptBlockSchema),
  caption: z.string().optional(),
  titles: z.array(TitleSuggestionSchema).optional(),
  thumbnailPrompts: z.array(ThumbnailPromptSchema).optional(),
  complementaryMaterials: z.array(ComplementaryMaterialSchema).optional(),
  explanationMaterials: z.array(ExplanationMaterialSchema).optional(),
  briefing: ScriptBriefingSchema.optional(),
  attachments: z.array(ScriptAttachmentSchema).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: objectIdSchema,
});

export const CalendarSlotForScriptSchema = z.object({
  id: objectIdSchema,
  date: z.coerce.date(),
  format: ScriptFormatSchema,
  retinaType: RetinaTypeSchema,
  platforms: z.array(PlatformSchema),
  objective: z.string(),
  suggestedTime: z.string(),
  theme: z.string().optional(),
  provisionalName: z.string().optional(),
  strategicObjective: z.string().optional(),
  pillar: z.string().optional(),
  painDesireObjection: z.string().optional(),
  materialQualified: z.boolean().default(false),
  status: CalendarStatusSchema,
});

export const ThemeForScriptSchema = z.object({
  id: objectIdSchema,
  title: z.string(),
  angle: z.string(),
  approach: z.enum(['erro', 'metodo', 'historia', 'bastidor', 'estudo_caso', 'outro']),
  pillar: z.string().optional(),
  references: z.array(z.string()).optional(),
  formatCompatibility: z.array(ScriptFormatSchema),
  createdAt: z.coerce.date(),
});

export const BrandStorySchema = z.object({
  id: objectIdSchema,
  organizationId: objectIdSchema,
  userId: objectIdSchema,
  originStory: z.string(),
  keyTurnarounds: z.array(z.string()),
  failures: z.array(z.string()),
  achievements: z.array(z.string()),
  values: z.array(z.string()),
  lifestyle: z.string(),
  usableStories: z.array(z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
  })),
  updatedAt: z.coerce.date(),
});

export const GenerationRequestSchema = z.object({
  scriptId: objectIdSchema,
  briefing: ScriptBriefingSchema,
  attachments: z.array(ScriptAttachmentSchema),
  brandStory: BrandStorySchema.optional(),
});

export const GenerationProgressSchema = z.object({
  phase: z.enum([
    'analyzing',
    'generating_blocks',
    'generating_caption',
    'generating_titles_thumbnails',
    'generating_materials',
    'consolidating',
    'complete',
    'error',
  ]),
  message: z.string(),
  percent: z.number().min(0).max(100),
});

export const GenerationResultSchema = z.object({
  blocks: z.array(ScriptBlockSchema),
  caption: z.string(),
  titles: z.array(TitleSuggestionSchema),
  thumbnailPrompts: z.array(ThumbnailPromptSchema),
  complementaryMaterials: z.array(ComplementaryMaterialSchema),
  explanationMaterials: z.array(ExplanationMaterialSchema),
});

export type ScriptFormat = z.infer<typeof ScriptFormatSchema>;
export type ScriptMode = z.infer<typeof ScriptModeSchema>;
export type ScriptStatus = z.infer<typeof ScriptStatusSchema>;
export type ScriptBlockType = z.infer<typeof ScriptBlockTypeSchema>;
export type ScriptBlock = z.infer<typeof ScriptBlockSchema>;
export type TitleSuggestion = z.infer<typeof TitleSuggestionSchema>;
export type ThumbnailPrompt = z.infer<typeof ThumbnailPromptSchema>;
export type ComplementaryMaterial = z.infer<typeof ComplementaryMaterialSchema>;
export type ExplanationMaterial = z.infer<typeof ExplanationMaterialSchema>;
export type ScriptAttachment = z.infer<typeof ScriptAttachmentSchema>;
export type ScriptBriefing = z.infer<typeof ScriptBriefingSchema>;
export type ScriptVersion = z.infer<typeof ScriptVersionSchema>;
export type Script = z.infer<typeof ScriptSchema>;
export type CalendarSlotForScript = z.infer<typeof CalendarSlotForScriptSchema>;
export type ThemeForScript = z.infer<typeof ThemeForScriptSchema>;
export type BrandStory = z.infer<typeof BrandStorySchema>;
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type GenerationProgress = z.infer<typeof GenerationProgressSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;