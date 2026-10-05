import {
  IEditorialMapa,
  ICreateEditorialMapa,
} from '../schemas/models/editorial-mapa.interface';

export abstract class EditorialMapaRepository {
  abstract findByVersionId(versionId: string): Promise<IEditorialMapa | null>;
  abstract create(data: ICreateEditorialMapa): Promise<IEditorialMapa>;
  abstract deleteByVersionId(versionId: string): Promise<void>;
}
