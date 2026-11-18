import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; itemId: string }> },
) {
  const { calendarId, itemId } = await params;
  const body = await request.json().catch(() => null);

  const result = await proxyEditorialRequest(
    request,
    `/calendars/${calendarId}/items/${itemId}`,
    { method: 'PATCH', body },
  );

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      id: data.id || data._id,
      date: data.date ? new Date(data.date) : undefined,
    });
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; itemId: string }> },
) {
  const { calendarId, itemId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/calendars/${calendarId}/items/${itemId}`,
    { method: 'DELETE' },
  );

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      id: data?.id || data?._id,
    });
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
