import crypto from 'crypto';
import { getBackendApiUrl } from '@/lib/api/serverUtils';
import { createAuthToken } from '@/lib/auth/token.service';

export type AltaireUserRole = 'owner' | 'admin' | 'member';

export interface ProvisionedUser {
  id: string;
  email: string;
  fullName: string;
  role: AltaireUserRole;
  avatarUrl?: string;
  isNewUser: boolean;
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
 * Autentica um usuário existente com e-mail e senha validando o hash bcrypt no BackEnd NestJS.
 */
export async function authenticateBackendUser(params: {
  email: string;
  password: string;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const backendUrl = getBackendApiUrl();

  const res = await fetch(`${backendUrl}/users/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: params.password,
    }),
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as {
    _id?: string;
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
    message?: string | string[];
  };

  if (!res.ok) {
    const msg = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message || 'E-mail ou senha incorretos.';
    throw new AuthBackendError(msg, res.status);
  }

  return {
    id: String(body._id || body.id || deterministicObjectIdFromEmail(email)),
    email: body.email || email,
    fullName: body.name || email.split('@')[0],
    role: resolveAltaireRoleByEmail(body.email || email),
    avatarUrl: body.avatarUrl,
    isNewUser: false,
  };
}

/**
 * Registra um novo usuário com e-mail e senha (hash bcrypt) no BackEnd NestJS.
 */
export async function registerBackendUser(params: {
  email: string;
  fullName: string;
  password: string;
}): Promise<ProvisionedUser> {
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim();
  const backendUrl = getBackendApiUrl();
  const targetRole = resolveAltaireRoleByEmail(email);

  const res = await fetch(`${backendUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      name: fullName,
      password: params.password,
      role: targetRole.toUpperCase(),
    }),
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as {
    _id?: string;
    id?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    message?: string | string[];
  };

  if (!res.ok) {
    const msg = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message || 'Não foi possível criar a conta.';
    throw new AuthBackendError(msg, res.status);
  }

  return {
    id: String(body._id || body.id || deterministicObjectIdFromEmail(email)),
    email: body.email || email,
    fullName: body.name || fullName,
    role: targetRole,
    avatarUrl: body.avatarUrl,
    isNewUser: true,
  };
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

