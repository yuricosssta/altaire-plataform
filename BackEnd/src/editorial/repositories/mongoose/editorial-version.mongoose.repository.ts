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
        pid: new (Types.ObjectId as any)(projectId),
        ia: { $ne: false },
      })
      .sort({ vn: -1 })
      .lean()
      .exec();
    return versions as unknown as IEditorialVersion[];
  }

  async findById(id: string): Promise<IEditorialVersion | null> {
    const version = await this.versionModel
      .findOne({
        _id: new (Types.ObjectId as any)(id),
        ia: { $ne: false },
      })
      .lean()
      .exec();
    return version as unknown as IEditorialVersion | null;
  }

  async findMaxVersionNumber(projectId: string): Promise<number> {
    const max = await this.versionModel
      .findOne({ pid: new (Types.ObjectId as any)(projectId) })
      .sort({ vn: -1 })
      .select('vn')
      .lean()
      .exec();
    return (max as unknown as { vn: number } | null)?.vn ?? 0;
  }

  async create(data: ICreateEditorialVersion): Promise<IEditorialVersion> {
    const mapped = {
      pid: new (Types.ObjectId as any)(data.projectId),
      vn: data.versionNumber,
      n: data.name,
      st: 'active',
      cb: new (Types.ObjectId as any)(data.createdBy),
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
    if (data.name !== undefined) set['n'] = data.name;
    if (data.status !== undefined) set['st'] = data.status;

    const updated = await this.versionModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id), ia: { $ne: false } },
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
        { $set: { ia: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialVersion | null;
  }
}
