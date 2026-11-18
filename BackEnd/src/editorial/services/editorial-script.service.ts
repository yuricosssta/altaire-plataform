import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialScriptRepository } from '../repositories/editorial-script.repository';
import { EditorialScriptVersionRepository } from '../repositories/editorial-script-version.repository';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { ScriptGenerator } from '../generators/script-generator';
import {
  EDITORIAL_EVENTS,
  EditorialEventPayload,
} from '../../shared/events/editorial.events';
import { ContentFormat } from '../schemas/models/editorial-calendar.interface';
import {
  ICalendarSlotForScript,
  ICreateEditorialScript,
  IEditorialScript,
  IEditorialScriptVersion,
  IScriptAttachment,
  IThemeForScript,
} from '../schemas/models/editorial-script.interface';
import {
  AdaptPublicationInput,
  AddAttachmentInput,
  CreateScriptInput,
  RegenerateStoryCardInput,
  UpdateScriptInput,
} from '../validations/editorial-script.zod';

const STORY_PERIOD_MAP: Record<string, 'Manhã' | 'Almoço' | 'Tarde' | 'Noite'> =
  {
    MANHA: 'Manhã',
    Manhã: 'Manhã',
    ALMOCO: 'Almoço',
    Almoço: 'Almoço',
    TARDE: 'Tarde',
    Tarde: 'Tarde',
    NOITE: 'Noite',
    Noite: 'Noite',
  };

@Injectable()
export class EditorialScriptService {
  constructor(
    private readonly scriptRepository: EditorialScriptRepository,
    private readonly scriptVersionRepository: EditorialScriptVersionRepository,
    private readonly themeRepository: EditorialThemeRepository,
    private readonly calendarRepository: EditorialCalendarRepository,
    private readonly scriptGenerator: ScriptGenerator,
    private readonly eventEmitter: EventEmitter2,
    @Optional()
    private readonly projectRepository?: EditorialProjectRepository,
    @Optional()
    private readonly versionRepository?: EditorialVersionRepository,
    @Optional()
    private readonly mapaRepository?: EditorialMapaRepository,
  ) {}

  async findAll(
    projectId: string,
    format?: ContentFormat,
  ): Promise<IEditorialScript[]> {
    return this.scriptRepository.findAllByProject(projectId, { format });
  }

  async findAllAcrossProjects(
    orgId: string,
    userId?: string,
    allowedProjectIds?: string[],
    format?: ContentFormat,
  ): Promise<
    (IEditorialScript & { projectName?: string; brandOrClientName?: string })[]
  > {
    if (!this.projectRepository) return [];
    const projects = await this.projectRepository.findAll(
      orgId,
      Array.isArray(allowedProjectIds) ? undefined : userId,
      allowedProjectIds,
    );
    const projectIds = projects
      .map((p) => String((p as any)._id || (p as any).id || ''))
      .filter(Boolean);
    if (projectIds.length === 0) return [];

    const projectMap = new Map(
      projects.map((p) => [String((p as any)._id || (p as any).id), p]),
    );
    const scripts = await this.scriptRepository.findAllAcrossProjects(
      projectIds,
      { format },
    );

    return scripts.map((s) => {
      const proj = projectMap.get(String(s.projectId));
      return {
        ...s,
        projectName: proj?.name || 'Projeto',
        brandOrClientName: proj?.brandOrClientName || proj?.name || 'Marca',
      };
    });
  }

  async findById(scriptId: string): Promise<IEditorialScript> {
    const script = await this.scriptRepository.findById(scriptId);
    if (!script) throw new NotFoundException('Roteiro não encontrado.');
    return script;
  }

  async create(
    projectId: string,
    userId: string,
    data: CreateScriptInput,
  ): Promise<IEditorialScript> {
    let title = data.title;
    if (!title && data.themeId) {
      const theme = await this.themeRepository.findById(data.themeId);
      if (theme) title = theme.title;
    }

    const payload: ICreateEditorialScript = {
      projectId,
      calendarSlotId: data.calendarSlotId || data.linkedSlotId,
      themeId: data.themeId || data.linkedThemeId,
      format: data.format,
      mode: data.mode,
      status: data.status || 'rascunho',
      title: title || `Roteiro (${data.format})`,
      provisionalName: data.provisionalName,
      briefing: data.briefingContext as any,
      formatSlug: data.formatSlug,
      calendarSlotFormat: data.calendarSlotFormat,
      originType: data.originType,
      linkedSlotId: data.linkedSlotId,
      linkedSlotLabel: data.linkedSlotLabel,
      linkedThemeId: data.linkedThemeId,
      retinaType: data.retinaType,
      strategicObjective: data.strategicObjective,
      editorialPillar: data.editorialPillar,
      icpPainOrObjection: data.icpPainOrObjection,
      businessMoment: data.businessMoment,
      platform: data.platform,
      estimatedDurationOrSize: data.estimatedDurationOrSize,
      speakingMode: data.speakingMode,
      versionLabel: data.versionLabel,
      isFavorite: data.isFavorite,
      createdBy: userId,
    };

    const created = await this.scriptRepository.create(payload);
    const scriptId = String(created.id || created._id);

    const eventPayload: EditorialEventPayload = {
      event: EDITORIAL_EVENTS.SCRIPT_CREATED,
      projectId,
      entityId: scriptId,
      entityType: 'script',
      triggeredBy: userId,
      timestamp: new Date(),
      metadata: { format: data.format, mode: data.mode },
    };
    this.eventEmitter.emit(EDITORIAL_EVENTS.SCRIPT_CREATED, eventPayload);

    if (data.autoGenerate) {
      return this.generate(projectId, scriptId, data.briefingContext);
    }

    return created;
  }

  async generate(
    projectId: string,
    scriptId: string,
    briefing?: Record<string, unknown>,
  ): Promise<IEditorialScript> {
    const script = await this.findById(scriptId);

    let themeTitle = script.title;
    let retinaType: any = script.retinaType;
    let editorialPillar = script.editorialPillar;
    let icpPainOrObjection = script.icpPainOrObjection;

    if (script.themeId) {
      const theme = await this.themeRepository.findById(String(script.themeId));
      if (theme) {
        themeTitle = theme.title;
        retinaType = retinaType || theme.retinaType;
        editorialPillar = editorialPillar || theme.pillar;
        icpPainOrObjection = icpPainOrObjection || theme.painDesireOrObjection;
      }
    }

    let niche: string | undefined;
    let subniche: string | undefined;
    if (this.projectRepository) {
      const project = await this.projectRepository.findById(projectId);
      if (project) {
        niche = project.niche;
        subniche = project.subniche;
      }
    }

    const generated = await this.scriptGenerator.generate({
      scriptId,
      projectId,
      format: script.format,
      mode: script.mode,
      themeTitle,
      retinaType,
      niche,
      subniche,
      editorialPillar,
      strategicObjective: script.strategicObjective,
      icpPainOrObjection,
      businessMoment: script.businessMoment,
      platform: script.platform,
      briefing: (briefing || script.briefing) as any,
    });

    const updated = await this.scriptRepository.update(scriptId, {
      ...generated,
      briefing: (briefing || script.briefing) as any,
      status: 'pronto',
    });

    if (!updated) throw new NotFoundException('Roteiro não encontrado.');

    const eventPayload: EditorialEventPayload = {
      event: EDITORIAL_EVENTS.SCRIPT_GENERATED,
      projectId,
      entityId: scriptId,
      entityType: 'script',
      triggeredBy: script.createdBy,
      timestamp: new Date(),
      metadata: { blocks: generated.blocks.length, format: script.format },
    };
    this.eventEmitter.emit(EDITORIAL_EVENTS.SCRIPT_GENERATED, eventPayload);

    return updated;
  }

  async regenerateStoryCard(
    scriptId: string,
    data: RegenerateStoryCardInput,
  ): Promise<{ card: Record<string, unknown>; script: IEditorialScript }> {
    const script = await this.findById(scriptId);
    const periodLabel = STORY_PERIOD_MAP[data.period] || 'Manhã';

    const storyPeriods = Array.isArray(script.storyPeriods)
      ? [...script.storyPeriods]
      : [];

    const currentCard =
      data.currentCard ||
      ({
        id: data.cardId || `card-${Date.now()}`,
        objective: data.currentObjective || 'Abertura / Engajamento',
        spokenText: data.currentText || '',
      } as Record<string, unknown>);

    const regeneratedCard = await this.scriptGenerator.regenerateStoryCard({
      period: periodLabel,
      cardNumber: data.cardNumber ?? 1,
      currentCard,
      icpPainOrObjection: data.icpPainOrObjection || script.icpPainOrObjection,
      subniche: data.subniche,
    });

    if (storyPeriods.length > 0 && data.cardId) {
      for (const p of storyPeriods) {
        const cards = (p as any).cards as Record<string, unknown>[] | undefined;
        if (Array.isArray(cards)) {
          const idx = cards.findIndex(
            (c) => String(c.id || '') === String(data.cardId),
          );
          if (idx >= 0) {
            cards[idx] = { ...cards[idx], ...regeneratedCard };
          }
        }
      }
    }

    const updated =
      storyPeriods.length > 0
        ? (await this.scriptRepository.update(scriptId, { storyPeriods })) ||
          script
        : script;

    return { card: regeneratedCard, script: updated };
  }

  async adaptPublication(
    scriptId: string,
    userId: string,
    input: AdaptPublicationInput,
  ): Promise<IEditorialScript> {
    const source = await this.findById(scriptId);
    const targetProject = this.projectRepository
      ? await this.projectRepository.findById(input.targetProjectId)
      : null;

    if (this.projectRepository && !targetProject) {
      throw new NotFoundException('Projeto de destino não encontrado.');
    }

    let targetStrategicBase: Record<string, unknown> | undefined;
    if (this.versionRepository) {
      const versions = await this.versionRepository.findAllByProject(
        input.targetProjectId,
      );
      const activeVersion =
        versions.find((v) => v.status === 'active') || versions[0];
      targetStrategicBase = activeVersion?.strategicBase;
    }

    let adaptedFields: Record<string, unknown> = {};
    if (
      input.mode === 'AI_ADAPT' &&
      targetProject &&
      typeof (this.scriptGenerator as any).adaptScriptToProject === 'function'
    ) {
      adaptedFields = await this.scriptGenerator.adaptScriptToProject({
        sourceScript: source as unknown as Record<string, unknown>,
        targetProject: {
          id: input.targetProjectId,
          name: targetProject.name,
          niche: targetProject.niche,
          subniche: targetProject.subniche,
          currentObjective: targetProject.currentObjective,
        },
        targetStrategicBase,
        customTitle: input.customTitle,
        preserveComplementaryMaterial: input.preserveComplementaryMaterial,
      });
    }

    const created = await this.scriptRepository.create({
      projectId: input.targetProjectId,
      calendarSlotId: input.targetSlotId,
      format: source.format,
      mode: source.mode,
      status: 'rascunho',
      version: 1,
      title:
        (adaptedFields.title as string) ||
        input.customTitle ||
        `${source.title || 'Roteiro'} (Adaptado)`,
      provisionalName: source.provisionalName,
      blocks: (adaptedFields.blocks as any) || source.blocks || [],
      caption: (adaptedFields.caption as string) || source.caption,
      titles: source.titles || [],
      thumbnailPrompts: source.thumbnailPrompts || [],
      complementaryMaterials:
        input.preserveComplementaryMaterial !== false
          ? source.complementaryMaterials || []
          : [],
      explanationMaterials: source.explanationMaterials || [],
      formatSlug: source.formatSlug,
      calendarSlotFormat: source.calendarSlotFormat,
      originType: input.mode === 'AI_ADAPT' ? 'IA_ADAPTED' : 'DUPLICATED',
      linkedSlotId: input.targetSlotId,
      retinaType: source.retinaType,
      strategicObjective: source.strategicObjective,
      editorialPillar: source.editorialPillar,
      icpPainOrObjection: source.icpPainOrObjection,
      businessMoment: source.businessMoment,
      platform: source.platform,
      estimatedDurationOrSize: source.estimatedDurationOrSize,
      speakingMode: source.speakingMode,
      scriptBlocks: (adaptedFields.scriptBlocks as any) || source.scriptBlocks,
      connectionSevenLinesChecklist: source.connectionSevenLinesChecklist,
      carouselSlides: source.carouselSlides,
      storyPeriods: source.storyPeriods,
      predictiveQAs: source.predictiveQAs,
      postLiveStoriesSummary: source.postLiveStoriesSummary,
      captionOutdoorHook: source.captionOutdoorHook,
      captionBody: (adaptedFields.captionBody as string) || source.captionBody,
      captionCta: source.captionCta,
      seoKeywords: source.seoKeywords,
      seoTags: source.seoTags,
      youtubeChapters: source.youtubeChapters,
      titleVariations: source.titleVariations,
      imagePrompts: source.imagePrompts,
      qualifiedForComplementaryMaterial:
        source.qualifiedForComplementaryMaterial,
      complementaryMaterial:
        input.preserveComplementaryMaterial !== false
          ? source.complementaryMaterial
          : undefined,
      explanationMaterial: source.explanationMaterial,
      adaptedFromId: scriptId,
      createdBy: userId,
    });

    return created;
  }

  async update(
    scriptId: string,
    data: UpdateScriptInput,
  ): Promise<IEditorialScript> {
    const updated = await this.scriptRepository.update(scriptId, data as any);
    if (!updated) throw new NotFoundException('Roteiro não encontrado.');
    return updated;
  }

  async duplicate(scriptId: string, userId: string): Promise<IEditorialScript> {
    const original = await this.findById(scriptId);

    const duplicated = await this.scriptRepository.create({
      projectId: original.projectId,
      calendarSlotId: original.calendarSlotId,
      themeId: original.themeId,
      format: original.format,
      mode: original.mode,
      status: 'rascunho',
      version: 1,
      title: `${original.title || 'Roteiro'} (Cópia)`,
      provisionalName: original.provisionalName,
      blocks: original.blocks || [],
      caption: original.caption,
      titles: original.titles || [],
      thumbnailPrompts: original.thumbnailPrompts || [],
      complementaryMaterials: original.complementaryMaterials || [],
      explanationMaterials: original.explanationMaterials || [],
      briefing: original.briefing,
      attachments: original.attachments || [],
      formatSlug: original.formatSlug,
      calendarSlotFormat: original.calendarSlotFormat,
      retinaType: original.retinaType,
      strategicObjective: original.strategicObjective,
      editorialPillar: original.editorialPillar,
      icpPainOrObjection: original.icpPainOrObjection,
      businessMoment: original.businessMoment,
      platform: original.platform,
      estimatedDurationOrSize: original.estimatedDurationOrSize,
      speakingMode: original.speakingMode,
      scriptBlocks: original.scriptBlocks,
      carouselSlides: original.carouselSlides,
      storyPeriods: original.storyPeriods,
      predictiveQAs: original.predictiveQAs,
      captionOutdoorHook: original.captionOutdoorHook,
      captionBody: original.captionBody,
      captionCta: original.captionCta,
      seoKeywords: original.seoKeywords,
      seoTags: original.seoTags,
      youtubeChapters: original.youtubeChapters,
      titleVariations: original.titleVariations,
      imagePrompts: original.imagePrompts,
      createdBy: userId,
    });

    return duplicated;
  }

  async delete(scriptId: string): Promise<{ message: string }> {
    const deleted = await this.scriptRepository.softDelete(scriptId);
    if (!deleted) throw new NotFoundException('Roteiro não encontrado.');
    return { message: 'Roteiro removido com sucesso.' };
  }

  async export(scriptId: string): Promise<string> {
    const script = await this.findById(scriptId);

    const lines: string[] = [];
    lines.push(`# ${script.title || 'Roteiro Sem Título'}`);
    lines.push(
      `**Formato:** ${script.format} | **Modo:** ${script.mode} | **Versão:** v${script.version}\n`,
    );

    if (script.blocks && script.blocks.length > 0) {
      lines.push('## Blocos do Roteiro\n');
      for (const block of script.blocks) {
        lines.push(
          `### ${block.order + 1}. ${block.title || block.type.toUpperCase()}`,
        );
        if (block.timeRange) lines.push(`*Tempo sugerido:* ${block.timeRange}`);
        if (block.visualDirection)
          lines.push(`*Direção Visual:* ${block.visualDirection}`);
        lines.push(`\n${block.content}\n`);
      }
    }

    if (script.caption) {
      lines.push('## Legenda Sugerida\n');
      lines.push(script.caption);
      lines.push('');
    }

    if (script.titles && script.titles.length > 0) {
      lines.push('## Títulos e Ganchos Alternativos\n');
      for (const t of script.titles) {
        lines.push(`- **[${t.hookType || 'Geral'}]** ${t.title}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  async listVersions(scriptId: string): Promise<IEditorialScriptVersion[]> {
    return this.scriptVersionRepository.findAllByScriptId(scriptId);
  }

  async createVersion(
    scriptId: string,
    userId: string,
    comment?: string,
  ): Promise<IEditorialScriptVersion> {
    const script = await this.findById(scriptId);
    const maxVer =
      await this.scriptVersionRepository.findMaxVersionNumber(scriptId);
    const versionNumber = Math.max(maxVer, script.version || 0) + 1;

    const version = await this.scriptVersionRepository.create({
      scriptId,
      versionNumber,
      comment,
      blocks: script.blocks || [],
      caption: script.caption,
      titles: script.titles || [],
      thumbnailPrompts: script.thumbnailPrompts || [],
      complementaryMaterials: script.complementaryMaterials || [],
      explanationMaterials: script.explanationMaterials || [],
      createdBy: userId,
    });

    await this.scriptRepository.update(scriptId, { version: versionNumber });

    return version;
  }

  async listAttachments(scriptId: string): Promise<IScriptAttachment[]> {
    const script = await this.findById(scriptId);
    return script.attachments || [];
  }

  async addAttachment(
    scriptId: string,
    data: AddAttachmentInput,
  ): Promise<IScriptAttachment> {
    const attachment = await this.scriptRepository.addAttachment(
      scriptId,
      data as any,
    );
    if (!attachment) throw new NotFoundException('Roteiro não encontrado.');
    return attachment;
  }

  async removeAttachment(
    scriptId: string,
    attachmentId: string,
  ): Promise<{ message: string }> {
    const removed = await this.scriptRepository.removeAttachment(
      scriptId,
      attachmentId,
    );
    if (!removed) throw new NotFoundException('Anexo não encontrado.');
    return { message: 'Anexo removido com sucesso.' };
  }

  async regenerateBlock(
    scriptId: string,
    blockIdOrOrder: string,
    context?: string,
  ): Promise<IEditorialScript> {
    const script = await this.findById(scriptId);
    const blocks = script.blocks || [];

    const index = blocks.findIndex(
      (b) =>
        String((b as any)._id) === blockIdOrOrder ||
        String(b.id) === blockIdOrOrder ||
        String(b.order) === blockIdOrOrder,
    );

    if (index === -1) throw new NotFoundException('Bloco não encontrado.');

    const regenerated = await this.scriptGenerator.regenerateBlock(
      blocks[index],
      context,
    );
    blocks[index] = regenerated;

    const updated = await this.scriptRepository.update(scriptId, { blocks });
    return updated!;
  }

  async listSlotsByFormat(
    projectId: string,
    format: ContentFormat,
  ): Promise<ICalendarSlotForScript[]> {
    const calendars = await this.calendarRepository.findAllByProject(projectId);

    const slots: ICalendarSlotForScript[] = [];

    for (const cal of calendars) {
      const calId = String(cal.id || cal._id);

      if (Array.isArray(cal.slots) && cal.slots.length > 0) {
        for (const s of cal.slots) {
          const slot = s as Record<string, any>;
          if (slot.format === format) {
            slots.push({
              id: String(slot.id || slot._id || ''),
              calendarId: calId,
              date: slot.date ? new Date(slot.date) : new Date(),
              format: slot.format,
              retinaType: (
                slot.retinaBadge ||
                slot.retinaType ||
                'autoridade'
              ).toLowerCase(),
              platforms: slot.platform
                ? [slot.platform.toLowerCase()]
                : ['instagram'],
              objective: slot.primaryObjective || slot.objective || '',
              suggestedTime: slot.scheduledTime || '12:00',
              theme: slot.mainTheme || slot.theme,
              themeId: slot.themeId,
              provisionalName: slot.provisionalTitle || slot.provisionalName,
              strategicObjective: slot.primaryObjective,
              pillar: slot.editorialPillar || slot.pillar,
              painDesireObjection: slot.icpPainDesireOrObjection,
              materialQualified: Boolean(slot.eligibleForComplementaryMaterial),
              status: slot.status || 'planned',
            });
          }
        }
        continue;
      }

      for (const day of cal.days || []) {
        for (const item of day.items || []) {
          if (item.format === format) {
            slots.push({
              id: String(item.id || item._id),
              calendarId: calId,
              date: item.date,
              format: item.format,
              retinaType: item.retinaType,
              platforms: item.platforms,
              objective: item.objective,
              suggestedTime: item.suggestedTime,
              theme: item.theme,
              themeId: item.themeId,
              provisionalName: item.provisionalName,
              strategicObjective: item.strategicObjective,
              pillar: item.pillar,
              painDesireObjection: item.painDesireObjection,
              materialQualified: false,
              status: item.status,
            });
          }
        }
      }
    }

    return slots;
  }

  async listThemesByFormat(
    projectId: string,
    format: ContentFormat,
  ): Promise<IThemeForScript[]> {
    const themes = await this.themeRepository.findAllByProject(projectId, {
      format,
      status: ['active', 'favorite', 'test'],
    });

    return themes.map((t) => ({
      id: String(t.id || t._id),
      title: t.title,
      angle: t.angle || `${t.consciousnessLevel} · ${t.journeyStage}`,
      approach: t.approach || 'outro',
      pillar: t.pillar,
      formatCompatibility: [t.format],
      createdAt: t.createdAt,
    }));
  }
}
