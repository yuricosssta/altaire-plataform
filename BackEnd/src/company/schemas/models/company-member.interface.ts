import { AltaireOrgRole } from '../../../shared/utils/org-role.util';

export interface ICompanyMember {
  _id: string;
  companyId: string;
  userId: string;
  functionId?: string | null;
  brandIds: string[];
  allowedProjects: string[];
  permissions: string[];
  invitedBy?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICompanyMemberView {
  _id: string;
  name: string;
  email: string;
  role: AltaireOrgRole;
  membership: {
    companyId: string;
    functionId: string | null;
    customFunction: {
      _id: string;
      name: string;
      description: string;
    } | null;
    brandIds: string[];
    allowedProjects: string[];
    permissions: string[];
    invitedBy?: string;
  };
}

export interface ICreateCompanyMember {
  companyId: string;
  userId: string;
  functionId?: string | null;
  brandIds?: string[];
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
}

export interface IUpdateCompanyMember {
  functionId?: string | null;
  brandIds?: string[];
  allowedProjects?: string[];
  permissions?: string[];
}

export interface ICompanyContext {
  companyId: string;
  organizationId: string;
  userId: string;
  userRole: AltaireOrgRole;
  isAltaireAdmin: boolean;
  isCompanyCreator: boolean;
  isCompanyManager: boolean;
  /** null significa acesso irrestrito a todas as marcas da empresa */
  allowedBrandIds: string[] | null;
  /** null significa acesso irrestrito aos projetos (sujeito a allowedBrandIds quando MEMBER convidado) */
  allowedProjectIds: string[] | null;
}
