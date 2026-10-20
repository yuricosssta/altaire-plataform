import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { SaveVersionSchema } from '@/lib/dto/themes.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; calendarId: string }> },
) {
  const { projectId, calendarId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/versions`,
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; calendarId: string }> },
) {
  const { projectId, calendarId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = SaveVersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(
        ERROR_CODES.VALIDATION_ERROR,
        'Dados da versão do calendário inválidos.',
        parsed.error.flatten(),
      ),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/calendars/${calendarId}/versions`,
    {
      method: 'POST',
      body: parsed.data,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }
  return NextResponse.json(result, { status: 502 });
}
