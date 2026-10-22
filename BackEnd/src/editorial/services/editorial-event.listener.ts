import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EDITORIAL_EVENTS,
  EditorialEventPayload,
} from '../../shared/events/editorial.events';

@Injectable()
export class EditorialEventListener {
  private readonly logger = new Logger(EditorialEventListener.name);

  @OnEvent(EDITORIAL_EVENTS.ONBOARDING_COMPLETED)
  handleOnboardingCompleted(payload: EditorialEventPayload): void {
    this.logger.log(
      `Onboarding concluído — projeto: ${payload.projectId}, versão: ${payload.versionNumber} (${payload.versionId}), por: ${payload.triggeredBy}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_CREATED)
  handleVersionCreated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão criada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_DUPLICATED)
  handleVersionDuplicated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão duplicada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.VERSION_ARCHIVED)
  handleVersionArchived(payload: EditorialEventPayload): void {
    this.logger.log(
      `Versão arquivada — v${payload.versionNumber} (${payload.versionId}) no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_CREATED)
  handleCalendarCreated(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário criado — ${calendarId} no projeto ${payload.projectId}, versão ${payload.versionId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_ARCHIVED)
  handleCalendarArchived(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário arquivado — ${calendarId} no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.CALENDAR_DUPLICATED)
  handleCalendarDuplicated(payload: EditorialEventPayload): void {
    const calendarId = payload.metadata?.calendarId || '(desconhecido)';
    this.logger.log(
      `Calendário duplicado — novo ${calendarId} (original: ${payload.metadata?.originalId}) no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.THEME_GENERATED)
  handleThemeGenerated(payload: EditorialEventPayload): void {
    const count = payload.metadata?.count ?? 0;
    this.logger.log(
      `Temas gerados — lote ${payload.entityId} (${count} temas, modo ${payload.metadata?.mode}) no projeto ${payload.projectId}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.SCRIPT_CREATED)
  handleScriptCreated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Roteiro criado — ${payload.entityId} (${payload.metadata?.format}) no projeto ${payload.projectId}, por: ${payload.triggeredBy}`,
    );
  }

  @OnEvent(EDITORIAL_EVENTS.SCRIPT_GENERATED)
  handleScriptGenerated(payload: EditorialEventPayload): void {
    this.logger.log(
      `Roteiro gerado — ${payload.entityId} (${payload.metadata?.blocks ?? 0} blocos) no projeto ${payload.projectId}`,
    );
  }
}
