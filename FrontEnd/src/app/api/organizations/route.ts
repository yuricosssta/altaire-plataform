import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Nome da organização é obrigatório.'),
      { status: 400 },
    );
  }

  const result = await proxyOrgRequest(request, '', {
    method: 'POST',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }

  return NextResponse.json(result, { status: 502 });
}