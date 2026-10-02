import {
  IEditorialProject,
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../schemas/models/editorial-project.interface';

export abstract class EditorialProjectRepository {
  abstract findAll(orgId: string): Promise<IEditorialProject[]>;
  abstract findById(id: string): Promise<IEditorialProject | null>;
  abstract create(data: ICreateEditorialProject): Promise<IEditorialProject>;
  abstract update(
    id: string,
    data: IUpdateEditorialProject,
  ): Promise<IEditorialProject | null>;
  abstract softDelete(id: string): Promise<IEditorialProject | null>;
}
