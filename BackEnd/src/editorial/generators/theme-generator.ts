import {
  ContentFormat,
  Platform,
  RetinaType,
} from '../schemas/models/editorial-calendar.interface';
import {
  ICreateEditorialTheme,
  IEditorialTheme,
  RetinaPriority,
  ThemeOrigin,
} from '../schemas/models/editorial-theme.interface';

/** Contexto estratégico do projeto (derivado do Mapa da versão ativa). */
export interface IThemeGenerationContext {
  projectId: string;
  niche?: string;
  subniche?: string;
  /** Pilares do Mapa (títulos). */
  pillars: string[];
  mensagemCentral?: string;
}

/** Entrada normalizada — o service traduz o GenerationRequest para cá. */
export interface IThemeGenerationInput {
  mode: ThemeOrigin;
  count: number;
  batchId: string;
  pillars?: string[];
  platforms: Platform[];
  retinaPriority?: RetinaPriority;
  formats?: ContentFormat[];
  retinaTypes?: RetinaType[];
  sourceContext?: string;
  /** Contexto adicional dos modos Mercado / Objetivo. */
  videoLinks?: string[];
  comments?: string[];
  reviews?: string[];
  objective?: string;
  businessMoment?: string;
  /** Deslocamento do round-robin (evita títulos repetidos em generate-more). */
  offset?: number;
}

/**
 * Port de geração de temas. Hoje implementado por StubThemeGenerator
 * (determinístico); substituível por um adapter LLM via `useClass`.
 */
export abstract class ThemeGenerator {
  abstract generate(
    context: IThemeGenerationContext,
    input: IThemeGenerationInput,
  ): Promise<ICreateEditorialTheme[]>;

  abstract generateMoreThemes(
    context: IThemeGenerationContext,
    seedTheme: IEditorialTheme,
    count: number,
    batchId: string,
  ): Promise<ICreateEditorialTheme[]>;

  abstract rebalanceSlots(context: {
    slots: Record<string, unknown>[];
    themes: IEditorialTheme[];
    scenario: string;
  }): Promise<{
    updatedSlots: Record<string, unknown>[];
    allocatedPairs: { calendarItemId: string; theme: IEditorialTheme }[];
  }>;
}
