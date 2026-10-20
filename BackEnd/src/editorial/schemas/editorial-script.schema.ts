import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type EditorialScriptDocument = EditorialScript & Document;

@Schema({ timestamps: true })
export class ScriptBlockSubDoc {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  type: string;

  @Prop()
  title?: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  visualDirection?: string;

  @Prop({ type: SchemaTypes.Mixed })
  modeSpecificData?: Record<string, unknown>;

  @Prop()
  timeRange?: string;
}

export const ScriptBlockSubDocSchema =
  SchemaFactory.createForClass(ScriptBlockSubDoc);

@Schema({ timestamps: true })
export class TitleSuggestionSubDoc {
  @Prop({ required: true })
  title: string;

  @Prop()
  hookType?: string;
}

export const TitleSuggestionSubDocSchema = SchemaFactory.createForClass(
  TitleSuggestionSubDoc,
);

@Schema({ timestamps: true })
export class ThumbnailPromptSubDoc {
  @Prop({ required: true })
  promptEn: string;

  @Prop()
  description?: string;

  @Prop()
  format?: string;
}

export const ThumbnailPromptSubDocSchema = SchemaFactory.createForClass(
  ThumbnailPromptSubDoc,
);

@Schema({ timestamps: true })
export class ComplementaryMaterialSubDoc {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  promise: string;

  @Prop({ type: [String], default: [] })
  structure: string[];

  @Prop({ type: Types.ObjectId })
  fileId?: Types.ObjectId;

  @Prop()
  downloadUrl?: string;

  @Prop({ required: true, default: 'gerando' })
  status: string;
}

export const ComplementaryMaterialSubDocSchema = SchemaFactory.createForClass(
  ComplementaryMaterialSubDoc,
);

@Schema({ timestamps: true })
export class ExplanationMaterialSubDoc {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId })
  fileId?: Types.ObjectId;

  @Prop()
  downloadUrl?: string;

  @Prop({ required: true, default: 'gerando' })
  status: string;
}

export const ExplanationMaterialSubDocSchema = SchemaFactory.createForClass(
  ExplanationMaterialSubDoc,
);

@Schema({ timestamps: true })
export class ScriptAttachmentSubDoc {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId })
  fileId?: Types.ObjectId;

  @Prop()
  fileName?: string;

  @Prop()
  fileUrl?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  parsedContent?: string;

  @Prop()
  source?: string;

  @Prop()
  formatTag?: string;
}

export const ScriptAttachmentSubDocSchema = SchemaFactory.createForClass(
  ScriptAttachmentSubDoc,
);

@Schema({ timestamps: true })
export class EditorialScript {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EditorialProject' })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  calendarSlotId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EditorialTheme' })
  themeId?: Types.ObjectId;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true, default: 'conexao' })
  mode: string;

  @Prop({ required: true, default: 'rascunho' })
  status: string;

  @Prop()
  title?: string;

  @Prop()
  provisionalName?: string;

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

  @Prop({ type: SchemaTypes.Mixed })
  briefing?: Record<string, unknown>;

  @Prop({ type: [ScriptAttachmentSubDocSchema], default: [] })
  attachments: ScriptAttachmentSubDoc[];

  @Prop({ required: true, type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialScriptSchema =
  SchemaFactory.createForClass(EditorialScript);

EditorialScriptSchema.index({ projectId: 1, isActive: 1, format: 1 });
EditorialScriptSchema.index({ calendarSlotId: 1 });
EditorialScriptSchema.index({ themeId: 1 });
