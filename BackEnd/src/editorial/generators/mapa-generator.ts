export interface IIcpExtractionInput {
  projectId: string;
  niche: string;
  subniche: string;
  rawText: string;
  fileName?: string;
}

export interface IAwarenessStageStrategy {
  level:
    | 'Inconsciente'
    | 'Consciente do Problema'
    | 'Consciente da Solução'
    | 'Consciente do Produto'
    | 'Totalmente Consciente';
  description: string;
  recommendedApproach: string;
}

export interface IIcpExtractionResult {
  profileSummary: string;
  vocabularyAndSlang: string;
  pains: string[];
  desires: string[];
  objections: string[];
  myths: string[];
  triggers: string[];
  awarenessStrategies: IAwarenessStageStrategy[];
}

export interface IStrategicMapaGenerationInput {
  projectId: string;
  niche: string;
  subniche: string;
  objective: string;
  strategicBase?: Record<string, unknown>;
}

export interface IStrategicMapaGenerationResult {
  positioningPhrase: string;
  mensagemCentral: string;
  pilares: { title: string; description: string }[];
  tomDeVoz: { traits: string[]; rules: string[] };
  retina: { label: string; weight: number }[];
  strategicBase: Record<string, unknown>;
}

/**
 * Port de geração e extração estratégica para Linha Editorial / Mapa / ICP.
 * Hoje implementado por StubMapaGenerator; substituível por adapter LLM via `useClass`.
 */
export abstract class MapaGenerator {
  abstract extractStructuredIcp(
    context: IIcpExtractionInput,
  ): Promise<IIcpExtractionResult>;

  abstract generateStrategicMapa(
    context: IStrategicMapaGenerationInput,
  ): Promise<IStrategicMapaGenerationResult>;
}
