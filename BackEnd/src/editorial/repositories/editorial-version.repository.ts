import {
  IEditorialVersion,
  ICreateEditorialVersion,
  IUpdateEditorialVersion,
} from '../schemas/models/editorial-version.interface';

export abstract class EditorialVersionRepository {
  abstract findAllByProject(projectId: string): Promise<IEditorialVersion[]>;
  abstract findById(id: string): Promise<IEditorialVersion | null>;
  abstract findMaxVersionNumber(projectId: string): Promise<number>;
  abstract create(data: ICreateEditorialVersion): Promise<IEditorialVersion>;
  abstract update(
    id: string,
    data: IUpdateEditorialVersion,
  ): Promise<IEditorialVersion | null>;
  abstract softDelete(id: string): Promise<IEditorialVersion | null>;
}
