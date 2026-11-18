import {
  ICreateEditorialActivityLog,
  IEditorialActivityLog,
} from '../schemas/models/editorial-activity.interface';

export abstract class EditorialActivityRepository {
  abstract findRecent(
    orgId: string,
    userId?: string,
    projectId?: string,
    limit?: number,
  ): Promise<IEditorialActivityLog[]>;
  abstract create(
    data: ICreateEditorialActivityLog,
  ): Promise<IEditorialActivityLog>;
}
