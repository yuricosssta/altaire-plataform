//src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Target, Zap, Compass, Users, MessageSquare, Activity } from 'lucide-react';
import Link from 'next/link';
import { editorialService } from '@/lib/services/editorialService';

// Schema replicado para validação do formulário
const EditorialOnboardingSchema = z.object({
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

type OnboardingFormData = z.infer<typeof EditorialOnboardingSchema>;

const STEPS = [
  { id: 'niche', title: 'Nicho', icon: Target, fields: ['nicheData.niche', 'nicheData.subniche'] },
  { id: 'offer', title: 'Oferta', icon: Zap, fields: ['offerData.product', 'offerData.offer'] },
  {
    id: 'positioning',
    title: 'Posicionamento',
    icon: Compass,
    fields: ['offerData.promise', 'offerData.roma', 'offerData.differentials', 'brandingData.puv', 'brandingData.muv', 'brandingData.bigIdea', 'brandingData.positioningPhrase'],
  },
  {
    id: 'audience',
    title: 'Público',
    icon: Users,
    fields: ['audienceData.icp', 'audienceData.pains', 'audienceData.desires', 'audienceData.objections', 'audienceData.myths'],
  },
  {
    id: 'branding',
    title: 'Comunicação',
    icon: MessageSquare,
    fields: ['brandingData.communicationStyle', 'brandingData.brandPersonality'],
  },
  {
    id: 'capacity',
    title: 'Capacidade',
    icon: Activity,
    fields: ['capacityData.shortVideos', 'capacityData.longVideos', 'capacityData.carousels', 'capacityData.staticPosts', 'capacityData.weeklyLives', 'capacityData.dailyStories'],
  },
];

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';
const errorClassName = 'text-xs text-red-500';

export default function EditorialOnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId;
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(EditorialOnboardingSchema),
    mode: 'onChange',
  });

  const processNextStep = async () => {
    const fieldsToValidate = STEPS[currentStep].fields as any;
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const processPreviousStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (currentStep !== STEPS.length - 1) return;

    try {
      const { version } = await editorialService.submitOnboarding(projectId as string, data);
      toast.success('Mapa editorial gerado com sucesso!');
      router.push(`/dashboard/editorial/${projectId}/linha-editorial/${version.id}/mapa`);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao gerar o mapa editorial.');
    }
  };

  const CurrentIcon = STEPS[currentStep]?.icon;

  return (
    <main className="min-h-screen bg-background p-8 text-foreground flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/editorial/${projectId}`} className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-sans text-sm text-primary uppercase tracking-widest">Coleta Estratégica</p>
              <h1 className="font-serif text-3xl text-foreground">Nova Linha Editorial</h1>
            </div>
          </div>
          <div className="font-sans text-sm font-bold text-muted-foreground">
            Passo {currentStep + 1} de {STEPS.length}
          </div>
        </header>

        {/* Indicador de Progresso (Stepper) */}
        <div className="mb-8 flex items-center justify-between relative before:absolute before:left-0 before:top-1/2 before:h-[1px] before:w-full before:-translate-y-1/2 before:bg-border before:z-0">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-background px-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive ? 'border-primary bg-primary/10 text-primary' :
                  isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-bold ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Container do Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4 flex items-center gap-3">
            <CurrentIcon className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl text-foreground">{STEPS[currentStep].title}</h2>
          </div>

          <div className="space-y-6">
            {/* Etapa 1 — Nicho */}
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <label className={labelClassName}>Nicho Principal</label>
                  <input {...register('nicheData.niche')} className={inputClassName} placeholder="Ex: Finanças, Saúde, Tecnologia" />
                  {errors.nicheData?.niche && <p className={errorClassName}>{errors.nicheData.niche.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Subnicho Exato</label>
                  <input {...register('nicheData.subniche')} className={inputClassName} placeholder="Ex: Algorithmic Trading para iniciantes" />
                  {errors.nicheData?.subniche && <p className={errorClassName}>{errors.nicheData.subniche.message}</p>}
                </div>
              </>
            )}

            {/* Etapa 2 — Oferta */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <label className={labelClassName}>Produto</label>
                  <input {...register('offerData.product')} className={inputClassName} placeholder="Ex: Mentoria de Trading" />
                  {errors.offerData?.product && <p className={errorClassName}>{errors.offerData.product.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Oferta Clara</label>
                  <input {...register('offerData.offer')} className={inputClassName} placeholder="Ex: Pacote lançamento com bônus de sessão individual" />
                  {errors.offerData?.offer && <p className={errorClassName}>{errors.offerData.offer.message}</p>}
                </div>
              </>
            )}

            {/* Etapa 3 — Posicionamento */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <label className={labelClassName}>Promessa Principal</label>
                  <textarea {...register('offerData.promise')} rows={3} className={`${inputClassName} resize-none`} placeholder="Qual resultado concreto essa oferta promete?" />
                  {errors.offerData?.promise && <p className={errorClassName}>{errors.offerData.promise.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>ROMA</label>
                  <input {...register('offerData.roma')} className={inputClassName} placeholder="Ex: Resultado, Oferta, Mecânica, Alavancas" />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Diferenciais</label>
                  <textarea {...register('offerData.differentials')} rows={2} className={`${inputClassName} resize-none`} placeholder="O que torna essa marca ou especialista único?" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClassName}>PUV</label>
                    <input {...register('brandingData.puv')} className={inputClassName} placeholder="Proposta Única de Valor" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClassName}>MUV</label>
                    <input {...register('brandingData.muv')} className={inputClassName} placeholder="Mecânica Única de Venda" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Big Idea</label>
                  <input {...register('brandingData.bigIdea')} className={inputClassName} placeholder="A grande ideia que sustenta a comunicação" />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Frase de Posicionamento</label>
                  <textarea {...register('brandingData.positioningPhrase')} rows={2} className={`${inputClassName} resize-none`} placeholder="Como a marca quer ser percebida em uma frase" />
                </div>
              </>
            )}

            {/* Etapa 4 — Público */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <label className={labelClassName}>Perfil do Cliente Ideal (ICP)</label>
                  <textarea {...register('audienceData.icp')} rows={4} className={`${inputClassName} resize-none`} placeholder="Descreva quem é o seu cliente ideal..." />
                  {errors.audienceData?.icp && <p className={errorClassName}>{errors.audienceData.icp.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Dores</label>
                  <textarea {...register('audienceData.pains')} rows={2} className={`${inputClassName} resize-none`} placeholder="Quais dores dominam a mente do ICP?" />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Desejos</label>
                  <textarea {...register('audienceData.desires')} rows={2} className={`${inputClassName} resize-none`} placeholder="O que o ICP mais deseja alcançar?" />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Objeções</label>
                  <textarea {...register('audienceData.objections')} rows={2} className={`${inputClassName} resize-none`} placeholder="Quais objeções travam a decisão de compra?" />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Mitos do Mercado</label>
                  <textarea {...register('audienceData.myths')} rows={2} className={`${inputClassName} resize-none`} placeholder="Quais mitos o mercado repete e sua marca combate?" />
                </div>
              </>
            )}

            {/* Etapa 5 — Comunicação */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <label className={labelClassName}>Estilo de Comunicação</label>
                  <input {...register('brandingData.communicationStyle')} className={inputClassName} placeholder="Ex: Direto, provocador, elegante" />
                  {errors.brandingData?.communicationStyle && <p className={errorClassName}>{errors.brandingData.communicationStyle.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Personalidade da Marca / Pessoa</label>
                  <textarea {...register('brandingData.brandPersonality')} rows={3} className={`${inputClassName} resize-none`} placeholder="Como a marca fala, como ela se comporta, qual a persona por trás da comunicação?" />
                </div>
              </>
            )}

            {/* Etapa 6 — Capacidade */}
            {currentStep === 5 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClassName}>Reels / Vídeos Curtos (Semana)</label>
                  <input type="number" min={0} {...register('capacityData.shortVideos')} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Vídeos Longos (Semana)</label>
                  <input type="number" min={0} {...register('capacityData.longVideos')} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Carrosséis (Semana)</label>
                  <input type="number" min={0} {...register('capacityData.carousels')} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Posts Estáticos (Semana)</label>
                  <input type="number" min={0} {...register('capacityData.staticPosts')} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Lives (Semana)</label>
                  <input type="number" min={0} {...register('capacityData.weeklyLives')} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Sequências de Stories (Dia)</label>
                  <input type="number" min={0} {...register('capacityData.dailyStories')} className={inputClassName} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={processPreviousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 font-sans text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={processNextStep}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Próximo <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-md bg-primary px-8 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Gerando Linha...' : 'Gerar Mapa Editorial'} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}