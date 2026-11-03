// src/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRule } from './models/user.interface';

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

  @Prop({ required: false })
  avatarUrl?: string;

  @Prop({ required: false })
  resetPasswordToken: string;

  @Prop({ required: false })
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
