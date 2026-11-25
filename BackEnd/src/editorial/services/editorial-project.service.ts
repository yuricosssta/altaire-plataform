import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import {
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../schemas/models/editorial-project.interface';
import {
  CompanyAccessService,
  AuthUserPayload,
} from '../../company/services/company-access.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class EditorialProjectService {
  constructor(
    private readonly projectRepository: EditorialProjectRepository,
    @Inject(forwardRef(() => CompanyAccessService))
    private readonly companyAccessService: CompanyAccessService,
    @Inject(forwardRef(() => BrandRepository))
    private readonly brandRepository: BrandRepository,
  ) {}

  async findAll(
    companyId: string,
    user: AuthUserPayload,
    requestedBrandId?: string,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (requestedBrandId) {
      if (!OBJECT_ID_REGEX.test(requestedBrandId)) {
        throw new BadRequestException('ID da marca inválido.');
      }
      const brand = await this.brandRepository.findById(requestedBrandId);
      if (!brand || String(brand.companyId) !== String(ctx.companyId)) {
        throw new NotFoundException('Marca não encontrada nesta empresa.');
      }
    }

    if (isClientOrExternalRole(ctx.userRole)) {
      const allowedProjects = ctx.allowedProjectIds || [];
      if (allowedProjects.length === 0) {
        return [];
      }
      return this.projectRepository.findAll({
        companyId: ctx.companyId,
        allowedProjectIds: allowedProjects,
        ...(requestedBrandId ? { brandIds: [requestedBrandId] } : {}),
      });
    }

    if (ctx.isCompanyManager) {
      return this.projectRepository.findAll({
        companyId: ctx.companyId,
        ...(requestedBrandId ? { brandIds: [requestedBrandId] } : {}),
      });
    }

    const allowedBrands = ctx.allowedBrandIds || [];
    if (requestedBrandId) {
      if (!allowedBrands.includes(String(requestedBrandId))) {
        throw new ForbiddenException(
          'Acesso negado: você não está vinculado a esta marca.',
        );
      }
      return this.projectRepository.findAll({
        companyId: ctx.companyId,
        brandIds: [requestedBrandId],
      });
    }

    if (allowedBrands.length === 0) {
      return [];
    }

    return this.projectRepository.findAll({
      companyId: ctx.companyId,
      brandIds: allowedBrands,
    });
  }

  async findById(id: string, user: AuthUserPayload) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Projeto editorial não encontrado.');
    }

    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      String(project.companyId),
    );

    if (isClientOrExternalRole(ctx.userRole)) {
      const allowed = (ctx.allowedProjectIds || []).map(String);
      const projectIdStr = String(project._id || project.id || id);
      if (!allowed.includes(projectIdStr)) {
        throw new ForbiddenException(
          'Acesso negado: você não possui permissão para visualizar este projeto.',
        );
      }
      return project;
    }

    if (!ctx.isCompanyManager) {
      this.companyAccessService.assertCanAccessBrand(
        ctx,
        String(project.brandId),
      );
    }

    return project;
  }

  async create(
    companyId: string,
    data: Omit<ICreateEditorialProject, 'companyId' | 'createdBy'>,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );

    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para criar projetos.',
      );
    }

    const brand = await this.brandRepository.findById(data.brandId);
    if (!brand || String(brand.companyId) !== String(ctx.companyId)) {
      throw new BadRequestException(
        'Marca não encontrada ou não pertence à empresa selecionada.',
      );
    }

    if (!ctx.isCompanyManager) {
      this.companyAccessService.assertCanAccessBrand(ctx, String(brand._id));
    }

    return this.projectRepository.create({
      ...data,
      companyId: ctx.companyId,
      brandId: String(brand._id),
      createdBy: ctx.userId,
      orgId: 'altaire',
    });
  }

  async update(
    id: string,
    data: IUpdateEditorialProject,
    user: AuthUserPayload,
  ) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para editar configurações do projeto.',
      );
    }

    await this.findById(id, user);

    const project = await this.projectRepository.update(id, data);
    if (!project) {
      throw new NotFoundException('Projeto editorial não encontrado.');
    }
    return project;
  }

  async delete(id: string, user: AuthUserPayload) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para excluir projetos.',
      );
    }

    await this.findById(id, user);

    const project = await this.projectRepository.softDelete(id);
    if (!project) {
      throw new NotFoundException('Projeto editorial não encontrado.');
    }
    return { message: 'Projeto editorial removido com sucesso.' };
  }
}
