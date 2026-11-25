export interface ICompanyFunction {
  _id: string;
  companyId: string;
  name: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCompanyFunction {
  companyId: string;
  name: string;
  description: string;
  createdBy: string;
}

export interface IUpdateCompanyFunction {
  name?: string;
  description?: string;
}
