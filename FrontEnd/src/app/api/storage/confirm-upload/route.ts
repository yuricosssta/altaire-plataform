import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl, getBffAuthHeader, getBffOrgHeaders } from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.fileUrl) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'fileUrl é obrigatório.'),
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

    const response = await fetch(`${backendUrl}/storage/confirm-upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || 'Erro ao confirmar upload';
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, message),
        { status: response.status },
      );
    }

    return NextResponse.json(success(data));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao conectar com o backend';
    return NextResponse.json(
      error(ERROR_CODES.INTERNAL_ERROR, message),
      { status: 502 },
    );
  }
}