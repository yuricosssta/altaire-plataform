import { getBackendApiUrl } from '@/lib/api/serverUtils';
import { getAuthTokenFromRequest } from '@/lib/auth/token.service';
import { success, error, ERROR_CODES, ErrorCode, ErrorResponse } from '@/lib/api/response';

interface ProxyOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function proxyEditorialRequest(
  request: Request,
  path: string,
  init?: ProxyOptions,
): Promise<{ ok: true; status: number; data: unknown } | ErrorResponse> {
  const backendUrl = getBackendApiUrl();

  try {
    const token = await getAuthTokenFromRequest(request);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-org-id': 'altaire',
      'x-org-role': 'member',
      ...(init?.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}/editorial${path}`, {
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
      const code = mapStatusToErrorCode(response.status);
      const message = typeof data === 'object' && data && 'message' in data
        ? (data as Record<string, unknown>).message as string
        : `Erro na requisição (${response.status})`;
      return error(code, message, data);
    }

    return { ok: true, status: response.status, data };
  } catch (err: unknown) {
    const message = err instanceof Error
      ? err.message
      : 'Falha ao conectar com o backend';
    return error(ERROR_CODES.INTERNAL_ERROR, message);
  }
}

function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400: return ERROR_CODES.VALIDATION_ERROR;
    case 401: return ERROR_CODES.UNAUTHORIZED;
    case 403: return ERROR_CODES.FORBIDDEN;
    case 404: return ERROR_CODES.NOT_FOUND;
    default: return ERROR_CODES.INTERNAL_ERROR;
  }
}