import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

class CompanySettings {
  @Prop({ type: String, required: false })
  logoUrl?: string;

  @Prop({ type: String, required: false })
  headerUrl?: string;

  @Prop({ type: String, required: false })
  footerUrl?: string;
}

@Schema({
  timestamps: true,
  collection: 'companies',
})
export class Company {
  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ required: true, uppercase: true, trim: true, maxlength: 4 })
  acronym: string;

  @Prop({ required: false, sparse: true, unique: true, trim: true })
  cnpj?: string;

  @Prop({ type: String, enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' })
  plan: string;

  @Prop({ type: Number, default: 0 })
  storageUsed: number;

  @Prop({ type: CompanySettings, default: {} })
  settings: CompanySettings;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.index({ organizationId: 1, isActive: 1 });
CompanySchema.index({ createdBy: 1, isActive: 1 });
CompanySchema.index({ name: 'text' });
