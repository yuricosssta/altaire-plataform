import { Injectable } from '@nestjs/common';
import {
  ContentFormat,
  ICalendarDay,
  ICalendarItem,
  IReviewSuggestion,
  Platform,
  RetinaType,
} from '../schemas/models/editorial-calendar.interface';
import {
  CalendarGenerator,
  ICalendarGenerationInput,
  ICalendarGenerationOutput,
  ICalendarReviewInput,
} from './calendar-generator';

const ALL_RETINA_TYPES: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const SUGGESTED_TIMES: Record<string, string> = {
  reel: '12:00',
  long_video: '17:00',
  carousel: '19:00',
  static_post: '18:30',
  live: '20:00',
  stories_sequence: '08:30 • 12:30 • 16:30 • 20:30',
};

const WEEKDAY_NAMES_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const MONTH_SHORTS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const FORMAT_TO_UI_KEY: Record<ContentFormat, string> = {
  reel: 'reel_curto',
  long_video: 'video_longo',
  carousel: 'carrossel',
  static_post: 'post_estatico',
  live: 'live_semanal',
  stories_sequence: 'sequencia_stories',
};

const RETINA_TO_UI_KEY: Record<RetinaType, string> = {
  relacionamento: 'Relacionamento',
  engajamento: 'Engajamento',
  transformacao: 'Transformacao',
  interacao: 'Interacao',
  nivel_consciencia: 'NiveisDeConsciencia',
  autoridade: 'Autoridade',
};

const PLATFORM_TO_UI: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

@Injectable()
export class StubCalendarGenerator extends CalendarGenerator {
  async generateCalendarPlan(
    context: ICalendarGenerationInput,
  ): Promise<ICalendarGenerationOutput> {
    // TODO(LLM): Substituir distribuição determinística por chamada à LLM que distribui os slots
    // semanais respeitando a capacidade real, plataformas, pilares ROMA, objetivo do período e
    // distribuição RETINA da Linha Editorial ativa, gerando títulos provisórios, objetivos,
    // 4 blocos diários de Stories e 3 sugestões iniciais de temas por slot (aiSuggestedThemes).
    // Input: ICalendarGenerationInput
    // Output esperado: ICalendarGenerationOutput

    const startDate = new Date(context.startDate);
    const endDate = new Date(context.endDate);
    const totalDays = Math.max(
      1,
      Math.min(
        60,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1,
      ),
    );
    const totalWeeks = Math.max(1, totalDays / 7);

    const itemsPerFormat: Record<ContentFormat, number> = {
      reel: Math.round((context.capacity.reelsPerWeek || 0) * totalWeeks),
      long_video: Math.round(
        (context.capacity.longVideosPerWeek || 0) * totalWeeks,
      ),
      carousel: Math.round(
        (context.capacity.carouselsPerWeek || 0) * totalWeeks,
      ),
      static_post: Math.round(
        (context.capacity.staticPostsPerWeek || 0) * totalWeeks,
      ),
      live: Math.round((context.capacity.livesPerWeek || 0) * totalWeeks),
      stories_sequence: 0,
    };

    const niche = context.niche || 'Estratégia';
    const subniche = context.subniche || niche;
    const pillars = context.pillars.length
      ? context.pillars
      : [
          '01. Visão de Mundo & Quebra de Mitos do Mercado',
          '02. Diagnóstico dos Erros Invisíveis do ICP',
          '03. Mecanismo Único da Oferta (MUV em Ação)',
          '04. Educação Prática & Transformação Aplicável',
        ];
    const platforms = (
      context.platforms.length ? context.platforms : ['instagram']
    ) as Platform[];

    const days: ICalendarDay[] = [];
    const slots: Record<string, unknown>[] = [];
    let retinaIndex = 0;

    // Distribui formatos proporcionalmente ao longo dos dias do período
    const formatCountsRemaining = { ...itemsPerFormat };
    const feedFormats: ContentFormat[] = [
      'reel',
      'carousel',
      'long_video',
      'static_post',
      'live',
    ];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateISO = currentDate.toISOString().slice(0, 10);
      const dayNumber = currentDate.getDate();
      const monthShort = MONTH_SHORTS_PT[currentDate.getMonth()] || 'Nov';
      const weekNumber = Math.min(4, Math.floor(i / 7) + 1) as 1 | 2 | 3 | 4;
      const jsDay = currentDate.getDay(); // 0=Sun..6=Sat
      const dayOfWeekIndex = ((jsDay + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const dayOfWeekLabel = WEEKDAY_NAMES_PT[jsDay] || 'Dia';

      const dayItems: ICalendarItem[] = [];
      const dayStorySequences: any[] = [];
      const daysLeft = Math.max(1, totalDays - i);

      for (const format of feedFormats) {
        const remaining = formatCountsRemaining[format];
        if (remaining <= 0) continue;

        const allocateToday =
          remaining >= daysLeft
            ? Math.ceil(remaining / daysLeft)
            : i % Math.max(1, Math.floor(daysLeft / remaining)) === 0
              ? 1
              : 0;

        for (
          let k = 0;
          k < allocateToday && formatCountsRemaining[format] > 0;
          k++
        ) {
          formatCountsRemaining[format]--;
          const retinaType =
            ALL_RETINA_TYPES[retinaIndex % ALL_RETINA_TYPES.length];
          const pillar = pillars[retinaIndex % pillars.length];
          retinaIndex++;

          const suggestedTime = SUGGESTED_TIMES[format] || '12:00';
          const slotId = `slot-w${weekNumber}-d${i + 1}-${format}-${k + 1}`;
          const uiRetina = RETINA_TO_UI_KEY[retinaType] || 'Transformacao';
          const uiFormat = FORMAT_TO_UI_KEY[format] || 'reel_curto';
          const uiPlatforms = platforms.map((p) => PLATFORM_TO_UI[p] || p);
          const provisionalTitle = `${subniche}: Pauta de ${uiRetina} (${dayOfWeekLabel})`;

          dayItems.push({
            date: new Date(currentDate),
            format,
            retinaType,
            platforms,
            objective: context.objective,
            suggestedTime,
            status: 'planned',
            provisionalName: provisionalTitle,
            pillar,
            strategicObjective: `Desenvolver ${uiRetina} alinhado a ${context.objective}`,
          });

          slots.push({
            id: slotId,
            dateISO,
            dayNumber,
            monthShort,
            weekNumber,
            dayOfWeekIndex,
            dayOfWeekLabel,
            provisionalTitle,
            format: uiFormat,
            retinaType: uiRetina,
            platforms: uiPlatforms,
            suggestedTime,
            strategicObjective: `Gerar impacto de ${uiRetina} alinhado a ${context.objective}`,
            secondaryObjective: `Apoiar ${context.objective}`,
            editorialLineName: context.linkedLineName,
            editorialPillar: pillar,
            mainTheme: '',
            aiSuggestedThemes: await this.generateSlotSuggestions({
              niche,
              subniche,
              format: uiFormat,
              retinaType: uiRetina,
              pillar,
            }),
            icpPainDesireOrObjection:
              'Dor ou objeção prioritária mapeada na Base Estratégica do projeto.',
            icpAwarenessLevel: 'Consciente da Solução',
            referenceLink: '',
            executionNotes:
              'Executar preservando o tom de voz e a promessa principal da Linha Editorial.',
            status: 'planned',
            eligibleForComplementaryMaterial:
              format === 'carousel' ||
              format === 'long_video' ||
              format === 'live',
            complementaryMaterialType:
              format === 'carousel' ||
              format === 'long_video' ||
              format === 'live'
                ? 'Checklist / Diagnóstico PDF Prático'
                : 'Nenhum',
          });
        }
      }

      if ((context.capacity.storySequencesPerDay || 0) > 0) {
        const seqCount = context.capacity.storySequencesPerDay;
        const storiesPerSeq = context.capacity.storiesPerSequence || 5;
        const retinaType =
          ALL_RETINA_TYPES[retinaIndex % ALL_RETINA_TYPES.length];
        retinaIndex++;

        for (let s = 0; s < seqCount; s++) {
          dayStorySequences.push({
            date: new Date(currentDate),
            sequenceIndex: s + 1,
            storiesCount: storiesPerSeq,
            focus: `Bloco ${s + 1} do dia`,
            retinaType,
            suggestedTime: SUGGESTED_TIMES.stories_sequence,
            status: 'planned',
          });
        }

        slots.push({
          id: `slot-w${weekNumber}-d${i + 1}-stories`,
          dateISO,
          dayNumber,
          monthShort,
          weekNumber,
          dayOfWeekIndex,
          dayOfWeekLabel,
          provisionalTitle: `${seqCount} Sequências de Stories do Dia (${seqCount * storiesPerSeq} stories)`,
          format: 'sequencia_stories',
          retinaType: RETINA_TO_UI_KEY[retinaType] || 'Relacionamento',
          platforms: ['Instagram'],
          suggestedTime: '08:30 • 12:30 • 16:30 • 20:30',
          strategicObjective:
            'Sustentar narrativa fracionada ao longo do dia (Manhã, Almoço, Tarde e Noite)',
          secondaryObjective:
            'Gerar respostas no Direct, enquetes qualificadoras e retenção diária',
          editorialLineName: context.linkedLineName,
          editorialPillar: pillars[i % pillars.length],
          mainTheme: '',
          aiSuggestedThemes: [
            `Sequência de Diagnóstico + Bastidor Real + Caixinha de Dúvidas em ${subniche}`,
            `Quebra de Objeção do Dia + Prova Social + Chamada para Direct`,
            `Estudo de Caso Fracionado em ${seqCount} Blocos`,
          ],
          icpPainDesireOrObjection:
            'Manter o comprador aquecido diariamente combinando relacionamento, prova e interação.',
          icpAwarenessLevel: 'Consciente da Solução',
          referenceLink: '',
          executionNotes: `Seguir o modelo canônico: ${seqCount} sequências no dia com ${storiesPerSeq} stories encadeados cada.`,
          status: 'planned',
          eligibleForComplementaryMaterial: false,
          complementaryMaterialType: 'Nenhum',
          storySequencesBreakdown: [
            {
              period: 'Manhã',
              suggestedTime: '08:30',
              storiesCount: storiesPerSeq,
              retinaFocus: 'Relacionamento',
              narrativeDirection:
                'Abertura do dia com ritual de trabalho, visão de mundo e contextualização do tema central.',
              hasQAndABox: false,
            },
            {
              period: 'Almoço',
              suggestedTime: '12:30',
              storiesCount: Math.max(3, storiesPerSeq - 1),
              retinaFocus: 'Transformacao',
              narrativeDirection:
                'Bastidor técnico de execução + micro-lição prática aplicável com enquete diagnóstica.',
              hasQAndABox: false,
            },
            {
              period: 'Tarde',
              suggestedTime: '16:30',
              storiesCount: storiesPerSeq,
              retinaFocus: 'Autoridade',
              narrativeDirection:
                'Prova real, análise de caso ou resposta aprofundada de caixinha conectada ao MUV.',
              hasQAndABox: true,
            },
            {
              period: 'Noite',
              suggestedTime: '20:30',
              storiesCount: Math.max(3, storiesPerSeq - 1),
              retinaFocus: 'NiveisDeConsciencia',
              narrativeDirection:
                'Fechamento reflexivo, quebra de objeção silenciosa e convite para interação/Direct.',
              hasQAndABox: true,
            },
          ],
        });
      }

      days.push({
        date: new Date(currentDate),
        items: dayItems,
        storySequences: dayStorySequences,
      });
    }

    const reviewSuggestions: IReviewSuggestion[] = [
      {
        id: 'rev-1',
        type: 'increase',
        title: 'Reforçar conteúdos práticos de Transformação',
        description:
          'Peças de Transformação geram maior taxa de salvamentos qualificados e ancoragem de método.',
        reason:
          'Peças práticas de Transformação aceleram a consciência da solução no ciclo ativo.',
        actionLabel: 'Aplicar reforço de Transformação',
        impact: 'high',
        applied: false,
      },
      {
        id: 'rev-2',
        type: 'adjust',
        title:
          'Equilibrar Níveis de Consciência e Autoridade nas semanas finais',
        description:
          'Com a evolução do período, intensifique a quebra de objeções e provas reais.',
        reason:
          'Prepara a audiência aquecida para conversão direta na oferta principal.',
        actionLabel: 'Equilibrar semanas finais',
        impact: 'medium',
        applied: false,
      },
    ];

    return { days, slots, reviewSuggestions };
  }

  async generateCalendarReview(
    context: ICalendarReviewInput,
  ): Promise<IReviewSuggestion[]> {
    // TODO(LLM): Substituir análise heurística por chamada à LLM que audita o calendário
    // comparando com os pesos RETINA e metas definidas no Mapa Estratégico da Linha Editorial ativa.
    // Input: { calendar: context.calendar, activeMapa: context.activeMapa }
    // Output esperado: IReviewSuggestion[]

    const { calendar } = context;
    const suggestions: IReviewSuggestion[] = [];

    const retinaCount: Record<string, number> = {};
    let totalItems = 0;

    for (const day of calendar.days || []) {
      for (const item of day.items || []) {
        retinaCount[item.retinaType] = (retinaCount[item.retinaType] || 0) + 1;
        totalItems++;
      }
      for (const seq of day.storySequences || []) {
        retinaCount[seq.retinaType] = (retinaCount[seq.retinaType] || 0) + 1;
        totalItems++;
      }
    }

    const expectedPerType = totalItems / 6;
    let idx = 1;
    for (const [type, count] of Object.entries(retinaCount)) {
      if (count > expectedPerType * 1.5) {
        suggestions.push({
          id: `rev-${idx++}`,
          type: 'reduce',
          title: `Excesso de "${type}"`,
          description: `Reduza a frequência de conteúdo do tipo "${type}" para equilibrar a distribuição RETINA.`,
          reason: `O tipo "${type}" está acima da proporção ideal para este ciclo.`,
          actionLabel: `Reequilibrar "${type}"`,
          impact: 'medium',
          applied: false,
        });
      } else if (count < expectedPerType * 0.5) {
        suggestions.push({
          id: `rev-${idx++}`,
          type: 'increase',
          title: `Falta de "${type}"`,
          description: `Aumente a produção de conteúdo do tipo "${type}" para melhor equilibrar a distribuição RETINA.`,
          reason: `Há baixa incidência de "${type}" nos slots planejados.`,
          actionLabel: `Reforçar "${type}"`,
          impact: 'high',
          applied: false,
        });
      }
    }

    const capacity = calendar.capacity;
    const totalCapacity =
      (capacity?.reelsPerWeek || 0) +
      (capacity?.longVideosPerWeek || 0) +
      (capacity?.carouselsPerWeek || 0) +
      (capacity?.staticPostsPerWeek || 0) +
      (capacity?.livesPerWeek || 0);
    const averagePerDay =
      totalItems / Math.max(1, (calendar.days || []).length);
    const expectedPerDay = totalCapacity / 7;
    if (averagePerDay < expectedPerDay * 0.7) {
      suggestions.push({
        id: `rev-${idx++}`,
        type: 'frequency',
        title: 'Capacidade subutilizada',
        description:
          'A quantidade de conteúdos gerados está abaixo da capacidade semanal configurada.',
        reason:
          'Há margem operacional para adicionar mais peças prioritárias sem comprometer a rotina.',
        actionLabel: 'Ajustar frequência',
        impact: 'high',
        applied: false,
      });
    }

    return suggestions;
  }

  async generateSlotSuggestions(context: {
    niche: string;
    subniche: string;
    format: string;
    retinaType: string;
    pillar?: string;
  }): Promise<string[]> {
    // TODO(LLM): Substituir templates por 3 sugestões reais geradas por LLM para o slot específico.
    const sub = context.subniche || context.niche || 'seu mercado';
    return [
      `Como evitar o erro invisível de ${sub} (${context.retinaType})`,
      `O método passo a passo para gerar previsibilidade em ${sub}`,
      `Estudo prático: o que diferencia amadores de profissionais em ${sub}`,
    ];
  }
}
