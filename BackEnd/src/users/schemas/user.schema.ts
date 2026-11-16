// src/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRoleType, UserRule } from './models/user.interface';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false, default: 'local' })
  authProvider?: 'local' | 'google';

  @Prop({ required: true, default: false })
  isAdmin: boolean;

  @Prop({ required: true, default: 1 })
  rule: UserRule;

  @Prop({
    type: String,
    enum: ['OWNER', 'ADMIN', 'MEMBER', 'CLIENT', 'EXTERNAL'],
    default: 'MEMBER',
    required: true,
  })
  role: UserRoleType;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'EditorialProject' }],
    default: [],
  })
  allowedProjects: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  invitedBy?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'OrganizationFunction',
    required: false,
    default: null,
  })
  functionId?: Types.ObjectId | null;

  @Prop({ required: false })
  avatarUrl?: string;

  @Prop({ required: false })
  resetPasswordToken: string;

  @Prop({ required: false })
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
