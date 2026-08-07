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
  }),
  audienceData: z.object({
    icp: z.string().min(10, 'Descreva o ICP com mais detalhes'),
    pains: z.string(),
    desires: z.string(),
  }),
  brandingData: z.object({
    puv: z.string(),
    muv: z.string(),
    bigIdea: z.string(),
    communicationStyle: z.string().min(2, 'Estilo de comunicação é obrigatório'),
  }),
  capacityData: z.object({
    shortVideos: z.coerce.number().min(0),
    longVideos: z.coerce.number().min(0),
    carousels: z.coerce.number().min(0),
    staticPosts: z.coerce.number().min(0),
  }),
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

export type ProjectCardDTO = z.infer<typeof ProjectCardSchema>;
export type OnboardingFormDTO = z.infer<typeof EditorialOnboardingSchema>;
export type EditorialVersionDTO = z.infer<typeof EditorialVersionSchema>;