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
  'planned' | 'in_production' | 'script_ready' | 'recorded' | 'published';

export type CalendarObjective =
  | 'increase_audience'
  | 'warmup_sales'
  | 'reinforce_authority'
  | 'increase_relationship'
  | 'improve_engagement'
  | 'support_launch';

export type PeriodType =
  'two_weeks' | 'one_month' | 'four_weeks_warmup' | 'pre_launch' | 'custom';

export type CalendarStatus =
  | 'active'
  | 'draft'
  | 'upcoming'
  | 'review_recommended'
  | 'expired'
  | 'archived';

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
  storiesPerSequence?: number;
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
  themeId?: string;
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
  reason?: string;
  actionLabel?: string;
  applied?: boolean;
}

export interface IEditorialCalendar {
  _id?: string;
  id?: string;
  projectId: string;
  editorialVersionId: string;
  name: string;
  period: ICalendarPeriod;
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  mainObjective?: string;
  linkedLineName?: string;
  platforms: Platform[];
  capacity: IProductionCapacity;
  weeklyCapacity?: Record<string, number>;
  objective: CalendarObjective;
  status: CalendarStatus;
  days: ICalendarDay[];
  slots?: Record<string, unknown>[];
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
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  mainObjective?: string;
  linkedLineName?: string;
  platforms: Platform[];
  capacity: IProductionCapacity;
  weeklyCapacity?: Record<string, number>;
  objective: CalendarObjective;
  status?: CalendarStatus;
  days?: ICalendarDay[];
  slots?: Record<string, unknown>[];
  reviewSuggestions?: IReviewSuggestion[];
}

export interface IUpdateEditorialCalendar {
  name?: string;
  status?: CalendarStatus;
  editorialVersionId?: string;
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  mainObjective?: string;
  linkedLineName?: string;
  platforms?: Platform[];
  capacity?: IProductionCapacity;
  weeklyCapacity?: Record<string, number>;
  objective?: CalendarObjective;
  slots?: Record<string, unknown>[];
  reviewSuggestions?: IReviewSuggestion[];
}

export interface ICalendarItemUpdate {
  provisionalName?: string;
  theme?: string;
  mainTheme?: string;
  provisionalTitle?: string;
  painDesireObjection?: string;
  icpPainDesireOrObjection?: string;
  icpAwarenessLevel?: string;
  suggestedTime?: string;
  observations?: string;
  executionNotes?: string;
  referenceUrl?: string;
  referenceLink?: string;
  exampleUrl?: string;
  pillar?: string;
  editorialPillar?: string;
  strategicObjective?: string;
  secondaryObjective?: string;
  status?: CalendarItemStatus;
  retinaType?: RetinaType;
  platforms?: Platform[];
  objective?: string;
  eligibleForComplementaryMaterial?: boolean;
  complementaryMaterialType?: string;
  weekNumber?: number;
  dayOfWeek?: string;
  date?: string | Date;
  scheduledTime?: string;
  format?: string;
  formatLabel?: string;
  platform?: string;
  primaryObjective?: string;
  retinaBadge?: string;
  themeId?: string | null;
  scriptId?: string | null;
}

export type ProductionCapacity = IProductionCapacity;
