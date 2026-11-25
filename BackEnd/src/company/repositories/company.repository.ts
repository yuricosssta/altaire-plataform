import {
  CompanyPlan,
  ICompany,
  ICompanySettings,
  ICreateCompany,
  IUpdateCompany,
} from '../schemas/models/company.interface';

export abstract class CompanyRepository {
  abstract findById(id: string): Promise<ICompany | null>;
  abstract findBySlug(slug: string): Promise<ICompany | null>;
  abstract findAllActive(): Promise<ICompany[]>;
  abstract findByIds(ids: string[]): Promise<ICompany[]>;
  abstract create(data: ICreateCompany): Promise<ICompany>;
  abstract update(id: string, data: IUpdateCompany): Promise<ICompany | null>;
  abstract updateSettings(
    id: string,
    settings: ICompanySettings,
  ): Promise<ICompany | null>;
  abstract updatePlan(id: string, plan: CompanyPlan): Promise<ICompany | null>;
  abstract incrementStorageUsed(
    id: string,
    deltaBytes: number,
  ): Promise<ICompany | null>;
  abstract softDelete(id: string): Promise<ICompany | null>;
}
