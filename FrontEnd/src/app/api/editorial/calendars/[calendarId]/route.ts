// src/app/api/editorial/calendars/[calendarId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../_proxy';
import { mockCalendarById, mockPatchCalendar } from '@/lib/mocks/calendar.mock';
import { CalendarPatchSchema, EditorialCalendarSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ calendarId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { calendarId } = await params;

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = mockCalendarById(calendarId);
  if (!fallback) {
    return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 });
  }
  const parsed = EditorialCalendarSchema.safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { calendarId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = CalendarPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload do calendário inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const source = mockCalendarById(calendarId);
  if (!source) {
    return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 });
  }

  const fallback = mockPatchCalendar(source, parsed.data);
  const validated = EditorialCalendarSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback);
}