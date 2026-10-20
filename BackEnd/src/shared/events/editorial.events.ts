export const EDITORIAL_EVENTS = {
  VERSION_CREATED: 'editorial.version.created',
  VERSION_DUPLICATED: 'editorial.version.duplicated',
  VERSION_ARCHIVED: 'editorial.version.archived',
  ONBOARDING_COMPLETED: 'editorial.onboarding.completed',
  CALENDAR_CREATED: 'editorial.calendar.created',
  CALENDAR_UPDATED: 'editorial.calendar.updated',
  CALENDAR_ARCHIVED: 'editorial.calendar.archived',
  CALENDAR_DUPLICATED: 'editorial.calendar.duplicated',
  THEME_GENERATED: 'editorial.theme.generated',
  SCRIPT_CREATED: 'editorial.script.created',
  SCRIPT_GENERATED: 'editorial.script.generated',
} as const;

export type EditorialEventName =
  (typeof EDITORIAL_EVENTS)[keyof typeof EDITORIAL_EVENTS];

export type EditorialEntityType =
  'version' | 'calendar' | 'theme_batch' | 'script';

export interface EditorialEventPayload {
  event: EditorialEventName;
  projectId: string;
  /** Presente em eventos de versão/calendário; opcional em temas/roteiros. */
  versionId?: string;
  versionNumber?: number;
  /** Identificador genérico da entidade afetada (ex.: batchId, scriptId). */
  entityId?: string;
  entityType?: EditorialEntityType;
  triggeredBy: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
