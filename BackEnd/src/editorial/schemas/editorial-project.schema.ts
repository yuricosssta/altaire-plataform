import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialProjectDocument = EditorialProject & Document;

@Schema({ timestamps: true })
export class EditorialProject {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  brandOrClientName?: string;

  @Prop({ required: true })
  niche: string;

  @Prop({ required: true })
  subniche: string;

  @Prop({ default: 'Orgânico' })
  operationTypeLabel?: string;

  @Prop({ required: true })
  currentObjective: string;

  @Prop({ default: 'Estruturação Inicial' })
  currentPhaseLabel?: string;

  @Prop({ default: 'in_setup' })
  status?: string;

  @Prop({ required: true, default: 'pending' })
  editorialLineStatus: string;

  @Prop({ required: true, default: 'pending' })
  calendarStatus: string;

  @Prop()
  nextActionLabel?: string;

  @Prop()
  nextActionReason?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ required: true, default: 'altaire' })
  orgId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Brand', index: true })
  brandId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const EditorialProjectSchema =
  SchemaFactory.createForClass(EditorialProject);

EditorialProjectSchema.index({
  companyId: 1,
  brandId: 1,
  isActive: 1,
  updatedAt: -1,
});
EditorialProjectSchema.index({ brandId: 1, isActive: 1 });
EditorialProjectSchema.index({ orgId: 1, isActive: 1, updatedAt: -1 });
