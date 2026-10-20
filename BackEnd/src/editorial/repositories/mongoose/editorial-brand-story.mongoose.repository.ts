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

@Injectable()
export class EditorialBrandStoryMongooseRepository implements EditorialBrandStoryRepository {
  constructor(
    @InjectModel(EditorialBrandStory.name)
    private readonly brandStoryModel: Model<EditorialBrandStoryDocument>,
  ) {}

  async findByUserId(
    userId: string,
    organizationId = 'altaire',
  ): Promise<IEditorialBrandStory | null> {
    const doc = await this.brandStoryModel
      .findOne({
        userId: toObjectId(userId),
        organizationId,
      })
      .lean()
      .exec();
    return doc as unknown as IEditorialBrandStory | null;
  }

  async upsert(
    userId: string,
    organizationId = 'altaire',
    data: IUpsertEditorialBrandStory,
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

    const doc = await this.brandStoryModel
      .findOneAndUpdate(
        { userId: toObjectId(userId), organizationId },
        {
          $set: set,
          $setOnInsert: {
            userId: toObjectId(userId),
            organizationId,
          },
        },
        { new: true, upsert: true },
      )
      .lean()
      .exec();
    return doc as unknown as IEditorialBrandStory;
  }
}
