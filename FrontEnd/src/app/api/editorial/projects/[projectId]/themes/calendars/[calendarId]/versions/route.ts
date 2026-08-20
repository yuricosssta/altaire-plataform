// src/app/api/editorial/projects/[projectId]/themes/calendars/[calendarId]/versions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../../../_proxy';
import {
  CalendarThemeVersionSchema,
  SaveVersionSchema,
} from '@/lib/dto/themes.schema';
import { mockListVersions, mockSaveVersion } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; calendarId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId, calendarId } = await params;

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/versions`,
  );

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = mockListVersions(calendarId);
  const parsed = CalendarThemeVersionSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId, calendarId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = SaveVersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados da versão inválidos.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    },
  );

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockSaveVersion(projectId, calendarId, parsed.data);
  const validated = CalendarThemeVersionSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}