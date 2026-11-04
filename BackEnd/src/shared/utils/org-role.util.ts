export type AltaireOrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

function parseEmailList(envValue?: string): string[] {
  if (!envValue) return [];
  return envValue
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolve o papel do usuário na organização padrão "Altaire" a partir das variáveis de ambiente:
 * - ALTAIRE_OWNER_EMAILS / SUPER_ADMIN_EMAIL -> 'OWNER'
 * - ALTAIRE_ADMIN_EMAILS -> 'ADMIN'
 * - Demais usuários -> 'MEMBER' (isolado)
 */
export function resolveAltaireRoleByEmail(email?: string | null): AltaireOrgRole {
  if (!email) return 'MEMBER';
  const normalized = email.trim().toLowerCase();

  const ownerEmails = new Set([
    ...parseEmailList(process.env.ALTAIRE_OWNER_EMAILS),
    ...parseEmailList(process.env.SUPER_ADMIN_EMAIL),
  ]);

  if (ownerEmails.has(normalized)) {
    return 'OWNER';
  }

  const adminEmails = new Set(parseEmailList(process.env.ALTAIRE_ADMIN_EMAILS));
  if (adminEmails.has(normalized)) {
    return 'ADMIN';
  }

  return 'MEMBER';
}

export function isAltaireOwnerOrAdmin(
  email?: string | null,
  roleClaim?: string | null,
): boolean {
  const byEmail = resolveAltaireRoleByEmail(email);
  if (byEmail === 'OWNER' || byEmail === 'ADMIN') return true;
  const upperRole = roleClaim?.toUpperCase();
  return upperRole === 'OWNER' || upperRole === 'ADMIN';
}

