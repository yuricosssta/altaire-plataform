import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialVersionDocument = EditorialVersion & Document;

@Schema({ timestamps: true })
export class EditorialVersion {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialProject',
    name: 'pid',
  })
  projectId: Types.ObjectId;

  @Prop({ required: true, name: 'vn' })
  versionNumber: number;

  @Prop({ required: true, name: 'n' })
  name: string;

  @Prop({ required: true, default: 'active', name: 'st' })
  status: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', name: 'cb' })
  createdBy: Types.ObjectId;

  @Prop({ default: true, name: 'ia' })
  isActive: boolean;
}

export const EditorialVersionSchema =
  SchemaFactory.createForClass(EditorialVersion);

EditorialVersionSchema.index({ pid: 1, ia: 1, vn: -1 });
EditorialVersionSchema.index({ pid: 1, vn: -1 });
