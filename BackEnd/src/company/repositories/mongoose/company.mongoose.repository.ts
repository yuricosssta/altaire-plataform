import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyRepository } from '../company.repository';
import {
  CompanyPlan,
  ICompany,
  ICompanySettings,
  ICreateCompany,
  IUpdateCompany,
} from '../../schemas/models/company.interface';
import { Company, CompanyDocument } from '../../schemas/company.schema';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeCompany(doc: any): ICompany {
  return {
    ...doc,
    _id: String(doc._id),
    organizationId: String(doc.organizationId),
    createdBy: String(doc.createdBy),
  } as ICompany;
}

@Injectable()
export class CompanyMongooseRepository implements CompanyRepository {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async findById(id: string): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const doc = await this.companyModel
      .findOne({ _id: toObjId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return doc ? normalizeCompany(doc) : null;
  }

  async findBySlug(slug: string): Promise<ICompany | null> {
    const doc = await this.companyModel
      .findOne({ slug: slug.trim().toLowerCase(), isActive: { $ne: false } })
      .lean()
      .exec();
    return doc ? normalizeCompany(doc) : null;
  }

  async findAllActive(): Promise<ICompany[]> {
    const docs = await this.companyModel
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map(normalizeCompany);
  }

  async findByIds(ids: string[]): Promise<ICompany[]> {
    const validIds = ids
      .filter((id) => (Types.ObjectId as any).isValid(id))
      .map(toObjId);
    if (validIds.length === 0) return [];

    const docs = await this.companyModel
      .find({ _id: { $in: validIds }, isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map(normalizeCompany);
  }

  async create(data: ICreateCompany): Promise<ICompany> {
    const doc = new this.companyModel({
      organizationId: toObjId(data.organizationId),
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      acronym: data.acronym.trim().toUpperCase(),
      ...(data.cnpj ? { cnpj: data.cnpj.trim() } : {}),
      plan: data.plan || 'FREE',
      createdBy: toObjId(data.createdBy),
      isActive: true,
    });
    const saved = await doc.save();
    return normalizeCompany(saved.toObject());
  }

  async update(id: string, data: IUpdateCompany): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set.name = data.name.trim();
    if (data.acronym !== undefined)
      set.acronym = data.acronym.trim().toUpperCase();
    if (data.cnpj !== undefined) set.cnpj = data.cnpj.trim();
    if (data.status !== undefined) set.status = data.status;
    if (data.plan !== undefined) set.plan = data.plan;

    const updated = await this.companyModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeCompany(updated) : null;
  }

  async updateSettings(
    id: string,
    settings: ICompanySettings,
  ): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const existing = await this.companyModel
      .findOne({ _id: toObjId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    if (!existing) return null;

    const merged = { ...(existing.settings || {}), ...settings };
    const updated = await this.companyModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: { settings: merged } },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeCompany(updated) : null;
  }

  async updatePlan(id: string, plan: CompanyPlan): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const updated = await this.companyModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: { plan } },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeCompany(updated) : null;
  }

  async incrementStorageUsed(
    id: string,
    deltaBytes: number,
  ): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const updated = await this.companyModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $inc: { storageUsed: deltaBytes } },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeCompany(updated) : null;
  }

  async softDelete(id: string): Promise<ICompany | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.companyModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted ? normalizeCompany(deleted) : null;
  }
}
