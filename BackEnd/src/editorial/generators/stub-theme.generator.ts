import { Injectable } from '@nestjs/common';
import {
  ContentFormat,
  Platform,
  RetinaType,
} from '../schemas/models/editorial-calendar.interface';
import {
  ConsciousnessLevel,
  ICreateEditorialTheme,
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

const JOURNEY_LABELS: Record<JourneyStage, string> = {
  descoberta: 'descoberta',
  consideracao: 'consideração',
  conversao: 'conversão',
  experiencia: 'experiência',
  compartilhamento: 'compartilhamento',
};

/** Jornada "natural" por nível de consciência — mantém coerência no stub. */
const JOURNEY_BY_LEVEL: Record<ConsciousnessLevel, JourneyStage[]> = {
  sintoma: ['descoberta', 'consideracao'],
  solucao: ['consideracao', 'experiencia', 'compartilhamento'],
  objecao: ['conversao', 'consideracao'],
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

    const themes: ICreateEditorialTheme[] = [];
    for (let n = 0; n < input.count; n++) {
      const i = n + offset;
      const pillar = pillars[i % pillars.length];
      const level = CONSCIOUSNESS_LEVELS[i % CONSCIOUSNESS_LEVELS.length];
      // Avança a abordagem a cada volta completa de pilares → títulos distintos.
      const approach =
        APPROACHES[(Math.floor(i / pillars.length) + i) % APPROACHES.length];
      const journeyOptions = JOURNEY_BY_LEVEL[level];
      const journeyStage =
        journeyOptions[
          Math.floor(i / CONSCIOUSNESS_LEVELS.length) % journeyOptions.length
        ];
      const format = formats[i % formats.length];

      themes.push({
        projectId: context.projectId,
        origin: input.mode,
        title: TEMPLATES[approach][level](pillar, niche),
        pillar,
        retinaType: retinaCycle[i % retinaCycle.length],
        consciousnessLevel: level,
        journeyStage,
        format,
        platforms: this.platformsForFormat(format, platforms),
        status: 'active',
        flags: [],
        sourceContext: input.sourceContext,
        batchId: input.batchId,
        angle: `${CONSCIOUSNESS_LABELS[level]} · ${JOURNEY_LABELS[journeyStage]}`,
        approach,
      });
    }
    return themes;
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
