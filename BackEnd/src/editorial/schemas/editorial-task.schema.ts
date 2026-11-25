import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialTaskDocument = EditorialTask & Document;

@Schema({ timestamps: true })
export class EditorialTask {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 'altaire' })
  orgId: string;

  @Prop({ type: Types.ObjectId, ref: 'EditorialProject' })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: 'Hoje' })
  dueLabel: string;

  @Prop({ default: 'today' })
  dueCategory: string;

  @Prop({ default: 'Manual' })
  origin: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: false })
  postponed: boolean;

  @Prop()
  resourceLabel?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialTaskSchema = SchemaFactory.createForClass(EditorialTask);

EditorialTaskSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
EditorialTaskSchema.index({ projectId: 1, isActive: 1 });
