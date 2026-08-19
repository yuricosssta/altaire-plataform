// src/app/api/editorial/calendars/[calendarId]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockCalendarById, mockDuplicateCalendar } from '@/lib/mocks/calendar.mock';
import { CalendarDuplicateSchema, EditorialCalendarSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ calendarId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { calendarId } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = CalendarDuplicateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Período de duplicação inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const source = mockCalendarById(calendarId);
  if (!source) {
    return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 });
  }

  const fallback = mockDuplicateCalendar(source, parsed.data);
  const validated = EditorialCalendarSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}