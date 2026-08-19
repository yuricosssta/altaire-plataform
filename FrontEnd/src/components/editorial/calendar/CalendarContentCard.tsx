// src/components/editorial/calendar/CalendarContentCard.tsx
'use client';

import type { CalendarItem } from '@/lib/dto/editorial.schema';
import {
  FORMAT_META,
  PLATFORM_META,
  RETINA_META,
  RETINA_OBJECTIVE_TEXT,
  STATUS_META,
} from '@/lib/constants/calendar';

interface CalendarContentCardProps {
  item: CalendarItem;
  onClick?: (item: CalendarItem) => void;
}

export function CalendarContentCard({ item, onClick }: CalendarContentCardProps) {
  const formatMeta = FORMAT_META[item.format];
  const FormatIcon = formatMeta.icon;
  const retinaMeta = RETINA_META[item.retinaType];
  const statusMeta = STATUS_META[item.status];

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="group w-full rounded-md border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-sans text-[11px] font-bold text-foreground">
          <FormatIcon className="h-3.5 w-3.5 text-primary" />
          {formatMeta.label}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 font-sans text-[10px] font-bold ${statusMeta.badgeClass}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <span
        className={`mt-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${retinaMeta.badgeClass}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${retinaMeta.dotClass}`} />
        {retinaMeta.label}
      </span>

      <p className="mt-2 line-clamp-2 font-sans text-[11px] leading-snug text-muted-foreground">
        {item.provisionalName || item.theme || RETINA_OBJECTIVE_TEXT[item.retinaType]}
      </p>

      <div className="mt-2 flex items-center justify-between font-sans text-[10px] text-muted-foreground">
        <span>{item.suggestedTime}</span>
        <span>{item.platforms.map((platform) => PLATFORM_META[platform]).join(', ')}</span>
      </div>
    </button>
  );
}