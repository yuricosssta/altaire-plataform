// src/components/editorial/calendar/CalendarGrid.tsx
'use client';

import { useState } from 'react';
import {
  addDays,
  addWeeks,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LayoutGrid, ListTodo } from 'lucide-react';
import type { CalendarDay, CalendarItem, CalendarStatus } from '@/lib/dto/editorial.schema';
import { RETINA_META, STATUS_META } from '@/lib/constants/calendar';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarContentCard } from './CalendarContentCard';

interface CalendarGridProps {
  calendar: { days: CalendarDay[]; period: { startDate: Date } };
  onSelectItem: (item: CalendarItem) => void;
}

const STATUS_COLUMNS = Object.keys(STATUS_META) as CalendarStatus[];

export function CalendarGrid({ calendar, onSelectItem }: CalendarGridProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [mode, setMode] = useState<'grid' | 'board'>('grid');
  const [anchor, setAnchor] = useState<Date>(() => {
    const start = new Date(calendar.period.startDate);
    return startOfWeek(start, { weekStartsOn: 1 });
  });

  const daysByDate = new Map<number, CalendarDay>();
  for (const day of calendar.days) {
    daysByDate.set(day.date.getTime(), day);
  }

  const move = (direction: -1 | 1) => {
    if (view === 'week') {
      setAnchor((prev) => addWeeks(prev, direction));
    } else {
      const month = startOfMonth(anchor);
      setAnchor(direction === -1 ? addDays(month, -1) : addDays(addWeeks(startOfMonth(month), 5), 1));
    }
  };

  let cells: Date[] = [];
  if (view === 'week') {
    for (let i = 0; i < 7; i += 1) cells.push(addDays(anchor, i));
  } else {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    for (let i = 0; i < 42; i += 1) cells.push(addDays(start, i));
  }

  const allItems = calendar.days.flatMap((day) => day.items);

  const toggleClass =
    'rounded-sm px-3 py-1.5 font-sans text-xs font-bold transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            className="rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:text-primary"
            title="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:text-primary"
            title="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 font-serif text-lg text-foreground">
            {view === 'week'
              ? `${format(anchor, 'dd MMM', { locale: ptBR })} – ${format(
                  addDays(anchor, 6),
                  'dd MMM yyyy',
                  { locale: ptBR },
                )}`
              : format(anchor, 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-card p-1">
            <button
              type="button"
              data-state={view === 'week' ? 'on' : 'off'}
              onClick={() => setView('week')}
              className={toggleClass}
            >
              Semana
            </button>
            <button
              type="button"
              data-state={view === 'month' ? 'on' : 'off'}
              onClick={() => setView('month')}
              className={toggleClass}
            >
              Mês
            </button>
          </div>

          <div className="flex rounded-md border border-border bg-card p-1">
            <button
              type="button"
              data-state={mode === 'grid' ? 'on' : 'off'}
              onClick={() => setMode('grid')}
              className={`${toggleClass} flex items-center gap-1.5`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grade
            </button>
            <button
              type="button"
              data-state={mode === 'board' ? 'on' : 'off'}
              onClick={() => setMode('board')}
              className={`${toggleClass} flex items-center gap-1.5`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              Quadro
            </button>
          </div>
        </div>
      </div>

      {/* Legenda RETINA */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tipos RETINA
        </span>
        {Object.entries(RETINA_META).map(([type, meta]) => (
          <span
            key={type}
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${meta.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* Grade: semana / mês */}
      {mode === 'grid' && (
        <div
          className={`grid gap-3 ${
            view === 'week'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7'
          }`}
        >
          {cells.map((date) => {
            const cellDay = daysByDate.get(date.getTime());
            const dimmed = view === 'month' && !isSameMonth(date, startOfMonth(anchor));
            if (!cellDay) {
              return (
                <div
                  key={date.getTime()}
                  className={`min-h-44 rounded-md border border-dashed border-border/50 p-2.5 ${
                    dimmed ? 'opacity-40' : ''
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {format(date, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="font-sans text-xs font-bold text-muted-foreground">
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center font-sans text-[10px] text-muted-foreground/50">
                    Fora do período
                  </div>
                </div>
              );
            }
            return (
              <CalendarDayCell
                key={date.getTime()}
                day={cellDay}
                dimmed={dimmed}
                onSelectItem={onSelectItem}
              />
            );
          })}
        </div>
      )}

      {/* Quadro operacional (notion-like) */}
      {mode === 'board' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_COLUMNS.map((status) => {
            const columnItems = allItems.filter((item) => item.status === status);
            return (
              <div key={status} className="rounded-md border border-border bg-background p-3">
                <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                  <span
                    className={`rounded px-2 py-0.5 font-sans text-[11px] font-bold ${STATUS_META[status].badgeClass}`}
                  >
                    {STATUS_META[status].label}
                  </span>
                  <span className="font-sans text-xs font-bold text-muted-foreground">
                    {columnItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnItems.map((item) => (
                    <CalendarContentCard key={item.id} item={item} onClick={onSelectItem} />
                  ))}
                  {columnItems.length === 0 && (
                    <div className="rounded-md border border-dashed border-border p-3 text-center font-sans text-[11px] text-muted-foreground/60">
                      Sem conteúdos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}