import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileAssetRepository } from '../repositories/file-asset.repository';
import { CompanyRepository } from '../../company/repositories/company.repository';
import {
  CompanyAccessService,
  AuthUserPayload,
} from '../../company/services/company-access.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';
import { IFileAsset as IDtoFileAsset } from '../dto/storage.interface';
import { IUpdateFileAsset } from '../schemas/models/file-asset.interface';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME;
  private publicDomain = process.env.R2_PUBLIC_DOMAIN;

  private readonly LIMITS = {
    FREE: 500 * 1024 * 1024,
    PRO: 50 * 1024 * 1024 * 1024,
    ENTERPRISE: 500 * 1024 * 1024 * 1024,
  };

  constructor(
    private readonly fileAssetRepo: FileAssetRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly companyAccessService: CompanyAccessService,
    private readonly brandRepo: BrandRepository,
  ) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  private async validateBrandScopeIfProvided(
    companyId: string,
    brandId: string | undefined | null,
    user: AuthUserPayload,
    requireWrite = false,
  ): Promise<string | null> {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (requireWrite && isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para enviar arquivos.',
      );
    }

    if (!brandId) {
      return null;
    }

    if (!OBJECT_ID_REGEX.test(String(brandId))) {
      throw new BadRequestException('ID da marca inválido.');
    }

    const brand = await this.brandRepo.findById(String(brandId));
    if (!brand || String(brand.companyId) !== String(ctx.companyId)) {
      throw new NotFoundException('Marca não encontrada nesta empresa.');
    }

    if (!ctx.isCompanyManager) {
      this.companyAccessService.assertCanAccessBrand(ctx, String(brand._id));
    }

    return String(brand._id);
  }

  async getPresignedUploadUrl(
    companyId: string,
    user: AuthUserPayload,
    fileName: string,
    fileType: string,
    sizeBytes: number,
    brandId?: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const validBrandId = await this.validateBrandScopeIfProvided(
      companyId,
      brandId,
      user,
      true,
    );

    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new ForbiddenException('Empresa não encontrada.');
    }

    const limit =
      this.LIMITS[company.plan as keyof typeof this.LIMITS] || this.LIMITS.FREE;

    if ((company.storageUsed || 0) + sizeBytes > limit) {
      throw new ForbiddenException(
        `LIMITE DE ARMAZENAMENTO EXCEDIDO: Seu plano permite até ${limit / (1024 * 1024)}MB. Faça upgrade para liberar mais espaço.`,
      );
    }

    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const datePrefix = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '/');
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const brandScope = validBrandId || 'general';
      const fileKey = `${company._id}/${brandScope}/${datePrefix}/${uniqueId}-${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60,
      });
      const fileUrl = `${this.publicDomain}/${fileKey}`;

      return { uploadUrl, fileUrl };
    } catch (error) {
      console.error('Erro ao gerar URL de upload do R2:', error);
      throw new InternalServerErrorException(
        'Falha ao comunicar com o servidor de arquivos.',
      );
    }
  }

  async confirmUploadAndRegister(
    companyId: string,
    user: AuthUserPayload,
    payload: {
      fileUrl: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      brandId?: string;
    } & Partial<IDtoFileAsset>,
  ) {
    const validBrandId = await this.validateBrandScopeIfProvided(
      companyId,
      payload.brandId,
      user,
      true,
    );

    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const userId = String(user?.sub || user?.id || '');
    const sizeBytes = Number(payload.sizeBytes) || 0;
    const newAsset = await this.fileAssetRepo.create({
      organizationId: company.organizationId,
      companyId: company._id,
      brandId: validBrandId,
      uploadedBy: userId,
      fileName: payload.fileName,
      fileUrl: payload.fileUrl,
      mimeType: payload.mimeType,
      sizeBytes,
      title: payload.title || payload.fileName,
      category: payload.category || 'guias',
      projectScope: payload.projectScope || 'Acervo Global da Marca',
      formatLabel: payload.formatLabel,
      dimensionsOrSpec: payload.dimensionsOrSpec,
      description: payload.description,
      aiUsageDirective: payload.aiUsageDirective,
      hexPreview: payload.hexPreview,
      cssToken: payload.cssToken,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      isFavorite: Boolean(payload.isFavorite),
    });

    if (sizeBytes > 0) {
      await this.companyRepo.incrementStorageUsed(company._id, sizeBytes);
    }

    return newAsset;
  }

  async createBrandAsset(
    companyId: string,
    user: AuthUserPayload,
    data: Partial<IDtoFileAsset>,
  ) {
    const validBrandId = await this.validateBrandScopeIfProvided(
      companyId,
      data.brandId,
      user,
      true,
    );

    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const userId = String(user?.sub || user?.id || '');
    const sizeBytes = Number(data.sizeBytes) || 0;
    const newAsset = await this.fileAssetRepo.create({
      organizationId: company.organizationId,
      companyId: company._id,
      brandId: validBrandId,
      uploadedBy: userId,
      fileName: data.fileName || data.title || 'brand-asset',
      fileUrl: data.fileUrl || '',
      mimeType: data.mimeType || 'application/x-brand-asset',
      sizeBytes,
      title: data.title || data.fileName || 'Novo Recurso da Marca',
      category: data.category || 'guias',
      projectScope: data.projectScope || 'Acervo Global da Marca',
      formatLabel: data.formatLabel,
      dimensionsOrSpec: data.dimensionsOrSpec,
      description: data.description,
      aiUsageDirective: data.aiUsageDirective,
      hexPreview: data.hexPreview,
      cssToken: data.cssToken,
      tags: Array.isArray(data.tags) ? data.tags : [],
      isFavorite: Boolean(data.isFavorite),
    });

    if (sizeBytes > 0) {
      await this.companyRepo.incrementStorageUsed(company._id, sizeBytes);
    }

    return newAsset;
  }

  async updateBrandAsset(
    companyId: string,
    assetId: string,
    user: AuthUserPayload,
    data: Partial<IDtoFileAsset>,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para editar ativos.',
      );
    }

    const existing = await this.fileAssetRepo.findByIdInCompany(
      ctx.companyId,
      assetId,
    );
    if (!existing) {
      throw new NotFoundException(
        'Arquivo ou ativo de marca não encontrado ou sem permissão para editar.',
      );
    }

    if (!ctx.isCompanyManager && String(existing.uploadedBy) !== ctx.userId) {
      throw new ForbiddenException(
        'Sem permissão para editar um ativo criado por outro usuário.',
      );
    }

    const allowedKeys: (keyof IUpdateFileAsset)[] = [
      'title',
      'category',
      'projectScope',
      'formatLabel',
      'dimensionsOrSpec',
      'description',
      'aiUsageDirective',
      'hexPreview',
      'cssToken',
      'tags',
      'isFavorite',
      'fileName',
      'fileUrl',
    ];
    const updateSet: IUpdateFileAsset = {};
    for (const key of allowedKeys) {
      if ((data as any)[key] !== undefined) {
        (updateSet as any)[key] = (data as any)[key];
      }
    }

    if (data.brandId !== undefined) {
      updateSet.brandId = await this.validateBrandScopeIfProvided(
        ctx.companyId,
        data.brandId,
        user,
        true,
      );
    }

    const updated = await this.fileAssetRepo.updateByIdInCompany(
      ctx.companyId,
      assetId,
      updateSet,
    );
    if (!updated) {
      throw new NotFoundException(
        'Arquivo ou ativo de marca não encontrado ou sem permissão para editar.',
      );
    }
    return updated;
  }

  async getCompanyAssets(
    companyId: string,
    user: AuthUserPayload,
    requestedBrandId?: string,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    const company = await this.companyRepo.findById(ctx.companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    if (isClientOrExternalRole(ctx.userRole)) {
      return {
        storageUsed: company.storageUsed || 0,
        assets: [],
      };
    }

    if (requestedBrandId) {
      const validBrandId = await this.validateBrandScopeIfProvided(
        ctx.companyId,
        requestedBrandId,
        user,
        false,
      );
      const assets = await this.fileAssetRepo.findAll({
        companyId: ctx.companyId,
        brandId: validBrandId,
      });
      return {
        storageUsed: company.storageUsed || 0,
        assets,
      };
    }

    if (ctx.isCompanyManager) {
      const assets = await this.fileAssetRepo.findAll({
        companyId: ctx.companyId,
      });
      return {
        storageUsed: company.storageUsed || 0,
        assets,
      };
    }

    const assets = await this.fileAssetRepo.findAll({
      companyId: ctx.companyId,
      allowedBrandIds: ctx.allowedBrandIds || [],
      includeGeneral: true,
    });

    return {
      storageUsed: company.storageUsed || 0,
      assets,
    };
  }

  async deleteAsset(companyId: string, assetId: string, user: AuthUserPayload) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem excluir arquivos.',
      );
    }

    const asset = await this.fileAssetRepo.findByIdInCompany(
      ctx.companyId,
      assetId,
    );

    if (!asset) {
      throw new ForbiddenException(
        'Arquivo não encontrado ou sem permissão para exclusão.',
      );
    }

    if (!ctx.isCompanyManager && String(asset.uploadedBy) !== ctx.userId) {
      throw new ForbiddenException(
        'Sem permissão para excluir um arquivo enviado por outro usuário.',
      );
    }

    if (asset.fileUrl && asset.fileUrl.startsWith('http') && this.bucketName) {
      const fileKey = this.publicDomain
        ? asset.fileUrl.replace(`${this.publicDomain}/`, '')
        : asset.fileUrl;

      try {
        await (this.s3Client as any).send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
          }),
        );
      } catch (error) {
        console.error('Erro ao deletar arquivo no R2:', error);
        throw new InternalServerErrorException(
          'Falha ao excluir o arquivo físico na nuvem.',
        );
      }
    }

    await this.fileAssetRepo.deleteById(asset._id);
    if ((Number(asset.sizeBytes) || 0) > 0) {
      await this.companyRepo.incrementStorageUsed(
        ctx.companyId,
        -Math.abs(asset.sizeBytes),
      );
    }

    return { message: 'Arquivo excluído e espaço liberado com sucesso.' };
  }
}
