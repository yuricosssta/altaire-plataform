import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import {
  IEditorialCalendar,
  ICreateEditorialCalendar,
  IUpdateEditorialCalendar,
  ICalendarItemUpdate,
  IReviewSuggestion,
  ContentFormat,
  RetinaType,
  CalendarItemStatus,
  CalendarObjective,
  PeriodType,
  ICalendarDay,
  ICalendarItem,
  ProductionCapacity,
} from '../schemas/models/editorial-calendar.interface';
import { EDITORIAL_EVENTS } from '../../shared/events/editorial.events';

interface CalendarSetup {
  editorialVersionId: string;
  periodType: PeriodType;
  startDate: Date;
  endDate?: Date;
  platforms: string[];
  capacity: ProductionCapacity;
  objective: CalendarObjective;
  customName?: string;
}

const ALL_RETINA_TYPES: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const PERIOD_LABELS: Record<PeriodType, string> = {
  two_weeks: 'Quinzena',
  one_month: 'Mês',
  four_weeks_warmup: 'Aquecimento (4 semanas)',
  pre_launch: 'Pré-lançamento',
  custom: 'Personalizado',
};

const SUGGESTED_TIMES: Record<string, string> = {
  reel: '07:00',
  long_video: '12:00',
  carousel: '18:00',
  static_post: '12:00',
  live: '20:00',
  stories_sequence: '09:00',
};

function generateCalendarDays(
  startDate: Date,
  endDate: Date,
  capacity: ProductionCapacity,
): { days: ICalendarDay[] } {
  const totalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );
  const totalWeeks = Math.max(1, totalDays / 7);

  const itemsPerFormat: Record<ContentFormat, number> = {
    reel: Math.round(capacity.reelsPerWeek * totalWeeks),
    long_video: Math.round(capacity.longVideosPerWeek * totalWeeks),
    carousel: Math.round(capacity.carouselsPerWeek * totalWeeks),
    static_post: Math.round(capacity.staticPostsPerWeek * totalWeeks),
    live: Math.round(capacity.livesPerWeek * totalWeeks),
    stories_sequence: 0,
  };

  const totalStoriesPerDay = capacity.storySequencesPerDay;
  let retinaIndex = 0;

  const days: ICalendarDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const items: ICalendarItem[] = [];
    const storySequences: any[] = [];

    const formats = [
      'reel',
      'long_video',
      'carousel',
      'static_post',
      'live',
    ] as ContentFormat[];
    for (const format of formats) {
      const totalForFormat = itemsPerFormat[format];
      const itemsToday =
        i === 0
          ? Math.max(0, Math.ceil(totalForFormat / totalDays))
          : Math.max(0, Math.floor(totalForFormat / totalDays));

      for (let j = 0; j < itemsToday; j++) {
        const retinaType =
          ALL_RETINA_TYPES[retinaIndex % ALL_RETINA_TYPES.length];
        retinaIndex++;
        const suggestedTime = SUGGESTED_TIMES[format] || '12:00';

        items.push({
          date: new Date(currentDate),
          format,
          retinaType,
          platforms: ['instagram'],
          objective: '',
          suggestedTime,
          status: 'planned',
          provisionalName: '',
        });
      }
    }

    if (totalStoriesPerDay > 0) {
      for (let s = 0; s < totalStoriesPerDay; s++) {
        const retinaType =
          ALL_RETINA_TYPES[retinaIndex % ALL_RETINA_TYPES.length];
        retinaIndex++;
        storySequences.push({
          date: new Date(currentDate),
          sequenceIndex: s + 1,
          storiesCount: 3,
          focus: '',
          retinaType,
          suggestedTime: '09:00',
          status: 'planned',
        });
      }
    }

    days.push({
      date: new Date(currentDate),
      items,
      storySequences,
    });
  }

  return { days };
}

@Injectable()
export class EditorialCalendarService {
  constructor(
    private readonly calendarRepository: EditorialCalendarRepository,
    private readonly versionRepository: EditorialVersionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private generateCalendarName(
    objective: CalendarObjective,
    periodType: PeriodType,
    customName?: string,
  ): string {
    if (customName) return customName;

    const objectiveLabels: Record<CalendarObjective, string> = {
      increase_audience: 'Crescimento de Audiência',
      warmup_sales: 'Aquecimento de Vendas',
      reinforce_authority: 'Reforço de Autoridade',
      increase_relationship: 'Relacionamento',
      improve_engagement: 'Engajamento',
      support_launch: 'Pré-lançamento',
    };

    const label = objectiveLabels[objective] || objective;
    const periodLabel = PERIOD_LABELS[periodType] || periodType;
    return `${label} - ${periodLabel}`;
  }

  private computeEndDate(
    startDate: Date,
    periodType: PeriodType,
    customEndDate?: Date,
  ): Date {
    if (periodType === 'custom' && customEndDate) {
      return customEndDate;
    }
    const end = new Date(startDate);
    switch (periodType) {
      case 'two_weeks':
        end.setDate(end.getDate() + 13);
        break;
      case 'one_month':
        end.setMonth(end.getMonth() + 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'four_weeks_warmup':
        end.setDate(end.getDate() + 27);
        break;
      case 'pre_launch':
        end.setDate(end.getDate() + 20);
        break;
      default:
        end.setDate(end.getDate() + 29);
    }
    return end;
  }

  async findByProjectId(projectId: string): Promise<IEditorialCalendar[]> {
    return this.calendarRepository.findAllByProject(projectId);
  }

  async findById(id: string): Promise<IEditorialCalendar> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');
    return calendar;
  }

  async create(
    projectId: string,
    setup: CalendarSetup,
  ): Promise<IEditorialCalendar> {
    const version = await this.versionRepository.findById(
      setup.editorialVersionId,
    );
    if (!version)
      throw new NotFoundException('Versão editorial não encontrada.');

    const endDate = this.computeEndDate(
      new Date(setup.startDate),
      setup.periodType,
      setup.endDate ? new Date(setup.endDate) : undefined,
    );
    const startDate = new Date(setup.startDate);

    const { days } = generateCalendarDays(startDate, endDate, setup.capacity);

    const name = this.generateCalendarName(
      setup.objective,
      setup.periodType,
      setup.customName,
    );

    const payload: ICreateEditorialCalendar = {
      projectId,
      editorialVersionId: setup.editorialVersionId,
      name,
      period: {
        type: setup.periodType,
        label: PERIOD_LABELS[setup.periodType] || setup.periodType,
        startDate,
        endDate,
      },
      platforms: setup.platforms,
      capacity: setup.capacity,
      objective: setup.objective,
      days,
    };

    const calendar = await this.calendarRepository.create(payload);

    this.eventEmitter.emit(EDITORIAL_EVENTS.CALENDAR_CREATED, {
      event: EDITORIAL_EVENTS.CALENDAR_CREATED,
      projectId,
      versionId: setup.editorialVersionId,
      versionNumber: 1,
      triggeredBy: '',
      timestamp: new Date(),
      metadata: { calendarId: calendar._id || (calendar as any).id, name },
    });

    return calendar;
  }

  async update(
    id: string,
    data: IUpdateEditorialCalendar,
  ): Promise<IEditorialCalendar> {
    const calendar = await this.calendarRepository.update(id, data);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    if (data.status === 'archived') {
      this.eventEmitter.emit(EDITORIAL_EVENTS.CALENDAR_ARCHIVED, {
        event: EDITORIAL_EVENTS.CALENDAR_ARCHIVED,
        projectId: calendar.projectId,
        versionId: calendar.editorialVersionId,
        versionNumber: 1,
        triggeredBy: '',
        timestamp: new Date(),
        metadata: { calendarId: id },
      });
    }

    return calendar;
  }

  async duplicate(
    id: string,
    periodOverride?: {
      periodType?: PeriodType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<IEditorialCalendar> {
    const original = await this.calendarRepository.findById(id);
    if (!original)
      throw new NotFoundException('Calendário original não encontrado.');

    let startDate: Date;
    let endDate: Date;
    let periodType: PeriodType;

    if (periodOverride && periodOverride.startDate) {
      startDate = new Date(periodOverride.startDate);
      periodType = periodOverride.periodType || original.period.type;
      endDate = periodOverride.endDate
        ? new Date(periodOverride.endDate)
        : this.computeEndDate(startDate, periodType);
    } else {
      startDate = new Date(original.period.startDate);
      endDate = new Date(original.period.endDate);
      periodType = original.period.type;
    }

    const { days } = generateCalendarDays(
      startDate,
      endDate,
      original.capacity,
    );

    const payload: ICreateEditorialCalendar = {
      projectId: original.projectId,
      editorialVersionId: original.editorialVersionId,
      name: `Cópia de ${original.name}`,
      period: {
        type: periodType,
        label: PERIOD_LABELS[periodType] || periodType,
        startDate,
        endDate,
      },
      platforms: original.platforms,
      capacity: original.capacity,
      objective: original.objective,
      days,
    };

    const calendar = await this.calendarRepository.create(payload);

    this.eventEmitter.emit(EDITORIAL_EVENTS.CALENDAR_DUPLICATED, {
      event: EDITORIAL_EVENTS.CALENDAR_DUPLICATED,
      projectId: original.projectId,
      versionId: original.editorialVersionId,
      versionNumber: 1,
      triggeredBy: '',
      timestamp: new Date(),
      metadata: {
        calendarId: calendar._id || (calendar as any).id,
        originalId: id,
      },
    });

    return calendar;
  }

  async updateItem(
    calendarId: string,
    itemId: string,
    data: ICalendarItemUpdate,
  ): Promise<IEditorialCalendar> {
    const calendar = await this.calendarRepository.updateItem(
      calendarId,
      itemId,
      data,
    );
    if (!calendar)
      throw new NotFoundException('Calendário ou item não encontrado.');
    return calendar;
  }

  async getReview(calendarId: string): Promise<IReviewSuggestion[]> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    const suggestions = this.generateReviewSuggestions(
      calendar.days,
      calendar.capacity,
    );
    await this.calendarRepository.addReviewSuggestions(calendarId, suggestions);
    return suggestions;
  }

  private generateReviewSuggestions(
    days: ICalendarDay[],
    capacity: ProductionCapacity,
  ): IReviewSuggestion[] {
    const suggestions: IReviewSuggestion[] = [];

    const retinaCount: Record<string, number> = {};
    let totalItems = 0;
    for (const day of days) {
      for (const item of day.items) {
        retinaCount[item.retinaType] = (retinaCount[item.retinaType] || 0) + 1;
        totalItems++;
      }
      for (const seq of day.storySequences) {
        retinaCount[seq.retinaType] = (retinaCount[seq.retinaType] || 0) + 1;
        totalItems++;
      }
    }

    const expectedPerType = totalItems / 6;
    for (const [type, count] of Object.entries(retinaCount)) {
      if (count > expectedPerType * 1.5) {
        suggestions.push({
          type: 'reduce',
          title: `Excesso de "${type}"`,
          description: `Reduza a frequência de conteúdo do tipo "${type}" para equilibrar a distribuição RETINA.`,
          impact: 'medium',
        });
      } else if (count < expectedPerType * 0.5) {
        suggestions.push({
          type: 'increase',
          title: `Falta de "${type}"`,
          description: `Aumente a produção de conteúdo do tipo "${type}" para melhor equilibrar a distribuição RETINA.`,
          impact: 'high',
        });
      }
    }

    const totalCapacity =
      capacity.reelsPerWeek +
      capacity.longVideosPerWeek +
      capacity.carouselsPerWeek +
      capacity.staticPostsPerWeek +
      capacity.livesPerWeek;
    const averagePerDay = totalItems / Math.max(1, days.length);
    const expectedPerDay = totalCapacity / 7;
    if (averagePerDay < expectedPerDay * 0.7) {
      suggestions.push({
        type: 'frequency',
        title: 'Capacidade subutilizada',
        description:
          'A quantidade de conteúdos gerados está abaixo da capacidade semelhante. Considere aumentar a produção.',
        impact: 'high',
      });
    }

    return suggestions;
  }

  async delete(id: string): Promise<{ message: string }> {
    const calendar = await this.calendarRepository.softDelete(id);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');
    return { message: 'Calendário removido com sucesso.' };
  }
}
