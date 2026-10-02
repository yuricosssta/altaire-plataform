import { SignJWT } from 'jose';
import { jwtVerify } from 'jose';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';

function getInternalSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'fallback-dev-secret',
  );
}

const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  sub: string;
  email: string;
  name?: string;
  org?: string;
  role?: string;
  [key: string]: unknown;
}

export async function createAuthToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getInternalSecret());
}

export async function verifyInternalToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getInternalSecret(), {
      algorithms: ['HS256'],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeExternalToken(token: string): TokenPayload | null {
  try {
    const payload = decodeJwt(token);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthTokenFromRequest(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth_token')?.value;
  if (cookie) return cookie;

  return null;
}

export async function getBffAuthHeaderForProxy(request: Request): Promise<string | null> {
  const token = await getAuthTokenFromRequest(request);
  return token ? `Bearer ${token}` : null;
}