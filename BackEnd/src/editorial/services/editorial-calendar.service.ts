import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { CalendarGenerator } from '../generators/calendar-generator';
import {
  IEditorialCalendar,
  ICreateEditorialCalendar,
  IUpdateEditorialCalendar,
  ICalendarItemUpdate,
  IReviewSuggestion,
  ContentFormat,
  RetinaType,
  CalendarObjective,
  PeriodType,
  Platform,
  ICalendarDay,
  ICalendarItem,
  ProductionCapacity,
} from '../schemas/models/editorial-calendar.interface';
import { EDITORIAL_EVENTS } from '../../shared/events/editorial.events';
import { CreateCalendarSlotInput } from '../validations/editorial-calendar.zod';

export interface CalendarSetup {
  editorialVersionId?: string;
  periodType: PeriodType;
  startDate?: Date;
  endDate?: Date;
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  mainObjective?: string;
  linkedLineName?: string;
  platforms: Platform[];
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

const FORMAT_LABELS: Record<string, string> = {
  reel: 'Reels / Short',
  long_video: 'Vídeo Longo',
  carousel: 'Carrossel',
  static_post: 'Post Estático',
  live: 'Live',
  stories_sequence: 'Sequência de Stories',
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
          storiesCount: capacity.storiesPerSequence ?? 5,
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
    @Optional() private readonly calendarGenerator?: CalendarGenerator,
    @Optional() private readonly projectRepository?: EditorialProjectRepository,
    @Optional() private readonly mapaRepository?: EditorialMapaRepository,
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
    let resolvedVersionId = setup.editorialVersionId;
    let linkedLineName = setup.linkedLineName || 'Linha Editorial Ativa';

    if (resolvedVersionId && /^[0-9a-fA-F]{24}$/.test(resolvedVersionId)) {
      const version = await this.versionRepository.findById(resolvedVersionId);
      if (!version)
        throw new NotFoundException('Versão editorial não encontrada.');
      linkedLineName = setup.linkedLineName || version.name;
    } else {
      const versions = await this.versionRepository.findAllByProject(projectId);
      const active = versions.find((v) => v.status === 'active') || versions[0];
      if (active) {
        resolvedVersionId = String(active._id || (active as any).id);
        linkedLineName = setup.linkedLineName || active.name;
      } else {
        resolvedVersionId = projectId;
      }
    }

    const startDate = setup.startDate
      ? new Date(setup.startDate)
      : setup.periodStart
        ? new Date(setup.periodStart)
        : new Date();
    const endDate = this.computeEndDate(
      startDate,
      setup.periodType,
      setup.endDate
        ? new Date(setup.endDate)
        : setup.periodEnd
          ? new Date(setup.periodEnd)
          : undefined,
    );

    const periodLabel =
      setup.periodLabel || PERIOD_LABELS[setup.periodType] || setup.periodType;
    const name = this.generateCalendarName(
      setup.objective,
      setup.periodType,
      setup.customName,
    );

    let niche = 'Negócios Digitais';
    let subniche = 'Conteúdo Estratégico';
    let pillars: string[] = [];

    if (this.projectRepository) {
      const project = await this.projectRepository.findById(projectId);
      if (project) {
        niche = project.niche;
        subniche = project.subniche;
      }
    }

    if (
      this.mapaRepository &&
      resolvedVersionId &&
      /^[0-9a-fA-F]{24}$/.test(resolvedVersionId)
    ) {
      const mapa = await this.mapaRepository.findByVersionId(resolvedVersionId);
      if (mapa?.pilares?.length) {
        pillars = mapa.pilares.map((p) => p.title);
      }
    }

    let days: ICalendarDay[];
    let slots: Record<string, unknown>[] = [];
    let reviewSuggestions: IReviewSuggestion[] = [];

    if (this.calendarGenerator) {
      const generated = await this.calendarGenerator.generateCalendarPlan({
        projectId,
        niche,
        subniche,
        objective: setup.mainObjective || setup.objective,
        periodLabel,
        startDate,
        endDate,
        platforms: setup.platforms,
        capacity: setup.capacity,
        linkedLineName,
        pillars,
      });
      days = generated.days;
      slots = generated.slots;
      reviewSuggestions = generated.reviewSuggestions;
    } else {
      days = generateCalendarDays(startDate, endDate, setup.capacity).days;
    }

    const weeklyCapacity: Record<string, number> = {
      reels: setup.capacity.reelsPerWeek,
      longVideos: setup.capacity.longVideosPerWeek,
      carousels: setup.capacity.carouselsPerWeek,
      staticPosts: setup.capacity.staticPostsPerWeek,
      lives: setup.capacity.livesPerWeek,
      storiesPerDay: setup.capacity.storySequencesPerDay,
    };

    const payload: ICreateEditorialCalendar = {
      projectId,
      editorialVersionId: resolvedVersionId,
      name,
      period: {
        type: setup.periodType,
        label: periodLabel,
        startDate,
        endDate,
      },
      periodLabel,
      periodStart: setup.periodStart || startDate.toISOString().slice(0, 10),
      periodEnd: setup.periodEnd || endDate.toISOString().slice(0, 10),
      mainObjective: setup.mainObjective || setup.objective,
      linkedLineName,
      platforms: setup.platforms,
      capacity: setup.capacity,
      weeklyCapacity,
      objective: setup.objective,
      status: 'active',
      days,
      slots,
      reviewSuggestions,
    };

    const calendar = await this.calendarRepository.create(payload);

    if (this.projectRepository) {
      await this.projectRepository.update(projectId, {
        calendarStatus: 'active',
        currentPhaseLabel: 'Calendário Editorial ativo',
      });
    }

    this.eventEmitter.emit(EDITORIAL_EVENTS.CALENDAR_CREATED, {
      event: EDITORIAL_EVENTS.CALENDAR_CREATED,
      projectId,
      versionId: resolvedVersionId,
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
      name?: string;
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

    const clonedSlots = (original.slots || []).map((slot) => ({
      ...slot,
      id: `slot-${randomUUID().slice(0, 8)}`,
      status: 'planned',
    }));

    const payload: ICreateEditorialCalendar = {
      projectId: original.projectId,
      editorialVersionId: original.editorialVersionId,
      name: periodOverride?.name || `Cópia de ${original.name}`,
      period: {
        type: periodType,
        label: PERIOD_LABELS[periodType] || periodType,
        startDate,
        endDate,
      },
      periodLabel: original.periodLabel,
      periodStart: startDate.toISOString().slice(0, 10),
      periodEnd: endDate.toISOString().slice(0, 10),
      mainObjective: original.mainObjective,
      linkedLineName: original.linkedLineName,
      platforms: original.platforms,
      capacity: original.capacity,
      weeklyCapacity: original.weeklyCapacity,
      objective: original.objective,
      status: 'draft',
      days,
      slots: clonedSlots,
      reviewSuggestions: original.reviewSuggestions || [],
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

  async addSlot(
    calendarId: string,
    slotInput: CreateCalendarSlotInput,
  ): Promise<IEditorialCalendar> {
    const slotId = slotInput.id || `slot-custom-${randomUUID().slice(0, 8)}`;
    const slotPayload: Record<string, unknown> = {
      ...slotInput,
      id: slotId,
      formatLabel:
        slotInput.formatLabel ||
        FORMAT_LABELS[slotInput.format] ||
        slotInput.format,
      retinaBadge: slotInput.retinaBadge || 'Relacionamento',
      status: slotInput.status || 'planned',
      theme: slotInput.mainTheme,
      provisionalName: slotInput.provisionalTitle,
    };

    const updated = await this.calendarRepository.addSlot(
      calendarId,
      slotPayload,
    );
    if (!updated) throw new NotFoundException('Calendário não encontrado.');
    return updated;
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

  async deleteItem(
    calendarId: string,
    itemId: string,
  ): Promise<IEditorialCalendar> {
    const calendar = await this.calendarRepository.deleteItem(
      calendarId,
      itemId,
    );
    if (!calendar)
      throw new NotFoundException('Calendário ou item não encontrado.');
    return calendar;
  }

  async getReview(calendarId: string): Promise<IReviewSuggestion[]> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendário não encontrado.');

    if (this.calendarGenerator) {
      const versionId = String(calendar.editorialVersionId || '');
      const activeMapa =
        this.mapaRepository && /^[0-9a-fA-F]{24}$/.test(versionId)
          ? await this.mapaRepository.findByVersionId(versionId)
          : null;
      const suggestions = await this.calendarGenerator.generateCalendarReview({
        calendar,
        activeMapa,
      });
      await this.calendarRepository.addReviewSuggestions(
        calendarId,
        suggestions,
      );
      return suggestions;
    }

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
