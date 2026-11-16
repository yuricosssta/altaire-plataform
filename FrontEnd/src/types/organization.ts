// src/types/organization.ts

// Tipagens Rígidas (Single Source of Truth)
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type RoleType = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT' | 'EXTERNAL';

export interface IOrgSettings {
  logoUrl?: string;
  headerUrl?: string;
  footerUrl?: string;
}

export interface IOrganization {
  _id: string;
  id?: string; // Alias para _id, caso seja necessário
  name: string;
  acronym?: string;
  slug: string;
  plan: PlanType;
  status: 'active' | 'inactive' | 'suspended';
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  settings?: IOrgSettings;
}

export interface IOrganizationFunction {
  _id: string;
  organizationId: string;
  name: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustomFunctionSummary {
  _id: string;
  name: string;
  description: string;
}

// O Vínculo do Usuário com a Empresa (É isso que a API retorna na listagem)
export interface IMembership {
  _id: string;
  organizationId: IOrganization; // O NestJS faz o populate deste objeto
  userId: string;
  role: RoleType;
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
  functionId?: string | null;
  customFunction?: ICustomFunctionSummary | null;
  createdAt?: string;
}

// Utilitários para a UI
export const RoleLabels: Record<RoleType, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
  CLIENT: 'Cliente',
  EXTERNAL: 'Membro Externo'
};

export const PlanLabels: Record<PlanType, string> = {
  FREE: 'Plano Gratuito',
  PRO: 'Plano PRO',
  ENTERPRISE: 'Plano Enterprise'
};