import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffOrgHeaders,
} from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

async function forwardProfile(request: NextRequest, method: 'GET' | 'PATCH' | 'PUT') {
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);

    const headers: Record<string, string> = { ...orgHeaders };
    if (authHeader) headers['Authorization'] = authHeader;

    let bodyStr: string | undefined;
    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      const body = await request.json().catch(() => ({}));
      bodyStr = JSON.stringify(body);
    }

    const response = await fetch(`${backendUrl}/users/profile`, {
      method,
      headers,
      body: bodyStr,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || 'Erro ao processar perfil',
        ),
        { status: response.status },
      );
    }

    return NextResponse.json(success(data));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao conectar com o backend';
    return NextResponse.json(error(ERROR_CODES.INTERNAL_ERROR, message), {
      status: 502,
    });
  }
}

export async function GET(request: NextRequest) {
  return forwardProfile(request, 'GET');
}

export async function PATCH(request: NextRequest) {
  return forwardProfile(request, 'PATCH');
}

export async function PUT(request: NextRequest) {
  return forwardProfile(request, 'PUT');
}
