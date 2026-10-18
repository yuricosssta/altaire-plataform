import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialVersionRepository } from '../editorial-version.repository';
import {
  IEditorialVersion,
  ICreateEditorialVersion,
  IUpdateEditorialVersion,
} from '../../schemas/models/editorial-version.interface';
import {
  EditorialVersion,
  EditorialVersionDocument,
} from '../../schemas/editorial-version.schema';

@Injectable()
export class EditorialVersionMongooseRepository implements EditorialVersionRepository {
  constructor(
    @InjectModel(EditorialVersion.name)
    private readonly versionModel: Model<EditorialVersionDocument>,
  ) {}

  async findAllByProject(projectId: string): Promise<IEditorialVersion[]> {
    const versions = await this.versionModel
      .find({
        projectId: new (Types.ObjectId as any)(projectId),
        isActive: { $ne: false },
      })
      .sort({ versionNumber: -1 })
      .lean()
      .exec();
    return versions as unknown as IEditorialVersion[];
  }

  async findById(id: string): Promise<IEditorialVersion | null> {
    const version = await this.versionModel
      .findOne({
        _id: new (Types.ObjectId as any)(id),
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return version as unknown as IEditorialVersion | null;
  }

  async findMaxVersionNumber(projectId: string): Promise<number> {
    const max = await this.versionModel
      .findOne({ projectId: new (Types.ObjectId as any)(projectId) })
      .sort({ versionNumber: -1 })
      .select('versionNumber')
      .lean()
      .exec();
    return (
      (max as unknown as { versionNumber: number } | null)?.versionNumber ?? 0
    );
  }

  async create(data: ICreateEditorialVersion): Promise<IEditorialVersion> {
    const mapped = {
      projectId: new (Types.ObjectId as any)(data.projectId),
      versionNumber: data.versionNumber,
      name: data.name,
      status: 'active',
      createdBy: new (Types.ObjectId as any)(data.createdBy),
    };
    const doc = new this.versionModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialVersion;
  }

  async update(
    id: string,
    data: IUpdateEditorialVersion,
  ): Promise<IEditorialVersion | null> {
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set['name'] = data.name;
    if (data.status !== undefined) set['status'] = data.status;

    const updated = await this.versionModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialVersion | null;
  }

  async softDelete(id: string): Promise<IEditorialVersion | null> {
    const deleted = await this.versionModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialVersion | null;
  }
}
