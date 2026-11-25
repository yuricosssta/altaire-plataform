import {
  IBrand,
  ICreateBrand,
  IUpdateBrand,
} from '../schemas/models/brand.interface';

export abstract class BrandRepository {
  abstract findAllByCompany(
    companyId: string,
    allowedBrandIds?: string[] | null,
  ): Promise<IBrand[]>;
  abstract findById(id: string): Promise<IBrand | null>;
  abstract findByIdsInCompany(
    companyId: string,
    ids: string[],
  ): Promise<IBrand[]>;
  abstract findBySlugInCompany(
    companyId: string,
    slug: string,
  ): Promise<IBrand | null>;
  abstract countActiveByCompanyId(companyId: string): Promise<number>;
  abstract create(data: ICreateBrand): Promise<IBrand>;
  abstract update(id: string, data: IUpdateBrand): Promise<IBrand | null>;
  abstract softDelete(id: string): Promise<IBrand | null>;
}
