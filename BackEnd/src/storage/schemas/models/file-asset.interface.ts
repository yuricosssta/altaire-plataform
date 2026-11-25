import { BrandAssetCategory } from '../../dto/storage.interface';

export { BrandAssetCategory };

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
  title?: string;
  category?: BrandAssetCategory;
  projectScope?: string;
  formatLabel?: string;
  dimensionsOrSpec?: string;
  description?: string;
  aiUsageDirective?: string;
  hexPreview?: string;
  cssToken?: string;
  tags?: string[];
  isFavorite?: boolean;
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
  title?: string;
  category?: BrandAssetCategory;
  projectScope?: string;
  formatLabel?: string;
  dimensionsOrSpec?: string;
  description?: string;
  aiUsageDirective?: string;
  hexPreview?: string;
  cssToken?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface IUpdateFileAsset {
  brandId?: string | null;
  title?: string;
  category?: BrandAssetCategory;
  projectScope?: string;
  formatLabel?: string;
  dimensionsOrSpec?: string;
  description?: string;
  aiUsageDirective?: string;
  hexPreview?: string;
  cssToken?: string;
  tags?: string[];
  isFavorite?: boolean;
  fileName?: string;
  fileUrl?: string;
}

export interface IFileAssetFilter {
  companyId: string;
  brandId?: string | null;
  allowedBrandIds?: string[];
  includeGeneral?: boolean;
}
