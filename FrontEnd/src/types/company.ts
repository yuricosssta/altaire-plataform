import { PlanType, RoleType } from './organization';

export interface ICompanySettings {
  logoUrl?: string;
  headerUrl?: string;
  footerUrl?: string;
}

export interface ICompany {
  _id: string;
  id?: string;
  organizationId: string;
  name: string;
  slug: string;
  acronym: string;
  cnpj?: string;
  plan: PlanType;
  storageUsed: number;
  settings?: ICompanySettings;
  status: 'active' | 'inactive' | 'suspended';
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICompanyMembershipSummary {
  functionId: string | null;
  brandIds: string[];
  allowedProjects: string[];
  permissions: string[];
}

export interface ICompanyWithAccess extends ICompany {
  isCompanyManager: boolean;
  membership?: ICompanyMembershipSummary | null;
}

export interface ICompanyFunction {
  _id: string;
  companyId: string;
  name: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICompanyMember {
  _id: string;
  name: string;
  email: string;
  role: RoleType;
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

export interface IBrand {
  _id: string;
  id?: string;
  organizationId: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  niche?: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUsableStory {
  title: string;
  content: string;
  tags: string[];
}

export interface IBrandStory {
  _id?: string;
  id?: string;
  organizationId: string;
  companyId: string;
  brandId: string;
  userId?: string;
  originStory: string;
  keyTurnarounds: string[];
  failures: string[];
  achievements: string[];
  values: string[];
  lifestyle: string;
  usableStories: IUsableStory[];
  createdAt?: string;
  updatedAt?: string;
}
