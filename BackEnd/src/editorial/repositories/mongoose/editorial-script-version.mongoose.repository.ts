import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialScriptVersionRepository } from '../editorial-script-version.repository';
import {
  ICreateEditorialScriptVersion,
  IEditorialScriptVersion,
} from '../../schemas/models/editorial-script.interface';
import {
  EditorialScriptVersion,
  EditorialScriptVersionDocument,
} from '../../schemas/editorial-script-version.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialScriptVersionMongooseRepository implements EditorialScriptVersionRepository {
  constructor(
    @InjectModel(EditorialScriptVersion.name)
    private readonly versionModel: Model<EditorialScriptVersionDocument>,
  ) {}

  async findAllByScriptId(
    scriptId: string,
  ): Promise<IEditorialScriptVersion[]> {
    const versions = await this.versionModel
      .find({ scriptId: toObjectId(scriptId) })
      .sort({ versionNumber: -1 })
      .lean()
      .exec();
    return versions as unknown as IEditorialScriptVersion[];
  }

  async findMaxVersionNumber(scriptId: string): Promise<number> {
    const last = await this.versionModel
      .findOne({ scriptId: toObjectId(scriptId) })
      .sort({ versionNumber: -1 })
      .select('versionNumber')
      .lean()
      .exec();
    return last?.versionNumber || 0;
  }

  async create(
    data: ICreateEditorialScriptVersion,
  ): Promise<IEditorialScriptVersion> {
    const doc = new this.versionModel({
      ...data,
      scriptId: toObjectId(data.scriptId),
      createdBy: toObjectId(data.createdBy),
      blocks: data.blocks || [],
      titles: data.titles || [],
      thumbnailPrompts: data.thumbnailPrompts || [],
      complementaryMaterials: data.complementaryMaterials || [],
      explanationMaterials: data.explanationMaterials || [],
    });
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialScriptVersion;
  }
}
