// src/app/api/editorial/calendars/[calendarId]/items/[itemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../_proxy';
import { mockCalendarById, mockUpdateCalendarItem } from '@/lib/mocks/calendar.mock';
import { CalendarItemUpdateSchema, CalendarItemSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ calendarId: string; itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { calendarId, itemId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = CalendarItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload do card inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}/items/${itemId}`, {
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

  const fallback = mockUpdateCalendarItem(source, itemId, parsed.data as Record<string, unknown>);
  if (!fallback) {
    return NextResponse.json({ error: 'Card não encontrado.' }, { status: 404 });
  }

  const validated = CalendarItemSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback);
}