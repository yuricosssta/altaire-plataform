import {
  ICreateEditorialTask,
  IEditorialTask,
  IUpdateEditorialTask,
} from '../schemas/models/editorial-task.interface';

export abstract class EditorialTaskRepository {
  abstract findAll(
    orgId: string,
    userId?: string,
    projectId?: string,
  ): Promise<IEditorialTask[]>;
  abstract findById(id: string): Promise<IEditorialTask | null>;
  abstract create(data: ICreateEditorialTask): Promise<IEditorialTask>;
  abstract update(
    id: string,
    data: IUpdateEditorialTask,
  ): Promise<IEditorialTask | null>;
  abstract softDelete(id: string): Promise<IEditorialTask | null>;
}
