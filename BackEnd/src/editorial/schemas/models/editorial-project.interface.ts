export type EditorialProjectStatus = 'draft' | 'active' | 'archived';
export type EditorialLineStatus = 'pending' | 'active' | 'archived';
export type CalendarStatus = 'pending' | 'active' | 'archived';

export interface IEditorialProject {
  _id?: string;
  id?: string;
  name: string;
  niche: string;
  subniche: string;
  currentObjective: string;
  editorialLineStatus: EditorialLineStatus;
  calendarStatus: CalendarStatus;
  createdBy: string;
  orgId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialProject {
  name: string;
  niche: string;
  subniche: string;
  currentObjective: string;
  createdBy: string;
}

export interface IUpdateEditorialProject {
  name?: string;
  niche?: string;
  subniche?: string;
  currentObjective?: string;
  editorialLineStatus?: EditorialLineStatus;
  calendarStatus?: CalendarStatus;
}
