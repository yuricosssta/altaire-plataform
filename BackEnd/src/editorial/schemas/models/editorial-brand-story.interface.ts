export interface IUsableStory {
  title: string;
  content: string;
  tags: string[];
}

export interface IEditorialBrandStory {
  _id?: string;
  id?: string;
  /** Hoje fixo em 'altaire' (string) — ver nota da Sprint 11. */
  organizationId: string;
  userId: string;
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
