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