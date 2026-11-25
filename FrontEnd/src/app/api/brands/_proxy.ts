import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffCompanyHeaders,
  getBffOrgHeaders,
} from '@/lib/api/serverUtils';
import { error, ERROR_CODES, ErrorCode, ErrorResponse } from '@/lib/api/response';

interface ProxyOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function proxyBrandRequest(
  request: Request,
  path: string,
  init?: ProxyOptions,
): Promise<{ ok: true; status: number; data: unknown } | (ErrorResponse & { status: number })> {
  const backendUrl = getBackendApiUrl();

  try {
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);
    const companyHeaders = await getBffCompanyHeaders(request);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...orgHeaders,
      ...companyHeaders,
      ...(init?.headers || {}),
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${backendUrl}/brands${path}`, {
      method: init?.method || 'GET',
      headers,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });

    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' && data && 'message' in data
          ? ((data as Record<string, unknown>).message as string)
          : `Erro na requisição (${response.status})`;
      return {
        ...error(mapStatusToErrorCode(response.status), message, data),
        status: response.status,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao conectar com o backend';
    return {
      ...error(ERROR_CODES.INTERNAL_ERROR, message),
      status: 502,
    };
  }
}

function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    default:
      return ERROR_CODES.INTERNAL_ERROR;
  }
}
