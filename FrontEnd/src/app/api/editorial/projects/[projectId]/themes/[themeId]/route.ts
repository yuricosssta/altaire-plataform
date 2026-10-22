import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { ThemeUpdateSchema } from '@/lib/dto/themes.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; themeId: string }> },
) {
  const { projectId, themeId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = ThemeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(
        ERROR_CODES.VALIDATION_ERROR,
        'Dados de atualização de tema inválidos.',
        parsed.error.flatten(),
      ),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/${themeId}`,
    {
      method: 'PATCH',
      body: parsed.data,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; themeId: string }> },
) {
  const { projectId, themeId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/${themeId}`,
    { method: 'DELETE' },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}
