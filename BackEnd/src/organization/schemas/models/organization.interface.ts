//src/organization/schemas/models/organization.interface.ts
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type RoleType = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT' | 'EXTERNAL';

export interface IOrganization {
  _id: string;
  name: string;
  acronym: string;
  slug: string;
  plan: PlanType;
  status: 'active' | 'inactive' | 'suspended';
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembership {
  _id: string;
  organizationId: IOrganization;
  userId: string;
  role: RoleType;
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
  functionId?: string | null;
  customFunction?: {
    _id: string;
    name: string;
    description: string;
  } | null;
  createdAt?: string;
}

// Utilitários para a UI
export const RoleLabels: Record<RoleType, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
  CLIENT: 'Cliente',
  EXTERNAL: 'Membro Externo',
};

export const PlanLabels: Record<PlanType, string> = {
  FREE: 'Plano Gratuito',
  PRO: 'Plano PRO',
  ENTERPRISE: 'Plano Enterprise',
};
