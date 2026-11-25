export interface IUsableStory {
  title: string;
  content: string;
  tags: string[];
}

export interface IEditorialBrandStory {
  _id?: string;
  id?: string;
  organizationId: string;
  companyId: string;
  brandId: string;
  userId?: string;
  originStory: string;
  keyTurnarounds: string[];
  failures: string[];
  achievements: string[];
  values: string[];
  lifestyle: string;
  usableStories: IUsableStory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpsertEditorialBrandStory {
  originStory?: string;
  keyTurnarounds?: string[];
  failures?: string[];
  achievements?: string[];
  values?: string[];
  lifestyle?: string;
  usableStories?: IUsableStory[];
}
