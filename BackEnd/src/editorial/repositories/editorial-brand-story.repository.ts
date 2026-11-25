import {
  IEditorialBrandStory,
  IUpsertEditorialBrandStory,
} from '../schemas/models/editorial-brand-story.interface';

export abstract class EditorialBrandStoryRepository {
  abstract findByBrandId(brandId: string): Promise<IEditorialBrandStory | null>;
  abstract upsertByBrand(
    brandId: string,
    companyId: string,
    data: IUpsertEditorialBrandStory,
    updatedBy?: string,
  ): Promise<IEditorialBrandStory>;
}
