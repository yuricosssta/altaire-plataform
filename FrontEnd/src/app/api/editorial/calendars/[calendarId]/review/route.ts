import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}/review`);

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}