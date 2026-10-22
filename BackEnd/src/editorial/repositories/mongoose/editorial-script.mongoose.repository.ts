import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialScriptRepository } from '../editorial-script.repository';
import {
  ICreateEditorialScript,
  IEditorialScript,
  IScriptAttachment,
  IScriptFilters,
  IUpdateEditorialScript,
} from '../../schemas/models/editorial-script.interface';
import {
  EditorialScript,
  EditorialScriptDocument,
} from '../../schemas/editorial-script.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialScriptMongooseRepository implements EditorialScriptRepository {
  constructor(
    @InjectModel(EditorialScript.name)
    private readonly scriptModel: Model<EditorialScriptDocument>,
  ) {}

  async findAllByProject(
    projectId: string,
    filters?: IScriptFilters,
  ): Promise<IEditorialScript[]> {
    const query: Record<string, unknown> = {
      projectId: toObjectId(projectId),
      isActive: { $ne: false },
    };
    if (filters?.format) query.format = filters.format;

    const scripts = await this.scriptModel
      .find(query)
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return scripts as unknown as IEditorialScript[];
  }

  async findById(id: string): Promise<IEditorialScript | null> {
    const script = await this.scriptModel
      .findOne({ _id: toObjectId(id), isActive: { $ne: false } })
      .lean()
      .exec();
    return script as unknown as IEditorialScript | null;
  }

  async create(data: ICreateEditorialScript): Promise<IEditorialScript> {
    const doc = new this.scriptModel({
      ...data,
      projectId: toObjectId(data.projectId),
      calendarSlotId: data.calendarSlotId
        ? toObjectId(data.calendarSlotId)
        : undefined,
      themeId: data.themeId ? toObjectId(data.themeId) : undefined,
      createdBy: toObjectId(data.createdBy),
      version: data.version ?? 1,
      blocks: data.blocks || [],
      titles: data.titles || [],
      thumbnailPrompts: data.thumbnailPrompts || [],
      complementaryMaterials: data.complementaryMaterials || [],
      explanationMaterials: data.explanationMaterials || [],
      attachments: data.attachments || [],
    });
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialScript;
  }

  async update(
    id: string,
    data: IUpdateEditorialScript,
  ): Promise<IEditorialScript | null> {
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) set[key] = value;
    }

    const updated = await this.scriptModel
      .findOneAndUpdate(
        { _id: toObjectId(id), isActive: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialScript | null;
  }

  async softDelete(id: string): Promise<IEditorialScript | null> {
    const deleted = await this.scriptModel
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialScript | null;
  }

  async addAttachment(
    scriptId: string,
    attachment: IScriptAttachment,
  ): Promise<IScriptAttachment | null> {
    const attachmentDoc = {
      _id: new (Types.ObjectId as any)(),
      ...attachment,
      fileId: attachment.fileId ? toObjectId(attachment.fileId) : undefined,
      createdAt: new Date(),
    };

    const updated = await this.scriptModel
      .findOneAndUpdate(
        { _id: toObjectId(scriptId), isActive: { $ne: false } },
        { $push: { attachments: attachmentDoc } },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) return null;
    return attachmentDoc as unknown as IScriptAttachment;
  }

  async removeAttachment(
    scriptId: string,
    attachmentId: string,
  ): Promise<boolean> {
    const updated = await this.scriptModel
      .findOneAndUpdate(
        { _id: toObjectId(scriptId), isActive: { $ne: false } },
        { $pull: { attachments: { _id: toObjectId(attachmentId) } } },
        { new: true },
      )
      .exec();
    return Boolean(updated);
  }

  async countByThemeId(themeId: string): Promise<number> {
    return this.scriptModel
      .countDocuments({
        themeId: toObjectId(themeId),
        isActive: { $ne: false },
      })
      .exec();
  }
}
