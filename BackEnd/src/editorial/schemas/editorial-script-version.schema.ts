import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ComplementaryMaterialSubDoc,
  ComplementaryMaterialSubDocSchema,
  ExplanationMaterialSubDoc,
  ExplanationMaterialSubDocSchema,
  ScriptBlockSubDoc,
  ScriptBlockSubDocSchema,
  ThumbnailPromptSubDoc,
  ThumbnailPromptSubDocSchema,
  TitleSuggestionSubDoc,
  TitleSuggestionSubDocSchema,
} from './editorial-script.schema';

export type EditorialScriptVersionDocument = EditorialScriptVersion & Document;

@Schema({ timestamps: true })
export class EditorialScriptVersion {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EditorialScript' })
  scriptId: Types.ObjectId;

  @Prop({ required: true })
  versionNumber: number;

  @Prop()
  comment?: string;

  @Prop({ type: [ScriptBlockSubDocSchema], default: [] })
  blocks: ScriptBlockSubDoc[];

  @Prop()
  caption?: string;

  @Prop({ type: [TitleSuggestionSubDocSchema], default: [] })
  titles: TitleSuggestionSubDoc[];

  @Prop({ type: [ThumbnailPromptSubDocSchema], default: [] })
  thumbnailPrompts: ThumbnailPromptSubDoc[];

  @Prop({ type: [ComplementaryMaterialSubDocSchema], default: [] })
  complementaryMaterials: ComplementaryMaterialSubDoc[];

  @Prop({ type: [ExplanationMaterialSubDocSchema], default: [] })
  explanationMaterials: ExplanationMaterialSubDoc[];

  @Prop({ required: true, type: Types.ObjectId })
  createdBy: Types.ObjectId;
}

export const EditorialScriptVersionSchema = SchemaFactory.createForClass(
  EditorialScriptVersion,
);

EditorialScriptVersionSchema.index({ scriptId: 1, versionNumber: -1 });
