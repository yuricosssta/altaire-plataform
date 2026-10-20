import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialBrandStoryDocument = EditorialBrandStory & Document;

@Schema()
export class UsableStorySubDoc {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const UsableStorySubDocSchema =
  SchemaFactory.createForClass(UsableStorySubDoc);

@Schema({ timestamps: true })
export class EditorialBrandStory {
  @Prop({ required: true, default: 'altaire' })
  organizationId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: '' })
  originStory: string;

  @Prop({ type: [String], default: [] })
  keyTurnarounds: string[];

  @Prop({ type: [String], default: [] })
  failures: string[];

  @Prop({ type: [String], default: [] })
  achievements: string[];

  @Prop({ type: [String], default: [] })
  values: string[];

  @Prop({ required: true, default: '' })
  lifestyle: string;

  @Prop({ type: [UsableStorySubDocSchema], default: [] })
  usableStories: UsableStorySubDoc[];
}

export const EditorialBrandStorySchema =
  SchemaFactory.createForClass(EditorialBrandStory);

EditorialBrandStorySchema.index(
  { userId: 1, organizationId: 1 },
  { unique: true },
);
