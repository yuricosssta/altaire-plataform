import { z } from 'zod';

export const pilarSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const tomDeVozSchema = z.object({
  traits: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
});

export const retinaSchema = z.object({
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
});

export const updateMapaSchema = z.object({
  name: z.string().min(2).optional(),
  positioningPhrase: z.string().optional(),
  mensagemCentral: z.string().min(2).optional(),
  pilares: z.array(pilarSchema).optional(),
  tomDeVoz: tomDeVozSchema.optional(),
  retina: z.array(retinaSchema).optional(),
});

export type UpdateMapaInput = z.infer<typeof updateMapaSchema>;