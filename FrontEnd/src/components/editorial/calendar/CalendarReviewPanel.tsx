// src/components/editorial/calendar/CalendarReviewPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, SlidersHorizontal, Repeat, Sparkles, Loader2 } from 'lucide-react';
import type { CalendarObjective, ReviewSuggestion } from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';
import { OBJECTIVE_META } from '@/lib/constants/calendar';

interface CalendarReviewPanelProps {
  calendarId: string;
  objective: CalendarObjective;
  initialSuggestions?: ReviewSuggestion[];
}

const TYPE_META: Record<ReviewSuggestion['type'], { label: string; icon: typeof ArrowUpRight }> = {
  increase: { label: 'Aumentar', icon: ArrowUpRight },
  reduce: { label: 'Reduzir', icon: ArrowDownRight },
  adjust: { label: 'Ajustar', icon: SlidersHorizontal },
  frequency: { label: 'Frequência', icon: Repeat },
};

const IMPACT_META: Record<ReviewSuggestion['impact'], string> = {
  high: 'border-primary/30 bg-primary/10 text-primary',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  low: 'border-border bg-card text-muted-foreground',
};

export function CalendarReviewPanel({
  calendarId,
  objective,
  initialSuggestions,
}: CalendarReviewPanelProps) {
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[] | null>(
    initialSuggestions || null,
  );
  const [isLoading, setIsLoading] = useState(!initialSuggestions);

  const loadReview = async () => {
    setIsLoading(true);
    try {
      const data = await editorialService.getCalendarReview(calendarId);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSuggestions) {
      void loadReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarId]);

  if (isLoading && !suggestions) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-card p-6 font-sans text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Analisando o calendário...
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6 font-sans text-sm text-muted-foreground">
        Nenhuma sugestão de revisão disponível no momento.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-serif text-xl text-foreground">Revisão do Período</h3>
            <p className="font-sans text-sm text-muted-foreground">
              Sugestões para {OBJECTIVE_META[objective].label.toLowerCase()} — revise o calendário
              com base em resultado e mudanças de prioridade.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadReview()}
          disabled={isLoading}
          className="rounded-md border border-border px-3 py-1.5 font-sans text-xs font-bold text-foreground transition-colors hover:text-primary disabled:opacity-50"
        >
          {isLoading ? 'Gerando...' : 'Gerar nova revisão'}
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const meta = TYPE_META[suggestion.type];
          const Icon = meta.icon;
          return (
            <div
              key={suggestion.id}
              className="rounded-md border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-bold text-foreground">{suggestion.title}</p>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider ${IMPACT_META[suggestion.impact]}`}
                >
                  {suggestion.impact === 'high' ? 'Alta prioridade' : suggestion.impact === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
              <p className="mt-2 font-sans text-xs uppercase tracking-wider text-muted-foreground">
                {meta.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}