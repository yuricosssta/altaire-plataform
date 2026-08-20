// src/components/themes/generate/RomaAvatarForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { GenerationRequest, RomaAvatarParams } from '@/lib/dto/themes.schema';
import { RETINA_PRIORITY_META, VOLUME_OPTIONS } from '@/lib/constants/themes';
import { themesService } from '@/lib/services/themesService';

interface RomaAvatarFormProps {
  projectId: string;
  onGenerate: (request: GenerationRequest) => Promise<void> | void;
  generating?: boolean;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';

export function RomaAvatarForm({ projectId, onGenerate, generating }: RomaAvatarFormProps) {
  const [pillars, setPillars] = useState<string[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(true);
  const [selectedPillars, setSelectedPillars] = useState<string[]>(['all']);
  const [volume, setVolume] = useState<RomaAvatarParams['volume']>('20');
  const [retinaPriority, setRetinaPriority] = useState<RomaAvatarParams['retinaPriority']>('balanced');

  useEffect(() => {
    let active = true;
    themesService
      .detectPillars(projectId)
      .then((data) => {
        if (active) setPillars(data);
      })
      .catch(() => {
        if (active) setPillars([]);
      })
      .finally(() => {
        if (active) setPillarsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const togglePillar = (pillar: string) => {
    if (selectedPillars.includes('all')) {
      setSelectedPillars([pillar]);
      return;
    }
    if (selectedPillars.includes(pillar)) {
      setSelectedPillars((prev) => prev.filter((p) => p !== pillar));
      return;
    }
    setSelectedPillars((prev) => [...prev, pillar]);
  };

  const submit = () => {
    void onGenerate({
      mode: 'roma_avatar',
      params: {
        volume,
        pillars: selectedPillars,
        retinaPriority,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className={labelClassName}>Volume de temas</label>
        <select value={volume} onChange={(e) => setVolume(e.target.value as RomaAvatarParams['volume'])} className={inputClassName}>
          {VOLUME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>Foco em pilares da ROMA</label>
        {pillarsLoading ? (
          <div className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Detectando pilares da ROMA...
          </div>
        ) : (
          <div className="space-y-2">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-sans text-sm text-foreground transition-colors ${
                selectedPillars.includes('all')
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPillars.includes('all')}
                onChange={() => setSelectedPillars(['all'])}
                className="h-4 w-4 accent-[#D4AF37]"
              />
              Todos os pilares (recomendado)
            </label>
            {pillars.map((pillar) => {
              const checked = selectedPillars.includes('all') || selectedPillars.includes(pillar);
              return (
                <label
                  key={pillar}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-sans text-sm text-foreground transition-colors ${
                    checked ? 'border-primary bg-primary/10' : 'border-border bg-background'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePillar(pillar)}
                    className="h-4 w-4 accent-[#D4AF37]"
                  />
                  {pillar}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>Prioridade de tipo de conteúdo (RETINA)</label>
        <select
          value={retinaPriority}
          onChange={(e) => setRetinaPriority(e.target.value as RomaAvatarParams['retinaPriority'])}
          className={inputClassName}
        >
          {Object.entries(RETINA_PRIORITY_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
        <p className="font-sans text-xs text-muted-foreground">
          {RETINA_PRIORITY_META[retinaPriority].description}
        </p>
      </div>

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="button"
          onClick={submit}
          disabled={generating}
          className="flex items-center gap-2 rounded-md bg-primary px-8 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? 'Gerando temas...' : 'Gerar Temas'}
        </button>
      </div>
    </div>
  );
}