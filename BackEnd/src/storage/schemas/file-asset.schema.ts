import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileAssetDocument = FileAsset & Document;

@Schema({ timestamps: true })
export class FileAsset {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ default: '' })
  fileUrl: string;

  @Prop({ default: 'application/octet-stream' })
  mimeType: string;

  @Prop({ default: 0 })
  sizeBytes: number;

  @Prop()
  title?: string;

  @Prop({
    type: String,
    enum: ['logos', 'paleta', 'fotos', 'templates', 'broll', 'guias'],
    default: 'guias',
  })
  category?: string;

  @Prop({ default: 'Acervo Global da Marca' })
  projectScope?: string;

  @Prop()
  formatLabel?: string;

  @Prop()
  dimensionsOrSpec?: string;

  @Prop()
  description?: string;

  @Prop()
  aiUsageDirective?: string;

  @Prop()
  hexPreview?: string;

  @Prop()
  cssToken?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: false })
  isFavorite?: boolean;
}

export const FileAssetSchema = SchemaFactory.createForClass(FileAsset);
