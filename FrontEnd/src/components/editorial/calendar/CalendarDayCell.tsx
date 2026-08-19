// src/components/editorial/calendar/CalendarDayCell.tsx
'use client';

import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalendarDay, CalendarItem } from '@/lib/dto/editorial.schema';
import { CalendarContentCard } from './CalendarContentCard';
import { StorySequencesBlock } from './StorySequencesBlock';

interface CalendarDayCellProps {
  day: CalendarDay;
  dimmed?: boolean;
  onSelectItem?: (item: CalendarItem) => void;
}

export function CalendarDayCell({ day, dimmed = false, onSelectItem }: CalendarDayCellProps) {
  const today = isToday(day.date);

  return (
    <div
      className={`flex min-h-44 flex-col rounded-md border p-2.5 transition-colors ${
        dimmed
          ? 'border-border/50 bg-background/40 opacity-50'
          : today
            ? 'border-primary/40 bg-card'
            : 'border-border bg-card'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`font-sans text-[10px] font-bold uppercase tracking-wider ${
            today ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {format(day.date, 'EEE', { locale: ptBR })}
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-xs font-bold ${
            today ? 'bg-primary text-primary-foreground' : 'text-foreground'
          }`}
        >
          {format(day.date, 'd')}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {day.items.map((item) => (
          <CalendarContentCard key={item.id} item={item} onClick={onSelectItem} />
        ))}
        {day.items.length === 0 && (
          <div className="flex flex-1 items-center justify-center font-sans text-[10px] text-muted-foreground/60">
            Sem conteúdos planejados
          </div>
        )}
      </div>

      <StorySequencesBlock sequences={day.storySequences} />
    </div>
  );
}