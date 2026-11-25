import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandRepository } from '../brand.repository';
import {
  IBrand,
  ICreateBrand,
  IUpdateBrand,
} from '../../schemas/models/brand.interface';
import { Brand, BrandDocument } from '../../schemas/brand.schema';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeBrand(doc: any): IBrand {
  return {
    ...doc,
    _id: String(doc._id),
    organizationId: String(doc.organizationId),
    companyId: String(doc.companyId),
    createdBy: String(doc.createdBy),
  } as IBrand;
}

@Injectable()
export class BrandMongooseRepository implements BrandRepository {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async findAllByCompany(
    companyId: string,
    allowedBrandIds?: string[] | null,
  ): Promise<IBrand[]> {
    if (!(Types.ObjectId as any).isValid(companyId)) return [];

    const query: Record<string, any> = {
      companyId: toObjId(companyId),
      isActive: { $ne: false },
    };

    if (Array.isArray(allowedBrandIds)) {
      const validIds = allowedBrandIds
        .filter((id) => (Types.ObjectId as any).isValid(id))
        .map(toObjId);
      if (validIds.length === 0) return [];
      query._id = { $in: validIds };
    }

    const docs = await this.brandModel
      .find(query)
      .sort({ name: 1, createdAt: -1 })
      .lean()
      .exec();
    return docs.map(normalizeBrand);
  }

  async findById(id: string): Promise<IBrand | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const doc = await this.brandModel
      .findOne({ _id: toObjId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return doc ? normalizeBrand(doc) : null;
  }

  async findByIdsInCompany(
    companyId: string,
    ids: string[],
  ): Promise<IBrand[]> {
    if (!(Types.ObjectId as any).isValid(companyId)) return [];
    const validIds = ids
      .filter((id) => (Types.ObjectId as any).isValid(id))
      .map(toObjId);
    if (validIds.length === 0) return [];

    const docs = await this.brandModel
      .find({
        companyId: toObjId(companyId),
        _id: { $in: validIds },
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return docs.map(normalizeBrand);
  }

  async findBySlugInCompany(
    companyId: string,
    slug: string,
  ): Promise<IBrand | null> {
    if (!(Types.ObjectId as any).isValid(companyId)) return null;
    const doc = await this.brandModel
      .findOne({
        companyId: toObjId(companyId),
        slug: slug.trim().toLowerCase(),
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return doc ? normalizeBrand(doc) : null;
  }

  async countActiveByCompanyId(companyId: string): Promise<number> {
    if (!(Types.ObjectId as any).isValid(companyId)) return 0;
    return this.brandModel
      .countDocuments({
        companyId: toObjId(companyId),
        isActive: { $ne: false },
      })
      .exec();
  }

  async create(data: ICreateBrand): Promise<IBrand> {
    const doc = new this.brandModel({
      organizationId: toObjId(data.organizationId),
      companyId: toObjId(data.companyId),
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      ...(data.description !== undefined
        ? { description: data.description.trim() }
        : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl.trim() } : {}),
      ...(data.niche !== undefined ? { niche: data.niche.trim() } : {}),
      createdBy: toObjId(data.createdBy),
      isActive: true,
    });
    const saved = await doc.save();
    return normalizeBrand(saved.toObject());
  }

  async update(id: string, data: IUpdateBrand): Promise<IBrand | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set.name = data.name.trim();
    if (data.description !== undefined)
      set.description = data.description.trim();
    if (data.logoUrl !== undefined) set.logoUrl = data.logoUrl.trim();
    if (data.niche !== undefined) set.niche = data.niche.trim();

    const updated = await this.brandModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeBrand(updated) : null;
  }

  async softDelete(id: string): Promise<IBrand | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.brandModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted ? normalizeBrand(deleted) : null;
  }
}
