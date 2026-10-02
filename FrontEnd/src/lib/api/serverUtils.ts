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
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('access_token')?.value;
  const headerToken = request.headers.get('authorization');
  return headerToken || (cookieToken ? `Bearer ${cookieToken}` : undefined);
}

export function getBffOrgHeaders(request: Request) {
  return {
    orgId: 'altaire',
    orgRole: 'member',
  };
}