import {
  createAuthToken,
  verifyInternalToken,
  type TokenPayload,
} from '@/lib/auth/token.service';
import {
  authenticateBackendUser,
  registerBackendUser,
  resolveAltaireRoleByEmail,
} from '@/lib/auth/userProvision';

export async function proxyAuthLogin(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: TokenPayload }> {
  const provisioned = await authenticateBackendUser({
    email: credentials.email,
    password: credentials.password,
  });

  const userPayload: TokenPayload = {
    sub: provisioned.id,
    email: provisioned.email,
    name: provisioned.fullName,
    org: 'altaire',
    role: provisioned.role,
  };

  const internalToken = await createAuthToken(userPayload);
  return { token: internalToken, user: userPayload };
}

export async function proxyAuthSignup(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ token: string; user: TokenPayload }> {
  const provisioned = await registerBackendUser({
    email: data.email,
    fullName: data.name || data.email.split('@')[0],
    password: data.password,
  });

  const userPayload: TokenPayload = {
    sub: provisioned.id,
    email: provisioned.email,
    name: provisioned.fullName,
    org: 'altaire',
    role: provisioned.role,
  };

  const internalToken = await createAuthToken(userPayload);
  return { token: internalToken, user: userPayload };
}

export async function proxyAuthRefresh(
  currentInternalToken: string,
): Promise<{ token: string; user: TokenPayload }> {
  const payload = await verifyInternalToken(currentInternalToken);
  if (!payload) {
    throw new Error('Token inválido ou expirado');
  }

  const userPayload: TokenPayload = {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    org: 'altaire',
    role: payload.role || resolveAltaireRoleByEmail(payload.email),
  };

  const newToken = await createAuthToken(userPayload);
  return { token: newToken, user: userPayload };
}