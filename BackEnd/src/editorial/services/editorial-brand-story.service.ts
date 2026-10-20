import { Injectable } from '@nestjs/common';
import { EditorialBrandStoryRepository } from '../repositories/editorial-brand-story.repository';
import {
  IEditorialBrandStory,
  IUpsertEditorialBrandStory,
} from '../schemas/models/editorial-brand-story.interface';

@Injectable()
export class EditorialBrandStoryService {
  constructor(
    private readonly brandStoryRepository: EditorialBrandStoryRepository,
  ) {}

  async get(
    userId: string,
    organizationId = 'altaire',
  ): Promise<IEditorialBrandStory> {
    const found = await this.brandStoryRepository.findByUserId(
      userId,
      organizationId,
    );
    if (found) return found;

    return {
      organizationId,
      userId,
      originStory: '',
      keyTurnarounds: [],
      failures: [],
      achievements: [],
      values: [],
      lifestyle: '',
      usableStories: [],
    };
  }

  async upsert(
    userId: string,
    organizationId = 'altaire',
    data: IUpsertEditorialBrandStory,
  ): Promise<IEditorialBrandStory> {
    return this.brandStoryRepository.upsert(userId, organizationId, data);
  }
}
