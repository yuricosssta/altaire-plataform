import {
  ICompanyFunction,
  ICreateCompanyFunction,
  IUpdateCompanyFunction,
} from '../schemas/models/company-function.interface';

export abstract class CompanyFunctionRepository {
  abstract findAllByCompany(companyId: string): Promise<ICompanyFunction[]>;
  abstract findById(id: string): Promise<ICompanyFunction | null>;
  abstract create(data: ICreateCompanyFunction): Promise<ICompanyFunction>;
  abstract update(
    id: string,
    data: IUpdateCompanyFunction,
  ): Promise<ICompanyFunction | null>;
  abstract softDelete(id: string): Promise<ICompanyFunction | null>;
}
