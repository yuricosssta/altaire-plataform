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

  async getByBrand(
    brandId: string,
    companyId = '',
  ): Promise<IEditorialBrandStory> {
    const found = await this.brandStoryRepository.findByBrandId(brandId);
    if (found) return found;

    return {
      organizationId: 'altaire',
      companyId,
      brandId,
      originStory: '',
      keyTurnarounds: [],
      failures: [],
      achievements: [],
      values: [],
      lifestyle: '',
      usableStories: [],
    };
  }

  async upsertByBrand(
    brandId: string,
    companyId: string,
    data: IUpsertEditorialBrandStory,
    updatedBy?: string,
  ): Promise<IEditorialBrandStory> {
    return this.brandStoryRepository.upsertByBrand(
      brandId,
      companyId,
      data,
      updatedBy,
    );
  }
}
