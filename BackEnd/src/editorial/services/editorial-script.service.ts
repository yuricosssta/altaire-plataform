import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialScriptRepository } from '../repositories/editorial-script.repository';
import { EditorialScriptVersionRepository } from '../repositories/editorial-script-version.repository';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
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
  AddAttachmentInput,
  CreateScriptInput,
  UpdateScriptInput,
} from '../validations/editorial-script.zod';

@Injectable()
export class EditorialScriptService {
  constructor(
    private readonly scriptRepository: EditorialScriptRepository,
    private readonly scriptVersionRepository: EditorialScriptVersionRepository,
    private readonly themeRepository: EditorialThemeRepository,
    private readonly calendarRepository: EditorialCalendarRepository,
    private readonly scriptGenerator: ScriptGenerator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    projectId: string,
    format?: ContentFormat,
  ): Promise<IEditorialScript[]> {
    return this.scriptRepository.findAllByProject(projectId, { format });
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
      calendarSlotId: data.calendarSlotId,
      themeId: data.themeId,
      format: data.format,
      mode: data.mode,
      title: title || `Roteiro (${data.format})`,
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

    return created;
  }

  async generate(
    projectId: string,
    scriptId: string,
    briefing?: Record<string, unknown>,
  ): Promise<IEditorialScript> {
    const script = await this.findById(scriptId);

    let themeTitle = script.title;
    let retinaType: any = undefined;

    if (script.themeId) {
      const theme = await this.themeRepository.findById(script.themeId);
      if (theme) {
        themeTitle = theme.title;
        retinaType = theme.retinaType;
      }
    }

    const generated = await this.scriptGenerator.generate({
      scriptId,
      projectId,
      format: script.format,
      mode: script.mode,
      themeTitle,
      retinaType,
      briefing: briefing || script.briefing,
    });

    const updated = await this.scriptRepository.update(scriptId, {
      ...generated,
      briefing: briefing || script.briefing,
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
