import {
  ICreateFileAsset,
  IFileAsset,
  IFileAssetFilter,
  IUpdateFileAsset,
} from '../schemas/models/file-asset.interface';

export abstract class FileAssetRepository {
  abstract create(data: ICreateFileAsset): Promise<IFileAsset>;
  abstract findAll(filter: IFileAssetFilter): Promise<IFileAsset[]>;
  abstract findByIdInCompany(
    companyId: string,
    assetId: string,
  ): Promise<IFileAsset | null>;
  abstract updateByIdInCompany(
    companyId: string,
    assetId: string,
    data: IUpdateFileAsset,
  ): Promise<IFileAsset | null>;
  abstract deleteById(assetId: string): Promise<boolean>;
}
