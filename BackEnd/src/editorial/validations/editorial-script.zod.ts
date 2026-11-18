import { z } from 'zod';
import { contentFormatSchema } from './editorial-calendar.zod';

export const scriptModeSchema = z.enum(['seguranca', 'conexao']);
export const scriptStatusSchema = z.enum([
  'rascunho',
  'in_production',
  'pronto',
  'publicado',
  'teste_ab',
  'arquivado',
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

export const createScriptSchema = z
  .object({
    format: contentFormatSchema,
    mode: scriptModeSchema.default('conexao'),
    calendarSlotId: z.string().min(1).optional(),
    themeId: z.string().min(1).optional(),
    title: z.string().optional(),
    provisionalName: z.string().optional(),
    status: scriptStatusSchema.optional(),
    autoGenerate: z.boolean().optional(),
    briefingContext: z.record(z.unknown()).optional(),
    formatSlug: z.string().optional(),
    calendarSlotFormat: z.string().optional(),
    originType: z.string().optional(),
    linkedSlotId: z.string().optional(),
    linkedSlotLabel: z.string().optional(),
    linkedThemeId: z.string().optional(),
    retinaType: z.string().optional(),
    strategicObjective: z.string().optional(),
    editorialPillar: z.string().optional(),
    icpPainOrObjection: z.string().optional(),
    businessMoment: z.string().optional(),
    platform: z.string().optional(),
    estimatedDurationOrSize: z.string().optional(),
    speakingMode: z.enum(['TELEPROMPTER', 'BULLET_POINTS']).optional(),
    versionLabel: z.string().optional(),
    isFavorite: z.boolean().optional(),
  })
  .passthrough();

export const updateScriptSchema = z
  .object({
    title: z.string().optional(),
    provisionalName: z.string().optional(),
    status: scriptStatusSchema.optional(),
    mode: scriptModeSchema.optional(),
    caption: z.string().optional(),
    blocks: z.array(scriptBlockSchema).optional(),
    formatSlug: z.string().optional(),
    calendarSlotFormat: z.string().optional(),
    originType: z.string().optional(),
    linkedSlotId: z.string().optional(),
    linkedSlotLabel: z.string().optional(),
    linkedThemeId: z.string().optional(),
    retinaType: z.string().optional(),
    strategicObjective: z.string().optional(),
    editorialPillar: z.string().optional(),
    icpPainOrObjection: z.string().optional(),
    businessMoment: z.string().optional(),
    platform: z.string().optional(),
    estimatedDurationOrSize: z.string().optional(),
    speakingMode: z.enum(['TELEPROMPTER', 'BULLET_POINTS']).optional(),
    versionLabel: z.string().optional(),
    scriptBlocks: z.array(z.record(z.unknown())).optional(),
    connectionSevenLinesChecklist: z.array(z.record(z.unknown())).optional(),
    carouselSlides: z.array(z.record(z.unknown())).optional(),
    storyPeriods: z.array(z.record(z.unknown())).optional(),
    predictiveQAs: z.array(z.record(z.unknown())).optional(),
    postLiveStoriesSummary: z.string().optional(),
    captionOutdoorHook: z.string().optional(),
    captionBody: z.string().optional(),
    captionCta: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    seoTags: z.array(z.string()).optional(),
    youtubeChapters: z.array(z.record(z.unknown())).optional(),
    titleVariations: z.array(z.string()).optional(),
    imagePrompts: z.array(z.string()).optional(),
    qualifiedForComplementaryMaterial: z.boolean().optional(),
    complementaryMaterial: z.record(z.unknown()).nullable().optional(),
    explanationMaterial: z.string().optional(),
    briefingCutAdjustment: z.string().optional(),
    mandatoryExamplesToInclude: z.string().optional(),
    brandStoryConnection: z.string().optional(),
    selectedReferenceNote: z.string().optional(),
    versionHistory: z.array(z.record(z.unknown())).optional(),
    isFavorite: z.boolean().optional(),
  })
  .passthrough();

export const generateScriptSchema = z.object({
  briefing: z.record(z.unknown()).optional(),
});

export const regenerateBlockSchema = z.object({
  context: z.string().optional(),
});

export const regenerateStoryCardSchema = z.object({
  period: z.enum([
    'MANHA',
    'ALMOCO',
    'TARDE',
    'NOITE',
    'Manhã',
    'Almoço',
    'Tarde',
    'Noite',
  ]),
  cardId: z.string().optional(),
  cardNumber: z.number().int().min(1).optional(),
  currentCard: z.record(z.unknown()).optional(),
  currentObjective: z.string().optional(),
  currentText: z.string().optional(),
  icpPainOrObjection: z.string().optional(),
  subniche: z.string().optional(),
});

export const adaptPublicationSchema = z.object({
  targetProjectId: z
    .string()
    .regex(objectIdRegex, 'ID de projeto de destino inválido.'),
  mode: z.enum(['COPY_LITERAL', 'AI_ADAPT']).default('COPY_LITERAL'),
  targetSlotId: z.string().optional(),
  adaptNotes: z.string().optional(),
  customTitle: z.string().optional(),
  preserveComplementaryMaterial: z.boolean().optional(),
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
export type RegenerateStoryCardInput = z.infer<
  typeof regenerateStoryCardSchema
>;
export type AdaptPublicationInput = z.infer<typeof adaptPublicationSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
