import {
  ICreateEditorialScriptVersion,
  IEditorialScriptVersion,
} from '../schemas/models/editorial-script.interface';

export abstract class EditorialScriptVersionRepository {
  abstract findAllByScriptId(
    scriptId: string,
  ): Promise<IEditorialScriptVersion[]>;
  abstract findMaxVersionNumber(scriptId: string): Promise<number>;
  abstract create(
    data: ICreateEditorialScriptVersion,
  ): Promise<IEditorialScriptVersion>;
}
