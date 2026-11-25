import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyMemberDocument = HydratedDocument<CompanyMember>;

@Schema({
  timestamps: true,
  collection: 'company_members',
})
export class CompanyMember {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CompanyFunction',
    required: false,
    default: null,
  })
  functionId?: Types.ObjectId | null;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Brand' }],
    default: [],
  })
  brandIds: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'EditorialProject' }],
    default: [],
  })
  allowedProjects: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  invitedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;
}

export const CompanyMemberSchema = SchemaFactory.createForClass(CompanyMember);

CompanyMemberSchema.index({ companyId: 1, userId: 1 }, { unique: true });
CompanyMemberSchema.index({ userId: 1, isActive: 1 });
CompanyMemberSchema.index({ companyId: 1, functionId: 1, isActive: 1 });
