import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const result = await proxyEditorialRequest(request, `/versions/${versionId}/mapa`);

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Corpo da requisição é obrigatório.'),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/versions/${versionId}/mapa`, {
    method: 'PATCH',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}