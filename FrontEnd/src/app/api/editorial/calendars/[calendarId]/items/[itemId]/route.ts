import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { CalendarItemUpdateSchema } from '@/lib/dto/editorial.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; itemId: string }> },
) {
  const { calendarId, itemId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = CalendarItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Dados do item inválidos.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/calendars/${calendarId}/items/${itemId}`,
    { method: 'PATCH', body: parsed.data },
  );

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    });
  }

  return NextResponse.json(result, { status: 502 });
}