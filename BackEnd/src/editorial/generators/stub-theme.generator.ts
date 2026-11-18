import { Injectable } from '@nestjs/common';
import {
  ContentFormat,
  Platform,
  RetinaType,
} from '../schemas/models/editorial-calendar.interface';
import {
  ConsciousnessLevel,
  ICreateEditorialTheme,
  IEditorialTheme,
  JourneyStage,
  ThemeApproach,
} from '../schemas/models/editorial-theme.interface';
import {
  IThemeGenerationContext,
  IThemeGenerationInput,
  ThemeGenerator,
} from './theme-generator';

export const RETINA_TYPES: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const CONSCIOUSNESS_LEVELS: ConsciousnessLevel[] = [
  'sintoma',
  'solucao',
  'objecao',
];

const DEFAULT_FORMATS: ContentFormat[] = [
  'reel',
  'carousel',
  'long_video',
  'static_post',
  'reel',
  'live',
];

const APPROACHES: ThemeApproach[] = [
  'erro',
  'metodo',
  'historia',
  'bastidor',
  'estudo_caso',
  'outro',
];

const CONSCIOUSNESS_LABELS: Record<ConsciousnessLevel, string> = {
  sintoma: 'Consciente do sintoma',
  solucao: 'Consciente da solução',
  objecao: 'Quebra de objeção',
};

const CONSCIOUSNESS_UI_AXIS: Record<ConsciousnessLevel, string> = {
  sintoma: 'Sintoma',
  solucao: 'Solução',
  objecao: 'Objeção',
};

const JOURNEY_LABELS: Record<JourneyStage, string> = {
  descoberta: 'descoberta',
  consideracao: 'consideração',
  conversao: 'conversão',
  experiencia: 'experiência',
  compartilhamento: 'compartilhamento',
};

const JOURNEY_BY_LEVEL: Record<ConsciousnessLevel, JourneyStage[]> = {
  sintoma: ['descoberta', 'consideracao'],
  solucao: ['consideracao', 'experiencia', 'compartilhamento'],
  objecao: ['conversao', 'consideracao'],
};

const FORMAT_TO_UI: Record<ContentFormat, string> = {
  reel: 'reel_curto',
  long_video: 'video_longo',
  carousel: 'carrossel',
  static_post: 'post_estatico',
  live: 'live_semanal',
  stories_sequence: 'sequencia_stories',
};

const PLATFORM_TO_UI: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

const TECHNIQUES_BY_ORIGIN: Record<string, string[]> = {
  roma_avatar: [
    'Técnica 1 · Subárea Estrutural da ROMA',
    'Técnica 2 · Avatar (Vencer Dores & Chegar aos Desejos)',
    'Técnica 3 · Quebra de Mito para chegar à ROMA',
    'Técnica 4 · Atalhos e Oportunidades para a ROMA',
    'Técnica 5 · Estudo de Caso que Remove Objeção',
  ],
  market: [
    "Técnica 7 · Engenharia Reversa de Comentários ('Mas e se...?')",
    'Técnica 9 · Termos Periféricos Invisíveis da Rotina do ICP',
    'Técnica 10 · Desconstrução de Estereótipos (Anti-Clichê)',
    'Técnica 11 · Engenharia Reversa de Reviews',
    'Técnica 12 · Mapeamento de Ilhas de Competência',
  ],
  objective: [
    'Alinhamento Direto · Objetivo do Período',
    'Prioridade de Ciclo · Quebra de Objeção Imediata',
    'Prioridade de Ciclo · Demonstração de Oferta & MUV',
    'Prioridade de Ciclo · Qualificação de Compradores',
  ],
};

type TitleTemplate = (pillar: string, niche: string) => string;

const TEMPLATES: Record<
  ThemeApproach,
  Record<ConsciousnessLevel, TitleTemplate>
> = {
  erro: {
    sintoma: (p) => `O erro silencioso em ${p} que trava seus resultados`,
    solucao: (p) => `3 erros de ${p} e como corrigir cada um hoje`,
    objecao: (p) => `"Já tentei ${p} e não deu certo": onde estava o erro`,
  },
  metodo: {
    sintoma: (p, n) => `Por que ${n} sem método de ${p} vira tentativa e erro`,
    solucao: (p) => `O passo a passo de ${p} que eu aplico toda semana`,
    objecao: (p) => `${p} leva tempo demais? O método enxuto em 20 minutos`,
  },
  historia: {
    sintoma: (p) => `O dia em que percebi que ${p} era o meu gargalo`,
    solucao: (p) => `Como ${p} mudou a forma como eu trabalho`,
    objecao: (p) => `Eu também achava que ${p} não era pra mim`,
  },
  bastidor: {
    sintoma: (p) => `Bastidores: os sinais de que ${p} está falhando`,
    solucao: (p) => `Bastidores reais da minha rotina de ${p}`,
    objecao: (p) => `Mostrando o que ninguém mostra sobre ${p}`,
  },
  estudo_caso: {
    sintoma: (p) => `Estudo de caso: o custo de ignorar ${p}`,
    solucao: (p) => `Estudo de caso: o antes e depois com ${p}`,
    objecao: (p) => `Estudo de caso: ${p} funcionando mesmo com pouco tempo`,
  },
  outro: {
    sintoma: (p) => `Você está sentindo isso em ${p}?`,
    solucao: (p, n) => `O guia rápido de ${p} para ${n}`,
    objecao: (p) => `Mitos sobre ${p} que você precisa abandonar`,
  },
};

const FALLBACK_PILLARS = ['Autoridade', 'Rotina', 'Resultados'];

/**
 * Gerador determinístico de temas a partir do Mapa Estratégico.
 * Combina pilares × RETINA × nível de consciência em round-robin, de modo
 * que o mesmo input sempre produz o mesmo lote. Substituto até a chegada do
 * adapter LLM.
 */
@Injectable()
export class StubThemeGenerator extends ThemeGenerator {
  async generate(
    context: IThemeGenerationContext,
    input: IThemeGenerationInput,
  ): Promise<ICreateEditorialTheme[]> {
    // TODO(LLM): Substituir round-robin determinístico por chamada à LLM especializada nos 3 modos:
    // - roma_avatar: aplica as Técnicas 1 a 6 sobre ROMA, Dores, Desejos, Objeções e Mitos do Mapa Estratégico.
    // - market: analisa videoLinks, comments e reviews para extrair ângulos anti-clichê (Técnicas 7 a 13).
    // - objective: alinha pautas diretamente ao objetivo comercial e momento de negócio (aquecimento, carrinho aberto, manutenção).
    // Input: { context, input }
    // Output esperado: ICreateEditorialTheme[]

    const pillars = input.pillars?.length
      ? input.pillars
      : context.pillars.length
        ? context.pillars
        : FALLBACK_PILLARS;
    const niche = context.subniche || context.niche || 'seu negócio';
    const platforms: Platform[] = input.platforms.length
      ? input.platforms
      : ['instagram'];
    const formats = input.formats?.length ? input.formats : DEFAULT_FORMATS;
    const retinaCycle = this.buildRetinaCycle(input);
    const offset = input.offset ?? 0;
    const techniquePool =
      TECHNIQUES_BY_ORIGIN[input.mode] || TECHNIQUES_BY_ORIGIN.roma_avatar;

    const themes: ICreateEditorialTheme[] = [];
    for (let n = 0; n < input.count; n++) {
      const i = n + offset;
      const pillar = pillars[i % pillars.length];
      const level = CONSCIOUSNESS_LEVELS[i % CONSCIOUSNESS_LEVELS.length];
      const approach =
        APPROACHES[(Math.floor(i / pillars.length) + i) % APPROACHES.length];
      const journeyOptions = JOURNEY_BY_LEVEL[level];
      const journeyStage =
        journeyOptions[
          Math.floor(i / CONSCIOUSNESS_LEVELS.length) % journeyOptions.length
        ];
      const format = formats[i % formats.length];
      const targetPlatforms = this.platformsForFormat(format, platforms);
      const isMarketTest = input.mode === 'market' && n % 3 === 0;

      themes.push({
        projectId: context.projectId,
        origin: input.mode,
        title: TEMPLATES[approach][level](pillar, niche),
        pillar,
        retinaType: retinaCycle[i % retinaCycle.length],
        consciousnessLevel: level,
        journeyStage,
        format,
        platforms: targetPlatforms,
        status: isMarketTest ? 'market_test' : 'active',
        flags: [],
        sourceContext: input.sourceContext,
        batchId: input.batchId,
        angle: `${CONSCIOUSNESS_LABELS[level]} · ${JOURNEY_LABELS[journeyStage]}`,
        approach,
        techniqueUsed: techniquePool[i % techniquePool.length],
        romaPillar: pillar,
        consciousnessAxis: CONSCIOUSNESS_UI_AXIS[level],
        recommendedFormat: FORMAT_TO_UI[format] || 'reel_curto',
        recommendedPlatform: PLATFORM_TO_UI[targetPlatforms[0]] || 'Instagram',
        painDesireOrObjection:
          level === 'objecao'
            ? `Objeção mapeada sobre ${pillar} em ${niche}.`
            : level === 'sintoma'
              ? `Dor recorrente do ICP ligada a ${pillar}.`
              : `Desejo de domínio prático em ${pillar}.`,
        isFavorite: false,
        isPriorityNextCycle: input.mode === 'objective' || n < 3,
        isSavedForSales: level === 'objecao',
        isMarketTest,
        allocatedSlotIds: [],
      });
    }
    return themes;
  }

  async generateMoreThemes(
    context: IThemeGenerationContext,
    seedTheme: IEditorialTheme,
    count: number,
    batchId: string,
  ): Promise<ICreateEditorialTheme[]> {
    // TODO(LLM): Gerar cluster de variações aprofundando exatamente o mesmo ângulo/tema semente
    // mantendo coerência com a Base Estratégica do projeto.
    // Input: { context, seedTheme, count }
    // Output esperado: ICreateEditorialTheme[]

    const base = await this.generate(context, {
      mode: seedTheme.origin,
      count,
      batchId,
      pillars: [seedTheme.pillar],
      platforms: seedTheme.platforms,
      formats: [seedTheme.format, 'carousel', 'long_video', 'reel'],
      retinaTypes: [seedTheme.retinaType],
      offset: 10,
    });

    const prefixVariations = [
      `${seedTheme.title} — Parte 2: O protocolo prático de execução`,
      `Estudo de Caso: Como resolvemos "${seedTheme.title.slice(0, 48)}..." na prática`,
      `A pergunta que todo comprador faz sobre: ${seedTheme.title.slice(0, 48)}...`,
    ];

    return base.map((item, idx) => ({
      ...item,
      title:
        prefixVariations[idx] || `${seedTheme.title} (Variação #${idx + 1})`,
    }));
  }

  async rebalanceSlots(context: {
    slots: Record<string, unknown>[];
    themes: IEditorialTheme[];
    scenario: string;
  }): Promise<{
    updatedSlots: Record<string, unknown>[];
    allocatedPairs: { calendarItemId: string; theme: IEditorialTheme }[];
  }> {
    // TODO(LLM): Substituir alocação heurística por otimizador baseado em LLM que distribui
    // temas nos slots do calendário respeitando o equilíbrio RETINA, a Jornada de 5 Passos
    // e o cenário simulado (none, more_transformation, sales_push, top_of_funnel).
    // Input: { slots: context.slots, themes: context.themes, scenario: context.scenario }
    // Output esperado: { updatedSlots, allocatedPairs }

    const usedThemeIds = new Set<string>();
    const allocatedPairs: { calendarItemId: string; theme: IEditorialTheme }[] =
      [];

    const updatedSlots = (context.slots || []).map((slot) => {
      const format = String(slot.format || '');
      if (format === 'sequencia_stories' || format === 'stories_sequence') {
        return slot;
      }

      let targetRetina = String(slot.retinaType || 'Transformacao');
      if (
        context.scenario === 'more_transformation' &&
        targetRetina === 'Engajamento'
      ) {
        targetRetina = 'Transformacao';
      } else if (
        context.scenario === 'sales_push' &&
        (targetRetina === 'Engajamento' || targetRetina === 'Relacionamento')
      ) {
        targetRetina = 'NiveisDeConsciencia';
      } else if (
        context.scenario === 'top_of_funnel' &&
        targetRetina === 'NiveisDeConsciencia'
      ) {
        targetRetina = 'Engajamento';
      }

      const bestMatch =
        context.themes.find(
          (t) =>
            !usedThemeIds.has(String(t.id || t._id)) &&
            (t.recommendedFormat === format || t.format === format),
        ) ??
        context.themes.find((t) => !usedThemeIds.has(String(t.id || t._id))) ??
        context.themes[0];

      if (bestMatch) {
        const themeId = String(bestMatch.id || bestMatch._id || '');
        if (themeId) usedThemeIds.add(themeId);
        allocatedPairs.push({
          calendarItemId: String(slot.id || slot._id || ''),
          theme: bestMatch,
        });
        return {
          ...slot,
          retinaType: targetRetina,
          mainTheme: bestMatch.title,
          editorialPillar: bestMatch.romaPillar || bestMatch.pillar,
          icpPainDesireOrObjection:
            bestMatch.painDesireOrObjection || slot.icpPainDesireOrObjection,
        };
      }
      return slot;
    });

    return { updatedSlots, allocatedPairs };
  }

  /** Com prioridade RETINA, metade dos temas recai no tipo priorizado. */
  private buildRetinaCycle(input: IThemeGenerationInput): RetinaType[] {
    const base = input.retinaTypes?.length ? input.retinaTypes : RETINA_TYPES;
    const priority = input.retinaPriority;
    if (!priority || priority === 'balanced') return base;
    return base.flatMap((type) =>
      type === priority ? [type] : [priority, type],
    );
  }

  private platformsForFormat(
    format: ContentFormat,
    platforms: Platform[],
  ): Platform[] {
    if (format === 'long_video' && platforms.includes('youtube'))
      return ['youtube'];
    const shortForm = platforms.filter((p) => p !== 'youtube');
    if (format === 'reel' && platforms.includes('youtube'))
      return [...shortForm, 'youtube'];
    return shortForm.length ? shortForm : platforms;
  }
}
