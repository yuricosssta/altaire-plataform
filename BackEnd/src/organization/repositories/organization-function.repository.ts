// BackEnd/src/organization/repositories/organization-function.repository.ts
import { IOrganizationFunction } from '../schemas/models/organization-function.interface';

export abstract class OrganizationFunctionRepository {
  abstract findAllByOrg(
    orgId: string,
    createdBy?: string,
  ): Promise<IOrganizationFunction[]>;

  abstract findById(id: string): Promise<IOrganizationFunction | null>;

  abstract create(data: {
    organizationId: string;
    name: string;
    description: string;
    createdBy: string;
  }): Promise<IOrganizationFunction>;

  abstract update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<IOrganizationFunction | null>;

  abstract softDelete(id: string): Promise<IOrganizationFunction | null>;
}
