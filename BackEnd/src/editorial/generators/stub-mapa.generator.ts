import { Injectable } from '@nestjs/common';
import {
  IAwarenessStageStrategy,
  IIcpExtractionInput,
  IIcpExtractionResult,
  IStrategicMapaGenerationInput,
  IStrategicMapaGenerationResult,
  MapaGenerator,
} from './mapa-generator';

const DEFAULT_AWARENESS_STRATEGIES: IAwarenessStageStrategy[] = [
  {
    level: 'Inconsciente',
    description:
      'Acha que seu problema é falta de alcance ou algoritmo, sem perceber a falta de direção estratégica.',
    recommendedApproach:
      'Conteúdos de diagnóstico e contraste que revelam por que agir no improviso drena autoridade.',
  },
  {
    level: 'Consciente do Problema',
    description:
      'Percebe que produz conteúdo sem retorno proporcional em vendas, mas não sabe estruturar o fluxo.',
    recommendedApproach:
      'Nomear a dor invisível e apresentar a Matriz RETINA como estrutura de equilíbrio.',
  },
  {
    level: 'Consciente da Solução',
    description:
      'Busca metodologia de linha editorial e calendário inteligente, comparando alternativas.',
    recommendedApproach:
      'Demonstrar o Mecanismo Único (MUV): Base Estratégica alimentando Linha, Calendário, Temas e Roteiros.',
  },
  {
    level: 'Consciente do Produto',
    description:
      'Já conhece a oferta, mas tem dúvidas sobre tempo de execução e aderência ao próprio caso.',
    recommendedApproach:
      'Quebra direta de objeções de rotina, bastidores práticos de uso e estudos de aplicação.',
  },
  {
    level: 'Totalmente Consciente',
    description:
      'Pronto para decidir; precisa apenas de clareza de condição, próximo passo e urgência legítima.',
    recommendedApproach:
      'Chamada direta para ação (CTA de conversão), resumo de entregáveis e garantia de direção.',
  },
];

@Injectable()
export class StubMapaGenerator extends MapaGenerator {
  async extractStructuredIcp(
    context: IIcpExtractionInput,
  ): Promise<IIcpExtractionResult> {
    // TODO(LLM): Substituir heurística local por chamada à LLM (ex.: OpenAI/Gemini structured output)
    // Prompt sugerido: "Analise o dossiê bruto de ICP do nicho {{niche}} ({{subniche}}) e extraia em JSON:
    // profileSummary, vocabularyAndSlang, pains[], desires[], objections[], myths[], triggers[] e awarenessStrategies[5]."
    // Input: { niche: context.niche, subniche: context.subniche, rawText: context.rawText, fileName: context.fileName }
    // Output esperado: IIcpExtractionResult

    const niche = context.niche || 'seu mercado';
    const subniche = context.subniche || niche;
    const rawText = context.rawText || '';

    const cleanLines = rawText
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').trim())
      .filter((line) => line.length > 18);

    const findMatchingLines = (
      keywords: string[],
      fallback: string[],
    ): string[] => {
      const matched: string[] = [];
      for (const line of cleanLines) {
        const lower = line.toLowerCase();
        if (
          keywords.some((kw) => lower.includes(kw)) &&
          !lower.endsWith(':') &&
          line.length <= 220
        ) {
          if (!matched.includes(line)) {
            matched.push(line);
          }
        }
        if (matched.length >= 6) break;
      }
      return matched.length >= 2 ? matched : fallback;
    };

    const pains = findMatchingLines(
      [
        'dor',
        'problema',
        'frustra',
        'improviso',
        'cansad',
        'exaust',
        'falta de',
        'não consegu',
        'dificuldade',
        'trav',
        'erro',
        'perde',
        'sofre',
      ],
      [
        `Improviso constante na comunicação de ${niche} sem conexão direta com a oferta principal.`,
        'Atração de seguidores curiosos que consomem conteúdo gratuito mas não avançam para compra.',
        'Falta de tempo na rotina para produzir conteúdos complexos sem direção estratégica.',
        'Textos e roteiros genéricos que não refletem a profundidade técnica do especialista.',
      ],
    );

    const desires = findMatchingLines(
      [
        'desej',
        'quer',
        'busca',
        'objetivo',
        'sonh',
        'ambiç',
        'previsibilidade',
        'reconhecid',
        'autoridade',
        'escalar',
        'vender',
        'liberdade',
        'clareza',
      ],
      [
        `Ser reconhecido como autoridade incontestável em ${subniche}.`,
        'Possuir uma operação editorial previsível que caiba na disponibilidade real da semana.',
        'Atrair compradores qualificados que já compreendem o valor da oferta antes do atendimento.',
      ],
    );

    const objections = findMatchingLines(
      [
        'objeç',
        'receio',
        'medo',
        'dúvida',
        'será que',
        'não tenho tempo',
        'caro',
        'preço',
        'já tentei',
        'específico',
        'rotina',
      ],
      [
        'Minha rotina é muito intensa; não consigo sustentar uma produção pesada de conteúdo.',
        `Meu mercado (${subniche}) é muito específico; fórmulas genéricas não funcionam nele.`,
        'Preciso ver aplicação prática imediata para justificar o investimento de tempo e capital.',
      ],
    );

    const myths = findMatchingLines(
      [
        'mito',
        'crença',
        'fracasso',
        'erradamente',
        'ilusão',
        'acha que',
        'tentou',
        'postar todo dia',
        'viral',
      ],
      [
        'Mito de que quantidade bruta de posts substitui posicionamento e linha editorial.',
        'Crença de que conteúdo denso e estratégico afasta o público comprador.',
        'Fracasso passado ao seguir calendários prontos que ignoravam a oferta e o MUV do negócio.',
      ],
    );

    const triggers = findMatchingLines(
      [
        'gatilho',
        'decisão',
        'compra quando',
        'confia',
        'prova',
        'método',
        'clareza',
        'segurança',
      ],
      [
        'Clareza metodológica que demonstra domínio real de causa e efeito.',
        'Planejamento adaptável à capacidade operacional real do especialista.',
        'Conexão transparente entre diagnóstico do problema, mecanismo único e oferta.',
      ],
    );

    const firstParagraph =
      cleanLines.find(
        (l) => l.length > 45 && !l.toUpperCase().startsWith('DOSSIÊ'),
      ) ||
      `Comprador qualificado de ${niche} (${subniche}) que valoriza direção estratégica, método comprovado e eficiência operacional acima de táticas superficiais.`;

    return {
      profileSummary: firstParagraph.slice(0, 320),
      vocabularyAndSlang:
        'Linguagem pragmática, orientada a resultado, eficiência, posicionamento de alto valor, previsibilidade e método aplicável.',
      pains,
      desires,
      objections,
      myths,
      triggers,
      awarenessStrategies: DEFAULT_AWARENESS_STRATEGIES,
    };
  }

  async generateStrategicMapa(
    context: IStrategicMapaGenerationInput,
  ): Promise<IStrategicMapaGenerationResult> {
    // TODO(LLM): Substituir síntese determinística por chamada à LLM que consolida os 6 blocos da Base Estratégica
    // em uma Frase de Posicionamento, Mensagem Central, Pilares ROMA, Regras de Tom de Voz e Distribuição RETINA.
    // Input: { niche: context.niche, subniche: context.subniche, objective: context.objective, strategicBase: context.strategicBase }
    // Output esperado: IStrategicMapaGenerationResult

    const base = context.strategicBase || {};
    const niche = String(base.niche || context.niche || 'Estratégia');
    const subniche = String(base.subniche || context.subniche || niche);
    const objective = String(context.objective || 'Conversão');

    const positioningPhrase =
      String(base.positioningStatement || '').trim() ||
      `Para profissionais e marcas de ${niche} (${subniche}) que buscam ${objective.toLowerCase()} com direção estratégica.`;

    const mensagemCentral =
      String(base.centralMessage || '').trim() ||
      String(base.mainPromise || '').trim() ||
      `Comunicação orientada para ${objective.toLowerCase()} em ${subniche}, conectando autoridade técnica e oferta principal.`;

    const rawPillars = Array.isArray(base.pillars) ? base.pillars : [];
    const pilares =
      rawPillars.length > 0
        ? rawPillars.map((p: any) => ({
            title: String(p.title || 'Pilar Estratégico'),
            description: String(p.objective || p.description || ''),
          }))
        : [
            {
              title: '01. Visão de Mundo & Quebra de Mitos do Mercado',
              description:
                'Desconstruir crenças erradas do ICP e posicionar a tese da marca.',
            },
            {
              title: '02. Diagnóstico dos Erros Invisíveis do ICP',
              description:
                'Elevar o nível de consciência mostrando a causa estrutural do gargalo.',
            },
            {
              title: '03. Mecanismo Único da Oferta (MUV em Ação)',
              description:
                'Explicar por que o método proprietário resolve onde o mercado falha.',
            },
            {
              title: '04. Educação Prática & Transformação Aplicável',
              description:
                'Entregar vitórias rápidas acionáveis que provam competência.',
            },
          ];

    const voiceTraits = Array.isArray(base.voiceTraits)
      ? base.voiceTraits.map(String)
      : ['Direto e sem rodeios', 'Autoridade prática baseada em método'];

    const voiceRules = [
      ...(base.voiceHowToOpenReasoning
        ? [`Abertura: ${String(base.voiceHowToOpenReasoning)}`]
        : []),
      ...(Array.isArray(base.voiceWhatToRepeat)
        ? base.voiceWhatToRepeat.map((r: any) => `Repetir: ${String(r)}`)
        : []),
      ...(Array.isArray(base.voiceWhatToAvoid)
        ? base.voiceWhatToAvoid.map((a: any) => `Evitar: ${String(a)}`)
        : []),
    ];

    const dist = (base.retinaDistribution as Record<string, number>) || {
      Relacionamento: 20,
      Engajamento: 10,
      Transformacao: 25,
      Interacao: 10,
      NiveisDeConsciencia: 20,
      Autoridade: 15,
    };

    const retina = [
      { label: 'Relacionamento', weight: Number(dist.Relacionamento ?? 20) },
      { label: 'Engajamento', weight: Number(dist.Engajamento ?? 10) },
      { label: 'Transformação', weight: Number(dist.Transformacao ?? 25) },
      { label: 'Interação', weight: Number(dist.Interacao ?? 10) },
      {
        label: 'Níveis de Consciência',
        weight: Number(dist.NiveisDeConsciencia ?? 20),
      },
      { label: 'Autoridade', weight: Number(dist.Autoridade ?? 15) },
    ];

    return {
      positioningPhrase,
      mensagemCentral,
      pilares,
      tomDeVoz: { traits: voiceTraits, rules: voiceRules },
      retina,
      strategicBase: base,
    };
  }
}
