import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.newPassword) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Token e nova senha são obrigatórios.'),
      { status: 400 },
    );
  }

  try {
    const backendUrl = getBackendApiUrl();
    const response = await fetch(`${backendUrl}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || 'Erro ao redefinir senha';
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, message),
        { status: response.status },
      );
    }

    return NextResponse.json(success(data || null));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
    return NextResponse.json(
      error(ERROR_CODES.INTERNAL_ERROR, message),
      { status: 502 },
    );
  }
}