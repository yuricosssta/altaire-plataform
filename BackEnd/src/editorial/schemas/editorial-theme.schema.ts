import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialThemeDocument = EditorialTheme & Document;

@Schema({ timestamps: true })
export class EditorialTheme {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EditorialProject' })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  pillar: string;

  @Prop({ required: true })
  retinaType: string;

  @Prop({ required: true })
  consciousnessLevel: string;

  @Prop({ required: true })
  journeyStage: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true, type: [String] })
  platforms: string[];

  @Prop({ required: true, default: 'active' })
  status: string;

  @Prop({ type: [String], default: [] })
  flags: string[];

  @Prop()
  sourceContext?: string;

  @Prop()
  batchId?: string;

  @Prop()
  angle?: string;

  @Prop()
  approach?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialThemeSchema =
  SchemaFactory.createForClass(EditorialTheme);

EditorialThemeSchema.index({ projectId: 1, isActive: 1, status: 1 });
EditorialThemeSchema.index({ projectId: 1, batchId: 1 });
EditorialThemeSchema.index({ projectId: 1, format: 1 });
