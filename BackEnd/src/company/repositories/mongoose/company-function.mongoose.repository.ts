import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyFunctionRepository } from '../company-function.repository';
import {
  ICompanyFunction,
  ICreateCompanyFunction,
  IUpdateCompanyFunction,
} from '../../schemas/models/company-function.interface';
import {
  CompanyFunction,
  CompanyFunctionDocument,
} from '../../schemas/company-function.schema';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeFunction(doc: any): ICompanyFunction {
  return {
    ...doc,
    _id: String(doc._id),
    companyId: String(doc.companyId),
    createdBy: String(doc.createdBy),
  } as ICompanyFunction;
}

@Injectable()
export class CompanyFunctionMongooseRepository implements CompanyFunctionRepository {
  constructor(
    @InjectModel(CompanyFunction.name)
    private readonly functionModel: Model<CompanyFunctionDocument>,
  ) {}

  async findAllByCompany(companyId: string): Promise<ICompanyFunction[]> {
    if (!(Types.ObjectId as any).isValid(companyId)) return [];
    const docs = await this.functionModel
      .find({ companyId: toObjId(companyId), isActive: { $ne: false } })
      .sort({ name: 1, createdAt: -1 })
      .lean()
      .exec();
    return docs.map(normalizeFunction);
  }

  async findById(id: string): Promise<ICompanyFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const doc = await this.functionModel
      .findOne({ _id: toObjId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return doc ? normalizeFunction(doc) : null;
  }

  async create(data: ICreateCompanyFunction): Promise<ICompanyFunction> {
    const doc = new this.functionModel({
      companyId: toObjId(data.companyId),
      name: data.name.trim(),
      description: data.description.trim(),
      createdBy: toObjId(data.createdBy),
      isActive: true,
    });
    const saved = await doc.save();
    return normalizeFunction(saved.toObject());
  }

  async update(
    id: string,
    data: IUpdateCompanyFunction,
  ): Promise<ICompanyFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set.name = data.name.trim();
    if (data.description !== undefined)
      set.description = data.description.trim();

    const updated = await this.functionModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeFunction(updated) : null;
  }

  async softDelete(id: string): Promise<ICompanyFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.functionModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted ? normalizeFunction(deleted) : null;
  }
}
