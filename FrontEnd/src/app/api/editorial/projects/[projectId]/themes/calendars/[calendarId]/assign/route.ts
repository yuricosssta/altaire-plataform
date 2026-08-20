// src/app/api/editorial/projects/[projectId]/themes/calendars/[calendarId]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../../../_proxy';
import { CalendarItemSchema } from '@/lib/dto/editorial.schema';
import { AssignThemeSchema } from '@/lib/dto/themes.schema';
import { mockCalendarById } from '@/lib/mocks/calendar.mock';
import { mockAssignTheme, mockThemeById } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; calendarId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId, calendarId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = AssignThemeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload de atribuição inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/assign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    },
  );

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const source = mockCalendarById(calendarId);
  if (!source) {
    return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 });
  }

  const theme = parsed.data.themeId ? mockThemeById(projectId, parsed.data.themeId) : undefined;
  const fallback = mockAssignTheme(source, parsed.data.calendarItemId, theme, parsed.data.title);
  if (!fallback) {
    return NextResponse.json({ error: 'Slot do calendário não encontrado.' }, { status: 404 });
  }

  const validated = CalendarItemSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}