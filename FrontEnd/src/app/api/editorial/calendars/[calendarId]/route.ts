import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { CalendarPatchSchema } from '@/lib/dto/editorial.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

function toCalendar(data: any): any {
  return {
    ...data,
    id: data.id || data._id,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    period: data.period
      ? {
          ...data.period,
          startDate: data.period.startDate
            ? new Date(data.period.startDate)
            : undefined,
          endDate: data.period.endDate ? new Date(data.period.endDate) : undefined,
        }
      : data.period,
    days: (data.days || []).map((day: any) => ({
      ...day,
      date: day.date ? new Date(day.date) : undefined,
      items: (day.items || []).map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : undefined,
      })),
      storySequences: (day.storySequences || []).map((seq: any) => ({
        ...seq,
        date: seq.date ? new Date(seq.date) : undefined,
      })),
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}`);

  if ('ok' in result) {
    return NextResponse.json(toCalendar(result.data));
  }

  return NextResponse.json(result, { status: 502 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = CalendarPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Dados de atualização inválidos.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}`, {
    method: 'PATCH',
    body: parsed.data,
  });

  if ('ok' in result) {
    return NextResponse.json(toCalendar(result.data));
  }

  return NextResponse.json(result, { status: 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> },
) {
  const { calendarId } = await params;
  const result = await proxyEditorialRequest(request, `/calendars/${calendarId}`, {
    method: 'DELETE',
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}