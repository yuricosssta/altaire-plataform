// src/components/editorial/calendar/StorySequencesBlock.tsx
'use client';

import { StickyNote } from 'lucide-react';
import type { StorySequence } from '@/lib/dto/editorial.schema';

interface StorySequencesBlockProps {
  sequences: StorySequence[];
}

export function StorySequencesBlock({ sequences }: StorySequencesBlockProps) {
  if (!sequences || sequences.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border border-dashed border-border bg-card/50 p-2.5">
      <div className="flex items-center gap-1.5 font-sans text-[11px] font-bold text-foreground">
        <StickyNote className="h-3.5 w-3.5 text-primary" />
        Stories — {sequences.length} sequência{sequences.length > 1 ? 's' : ''} no dia
      </div>
      <div className="mt-1.5 space-y-1">
        {sequences.map((sequence) => (
          <div
            key={sequence.id}
            className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background px-2 py-1 font-sans text-[10px] text-muted-foreground"
          >
            <span>
              Seq {sequence.sequenceIndex} • {sequence.storiesCount} stories • {sequence.suggestedTime}
            </span>
            <span className="truncate text-foreground/70">{sequence.focus}</span>
          </div>
        ))}
      </div>
    </div>
  );
}