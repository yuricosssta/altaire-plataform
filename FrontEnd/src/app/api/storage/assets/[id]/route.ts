import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl, getBffAuthHeader, getBffOrgHeaders } from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);

    const headers: Record<string, string> = { ...orgHeaders };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${backendUrl}/storage/assets/${params.id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, 'Erro ao excluir arquivo'),
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