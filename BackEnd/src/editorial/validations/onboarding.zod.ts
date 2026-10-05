import { z } from 'zod';

export const onboardingSchema = z.object({
  nicheData: z.object({
    niche: z.string().min(2, 'Nicho é obrigatório'),
    subniche: z.string().min(2, 'Subnicho é obrigatório'),
  }),
  offerData: z.object({
    product: z.string().min(2, 'Produto é obrigatório'),
    offer: z.string().min(2, 'Oferta é obrigatória'),
    promise: z.string().min(2, 'Promessa principal é obrigatória'),
    roma: z.string().optional().default(''),
    differentials: z.string().optional().default(''),
  }),
  audienceData: z.object({
    icp: z.string().min(10, 'Descreva o ICP com mais detalhes'),
    pains: z.string().optional().default(''),
    desires: z.string().optional().default(''),
    objections: z.string().optional().default(''),
    myths: z.string().optional().default(''),
  }),
  brandingData: z.object({
    puv: z.string().optional().default(''),
    muv: z.string().optional().default(''),
    bigIdea: z.string().optional().default(''),
    positioningPhrase: z.string().optional().default(''),
    communicationStyle: z
      .string()
      .min(2, 'Estilo de comunicação é obrigatório'),
    brandPersonality: z.string().optional().default(''),
  }),
  capacityData: z.object({
    shortVideos: z.coerce.number().min(0).optional().default(0),
    longVideos: z.coerce.number().min(0).optional().default(0),
    carousels: z.coerce.number().min(0).optional().default(0),
    staticPosts: z.coerce.number().min(0).optional().default(0),
    weeklyLives: z.coerce.number().min(0).optional().default(0),
    dailyStories: z.coerce.number().min(0).optional().default(0),
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
