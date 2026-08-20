// src/app/api/editorial/projects/[projectId]/themes/calendar-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../_proxy';
import { CalendarSuggestionsRequestSchema, SlotSuggestionSchema } from '@/lib/dto/themes.schema';
import { mockSuggestions } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = CalendarSuggestionsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload de sugestões inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendar-suggestions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    },
  );

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockSuggestions(projectId, parsed.data.calendarId);
  const validated = SlotSuggestionSchema.array().safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}