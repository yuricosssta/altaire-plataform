import {
  ICreateEditorialScript,
  IEditorialScript,
  IScriptAttachment,
  IScriptFilters,
  IUpdateEditorialScript,
} from '../schemas/models/editorial-script.interface';

export abstract class EditorialScriptRepository {
  abstract findAllByProject(
    projectId: string,
    filters?: IScriptFilters,
  ): Promise<IEditorialScript[]>;
  abstract findById(id: string): Promise<IEditorialScript | null>;
  abstract create(data: ICreateEditorialScript): Promise<IEditorialScript>;
  abstract update(
    id: string,
    data: IUpdateEditorialScript,
  ): Promise<IEditorialScript | null>;
  abstract softDelete(id: string): Promise<IEditorialScript | null>;
  abstract addAttachment(
    scriptId: string,
    attachment: IScriptAttachment,
  ): Promise<IScriptAttachment | null>;
  abstract removeAttachment(
    scriptId: string,
    attachmentId: string,
  ): Promise<boolean>;
  abstract countByThemeId(themeId: string): Promise<number>;
}
