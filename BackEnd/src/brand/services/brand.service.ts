import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { BrandRepository } from '../repositories/brand.repository';
import {
  CompanyAccessService,
  AuthUserPayload,
} from '../../company/services/company-access.service';
import { EditorialProjectRepository } from '../../editorial/repositories/editorial-project.repository';
import { EditorialBrandStoryService } from '../../editorial/services/editorial-brand-story.service';
import { IBrand } from '../schemas/models/brand.interface';
import { CreateBrandInput, UpdateBrandInput } from '../validations/brand.zod';
import { IUpsertEditorialBrandStory } from '../../editorial/schemas/models/editorial-brand-story.interface';
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepo: BrandRepository,
    @Inject(forwardRef(() => CompanyAccessService))
    private readonly companyAccessService: CompanyAccessService,
    @Inject(forwardRef(() => EditorialProjectRepository))
    private readonly projectRepo: EditorialProjectRepository,
    @Inject(forwardRef(() => EditorialBrandStoryService))
    private readonly brandStoryService: EditorialBrandStoryService,
  ) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    return base || 'marca';
  }

  async findAllByCompany(
    companyId: string,
    user: AuthUserPayload,
  ): Promise<IBrand[]> {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (ctx.isCompanyManager) {
      return this.brandRepo.findAllByCompany(companyId);
    }

    if (isClientOrExternalRole(ctx.userRole)) {
      const allowedProjects = ctx.allowedProjectIds || [];
      if (allowedProjects.length === 0) return [];
      const visibleBrandIds = await this.projectRepo.findBrandIdsByProjectIds(
        companyId,
        allowedProjects,
      );
      if (visibleBrandIds.length === 0) return [];
      return this.brandRepo.findAllByCompany(companyId, visibleBrandIds);
    }

    return this.brandRepo.findAllByCompany(
      companyId,
      ctx.allowedBrandIds || [],
    );
  }

  async findById(brandId: string, user: AuthUserPayload): Promise<IBrand> {
    const brand = await this.brandRepo.findById(brandId);
    if (!brand) {
      throw new NotFoundException('Marca não encontrada.');
    }

    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      String(brand.companyId),
    );

    if (ctx.isCompanyManager) {
      return brand;
    }

    if (isClientOrExternalRole(ctx.userRole)) {
      const allowedProjects = ctx.allowedProjectIds || [];
      if (allowedProjects.length > 0) {
        const visibleBrandIds = await this.projectRepo.findBrandIdsByProjectIds(
          String(brand.companyId),
          allowedProjects,
        );
        if (visibleBrandIds.includes(String(brand._id))) {
          return brand;
        }
      }
      throw new ForbiddenException(
        'Acesso negado: você não possui projetos liberados nesta marca.',
      );
    }

    this.companyAccessService.assertCanAccessBrand(ctx, String(brand._id));
    return brand;
  }

  async create(
    companyId: string,
    data: CreateBrandInput,
    user: AuthUserPayload,
  ): Promise<IBrand> {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const baseSlug = data.slug || this.generateSlug(data.name);
    let slug = baseSlug;
    const existing = await this.brandRepo.findBySlugInCompany(companyId, slug);
    if (existing) {
      if (data.slug) {
        throw new BadRequestException(
          'Já existe uma marca com este slug nesta empresa.',
        );
      }
      slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return this.brandRepo.create({
      organizationId: ctx.organizationId,
      companyId: ctx.companyId,
      name: data.name,
      slug,
      description: data.description,
      logoUrl: data.logoUrl,
      niche: data.niche,
      createdBy: ctx.userId,
    });
  }

  async update(
    brandId: string,
    data: UpdateBrandInput,
    user: AuthUserPayload,
  ): Promise<IBrand> {
    const brand = await this.brandRepo.findById(brandId);
    if (!brand) {
      throw new NotFoundException('Marca não encontrada.');
    }

    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      String(brand.companyId),
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const updated = await this.brandRepo.update(brandId, data);
    if (!updated) {
      throw new NotFoundException('Marca não encontrada.');
    }
    return updated;
  }

  async softDelete(brandId: string, user: AuthUserPayload) {
    const brand = await this.brandRepo.findById(brandId);
    if (!brand) {
      throw new NotFoundException('Marca não encontrada.');
    }

    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      String(brand.companyId),
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const activeProjects = await this.projectRepo.countActiveByBrandId(brandId);
    if (activeProjects > 0) {
      throw new BadRequestException(
        'Não é possível excluir esta marca pois existem projetos editoriais ativos vinculados a ela.',
      );
    }

    await this.brandRepo.softDelete(brandId);
    return { message: 'Marca removida com sucesso.' };
  }

  async getBrandStory(brandId: string, user: AuthUserPayload) {
    const brand = await this.findById(brandId, user);
    return this.brandStoryService.getByBrand(
      String(brand._id),
      String(brand.companyId),
    );
  }

  async upsertBrandStory(
    brandId: string,
    data: IUpsertEditorialBrandStory,
    user: AuthUserPayload,
  ) {
    const brand = await this.findById(brandId, user);
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem editar o BrandStory da marca.',
      );
    }
    const userId = String(user?.sub || user?.id || '');
    return this.brandStoryService.upsertByBrand(
      String(brand._id),
      String(brand.companyId),
      data,
      userId,
    );
  }
}
