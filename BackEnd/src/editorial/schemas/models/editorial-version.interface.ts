export type VersionStatus =
  'active' | 'draft' | 'review_recommended' | 'archived';

export interface IEditorialVersion {
  _id?: string;
  id?: string;
  projectId: string;
  versionNumber: number;
  name: string;
  status: VersionStatus;
  phaseTag?: string;
  reviewReason?: string;
  strategicBase?: Record<string, unknown>;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialVersion {
  projectId: string;
  versionNumber: number;
  name: string;
  status?: VersionStatus;
  phaseTag?: string;
  reviewReason?: string;
  strategicBase?: Record<string, unknown>;
  createdBy: string;
}

export interface IUpdateEditorialVersion {
  name?: string;
  status?: VersionStatus;
  phaseTag?: string;
  reviewReason?: string;
  strategicBase?: Record<string, unknown>;
}
