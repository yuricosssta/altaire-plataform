// src/components/themes/generate/ObjectiveForm.tsx
'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { BusinessMoment, GenerationRequest, ObjectiveParams, ThemeObjective } from '@/lib/dto/themes.schema';
import { BUSINESS_MOMENT_META, THEME_OBJECTIVE_META, VOLUME_OPTIONS } from '@/lib/constants/themes';
import { PLATFORM_META } from '@/lib/constants/calendar';
import type { Platform } from '@/lib/dto/editorial.schema';

interface ObjectiveFormProps {
  onGenerate: (request: GenerationRequest) => Promise<void> | void;
  generating?: boolean;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';

export function ObjectiveForm({ onGenerate, generating }: ObjectiveFormProps) {
  const [objective, setObjective] = useState<ThemeObjective>('warm_up_sales');
  const [businessMoment, setBusinessMoment] = useState<BusinessMoment>('pre_sale');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
  const [volume, setVolume] = useState<ObjectiveParams['volume']>('20');

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  const submit = () => {
    if (platforms.length === 0) return;
    void onGenerate({
      mode: 'objective',
      params: {
        objective,
        businessMoment,
        platforms,
        volume,
      },
    });
  };

  const objectiveMeta = THEME_OBJECTIVE_META[objective];
  const ObjectiveIcon = objectiveMeta.icon;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className={labelClassName}>Objetivo principal do período</label>
        <p className="font-sans text-sm text-muted-foreground">
          Qual é o principal objetivo deste ciclo de conteúdo?
        </p>
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(THEME_OBJECTIVE_META) as ThemeObjective[]).map((key) => {
            const meta = THEME_OBJECTIVE_META[key];
            const Icon = meta.icon;
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                  objective === key ? 'border-primary bg-primary/10' : 'border-border bg-background'
                }`}
              >
                <input
                  type="radio"
                  checked={objective === key}
                  onChange={() => setObjective(key)}
                  className="mt-1 h-4 w-4 accent-[#D4AF37]"
                />
                <div>
                  <p className="flex items-center gap-2 font-sans text-sm font-bold text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {meta.label}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-muted-foreground">{meta.description}</p>
                </div>
              </label>
            );
          })}
        </div>
        <p className="flex items-center gap-2 font-sans text-sm text-primary">
          <ObjectiveIcon className="h-4 w-4" />
          {objectiveMeta.label}
        </p>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>Momento atual do negócio</label>
        <p className="font-sans text-sm text-muted-foreground">
          Em que momento do seu negócio você está agora?
        </p>
        <select
          value={businessMoment}
          onChange={(e) => setBusinessMoment(e.target.value as BusinessMoment)}
          className={inputClassName}
        >
          {(Object.keys(BUSINESS_MOMENT_META) as BusinessMoment[]).map((key) => (
            <option key={key} value={key}>
              {BUSINESS_MOMENT_META[key].label}
            </option>
          ))}
        </select>
        <p className="font-sans text-xs text-muted-foreground">
          {BUSINESS_MOMENT_META[businessMoment].description}
        </p>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>Plataformas principais</label>
        <p className="font-sans text-sm text-muted-foreground">
          Em quais plataformas vamos focar neste período?
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(PLATFORM_META) as Platform[]).map((platform) => (
            <label
              key={platform}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-sans text-sm text-foreground transition-colors ${
                platforms.includes(platform)
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              }`}
            >
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
                className="h-4 w-4 accent-[#D4AF37]"
              />
              {PLATFORM_META[platform]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>Volume de temas</label>
        <select
          value={volume}
          onChange={(e) => setVolume(e.target.value as ObjectiveParams['volume'])}
          className={inputClassName}
        >
          {VOLUME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="button"
          onClick={submit}
          disabled={generating || platforms.length === 0}
          className="flex items-center gap-2 rounded-md bg-primary px-8 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? 'Gerando temas...' : 'Gerar temas alinhados ao período'}
        </button>
      </div>
    </div>
  );
}