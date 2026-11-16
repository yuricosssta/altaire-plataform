//src/organization/schemas/models/organization-member.interface.ts
import { IOrganization, RoleType } from './organization.interface';

export interface ICustomFunctionSummary {
  _id: string;
  name: string;
  description: string;
}

export interface IOrganizationMember {
  _id: string;
  organizationId: IOrganization;
  userId: string;
  role: RoleType;
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
  functionId?: string | null;
  customFunction?: ICustomFunctionSummary | null;
  createdAt?: string;
  function?: string;
}
