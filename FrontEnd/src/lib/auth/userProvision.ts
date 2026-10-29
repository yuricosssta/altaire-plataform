import crypto from 'crypto';
import { getBackendApiUrl } from '@/lib/api/serverUtils';
import { createAuthToken } from '@/lib/auth/token.service';

export interface ProvisionedUser {
  id: string;
  email: string;
  fullName: string;
  isNewUser: boolean;
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
      role: 'owner',
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
          isNewUser: false,
        };
      }
    }

    if (params.createIfMissing === false) {
      return {
        id: fallbackId,
        email,
        fullName: defaultName,
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
        role: 'OWNER',
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

