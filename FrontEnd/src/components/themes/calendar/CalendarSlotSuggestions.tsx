// src/components/themes/calendar/CalendarSlotSuggestions.tsx
'use client';

import { Check, Loader2 } from 'lucide-react';
import type { Theme } from '@/lib/dto/themes.schema';
import { CONSCIOUSNESS_META, JOURNEY_META } from '@/lib/constants/themes';
import { FORMAT_META, PLATFORM_META, RETINA_META } from '@/lib/constants/calendar';

interface CalendarSlotSuggestionsProps {
  suggestions: Theme[];
  onUse: (theme: Theme) => void;
  busyId?: string | null;
}

export function CalendarSlotSuggestions({ suggestions, onUse, busyId }: CalendarSlotSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-3 text-center font-sans text-xs text-muted-foreground">
        Sem sugestões para este slot. Arraste um tema da biblioteca ao lado.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
        Sugestões da IA
      </p>
      {suggestions.map((theme) => {
        const formatMeta = FORMAT_META[theme.format];
        const FormatIcon = formatMeta.icon;
        return (
          <div
            key={theme.id}
            className="rounded-md border border-border bg-background p-3 transition-colors hover:border-primary/40"
          >
            <p className="font-sans text-sm font-bold leading-snug text-foreground">{theme.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${RETINA_META[theme.retinaType].badgeClass}`}
              >
                {RETINA_META[theme.retinaType].label}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${JOURNEY_META[theme.journeyStage].badgeClass}`}
              >
                {JOURNEY_META[theme.journeyStage].shortLabel}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${CONSCIOUSNESS_META[theme.consciousnessLevel].badgeClass}`}
              >
                {CONSCIOUSNESS_META[theme.consciousnessLevel].label}
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground">
                <FormatIcon className="h-3 w-3 text-primary" />
                {formatMeta.label}
              </span>
              <span className="rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground">
                {theme.platforms.map((p) => PLATFORM_META[p]).join(', ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onUse(theme)}
              disabled={busyId === theme.id}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 font-sans text-xs font-bold text-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busyId === theme.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Usar este tema
            </button>
          </div>
        );
      })}
    </div>
  );
}