import {
  IEditorialCalendarThemeVersion,
  ICreateEditorialCalendarThemeVersion,
} from '../schemas/models/editorial-calendar-theme-version.interface';

export abstract class EditorialCalendarThemeVersionRepository {
  abstract findAllByCalendar(
    calendarId: string,
  ): Promise<IEditorialCalendarThemeVersion[]>;
  abstract create(
    data: ICreateEditorialCalendarThemeVersion,
  ): Promise<IEditorialCalendarThemeVersion>;
}
