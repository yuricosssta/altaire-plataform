import {
  ICalendarDay,
  IEditorialCalendar,
  IProductionCapacity,
  IReviewSuggestion,
} from '../schemas/models/editorial-calendar.interface';
import { IEditorialMapa } from '../schemas/models/editorial-mapa.interface';

export interface ICalendarGenerationInput {
  projectId: string;
  niche: string;
  subniche: string;
  objective: string;
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  platforms: string[];
  capacity: IProductionCapacity;
  linkedLineName: string;
  pillars: string[];
}

export interface ICalendarGenerationOutput {
  days: ICalendarDay[];
  slots: Record<string, unknown>[];
  reviewSuggestions: IReviewSuggestion[];
}

export interface ICalendarReviewInput {
  calendar: IEditorialCalendar;
  activeMapa?: IEditorialMapa | null;
}

/**
 * Port de geração e revisão estratégica de Calendário Editorial.
 * Hoje implementado por StubCalendarGenerator; substituível por adapter LLM via `useClass`.
 */
export abstract class CalendarGenerator {
  abstract generateCalendarPlan(
    context: ICalendarGenerationInput,
  ): Promise<ICalendarGenerationOutput>;

  abstract generateCalendarReview(
    context: ICalendarReviewInput,
  ): Promise<IReviewSuggestion[]>;

  abstract generateSlotSuggestions(context: {
    niche: string;
    subniche: string;
    format: string;
    retinaType: string;
    pillar?: string;
  }): Promise<string[]>;
}
