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
    const mapped: Record<string, unknown> = {
      projectId: new (Types.ObjectId as any)(data.projectId),
      versionNumber: data.versionNumber,
      name: data.name,
      status: data.status || 'active',
      createdBy: (Types.ObjectId as any).isValid(data.createdBy)
        ? new (Types.ObjectId as any)(data.createdBy)
        : new (Types.ObjectId as any)(),
    };
    if (data.phaseTag !== undefined) mapped.phaseTag = data.phaseTag;
    if (data.reviewReason !== undefined)
      mapped.reviewReason = data.reviewReason;
    if (data.strategicBase !== undefined)
      mapped.strategicBase = data.strategicBase;

    const doc = new this.versionModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialVersion;
  }

  async update(
    id: string,
    data: IUpdateEditorialVersion,
  ): Promise<IEditorialVersion | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set['name'] = data.name;
    if (data.status !== undefined) set['status'] = data.status;
    if (data.phaseTag !== undefined) set['phaseTag'] = data.phaseTag;
    if (data.reviewReason !== undefined)
      set['reviewReason'] = data.reviewReason;
    if (data.strategicBase !== undefined)
      set['strategicBase'] = data.strategicBase;

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

  async archiveOthers(
    projectId: string,
    activeVersionId: string,
  ): Promise<void> {
    if (
      !(Types.ObjectId as any).isValid(projectId) ||
      !(Types.ObjectId as any).isValid(activeVersionId)
    ) {
      return;
    }
    await this.versionModel
      .updateMany(
        {
          projectId: new (Types.ObjectId as any)(projectId),
          _id: { $ne: new (Types.ObjectId as any)(activeVersionId) },
          status: 'active',
          isActive: { $ne: false },
        },
        { $set: { status: 'archived' } },
      )
      .exec();
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
