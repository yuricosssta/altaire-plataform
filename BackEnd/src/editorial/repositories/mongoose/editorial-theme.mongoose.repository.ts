import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialThemeRepository } from '../editorial-theme.repository';
import {
  IEditorialTheme,
  ICreateEditorialTheme,
  IThemeFilters,
  IUpdateEditorialTheme,
  ThemeStatus,
} from '../../schemas/models/editorial-theme.interface';
import {
  EditorialTheme,
  EditorialThemeDocument,
} from '../../schemas/editorial-theme.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialThemeMongooseRepository implements EditorialThemeRepository {
  constructor(
    @InjectModel(EditorialTheme.name)
    private readonly themeModel: Model<EditorialThemeDocument>,
  ) {}

  async findAllByProject(
    projectId: string,
    filters: IThemeFilters = {},
  ): Promise<IEditorialTheme[]> {
    if (!(Types.ObjectId as any).isValid(projectId)) return [];
    const query: Record<string, unknown> = {
      projectId: toObjectId(projectId),
      isActive: { $ne: false },
    };
    if (filters.status?.length) query.status = { $in: filters.status };
    if (filters.format) query.format = filters.format;
    if (filters.batchId) query.batchId = filters.batchId;

    const themes = await this.themeModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return themes as unknown as IEditorialTheme[];
  }

  async findAllByProjects(projectIds: string[]): Promise<IEditorialTheme[]> {
    const validIds = projectIds
      .filter((pid) => (Types.ObjectId as any).isValid(pid))
      .map(toObjectId);
    if (validIds.length === 0) return [];
    const themes = await this.themeModel
      .find({
        projectId: { $in: validIds },
        isActive: { $ne: false },
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return themes as unknown as IEditorialTheme[];
  }

  async findById(id: string): Promise<IEditorialTheme | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const theme = await this.themeModel
      .findOne({ _id: toObjectId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return theme as unknown as IEditorialTheme | null;
  }

  async findByIds(ids: string[]): Promise<IEditorialTheme[]> {
    const validIds = ids
      .filter((tid) => (Types.ObjectId as any).isValid(tid))
      .map(toObjectId);
    if (!validIds.length) return [];
    const themes = await this.themeModel
      .find({ _id: { $in: validIds }, isActive: { $ne: false } })
      .lean()
      .exec();
    return themes as unknown as IEditorialTheme[];
  }

  async createMany(data: ICreateEditorialTheme[]): Promise<IEditorialTheme[]> {
    if (!data.length) return [];
    const docs = await this.themeModel.insertMany(
      data.map((t) => ({ ...t, projectId: toObjectId(t.projectId) })),
    );
    return docs.map((d) => d.toObject()) as unknown as IEditorialTheme[];
  }

  async update(
    id: string,
    data: IUpdateEditorialTheme,
  ): Promise<IEditorialTheme | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) set[key] = value;
    }

    const updated = await this.themeModel
      .findOneAndUpdate(
        { _id: toObjectId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialTheme | null;
  }

  async bulkUpdateStatus(
    projectId: string,
    ids: string[],
    status: ThemeStatus,
  ): Promise<number> {
    const result = await this.themeModel
      .updateMany(
        {
          _id: { $in: ids.map(toObjectId) },
          projectId: toObjectId(projectId),
          isActive: { $ne: false },
        },
        { $set: { status } },
      )
      .exec();
    return result.modifiedCount;
  }

  async softDelete(id: string): Promise<IEditorialTheme | null> {
    const deleted = await this.themeModel
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialTheme | null;
  }
}
