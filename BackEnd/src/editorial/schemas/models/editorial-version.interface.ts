export type VersionStatus = 'active' | 'archived';

export interface IEditorialVersion {
  _id?: string;
  id?: string;
  projectId: string;
  versionNumber: number;
  name: string;
  status: VersionStatus;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialVersion {
  projectId: string;
  versionNumber: number;
  name: string;
  createdBy: string;
}

export interface IUpdateEditorialVersion {
  name?: string;
  status?: VersionStatus;
}
