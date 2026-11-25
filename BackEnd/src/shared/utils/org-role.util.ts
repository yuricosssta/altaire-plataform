export const ALTAIRE_ORG_ROLES = [
  'OWNER',
  'ADMIN',
  'MEMBER',
  'CLIENT',
  'EXTERNAL',
] as const;

export type AltaireOrgRole = (typeof ALTAIRE_ORG_ROLES)[number];

function parseEmailList(envValue?: string): string[] {
  if (!envValue) return [];
  return envValue
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidAltaireOrgRole(
  role?: string | null,
): role is AltaireOrgRole {
  if (!role) return false;
  return (ALTAIRE_ORG_ROLES as readonly string[]).includes(
    role.trim().toUpperCase(),
  );
}

/**
 * Resolve o papel do usuário na organização padrão "Altaire":
 * - ALTAIRE_OWNER_EMAILS / SUPER_ADMIN_EMAIL -> 'OWNER'
 * - ALTAIRE_ADMIN_EMAILS -> 'ADMIN'
 * - Se não estiver no .env como OWNER/ADMIN, respeita o `persistedRole` salvo no banco
 *   (ex: 'CLIENT', 'EXTERNAL', 'MEMBER'), com fallback para 'MEMBER'.
 */
export function resolveAltaireRoleByEmail(
  email?: string | null,
  persistedRole?: string | null,
): AltaireOrgRole {
  if (email) {
    const normalized = email.trim().toLowerCase();

    const ownerEmails = new Set([
      ...parseEmailList(process.env.ALTAIRE_OWNER_EMAILS),
      ...parseEmailList(process.env.SUPER_ADMIN_EMAIL),
    ]);

    if (ownerEmails.has(normalized)) {
      return 'OWNER';
    }

    const adminEmails = new Set(
      parseEmailList(process.env.ALTAIRE_ADMIN_EMAILS),
    );
    if (adminEmails.has(normalized)) {
      return 'ADMIN';
    }
  }

  if (persistedRole && isValidAltaireOrgRole(persistedRole)) {
    const upper = persistedRole.trim().toUpperCase() as AltaireOrgRole;
    if (upper === 'CLIENT' || upper === 'EXTERNAL' || upper === 'MEMBER') {
      return upper;
    }
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

export function isClientOrExternalRole(roleClaim?: string | null): boolean {
  const upperRole = roleClaim?.toUpperCase();
  return upperRole === 'CLIENT' || upperRole === 'EXTERNAL';
}
