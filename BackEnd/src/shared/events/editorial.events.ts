export const EDITORIAL_EVENTS = {
  VERSION_CREATED: 'editorial.version.created',
  VERSION_DUPLICATED: 'editorial.version.duplicated',
  VERSION_ARCHIVED: 'editorial.version.archived',
  ONBOARDING_COMPLETED: 'editorial.onboarding.completed',
  CALENDAR_CREATED: 'editorial.calendar.created',
  CALENDAR_UPDATED: 'editorial.calendar.updated',
  CALENDAR_ARCHIVED: 'editorial.calendar.archived',
  CALENDAR_DUPLICATED: 'editorial.calendar.duplicated',
} as const;

export type EditorialEventName =
  (typeof EDITORIAL_EVENTS)[keyof typeof EDITORIAL_EVENTS];

export interface EditorialEventPayload {
  event: EditorialEventName;
  projectId: string;
  versionId: string;
  versionNumber: number;
  triggeredBy: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
