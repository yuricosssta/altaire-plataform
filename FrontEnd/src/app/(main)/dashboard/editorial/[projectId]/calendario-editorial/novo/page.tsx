// src/app/(main)/dashboard/editorial/[projectId]/calendario-editorial/novo/page.tsx
'use client';

import { CalendarSetupForm } from '@/components/editorial/calendar/CalendarSetupForm';

export default function NovoCalendarioPage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <CalendarSetupForm />
    </main>
  );
}