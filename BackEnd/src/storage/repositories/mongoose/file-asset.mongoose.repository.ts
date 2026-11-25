import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileAssetRepository } from '../file-asset.repository';
import {
  ICreateFileAsset,
  IFileAsset,
  IFileAssetFilter,
} from '../../schemas/models/file-asset.interface';
import { FileAsset, FileAssetDocument } from '../../schemas/file-asset.schema';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeAsset(doc: any): IFileAsset {
  return {
    ...doc,
    _id: String(doc._id),
    organizationId: String(doc.organizationId),
    companyId: String(doc.companyId),
    brandId: doc.brandId ? String(doc.brandId) : null,
    uploadedBy: String(doc.uploadedBy),
  } as IFileAsset;
}

@Injectable()
export class FileAssetMongooseRepository implements FileAssetRepository {
  constructor(
    @InjectModel(FileAsset.name)
    private readonly fileAssetModel: Model<FileAssetDocument>,
  ) {}

  async create(data: ICreateFileAsset): Promise<IFileAsset> {
    const doc = new this.fileAssetModel({
      organizationId: toObjId(data.organizationId),
      companyId: toObjId(data.companyId),
      brandId:
        data.brandId && (Types.ObjectId as any).isValid(data.brandId)
          ? toObjId(data.brandId)
          : null,
      uploadedBy: toObjId(data.uploadedBy),
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
    });
    const saved = await doc.save();
    return normalizeAsset(saved.toObject());
  }

  async findAll(filter: IFileAssetFilter): Promise<IFileAsset[]> {
    if (!(Types.ObjectId as any).isValid(filter.companyId)) return [];

    const query: Record<string, any> = {
      companyId: toObjId(filter.companyId),
    };

    if (filter.brandId === null) {
      query.brandId = null;
    } else if (
      filter.brandId &&
      (Types.ObjectId as any).isValid(filter.brandId)
    ) {
      query.brandId = toObjId(filter.brandId);
    } else if (Array.isArray(filter.allowedBrandIds)) {
      const validBrandIds = filter.allowedBrandIds
        .filter((id) => (Types.ObjectId as any).isValid(id))
        .map(toObjId);

      if (filter.includeGeneral) {
        query.$or =
          validBrandIds.length > 0
            ? [{ brandId: null }, { brandId: { $in: validBrandIds } }]
            : [{ brandId: null }];
      } else if (validBrandIds.length > 0) {
        query.brandId = { $in: validBrandIds };
      } else {
        return [];
      }
    }

    const docs = await this.fileAssetModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map(normalizeAsset);
  }

  async findByIdInCompany(
    companyId: string,
    assetId: string,
  ): Promise<IFileAsset | null> {
    if (
      !(Types.ObjectId as any).isValid(companyId) ||
      !(Types.ObjectId as any).isValid(assetId)
    ) {
      return null;
    }

    const doc = await this.fileAssetModel
      .findOne({
        _id: toObjId(assetId),
        companyId: toObjId(companyId),
      })
      .lean()
      .exec();
    return doc ? normalizeAsset(doc) : null;
  }

  async deleteById(assetId: string): Promise<boolean> {
    if (!(Types.ObjectId as any).isValid(assetId)) return false;
    const deleted = await this.fileAssetModel
      .findByIdAndDelete(toObjId(assetId))
      .exec();
    return Boolean(deleted);
  }
}
