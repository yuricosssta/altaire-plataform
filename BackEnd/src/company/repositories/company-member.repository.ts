import {
  ICompanyMember,
  ICompanyMemberView,
  ICreateCompanyMember,
  IUpdateCompanyMember,
} from '../schemas/models/company-member.interface';

export abstract class CompanyMemberRepository {
  abstract findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<ICompanyMember | null>;
  abstract findActiveByUser(userId: string): Promise<ICompanyMember[]>;
  abstract findAllPopulatedByCompany(
    companyId: string,
  ): Promise<ICompanyMemberView[]>;
  abstract upsertActive(data: ICreateCompanyMember): Promise<ICompanyMember>;
  abstract update(
    companyId: string,
    userId: string,
    data: IUpdateCompanyMember,
  ): Promise<ICompanyMember | null>;
  abstract softDelete(
    companyId: string,
    userId: string,
  ): Promise<ICompanyMember | null>;
  abstract countActiveByFunction(
    companyId: string,
    functionId: string,
  ): Promise<number>;
}
