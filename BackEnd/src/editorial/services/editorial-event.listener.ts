import { Injectable, Logger, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EDITORIAL_EVENTS,
  EditorialEventPayload,
} from '../../shared/events/editorial.events';
import { EditorialActivityRepository } from '../repositories/editorial-activity.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';

@Injectable()
export class EditorialEventListener {
  private readonly logger = new Logger(EditorialEventListener.name);

  constructor(
    @Optional()
    private readonly activityRepository?: EditorialActivityRepository,
    @Optional()
    private readonly projectRepository?: EditorialProjectRepository,
  ) {}

  private async persistActivity(
    payload: EditorialEventPayload,
    label: string,
    resourceHrefSuffix = '',
  ): Promise<void> {
    if (!this.activityRepository) return;
    try {
      const projectId = String(payload.projectId || '');
      let projectName = 'Projeto Editorial';
      if (projectId && this.projectRepository) {
        const proj = await this.projectRepository.findById(projectId);
        if (proj) {
          projectName = proj.brandOrClientName || proj.name;
        }
      }
      await this.activityRepository.create({
        userId: String(payload.triggeredBy || '000000000000000000000000'),
        orgId: 'altaire',
        projectId,
        projectName,
        label,
        resourceHref: projectId
          ? `/dashboard/editorial/${projectId}${resourceHrefSuffix}`
          : '/dashboard/editorial',
        occurredAt: payload.timestamp
          ? new Date(payload.timestamp)
          : new Date(),
      });
    } catch (err) {
      this.logger.warn(
        `Falha ao gravar EditorialActivityLog: ${(err as Error).message}`,
      );
    }
  }

  @OnEvent(EDITORIAL_EVENTS.ONBOARDING_COMPLETED)
  handleOnboardingCompleted(payload: EditorialEventPayload): void {
    this.logger.log(
      `Onboarding concluído — projeto: ${payload.projectId}, versão: ${payload.versionNumber} (${payload.versionId}), por: ${payload.triggeredBy}`,
    );
    void this.persistActivity(
      payload,
      `Linha Editorial v${payload.versionNumber} ativada`,
      '?tab=linha',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_CREATED)
  handleVersionCreated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão criada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      `Nova versão v${payload.versionNumber} da Linha Editorial criada`,
      '?tab=linha',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_DUPLICATED)
  handleVersionDuplicated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão duplicada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      `Linha Editorial duplicada para v${payload.versionNumber}`,
      '?tab=linha',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_ARCHIVED)
  handleVersionArchived(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão arquivada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      `Versão v${payload.versionNumber} arquivada`,
      '?tab=linha',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_CREATED)
  handleCalendarCreated(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário criado — ${calendarId} no projeto ${payload.projectId}, versão ${payload.versionId}`,
    );
    void this.persistActivity(
      payload,
      `Calendário Editorial criado (${String(payload.metadata?.name || 'Ciclo Ativo')})`,
      '?tab=calendario',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_ARCHIVED)
  handleCalendarArchived(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário arquivado — ${calendarId} no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      'Calendário Editorial arquivado',
      '?tab=calendario',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_DUPLICATED)
  handleCalendarDuplicated(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário duplicado — novo ${calendarId} (original: ${payload.metadata?.originalId}) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      'Ciclo de Calendário Editorial duplicado',
      '?tab=calendario',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.THEME_GENERATED)
  handleThemeGenerated(payload: EditorialEventPayload): void {
    const count = payload.metadata?.count ?? 0;
    this.logger.log(
      `Temas gerados — lote ${payload.entityId} (${count} temas, modo ${payload.metadata?.mode}) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      `${count} temas adicionados ao banco editorial`,
      '?tab=temas',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.SCRIPT_CREATED)
  handleScriptCreated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Roteiro criado — ${payload.entityId} (${payload.metadata?.format}) no projeto ${payload.projectId}, por: ${payload.triggeredBy}`,
    );
    void this.persistActivity(
      payload,
      `Novo roteiro criado (${String(payload.metadata?.format || 'conteúdo')})`,
      '?tab=roteiros',
    );
  }

  @OnEvent(EDITORIAL_EVENTS.SCRIPT_GENERATED)
  handleScriptGenerated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Roteiro gerado — ${payload.entityId} (${payload.metadata?.blocks ?? 0} blocos) no projeto ${payload.projectId}`,
    );
    void this.persistActivity(
      payload,
      `Roteiro estruturado gerado (${String(payload.metadata?.format || 'Studio')})`,
      '?tab=roteiros',
    );
  }
}
