export type CompanyPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type CompanyStatus = 'active' | 'inactive' | 'suspended';

export interface ICompanySettings {
  logoUrl?: string;
  headerUrl?: string;
  footerUrl?: string;
}

export interface ICompany {
  _id: string;
  organizationId: string;
  name: string;
  slug: string;
  acronym: string;
  cnpj?: string;
  plan: CompanyPlan;
  storageUsed: number;
  settings?: ICompanySettings;
  status: CompanyStatus;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCompany {
  organizationId: string;
  name: string;
  slug: string;
  acronym: string;
  cnpj?: string;
  plan?: CompanyPlan;
  createdBy: string;
}

export interface IUpdateCompany {
  name?: string;
  acronym?: string;
  cnpj?: string;
  status?: CompanyStatus;
  plan?: CompanyPlan;
}
