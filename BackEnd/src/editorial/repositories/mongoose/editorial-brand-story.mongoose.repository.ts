import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialBrandStoryRepository } from '../editorial-brand-story.repository';
import {
  IEditorialBrandStory,
  IUpsertEditorialBrandStory,
} from '../../schemas/models/editorial-brand-story.interface';
import {
  EditorialBrandStory,
  EditorialBrandStoryDocument,
} from '../../schemas/editorial-brand-story.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeBrandStory(doc: any): IEditorialBrandStory {
  return {
    ...doc,
    _id: doc._id ? String(doc._id) : undefined,
    id: doc._id ? String(doc._id) : undefined,
    companyId: doc.companyId ? String(doc.companyId) : '',
    brandId: doc.brandId ? String(doc.brandId) : '',
    userId: doc.userId ? String(doc.userId) : undefined,
  } as IEditorialBrandStory;
}

@Injectable()
export class EditorialBrandStoryMongooseRepository implements EditorialBrandStoryRepository {
  constructor(
    @InjectModel(EditorialBrandStory.name)
    private readonly brandStoryModel: Model<EditorialBrandStoryDocument>,
  ) {}

  async findByBrandId(brandId: string): Promise<IEditorialBrandStory | null> {
    if (!(Types.ObjectId as any).isValid(brandId)) return null;
    const doc = await this.brandStoryModel
      .findOne({ brandId: toObjectId(brandId) })
      .lean()
      .exec();
    return doc ? normalizeBrandStory(doc) : null;
  }

  async upsertByBrand(
    brandId: string,
    companyId: string,
    data: IUpsertEditorialBrandStory,
    updatedBy?: string,
  ): Promise<IEditorialBrandStory> {
    const set: Record<string, unknown> = {};
    if (data.originStory !== undefined) set.originStory = data.originStory;
    if (data.keyTurnarounds !== undefined)
      set.keyTurnarounds = data.keyTurnarounds;
    if (data.failures !== undefined) set.failures = data.failures;
    if (data.achievements !== undefined) set.achievements = data.achievements;
    if (data.values !== undefined) set.values = data.values;
    if (data.lifestyle !== undefined) set.lifestyle = data.lifestyle;
    if (data.usableStories !== undefined)
      set.usableStories = data.usableStories;
    if (updatedBy && (Types.ObjectId as any).isValid(updatedBy)) {
      set.userId = toObjectId(updatedBy);
    }

    const doc = await this.brandStoryModel
      .findOneAndUpdate(
        { brandId: toObjectId(brandId) },
        {
          $set: set,
          $setOnInsert: {
            brandId: toObjectId(brandId),
            companyId: toObjectId(companyId),
            organizationId: 'altaire',
          },
        },
        { new: true, upsert: true },
      )
      .lean()
      .exec();
    return normalizeBrandStory(doc);
  }
}
