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
}
