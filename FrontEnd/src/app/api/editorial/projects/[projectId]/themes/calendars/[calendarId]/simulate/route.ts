// src/app/api/editorial/projects/[projectId]/themes/calendars/[calendarId]/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../../../_proxy';
import { RebalanceResultSchema, SimulateRequestSchema } from '@/lib/dto/themes.schema';
import { mockSimulate } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; calendarId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId, calendarId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = SimulateRequestSchema.safeParse(body || {});

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/simulate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.success ? parsed.data : {}),
    },
  );

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockSimulate(projectId, calendarId, parsed.success ? parsed.data : undefined);
  const validated = RebalanceResultSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}