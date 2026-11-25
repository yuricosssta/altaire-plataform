export interface IEditorialActivityLog {
  _id?: string;
  id?: string;
  userId: string;
  orgId: string;
  projectId: string;
  projectName: string;
  label: string;
  resourceHref: string;
  occurredAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialActivityLog {
  userId: string;
  orgId: string;
  projectId: string;
  projectName: string;
  label: string;
  resourceHref: string;
  occurredAt?: Date;
}
