import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialScriptRepository } from '../repositories/editorial-script.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import {
  ICreateEditorialProject,
  IDuplicateEditorialProjectInput,
  IEditorialProject,
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
    @Optional()
    private readonly versionRepository?: EditorialVersionRepository,
    @Optional()
    private readonly calendarRepository?: EditorialCalendarRepository,
    @Optional()
    private readonly themeRepository?: EditorialThemeRepository,
    @Optional()
    private readonly scriptRepository?: EditorialScriptRepository,
    @Optional()
    private readonly mapaRepository?: EditorialMapaRepository,
  ) {}

  private async enrichProject(
    project: IEditorialProject,
  ): Promise<IEditorialProject> {
    if (
      !this.versionRepository ||
      !this.calendarRepository ||
      !this.themeRepository ||
      !this.scriptRepository
    ) {
      return project;
    }

    const projectId = String((project as any)._id || (project as any).id || '');
    if (!projectId) return project;

    const [versions, calendars, themes, scripts] = await Promise.all([
      this.versionRepository.findAllByProject(projectId),
      this.calendarRepository.findAllByProject(projectId),
      this.themeRepository.findAllByProject(projectId),
      this.scriptRepository.findAllByProject(projectId),
    ]);

    const activeVersion =
      versions.find((v) => v.status === 'active') || versions[0];
    const activeCalendar =
      calendars.find((c) => c.status === 'active') || calendars[0];

    const allocatedThemesCount = themes.filter(
      (t) => Array.isArray(t.allocatedSlotIds) && t.allocatedSlotIds.length > 0,
    ).length;

    const approvedScriptsCount = scripts.filter(
      (s) => s.status === 'pronto' || s.status === 'publicado',
    ).length;

    const draftScriptsCount = scripts.filter(
      (s) => s.status === 'rascunho' || s.status === 'in_production',
    ).length;

    const updatedAt = project.updatedAt ? new Date(project.updatedAt) : null;
    const updatedAtLabel = updatedAt
      ? updatedAt.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        })
      : undefined;

    return {
      ...project,
      id: projectId,
      currentObjectiveLabel:
        project.currentObjectiveLabel || project.currentObjective,
      hasActiveLineEditorial: Boolean(activeVersion),
      lineEditorialStatus:
        activeVersion?.status || project.editorialLineStatus || 'pending',
      hasActiveCalendar: Boolean(activeCalendar),
      themesCount: themes.length,
      allocatedThemesCount,
      approvedScriptsCount,
      draftScriptsCount,
      updatedAtLabel,
    };
  }

  async findAll(
    companyId: string,
    user: AuthUserPayload,
    requestedBrandId?: string,
  ): Promise<IEditorialProject[]> {
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

    let projects: IEditorialProject[] = [];

    if (isClientOrExternalRole(ctx.userRole)) {
      const allowedProjects = ctx.allowedProjectIds || [];
      if (allowedProjects.length === 0) {
        return [];
      }
      projects = await this.projectRepository.findAll({
        companyId: ctx.companyId,
        allowedProjectIds: allowedProjects,
        ...(requestedBrandId ? { brandIds: [requestedBrandId] } : {}),
      });
    } else if (ctx.isCompanyManager) {
      projects = await this.projectRepository.findAll({
        companyId: ctx.companyId,
        ...(requestedBrandId ? { brandIds: [requestedBrandId] } : {}),
      });
    } else {
      const allowedBrands = ctx.allowedBrandIds || [];
      if (requestedBrandId) {
        if (!allowedBrands.includes(String(requestedBrandId))) {
          throw new ForbiddenException(
            'Acesso negado: você não está vinculado a esta marca.',
          );
        }
        projects = await this.projectRepository.findAll({
          companyId: ctx.companyId,
          brandIds: [requestedBrandId],
        });
      } else {
        if (allowedBrands.length === 0) {
          return [];
        }
        projects = await this.projectRepository.findAll({
          companyId: ctx.companyId,
          brandIds: allowedBrands,
        });
      }
    }

    if (
      !this.versionRepository ||
      !this.calendarRepository ||
      !this.themeRepository ||
      !this.scriptRepository
    ) {
      return projects;
    }

    return Promise.all(projects.map((p) => this.enrichProject(p)));
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
      return this.enrichProject(project);
    }

    if (!ctx.isCompanyManager) {
      this.companyAccessService.assertCanAccessBrand(
        ctx,
        String(project.brandId),
      );
    }

    return this.enrichProject(project);
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

    const created = await this.projectRepository.create({
      ...data,
      brandOrClientName: data.brandOrClientName || brand.name,
      companyId: ctx.companyId,
      brandId: String(brand._id),
      createdBy: ctx.userId,
      orgId: 'altaire',
    });

    return this.enrichProject(created);
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
    return this.enrichProject(project);
  }

  async duplicate(
    id: string,
    user: AuthUserPayload,
    options?: Partial<IDuplicateEditorialProjectInput> & {
      name?: string;
      brandOrClientName?: string;
      includeActiveLine?: boolean;
    },
  ): Promise<IEditorialProject> {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para duplicar projetos.',
      );
    }

    const original = await this.findById(id, user);
    const userId = String(
      typeof user === 'string' ? user : user?.sub || user?.id || '',
    );

    const duplicatedName =
      options?.newName || options?.name || `${original.name} (Cópia)`;

    const created = await this.projectRepository.create({
      name: duplicatedName,
      brandOrClientName:
        options?.brandOrClientName || original.brandOrClientName,
      niche: original.niche,
      subniche: original.subniche,
      operationTypeLabel: original.operationTypeLabel,
      currentObjective: original.currentObjective,
      currentPhaseLabel: 'Setup inicial',
      status: 'draft',
      nextActionLabel: 'Revisar Linha Editorial importada',
      nextActionReason: `Projeto duplicado a partir de ${original.name}.`,
      createdBy: userId,
      companyId: String(original.companyId),
      brandId: String(original.brandId),
      orgId: original.orgId || 'altaire',
    });

    const newProjectId = String((created as any)._id || (created as any).id);
    const shouldCopyLine =
      options?.copyLineEditorial !== false &&
      options?.includeActiveLine !== false;

    if (shouldCopyLine && this.versionRepository && this.mapaRepository) {
      const versions = await this.versionRepository.findAllByProject(id);
      const sourceVersion =
        versions.find((v) => v.status === 'active') || versions[0];
      if (sourceVersion) {
        const sourceVersionId = String(
          (sourceVersion as any)._id || (sourceVersion as any).id,
        );
        const clonedVersion = await this.versionRepository.create({
          projectId: newProjectId,
          versionNumber: 1,
          name: sourceVersion.name,
          status: 'active',
          phaseTag: sourceVersion.phaseTag,
          strategicBase: sourceVersion.strategicBase,
          createdBy: userId,
        });
        const sourceMapa =
          await this.mapaRepository.findByVersionId(sourceVersionId);
        if (sourceMapa) {
          await this.mapaRepository.create({
            versionId: String(
              (clonedVersion as any)._id || (clonedVersion as any).id,
            ),
            versionNumber: 1,
            name: sourceMapa.name,
            positioningPhrase: sourceMapa.positioningPhrase,
            mensagemCentral: sourceMapa.mensagemCentral,
            pilares: sourceMapa.pilares || [],
            tomDeVoz: sourceMapa.tomDeVoz || { traits: [], rules: [] },
            retina: sourceMapa.retina || [],
          });
        }
        await this.projectRepository.update(newProjectId, {
          editorialLineStatus: 'active',
        });
      }
    }

    const refreshed = await this.projectRepository.findById(newProjectId);
    return this.enrichProject(refreshed || created);
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
