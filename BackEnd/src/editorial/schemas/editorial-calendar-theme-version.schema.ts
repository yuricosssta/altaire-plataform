import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type EditorialCalendarThemeVersionDocument =
  EditorialCalendarThemeVersion & Document;

class ThemeVersionPeriodSubDoc {
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

class ThemeVersionConfigurationSubDoc {
  @Prop({ required: true })
  objective: string;

  @Prop({ required: true })
  businessMoment: string;
}

class ThemeVersionSlotSubDoc {
  @Prop({ required: true, type: Types.ObjectId })
  calendarItemId: Types.ObjectId;

  /** Snapshot do tema no momento do salvamento (imutável). */
  @Prop({ required: true, type: SchemaTypes.Mixed })
  theme: Record<string, unknown>;
}

@Schema({ timestamps: true })
export class EditorialCalendarThemeVersion {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EditorialProject' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'EditorialCalendar' })
  calendarId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: ThemeVersionPeriodSubDoc })
  period: ThemeVersionPeriodSubDoc;

  @Prop({ required: true, type: ThemeVersionConfigurationSubDoc })
  configuration: ThemeVersionConfigurationSubDoc;

  @Prop({ type: [ThemeVersionSlotSubDoc], default: [] })
  slots: ThemeVersionSlotSubDoc[];

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialCalendarThemeVersionSchema = SchemaFactory.createForClass(
  EditorialCalendarThemeVersion,
);

EditorialCalendarThemeVersionSchema.index({
  calendarId: 1,
  isActive: 1,
  createdAt: -1,
});
