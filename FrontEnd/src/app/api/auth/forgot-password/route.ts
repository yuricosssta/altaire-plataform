import { NextRequest, NextResponse } from 'next/server';
import { getAuthApiUrl, getCazuaClientHeaders } from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'E-mail é obrigatório.'),
      { status: 400 },
    );
  }

  try {
    const authUrl = getAuthApiUrl();
    const response = await fetch(`${authUrl}/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCazuaClientHeaders(),
      },
      body: JSON.stringify({
        email: String(body.email).trim().toLowerCase(),
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || 'Erro ao solicitar redefinição de senha.';
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, message),
        { status: response.status },
      );
    }

    return NextResponse.json(success(data || null));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
    return NextResponse.json(
      error(ERROR_CODES.INTERNAL_ERROR, message),
      { status: 502 },
    );
  }
}