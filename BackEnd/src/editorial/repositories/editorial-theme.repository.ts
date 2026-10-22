import {
  IEditorialTheme,
  ICreateEditorialTheme,
  IThemeFilters,
  IUpdateEditorialTheme,
  ThemeStatus,
} from '../schemas/models/editorial-theme.interface';

export abstract class EditorialThemeRepository {
  abstract findAllByProject(
    projectId: string,
    filters?: IThemeFilters,
  ): Promise<IEditorialTheme[]>;
  abstract findById(id: string): Promise<IEditorialTheme | null>;
  abstract findByIds(ids: string[]): Promise<IEditorialTheme[]>;
  abstract createMany(
    data: ICreateEditorialTheme[],
  ): Promise<IEditorialTheme[]>;
  abstract update(
    id: string,
    data: IUpdateEditorialTheme,
  ): Promise<IEditorialTheme | null>;
  abstract bulkUpdateStatus(
    projectId: string,
    ids: string[],
    status: ThemeStatus,
  ): Promise<number>;
  abstract softDelete(id: string): Promise<IEditorialTheme | null>;
}
