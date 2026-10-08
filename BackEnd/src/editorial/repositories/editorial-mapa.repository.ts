import {
  IEditorialMapa,
  ICreateEditorialMapa,
  IUpdateEditorialMapa,
} from '../schemas/models/editorial-mapa.interface';

export abstract class EditorialMapaRepository {
  abstract findByVersionId(versionId: string): Promise<IEditorialMapa | null>;
  abstract create(data: ICreateEditorialMapa): Promise<IEditorialMapa>;
  abstract update(
    versionId: string,
    data: IUpdateEditorialMapa,
  ): Promise<IEditorialMapa | null>;
  abstract deleteByVersionId(versionId: string): Promise<void>;
}
