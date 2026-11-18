export type EditorialProjectStatus =
  'draft' | 'active' | 'paused' | 'archived' | 'in_setup' | 'in_review';
export type EditorialLineStatus = 'pending' | 'active' | 'archived';
export type CalendarStatus = 'pending' | 'active' | 'archived';

export interface IEditorialProject {
  _id?: string;
  id?: string;
  name: string;
  brandOrClientName?: string;
  niche: string;
  subniche: string;
  operationTypeLabel?: string;
  currentObjective: string;
  currentPhaseLabel?: string;
  status?: EditorialProjectStatus;
  editorialLineStatus: EditorialLineStatus;
  calendarStatus: CalendarStatus;
  nextActionLabel?: string;
  nextActionReason?: string;
  createdBy: string;
  orgId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Campos enriquecidos retornados pelo EditorialProjectService
  currentObjectiveLabel?: string;
  hasActiveLineEditorial?: boolean;
  lineEditorialStatus?: string;
  hasActiveCalendar?: boolean;
  themesCount?: number;
  allocatedThemesCount?: number;
  approvedScriptsCount?: number;
  draftScriptsCount?: number;
  updatedAtLabel?: string;
}

export interface ICreateEditorialProject {
  name: string;
  brandOrClientName?: string;
  niche: string;
  subniche: string;
  operationTypeLabel?: string;
  currentObjective: string;
  currentPhaseLabel?: string;
  status?: EditorialProjectStatus;
  nextActionLabel?: string;
  nextActionReason?: string;
  createdBy: string;
  orgId?: string;
}

export interface IUpdateEditorialProject {
  name?: string;
  brandOrClientName?: string;
  niche?: string;
  subniche?: string;
  operationTypeLabel?: string;
  currentObjective?: string;
  currentPhaseLabel?: string;
  status?: EditorialProjectStatus;
  editorialLineStatus?: EditorialLineStatus;
  calendarStatus?: CalendarStatus;
  nextActionLabel?: string;
  nextActionReason?: string;
}

export interface IDuplicateEditorialProjectInput {
  newName: string;
  copyStrategicBase?: boolean;
  copyLineEditorial?: boolean;
  copyThemes?: boolean;
  copyCalendars?: boolean;
  copyScripts?: boolean;
}
