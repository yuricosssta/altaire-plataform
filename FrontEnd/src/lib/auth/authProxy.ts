import { getAuthApiUrl } from '@/lib/api/serverUtils';
import { decodeExternalToken, createAuthToken, TokenPayload } from '@/lib/auth/token.service';

interface ExternalAuthResponse {
  access_token?: string;
  token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function proxyAuthLogin(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: TokenPayload }> {
  const authUrl = getAuthApiUrl();

  const response = await fetch(`${authUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg = body?.message || body?.error || 'Erro na autenticação externa';
    throw new Error(msg);
  }

  const data: ExternalAuthResponse = await response.json();

  const externalToken = data.access_token || data.token || '';
  if (!externalToken) {
    throw new Error('Token não retornado pela API externa');
  }

  const externalPayload = decodeExternalToken(externalToken);
  if (!externalPayload) {
    throw new Error('Token externo inválido');
  }

  const userPayload: TokenPayload = {
    sub: externalPayload.sub || externalPayload.id || '',
    email: externalPayload.email || credentials.email,
    name: externalPayload.name || data.user?.name || externalPayload.email?.split('@')[0] || '',
    org: 'altaire',
    role: 'member',
  };

  const internalToken = await createAuthToken(userPayload);

  return { token: internalToken, user: userPayload };
}

export async function proxyAuthSignup(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ token: string; user: TokenPayload }> {
  const authUrl = getAuthApiUrl();

  const response = await fetch(`${authUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg = body?.message || body?.error || 'Erro no cadastro externo';
    throw new Error(msg);
  }

  const resData: ExternalAuthResponse = await response.json();
  const externalToken = resData.access_token || resData.token || '';
  if (!externalToken) {
    throw new Error('Token não retornado pela API externa');
  }

  const externalPayload = decodeExternalToken(externalToken);

  const userPayload: TokenPayload = {
    sub: externalPayload?.sub || externalPayload?.id || '',
    email: data.email,
    name: data.name || externalPayload?.name || data.email.split('@')[0],
    org: 'altaire',
    role: 'member',
  };

  const internalToken = await createAuthToken(userPayload);

  return { token: internalToken, user: userPayload };
}

export async function proxyAuthRefresh(
  currentInternalToken: string,
): Promise<{ token: string; user: TokenPayload }> {
  const { verifyInternalToken } = await import('@/lib/auth/token.service');
  const payload = await verifyInternalToken(currentInternalToken);
  if (!payload) {
    throw new Error('Token inválido ou expirado');
  }

  const userPayload: TokenPayload = {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    org: 'altaire',
    role: 'member',
  };

  const newToken = await createAuthToken(userPayload);
  return { token: newToken, user: userPayload };
}