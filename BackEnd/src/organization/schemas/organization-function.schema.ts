// BackEnd/src/organization/schemas/organization-function.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationFunctionDocument =
  HydratedDocument<OrganizationFunction>;

@Schema({
  timestamps: true,
  collection: 'organization_functions',
})
export class OrganizationFunction {
  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId: Types.ObjectId;

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

export const OrganizationFunctionSchema =
  SchemaFactory.createForClass(OrganizationFunction);

OrganizationFunctionSchema.index({
  organizationId: 1,
  isActive: 1,
  createdBy: 1,
});
