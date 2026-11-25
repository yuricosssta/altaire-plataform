import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffCompanyHeaders,
  getBffOrgHeaders,
} from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);
    const companyHeaders = await getBffCompanyHeaders(request);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...orgHeaders,
      ...companyHeaders,
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${backendUrl}/storage/assets/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || 'Erro ao atualizar arquivo',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);
    const companyHeaders = await getBffCompanyHeaders(request);

    const headers: Record<string, string> = { ...orgHeaders, ...companyHeaders };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${backendUrl}/storage/assets/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || 'Erro ao excluir arquivo',
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
