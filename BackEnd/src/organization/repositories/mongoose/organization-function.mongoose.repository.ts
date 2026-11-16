// BackEnd/src/organization/repositories/mongoose/organization-function.mongoose.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationFunctionRepository } from '../organization-function.repository';
import { IOrganizationFunction } from '../../schemas/models/organization-function.interface';
import {
  OrganizationFunction,
  OrganizationFunctionDocument,
} from '../../schemas/organization-function.schema';

@Injectable()
export class OrganizationFunctionMongooseRepository implements OrganizationFunctionRepository {
  constructor(
    @InjectModel(OrganizationFunction.name)
    private readonly functionModel: Model<OrganizationFunctionDocument>,
  ) {}

  async findAllByOrg(
    orgId: string,
    createdBy?: string,
  ): Promise<IOrganizationFunction[]> {
    if (!(Types.ObjectId as any).isValid(orgId)) {
      return [];
    }

    const query: Record<string, any> = {
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      isActive: { $ne: false },
    };

    if (createdBy && (Types.ObjectId as any).isValid(createdBy)) {
      query.createdBy = new (Types.ObjectId as any)(String(createdBy));
    }

    const docs = await this.functionModel
      .find(query)
      .sort({ name: 1, createdAt: -1 })
      .lean()
      .exec();

    return docs.map((doc) => ({
      ...doc,
      _id: String(doc._id),
      organizationId: String(doc.organizationId),
      createdBy: String(doc.createdBy),
    })) as unknown as IOrganizationFunction[];
  }

  async findById(id: string): Promise<IOrganizationFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) {
      return null;
    }

    const doc = await this.functionModel
      .findOne({
        _id: new (Types.ObjectId as any)(String(id)),
        isActive: { $ne: false },
      })
      .lean()
      .exec();

    if (!doc) return null;

    return {
      ...doc,
      _id: String(doc._id),
      organizationId: String(doc.organizationId),
      createdBy: String(doc.createdBy),
    } as unknown as IOrganizationFunction;
  }

  async create(data: {
    organizationId: string;
    name: string;
    description: string;
    createdBy: string;
  }): Promise<IOrganizationFunction> {
    const doc = new this.functionModel({
      organizationId: new (Types.ObjectId as any)(String(data.organizationId)),
      name: data.name.trim(),
      description: data.description.trim(),
      createdBy: new (Types.ObjectId as any)(String(data.createdBy)),
      isActive: true,
    });
    const saved = await doc.save();
    const obj = saved.toObject();
    return {
      ...obj,
      _id: String(obj._id),
      organizationId: String(obj.organizationId),
      createdBy: String(obj.createdBy),
    } as unknown as IOrganizationFunction;
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<IOrganizationFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) {
      return null;
    }

    const updateFields: Record<string, any> = {};
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.description !== undefined)
      updateFields.description = data.description.trim();

    const updated = await this.functionModel
      .findOneAndUpdate(
        {
          _id: new (Types.ObjectId as any)(String(id)),
          isActive: { $ne: false },
        },
        { $set: updateFields },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) return null;

    return {
      ...updated,
      _id: String(updated._id),
      organizationId: String(updated.organizationId),
      createdBy: String(updated.createdBy),
    } as unknown as IOrganizationFunction;
  }

  async softDelete(id: string): Promise<IOrganizationFunction | null> {
    if (!(Types.ObjectId as any).isValid(id)) {
      return null;
    }

    const deleted = await this.functionModel
      .findOneAndUpdate(
        {
          _id: new (Types.ObjectId as any)(String(id)),
          isActive: { $ne: false },
        },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();

    if (!deleted) return null;

    return {
      ...deleted,
      _id: String(deleted._id),
      organizationId: String(deleted.organizationId),
      createdBy: String(deleted.createdBy),
    } as unknown as IOrganizationFunction;
  }
}
