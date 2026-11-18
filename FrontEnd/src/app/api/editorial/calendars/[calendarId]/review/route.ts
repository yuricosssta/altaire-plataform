import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/calendars/${calendarId}/review`,
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await proxyEditorialRequest(
    request,
    `/calendars/${calendarId}/review`,
    { method: 'POST', body },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
