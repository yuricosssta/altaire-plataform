// src/app/api/editorial/projects/[projectId]/calendars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest, normalizeList } from '../../../_proxy';
import { mockCalendarsForProject, mockCreateCalendar } from '@/lib/mocks/calendar.mock';
import { CalendarSetupSchema, EditorialCalendarSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/calendars`);

  if (result.ok) {
    const calendars = normalizeList(result.data as any[]);
    return NextResponse.json(calendars);
  }

  const fallback = mockCalendarsForProject(projectId);
  const parsed = EditorialCalendarSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = CalendarSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Configuração do calendário inválida.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/calendars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockCreateCalendar(projectId, parsed.data);
  const validated = EditorialCalendarSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}