import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialActivityRepository } from '../editorial-activity.repository';
import {
  ICreateEditorialActivityLog,
  IEditorialActivityLog,
} from '../../schemas/models/editorial-activity.interface';
import {
  EditorialActivityLog,
  EditorialActivityLogDocument,
} from '../../schemas/editorial-activity.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialActivityMongooseRepository implements EditorialActivityRepository {
  constructor(
    @InjectModel(EditorialActivityLog.name)
    private readonly activityModel: Model<EditorialActivityLogDocument>,
  ) {}

  async findRecent(
    orgId: string,
    userId?: string,
    projectId?: string,
    limit = 30,
  ): Promise<IEditorialActivityLog[]> {
    const query: Record<string, unknown> = {
      orgId,
      isActive: { $ne: false },
    };
    if (userId && (Types.ObjectId as any).isValid(userId)) {
      query.userId = toObjectId(userId);
    }
    if (projectId) {
      query.projectId = String(projectId);
    }
    const docs = await this.activityModel
      .find(query)
      .sort({ occurredAt: -1, createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs as unknown as IEditorialActivityLog[];
  }

  async create(
    data: ICreateEditorialActivityLog,
  ): Promise<IEditorialActivityLog> {
    const userObjId =
      data.userId && (Types.ObjectId as any).isValid(data.userId)
        ? toObjectId(data.userId)
        : new (Types.ObjectId as any)();
    const doc = new this.activityModel({
      ...data,
      userId: userObjId,
      occurredAt: data.occurredAt || new Date(),
    });
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialActivityLog;
  }
}
