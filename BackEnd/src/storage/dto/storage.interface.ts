export type BrandAssetCategory =
  | 'logos'
  | 'paleta'
  | 'fotos'
  | 'templates'
  | 'broll'
  | 'guias';

export interface IFileAsset {
  _id?: string;
  id?: string;
  organizationId: string;
  companyId?: string;
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
