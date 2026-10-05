import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialProjectDocument = EditorialProject & Document;

@Schema({ timestamps: true })
export class EditorialProject {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  niche: string;

  @Prop({ required: true })
  subniche: string;

  @Prop({ required: true })
  currentObjective: string;

  @Prop({ required: true, default: 'pending' })
  editorialLineStatus: string;

  @Prop({ required: true, default: 'pending' })
  calendarStatus: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: string;

  @Prop({ required: true, default: 'altaire' })
  orgId: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const EditorialProjectSchema =
  SchemaFactory.createForClass(EditorialProject);

EditorialProjectSchema.index({ orgId: 1, isActive: 1, updatedAt: -1 });
