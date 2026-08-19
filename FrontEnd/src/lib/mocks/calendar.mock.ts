// src/lib/mocks/calendar.mock.ts
// Dados mock do Calendário Editorial — fallback do BFF enquanto o backend não
// expõe o contrato /editorial/calendars. O gerador simula o cruzamento da IA:
// linha editorial (pesos RETINA) + objetivo do período + capacidade real de
// produção, distribuindo formatos e tipos de conteúdo pelos dias.

import {
  OBJECTIVE_META,
  PERIOD_META,
  RETINA_OBJECTIVE_TEXT,
  STORY_SEQUENCE_FOCUS,
  STORY_SEQUENCE_TIME,
} from '@/lib/constants/calendar';
import { mockMapa, mockVersionById } from './editorial.mock';
import type {
  CalendarDay,
  CalendarDuplicate,
  CalendarItem,
  CalendarObjective,
  CalendarPatch,
  CalendarPeriod,
  CalendarSetup,
  ContentFormat,
  EditorialCalendar,
  Platform,
  ProductionCapacity,
  RetinaType,
  ReviewSuggestion,
  StorySequence,
} from '@/lib/dto/editorial.schema';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function generateObjectId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i += 1) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

const RETINA_TYPES: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const RETINA_LABEL_MAP: Record<string, RetinaType> = {
  Relacionamento: 'relacionamento',
  Engajamento: 'engajamento',
  Transformação: 'transformacao',
  Interação: 'interacao',
  'Níveis de Consciência': 'nivel_consciencia',
  Autoridade: 'autoridade',
};

const OBJECTIVE_RETINA_WEIGHTS: Record<CalendarObjective, Record<RetinaType, number>> = {
  increase_audience: {
    relacionamento: 15,
    engajamento: 30,
    transformacao: 20,
    interacao: 10,
    nivel_consciencia: 15,
    autoridade: 10,
  },
  warmup_sales: {
    relacionamento: 10,
    engajamento: 15,
    transformacao: 30,
    interacao: 5,
    nivel_consciencia: 25,
    autoridade: 15,
  },
  reinforce_authority: {
    relacionamento: 10,
    engajamento: 15,
    transformacao: 25,
    interacao: 5,
    nivel_consciencia: 20,
    autoridade: 25,
  },
  increase_relationship: {
    relacionamento: 30,
    engajamento: 15,
    transformacao: 15,
    interacao: 20,
    nivel_consciencia: 10,
    autoridade: 10,
  },
  improve_engagement: {
    relacionamento: 10,
    engajamento: 35,
    transformacao: 15,
    interacao: 25,
    nivel_consciencia: 10,
    autoridade: 5,
  },
  support_launch: {
    relacionamento: 10,
    engajamento: 10,
    transformacao: 30,
    interacao: 5,
    nivel_consciencia: 25,
    autoridade: 20,
  },
};

// Padrão da semana-exemplo: 2-3 cards por dia + bloco de stories.
const WEEK_PATTERN: { dayIndex: number; format: ContentFormat }[] = [
  { dayIndex: 0, format: 'reel' },
  { dayIndex: 0, format: 'carousel' },
  { dayIndex: 1, format: 'reel' },
  { dayIndex: 1, format: 'static_post' },
  { dayIndex: 2, format: 'long_video' },
  { dayIndex: 2, format: 'carousel' },
  { dayIndex: 3, format: 'reel' },
  { dayIndex: 3, format: 'static_post' },
  { dayIndex: 4, format: 'live' },
  { dayIndex: 4, format: 'carousel' },
  { dayIndex: 5, format: 'reel' },
];

const FORMAT_TIME: Record<ContentFormat, string> = {
  reel: '19:00',
  long_video: '18:00',
  carousel: '10:00',
  static_post: '14:00',
  live: '20:00',
  stories_sequence: '09:00',
};

function toLocalDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function startOfDay(date: Date): Date {
  const d = toLocalDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function capacityFor(format: ContentFormat, capacity: ProductionCapacity): number {
  switch (format) {
    case 'reel':
      return capacity.reelsPerWeek;
    case 'long_video':
      return capacity.longVideosPerWeek;
    case 'carousel':
      return capacity.carouselsPerWeek;
    case 'static_post':
      return capacity.staticPostsPerWeek;
    case 'live':
      return capacity.livesPerWeek;
    default:
      return 0;
  }
}

function getRetinaBaseWeights(versionId: string): Record<RetinaType, number> {
  const weights = {
    relacionamento: 15,
    engajamento: 20,
    transformacao: 30,
    interacao: 10,
    nivel_consciencia: 15,
    autoridade: 10,
  };
  const version = mockVersionById(versionId);
  if (version) {
    for (const item of mockMapa.retina) {
      const type = RETINA_LABEL_MAP[item.label];
      if (type) weights[type] = item.weight;
    }
  }
  return weights;
}

function combineWeights(
  versionId: string,
  objective: CalendarObjective,
): Record<RetinaType, number> {
  const base = getRetinaBaseWeights(versionId);
  const objectiveWeights = OBJECTIVE_RETINA_WEIGHTS[objective];
  const combined = {} as Record<RetinaType, number>;
  for (const type of RETINA_TYPES) {
    combined[type] = Math.round(base[type] * 0.5 + objectiveWeights[type] * 0.5);
  }
  return combined;
}

function weightedPick(weights: Record<RetinaType, number>): RetinaType {
  const total = RETINA_TYPES.reduce((sum, type) => sum + weights[type], 0);
  let roll = Math.random() * total;
  for (const type of RETINA_TYPES) {
    roll -= weights[type];
    if (roll <= 0) return type;
  }
  return RETINA_TYPES[RETINA_TYPES.length - 1];
}

function buildStorySequences(date: Date, capacity: ProductionCapacity): StorySequence[] {
  const count = Math.max(0, capacity.storySequencesPerDay);
  const dow = date.getDay();
  const sequences: StorySequence[] = [];
  for (let i = 1; i <= count; i += 1) {
    const focus =
      dow === 0
        ? 'Rotina, conexão e antecipação da semana'
        : dow === 6
          ? 'Stories leves e bastidores'
          : STORY_SEQUENCE_FOCUS[(i - 1) % STORY_SEQUENCE_FOCUS.length];
    sequences.push({
      id: generateObjectId(),
      date: new Date(date),
      sequenceIndex: i,
      storiesCount: i % 2 === 1 ? 4 : 5,
      focus,
      retinaType: (['relacionamento', 'interacao', 'engajamento', 'relacionamento'] as RetinaType[])[
        (i - 1) % 4
      ],
      suggestedTime: STORY_SEQUENCE_TIME[(i - 1) % STORY_SEQUENCE_TIME.length],
      status: 'planned',
      theme: '',
    });
  }
  return sequences;
}

function buildWeekItems(
  weekStart: Date,
  capacity: ProductionCapacity,
  weights: Record<RetinaType, number>,
  platform: Platform,
  objective: CalendarObjective,
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const used: Partial<Record<ContentFormat, number>> = {};

  const keptSlots = WEEK_PATTERN.filter((slot) => {
    const cap = capacityFor(slot.format, capacity);
    if (cap <= 0) return false;
    used[slot.format] = (used[slot.format] || 0) + 1;
    return used[slot.format]! <= cap;
  });

  const extras: { dayIndex: number; format: ContentFormat }[] = [];
  const fillerDays = [5, 6, 0, 1, 3];
  const fillerFormats: ContentFormat[] = ['reel', 'carousel', 'static_post', 'long_video'];
  for (const format of fillerFormats) {
    const cap = capacityFor(format, capacity);
    const placed = used[format] || 0;
    let needed = cap - placed;
    let i = 0;
    while (needed > 0 && i < fillerDays.length) {
      extras.push({ dayIndex: fillerDays[i], format });
      needed -= 1;
      i += 1;
    }
  }

  const slots = [...keptSlots, ...extras];
  for (const slot of slots) {
    const retina = weightedPick(weights);
    const date = addDays(weekStart, slot.dayIndex);
    items.push({
      id: generateObjectId(),
      date,
      format: slot.format,
      retinaType: retina,
      platforms: [platform],
      objective: RETINA_OBJECTIVE_TEXT[retina],
      suggestedTime: FORMAT_TIME[slot.format],
      theme: '',
      referenceUrl: '',
      status: 'planned',
      provisionalName: '',
      strategicObjective: OBJECTIVE_META[objective].label,
      pillar: '',
      painDesireObjection: '',
      observations: '',
      exampleUrl: '',
    });
  }
  return items;
}

function buildDays(
  period: CalendarPeriod,
  capacity: ProductionCapacity,
  weights: Record<RetinaType, number>,
  platform: Platform,
  objective: CalendarObjective,
): CalendarDay[] {
  const start = startOfDay(period.startDate);
  const end = startOfDay(period.endDate);

  const days: CalendarDay[] = [];
  let current = new Date(start);
  while (current <= end) {
    days.push({
      date: new Date(current),
      items: [],
      storySequences: buildStorySequences(current, capacity),
    });
    current = addDays(current, 1);
  }

  const firstMonday = addDays(start, (8 - start.getDay()) % 7);
  let weekStart = firstMonday;
  while (weekStart <= end) {
    const weekItems = buildWeekItems(weekStart, capacity, weights, platform, objective);
    for (const item of weekItems) {
      const day = days.find((d) => d.date.getTime() === item.date.getTime());
      if (day) day.items.push(item);
    }
    weekStart = addDays(weekStart, 7);
  }

  return days;
}

export function buildPeriod(setup: CalendarSetup): CalendarPeriod {
  const start = startOfDay(setup.startDate);
  const isCustom = setup.periodType === 'custom';
  const end = isCustom && setup.endDate ? startOfDay(setup.endDate) : addDays(start, PERIOD_META[setup.periodType].days - 1);
  return {
    type: setup.periodType,
    label: isCustom ? 'Período personalizado' : PERIOD_META[setup.periodType].label,
    startDate: start,
    endDate: end,
  };
}

export function buildReviewSuggestions(
  objective: CalendarObjective,
  capacity: ProductionCapacity,
): ReviewSuggestion[] {
  const nearSales = objective === 'warmup_sales' || objective === 'support_launch';
  const weeklyLoad =
    capacity.reelsPerWeek +
    capacity.longVideosPerWeek +
    capacity.carouselsPerWeek +
    capacity.staticPostsPerWeek +
    capacity.livesPerWeek;
  return [
    {
      id: generateObjectId(),
      type: 'increase',
      title: 'Aumentar conteúdos de Transformação',
      description:
        'Se os salvamentos do período estiverem altos, eleve a frequência de Reels e Vídeos Longos com foco em Transformação.',
      impact: 'high',
    },
    {
      id: generateObjectId(),
      type: 'reduce',
      title: 'Reduzir Engajamento amplo',
      description:
        'Conteúdos muito amplos de Engajamento podem atrair audiência pouco qualificada. Diminua o peso se a retenção cair.',
      impact: 'medium',
    },
    {
      id: generateObjectId(),
      type: 'adjust',
      title: 'Reforçar Autoridade e Níveis de Consciência',
      description: nearSales
        ? 'Período próximo a vendas: eleve Autoridade e Níveis de Consciência na semana que antecede a campanha.'
        : 'Eleve Autoridade e Níveis de Consciência em períodos estratégicos, mantendo a narrativa da linha editorial.',
      impact: 'high',
    },
    {
      id: generateObjectId(),
      type: 'frequency',
      title: 'Ajustar frequência de execução',
      description: weeklyLoad > 10
        ? `A carga semanal declarada (${weeklyLoad} peças) é alta. Se a execução ficar abaixo, reduza a frequência para manter consistência e qualidade.`
        : 'Revise a frequência se a execução estiver ficando abaixo da capacidade declarada pelo especialista.',
      impact: 'medium',
    },
  ];
}

export function mockCreateCalendar(projectId: string, setup: CalendarSetup): EditorialCalendar {
  const period = buildPeriod(setup);
  const version = mockVersionById(setup.editorialVersionId);
  const weights = combineWeights(setup.editorialVersionId, setup.objective);
  const platform = setup.platforms[0];
  const days = buildDays(period, setup.capacity, weights, platform, setup.objective);
  const now = new Date();
  return {
    id: generateObjectId(),
    projectId,
    editorialVersionId: setup.editorialVersionId,
    name:
      setup.customName ||
      `${version?.name || 'Estratégia'} — ${PERIOD_META[setup.periodType].label}`,
    period,
    platforms: setup.platforms,
    capacity: setup.capacity,
    objective: setup.objective,
    status: 'active',
    days,
    reviewSuggestions: buildReviewSuggestions(setup.objective, setup.capacity),
    createdAt: now,
    updatedAt: now,
  };
}

export const mockCalendars: EditorialCalendar[] = [
  (() => {
    const calendar = mockCreateCalendar('64f1b2c3e4b0a1c2d3e4f5a6', {
      editorialVersionId: '64f1b2c3e4b0a1c2d3e4f5a8',
      periodType: 'one_month',
      startDate: new Date('2026-08-03T00:00:00Z'),
      platforms: ['instagram'],
      capacity: {
        reelsPerWeek: 4,
        longVideosPerWeek: 1,
        carouselsPerWeek: 3,
        staticPostsPerWeek: 2,
        livesPerWeek: 1,
        storySequencesPerDay: 3,
      },
      objective: 'warmup_sales',
    });
    return {
      ...calendar,
      id: '64f1b2c3e4b0a1c2d3e4f5c1',
      name: 'Aquecimento — Conversão',
      createdAt: new Date('2026-08-01T09:00:00Z'),
      updatedAt: new Date('2026-08-06T10:00:00Z'),
    };
  })(),
  (() => {
    const calendar = mockCreateCalendar('64f1b2c3e4b0a1c2d3e4f5a7', {
      editorialVersionId: '64f1b2c3e4b0a1c2d3e4f5b1',
      periodType: 'four_weeks_warmup',
      startDate: new Date('2026-08-10T00:00:00Z'),
      platforms: ['instagram', 'youtube'],
      capacity: {
        reelsPerWeek: 4,
        longVideosPerWeek: 1,
        carouselsPerWeek: 2,
        staticPostsPerWeek: 2,
        livesPerWeek: 1,
        storySequencesPerDay: 4,
      },
      objective: 'support_launch',
    });
    return {
      ...calendar,
      id: '64f1b2c3e4b0a1c2d3e4f5c2',
      name: 'Contagem regressiva — Lançamento',
      createdAt: new Date('2026-08-08T09:00:00Z'),
      updatedAt: new Date('2026-08-09T10:00:00Z'),
    };
  })(),
];

export function mockCalendarsForProject(projectId: string): EditorialCalendar[] {
  return mockCalendars.filter((calendar) => calendar.projectId === projectId);
}

export function mockCalendarById(calendarId: string): EditorialCalendar | undefined {
  return mockCalendars.find((calendar) => calendar.id === calendarId);
}

export function mockPatchCalendar(
  calendar: EditorialCalendar,
  patch: CalendarPatch,
): EditorialCalendar {
  const next: EditorialCalendar = {
    ...calendar,
    ...patch,
    updatedAt: new Date(),
  };
  if ((patch.objective && patch.objective !== calendar.objective) || patch.capacity) {
    const weights = combineWeights(next.editorialVersionId, next.objective);
    next.days = buildDays(
      next.period,
      next.capacity,
      weights,
      next.platforms[0],
      next.objective,
    );
    next.reviewSuggestions = buildReviewSuggestions(next.objective, next.capacity);
  }
  return next;
}

export function mockUpdateCalendarItem(
  calendar: EditorialCalendar,
  itemId: string,
  patch: Record<string, unknown>,
): CalendarItem | null {
  for (const day of calendar.days) {
    const index = day.items.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      day.items[index] = { ...day.items[index], ...patch };
      return day.items[index];
    }
  }
  return null;
}

export function mockDuplicateCalendar(
  calendar: EditorialCalendar,
  duplicate?: CalendarDuplicate,
): EditorialCalendar {
  const now = new Date();
  let days = calendar.days;
  let period = calendar.period;
  if (duplicate?.periodType || duplicate?.startDate) {
    const periodType = duplicate.periodType ?? calendar.period.type;
    const startDate = startOfDay(duplicate.startDate ?? calendar.period.startDate);
    const isCustom = periodType === 'custom';
    const endDate = duplicate.endDate
      ? startOfDay(duplicate.endDate)
      : isCustom
        ? startOfDay(calendar.period.endDate)
        : addDays(startDate, PERIOD_META[periodType].days - 1);
    period = {
      type: periodType,
      label: isCustom ? 'Período personalizado' : PERIOD_META[periodType].label,
      startDate,
      endDate,
    };
    const weights = combineWeights(calendar.editorialVersionId, calendar.objective);
    days = buildDays(period, calendar.capacity, weights, calendar.platforms[0], calendar.objective);
  }
  return {
    ...calendar,
    id: generateObjectId(),
    name: `${calendar.name} (cópia)`,
    status: 'archived',
    period,
    days,
    createdAt: now,
    updatedAt: now,
  };
}

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_REGEX.test(value);
}