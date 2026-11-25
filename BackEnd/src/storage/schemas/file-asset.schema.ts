import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileAssetDocument = FileAsset & Document;

@Schema({ timestamps: true })
export class FileAsset {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId: Types.ObjectId;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'Brand',
    default: null,
    index: true,
  })
  brandId?: Types.ObjectId | null;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;
}

export const FileAssetSchema = SchemaFactory.createForClass(FileAsset);

FileAssetSchema.index({ companyId: 1, brandId: 1, createdAt: -1 });
