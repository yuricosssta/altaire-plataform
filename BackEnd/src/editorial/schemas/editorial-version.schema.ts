import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialVersionDocument = EditorialVersion & Document;

@Schema({ timestamps: true })
export class EditorialVersion {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialProject',
  })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  versionNumber: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 'active' })
  status: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialVersionSchema =
  SchemaFactory.createForClass(EditorialVersion);

EditorialVersionSchema.index({ projectId: 1, isActive: 1, versionNumber: -1 });
EditorialVersionSchema.index({ projectId: 1, versionNumber: -1 });
