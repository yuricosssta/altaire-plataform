import {
  BusinessMoment,
  IThemeSlot,
  ThemeObjective,
} from './editorial-theme.interface';

export interface IEditorialCalendarThemeVersion {
  _id?: string;
  id?: string;
  projectId: string;
  calendarId: string;
  name: string;
  period: { startDate: Date; endDate: Date };
  configuration: { objective: ThemeObjective; businessMoment: BusinessMoment };
  slots: IThemeSlot[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICreateEditorialCalendarThemeVersion = Omit<
  IEditorialCalendarThemeVersion,
  '_id' | 'id' | 'isActive' | 'createdAt' | 'updatedAt'
>;
