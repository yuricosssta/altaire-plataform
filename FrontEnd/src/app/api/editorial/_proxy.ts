// src/app/api/editorial/_proxy.ts
// Helper do BFF editorial: tenta repassar a requisição ao backend NestJS
// (contrato /editorial/*). Se o backend estiver indisponível ou a rota não
// existir, retorna { ok: false } para que a rota caia no fallback mock.

import { getNestApiUrl, getBffAuthHeader, getBffOrgHeaders } from '@/lib/api/serverUtils';

interface ProxyResult {
  ok: boolean;
  status: number;
  data: unknown;
}

export async function proxyEditorialRequest(
  request: Request,
  path: string,
  init?: RequestInit,
): Promise<ProxyResult> {
  const nestApiUrl = getNestApiUrl();

  try {
    const authorization = await getBffAuthHeader(request);
    const { orgId, orgRole } = getBffOrgHeaders(request);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    };

    if (authorization) headers['Authorization'] = authorization;
    if (orgId) headers['x-org-id'] = orgId;
    if (orgRole) headers['x-org-role'] = orgRole;

    const response = await fetch(`${nestApiUrl}/editorial${path}`, {
      ...init,
      headers,
    });

    const raw = await response.text();
    let data: unknown = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok) {
      console.warn(
        `[BFF editorial] Backend ${response.status} para ${path} — usando fallback mock.`,
      );
      return { ok: false, status: response.status, data };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    console.warn(`[BFF editorial] Falha ao conectar em ${path} — usando fallback mock.`, error);
    return { ok: false, status: 500, data: null };
  }
}

export function normalizeList<T extends { _id?: string; id?: string }>(data: unknown): T[] {
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    ...item,
    id: item.id || item._id,
  })) as T[];
}