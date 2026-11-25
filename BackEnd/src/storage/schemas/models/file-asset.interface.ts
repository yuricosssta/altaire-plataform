export interface IFileAsset {
  _id: string;
  organizationId: string;
  companyId: string;
  brandId?: string | null;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateFileAsset {
  organizationId: string;
  companyId: string;
  brandId?: string | null;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IFileAssetFilter {
  companyId: string;
  brandId?: string | null;
  allowedBrandIds?: string[];
  includeGeneral?: boolean;
}
