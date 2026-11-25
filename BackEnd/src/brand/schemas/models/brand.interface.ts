export interface IBrand {
  _id: string;
  organizationId: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  niche?: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateBrand {
  organizationId: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  niche?: string;
  createdBy: string;
}

export interface IUpdateBrand {
  name?: string;
  description?: string;
  logoUrl?: string;
  niche?: string;
}
