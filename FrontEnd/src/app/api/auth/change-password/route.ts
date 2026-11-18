import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffOrgHeaders,
} from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) {
    return NextResponse.json(
      error(
        ERROR_CODES.VALIDATION_ERROR,
        'Senha atual e nova senha são obrigatórias.',
      ),
      { status: 400 },
    );
  }

  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...orgHeaders,
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${backendUrl}/users/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || 'Erro ao alterar senha',
        ),
        { status: response.status },
      );
    }

    return NextResponse.json(success(data));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao conectar com o backend';
    return NextResponse.json(
      error(ERROR_CODES.INTERNAL_ERROR, message),
      { status: 502 },
    );
  }
}
