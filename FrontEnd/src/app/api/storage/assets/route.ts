import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffCompanyHeaders,
  getBffOrgHeaders,
} from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);
    const companyHeaders = await getBffCompanyHeaders(request);

    const headers: Record<string, string> = { ...orgHeaders, ...companyHeaders };
    if (authHeader) headers['Authorization'] = authHeader;

    const brandId = request.nextUrl.searchParams.get('brandId');
    const query = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';

    const response = await fetch(`${backendUrl}/storage/assets${query}`, { headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, data?.message || 'Erro ao listar arquivos'),
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
