import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialProjectRepository } from '../../repositories/editorial-project.repository';
import {
  IEditorialProject,
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../../schemas/models/editorial-project.interface';
import {
  EditorialProject,
  EditorialProjectDocument,
} from '../../schemas/editorial-project.schema';

@Injectable()
export class EditorialProjectMongooseRepository implements EditorialProjectRepository {
  constructor(
    @InjectModel(EditorialProject.name)
    private readonly projectModel: Model<EditorialProjectDocument>,
  ) {}

  async findAll(orgId: string): Promise<IEditorialProject[]> {
    const projects = await this.projectModel
      .find({ orgId, isActive: { $ne: false } })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return projects as unknown as IEditorialProject[];
  }

  async findById(id: string): Promise<IEditorialProject | null> {
    const project = await this.projectModel
      .findOne({
        _id: new (Types.ObjectId as any)(id),
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return project as unknown as IEditorialProject | null;
  }

  async create(data: ICreateEditorialProject): Promise<IEditorialProject> {
    const doc = new this.projectModel(data);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialProject;
  }

  async update(
    id: string,
    data: IUpdateEditorialProject,
  ): Promise<IEditorialProject | null> {
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id), isActive: { $ne: false } },
        { $set: data },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialProject | null;
  }

  async softDelete(id: string): Promise<IEditorialProject | null> {
    const deleted = await this.projectModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialProject | null;
  }
}
