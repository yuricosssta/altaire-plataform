import {
  IEditorialProject,
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../schemas/models/editorial-project.interface';

export interface IEditorialProjectFilter {
  companyId: string;
  brandIds?: string[];
  allowedProjectIds?: string[];
}

export abstract class EditorialProjectRepository {
  abstract findAll(
    filter: IEditorialProjectFilter,
  ): Promise<IEditorialProject[]>;
  abstract findById(id: string): Promise<IEditorialProject | null>;
  abstract countActiveByBrandId(brandId: string): Promise<number>;
  abstract findBrandIdsByProjectIds(
    companyId: string,
    projectIds: string[],
  ): Promise<string[]>;
  abstract create(data: ICreateEditorialProject): Promise<IEditorialProject>;
  abstract update(
    id: string,
    data: IUpdateEditorialProject,
  ): Promise<IEditorialProject | null>;
  abstract softDelete(id: string): Promise<IEditorialProject | null>;
}
