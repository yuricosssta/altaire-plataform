import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { CalendarSetupSchema } from '@/lib/dto/editorial.schema';
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
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/calendars`);

  if ('ok' in result) {
    const calendars = ((result.data as any[]) || []).map(toCalendar);
    return NextResponse.json(calendars);
  }

  return NextResponse.json(result, { status: 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = CalendarSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Dados do calendário inválidos.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/calendars`, {
    method: 'POST',
    body: parsed.data,
  });

  if ('ok' in result) {
    return NextResponse.json(toCalendar(result.data), { status: 201 });
  }

  return NextResponse.json(result, { status: 502 });
}