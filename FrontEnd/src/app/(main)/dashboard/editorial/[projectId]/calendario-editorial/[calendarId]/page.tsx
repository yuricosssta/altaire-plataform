// src/app/(main)/dashboard/editorial/[projectId]/calendario-editorial/[calendarId]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type {
  CalendarItem,
  CalendarItemUpdate,
  EditorialCalendar,
} from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';
import { OBJECTIVE_META, PERIOD_META } from '@/lib/constants/calendar';
import { CalendarGrid } from '@/components/editorial/calendar/CalendarGrid';
import { CalendarCardDetailSheet } from '@/components/editorial/calendar/CalendarCardDetailSheet';
import { CalendarReviewPanel } from '@/components/editorial/calendar/CalendarReviewPanel';

export default function CalendarioEditorialPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const calendarId = params.calendarId as string;

  const [calendar, setCalendar] = useState<EditorialCalendar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    let active = true;
    editorialService
      .getCalendar(calendarId)
      .then((data) => {
        if (active) setCalendar(data);
      })
      .catch((err: any) => {
        if (active) toast.error(err?.response?.data?.error || err?.message || 'Falha ao carregar o calendário.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [calendarId]);

  const handleSelectItem = useCallback((item: CalendarItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  const handleSaveItem = async (patch: CalendarItemUpdate) => {
    if (!selectedItem) return;
    const updated = await editorialService.updateCalendarItem(calendarId, selectedItem.id, patch);
    setSelectedItem(updated);
    setCalendar((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) =>
          day.items.some((item) => item.id === updated.id)
            ? { ...day, items: day.items.map((item) => (item.id === updated.id ? updated : item)) }
            : day,
        ),
      };
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-24 font-sans text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando calendário editorial...
        </div>
      </main>
    );
  }

  if (!isLoading && !calendar) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-6 font-sans text-sm text-red-500">
          Calendário não encontrado.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/editorial/${projectId}`}
              className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-sans text-sm uppercase tracking-widest text-primary">
                Calendário Editorial
              </p>
              <h1 className="font-serif text-3xl text-foreground">{calendar!.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-card px-3 py-1.5 font-sans text-xs font-bold text-foreground">
              {PERIOD_META[calendar!.period.type].label} ·{' '}
              {calendar!.period.startDate.toLocaleDateString('pt-BR')} →{' '}
              {calendar!.period.endDate.toLocaleDateString('pt-BR')}
            </span>
            <span className="rounded-md border border-border bg-card px-3 py-1.5 font-sans text-xs font-bold text-foreground">
              {OBJECTIVE_META[calendar!.objective].label}
            </span>
            <button
              type="button"
              onClick={() => setReviewOpen((prev) => !prev)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-sans text-xs font-bold transition-colors ${
                reviewOpen
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:text-primary'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Revisão
            </button>
          </div>
        </header>

        {reviewOpen && (
          <CalendarReviewPanel
            calendarId={calendarId}
            objective={calendar!.objective}
            initialSuggestions={calendar!.reviewSuggestions}
          />
        )}

        <CalendarGrid calendar={calendar!} onSelectItem={handleSelectItem} />
      </div>

      <CalendarCardDetailSheet
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={handleSaveItem}
      />
    </main>
  );
}