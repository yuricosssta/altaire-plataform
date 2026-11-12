import crypto from 'crypto';
import {
  getAuthApiUrl,
  getBackendApiUrl,
  getCazuaClientCredentials,
  getCazuaClientHeaders,
} from '@/lib/api/serverUtils';
import {
  createAuthToken,
  decodeExternalToken,
  type TokenPayload,
} from '@/lib/auth/token.service';

export type AltaireUserRole = 'owner' | 'admin' | 'member';

export interface ProvisionedUser {
  id: string;
  email: string;
  fullName: string;
  role: AltaireUserRole;
  avatarUrl?: string;
  isNewUser: boolean;
}

interface CazuaProfilePayload {
  sub?: string;
  name?: string;
  email?: string;
  isSuperAdmin?: boolean;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
}

interface CazuaAuthResponse {
  access_token?: string;
  token?: string;
  linked?: boolean;
  user?: {
    _id?: string;
    id?: string;
    sub?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  message?: string | string[];
  error?: string;
}

function isValidMongoObjectId(id?: string | null): boolean {
  return Boolean(id && /^[a-f\d]{24}$/i.test(id.trim()));
}

function formatDefaultNameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function extractCazuaErrorMessage(
  body: CazuaAuthResponse | null | undefined,
  fallbackMessage: string,
): string {
  if (!body) return fallbackMessage;
  if (Array.isArray(body.message) && body.message.length > 0) {
    return String(body.message[0]);
  }
  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }
  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error.trim();
  }
  return fallbackMessage;
}

/**
 * Valida o token emitido pelo Cazuá consultando `GET /auth/profile`
 * conforme a arquitetura recomendada no Guia de Integração do Cazuá.
 */
export async function fetchCazuaProfile(
  accessToken: string,
): Promise<CazuaProfilePayload> {
  const authUrl = getAuthApiUrl();

  try {
    const res = await fetch(`${authUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const profile = (await res.json()) as CazuaProfilePayload;
      if (profile && (profile.sub || profile.email)) {
        return profile;
      }
    } else if (res.status === 401 || res.status === 403) {
      throw new AuthBackendError(
        'Sessão recusada ao validar o perfil na API do Cazuá.',
        res.status,
      );
    }
  } catch (err) {
    if (err instanceof AuthBackendError) {
      throw err;
    }
    console.warn('[userProvision] Fallback decodeExternalToken para /auth/profile:', err);
  }

  const decoded: TokenPayload | null = decodeExternalToken(accessToken);
  if (!decoded) {
    throw new AuthBackendError('Token retornado pelo Cazuá é inválido.', 401);
  }

  return {
    sub: decoded.sub,
    name: decoded.name,
    email: decoded.email,
    isSuperAdmin: Boolean(decoded.isSuperAdmin),
  };
}

/**
 * Sincroniza o usuário autenticado no Cazuá com o banco MongoDB local do Altaire
 * para manter a integridade de `OrganizationMember` e `EditorialProject`.
 */
async function syncCazuaUserWithAltaireBackend(params: {
  cazuaSub?: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isNewUser: boolean;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim() || formatDefaultNameFromEmail(email);
  const role = resolveAltaireRoleByEmail(email);
  const backendUrl = getBackendApiUrl();
  const fallbackId = isValidMongoObjectId(params.cazuaSub)
    ? String(params.cazuaSub).trim()
    : deterministicObjectIdFromEmail(email);

  try {
    const res = await fetch(`${backendUrl}/users/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: fullName,
        avatarUrl: params.avatarUrl || undefined,
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const localUser = (await res.json()) as {
        _id?: string;
        id?: string;
        email?: string;
        name?: string;
        avatarUrl?: string;
      };
      const localId = String(localUser?._id || localUser?.id || '');
      if (isValidMongoObjectId(localId)) {
        return {
          id: localId,
          email: localUser.email || email,
          fullName: localUser.name || fullName,
          role,
          avatarUrl: localUser.avatarUrl || params.avatarUrl,
          isNewUser: params.isNewUser,
        };
      }
    }
  } catch (err) {
    console.warn(
      '[userProvision] BackEnd local indisponível durante sync Cazuá; usando ID do Cazuá:',
      err,
    );
  }

  return {
    id: fallbackId,
    email,
    fullName,
    role,
    avatarUrl: params.avatarUrl,
    isNewUser: params.isNewUser,
  };
}

function parseEmailList(envValue?: string): string[] {
  if (!envValue) return [];
  return envValue
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolve o papel do usuário na organização padrão "Altaire" a partir das variáveis de ambiente:
 * - ALTAIRE_OWNER_EMAILS -> 'owner'
 * - ALTAIRE_ADMIN_EMAILS -> 'admin'
 * - Demais usuários -> 'member' (isolado por padrão)
 */
export function resolveAltaireRoleByEmail(email?: string | null): AltaireUserRole {
  if (!email) return 'member';
  const normalized = email.trim().toLowerCase();

  const ownerEmails = new Set(parseEmailList(process.env.ALTAIRE_OWNER_EMAILS));
  if (ownerEmails.has(normalized)) return 'owner';

  const adminEmails = new Set(parseEmailList(process.env.ALTAIRE_ADMIN_EMAILS));
  if (adminEmails.has(normalized)) return 'admin';

  return 'member';
}

export class AuthBackendError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthBackendError';
    this.statusCode = statusCode;
  }
}

/**
 * Gera um ObjectId determinístico (24 hex chars) a partir do e-mail
 * como fallback seguro caso o BackEnd esteja temporariamente indisponível.
 */
export function deterministicObjectIdFromEmail(email: string): string {
  return crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

/**
 * Autentica um usuário existente com e-mail e senha na API externa do Cazuá (`POST /auth/login`),
 * valida o token consultando `GET /auth/profile` e sincroniza o registro no MongoDB local do Altaire.
 */
export async function authenticateBackendUser(params: {
  email: string;
  password: string;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const authUrl = getAuthApiUrl();

  const res = await fetch(`${authUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCazuaClientHeaders(),
    },
    body: JSON.stringify({
      email,
      password: params.password,
    }),
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as CazuaAuthResponse;

  if (!res.ok) {
    const defaultMsg =
      res.status === 429
        ? 'Muitas tentativas de login. Aguarde alguns segundos e tente novamente.'
        : 'E-mail ou senha incorretos.';
    const msg = extractCazuaErrorMessage(body, defaultMsg);
    throw new AuthBackendError(msg, res.status);
  }

  const accessToken = body.access_token || body.token;
  if (!accessToken) {
    throw new AuthBackendError(
      'Token de acesso não retornado pela API do Cazuá.',
      502,
    );
  }

  const profile = await fetchCazuaProfile(accessToken);
  const cazuaSub = String(
    profile.sub || body.user?._id || body.user?.id || body.user?.sub || '',
  );
  const resolvedEmail = String(
    profile.email || body.user?.email || email,
  )
    .trim()
    .toLowerCase();
  const resolvedName = String(
    profile.name || body.user?.name || formatDefaultNameFromEmail(resolvedEmail),
  ).trim();

  return syncCazuaUserWithAltaireBackend({
    cazuaSub,
    email: resolvedEmail,
    fullName: resolvedName,
    avatarUrl: body.user?.avatarUrl,
    isNewUser: false,
  });
}

/**
 * Realiza o auto-cadastro de usuário na API externa do Cazuá (`POST /auth/register`)
 * utilizando as credenciais `x-client-id` e `x-client-secret`, valida via `GET /auth/profile`
 * e sincroniza o usuário no MongoDB local do Altaire.
 */
export async function registerBackendUser(params: {
  email: string;
  fullName: string;
  password: string;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim();
  const authUrl = getAuthApiUrl();
  const { orgId } = getCazuaClientCredentials();
  const clientHeaders = getCazuaClientHeaders();

  const registerPayload: Record<string, string> = {
    name: fullName,
    email,
    password: params.password,
  };
  if (orgId) {
    registerPayload.orgId = orgId;
  }

  const res = await fetch(`${authUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...clientHeaders,
    },
    body: JSON.stringify(registerPayload),
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as CazuaAuthResponse;

  if (!res.ok) {
    const defaultMsg =
      res.status === 409
        ? 'Este e-mail já está cadastrado com uma senha diferente.'
        : 'Não foi possível criar a conta.';
    const msg = extractCazuaErrorMessage(body, defaultMsg);
    throw new AuthBackendError(msg, res.status);
  }

  let accessToken = body.access_token || body.token || '';
  if (!accessToken) {
    try {
      const loginRes = await fetch(`${authUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...clientHeaders,
        },
        body: JSON.stringify({
          email,
          password: params.password,
        }),
        cache: 'no-store',
      });
      if (loginRes.ok) {
        const loginData = (await loginRes
          .json()
          .catch(() => ({}))) as CazuaAuthResponse;
        accessToken = loginData.access_token || loginData.token || '';
      }
    } catch {
      // Prossegue com os dados de `body.user` caso o login subsequente falhe
    }
  }

  let profile: CazuaProfilePayload | null = null;
  if (accessToken) {
    profile = await fetchCazuaProfile(accessToken);
  }

  const cazuaSub = String(
    profile?.sub || body.user?._id || body.user?.id || body.user?.sub || '',
  );
  const resolvedEmail = String(
    profile?.email || body.user?.email || email,
  )
    .trim()
    .toLowerCase();
  const resolvedName = String(
    profile?.name || body.user?.name || fullName,
  ).trim();

  return syncCazuaUserWithAltaireBackend({
    cazuaSub,
    email: resolvedEmail,
    fullName: resolvedName,
    avatarUrl: body.user?.avatarUrl,
    isNewUser: !body.linked,
  });
}

/**
 * Cria ou vincula automaticamente (Account Linking) um usuário autenticado via Google OAuth no MongoDB.
 */
export async function upsertOAuthBackendUser(params: {
  email: string;
  fullName?: string | null;
  googleId?: string;
  avatarUrl?: string | null;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const defaultName =
    params.fullName?.trim() ||
    email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  const backendUrl = getBackendApiUrl();
  const fallbackId = deterministicObjectIdFromEmail(email);
  const targetRole = resolveAltaireRoleByEmail(email);

  try {
    const res = await fetch(`${backendUrl}/users/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: defaultName,
        googleId: params.googleId,
        avatarUrl: params.avatarUrl || undefined,
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const user = (await res.json()) as {
        _id?: string;
        id?: string;
        email?: string;
        name?: string;
        avatarUrl?: string;
      };
      if (user && (user._id || user.id)) {
        return {
          id: String(user._id || user.id),
          email: user.email || email,
          fullName: user.name || defaultName,
          role: targetRole,
          avatarUrl: user.avatarUrl,
          isNewUser: false,
        };
      }
    }
  } catch (err) {
    console.warn('[userProvision] Fallback OAuth para ID determinístico:', err);
  }

  return {
    id: fallbackId,
    email,
    fullName: defaultName,
    role: targetRole,
    avatarUrl: params.avatarUrl || undefined,
    isNewUser: false,
  };
}

/**
 * Busca o usuário no BackEnd NestJS (MongoDB) pelo e-mail.
 * Se não existir e `createIfMissing` for true, cria o usuário real via `POST /users`.
 */
export async function findOrCreateBackendUser(params: {
  email: string;
  fullName?: string;
  password?: string;
  createIfMissing?: boolean;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const targetRole = resolveAltaireRoleByEmail(email);
  const defaultName =
    params.fullName?.trim() ||
    email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  const backendUrl = getBackendApiUrl();
  const fallbackId = deterministicObjectIdFromEmail(email);

  try {
    // Token bootstrap assinado com JWT_SECRET para consultar /users/search (protegido por AuthGuard)
    const bootstrapToken = await createAuthToken({
      sub: fallbackId,
      email,
      name: defaultName,
      org: 'altaire',
      role: targetRole,
    });

    const searchRes = await fetch(
      `${backendUrl}/users/search?term=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bootstrapToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (searchRes.ok) {
      const users = (await searchRes.json()) as Array<{
        _id?: string;
        id?: string;
        email?: string;
        name?: string;
      }>;
      const existing = Array.isArray(users)
        ? users.find((u) => u.email?.toLowerCase() === email)
        : undefined;

      if (existing && (existing._id || existing.id)) {
        return {
          id: String(existing._id || existing.id),
          email: existing.email || email,
          fullName: existing.name || defaultName,
          role: targetRole,
          isNewUser: false,
        };
      }
    }

    if (params.createIfMissing === false) {
      return {
        id: fallbackId,
        email,
        fullName: defaultName,
        role: targetRole,
        isNewUser: true,
      };
    }

    const safePassword =
      params.password && params.password.length >= 8
        ? params.password
        : 'AltairePass123!';

    const createRes = await fetch(`${backendUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: defaultName,
        password: safePassword,
        role: targetRole.toUpperCase(),
      }),
      cache: 'no-store',
    });

    if (createRes.ok) {
      const created = (await createRes.json()) as {
        _id?: string;
        id?: string;
        email?: string;
        name?: string;
      };
      if (created && (created._id || created.id)) {
        return {
          id: String(created._id || created.id),
          email: created.email || email,
          fullName: created.name || defaultName,
          role: targetRole,
          isNewUser: true,
        };
      }
    }
  } catch (err) {
    console.warn('[userProvision] Fallback para ID determinístico:', err);
  }

  return {
    id: fallbackId,
    email,
    fullName: defaultName,
    role: targetRole,
    isNewUser: true,
  };
}

/**
 * Lista os projetos editoriais pertencentes ao usuário autenticado.
 */
export async function fetchUserEditorialProjects(
  token: string,
  userId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    niche: string;
    createdAt: string;
    updatedAt: string;
  }>
> {
  const backendUrl = getBackendApiUrl();
  try {
    const res = await fetch(`${backendUrl}/editorial/projects`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-org-id': 'altaire',
        'x-org-role': 'member',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const rawProjects = (await res.json()) as Array<Record<string, any>>;
    if (!Array.isArray(rawProjects)) return [];

    return rawProjects
      .filter((p) => !p.createdBy || String(p.createdBy) === String(userId))
      .map((p) => ({
        id: String(p.id || p._id),
        name: String(p.name || 'Projeto Editorial'),
        niche: String(p.niche || ''),
        createdAt: p.createdAt
          ? new Date(p.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: p.updatedAt
          ? new Date(p.updatedAt).toISOString()
          : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

