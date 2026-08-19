// src/app/api/editorial/calendars/[calendarId]/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { buildReviewSuggestions, mockCalendarById } from '@/lib/mocks/calendar.mock';
import { ReviewSuggestionSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ calendarId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { calendarId } = await params;

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}/review`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const source = mockCalendarById(calendarId);
  if (!source) {
    return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 });
  }

  const fallback = buildReviewSuggestions(source.objective, source.capacity);
  const parsed = ReviewSuggestionSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}