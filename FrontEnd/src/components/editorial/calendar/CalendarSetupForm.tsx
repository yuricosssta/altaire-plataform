// src/components/editorial/calendar/CalendarSetupForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarRange,
  Activity,
  Target,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  CalendarSetup,
  CalendarSetupSchema,
  CalendarObjective,
  EditorialVersionDTO,
  PeriodType,
} from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';
import { OBJECTIVE_META, PERIOD_META, PLATFORM_META } from '@/lib/constants/calendar';

const CAPACITY_FIELDS: { key: keyof CalendarSetup['capacity']; label: string; hint: string }[] = [
  { key: 'reelsPerWeek', label: 'Reels / semana', hint: 'Vídeos curtos verticais' },
  { key: 'longVideosPerWeek', label: 'Vídeos longos / semana', hint: 'YouTube ou IGTV' },
  { key: 'carouselsPerWeek', label: 'Carrosséis / semana', hint: 'Sequências de slides' },
  { key: 'staticPostsPerWeek', label: 'Posts estáticos / semana', hint: 'Imagem + legenda' },
  { key: 'livesPerWeek', label: 'Lives / semana', hint: 'Transmissões ao vivo' },
  { key: 'storySequencesPerDay', label: 'Sequências de stories / dia', hint: '3-4 com 4-5 stories' },
];

const OBJECTIVES = Object.keys(OBJECTIVE_META) as CalendarObjective[];

const STEPS = [
  {
    id: 'period',
    title: 'Período',
    icon: CalendarRange,
    fields: ['editorialVersionId', 'periodType', 'startDate', 'endDate'],
  },
  {
    id: 'capacity',
    title: 'Plataformas e capacidade',
    icon: Activity,
    fields: [
      'platforms',
      'capacity.reelsPerWeek',
      'capacity.longVideosPerWeek',
      'capacity.carouselsPerWeek',
      'capacity.staticPostsPerWeek',
      'capacity.livesPerWeek',
      'capacity.storySequencesPerDay',
    ],
  },
  {
    id: 'objective',
    title: 'Objetivo',
    icon: Target,
    fields: ['objective'],
  },
];

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';
const errorClassName = 'text-xs text-red-500';

export function CalendarSetupForm() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [versions, setVersions] = useState<EditorialVersionDTO[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);

  const defaultValues: CalendarSetup = {
    editorialVersionId: '',
    periodType: 'one_month',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: undefined,
    platforms: ['instagram'],
    capacity: {
      reelsPerWeek: 4,
      longVideosPerWeek: 1,
      carouselsPerWeek: 3,
      staticPostsPerWeek: 2,
      livesPerWeek: 1,
      storySequencesPerDay: 3,
    },
    objective: 'warmup_sales',
    customName: '',
  } as unknown as CalendarSetup;

  const {
    register,
    trigger,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CalendarSetup>({
    resolver: zodResolver(CalendarSetupSchema),
    mode: 'onChange',
    defaultValues,
  });

  const periodType = watch('periodType');
  const isCustomPeriod = periodType === 'custom';

  useEffect(() => {
    let active = true;
    editorialService
      .listVersions(projectId)
      .then((data) => {
        if (!active) return;
        const activeVersions = data.filter((version) => version.status === 'active');
        setVersions(activeVersions);
        if (activeVersions.length > 0) {
          setValue('editorialVersionId', activeVersions[0].id);
        }
      })
      .catch(() => {
        toast.error('Falha ao carregar as linhas editoriais.');
      })
      .finally(() => {
        if (active) setVersionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, setValue]);

  const processNextStep = async () => {
    const isStepValid = await trigger(STEPS[currentStep].fields as any);
    if (isStepValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const processPreviousStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CalendarSetup) => {
    try {
      const calendar = await editorialService.createCalendar(projectId, data);
      toast.success('Calendário editorial gerado com sucesso!');
      router.push(`/dashboard/editorial/${projectId}/calendario-editorial/${calendar.id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao gerar o calendário editorial.');
    }
  };

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/editorial/${projectId}`}
            className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="font-sans text-sm uppercase tracking-widest text-primary">
              Planejamento Estratégico
            </p>
            <h1 className="font-serif text-3xl text-foreground">Novo Calendário Editorial</h1>
          </div>
        </div>
        <div className="font-sans text-sm font-bold text-muted-foreground">
          Passo {currentStep + 1} de {STEPS.length}
        </div>
      </header>

      {/* Stepper */}
      <div className="relative mb-8 flex items-center justify-between before:absolute before:left-0 before:top-1/2 before:z-0 before:h-[1px] before:w-full before:-translate-y-1/2 before:bg-border">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2 bg-background px-2"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <CurrentIcon className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">{STEPS[currentStep].title}</h2>
        </div>

        <div className="space-y-6">
          {/* Etapa 1 — Período */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <label className={labelClassName}>Linha Editorial</label>
                {versionsLoading ? (
                  <div className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Carregando linhas editoriais...
                  </div>
                ) : versions.length === 0 ? (
                  <div className="rounded-md border border-border bg-background p-4 font-sans text-sm text-muted-foreground">
                    Nenhuma linha editorial ativa encontrada. Crie uma linha na aba{' '}
                    <strong className="text-foreground">Linha Editorial</strong> antes de montar o
                    calendário.
                  </div>
                ) : (
                  <select {...register('editorialVersionId')} className={inputClassName}>
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        Linha v{version.versionNumber} — {version.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.editorialVersionId && (
                  <p className={errorClassName}>{errors.editorialVersionId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClassName}>Período</label>
                  <select {...register('periodType')} className={inputClassName}>
                    {(Object.keys(PERIOD_META) as PeriodType[]).map((type) => (
                      <option key={type} value={type}>
                        {PERIOD_META[type].label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {PERIOD_META[periodType].description}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className={labelClassName}>Início do período</label>
                  <input type="date" {...register('startDate')} className={inputClassName} />
                  {errors.startDate && <p className={errorClassName}>{errors.startDate.message}</p>}
                </div>
                {isCustomPeriod && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className={labelClassName}>Fim do período</label>
                    <input type="date" {...register('endDate')} className={inputClassName} />
                    {errors.endDate && <p className={errorClassName}>{errors.endDate.message}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClassName}>Nome do calendário (opcional)</label>
                <input
                  {...register('customName')}
                  className={inputClassName}
                  placeholder="Ex: Aquecimento para o lançamento"
                />
              </div>
            </>
          )}

          {/* Etapa 2 — Plataformas e capacidade */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <label className={labelClassName}>Plataformas de atuação</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(PLATFORM_META) as (keyof typeof PLATFORM_META)[]).map(
                    (platform) => (
                      <label
                        key={platform}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                      >
                        <input
                          type="checkbox"
                          value={platform}
                          {...register('platforms')}
                          className="h-4 w-4 accent-[#D4AF37]"
                        />
                        {PLATFORM_META[platform]}
                      </label>
                    ),
                  )}
                </div>
                {errors.platforms && <p className={errorClassName}>{errors.platforms.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>Capacidade real de produção por semana</label>
                <p className="mb-4 mt-1 font-sans text-sm text-muted-foreground">
                  Seja honesto com a sua operação: o calendário respeita o que você consegue
                  executar de verdade, com qualidade.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CAPACITY_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className={labelClassName}>{field.label}</label>
                      <input
                        type="number"
                        min={0}
                        {...register(`capacity.${field.key}` as any)}
                        className={inputClassName}
                      />
                      <p className="text-xs text-muted-foreground">{field.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Etapa 3 — Objetivo */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <label className={labelClassName}>Objetivo principal do período</label>
                <p className="font-sans text-sm text-muted-foreground">
                  O calendário serve à necessidade estratégica do momento — não vira apenas uma
                  agenda bonita.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {OBJECTIVES.map((objective) => {
                    const meta = OBJECTIVE_META[objective];
                    return (
                      <label
                        key={objective}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                      >
                        <input
                          type="radio"
                          value={objective}
                          {...register('objective')}
                          className="mt-1 h-4 w-4 accent-[#D4AF37]"
                        />
                        <div>
                          <p className="flex items-center gap-2 font-sans text-sm font-bold text-foreground">
                            <meta.icon className="h-4 w-4 text-primary" />
                            {meta.label}
                          </p>
                          <p className="mt-1 font-sans text-xs text-muted-foreground">
                            {meta.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.objective && <p className={errorClassName}>{errors.objective.message}</p>}
              </div>
            </>
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
              {isSubmitting ? 'Gerando Calendário...' : 'Gerar Calendário'}{' '}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}