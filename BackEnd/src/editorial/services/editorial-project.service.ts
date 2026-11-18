import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
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

@Injectable()
export class EditorialProjectService {
  constructor(
    private readonly projectRepository: EditorialProjectRepository,
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
    orgId: string,
    createdBy?: string,
    allowedProjectIds?: string[],
  ): Promise<IEditorialProject[]> {
    let projects: IEditorialProject[];
    if (Array.isArray(allowedProjectIds)) {
      if (allowedProjectIds.length === 0) {
        return [];
      }
      projects = await this.projectRepository.findAll(
        orgId,
        undefined,
        allowedProjectIds,
      );
    } else if (createdBy) {
      projects = await this.projectRepository.findAll(orgId, createdBy);
    } else {
      projects = await this.projectRepository.findAll(orgId);
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

  async findById(id: string, userId?: string, allowedProjectIds?: string[]) {
    const project = await this.projectRepository.findById(id);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');

    if (Array.isArray(allowedProjectIds)) {
      const projectIdStr = String(
        (project as any)._id || (project as any).id || id,
      );
      if (!allowedProjectIds.map(String).includes(projectIdStr)) {
        throw new ForbiddenException(
          'Acesso negado: você não possui permissão para visualizar este projeto.',
        );
      }
      return this.enrichProject(project);
    }

    if (
      userId &&
      project.createdBy &&
      String(project.createdBy) !== String(userId)
    ) {
      throw new ForbiddenException(
        'Acesso negado: este projeto pertence a outro usuário.',
      );
    }
    return this.enrichProject(project);
  }

  async create(data: ICreateEditorialProject) {
    const created = await this.projectRepository.create(data);
    return this.enrichProject(created);
  }

  async update(id: string, data: IUpdateEditorialProject) {
    const project = await this.projectRepository.update(id, data);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');
    return this.enrichProject(project);
  }

  async duplicate(
    id: string,
    userId: string,
    options?: Partial<IDuplicateEditorialProjectInput> & {
      name?: string;
      brandOrClientName?: string;
      includeActiveLine?: boolean;
    },
  ): Promise<IEditorialProject> {
    const original = await this.projectRepository.findById(id);
    if (!original)
      throw new NotFoundException('Projeto editorial não encontrado.');

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

  async delete(id: string) {
    const project = await this.projectRepository.softDelete(id);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');
    return { message: 'Projeto editorial removido com sucesso.' };
  }
}
