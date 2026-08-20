// src/app/api/editorial/projects/[projectId]/themes/calendars/[calendarId]/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../../../_proxy';
import { BalanceReportSchema } from '@/lib/dto/themes.schema';
import { mockBalance } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; calendarId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId, calendarId } = await params;

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/balance`,
  );

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = mockBalance(projectId, calendarId);
  const parsed = BalanceReportSchema.safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}