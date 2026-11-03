import { cookies } from 'next/headers';

export function getNestApiUrl() {
  if (process.env.BACKEND_API_URL) return process.env.BACKEND_API_URL;
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  return 'http://localhost:3001';
}

export function getAuthApiUrl() {
  if (process.env.AUTH_API_URL) return process.env.AUTH_API_URL;
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
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
  return {
    'x-org-id': reqOrgId || 'altaire',
    'x-org-role': reqOrgRole || 'member',
    orgId: reqOrgId || 'altaire',
    orgRole: reqOrgRole || 'member',
  };
}