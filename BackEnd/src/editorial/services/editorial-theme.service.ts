import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialCalendarThemeVersionRepository } from '../repositories/editorial-calendar-theme-version.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { ThemeGenerator } from '../generators/theme-generator';
import {
  EDITORIAL_EVENTS,
  EditorialEventPayload,
} from '../../shared/events/editorial.events';
import {
  IEditorialTheme,
  IUpdateEditorialTheme,
  IThemeFilters,
  IThemeGenerationRequest,
  IThemeGenerationResult,
  IBalanceReport,
  IRebalanceResult,
  ISlotSuggestion,
  JourneyStage,
  ThemeStatus,
} from '../schemas/models/editorial-theme.interface';
import { IEditorialCalendarThemeVersion } from '../schemas/models/editorial-calendar-theme-version.interface';
import {
  AssignThemeInput,
  GenerateMoreInput,
  RebalanceRequestInput,
  SaveVersionInput,
  SimulateRequestInput,
} from '../validations/editorial-theme.zod';
import { RetinaType } from '../schemas/models/editorial-calendar.interface';

const ALL_RETINA: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const ALL_JOURNEY: JourneyStage[] = [
  'descoberta',
  'consideracao',
  'conversao',
  'experiencia',
  'compartilhamento',
];

@Injectable()
export class EditorialThemeService {
  constructor(
    private readonly themeRepository: EditorialThemeRepository,
    private readonly calendarRepository: EditorialCalendarRepository,
    private readonly themeVersionRepository: EditorialCalendarThemeVersionRepository,
    private readonly versionRepository: EditorialVersionRepository,
    private readonly mapaRepository: EditorialMapaRepository,
    private readonly projectRepository: EditorialProjectRepository,
    private readonly themeGenerator: ThemeGenerator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    projectId: string,
    filters?: IThemeFilters,
  ): Promise<IEditorialTheme[]> {
    return this.themeRepository.findAllByProject(projectId, filters);
  }

  async findById(id: string): Promise<IEditorialTheme> {
    const theme = await this.themeRepository.findById(id);
    if (!theme) throw new NotFoundException('Tema não encontrado.');
    return theme;
  }

  async generate(
    projectId: string,
    request: IThemeGenerationRequest,
    triggeredBy = 'system',
  ): Promise<IThemeGenerationResult> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    // Busca versão mais recente do projeto para obter o Mapa Estratégico
    const versions = await this.versionRepository.findAllByProject(projectId);
    const activeVersion =
      versions.find((v) => v.status === 'active') || versions[0];

    let pillars: string[] = [];
    let mensagemCentral: string | undefined;

    if (activeVersion && (activeVersion.id || activeVersion._id)) {
      const versionId = String(activeVersion.id || activeVersion._id);
      const mapa = await this.mapaRepository.findByVersionId(versionId);
      if (mapa) {
        pillars = (mapa.pilares || []).map((p) => p.title);
        mensagemCentral = mapa.mensagemCentral;
      }
    }

    const batchId = randomUUID();
    const count =
      request.mode === 'roma_avatar'
        ? Number(request.params.volume)
        : Number(request.params.volume || 20);

    const inputPillars =
      request.mode === 'roma_avatar' ? request.params.pillars : pillars;

    const platforms =
      request.mode === 'objective'
        ? request.params.platforms
        : (['instagram'] as any);

    const retinaPriority =
      request.mode === 'roma_avatar'
        ? request.params.retinaPriority
        : undefined;

    const sourceContext =
      request.mode === 'market'
        ? [
            ...(request.params.videoLinks || []),
            ...(request.params.comments || []),
            ...(request.params.reviews || []),
          ].join('; ')
        : undefined;

    const toCreate = await this.themeGenerator.generate(
      {
        projectId,
        niche: project.niche,
        subniche: project.subniche,
        pillars: inputPillars,
        mensagemCentral,
      },
      {
        mode: request.mode,
        count,
        batchId,
        pillars: inputPillars,
        platforms,
        retinaPriority,
        sourceContext,
      },
    );

    const created = await this.themeRepository.createMany(toCreate);

    const payload: EditorialEventPayload = {
      event: EDITORIAL_EVENTS.THEME_GENERATED,
      projectId,
      entityId: batchId,
      entityType: 'theme_batch',
      triggeredBy,
      timestamp: new Date(),
      metadata: { count: created.length, mode: request.mode },
    };
    this.eventEmitter.emit(EDITORIAL_EVENTS.THEME_GENERATED, payload);

    return {
      batchId,
      mode: request.mode,
      themes: created,
    };
  }

  async generateMore(
    projectId: string,
    themeId: string,
    input: GenerateMoreInput,
  ): Promise<IEditorialTheme[]> {
    const baseTheme = await this.findById(themeId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    const count = input.count ?? 5;
    const batchId = baseTheme.batchId || randomUUID();

    const toCreate = await this.themeGenerator.generate(
      {
        projectId,
        niche: project.niche,
        subniche: project.subniche,
        pillars: [baseTheme.pillar],
      },
      {
        mode: baseTheme.origin,
        count,
        batchId,
        pillars: [baseTheme.pillar],
        platforms: baseTheme.platforms,
        formats: [baseTheme.format],
        retinaTypes: [baseTheme.retinaType],
        offset: 10,
      },
    );

    return this.themeRepository.createMany(toCreate);
  }

  async update(
    id: string,
    data: IUpdateEditorialTheme,
  ): Promise<IEditorialTheme> {
    const updated = await this.themeRepository.update(id, data);
    if (!updated) throw new NotFoundException('Tema não encontrado.');
    return updated;
  }

  async bulkUpdateStatus(
    projectId: string,
    ids: string[],
    status: ThemeStatus,
  ): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.themeRepository.bulkUpdateStatus(
      projectId,
      ids,
      status,
    );
    return { modifiedCount };
  }

  async delete(id: string): Promise<{ message: string }> {
    const calendarUsageCount =
      await this.calendarRepository.countItemsByThemeId(id);
    if (calendarUsageCount > 0) {
      throw new ConflictException(
        `Este tema está vinculado a ${calendarUsageCount} item(ns) de calendário ativo(s). Arquive-o alterando seu status para "archived" em vez de excluí-lo.`,
      );
    }

    const deleted = await this.themeRepository.softDelete(id);
    if (!deleted) throw new NotFoundException('Tema não encontrado.');
    return { message: 'Tema removido com sucesso.' };
  }

  async detectPillars(projectId: string): Promise<string[]> {
    const versions = await this.versionRepository.findAllByProject(projectId);
    const activeVersion =
      versions.find((v) => v.status === 'active') || versions[0];
    if (!activeVersion) return [];

    const versionId = String(activeVersion.id || activeVersion._id);
    const mapa = await this.mapaRepository.findByVersionId(versionId);
    return (mapa?.pilares || []).map((p) => p.title);
  }

  async calendarSuggestions(
    projectId: string,
    calendarId: string,
  ): Promise<ISlotSuggestion[]> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    const allThemes = await this.themeRepository.findAllByProject(projectId, {
      status: ['active', 'favorite'],
    });

    const suggestions: ISlotSuggestion[] = [];

    for (const day of calendar.days || []) {
      for (const item of day.items || []) {
        const itemId = String(item.id || item._id);
        const matched = allThemes.filter(
          (t) =>
            t.format === item.format ||
            t.retinaType === item.retinaType ||
            (item.pillar && t.pillar === item.pillar),
        );
        const candidates = (matched.length ? matched : allThemes).slice(0, 3);
        if (candidates.length) {
          suggestions.push({
            calendarItemId: itemId,
            suggestions: candidates,
          });
        }
      }
    }

    return suggestions;
  }

  async assignTheme(
    projectId: string,
    calendarId: string,
    data: AssignThemeInput,
  ): Promise<{ message: string }> {
    let titleToSet = data.title || '';

    if (data.themeId) {
      const theme = await this.findById(data.themeId);
      if (!titleToSet) titleToSet = theme.title;
    }

    const updated = await this.calendarRepository.assignItemTheme(
      calendarId,
      data.calendarItemId,
      data.themeId ?? null,
      titleToSet,
    );

    if (!updated) {
      throw new NotFoundException(
        'Calendário ou item de calendário não encontrado.',
      );
    }

    return { message: 'Tema atribuído com sucesso.' };
  }

  async getBalance(
    projectId: string,
    calendarId: string,
  ): Promise<IBalanceReport> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    const allItems: any[] = [];
    for (const day of calendar.days || []) {
      for (const item of day.items || []) {
        allItems.push(item);
      }
    }

    const totalSlots = allItems.length;
    const filledItems = allItems.filter((i) => i.themeId || i.theme);
    const filledSlots = filledItems.length;

    // Retina count
    const retinaMap = new Map<RetinaType, number>();
    for (const type of ALL_RETINA) retinaMap.set(type, 0);

    for (const item of allItems) {
      if (item.retinaType && retinaMap.has(item.retinaType)) {
        retinaMap.set(
          item.retinaType,
          (retinaMap.get(item.retinaType) || 0) + 1,
        );
      }
    }

    const retina = ALL_RETINA.map((type) => {
      const count = retinaMap.get(type) || 0;
      const share = totalSlots > 0 ? (count / totalSlots) * 100 : 0;
      return { retinaType: type, count, share: Math.round(share) };
    });

    // Journey stages (a partir dos temas referenciados)
    const themeIds = allItems
      .map((i) => i.themeId)
      .filter((id): id is string => Boolean(id));

    const themes = await this.themeRepository.findByIds(themeIds);
    const themeMap = new Map(themes.map((t) => [String(t.id || t._id), t]));

    const journeyMap = new Map<JourneyStage, number>();
    for (const stage of ALL_JOURNEY) journeyMap.set(stage, 0);

    for (const item of allItems) {
      if (item.themeId && themeMap.has(String(item.themeId))) {
        const t = themeMap.get(String(item.themeId))!;
        if (t.journeyStage) {
          journeyMap.set(
            t.journeyStage,
            (journeyMap.get(t.journeyStage) || 0) + 1,
          );
        }
      }
    }

    const journey = ALL_JOURNEY.map((stage) => ({
      journeyStage: stage,
      count: journeyMap.get(stage) || 0,
    }));

    const alerts: { severity: 'high' | 'medium' | 'low'; message: string }[] =
      [];
    if (filledSlots < totalSlots) {
      alerts.push({
        severity: 'medium',
        message: `${totalSlots - filledSlots} slot(s) ainda não possuem tema atribuído.`,
      });
    }

    const zeroRetina = retina.filter((r) => r.count === 0);
    if (zeroRetina.length > 0) {
      alerts.push({
        severity: 'low',
        message: `Tipos RETINA sem publicações: ${zeroRetina.map((r) => r.retinaType).join(', ')}.`,
      });
    }

    return {
      retina,
      journey,
      totalSlots,
      filledSlots,
      alerts,
    };
  }

  async rebalance(
    projectId: string,
    calendarId: string,
    request?: RebalanceRequestInput,
  ): Promise<IRebalanceResult> {
    void request;
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    const availableThemes = await this.themeRepository.findAllByProject(
      projectId,
      { status: ['active', 'favorite'] },
    );

    const report = await this.getBalance(projectId, calendarId);
    const slots: { calendarItemId: string; theme: IEditorialTheme }[] = [];

    let themeIdx = 0;
    for (const day of calendar.days || []) {
      for (const item of day.items || []) {
        if (!availableThemes.length) break;
        const assignedTheme =
          availableThemes[themeIdx % availableThemes.length];
        themeIdx++;
        slots.push({
          calendarItemId: String(item.id || item._id),
          theme: assignedTheme,
        });
      }
    }

    return { report, slots };
  }

  async simulate(
    projectId: string,
    calendarId: string,
    request: SimulateRequestInput,
  ): Promise<IBalanceReport> {
    const current = await this.getBalance(projectId, calendarId);

    const retina = current.retina.map((r) => {
      let count = r.count;
      if (request.increase?.includes(r.retinaType)) count += 2;
      if (request.decrease?.includes(r.retinaType))
        count = Math.max(0, count - 1);
      return { ...r, count };
    });

    const newTotal = retina.reduce((sum, r) => sum + r.count, 0);
    const recalculated = retina.map((r) => ({
      ...r,
      share: newTotal > 0 ? Math.round((r.count / newTotal) * 100) : 0,
    }));

    return {
      ...current,
      totalSlots: newTotal,
      retina: recalculated,
    };
  }

  async listVersions(
    calendarId: string,
  ): Promise<IEditorialCalendarThemeVersion[]> {
    return this.themeVersionRepository.findAllByCalendar(calendarId);
  }

  async saveVersion(
    projectId: string,
    calendarId: string,
    data: SaveVersionInput,
  ): Promise<IEditorialCalendarThemeVersion> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    const itemThemesMap = new Map<string, string>();
    for (const day of calendar.days || []) {
      for (const item of day.items || []) {
        if (item.themeId) {
          itemThemesMap.set(String(item.id || item._id), String(item.themeId));
        }
      }
    }

    const themeIds = Array.from(itemThemesMap.values());
    const themes = await this.themeRepository.findByIds(themeIds);
    const themeById = new Map(themes.map((t) => [String(t.id || t._id), t]));

    const slots: {
      calendarItemId: string;
      theme: Record<string, unknown>;
    }[] = [];

    for (const [itemId, themeId] of itemThemesMap.entries()) {
      const theme = themeById.get(themeId);
      if (theme) {
        slots.push({
          calendarItemId: itemId,
          theme: theme as unknown as Record<string, unknown>,
        });
      }
    }

    return this.themeVersionRepository.create({
      projectId,
      calendarId,
      name: data.name,
      period: {
        startDate: new Date(calendar.period.startDate),
        endDate: new Date(calendar.period.endDate),
      },
      configuration: {
        objective: data.objective,
        businessMoment: data.businessMoment,
      },
      slots: slots as any,
    });
  }
}
