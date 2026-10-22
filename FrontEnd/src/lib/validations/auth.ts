// FrontEnd/src/lib/validations/auth.ts
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número.");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "O nome deve ter no mínimo 3 caracteres.")
      .max(120, "O nome excedeu o limite de caracteres."),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório.")
      .email("Informe um e-mail válido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória."),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os Termos de Uso para criar sua conta.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  niche: z.string().min(2, "O nicho de atuação é obrigatório."),
  mainOffer: z.string().min(5, "Descreva sua oferta principal brevemente."),
  firstProjectName: z
    .string()
    .min(3, "Dê um nome para o seu primeiro Projeto Editorial."),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;