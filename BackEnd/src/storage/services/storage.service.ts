//src/storage/services/storage.service.ts
import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OrganizationDocument,
  Organization,
} from '../../organization/schemas/organization.schema';
import { FileAsset, FileAssetDocument } from '../schemas/file-asset.schema';
import { IFileAsset } from '../dto/storage.interface';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME;
  private publicDomain = process.env.R2_PUBLIC_DOMAIN;

  // Limites em Bytes (500MB, 50GB, 500GB)
  private readonly LIMITS = {
    FREE: 500 * 1024 * 1024,
    PRO: 50 * 1024 * 1024 * 1024,
    ENTERPRISE: 500 * 1024 * 1024 * 1024,
  };

  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
    @InjectModel(FileAsset.name)
    private fileAssetModel: Model<FileAssetDocument>,
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

  private async resolveOrg(
    orgId: string,
    selectFields = '_id plan storageUsed',
  ) {
    if ((Types.ObjectId as any).isValid(orgId)) {
      const byId = await this.orgModel
        .findById(orgId)
        .select(selectFields)
        .exec();
      if (byId) return byId;
    }
    return this.orgModel
      .findOne({ slug: orgId || 'altaire' })
      .select(selectFields)
      .exec()
      .then((doc) =>
        doc
          ? doc
          : this.orgModel.findOne({ slug: 'altaire' }).select(selectFields).exec(),
      );
  }

  async getPresignedUploadUrl(
    orgId: string,
    fileName: string,
    fileType: string,
    sizeBytes: number,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const org = await this.resolveOrg(orgId, '_id plan storageUsed');
    if (!org) throw new ForbiddenException('Organização não encontrada.');

    const limit =
      this.LIMITS[org.plan as keyof typeof this.LIMITS] || this.LIMITS.FREE;

    if ((org.storageUsed || 0) + sizeBytes > limit) {
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
      const fileKey = `${org._id}/${datePrefix}/${uniqueId}-${cleanFileName}`;

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
    orgId: string,
    userId: string,
    fileUrl: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    metadata?: Partial<IFileAsset>,
  ) {
    const org = await this.resolveOrg(orgId, '_id');
    if (!org)
      throw new InternalServerErrorException('Organização não encontrada.');

    const userObjectId = (Types.ObjectId as any).isValid(userId)
      ? new (Types.ObjectId as any)(String(userId))
      : new (Types.ObjectId as any)();

    const newAsset = new this.fileAssetModel({
      organizationId: org._id,
      uploadedBy: userObjectId,
      fileName,
      fileUrl,
      mimeType,
      sizeBytes,
      title: metadata?.title || fileName,
      category: metadata?.category || 'guias',
      projectScope: metadata?.projectScope || 'Acervo Global da Marca',
      formatLabel: metadata?.formatLabel,
      dimensionsOrSpec: metadata?.dimensionsOrSpec,
      description: metadata?.description,
      aiUsageDirective: metadata?.aiUsageDirective,
      hexPreview: metadata?.hexPreview,
      cssToken: metadata?.cssToken,
      tags: metadata?.tags || [],
      isFavorite: Boolean(metadata?.isFavorite),
    });
    await newAsset.save();

    if (sizeBytes > 0) {
      await this.orgModel.findByIdAndUpdate(org._id, {
        $inc: { storageUsed: sizeBytes },
      });
    }

    return newAsset;
  }

  async createBrandAsset(
    orgId: string,
    userId: string,
    data: Partial<IFileAsset>,
  ) {
    const org = await this.resolveOrg(orgId, '_id');
    if (!org)
      throw new InternalServerErrorException('Organização não encontrada.');

    const userObjectId = (Types.ObjectId as any).isValid(userId)
      ? new (Types.ObjectId as any)(String(userId))
      : new (Types.ObjectId as any)();

    const sizeBytes = Number(data.sizeBytes) || 0;
    const newAsset = new this.fileAssetModel({
      organizationId: org._id,
      uploadedBy: userObjectId,
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
    await newAsset.save();

    if (sizeBytes > 0) {
      await this.orgModel.findByIdAndUpdate(org._id, {
        $inc: { storageUsed: sizeBytes },
      });
    }

    return newAsset.toObject();
  }

  async updateBrandAsset(
    orgId: string,
    assetId: string,
    data: Partial<IFileAsset>,
    userId?: string,
  ) {
    if (!(Types.ObjectId as any).isValid(assetId)) {
      throw new NotFoundException('Ativo não encontrado.');
    }
    const org = await this.resolveOrg(orgId, '_id');
    const query: Record<string, any> = {
      _id: new (Types.ObjectId as any)(String(assetId)),
    };
    if (org) {
      query.organizationId = org._id;
    }
    if (userId && (Types.ObjectId as any).isValid(userId)) {
      query.uploadedBy = new (Types.ObjectId as any)(String(userId));
    }

    const allowedKeys = [
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
    const updateSet: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if ((data as any)[key] !== undefined) {
        updateSet[key] = (data as any)[key];
      }
    }

    const updated = await this.fileAssetModel
      .findOneAndUpdate(query, { $set: updateSet }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        'Arquivo ou ativo de marca não encontrado ou sem permissão para editar.',
      );
    }
    return updated;
  }

  // LISTAGEM DE ARQUIVOS (Isolado por usuário se userId for informado)
  async getOrganizationAssets(orgId: string, userId?: string) {
    const org = await this.resolveOrg(orgId, '_id storageUsed');

    if (!org)
      throw new InternalServerErrorException('Organização não encontrada.');

    const filter: Record<string, any> = {
      organizationId: org._id,
    };

    if (userId && (Types.ObjectId as any).isValid(userId)) {
      filter.uploadedBy = new (Types.ObjectId as any)(String(userId));
    }

    const assets = await this.fileAssetModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const userStorageUsed = userId
      ? assets.reduce((sum, a: any) => sum + (Number(a.sizeBytes) || 0), 0)
      : org.storageUsed || 0;

    return {
      storageUsed: userStorageUsed,
      assets,
    };
  }

  // EXCLUSÃO DE ARQUIVOS (Banco + Nuvem quando há fileUrl R2)
  async deleteAsset(orgId: string, assetId: string, userId?: string) {
    const org = await this.resolveOrg(orgId, '_id');

    const query: Record<string, any> = {
      _id: new (Types.ObjectId as any)(String(assetId)),
    };
    if (org) {
      query.organizationId = org._id;
    }
    if (userId && (Types.ObjectId as any).isValid(userId)) {
      query.uploadedBy = new (Types.ObjectId as any)(String(userId));
    }

    const asset = await this.fileAssetModel.findOne(query);

    if (!asset) {
      throw new ForbiddenException(
        'Arquivo não encontrado ou sem permissão para exclusão.',
      );
    }

    if (
      asset.fileUrl &&
      asset.fileUrl.startsWith('http') &&
      this.bucketName
    ) {
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

    await this.fileAssetModel.findByIdAndDelete(asset._id);

    if (org && (Number(asset.sizeBytes) || 0) > 0) {
      await this.orgModel.findByIdAndUpdate(org._id, {
        $inc: { storageUsed: -Math.abs(asset.sizeBytes) },
      });
    }

    return { message: 'Arquivo excluído e espaço liberado com sucesso.' };
  }
}
