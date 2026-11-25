import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyFunctionDocument = HydratedDocument<CompanyFunction>;

@Schema({
  timestamps: true,
  collection: 'company_functions',
})
export class CompanyFunction {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;
}

export const CompanyFunctionSchema =
  SchemaFactory.createForClass(CompanyFunction);

CompanyFunctionSchema.index({ companyId: 1, isActive: 1 });
