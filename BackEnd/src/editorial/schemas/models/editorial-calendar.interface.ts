export type ContentFormat =
  | 'reel'
  | 'long_video'
  | 'carousel'
  | 'static_post'
  | 'live'
  | 'stories_sequence';

export type RetinaType =
  | 'relacionamento'
  | 'engajamento'
  | 'transformacao'
  | 'interacao'
  | 'nivel_consciencia'
  | 'autoridade';

export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'linkedin';

export type CalendarItemStatus =
  'planned' | 'in_production' | 'recorded' | 'published';

export type CalendarObjective =
  | 'increase_audience'
  | 'warmup_sales'
  | 'reinforce_authority'
  | 'increase_relationship'
  | 'improve_engagement'
  | 'support_launch';

export type PeriodType =
  'two_weeks' | 'one_month' | 'four_weeks_warmup' | 'pre_launch' | 'custom';

export type CalendarStatus = 'active' | 'archived';

export type ReviewSuggestionType =
  'increase' | 'reduce' | 'adjust' | 'frequency';
export type ReviewImpact = 'high' | 'medium' | 'low';

export interface ICalendarPeriod {
  type: PeriodType;
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface IProductionCapacity {
  reelsPerWeek: number;
  longVideosPerWeek: number;
  carouselsPerWeek: number;
  staticPostsPerWeek: number;
  livesPerWeek: number;
  storySequencesPerDay: number;
}

export interface ICalendarItem {
  _id?: string;
  id?: string;
  date: Date;
  format: ContentFormat;
  retinaType: RetinaType;
  platforms: Platform[];
  objective: string;
  suggestedTime: string;
  theme?: string;
  referenceUrl?: string;
  status: CalendarItemStatus;
  provisionalName?: string;
  strategicObjective?: string;
  pillar?: string;
  painDesireObjection?: string;
  observations?: string;
  exampleUrl?: string;
}

export interface IStorySequence {
  _id?: string;
  id?: string;
  date: Date;
  sequenceIndex: number;
  storiesCount: number;
  focus: string;
  retinaType: RetinaType;
  suggestedTime: string;
  status: CalendarItemStatus;
  theme?: string;
}

export interface ICalendarDay {
  date: Date;
  items: ICalendarItem[];
  storySequences: IStorySequence[];
}

export interface IReviewSuggestion {
  _id?: string;
  id?: string;
  type: ReviewSuggestionType;
  title: string;
  description: string;
  impact: ReviewImpact;
}

export interface IEditorialCalendar {
  _id?: string;
  id?: string;
  projectId: string;
  editorialVersionId: string;
  name: string;
  period: ICalendarPeriod;
  platforms: Platform[];
  capacity: IProductionCapacity;
  objective: CalendarObjective;
  status: CalendarStatus;
  days: ICalendarDay[];
  reviewSuggestions?: IReviewSuggestion[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialCalendar {
  projectId: string;
  editorialVersionId: string;
  name: string;
  period: ICalendarPeriod;
  platforms: Platform[];
  capacity: IProductionCapacity;
  objective: CalendarObjective;
  days?: ICalendarDay[];
}

export interface IUpdateEditorialCalendar {
  name?: string;
  status?: CalendarStatus;
  editorialVersionId?: string;
  capacity?: IProductionCapacity;
  objective?: CalendarObjective;
  reviewSuggestions?: IReviewSuggestion[];
}

export interface ICalendarItemUpdate {
  provisionalName?: string;
  theme?: string;
  painDesireObjection?: string;
  suggestedTime?: string;
  observations?: string;
  referenceUrl?: string;
  exampleUrl?: string;
  pillar?: string;
  strategicObjective?: string;
  status?: CalendarItemStatus;
  retinaType?: RetinaType;
  platforms?: Platform[];
  objective?: string;
}

export type ProductionCapacity = IProductionCapacity;
