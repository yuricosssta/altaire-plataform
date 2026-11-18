import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialTaskRepository } from '../editorial-task.repository';
import {
  ICreateEditorialTask,
  IEditorialTask,
  IUpdateEditorialTask,
} from '../../schemas/models/editorial-task.interface';
import {
  EditorialTask,
  EditorialTaskDocument,
} from '../../schemas/editorial-task.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialTaskMongooseRepository implements EditorialTaskRepository {
  constructor(
    @InjectModel(EditorialTask.name)
    private readonly taskModel: Model<EditorialTaskDocument>,
  ) {}

  async findAll(
    orgId: string,
    userId?: string,
    projectId?: string,
  ): Promise<IEditorialTask[]> {
    const query: Record<string, unknown> = {
      orgId,
      isActive: { $ne: false },
    };
    if (userId && (Types.ObjectId as any).isValid(userId)) {
      query.userId = toObjectId(userId);
    }
    if (projectId && (Types.ObjectId as any).isValid(projectId)) {
      query.projectId = toObjectId(projectId);
    }
    const docs = await this.taskModel
      .find(query)
      .sort({ completed: 1, createdAt: -1 })
      .lean()
      .exec();
    return docs as unknown as IEditorialTask[];
  }

  async findById(id: string): Promise<IEditorialTask | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const doc = await this.taskModel
      .findOne({ _id: toObjectId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return doc as unknown as IEditorialTask | null;
  }

  async create(data: ICreateEditorialTask): Promise<IEditorialTask> {
    const doc = new this.taskModel({
      ...data,
      userId: toObjectId(data.userId),
      projectId:
        data.projectId && (Types.ObjectId as any).isValid(data.projectId)
          ? toObjectId(data.projectId)
          : undefined,
    });
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialTask;
  }

  async update(
    id: string,
    data: IUpdateEditorialTask,
  ): Promise<IEditorialTask | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) set[key] = value;
    }
    const updated = await this.taskModel
      .findOneAndUpdate(
        { _id: toObjectId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialTask | null;
  }

  async softDelete(id: string): Promise<IEditorialTask | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.taskModel
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialTask | null;
  }
}
