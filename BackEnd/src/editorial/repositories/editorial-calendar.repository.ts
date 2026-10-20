import {
  IEditorialCalendar,
  ICreateEditorialCalendar,
  IUpdateEditorialCalendar,
  ICalendarItemUpdate,
  IReviewSuggestion,
} from '../schemas/models/editorial-calendar.interface';

export abstract class EditorialCalendarRepository {
  abstract findAllByProject(projectId: string): Promise<IEditorialCalendar[]>;
  abstract findById(id: string): Promise<IEditorialCalendar | null>;
  abstract create(data: ICreateEditorialCalendar): Promise<IEditorialCalendar>;
  abstract update(
    id: string,
    data: IUpdateEditorialCalendar,
  ): Promise<IEditorialCalendar | null>;
  abstract softDelete(id: string): Promise<IEditorialCalendar | null>;
  abstract updateItem(
    calendarId: string,
    itemId: string,
    data: ICalendarItemUpdate,
  ): Promise<IEditorialCalendar | null>;
  abstract addReviewSuggestions(
    calendarId: string,
    suggestions: IReviewSuggestion[],
  ): Promise<IEditorialCalendar | null>;
  /** Grava (ou limpa, com themeId null) a referência de tema de um item. */
  abstract assignItemTheme(
    calendarId: string,
    itemId: string,
    themeId: string | null,
    theme: string,
  ): Promise<IEditorialCalendar | null>;
  /** Quantos itens de calendários ativos referenciam o tema. */
  abstract countItemsByThemeId(themeId: string): Promise<number>;
}
