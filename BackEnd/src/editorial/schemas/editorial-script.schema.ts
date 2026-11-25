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

  @Prop({ type: SchemaTypes.Mixed })
  calendarSlotId?: Types.ObjectId | string;

  @Prop({ type: SchemaTypes.Mixed })
  themeId?: Types.ObjectId | string;

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

  // Campos ricos do Studio (RoteirosEditorialModule)
  @Prop()
  formatSlug?: string;

  @Prop()
  calendarSlotFormat?: string;

  @Prop()
  originType?: string;

  @Prop()
  linkedSlotId?: string;

  @Prop()
  linkedSlotLabel?: string;

  @Prop()
  linkedThemeId?: string;

  @Prop()
  retinaType?: string;

  @Prop()
  strategicObjective?: string;

  @Prop()
  editorialPillar?: string;

  @Prop()
  icpPainOrObjection?: string;

  @Prop()
  businessMoment?: string;

  @Prop()
  platform?: string;

  @Prop()
  estimatedDurationOrSize?: string;

  @Prop()
  speakingMode?: string;

  @Prop()
  versionLabel?: string;

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  scriptBlocks?: Record<string, unknown>[];

  @Prop({ type: [String], default: [] })
  connectionSevenLinesChecklist?: string[];

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  carouselSlides?: Record<string, unknown>[];

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  storyPeriods?: Record<string, unknown>[];

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  predictiveQAs?: Record<string, unknown>[];

  @Prop({ type: [String], default: [] })
  postLiveStoriesSummary?: string[];

  @Prop()
  captionOutdoorHook?: string;

  @Prop()
  captionBody?: string;

  @Prop()
  captionCta?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[];

  @Prop({ type: [String], default: [] })
  seoTags?: string[];

  @Prop({ type: [String], default: [] })
  youtubeChapters?: string[];

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  titleVariations?: Record<string, unknown>[];

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  imagePrompts?: Record<string, unknown>[];

  @Prop({ default: false })
  qualifiedForComplementaryMaterial?: boolean;

  @Prop({ type: SchemaTypes.Mixed })
  complementaryMaterial?: Record<string, unknown>;

  @Prop({ type: SchemaTypes.Mixed })
  explanationMaterial?: Record<string, unknown>;

  @Prop()
  briefingCutAdjustment?: string;

  @Prop()
  mandatoryExamplesToInclude?: string;

  @Prop()
  brandStoryConnection?: string;

  @Prop()
  selectedReferenceNote?: string;

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  versionHistory?: Record<string, unknown>[];

  @Prop({ default: false })
  isFavorite?: boolean;

  @Prop()
  adaptedFromId?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const EditorialScriptSchema =
  SchemaFactory.createForClass(EditorialScript);

EditorialScriptSchema.index({ projectId: 1, isActive: 1, format: 1 });
EditorialScriptSchema.index({ projectId: 1, status: 1 });
