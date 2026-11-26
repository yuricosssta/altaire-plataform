import { existsSync } from 'fs';
import { cookies } from 'next/headers';

let cachedInDocker: boolean | null = null;

function isRunningInDocker(): boolean {
  if (cachedInDocker !== null) return cachedInDocker;
  try {
    cachedInDocker = existsSync('/.dockerenv');
  } catch {
    cachedInDocker = false;
  }
  return cachedInDocker;
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(
    url.trim(),
  );
}

function normalizeBaseUrl(raw?: string): string {
  return (raw || '').trim().replace(/\/+$/, '');
}

export function getNestApiUrl() {
  const backendUrl = normalizeBaseUrl(process.env.BACKEND_API_URL);
  const internalUrl = normalizeBaseUrl(process.env.INTERNAL_API_URL);
  const publicUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  const inDocker = isRunningInDocker();

  if (inDocker && internalUrl && (!backendUrl || isLocalhostUrl(backendUrl))) {
    return internalUrl;
  }

  if (backendUrl) return backendUrl;

  if (!inDocker && publicUrl) return publicUrl;

  if (internalUrl) return internalUrl;
  if (publicUrl) return publicUrl;
  return 'http://localhost:3001';
}

export function getAuthApiUrl(): string {
  const raw =
    process.env.AUTH_API_URL ||
    process.env.CAZUA_API_URL ||
    'https://vanguarda-eight.vercel.app';
  return raw.trim().replace(/\/+$/, '');
}

export function getCazuaClientCredentials(): {
  clientId: string;
  clientSecret: string;
  orgId?: string;
} {
  const clientId = (
    process.env['X-CLIENT-ID'] ||
    process.env.X_CLIENT_ID ||
    process.env.CAZUA_CLIENT_ID ||
    ''
  ).trim();

  const clientSecret = (
    process.env['X-CLIENT-SECRET'] ||
    process.env.X_CLIENT_SECRET ||
    process.env.CAZUA_CLIENT_SECRET ||
    ''
  ).trim();

  const orgId =
    (process.env.CAZUA_ORG_ID || process.env['X-ORG-ID'] || '').trim() ||
    undefined;

  return { clientId, clientSecret, orgId };
}

export function getCazuaClientHeaders(): Record<string, string> {
  const { clientId, clientSecret } = getCazuaClientCredentials();
  const headers: Record<string, string> = {};
  if (clientId) {
    headers['x-client-id'] = clientId;
  }
  if (clientSecret) {
    headers['x-client-secret'] = clientSecret;
  }
  return headers;
}

export function getBackendApiUrl() {
  return getNestApiUrl();
}

export async function getBffAuthHeader(request: Request) {
  const headerToken = request.headers.get('authorization');
  if (headerToken) return headerToken;

  const cookieStore = await cookies();
  const cookieToken =
    cookieStore.get('auth_token')?.value ||
    cookieStore.get('access_token')?.value ||
    cookieStore.get('la_session_token')?.value;
  return cookieToken ? `Bearer ${cookieToken}` : undefined;
}

export function getBffOrgHeaders(request: Request) {
  const reqOrgId = request.headers.get('x-org-id');
  const reqOrgRole = request.headers.get('x-org-role');
  const reqCompanyId = request.headers.get('x-company-id');
  return {
    'x-org-id': reqOrgId || 'altaire',
    'x-org-role': reqOrgRole || 'member',
    ...(reqCompanyId ? { 'x-company-id': reqCompanyId } : {}),
    orgId: reqOrgId || 'altaire',
    orgRole: reqOrgRole || 'member',
  };
}

export async function getBffCompanyHeaders(request: Request): Promise<Record<string, string>> {
  const headerCompanyId = request.headers.get('x-company-id');
  if (headerCompanyId) {
    return { 'x-company-id': headerCompanyId };
  }
  const cookieStore = await cookies();
  const cookieCompanyId = cookieStore.get('active_company_id')?.value;
  return cookieCompanyId ? { 'x-company-id': cookieCompanyId } : {};
}