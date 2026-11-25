import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialActivityLogDocument = EditorialActivityLog & Document;

@Schema({ timestamps: true })
export class EditorialActivityLog {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 'altaire' })
  orgId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  resourceHref: string;

  @Prop({ default: () => new Date() })
  occurredAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialActivityLogSchema =
  SchemaFactory.createForClass(EditorialActivityLog);

EditorialActivityLogSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
