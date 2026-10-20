import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; calendarId: string }> },
) {
  const { projectId, calendarId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/balance`,
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}
