import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialCalendarDocument = EditorialCalendar & Document;

class CalendarPeriodSubDoc {
  @Prop({ required: true, name: 'tp' })
  type: string;

  @Prop({ required: true, name: 'lb' })
  label: string;

  @Prop({ required: true, name: 'sd' })
  startDate: Date;

  @Prop({ required: true, name: 'ed' })
  endDate: Date;
}

class ProductionCapacitySubDoc {
  @Prop({ required: true, default: 0, name: 'rw' })
  reelsPerWeek: number;

  @Prop({ required: true, default: 0, name: 'lw' })
  longVideosPerWeek: number;

  @Prop({ required: true, default: 0, name: 'cw' })
  carouselsPerWeek: number;

  @Prop({ required: true, default: 0, name: 'sw' })
  staticPostsPerWeek: number;

  @Prop({ required: true, default: 0, name: 'lv' })
  livesPerWeek: number;

  @Prop({ required: true, default: 0, name: 'ss' })
  storySequencesPerDay: number;
}

class CalendarItemSubDoc {
  @Prop({ required: true, name: 'd' })
  date: Date;

  @Prop({ required: true, name: 'f' })
  format: string;

  @Prop({ required: true, name: 'rt' })
  retinaType: string;

  @Prop({ required: true, type: [String], name: 'plf' })
  platforms: string[];

  @Prop({ required: true, name: 'o' })
  objective: string;

  @Prop({ required: true, name: 'stm' })
  suggestedTime: string;

  @Prop({ name: 'th' })
  theme?: string;

  @Prop({ name: 'ru' })
  referenceUrl?: string;

  @Prop({ required: true, name: 'sts' })
  status: string;

  @Prop({ name: 'pn' })
  provisionalName?: string;

  @Prop({ name: 'so' })
  strategicObjective?: string;

  @Prop({ name: 'pl' })
  pillar?: string;

  @Prop({ name: 'pdo' })
  painDesireObjection?: string;

  @Prop({ name: 'ob' })
  observations?: string;

  @Prop({ name: 'eu' })
  exampleUrl?: string;
}

class StorySequenceSubDoc {
  @Prop({ required: true, name: 'd' })
  date: Date;

  @Prop({ required: true, name: 'si' })
  sequenceIndex: number;

  @Prop({ required: true, name: 'sc' })
  storiesCount: number;

  @Prop({ required: true, name: 'fo' })
  focus: string;

  @Prop({ required: true, name: 'rt' })
  retinaType: string;

  @Prop({ required: true, name: 'stm' })
  suggestedTime: string;

  @Prop({ required: true, name: 'sts' })
  status: string;

  @Prop({ name: 'th' })
  theme?: string;
}

class CalendarDaySubDoc {
  @Prop({ required: true, name: 'd' })
  date: Date;

  @Prop({ type: [CalendarItemSubDoc], default: [], name: 'it' })
  items: CalendarItemSubDoc[];

  @Prop({ type: [StorySequenceSubDoc], default: [], name: 'sq' })
  storySequences: StorySequenceSubDoc[];
}

class ReviewSuggestionSubDoc {
  @Prop({ required: true, name: 'tp' })
  type: string;

  @Prop({ required: true, name: 't' })
  title: string;

  @Prop({ required: true, name: 'd' })
  description: string;

  @Prop({ required: true, name: 'im' })
  impact: string;
}

@Schema({ timestamps: true })
export class EditorialCalendar {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialProject',
    name: 'pid',
  })
  projectId: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialVersion',
    name: 'evid',
  })
  editorialVersionId: Types.ObjectId;

  @Prop({ required: true, name: 'n' })
  name: string;

  @Prop({ required: true, type: CalendarPeriodSubDoc, name: 'per' })
  period: CalendarPeriodSubDoc;

  @Prop({ required: true, type: [String], name: 'plf' })
  platforms: string[];

  @Prop({ required: true, type: ProductionCapacitySubDoc, name: 'cap' })
  capacity: ProductionCapacitySubDoc;

  @Prop({ required: true, name: 'obj' })
  objective: string;

  @Prop({ required: true, default: 'active', name: 'st' })
  status: string;

  @Prop({ type: [CalendarDaySubDoc], default: [], name: 'dys' })
  days: CalendarDaySubDoc[];

  @Prop({ type: [ReviewSuggestionSubDoc], default: [], name: 'rv' })
  reviewSuggestions: ReviewSuggestionSubDoc[];

  @Prop({ default: true, name: 'ia' })
  isActive: boolean;
}

export const EditorialCalendarSchema =
  SchemaFactory.createForClass(EditorialCalendar);

EditorialCalendarSchema.index({ pid: 1, ia: 1, st: 1 });
EditorialCalendarSchema.index({ pid: 1, obj: 1 });
