import {
  IEditorialBrandStory,
  IUpsertEditorialBrandStory,
} from '../schemas/models/editorial-brand-story.interface';

export abstract class EditorialBrandStoryRepository {
  abstract findByUserId(
    userId: string,
    organizationId?: string,
  ): Promise<IEditorialBrandStory | null>;
  abstract upsert(
    userId: string,
    organizationId: string,
    data: IUpsertEditorialBrandStory,
  ): Promise<IEditorialBrandStory>;
}
