import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialCalendarDocument = EditorialCalendar & Document;

class CalendarPeriodSubDoc {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

class ProductionCapacitySubDoc {
  @Prop({ required: true, default: 0 })
  reelsPerWeek: number;

  @Prop({ required: true, default: 0 })
  longVideosPerWeek: number;

  @Prop({ required: true, default: 0 })
  carouselsPerWeek: number;

  @Prop({ required: true, default: 0 })
  staticPostsPerWeek: number;

  @Prop({ required: true, default: 0 })
  livesPerWeek: number;

  @Prop({ required: true, default: 0 })
  storySequencesPerDay: number;
}

class CalendarItemSubDoc {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  retinaType: string;

  @Prop({ required: true, type: [String] })
  platforms: string[];

  @Prop({ required: true })
  objective: string;

  @Prop({ required: true })
  suggestedTime: string;

  @Prop()
  theme?: string;

  @Prop()
  referenceUrl?: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  provisionalName?: string;

  @Prop()
  strategicObjective?: string;

  @Prop()
  pillar?: string;

  @Prop()
  painDesireObjection?: string;

  @Prop()
  observations?: string;

  @Prop()
  exampleUrl?: string;
}

class StorySequenceSubDoc {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  sequenceIndex: number;

  @Prop({ required: true })
  storiesCount: number;

  @Prop({ required: true })
  focus: string;

  @Prop({ required: true })
  retinaType: string;

  @Prop({ required: true })
  suggestedTime: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  theme?: string;
}

class CalendarDaySubDoc {
  @Prop({ required: true })
  date: Date;

  @Prop({ type: [CalendarItemSubDoc], default: [] })
  items: CalendarItemSubDoc[];

  @Prop({ type: [StorySequenceSubDoc], default: [] })
  storySequences: StorySequenceSubDoc[];
}

class ReviewSuggestionSubDoc {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  impact: string;
}

@Schema({ timestamps: true })
export class EditorialCalendar {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialProject',
  })
  projectId: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialVersion',
  })
  editorialVersionId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: CalendarPeriodSubDoc })
  period: CalendarPeriodSubDoc;

  @Prop({ required: true, type: [String] })
  platforms: string[];

  @Prop({ required: true, type: ProductionCapacitySubDoc })
  capacity: ProductionCapacitySubDoc;

  @Prop({ required: true })
  objective: string;

  @Prop({ required: true, default: 'active' })
  status: string;

  @Prop({ type: [CalendarDaySubDoc], default: [] })
  days: CalendarDaySubDoc[];

  @Prop({ type: [ReviewSuggestionSubDoc], default: [] })
  reviewSuggestions: ReviewSuggestionSubDoc[];

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialCalendarSchema =
  SchemaFactory.createForClass(EditorialCalendar);

EditorialCalendarSchema.index({ projectId: 1, isActive: 1, status: 1 });
EditorialCalendarSchema.index({ projectId: 1, objective: 1 });
