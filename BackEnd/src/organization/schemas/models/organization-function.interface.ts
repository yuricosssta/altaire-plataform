// BackEnd/src/organization/schemas/models/organization-function.interface.ts
export interface IOrganizationFunction {
  _id: string;
  organizationId: string;
  name: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
