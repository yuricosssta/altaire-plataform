// FrontEnd/src/components/editorial/workspace/TemasEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Globe,
  GripVertical,
  Layers,
  Lightbulb,
  Plus,
  Radar,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  FORMAT_META,
  RETINA_META,
  type CalendarSlotItem,
  type EditorialCalendarRecord,
  type RetinaTypeKey,
  type SlotContentFormat,
} from "./CalendarioEditorialModule";

/* ========================================================================== */
/* CONTRATOS E TIPAGENS ESTRITAS DA FUNÇÃO 02 (TEMAS E INTEGRAÇÃO)            */
/* ========================================================================== */

export interface TemasEditorialModuleProps {
  readonly projectId?: string;
  readonly projectName?: string;
  readonly projectNiche?: string;
  readonly projectSubniche?: string;
  readonly projectObjective?: string;
  readonly niche?: string;
  readonly subniche?: string;
  readonly currentObjective?: string;
  readonly currentPhase?: string;
  readonly hasActiveLine?: boolean;
  readonly hasActiveCalendar?: boolean;
  readonly initialSubTab?: "gerar" | "mapa" | "integracao";
  readonly initialGeneratorMode?:
    | "hub"
    | "roma_avatar"
    | "dados_mercado"
    | "objetivo_momento";
  readonly isStandalonePage?: boolean;
  readonly onGoToLineTab?: () => void;
  readonly onGoToCalendarTab?: () => void;
  readonly onGoToScriptsTab?: (
    slotId?: string,
    themeTitle?: string,
    formatKey?: string
  ) => void;
}

export type ThemeOriginMode =
  | "ROMA & Avatar"
  | "Dados de Mercado"
  | "Objetivo & Momento";

export type ConsciousnessAxis = "Sintoma" | "Solução" | "Objeção";

export type CustomerJourneyStage =
  | "Descoberta"
  | "Consideração"
  | "Conversão/Compra"
  | "Experiência do comprador"
  | "Experiência compartilhada";

export type ThemeLibraryStatus =
  | "active"
  | "favorite"
  | "priority_next_cycle"
  | "saved_for_sales"
  | "market_test"
  | "archived";

export interface StrategicThemeRecord {
  readonly id: string;
  readonly title: string;
  readonly origin: ThemeOriginMode;
  readonly techniqueUsed: string;
  readonly romaPillar: string;
  readonly retinaType: RetinaTypeKey;
  readonly consciousnessAxis: ConsciousnessAxis;
  readonly journeyStage: CustomerJourneyStage;
  readonly recommendedFormat: SlotContentFormat;
  readonly recommendedPlatform: string;
  readonly painDesireOrObjection: string;
  readonly status: ThemeLibraryStatus;
  readonly isFavorite: boolean;
  readonly isPriorityNextCycle: boolean;
  readonly isSavedForSales: boolean;
  readonly isMarketTest: boolean;
  readonly allocatedSlotIds: readonly string[];
  readonly createdAt: string;
}

export interface SavedCalendarThemeVersion {
  readonly id: string;
  readonly versionName: string;
  readonly periodLabel: string;
  readonly objectiveUsed: string;
  readonly businessMomentUsed: string;
  readonly savedAt: string;
  readonly allocatedCount: number;
  readonly slotsSnapshot: readonly CalendarSlotItem[];
}

/* ========================================================================== */
/* CONSTANTES CANÔNICAS DO DOCUMENTO DA FUNÇÃO 02                             */
/* ========================================================================== */

const DEFAULT_ROMA_PILLARS: readonly string[] = [
  "01. Visão de Mundo & Quebra de Mitos do Mercado",
  "02. Diagnóstico dos Erros Invisíveis do ICP",
  "03. Mecanismo Único da Oferta (MUV em Ação)",
  "04. Educação Prática & Transformação Aplicável",
  "05. Bastidores da Execução & Provas Reais",
  "06. Superação de Objeções & Condução para Oferta",
];

const CONSCIOUSNESS_AXES: readonly {
  readonly value: ConsciousnessAxis;
  readonly label: string;
  readonly hint: string;
  readonly badgeClass: string;
}[] = [
  {
    value: "Sintoma",
    label: "Eixo 1 · Sintoma",
    hint: "Foca no que o público sente no dia a dia antes de diagnosticar a causa.",
    badgeClass: "border-sky-400/45 bg-sky-500/15 text-sky-200",
  },
  {
    value: "Solução",
    label: "Eixo 2 · Solução",
    hint: "Desmistifica o caminho metodológico para resolver o problema.",
    badgeClass: "border-la-gold/60 bg-la-gold/20 text-la-gold-light",
  },
  {
    value: "Objeção",
    label: "Eixo 3 · Objeção",
    hint: "Ataca as desculpas e travas mentais que impedem a ação ou compra.",
    badgeClass: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  },
];

const JOURNEY_STAGES: readonly CustomerJourneyStage[] = [
  "Descoberta",
  "Consideração",
  "Conversão/Compra",
  "Experiência do comprador",
  "Experiência compartilhada",
];

const MODE_3_OBJECTIVES: readonly string[] = [
  "Crescer audiência (atrair novos seguidores)",
  "Aumentar engajamento (comentários, salvamentos, compartilhamentos)",
  "Aumentar Relacionamento e Interação",
  "Aquecer público para vendas",
  "Vender produto principal (lançamento)",
  "Vender produto principal (perpétuo)",
  "Nutrir base de clientes atuais (pós-venda)",
  "Fortalecer autoridade e prova social",
];

const MODE_3_BUSINESS_MOMENTS: readonly string[] = [
  "Construindo audiência (pré-campanhas)",
  "Gerando autoridade e relacionamento",
  "Pré-venda (aquecimento)",
  "Carrinho aberto (campanha de vendas)",
  "Pós-vendas (nutrição de compradores)",
  "Manutenção orgânica (sem campanha específica)",
];

const MODE_3_PLATFORMS: readonly string[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "E-mail",
  "Telegram",
  "WhatsApp",
  "Blog/Site",
];

const STATUS_BADGE_MAP: Record<
  ThemeLibraryStatus,
  { readonly label: string; readonly className: string }
> = {
  active: {
    label: "Ativo na Biblioteca",
    className: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
  },
  favorite: {
    label: "Favorito ★",
    className: "border-la-gold bg-la-gold/20 text-la-gold-light",
  },
  priority_next_cycle: {
    label: "Prioritário p/ Próximo Ciclo",
    className: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  },
  saved_for_sales: {
    label: "Guardado para Vendas",
    className: "border-rose-400/50 bg-rose-500/15 text-rose-200",
  },
  market_test: {
    label: "Teste de Mercado",
    className: "border-purple-400/50 bg-purple-500/15 text-purple-200",
  },
  archived: {
    label: "Arquivado",
    className: "border-white/10 bg-black/50 text-la-text-muted",
  },
};

/* ========================================================================== */
/* GERADOR INICIAL DE REPERTÓRIO CANÔNICO DA BIBLIOTECA                       */
/* ========================================================================== */

function createInitialThemeLibrary(
  niche: string,
  subniche: string
): StrategicThemeRecord[] {
  const n = niche || "Finanças";
  const sub = subniche || "Algorithmic Trading";

  return [
    {
      id: "thm-init-01",
      title: `Por que repetir o padrão tradicional de ${n} drena sua margem mesmo trabalhando mais`,
      origin: "ROMA & Avatar",
      techniqueUsed: "Técnica 3 · Quebra de Mito para chegar à ROMA",
      romaPillar: DEFAULT_ROMA_PILLARS[0],
      retinaType: "Engajamento",
      consciousnessAxis: "Sintoma",
      journeyStage: "Descoberta",
      recommendedFormat: "reel_curto",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Mito de que esforço bruto sem sistema gera previsibilidade.",
      status: "priority_next_cycle",
      isFavorite: true,
      isPriorityNextCycle: true,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: ["slot-w1-d2-1"],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-02",
      title: `Como diagnosticar gargalos operacionais em ${sub} em 15 minutos usando 4 critérios`,
      origin: "ROMA & Avatar",
      techniqueUsed: "Técnica 1 · Subárea Estrutural da ROMA",
      romaPillar: DEFAULT_ROMA_PILLARS[3],
      retinaType: "Transformacao",
      consciousnessAxis: "Solução",
      journeyStage: "Consideração",
      recommendedFormat: "carrossel",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Desejo de possuir um protocolo prático que caiba na rotina real.",
      status: "favorite",
      isFavorite: true,
      isPriorityNextCycle: true,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: ["slot-w1-d2-2"],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-03",
      title: `A parte que ninguém te explicou sobre gestão de risco em ${sub} quando você tem pouco tempo`,
      origin: "Dados de Mercado",
      techniqueUsed: "Técnica 7 · Engenharia Reversa de Comentários ('Mas e se...?')",
      romaPillar: DEFAULT_ROMA_PILLARS[1],
      retinaType: "Transformacao",
      consciousnessAxis: "Solução",
      journeyStage: "Consideração",
      recommendedFormat: "video_longo",
      recommendedPlatform: "YouTube",
      painDesireOrObjection:
        "Atrito invisível mapeado nos comentários dos vídeos mais vistos do nicho.",
      status: "active",
      isFavorite: false,
      isPriorityNextCycle: true,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: ["slot-w1-d4-1"],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-04",
      title: `Quando a regra de "diversificar tudo" em ${n} te sabota em vez de te proteger`,
      origin: "Dados de Mercado",
      techniqueUsed: "Técnica 10 · Desconstrução de Estereótipos (Anti-Clichê)",
      romaPillar: DEFAULT_ROMA_PILLARS[0],
      retinaType: "Engajamento",
      consciousnessAxis: "Sintoma",
      journeyStage: "Descoberta",
      recommendedFormat: "reel_curto",
      recommendedPlatform: "TikTok",
      painDesireOrObjection:
        "Quebra de dogma repetido pelo mercado que atrai atenção imediata.",
      status: "market_test",
      isFavorite: false,
      isPriorityNextCycle: false,
      isSavedForSales: false,
      isMarketTest: true,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-05",
      title: `"Não tenho tempo para acompanhar ${sub} o dia inteiro" — O protocolo de 45 minutos semanais`,
      origin: "Objetivo & Momento",
      techniqueUsed: "Técnica 3 · Árvore de Objeções Críticas",
      romaPillar: DEFAULT_ROMA_PILLARS[5],
      retinaType: "NiveisDeConsciencia",
      consciousnessAxis: "Objeção",
      journeyStage: "Conversão/Compra",
      recommendedFormat: "reel_curto",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Objeção principal de falta de tempo na rotina do comprador.",
      status: "saved_for_sales",
      isFavorite: true,
      isPriorityNextCycle: true,
      isSavedForSales: true,
      isMarketTest: false,
      allocatedSlotIds: ["slot-w1-d5-1"],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-06",
      title: `Estudo de Caso Real: Como estruturamos a tomada de decisão em ${sub} sem depender de improviso`,
      origin: "ROMA & Avatar",
      techniqueUsed: "Técnica 5 · Estudo de Caso que Remove Objeção",
      romaPillar: DEFAULT_ROMA_PILLARS[4],
      retinaType: "Autoridade",
      consciousnessAxis: "Objeção",
      journeyStage: "Conversão/Compra",
      recommendedFormat: "carrossel",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Prova prática de aplicação do Mecanismo Único da Oferta (MUV).",
      status: "saved_for_sales",
      isFavorite: true,
      isPriorityNextCycle: true,
      isSavedForSales: true,
      isMarketTest: false,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-07",
      title: `Onde clicar exatamente para validar sua configuração de ${sub} antes de alocar capital`,
      origin: "Dados de Mercado",
      techniqueUsed: "Técnica 12 · Mapeamento de Ilhas de Competência",
      romaPillar: DEFAULT_ROMA_PILLARS[3],
      retinaType: "Transformacao",
      consciousnessAxis: "Solução",
      journeyStage: "Consideração",
      recommendedFormat: "carrossel",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Resolver o detalhe técnico ultra-específico onde o público trava.",
      status: "active",
      isFavorite: false,
      isPriorityNextCycle: false,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-08",
      title: `3 princípios inegociáveis que separam operadores profissionais de amadores em ${n}`,
      origin: "ROMA & Avatar",
      techniqueUsed: "Técnica 2 · Identificação de Valores & Visão de Mundo",
      romaPillar: DEFAULT_ROMA_PILLARS[0],
      retinaType: "Relacionamento",
      consciousnessAxis: "Sintoma",
      journeyStage: "Descoberta",
      recommendedFormat: "post_estatico",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Conexão por visão de mundo e qualificação de audiência madura.",
      status: "active",
      isFavorite: false,
      isPriorityNextCycle: false,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-09",
      title: `Diagnóstico Interativo: Qual dessas 3 travas mais impede sua escala em ${sub} hoje?`,
      origin: "Objetivo & Momento",
      techniqueUsed: "Técnica 6 · Lacuna de Atrito (Friction Gap)",
      romaPillar: DEFAULT_ROMA_PILLARS[1],
      retinaType: "Interacao",
      consciousnessAxis: "Sintoma",
      journeyStage: "Consideração",
      recommendedFormat: "post_estatico",
      recommendedPlatform: "Instagram",
      painDesireOrObjection:
        "Levantamento de dores ativas para abordagem no Direct.",
      status: "active",
      isFavorite: false,
      isPriorityNextCycle: true,
      isSavedForSales: false,
      isMarketTest: false,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
    {
      id: "thm-init-10",
      title: `Consultoria Ao Vivo: Destravando o plano de ação de ${sub} para os próximos 30 dias`,
      origin: "Objetivo & Momento",
      techniqueUsed: "Técnica 4 · Atalhos e Oportunidades para a ROMA",
      romaPillar: DEFAULT_ROMA_PILLARS[5],
      retinaType: "Autoridade",
      consciousnessAxis: "Objeção",
      journeyStage: "Conversão/Compra",
      recommendedFormat: "live_semanal",
      recommendedPlatform: "YouTube",
      painDesireOrObjection:
        "Quebra de objeções ao vivo com demonstração do método.",
      status: "saved_for_sales",
      isFavorite: true,
      isPriorityNextCycle: true,
      isSavedForSales: true,
      isMarketTest: false,
      allocatedSlotIds: [],
      createdAt: "Sincronizado",
    },
  ];
}

/* ========================================================================== */
/* GERADOR DE LOTES DE TEMAS POR MODO (10 A 15+ TEMAS PARA CURADORIA)         */
/* ========================================================================== */

function generateBatchForMode(params: {
  readonly mode: ThemeOriginMode;
  readonly niche: string;
  readonly subniche: string;
  readonly count: number;
  readonly selectedPillars: readonly string[];
  readonly retinaFocus: "all" | RetinaTypeKey;
  readonly marketLinks?: string;
  readonly marketComments?: string;
  readonly marketReviews?: string;
  readonly cycleObjective?: string;
  readonly businessMoment?: string;
  readonly platforms?: readonly string[];
}): StrategicThemeRecord[] {
  const {
    mode,
    niche,
    subniche,
    count,
    selectedPillars,
    retinaFocus,
    marketComments,
    marketReviews,
    cycleObjective,
    businessMoment,
    platforms,
  } = params;

  const pillarsToUse =
    selectedPillars.length > 0 ? selectedPillars : DEFAULT_ROMA_PILLARS;
  const targetPlatforms =
    platforms && platforms.length > 0 ? platforms : ["Instagram", "YouTube", "TikTok"];

  const templatesRoma: readonly {
    readonly titleFn: (p: string) => string;
    readonly technique: string;
    readonly retina: RetinaTypeKey;
    readonly axis: ConsciousnessAxis;
    readonly journey: CustomerJourneyStage;
    readonly format: SlotContentFormat;
    readonly pain: string;
  }[] = [
    {
      titleFn: () =>
        `O erro invisível que impede seu avanço em ${subniche} mesmo dedicando horas toda semana`,
      technique: "Técnica 1 · Subárea 1 da ROMA (Diagnóstico Raiz)",
      retina: "Engajamento",
      axis: "Sintoma",
      journey: "Descoberta",
      format: "reel_curto",
      pain: "Frustração de trabalhar muito na operação sem ver retorno proporcional.",
    },
    {
      titleFn: () =>
        `Os 4 pilares práticos para sair do improviso em ${niche} e construir previsibilidade`,
      technique: "Técnica 1 · Subárea 2 da ROMA (Estrutura e Método)",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: "Desejo de ter um passo a passo claro e replicável.",
    },
    {
      titleFn: () =>
        `O mito número 1 sobre ${subniche} que faz profissionais maduros perderem tempo e margem`,
      technique: "Técnica 3 · Mitos que bloqueiam a chegada na ROMA",
      retina: "NiveisDeConsciencia",
      axis: "Objeção",
      journey: "Consideração",
      format: "reel_curto",
      pain: "Crença equivocada instalada por conselhos genéricos do mercado.",
    },
    {
      titleFn: () =>
        `Atalho estratégico: Como reduzir em 50% o tempo de análise em ${subniche} com um checklist`,
      technique: "Técnica 4 · 10 Atalhos e Oportunidades para a ROMA",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: "Falta de tempo operacional na rotina intensa do ICP.",
    },
    {
      titleFn: () =>
        `Bastidor Real: Como um especialista em ${niche} superou a trava de tempo e validou o método`,
      technique: "Técnica 5 · Estudo de Caso que Remove Objeção",
      retina: "Autoridade",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "video_longo",
      pain: "Objeção: 'Será que funciona para alguém com a rotina corrida como a minha?'",
    },
    {
      titleFn: () =>
        `Por que decidimos construir ${subniche} com foco em fundamento técnico e não em modismos`,
      technique: "Técnica 2 · Avatar (Sonhos, Valores e Visão de Mundo)",
      retina: "Relacionamento",
      axis: "Sintoma",
      journey: "Descoberta",
      format: "post_estatico",
      pain: "Desejo de se conectar com referências sérias e íntegras.",
    },
    {
      titleFn: () =>
        `Como preparar sua estrutura de ${subniche} hoje para não travar no próximo ciclo de escala`,
      technique: "Técnica 2 · Avatar (Vencer Dores & Chegar aos Desejos)",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "video_longo",
      pain: "Medo de crescer de forma desorganizada e perder qualidade.",
    },
    {
      titleFn: () =>
        `"Já tentei organizar ${subniche} antes e parei na metade" — O que faltou na sua fundação`,
      technique: "Técnica 3 · Árvore de Objeções Principal e Secundária",
      retina: "NiveisDeConsciencia",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "reel_curto",
      pain: "Fracasso passado com ferramentas ou cursos desconectados do contexto.",
    },
    {
      titleFn: () =>
        `Enquete de Diagnóstico: Em qual destas 3 fases da jornada de ${niche} você está travado?`,
      technique: "Técnica 6 · Análise de Lacunas de Atrito (Friction Gap)",
      retina: "Interacao",
      axis: "Sintoma",
      journey: "Consideração",
      format: "post_estatico",
      pain: "Falta de clareza sobre qual é a prioridade número 1 do momento.",
    },
    {
      titleFn: () =>
        `Sequência Diária de Bastidores: 4 tomadas de decisão reais na nossa operação de ${subniche}`,
      technique: "Técnica 5 · Prova Prática Cotidiana",
      retina: "Relacionamento",
      axis: "Solução",
      journey: "Experiência compartilhada",
      format: "sequencia_stories",
      pain: "Desejo de ver o método funcionando na prática em tempo real.",
    },
  ];

  const customCommentSnippet = marketComments?.trim()
    ? marketComments.trim().split(/\r?\n/)[0]?.slice(0, 65)
    : `trabalhar com rotina intensa sem tempo para planilhas complexas`;

  const customReviewSnippet = marketReviews?.trim()
    ? marketReviews.trim().split(/\r?\n/)[0]?.slice(0, 65)
    : `explicar como aplicar na prática sem precisar de equipe grande`;

  const templatesMercado: typeof templatesRoma = [
    {
      titleFn: () =>
        `A parte que ninguém te explicou sobre ${subniche} quando você precisa conciliar com ${customCommentSnippet}`,
      technique: "Técnica 7 · Engenharia Reversa de Comentários ('Mas e se...?')",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "reel_curto",
      pain: `Dúvida real extraída de comentários: "${customCommentSnippet}"`,
    },
    {
      titleFn: () =>
        `Quando seguir a "regra de ouro" de ${niche} sabota seu resultado em vez de ajudar`,
      technique: "Técnica 10 · Desconstrução de Estereótipos (Anti-Clichê)",
      retina: "Engajamento",
      axis: "Sintoma",
      journey: "Descoberta",
      format: "reel_curto",
      pain: "Cansaço de ver os mesmos conselhos superficiais repetidos no feed.",
    },
    {
      titleFn: () =>
        `Como resolver ${customReviewSnippet} em ${subniche} direto pelo celular em 3 passos`,
      technique: "Técnica 11 · Engenharia Reversa de Reviews (1★ e 5★ Amazon/Hotmart)",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: `Frustração recorrente mapeada em reviews: "${customReviewSnippet}"`,
    },
    {
      titleFn: () =>
        `Onde clicar exatamente para configurar seu controle de ${subniche} sem rasgar orçamento`,
      technique: "Técnica 12 · Mapeamento de Ilhas de Competência (Ultra-específico)",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: "O mercado ensina a teoria geral ('continente'), mas o cliente trava no botão ('ilha').",
    },
    {
      titleFn: () =>
        `Como executar ${subniche} mesmo em semana de plantão, viagem ou agenda lotada`,
      technique: "Técnica 9 · Termos Periféricos Invisíveis da Rotina do ICP",
      retina: "Relacionamento",
      axis: "Sintoma",
      journey: "Descoberta",
      format: "reel_curto",
      pain: "Conectar o tema técnico ao contexto real de vida do comprador.",
    },
    {
      titleFn: () =>
        `O erro estratégico de grandes operações do mercado e o que isso ensina para seu negócio de ${niche}`,
      technique: "Técnica 13 · Cruzamento de Interesses Analógicos & Cultura Pop",
      retina: "Engajamento",
      axis: "Sintoma",
      journey: "Descoberta",
      format: "carrossel",
      pain: "Furar a bolha do algoritmo usando metáfora universal de alto interesse.",
    },
    {
      titleFn: () =>
        `O micro-atrito invisível no primeiro passo de ${subniche} (e como destravar hoje)`,
      technique: "Técnica 6 · Análise de Lacunas de Atrito (Friction Gap)",
      retina: "NiveisDeConsciencia",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "video_longo",
      pain: "Resolver a trava inicial que impede o lead de dar o primeiro passo.",
    },
  ];

  const templatesObjetivo: typeof templatesRoma = [
    {
      titleFn: () =>
        `Plano de Ação para ${businessMoment || "esta fase"}: Os 3 movimentos prioritários em ${subniche}`,
      technique: `Alinhamento Direto · ${cycleObjective || "Objetivo do Período"}`,
      retina: "Autoridade",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: `Direcionar a atenção da audiência para ${cycleObjective || "a meta atual"}.`,
    },
    {
      titleFn: () =>
        `Por que adiar sua decisão em ${subniche} durante ${businessMoment || "este ciclo"} custa o dobro depois`,
      technique: "Prioridade de Ciclo · Quebra de Objeção Imediata",
      retina: "NiveisDeConsciencia",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "reel_curto",
      pain: "Urgência legítima conectada ao momento atual da operação.",
    },
    {
      titleFn: () =>
        `Por dentro do Mecanismo Único: Como entregamos resultado em ${niche} passo a passo`,
      technique: "Prioridade de Ciclo · Demonstração de Oferta & MUV",
      retina: "Autoridade",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "video_longo",
      pain: "Tangibilizar os entregáveis da oferta principal para leads conscientes.",
    },
    {
      titleFn: () =>
        `Perguntas & Respostas de Aquecimento: Respondendo as 5 maiores dúvidas sobre ${subniche}`,
      technique: "Prioridade de Ciclo · Levantamento de Demanda Qualificada",
      retina: "Interacao",
      axis: "Objeção",
      journey: "Conversão/Compra",
      format: "live_semanal",
      pain: "Remover dúvidas finais antes da abertura ou fechamento de campanha.",
    },
    {
      titleFn: () =>
        `Checklist Prático: Você cumpre os pré-requisitos para escalar em ${subniche}?`,
      technique: "Prioridade de Ciclo · Qualificação de Compradores",
      retina: "Transformacao",
      axis: "Solução",
      journey: "Consideração",
      format: "carrossel",
      pain: "Elevar consciência da solução e filtrar leads prontos.",
    },
  ];

  const basePool =
    mode === "ROMA & Avatar"
      ? templatesRoma
      : mode === "Dados de Mercado"
        ? templatesMercado
        : templatesObjetivo;

  const generated: StrategicThemeRecord[] = [];

  for (let i = 0; i < count; i++) {
    const tpl = basePool[i % basePool.length]!;
    const pillar = pillarsToUse[i % pillarsToUse.length]!;
    const platform = targetPlatforms[i % targetPlatforms.length]!;
    const chosenRetina =
      retinaFocus !== "all" ? retinaFocus : tpl.retina;
    const cycleSuffix =
      i >= basePool.length ? ` (Ângulo #${Math.floor(i / basePool.length) + 1})` : "";

    generated.push({
      id: `thm-batch-${Date.now()}-${i}`,
      title: `${tpl.titleFn(pillar)}${cycleSuffix}`,
      origin: mode,
      techniqueUsed: tpl.technique,
      romaPillar: pillar,
      retinaType: chosenRetina,
      consciousnessAxis: tpl.axis,
      journeyStage: tpl.journey,
      recommendedFormat: tpl.format,
      recommendedPlatform: platform,
      painDesireOrObjection: tpl.pain,
      status: mode === "Dados de Mercado" && i % 3 === 0 ? "market_test" : "active",
      isFavorite: i < 3,
      isPriorityNextCycle: mode === "Objetivo & Momento" || i < 4,
      isSavedForSales: chosenRetina === "NiveisDeConsciencia" || chosenRetina === "Autoridade",
      isMarketTest: mode === "Dados de Mercado" && i % 3 === 0,
      allocatedSlotIds: [],
      createdAt: "Gerado neste lote",
    });
  }

  return generated;
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: TemasEditorialModule                                 */
/* ========================================================================== */

export function TemasEditorialModule(props: TemasEditorialModuleProps) {
  const resolvedProjectId = props.projectId || "proj-default";
  const projectName = props.projectName || "Produto X — Lançamento Semente";
  const resolvedNiche =
    props.projectNiche || props.niche || "Finanças & Investimentos";
  const resolvedSubniche =
    props.projectSubniche || props.subniche || "Algorithmic Trading";
  const resolvedObjective =
    props.projectObjective || props.currentObjective || "Conversão";
  const resolvedPhase =
    props.currentPhase || "Aquecimento — Semana 2 de 4";
  const hasActiveLine = props.hasActiveLine ?? true;
  const hasActiveCalendar = props.hasActiveCalendar ?? true;

  const themesStorageKey = `la-temas-editorial-v2-${resolvedProjectId}`;
  const calendarStorageKey = `la-calendario-editorial-v2-${resolvedProjectId}`;
  const versionsStorageKey = `la-calendario-temas-versions-${resolvedProjectId}`;

  /* Subáreas oficiais da Função 02:
     - "gerar": Subárea 1 (Motor de Geração nos 3 Modos Oficiais + Estúdio de Curadoria em Lote)
     - "mapa": Subárea 2 (Mapa Estratégico de Temas / Biblioteca Completa Filtrável)
     - "integracao": Subárea 3 (Mesa Split-Screen de Integração no Calendário + Reequilíbrio) */
  const [activeSubTab, setActiveSubTab] = useState<
    "gerar" | "mapa" | "integracao"
  >(props.initialSubTab || "gerar");

  /* Qual modo de geração está aberto dentro da Subárea 1 ("hub" mostra os 3 cards principais) */
  const [generatorMode, setGeneratorMode] = useState<
    "hub" | "roma_avatar" | "dados_mercado" | "objetivo_momento"
  >(props.initialGeneratorMode || "hub");

  /* Biblioteca Oficial de Temas Aprovados do Projeto */
  const [themesLibrary, setThemesLibrary] = useState<
    readonly StrategicThemeRecord[]
  >(() => createInitialThemeLibrary(resolvedNiche, resolvedSubniche));

  /* Lote em Revisão Humana (Gerado nos Modos 1, 2 ou 3 ANTES de entrar no Mapa de Temas!) */
  const [stagedBatch, setStagedBatch] = useState<
    readonly StrategicThemeRecord[]
  >([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<readonly string[]>(
    []
  );
  const [isGeneratingBatch, setIsGeneratingBatch] = useState<boolean>(false);
  const [batchFeedbackBanner, setBatchFeedbackBanner] = useState<string | null>(
    null
  );

  /* Parâmetros do Modo 1 — ROMA & Avatar (Seção 3.2.3) */
  const [mode1Volume, setMode1Volume] = useState<number>(15);
  const [mode1SelectedPillars, setMode1SelectedPillars] = useState<
    readonly string[]
  >([]); // vazio = Todos os pilares (recomendado)
  const [mode1RetinaPriority, setMode1RetinaPriority] = useState<
    "all" | RetinaTypeKey
  >("all");

  /* Parâmetros do Modo 2 — Dados de Mercado Wizard (Seção 3.3.2) */
  const [mode2Step, setMode2Step] = useState<1 | 2 | 3>(1);
  const [mode2VideoLinks, setMode2VideoLinks] = useState<string>(
    "https://youtube.com/watch?v=video-mais-visto-nicho-01\nhttps://instagram.com/reel/post-alta-interacao-02"
  );
  const [mode2CommentsAndTerms, setMode2CommentsAndTerms] = useState<string>(
    'Comentário recorrente: "Mas e se eu tiver pouco tempo na rotina para acompanhar o mercado?"\nTermo periférico: "plantão", "rotina corrida", "organizar pelo celular"'
  );
  const [mode2ReviewsAndFeedbacks, setMode2ReviewsAndFeedbacks] =
    useState<string>(
      'Review 1 estrela: "O método é bom, mas as planilhas são complexas demais para usar no dia a dia."\nReview 5 estrelas: "A virada de chave foi ter um checklist simples de 15 minutos."'
    );
  const [mode2Volume, setMode2Volume] = useState<number>(12);

  /* Parâmetros do Modo 3 — Objetivo & Momento do Negócio (Seção 3.4.1) */
  const [mode3Objective, setMode3Objective] = useState<string>(
    MODE_3_OBJECTIVES[3]
  );
  const [mode3Moment, setMode3Moment] = useState<string>(
    MODE_3_BUSINESS_MOMENTS[2]
  );
  const [mode3Platforms, setMode3Platforms] = useState<readonly string[]>([
    "Instagram",
    "YouTube",
    "TikTok",
  ]);
  const [mode3Volume, setMode3Volume] = useState<number>(12);

  /* Filtros da Subárea 2 — Mapa Estratégico de Temas (Seção 4.1) */
  const [mapSearch, setMapSearch] = useState<string>("");
  const [mapOriginFilter, setMapOriginFilter] = useState<
    "all" | ThemeOriginMode
  >("all");
  const [mapPillarFilter, setMapPillarFilter] = useState<string>("all");
  const [mapRetinaFilter, setMapRetinaFilter] = useState<
    "all" | RetinaTypeKey
  >("all");
  const [mapAxisFilter, setMapAxisFilter] = useState<
    "all" | ConsciousnessAxis
  >("all");
  const [mapJourneyFilter, setMapJourneyFilter] = useState<
    "all" | CustomerJourneyStage
  >("all");
  const [mapFormatFilter, setMapFormatFilter] = useState<
    "all" | SlotContentFormat
  >("all");
  const [mapQuickFlagFilter, setMapQuickFlagFilter] = useState<
    | "all"
    | "favorites"
    | "priority"
    | "sales"
    | "market_test"
    | "unallocated"
  >("all");

  /* Estados da Subárea 3 — Integração com Calendário Editorial (Seção 5.1 e 5.2) */
  const [calendarsFromF01, setCalendarsFromF01] = useState<
    readonly EditorialCalendarRecord[]
  >([]);
  const [selectedCalendarId, setSelectedCalendarId] =
    useState<string>("cal-nov-2026");
  const [integrationPeriodFilter, setIntegrationPeriodFilter] = useState<
    "all" | 1 | 2 | 3 | 4 | "empty_only"
  >("all");
  const [activeSlotIdForAllocation, setActiveSlotIdForAllocation] = useState<
    string | null
  >(null);
  const [draggedThemeId, setDraggedThemeId] = useState<string | null>(null);
  const [libraryFilterInIntegration, setLibraryFilterInIntegration] =
    useState<string>("");
  const [onlyCompatibleWithSelectedSlot, setOnlyCompatibleWithSelectedSlot] =
    useState<boolean>(false);
  const [suggestionOffsetBySlot, setSuggestionOffsetBySlot] = useState<
    Record<string, number>
  >({});
  const [simulationScenario, setSimulationScenario] = useState<
    "none" | "more_transformation" | "sales_push" | "top_of_funnel"
  >("none");
  const [savedCalendarVersions, setSavedCalendarVersions] = useState<
    readonly SavedCalendarThemeVersion[]
  >([]);
  const [isSaveVersionModalOpen, setIsSaveVersionModalOpen] =
    useState<boolean>(false);
  const [newVersionTitle, setNewVersionTitle] = useState<string>(
    "Calendário – Versão A (Pré-lançamento)"
  );
  const [integrationBanner, setIntegrationBanner] = useState<string | null>(
    null
  );

  /* Sincroniza Biblioteca de Temas e Calendário da Função 01 via localStorage */
  useEffect(() => {
    try {
      const savedThemes = window.localStorage.getItem(themesStorageKey);
      if (savedThemes) {
        const parsed = JSON.parse(savedThemes) as StrategicThemeRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThemesLibrary(parsed);
        }
      }

      const savedCals = window.localStorage.getItem(calendarStorageKey);
      if (savedCals) {
        const parsedCals = JSON.parse(savedCals) as EditorialCalendarRecord[];
        if (Array.isArray(parsedCals) && parsedCals.length > 0) {
          setCalendarsFromF01(parsedCals);
          setSelectedCalendarId(parsedCals[0]?.id || "cal-nov-2026");
        }
      }

      const savedVers = window.localStorage.getItem(versionsStorageKey);
      if (savedVers) {
        const parsedVers = JSON.parse(
          savedVers
        ) as SavedCalendarThemeVersion[];
        if (Array.isArray(parsedVers)) {
          setSavedCalendarVersions(parsedVers);
        }
      }
    } catch {
      /* Ignora bloqueio de storage */
    }
  }, [themesStorageKey, calendarStorageKey, versionsStorageKey]);

  const persistThemesLibrary = useCallback(
    (nextThemes: readonly StrategicThemeRecord[]) => {
      setThemesLibrary(nextThemes);
      try {
        window.localStorage.setItem(
          themesStorageKey,
          JSON.stringify(nextThemes)
        );
      } catch {
        /* Ignora erro */
      }
    },
    [themesStorageKey]
  );

  const persistCalendarsToF01 = useCallback(
    (nextCalendars: readonly EditorialCalendarRecord[]) => {
      setCalendarsFromF01(nextCalendars);
      try {
        window.localStorage.setItem(
          calendarStorageKey,
          JSON.stringify(nextCalendars)
        );
      } catch {
        /* Ignora erro */
      }
    },
    [calendarStorageKey]
  );

  /* Fallback caso o usuário ainda não tenha aberto a aba Calendário na sessão */
  const activeCalendarRecord = useMemo((): EditorialCalendarRecord => {
    const found =
      calendarsFromF01.find((c) => c.id === selectedCalendarId) ??
      calendarsFromF01[0];
    if (found) return found;

    const fallbackSlots: CalendarSlotItem[] = [
      {
        id: "slot-w1-d2-1",
        dateISO: "2026-11-02",
        dayNumber: 2,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 0,
        dayOfWeekLabel: "Segunda-feira",
        provisionalTitle: `Mito #1 que trava resultados em ${resolvedSubniche}`,
        format: "reel_curto",
        retinaType: "Engajamento",
        platforms: ["Instagram", "TikTok"],
        suggestedTime: "12:00",
        strategicObjective: "Atrair audiência qualificada quebrando uma crença comum",
        secondaryObjective: "Alcance qualificado",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[0],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Mito do volume sem direção",
        icpAwarenessLevel: "Consciente do Problema",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      },
      {
        id: "slot-w1-d2-2",
        dateISO: "2026-11-02",
        dayNumber: 2,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 0,
        dayOfWeekLabel: "Segunda-feira",
        provisionalTitle: `Passo a passo estrutural em ${resolvedSubniche}`,
        format: "carrossel",
        retinaType: "Transformacao",
        platforms: ["Instagram", "LinkedIn"],
        suggestedTime: "19:00",
        strategicObjective: "Gerar salvamentos qualificados e provar competência",
        secondaryObjective: "Educar sobre o MUV",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[3],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Desejo de método prático",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Checklist PDF",
      },
      {
        id: "slot-w1-d3-1",
        dateISO: "2026-11-03",
        dayNumber: 3,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 1,
        dayOfWeekLabel: "Terça-feira",
        provisionalTitle: `Ajuste prático para destravar ${resolvedSubniche}`,
        format: "reel_curto",
        retinaType: "Transformacao",
        platforms: ["Instagram"],
        suggestedTime: "12:30",
        strategicObjective: "Vitória rápida acionável",
        secondaryObjective: "Salvamentos",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[3],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Falta de tempo operacional",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      },
      {
        id: "slot-w1-d4-1",
        dateISO: "2026-11-04",
        dayNumber: 4,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 2,
        dayOfWeekLabel: "Quarta-feira",
        provisionalTitle: `Aula Profunda: Engenharia do Método em ${resolvedSubniche}`,
        format: "video_longo",
        retinaType: "Transformacao",
        platforms: ["YouTube"],
        suggestedTime: "17:00",
        strategicObjective: "Aprofundar consciência e autoridade técnica",
        secondaryObjective: "Gerar leads qualificados",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[2],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Precisa ver profundidade técnica",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Planilha Executiva",
      },
      {
        id: "slot-w1-d5-1",
        dateISO: "2026-11-05",
        dayNumber: 5,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 3,
        dayOfWeekLabel: "Quinta-feira",
        provisionalTitle: `Quebra de Objeção: Falta de tempo em ${resolvedSubniche}`,
        format: "reel_curto",
        retinaType: "NiveisDeConsciencia",
        platforms: ["Instagram", "TikTok"],
        suggestedTime: "12:00",
        strategicObjective: "Quebrar objeção de rotina e conduzir para oferta",
        secondaryObjective: "Conversão",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[5],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Objeção de falta de tempo",
        icpAwarenessLevel: "Consciente do Produto",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      },
      {
        id: "slot-w1-d6-1",
        dateISO: "2026-11-06",
        dayNumber: 6,
        monthShort: "Nov",
        weekNumber: 1,
        dayOfWeekIndex: 4,
        dayOfWeekLabel: "Sexta-feira",
        provisionalTitle: `Live Semanal #1: Consultoria Ao Vivo & Quebra de Travas`,
        format: "live_semanal",
        retinaType: "Autoridade",
        platforms: ["Instagram", "YouTube"],
        suggestedTime: "20:00",
        strategicObjective: "Interagir ao vivo e conduzir para a oferta",
        secondaryObjective: "Fechamento",
        editorialLineName: "Linha Editorial v1",
        editorialPillar: DEFAULT_ROMA_PILLARS[5],
        mainTheme: "",
        aiSuggestedThemes: [],
        icpPainDesireOrObjection: "Dúvida sobre aderência ao caso específico",
        icpAwarenessLevel: "Totalmente Consciente",
        referenceLink: "",
        executionNotes: "",
        status: "planned",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Resumo Executivo da Live",
      },
    ];

    return {
      id: "cal-nov-2026",
      name: `Calendário Editorial — ${resolvedPhase}`,
      status: "active",
      periodLabel: "02/11/2026 → 29/11/2026",
      periodStart: "02/11/2026",
      periodEnd: "29/11/2026",
      mainObjective: resolvedObjective,
      linkedLineName: "Linha Editorial v1",
      platforms: ["Instagram", "YouTube", "TikTok"],
      weeklyCapacity: {
        reels: 4,
        longVideos: 1,
        carousels: 3,
        staticPosts: 2,
        lives: 1,
        dailyStorySequences: 4,
        storiesPerSequence: 5,
      },
      updatedAt: "Hoje",
      reviewSuggestions: [],
      slots: fallbackSlots,
    };
  }, [
    calendarsFromF01,
    selectedCalendarId,
    resolvedSubniche,
    resolvedPhase,
    resolvedObjective,
  ]);

  /* Slots de Feed/Vídeo do Calendário Ativo para a Mesa de Integração */
  const integrationSlots = useMemo(() => {
    const feedSlots = activeCalendarRecord.slots.filter(
      (s) => s.format !== "sequencia_stories"
    );
    if (integrationPeriodFilter === "empty_only") {
      return feedSlots.filter((s) => !s.mainTheme.trim());
    }
    if (integrationPeriodFilter !== "all") {
      return feedSlots.filter((s) => s.weekNumber === integrationPeriodFilter);
    }
    return feedSlots;
  }, [activeCalendarRecord.slots, integrationPeriodFilter]);

  const unallocatedSlotsCount = useMemo(() => {
    return activeCalendarRecord.slots.filter(
      (s) => s.format !== "sequencia_stories" && !s.mainTheme.trim()
    ).length;
  }, [activeCalendarRecord.slots]);

  /* ======================================================================== */
  /* HANDLERS DE GERAÇÃO EM LOTE E CURADORIA HUMANA (SUBÁREA 1)               */
  /* ======================================================================== */

  const handleRunModeGeneration = (mode: ThemeOriginMode) => {
    setIsGeneratingBatch(true);
    setBatchFeedbackBanner(null);

    setTimeout(() => {
      const count =
        mode === "ROMA & Avatar"
          ? mode1Volume
          : mode === "Dados de Mercado"
            ? mode2Volume
            : mode3Volume;

      const batch = generateBatchForMode({
        mode,
        niche: resolvedNiche,
        subniche: resolvedSubniche,
        count,
        selectedPillars: mode1SelectedPillars,
        retinaFocus: mode === "ROMA & Avatar" ? mode1RetinaPriority : "all",
        marketLinks: mode2VideoLinks,
        marketComments: mode2CommentsAndTerms,
        marketReviews: mode2ReviewsAndFeedbacks,
        cycleObjective: mode3Objective,
        businessMoment: mode3Moment,
        platforms: mode3Platforms,
      });

      setStagedBatch(batch);
      setSelectedBatchIds(batch.map((b) => b.id));
      setIsGeneratingBatch(false);
      setBatchFeedbackBanner(
        `Lote de ${batch.length} temas estratégicos gerado a partir de "${mode}"! Revise os títulos abaixo, marque favoritos ou gere variações na mesma linha antes de aprovar para o Mapa de Temas.`
      );
    }, 420);
  };

  /* Botão "Gerar mais temas na mesma linha" (Aprofundar cluster — Seção 3.2.4) */
  const handleGenerateMoreLikeThisInBatch = (seedTheme: StrategicThemeRecord) => {
    const variations: StrategicThemeRecord[] = [
      {
        ...seedTheme,
        id: `thm-cluster-${Date.now()}-1`,
        title: `${seedTheme.title} — Parte 2: O protocolo prático de execução`,
        recommendedFormat: "carrossel",
        consciousnessAxis: "Solução",
      },
      {
        ...seedTheme,
        id: `thm-cluster-${Date.now()}-2`,
        title: `Estudo de Caso: Como resolvemos "${seedTheme.title.slice(0, 42)}..." na prática`,
        recommendedFormat: "video_longo",
        retinaType: "Autoridade",
        consciousnessAxis: "Objeção",
      },
      {
        ...seedTheme,
        id: `thm-cluster-${Date.now()}-3`,
        title: `A pergunta que todo comprador faz sobre: ${seedTheme.title.slice(0, 45)}...`,
        recommendedFormat: "reel_curto",
        retinaType: "NiveisDeConsciencia",
        consciousnessAxis: "Objeção",
      },
    ];

    setStagedBatch((prev) => [...variations, ...prev]);
    setSelectedBatchIds((prev) => [
      ...variations.map((v) => v.id),
      ...prev,
    ]);
    setBatchFeedbackBanner(
      `+3 temas derivados gerados na mesma linha de "${seedTheme.title.slice(0, 40)}..."!`
    );
  };

  /* Aprovar Selecionados do Lote e Enviar para a Biblioteca / Mapa de Temas */
  const handleApproveBatchToLibrary = (goToIntegrationAfter = false) => {
    const approvedItems = stagedBatch.filter((item) =>
      selectedBatchIds.includes(item.id)
    );
    if (approvedItems.length === 0) return;

    const nextLibrary = [...approvedItems, ...themesLibrary];
    persistThemesLibrary(nextLibrary);
    setStagedBatch([]);
    setSelectedBatchIds([]);
    setGeneratorMode("hub");

    if (goToIntegrationAfter) {
      setActiveSubTab("integracao");
      setIntegrationBanner(
        `${approvedItems.length} novos temas aprovados e prontos para encaixar nos slots do Calendário Editorial!`
      );
    } else {
      setActiveSubTab("mapa");
    }
  };

  /* ======================================================================== */
  /* HANDLERS DO MAPA ESTRATÉGICO DE TEMAS (SUBÁREA 2)                        */
  /* ======================================================================== */

  const updateLibraryTheme = useCallback(
    (
      themeId: string,
      updater: (prev: StrategicThemeRecord) => StrategicThemeRecord
    ) => {
      const next = themesLibrary.map((t) => (t.id === themeId ? updater(t) : t));
      persistThemesLibrary(next);
    },
    [themesLibrary, persistThemesLibrary]
  );

  const filteredMapThemes = useMemo(() => {
    return themesLibrary.filter((t) => {
      if (mapOriginFilter !== "all" && t.origin !== mapOriginFilter) {
        return false;
      }
      if (mapPillarFilter !== "all" && t.romaPillar !== mapPillarFilter) {
        return false;
      }
      if (mapRetinaFilter !== "all" && t.retinaType !== mapRetinaFilter) {
        return false;
      }
      if (
        mapAxisFilter !== "all" &&
        t.consciousnessAxis !== mapAxisFilter
      ) {
        return false;
      }
      if (
        mapJourneyFilter !== "all" &&
        t.journeyStage !== mapJourneyFilter
      ) {
        return false;
      }
      if (
        mapFormatFilter !== "all" &&
        t.recommendedFormat !== mapFormatFilter
      ) {
        return false;
      }
      if (mapQuickFlagFilter === "favorites" && !t.isFavorite) return false;
      if (mapQuickFlagFilter === "priority" && !t.isPriorityNextCycle) {
        return false;
      }
      if (mapQuickFlagFilter === "sales" && !t.isSavedForSales) return false;
      if (mapQuickFlagFilter === "market_test" && !t.isMarketTest) return false;
      if (
        mapQuickFlagFilter === "unallocated" &&
        t.allocatedSlotIds.length > 0
      ) {
        return false;
      }

      if (!mapSearch.trim()) return true;
      const q = mapSearch.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.romaPillar.toLowerCase().includes(q) ||
        t.techniqueUsed.toLowerCase().includes(q) ||
        t.painDesireOrObjection.toLowerCase().includes(q)
      );
    });
  }, [
    themesLibrary,
    mapOriginFilter,
    mapPillarFilter,
    mapRetinaFilter,
    mapAxisFilter,
    mapJourneyFilter,
    mapFormatFilter,
    mapQuickFlagFilter,
    mapSearch,
  ]);

  /* ======================================================================== */
  /* HANDLERS DA SUBÁREA 3 — INTEGRAÇÃO COM CALENDÁRIO & REEQUILÍBRIO         */
  /* ======================================================================== */

  /* Calcula de 1 a 3 temas recomendados da Biblioteca para cada Slot (Seção 5.1) */
  const getRecommendedThemesForSlot = useCallback(
    (slot: CalendarSlotItem): StrategicThemeRecord[] => {
      const offset = suggestionOffsetBySlot[slot.id] || 0;

      const scored = [...themesLibrary]
        .filter((t) => t.status !== "archived")
        .map((theme) => {
          let score = 0;
          if (theme.retinaType === slot.retinaType) score += 50;
          if (theme.recommendedFormat === slot.format) score += 30;
          if (theme.romaPillar === slot.editorialPillar) score += 20;
          if (theme.isPriorityNextCycle) score += 10;
          if (theme.isFavorite) score += 5;
          return { theme, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.theme);

      if (scored.length === 0) return [];
      const rotated = [
        ...scored.slice(offset % scored.length),
        ...scored.slice(0, offset % scored.length),
      ];
      return rotated.slice(0, 3);
    },
    [themesLibrary, suggestionOffsetBySlot]
  );

  /* Aloca um tema da Biblioteca em um Slot do Calendário da Função 01 */
  const handleAssignThemeToCalendarSlot = useCallback(
    (slotId: string, theme: StrategicThemeRecord) => {
      const targetCalendar = activeCalendarRecord;
      const updatedSlots = targetCalendar.slots.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          mainTheme: theme.title,
          editorialPillar: theme.romaPillar,
          icpPainDesireOrObjection: theme.painDesireOrObjection,
        };
      });

      const updatedCalendar: EditorialCalendarRecord = {
        ...targetCalendar,
        updatedAt: "Tema integrado agora",
        slots: updatedSlots,
      };

      const nextCalendars =
        calendarsFromF01.length > 0
          ? calendarsFromF01.map((c) =>
              c.id === updatedCalendar.id ? updatedCalendar : c
            )
          : [updatedCalendar];

      persistCalendarsToF01(nextCalendars);

      const nextThemes = themesLibrary.map((t) => {
        if (t.id !== theme.id) return t;
        const nextSlotIds = t.allocatedSlotIds.includes(slotId)
          ? t.allocatedSlotIds
          : [...t.allocatedSlotIds, slotId];
        return { ...t, allocatedSlotIds: nextSlotIds };
      });
      persistThemesLibrary(nextThemes);

      setIntegrationBanner(
        `Tema "${theme.title.slice(0, 48)}..." vinculado com sucesso ao slot do Calendário!`
      );
    },
    [
      activeCalendarRecord,
      calendarsFromF01,
      persistCalendarsToF01,
      themesLibrary,
      persistThemesLibrary,
    ]
  );

  const handleClearSlotTheme = (slotId: string) => {
    const updatedSlots = activeCalendarRecord.slots.map((s) =>
      s.id === slotId ? { ...s, mainTheme: "" } : s
    );
    const updatedCal: EditorialCalendarRecord = {
      ...activeCalendarRecord,
      slots: updatedSlots,
    };
    const nextCals =
      calendarsFromF01.length > 0
        ? calendarsFromF01.map((c) =>
            c.id === updatedCal.id ? updatedCal : c
          )
        : [updatedCal];
    persistCalendarsToF01(nextCals);

    const nextThemes = themesLibrary.map((t) => ({
      ...t,
      allocatedSlotIds: t.allocatedSlotIds.filter((id) => id !== slotId),
    }));
    persistThemesLibrary(nextThemes);
  };

  /* Botão "Reequilibrar Calendário" (Seção 5.2 da Função 02) */
  const handleAutoRebalanceCalendar = () => {
    const usedThemeIds = new Set<string>();
    const nextSlotAllocations: Record<string, StrategicThemeRecord> = {};

    const updatedSlots = activeCalendarRecord.slots.map((slot) => {
      if (slot.format === "sequencia_stories") return slot;

      // Se houver simulação de cenário ativa, ajusta o tipo RETINA do slot
      let targetRetina = slot.retinaType;
      if (
        simulationScenario === "more_transformation" &&
        slot.retinaType === "Engajamento"
      ) {
        targetRetina = "Transformacao";
      } else if (
        simulationScenario === "sales_push" &&
        (slot.retinaType === "Engajamento" ||
          slot.retinaType === "Relacionamento")
      ) {
        targetRetina = "NiveisDeConsciencia";
      } else if (
        simulationScenario === "top_of_funnel" &&
        slot.retinaType === "NiveisDeConsciencia"
      ) {
        targetRetina = "Engajamento";
      }

      const bestMatch =
        themesLibrary.find(
          (t) =>
            !usedThemeIds.has(t.id) &&
            t.retinaType === targetRetina &&
            t.recommendedFormat === slot.format
        ) ??
        themesLibrary.find(
          (t) => !usedThemeIds.has(t.id) && t.retinaType === targetRetina
        ) ??
        themesLibrary.find((t) => !usedThemeIds.has(t.id)) ??
        themesLibrary[0];

      if (bestMatch) {
        usedThemeIds.add(bestMatch.id);
        nextSlotAllocations[slot.id] = bestMatch;
        return {
          ...slot,
          retinaType: targetRetina,
          mainTheme: bestMatch.title,
          editorialPillar: bestMatch.romaPillar,
          icpPainDesireOrObjection: bestMatch.painDesireOrObjection,
        };
      }
      return slot;
    });

    const updatedCal: EditorialCalendarRecord = {
      ...activeCalendarRecord,
      updatedAt: "Reequilibrado automaticamente pela IA",
      slots: updatedSlots,
    };

    const nextCals =
      calendarsFromF01.length > 0
        ? calendarsFromF01.map((c) =>
            c.id === updatedCal.id ? updatedCal : c
          )
        : [updatedCal];
    persistCalendarsToF01(nextCals);

    setIntegrationBanner(
      "Calendário reequilibrado pela IA! Todos os slots do período foram preenchidos respeitando a Matriz RETINA e a Jornada de 5 Passos."
    );
  };

  /* Salvar Versão do Calendário com Temas (Seção 5.2 da Função 02) */
  const handleSaveCalendarThemeVersion = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allocatedCount = activeCalendarRecord.slots.filter(
      (s) => s.format !== "sequencia_stories" && Boolean(s.mainTheme.trim())
    ).length;

    const record: SavedCalendarThemeVersion = {
      id: `cal-ver-${Date.now()}`,
      versionName:
        newVersionTitle.trim() ||
        `Calendário – Versão ${savedCalendarVersions.length + 1} (${resolvedPhase})`,
      periodLabel: `${activeCalendarRecord.periodStart} → ${activeCalendarRecord.periodEnd}`,
      objectiveUsed: mode3Objective,
      businessMomentUsed: mode3Moment,
      savedAt: "Salvo hoje",
      allocatedCount,
      slotsSnapshot: activeCalendarRecord.slots,
    };

    const next = [record, ...savedCalendarVersions];
    setSavedCalendarVersions(next);
    try {
      window.localStorage.setItem(versionsStorageKey, JSON.stringify(next));
    } catch {
      /* Ignora erro */
    }
    setIsSaveVersionModalOpen(false);
    setIntegrationBanner(
      `Versão "${record.versionName}" salva com ${allocatedCount} slots preenchidos!`
    );
  };

  /* Mapa de Calor RETINA no Calendário Ativo (Seção 5.2) */
  const retinaHeatmap = useMemo(() => {
    const counts: Record<RetinaTypeKey, number> = {
      Relacionamento: 0,
      Engajamento: 0,
      Transformacao: 0,
      Interacao: 0,
      NiveisDeConsciencia: 0,
      Autoridade: 0,
    };
    const feedSlots = activeCalendarRecord.slots.filter(
      (s) => s.format !== "sequencia_stories"
    );
    for (const s of feedSlots) {
      counts[s.retinaType] = (counts[s.retinaType] || 0) + 1;
    }
    const total = Math.max(1, feedSlots.length);
    return { counts, total };
  }, [activeCalendarRecord.slots]);

  return (
    <div className="flex flex-col gap-6">
      {/* =================================================================== */}
      {/* ORIENTAÇÃO DE DEPENDÊNCIAS (SEÇÃO 6.4.3 DO DOC 00)                  */}
      {/* =================================================================== */}
      {!hasActiveLine ? (
        <section className="flex flex-col justify-between gap-4 rounded-la-xl border border-amber-400/50 bg-amber-950/25 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <h3 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                A Base Estratégica deste projeto ainda não possui uma Linha
                Editorial ativa.
              </h3>
              <p className="mt-0.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                Conclua a Linha e o Calendário Editorial para que a classificação
                por pilares ROMA, tom de voz e distribuição RETINA tenha máxima
                precisão.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {props.onGoToLineTab ? (
              <button
                type="button"
                onClick={props.onGoToLineTab}
                className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
              >
                Criar Linha Editorial
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CABEÇALHO SUPERIOR DA FUNÇÃO 02 — TEMAS E IDEIAS ESTRATÉGICAS       */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 shadow-[var(--la-elevation-2)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                <Lightbulb className="h-3.5 w-3.5 text-la-gold" />
                <span>
                  FUNÇÃO 02 · MOTOR DE TEMAS ESTRATÉGICOS & INTEGRAÇÃO NO
                  CALENDÁRIO
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>
                  {themesLibrary.length} temas na Biblioteca •{" "}
                  {unallocatedSlotsCount} slots sem tema na agenda
                </span>
              </span>
            </div>

            <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
              Temas e Ideias Estratégicas
            </h2>
            <p className="mt-1 max-w-[56rem] font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
              O motor de temas lê automaticamente a Base Estratégica, a Linha
              Editorial, o Calendário e o momento do negócio, acionando as 5
              técnicas de conteúdo raiz e as 8 técnicas avançadas nos bastidores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!props.isStandalonePage ? (
              <Link
                href={`/dashboard/editorial/${resolvedProjectId}/temas`}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/14 bg-white/[0.03] px-3.5 py-2 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-gold hover:text-la-gold-light"
              >
                <ExternalLink className="h-3.5 w-3.5 text-la-gold" />
                <span>Abrir em Página Dedicada</span>
              </Link>
            ) : null}

            {unallocatedSlotsCount > 0 ? (
              <button
                type="button"
                onClick={() => setActiveSubTab("integracao")}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Preencher {unallocatedSlotsCount} Slots sem Tema
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Navegação entre as 3 Subáreas Oficiais da Função 02 */}
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/55 p-1.5">
            {[
              {
                id: "gerar" as const,
                label: "Subárea 1 · Gerar Temas (3 Modos)",
                icon: Sparkles,
              },
              {
                id: "mapa" as const,
                label: `Subárea 2 · Mapa de Temas (${themesLibrary.length})`,
                icon: Layers,
              },
              {
                id: "integracao" as const,
                label: "Subárea 3 · Integração com Calendário",
                icon: CalendarIcon,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={clsx(
                    "inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md px-4 py-1.5 font-la-sans text-[0.8125rem] font-medium transition-all",
                    active
                      ? "bg-la-gold font-semibold text-la-text-inverse shadow-[0_0_18px_rgba(207,169,101,0.28)]"
                      : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4",
                      active ? "text-la-text-inverse" : "text-la-gold"
                    )}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-secondary">
            <span>Contexto ativo:</span>
            <strong className="text-la-gold-light">
              {resolvedNiche} / {resolvedSubniche}
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SUBÁREA 1: GERAR TEMAS NOS 3 MODOS OFICIAIS + TABELA DE CURADORIA   */}
      {/* =================================================================== */}
      {activeSubTab === "gerar" ? (
        <div className="flex flex-col gap-6">
          {/* 1. TELA DE SELEÇÃO DOS 3 MODOS (QUANDO generatorMode === "hub") */}
          {generatorMode === "hub" ? (
            <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
              {/* Card Modo 1: ROMA & Avatar */}
              <article className="flex flex-col justify-between rounded-la-xl border border-la-border-gold/55 bg-[#0A0E18]/95 p-6 shadow-xl transition-all hover:border-la-gold">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Target className="h-5 w-5" />
                    </span>
                    <span className="rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase text-la-gold-light">
                      MODO 01 · CONTEÚDO RAIZ
                    </span>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Temas a partir de ROMA & Avatar
                  </h3>
                  <p className="mt-2 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                    Use a promessa, a oferta, o ICP, as dores, os desejos e a
                    árvore de objeções reais do projeto para gerar lotes de 10 a
                    15 temas por pilar que reforçam posicionamento e
                    transformação.
                  </p>

                  <div className="mt-4 rounded-la-lg border border-white/8 bg-black/50 p-3 font-la-mono text-[0.625rem] text-la-text-secondary">
                    <strong className="block text-la-gold-light">
                      5 Técnicas Raiz acionadas automaticamente:
                    </strong>
                    <span>
                      1. 3 Subáreas da ROMA • 2. Dores/Desejos do Avatar • 3.
                      Quebra de Mitos • 4. 10 Atalhos Práticos • 5. Estudos de
                      Caso
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Pilares, dores, desejos e objeções já carregados
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStagedBatch([]);
                      setGeneratorMode("roma_avatar");
                    }}
                    className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <span>Abrir Estúdio ROMA & Avatar</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              {/* Card Modo 2: Dados de Mercado (Internet) */}
              <article className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-[#090D16]/95 p-6 shadow-xl transition-all hover:border-la-gold">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Radar className="h-5 w-5" />
                    </span>
                    <span className="rounded-la-full border border-sky-400/45 bg-sky-500/15 px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase text-sky-200">
                      MODO 02 · RADAR EXTERNO
                    </span>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Temas a partir de Dados de Mercado
                  </h3>
                  <p className="mt-2 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                    Investigue linguagem, comentários (&ldquo;Mas e se...?&rdquo;),
                    vídeos virais, reviews de 1★ e 5★ (Amazon/Hotmart) e lacunas
                    do mercado para encontrar assuntos que sua audiência já quer
                    discutir.
                  </p>

                  <div className="mt-4 rounded-la-lg border border-white/8 bg-black/50 p-3 font-la-mono text-[0.625rem] text-la-text-secondary">
                    <strong className="block text-sky-300">
                      Técnicas Avançadas de Mercado:
                    </strong>
                    <span>
                      Engenharia de Comentários • Reviews 1★ e 5★ • Anti-Clichê •
                      Termos Periféricos • Ilhas de Competência • Cultura Pop
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Pesquisa orientada pelo nicho e pela oferta do projeto
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStagedBatch([]);
                      setGeneratorMode("dados_mercado");
                    }}
                    className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold/65 bg-la-gold-faint px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                  >
                    <span>Pesquisar Oportunidades de Tema</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              {/* Card Modo 3: Objetivo / Momento do Negócio */}
              <article className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-[#090D16]/95 p-6 shadow-xl transition-all hover:border-la-gold">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Flame className="h-5 w-5" />
                    </span>
                    <span className="rounded-la-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase text-amber-200">
                      MODO 03 · MOMENTO ATUAL
                    </span>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Temas a partir do Objetivo e Momento
                  </h3>
                  <p className="mt-2 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                    Gere temas priorizados especificamente para a fase atual da
                    operação: crescimento de audiência, aquecimento,
                    pré-lançamento, carrinho aberto, perpétuo ou pós-venda.
                  </p>

                  <div className="mt-4 rounded-la-lg border border-white/8 bg-black/50 p-3 font-la-mono text-[0.625rem] text-la-text-secondary">
                    <strong className="block text-amber-300">
                      Cruzamento Inteligente com a Agenda:
                    </strong>
                    <span>
                      Analisa os {unallocatedSlotsCount} slots sem tema do
                      Calendário ativo e prioriza os tipos RETINA necessários no
                      ciclo.
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Calendário ativo, objetivo do período e plataformas
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStagedBatch([]);
                      setGeneratorMode("objetivo_momento");
                    }}
                    className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold/65 bg-la-gold-faint px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                  >
                    <span>Gerar Temas para Este Momento</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ESTÚDIO DO MODO 1: TEMAS A PARTIR DA ROMA & AVATAR (SEÇÃO 3.2)  */}
          {/* --------------------------------------------------------------- */}
          {generatorMode === "roma_avatar" ? (
            <section className="flex flex-col gap-6 rounded-la-xl border border-la-border-gold/60 bg-[#080B12]/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    MODO 01 DE GERAÇÃO · SEÇÃO 3.2 DA FUNÇÃO 02
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                    Gerar Temas Raiz a partir da ROMA, PUV, MUV & Avatar
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratorMode("hub")}
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary hover:text-la-text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                  <span>Voltar aos 3 Modos</span>
                </button>
              </div>

              {/* Parâmetros do Usuário (Seção 3.2.3) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    1. Volume de Temas Iniciais
                  </label>
                  <select
                    value={mode1Volume}
                    onChange={(e) => setMode1Volume(Number(e.target.value))}
                    className="mt-1 min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  >
                    <option value={15}>
                      Gerar 15 temas iniciais (~5 por área ROMA)
                    </option>
                    <option value={20}>
                      Gerar 20 temas iniciais (Padrão rápido)
                    </option>
                    <option value={30}>
                      Gerar 30 temas iniciais (10 por área ROMA)
                    </option>
                    <option value={45}>
                      Gerar 45 temas iniciais (15 por área ROMA)
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    2. Prioridade de Tipo de Conteúdo (RETINA)
                  </label>
                  <select
                    value={mode1RetinaPriority}
                    onChange={(e) =>
                      setMode1RetinaPriority(
                        e.target.value as "all" | RetinaTypeKey
                      )
                    }
                    className="mt-1 min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  >
                    <option value="all">
                      Equilíbrio padrão — Todos os 6 tipos (Recomendado)
                    </option>
                    <option value="Relacionamento">
                      Focar mais em Relacionamento (Conexão com seguidores)
                    </option>
                    <option value="Engajamento">
                      Focar mais em Engajamento (Topo de funil, alcance)
                    </option>
                    <option value="Transformacao">
                      Focar mais em Transformação (Educativo, salvamentos)
                    </option>
                    <option value="Interacao">
                      Focar mais em Interação (Enquetes, caixinhas, Direct)
                    </option>
                    <option value="NiveisDeConsciencia">
                      Focar mais em Níveis de Consciência (Conteúdo de venda)
                    </option>
                    <option value="Autoridade">
                      Focar mais em Autoridade (Resultados, provas, método)
                    </option>
                  </select>
                </div>

                <div className="flex flex-col justify-between rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <div>
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                      3. Ação do Motor Editorial
                    </span>
                    <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                      Cruza ROMA, PUV, MUV, Dores, Desejos e Mitos para montar a
                      tabela de curadoria.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingBatch}
                    onClick={() => handleRunModeGeneration("ROMA & Avatar")}
                    className="mt-3 inline-flex min-h-[2.625rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    {isGeneratingBatch ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Gerando Lote de Temas Raiz...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Gerar {mode1Volume} Temas Estratégicos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Seleção Múltipla de Pilares da ROMA */}
              <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Foco em Pilares da ROMA / Linha Editorial (Multi-select):
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode1SelectedPillars([])}
                    className={clsx(
                      "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.625rem]",
                      mode1SelectedPillars.length === 0
                        ? "border-la-gold bg-la-gold text-la-text-inverse font-bold"
                        : "border-white/12 bg-black/50 text-la-text-secondary"
                    )}
                  >
                    Todos os pilares (Recomendado)
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {DEFAULT_ROMA_PILLARS.map((pil) => {
                    const selected =
                      mode1SelectedPillars.length === 0 ||
                      mode1SelectedPillars.includes(pil);
                    return (
                      <button
                        key={pil}
                        type="button"
                        onClick={() =>
                          setMode1SelectedPillars((prev) =>
                            prev.includes(pil)
                              ? prev.filter((p) => p !== pil)
                              : [...prev, pil]
                          )
                        }
                        className={clsx(
                          "rounded-la-md border px-3 py-1.5 font-la-sans text-[0.75rem] transition-colors",
                          selected
                            ? "border-la-border-gold bg-la-gold-faint text-la-gold-light font-medium"
                            : "border-white/10 bg-black/50 text-la-text-muted"
                        )}
                      >
                        {pil}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ESTÚDIO DO MODO 2: DADOS DE MERCADO WIZARD (SEÇÃO 3.3)          */}
          {/* --------------------------------------------------------------- */}
          {generatorMode === "dados_mercado" ? (
            <section className="flex flex-col gap-6 rounded-la-xl border border-sky-400/45 bg-[#080B12]/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-sky-300">
                    MODO 02 DE GERAÇÃO · WIZARD DE RADAR DE MERCADO (SEÇÃO 3.3)
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                    Temas a partir de Dados de Mercado, Comentários e Reviews
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratorMode("hub")}
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary hover:text-la-text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                  <span>Voltar aos 3 Modos</span>
                </button>
              </div>

              {/* Abas dos 3 Campos do Wizard da Seção 3.3.2 */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    step: 1 as const,
                    title: "Campo 1 · Links de Vídeos/Posts do Nicho",
                    sub: "Até 5 links mais vistos (YouTube, TikTok, Reels)",
                  },
                  {
                    step: 2 as const,
                    title: "Campo 2 · Comentários ('Mas e se...?') & Rotina",
                    sub: "Dúvidas negligenciadas e termos periféricos",
                  },
                  {
                    step: 3 as const,
                    title: "Campo 3 · Reviews (1★ e 5★) & Feedbacks",
                    sub: "Amazon, Hotmart, área de membros e clientes",
                  },
                ].map((item) => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setMode2Step(item.step)}
                    className={clsx(
                      "rounded-la-lg border p-3.5 text-left transition-all",
                      mode2Step === item.step
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45 hover:border-white/25"
                    )}
                  >
                    <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block font-la-mono text-[0.6875rem] text-la-text-secondary">
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>

              {mode2Step === 1 ? (
                <div className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Links de vídeos ou posts importantes do seu nicho
                  </label>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Entre no YouTube, TikTok ou Instagram e pesquise pelo seu
                    nicho. No YouTube, filtre por &ldquo;Mais vistos&rdquo;. No
                    TikTok e Instagram, escolha posts com muitas visualizações,
                    comentários e salvamentos. Copie até 5 links representativos.
                  </p>
                  <textarea
                    rows={4}
                    value={mode2VideoLinks}
                    onChange={(e) => setMode2VideoLinks(e.target.value)}
                    placeholder="Cole aqui até 5 links de vídeos (YouTube/TikTok/Reels) que o seu público consome muito."
                    className="mt-1 w-full rounded-la-md border border-white/14 bg-black/70 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              ) : null}

              {mode2Step === 2 ? (
                <div className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Engenharia Reversa de Comentários (&ldquo;Mas e se...?&rdquo;) e Termos Periféricos
                  </label>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Cole perguntas reais dos comentários que começam com
                    &ldquo;Mas e se...?&rdquo;, &ldquo;Como eu aplico isso
                    em...?&rdquo; ou &ldquo;Falta explicar a parte...&rdquo;, além
                    de termos da rotina do cliente.
                  </p>
                  <textarea
                    rows={4}
                    value={mode2CommentsAndTerms}
                    onChange={(e) => setMode2CommentsAndTerms(e.target.value)}
                    className="mt-1 w-full rounded-la-md border border-white/14 bg-black/70 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              ) : null}

              {mode2Step === 3 ? (
                <div className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Reviews (1★, 2★ e 5★ de Amazon/Hotmart) e Feedbacks de Clientes
                  </label>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Avaliações de 1 e 2 estrelas revelam o que frustrou ou
                    faltou explicar; avaliações de 5 estrelas mostram o que
                    gerou a virada de chave no comprador.
                  </p>
                  <textarea
                    rows={4}
                    value={mode2ReviewsAndFeedbacks}
                    onChange={(e) =>
                      setMode2ReviewsAndFeedbacks(e.target.value)
                    }
                    className="mt-1 w-full rounded-la-md border border-white/14 bg-black/70 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                    Quantidade a extrair:
                  </span>
                  <select
                    value={mode2Volume}
                    onChange={(e) => setMode2Volume(Number(e.target.value))}
                    className="rounded-la-md border border-white/14 bg-black/70 px-3 py-1.5 font-la-mono text-[0.75rem] text-la-gold-light"
                  >
                    <option value={12}>12 temas avançados de mercado</option>
                    <option value={20}>20 temas avançados de mercado</option>
                    <option value={30}>30 temas avançados de mercado</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingBatch}
                  onClick={() => handleRunModeGeneration("Dados de Mercado")}
                  className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Extrair Lacunas & Gerar {mode2Volume} Temas de Mercado
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ESTÚDIO DO MODO 3: OBJETIVO / MOMENTO DO NEGÓCIO (SEÇÃO 3.4)    */}
          {/* --------------------------------------------------------------- */}
          {generatorMode === "objetivo_momento" ? (
            <section className="flex flex-col gap-6 rounded-la-xl border border-amber-400/50 bg-[#080B12]/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-amber-300">
                    MODO 03 DE GERAÇÃO · ALINHAMENTO AO CICLO (SEÇÃO 3.4)
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                    Temas a partir do Objetivo do Período e Momento do Negócio
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratorMode("hub")}
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary hover:text-la-text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                  <span>Voltar aos 3 Modos</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    1. Qual é o principal objetivo deste ciclo de conteúdo?
                  </label>
                  <select
                    value={mode3Objective}
                    onChange={(e) => setMode3Objective(e.target.value)}
                    className="mt-1 min-h-[2.625rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  >
                    {MODE_3_OBJECTIVES.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    2. Em que momento do seu negócio você está agora?
                  </label>
                  <select
                    value={mode3Moment}
                    onChange={(e) => setMode3Moment(e.target.value)}
                    className="mt-1 min-h-[2.625rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  >
                    {MODE_3_BUSINESS_MOMENTS.map((mom) => (
                      <option key={mom} value={mom}>
                        {mom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                  3. Em quais plataformas vamos focar neste período? (Multi-select)
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {MODE_3_PLATFORMS.map((plat) => {
                    const active = mode3Platforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() =>
                          setMode3Platforms((prev) =>
                            active
                              ? prev.filter((p) => p !== plat)
                              : [...prev, plat]
                          )
                        }
                        className={clsx(
                          "rounded-la-md border px-3.5 py-1.5 font-la-mono text-[0.75rem] transition-colors",
                          active
                            ? "border-la-gold bg-la-gold-faint font-semibold text-la-gold-light"
                            : "border-white/10 bg-black/50 text-la-text-muted"
                        )}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <span className="font-la-mono text-[0.75rem] text-la-text-secondary">
                  A IA priorizará temas compatíveis com{" "}
                  <strong className="text-la-gold-light">{mode3Moment}</strong>{" "}
                  e com os {unallocatedSlotsCount} slots abertos.
                </span>

                <button
                  type="button"
                  disabled={isGeneratingBatch}
                  onClick={() =>
                    handleRunModeGeneration("Objetivo & Momento")
                  }
                  className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Gerar Temas Alinhados ao Período</span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* TABELA DE CURADORIA E REVISÃO DO LOTE GERADO (SEÇÃO 3.2.4)      */}
          {/* --------------------------------------------------------------- */}
          {stagedBatch.length > 0 ? (
            <section className="flex flex-col gap-4 rounded-la-xl border border-la-gold bg-[#0A0E18]/98 p-6 shadow-2xl">
              {batchFeedbackBanner ? (
                <div className="flex items-center justify-between rounded-la-lg border border-emerald-400/45 bg-emerald-950/30 px-4 py-3 text-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="font-la-sans text-[0.8125rem]">
                      {batchFeedbackBanner}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                    MESA DE REVISÃO E CURADORIA HUMANA ANTES DA BIBLIOTECA
                  </span>
                  <h4 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    {stagedBatch.length} Temas Gerados neste Lote (
                    {selectedBatchIds.length} selecionados para aprovação)
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBatchIds(
                        selectedBatchIds.length === stagedBatch.length
                          ? []
                          : stagedBatch.map((b) => b.id)
                      )
                    }
                    className="rounded-la-md border border-white/14 bg-black/50 px-3 py-2 font-la-mono text-[0.6875rem] text-la-text-secondary hover:text-la-text-primary"
                  >
                    {selectedBatchIds.length === stagedBatch.length
                      ? "Desmarcar Todos"
                      : "Selecionar Todos"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveBatchToLibrary(false)}
                    className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                  >
                    <Check className="h-4 w-4" />
                    <span>
                      Aprovar {selectedBatchIds.length} e Enviar ao Mapa de Temas
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveBatchToLibrary(true)}
                    className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Aprovar e Ir para Integração no Calendário →</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Saída Canônica (Seção 3.2.4: Tema, Pilar ROMA, Tipo RETINA, Nível Consciência, Jornada, Formato) */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[64rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                      <th className="py-2.5 pr-2">Sel.</th>
                      <th className="px-2 py-2.5">Tema (Título Editável) & Técnica</th>
                      <th className="px-2 py-2.5">Pilar ROMA</th>
                      <th className="px-2 py-2.5">Tipo RETINA</th>
                      <th className="px-2 py-2.5">Nível Consciência</th>
                      <th className="px-2 py-2.5">Jornada (5 Passos)</th>
                      <th className="px-2 py-2.5">Formato / Plataforma</th>
                      <th className="py-2.5 pl-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 font-la-sans text-[0.8125rem]">
                    {stagedBatch.map((item) => {
                      const isChecked = selectedBatchIds.includes(item.id);
                      const retMeta = RETINA_META[item.retinaType];
                      const fmtMeta = FORMAT_META[item.recommendedFormat];

                      return (
                        <tr
                          key={item.id}
                          className={clsx(
                            "transition-colors",
                            isChecked
                              ? "bg-white/[0.02]"
                              : "opacity-55 hover:opacity-90"
                          )}
                        >
                          <td className="py-3 pr-2 align-top">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSelectedBatchIds((prev) =>
                                  e.target.checked
                                    ? [...prev, item.id]
                                    : prev.filter((id) => id !== item.id)
                                )
                              }
                              className="mt-1 h-4 w-4 accent-[#CFA965]"
                            />
                          </td>

                          <td className="max-w-[24rem] px-2 py-3 align-top">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                setStagedBatch((prev) =>
                                  prev.map((b) =>
                                    b.id === item.id
                                      ? { ...b, title: e.target.value }
                                      : b
                                  )
                                )
                              }
                              className="w-full rounded-la-xs border border-transparent bg-transparent px-1.5 py-0.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary focus:border-la-gold focus:bg-black/70 focus:outline-none"
                            />
                            <span className="mt-0.5 block px-1.5 font-la-mono text-[0.625rem] text-la-gold-light">
                              {item.techniqueUsed}
                            </span>
                          </td>

                          <td className="px-2 py-3 align-top font-la-mono text-[0.6875rem] text-la-text-secondary">
                            {item.romaPillar}
                          </td>

                          <td className="px-2 py-3 align-top">
                            <span
                              className={clsx(
                                "inline-flex rounded-la-full border px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold",
                                retMeta.badgeClass
                              )}
                            >
                              {retMeta.code} · {retMeta.label}
                            </span>
                          </td>

                          <td className="px-2 py-3 align-top font-la-mono text-[0.6875rem] text-la-text-primary">
                            {item.consciousnessAxis}
                          </td>

                          <td className="px-2 py-3 align-top font-la-mono text-[0.6875rem] text-la-text-secondary">
                            {item.journeyStage}
                          </td>

                          <td className="px-2 py-3 align-top">
                            <span className="block font-la-mono text-[0.6875rem] font-semibold text-la-text-primary">
                              {fmtMeta.shortLabel}
                            </span>
                            <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                              {item.recommendedPlatform}
                            </span>
                          </td>

                          <td className="py-3 pl-2 text-right align-top">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setStagedBatch((prev) =>
                                    prev.map((b) =>
                                      b.id === item.id
                                        ? {
                                            ...b,
                                            isFavorite: !b.isFavorite,
                                            status: !b.isFavorite
                                              ? "favorite"
                                              : "active",
                                          }
                                        : b
                                    )
                                  )
                                }
                                title="Marcar como Favorito"
                                className={clsx(
                                  "inline-flex h-7 w-7 items-center justify-center rounded-la-xs border",
                                  item.isFavorite
                                    ? "border-la-gold bg-la-gold text-la-text-inverse"
                                    : "border-white/10 text-la-text-muted hover:text-la-gold-light"
                                )}
                              >
                                <Star className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateMoreLikeThisInBatch(item)
                                }
                                title="Gerar mais temas na mesma linha (Aprofundar cluster)"
                                className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2 py-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                              >
                                +3 similares
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setStagedBatch((prev) =>
                                    prev.filter((b) => b.id !== item.id)
                                  )
                                }
                                title="Excluir do lote"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-la-xs border border-white/10 text-la-text-muted hover:border-red-500/40 hover:text-red-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* SUBÁREA 2: MAPA ESTRATÉGICO DE TEMAS / BIBLIOTECA COMPLETA          */}
      {/* =================================================================== */}
      {activeSubTab === "mapa" ? (
        <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
          {/* Barra de Busca e Filtros Multi-Coluna (Seção 4.1) */}
          <div className="flex flex-col gap-3.5 border-b border-white/10 pb-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1 lg:max-w-[26rem]">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-gold" />
                <input
                  type="search"
                  placeholder="Filtrar biblioteca por tema, pilar, técnica ou objeção..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="min-h-[2.5rem] w-full rounded-la-md border border-white/12 bg-black/60 py-1.5 pr-4 pl-10 font-la-sans text-[0.8125rem] text-la-text-primary"
                />
              </div>

              {/* Pílulas de Filtro Rápido Estratégico */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all" as const, label: "Todos" },
                  { id: "favorites" as const, label: "★ Favoritos" },
                  {
                    id: "priority" as const,
                    label: "Prioritários p/ Próximo Ciclo",
                  },
                  { id: "sales" as const, label: "Guardados p/ Vendas" },
                  { id: "market_test" as const, label: "Teste de Mercado" },
                  { id: "unallocated" as const, label: "Ainda Não Alocados" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMapQuickFlagFilter(f.id)}
                    className={clsx(
                      "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.6875rem] transition-colors",
                      mapQuickFlagFilter === f.id
                        ? "border-la-gold bg-la-gold font-bold text-la-text-inverse"
                        : "border-white/10 bg-black/45 text-la-text-secondary hover:border-white/25"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros por Qualquer Coluna da Tabela (Origem, Pilar, RETINA, Consciência, Jornada, Formato) */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              <select
                value={mapOriginFilter}
                onChange={(e) =>
                  setMapOriginFilter(e.target.value as "all" | ThemeOriginMode)
                }
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Origem: Todas (3)</option>
                <option value="ROMA & Avatar">ROMA & Avatar</option>
                <option value="Dados de Mercado">Dados de Mercado</option>
                <option value="Objetivo & Momento">Objetivo & Momento</option>
              </select>

              <select
                value={mapPillarFilter}
                onChange={(e) => setMapPillarFilter(e.target.value)}
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Pilar ROMA: Todos</option>
                {DEFAULT_ROMA_PILLARS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={mapRetinaFilter}
                onChange={(e) =>
                  setMapRetinaFilter(e.target.value as "all" | RetinaTypeKey)
                }
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Tipo RETINA: Todos</option>
                {(Object.keys(RETINA_META) as RetinaTypeKey[]).map((r) => (
                  <option key={r} value={r}>
                    {RETINA_META[r].label}
                  </option>
                ))}
              </select>

              <select
                value={mapAxisFilter}
                onChange={(e) =>
                  setMapAxisFilter(e.target.value as "all" | ConsciousnessAxis)
                }
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Consciência: Todos (3)</option>
                <option value="Sintoma">Eixo 1 · Sintoma</option>
                <option value="Solução">Eixo 2 · Solução</option>
                <option value="Objeção">Eixo 3 · Objeção</option>
              </select>

              <select
                value={mapJourneyFilter}
                onChange={(e) =>
                  setMapJourneyFilter(
                    e.target.value as "all" | CustomerJourneyStage
                  )
                }
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Jornada: Todas (5)</option>
                {JOURNEY_STAGES.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              <select
                value={mapFormatFilter}
                onChange={(e) =>
                  setMapFormatFilter(
                    e.target.value as "all" | SlotContentFormat
                  )
                }
                className="rounded-la-md border border-white/12 bg-[#0B0F19] px-2.5 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
              >
                <option value="all">Formato: Todos</option>
                {(Object.keys(FORMAT_META) as SlotContentFormat[]).map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_META[f].shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela Completa do Mapa Estratégico de Temas */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[72rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                  <th className="py-2.5 pr-2">Tema & Dor/Objeção</th>
                  <th className="px-2 py-2.5">Origem</th>
                  <th className="px-2 py-2.5">Pilar ROMA</th>
                  <th className="px-2 py-2.5">Tipo RETINA</th>
                  <th className="px-2 py-2.5">Consciência</th>
                  <th className="px-2 py-2.5">Jornada (5 Passos)</th>
                  <th className="px-2 py-2.5">Formato</th>
                  <th className="px-2 py-2.5">Classificação / Status</th>
                  <th className="py-2.5 pl-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 font-la-sans text-[0.8125rem]">
                {filteredMapThemes.map((theme) => {
                  const retMeta = RETINA_META[theme.retinaType];
                  return (
                    <tr
                      key={theme.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="max-w-[23rem] py-3.5 pr-2 align-top">
                        <input
                          type="text"
                          value={theme.title}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full rounded-la-xs border border-transparent bg-transparent px-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary focus:border-la-gold focus:bg-black/75 focus:outline-none"
                        />
                        <span className="mt-0.5 block px-1 font-la-mono text-[0.625rem] text-la-text-secondary">
                          {theme.painDesireOrObjection}
                        </span>
                      </td>

                      <td className="px-2 py-3.5 align-top font-la-mono text-[0.6875rem] text-la-gold-light">
                        {theme.origin}
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <select
                          value={theme.romaPillar}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              romaPillar: e.target.value,
                            }))
                          }
                          className="max-w-[11rem] rounded-la-xs border border-white/10 bg-black/60 px-2 py-1 font-la-mono text-[0.625rem] text-la-text-secondary"
                        >
                          {DEFAULT_ROMA_PILLARS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <select
                          value={theme.retinaType}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              retinaType: e.target.value as RetinaTypeKey,
                            }))
                          }
                          className={clsx(
                            "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold",
                            retMeta.badgeClass
                          )}
                        >
                          {(Object.keys(RETINA_META) as RetinaTypeKey[]).map(
                            (r) => (
                              <option
                                key={r}
                                value={r}
                                className="bg-[#090C14] text-white"
                              >
                                {RETINA_META[r].label}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <select
                          value={theme.consciousnessAxis}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              consciousnessAxis: e.target
                                .value as ConsciousnessAxis,
                            }))
                          }
                          className="rounded-la-xs border border-white/10 bg-black/60 px-2 py-1 font-la-mono text-[0.625rem] text-la-text-primary"
                        >
                          <option value="Sintoma">Sintoma</option>
                          <option value="Solução">Solução</option>
                          <option value="Objeção">Objeção</option>
                        </select>
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <select
                          value={theme.journeyStage}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              journeyStage: e.target
                                .value as CustomerJourneyStage,
                            }))
                          }
                          className="rounded-la-xs border border-white/10 bg-black/60 px-2 py-1 font-la-mono text-[0.625rem] text-la-text-secondary"
                        >
                          {JOURNEY_STAGES.map((j) => (
                            <option key={j} value={j}>
                              {j}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <select
                          value={theme.recommendedFormat}
                          onChange={(e) =>
                            updateLibraryTheme(theme.id, (prev) => ({
                              ...prev,
                              recommendedFormat: e.target
                                .value as SlotContentFormat,
                            }))
                          }
                          className="rounded-la-xs border border-white/10 bg-black/60 px-2 py-1 font-la-mono text-[0.625rem] text-la-gold-light"
                        >
                          {(
                            Object.keys(FORMAT_META) as SlotContentFormat[]
                          ).map((f) => (
                            <option key={f} value={f}>
                              {FORMAT_META[f].shortLabel}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-3.5 align-top">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateLibraryTheme(theme.id, (prev) => ({
                                ...prev,
                                isPriorityNextCycle: !prev.isPriorityNextCycle,
                              }))
                            }
                            className={clsx(
                              "rounded-la-xs border px-2 py-0.5 font-la-mono text-[0.5625rem]",
                              theme.isPriorityNextCycle
                                ? "border-sky-400/50 bg-sky-500/15 text-sky-200 font-semibold"
                                : "border-white/10 text-la-text-muted"
                            )}
                          >
                            Prioritário
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateLibraryTheme(theme.id, (prev) => ({
                                ...prev,
                                isSavedForSales: !prev.isSavedForSales,
                              }))
                            }
                            className={clsx(
                              "rounded-la-xs border px-2 py-0.5 font-la-mono text-[0.5625rem]",
                              theme.isSavedForSales
                                ? "border-rose-400/50 bg-rose-500/15 text-rose-200 font-semibold"
                                : "border-white/10 text-la-text-muted"
                            )}
                          >
                            Guardado Vendas
                          </button>

                          {theme.allocatedSlotIds.length > 0 ? (
                            <span className="rounded-la-xs border border-emerald-400/45 bg-emerald-500/15 px-2 py-0.5 font-la-mono text-[0.5625rem] text-emerald-200">
                              Alocado ({theme.allocatedSlotIds.length})
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-3.5 pl-2 text-right align-top">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSubTab("integracao");
                            }}
                            className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                          >
                            Alocar
                          </button>

                          {props.onGoToScriptsTab ? (
                            <button
                              type="button"
                              onClick={() =>
                                props.onGoToScriptsTab?.(
                                  undefined,
                                  theme.title,
                                  theme.recommendedFormat
                                )
                              }
                              className="rounded-la-xs bg-la-gold px-2.5 py-1 font-la-mono text-[0.625rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                            >
                              Roteirizar →
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* SUBÁREA 3: INTEGRAÇÃO SPLIT-SCREEN COM O CALENDÁRIO (SEÇÃO 5 F02)   */}
      {/* =================================================================== */}
      {activeSubTab === "integracao" ? (
        <div className="flex flex-col gap-6">
          {/* Painel Superior de Equilíbrio RETINA, Simulação e Versões (Seção 5.2) */}
          <section className="rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 xl:flex-row xl:items-center">
              <div>
                <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                  SUBÁREA 3 · MESA DE ENCAIXE E EQUILÍBRIO ESTRATÉGICO (SEÇÃO 5.1 E 5.2)
                </span>
                <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                  Integração Direta: Slots do Calendário (F01) ↔ Biblioteca de
                  Temas (F02)
                </h3>
              </div>

              {/* Botões Principais da Seção 5.2: Reequilibrar, Simular e Salvar Versão */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Simular outro cenário"
                  value={simulationScenario}
                  onChange={(e) =>
                    setSimulationScenario(
                      e.target.value as typeof simulationScenario
                    )
                  }
                  className="min-h-[2.375rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-mono text-[0.75rem] text-la-gold-light"
                >
                  <option value="none">
                    Simular Cenário: Distribuição Padrão
                  </option>
                  <option value="more_transformation">
                    Simular: + Transformação, - Engajamento
                  </option>
                  <option value="sales_push">
                    Simular: Intensificação de Vendas / Carrinho Aberto
                  </option>
                  <option value="top_of_funnel">
                    Simular: Crescimento de Audiência / Topo de Funil
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handleAutoRebalanceCalendar}
                  className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Reequilibrar Calendário com IA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSaveVersionModalOpen(true)}
                  className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Versão com Temas</span>
                </button>
              </div>
            </div>

            {/* Mapa de Calor RETINA do Período */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {(Object.keys(RETINA_META) as RetinaTypeKey[]).map((rKey) => {
                const meta = RETINA_META[rKey];
                const cnt = retinaHeatmap.counts[rKey] || 0;
                const pct = Math.round((cnt / retinaHeatmap.total) * 100);
                return (
                  <div
                    key={rKey}
                    className="rounded-la-lg border border-white/8 bg-black/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-la-mono text-[0.625rem] font-bold text-la-text-primary">
                        {meta.code} · {meta.label}
                      </span>
                      <span className="font-la-mono text-[0.6875rem] font-bold text-la-gold-light">
                        {cnt} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-la-full bg-white/10">
                      <div
                        style={{ width: `${Math.min(100, pct * 2)}%` }}
                        className={clsx("h-full", meta.dotClass)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {integrationBanner ? (
              <div className="mt-4 flex items-center justify-between rounded-la-lg border border-emerald-400/45 bg-emerald-950/25 px-4 py-2.5 text-emerald-100">
                <span className="font-la-sans text-[0.8125rem]">
                  {integrationBanner}
                </span>
                <button
                  type="button"
                  onClick={() => setIntegrationBanner(null)}
                  className="text-emerald-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </section>

          {/* MESA SPLIT-SCREEN: COLUNA ESQUERDA (SLOTS F01) | COLUNA DIREITA (BIBLIOTECA F02) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* COLUNA ESQUERDA (7/12): SLOTS DO CALENDÁRIO EDITORIAL COM 3 SUGESTÕES DA IA */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-4">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  COLUNA ESQUERDA · SLOTS DO CALENDÁRIO ({integrationSlots.length})
                </span>

                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: "all", label: "Mês Todo" },
                      { id: "empty_only", label: "Só Sem Tema" },
                      { id: 1, label: "Sem 1" },
                      { id: 2, label: "Sem 2" },
                      { id: 3, label: "Sem 3" },
                      { id: 4, label: "Sem 4" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={String(p.id)}
                      type="button"
                      onClick={() => setIntegrationPeriodFilter(p.id)}
                      className={clsx(
                        "rounded-la-xs border px-2 py-1 font-la-mono text-[0.625rem]",
                        integrationPeriodFilter === p.id
                          ? "border-la-gold bg-la-gold font-bold text-la-text-inverse"
                          : "border-white/10 bg-black/50 text-la-text-secondary"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex max-h-[54rem] flex-col gap-3.5 overflow-y-auto pr-1">
                {integrationSlots.map((slot) => {
                  const fmtMeta = FORMAT_META[slot.format];
                  const retMeta = RETINA_META[slot.retinaType];
                  const FormatIcon = fmtMeta.icon;
                  const hasTheme = Boolean(slot.mainTheme.trim());
                  const isFocused = activeSlotIdForAllocation === slot.id;
                  const aiSuggestions = getRecommendedThemesForSlot(slot);

                  return (
                    <div
                      key={slot.id}
                      onDragOver={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                      }}
                      onDrop={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        if (!draggedThemeId) return;
                        const found = themesLibrary.find(
                          (t) => t.id === draggedThemeId
                        );
                        if (found) {
                          handleAssignThemeToCalendarSlot(slot.id, found);
                        }
                        setDraggedThemeId(null);
                      }}
                      onClick={() => setActiveSlotIdForAllocation(slot.id)}
                      className={clsx(
                        "cursor-pointer rounded-la-xl border border-l-4 p-4 transition-all",
                        retMeta.borderAccentClass,
                        isFocused
                          ? "border-la-gold bg-[#0D1322] shadow-[0_0_24px_rgba(207,169,101,0.18)]"
                          : "border-white/10 bg-[#090D16]/95 hover:border-white/25"
                      )}
                    >
                      {/* Cabeçalho do Slot */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-la-xs bg-white/[0.08] px-2 py-0.5 font-la-mono text-[0.6875rem] font-bold text-la-text-primary">
                            {String(slot.dayNumber).padStart(2, "0")}{" "}
                            {slot.monthShort} · {slot.dayOfWeekLabel}
                          </span>
                          <span className="font-la-mono text-[0.6875rem] text-la-gold-light">
                            {slot.suggestedTime}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-la-xs border border-white/12 bg-black/50 px-2 py-0.5 font-la-mono text-[0.625rem] text-la-text-primary">
                            <FormatIcon className="h-3 w-3 text-la-gold" />
                            <span>{fmtMeta.shortLabel}</span>
                          </span>
                          <span
                            className={clsx(
                              "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.5625rem] font-semibold",
                              retMeta.badgeClass
                            )}
                          >
                            {retMeta.code} · {retMeta.label}
                          </span>
                        </div>

                        <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                          {slot.platforms.join(" + ")}
                        </span>
                      </div>

                      {/* Estado: Tema Atual Vinculado vs. Slot Aguardando Tema */}
                      {hasTheme ? (
                        <div className="mt-3 flex flex-col justify-between gap-3 rounded-la-lg border border-emerald-400/40 bg-emerald-950/20 p-3 sm:flex-row sm:items-center">
                          <div>
                            <span className="font-la-mono text-[0.5625rem] font-bold uppercase text-emerald-300">
                              TEMA SELECIONADO NO SLOT
                            </span>
                            <p className="mt-0.5 font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                              {slot.mainTheme}
                            </p>
                            <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                              Pilar: {slot.editorialPillar}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {props.onGoToScriptsTab ? (
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  props.onGoToScriptsTab?.(
                                    slot.id,
                                    slot.mainTheme,
                                    slot.format
                                  );
                                }}
                                className="rounded-la-md bg-la-gold px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                              >
                                Criar Roteiro →
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleClearSlotTheme(slot.id);
                              }}
                              className="rounded-la-md border border-white/15 bg-black/60 px-2.5 py-1.5 font-la-mono text-[0.625rem] text-la-text-secondary hover:text-red-300"
                            >
                              Trocar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-la-lg border border-dashed border-la-border-gold/45 bg-black/45 p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                              3 Temas Recomendados pela IA para este Slot:
                            </span>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setSuggestionOffsetBySlot((prev) => ({
                                  ...prev,
                                  [slot.id]: (prev[slot.id] || 0) + 1,
                                }));
                              }}
                              className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] text-la-text-secondary hover:text-la-gold-light"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Substituir sugestões</span>
                            </button>
                          </div>

                          <div className="mt-2 flex flex-col gap-1.5">
                            {aiSuggestions.map((sug, idx) => (
                              <div
                                key={sug.id}
                                className="flex items-center justify-between gap-2 rounded-la-md border border-white/8 bg-[#0C101B] px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="font-la-sans text-[0.75rem] font-medium text-la-text-primary">
                                    {idx + 1}. {sug.title}
                                  </p>
                                  <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                                    {sug.retinaType} • {sug.journeyStage} •{" "}
                                    {FORMAT_META[sug.recommendedFormat].shortLabel}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleAssignThemeToCalendarSlot(
                                      slot.id,
                                      sug
                                    );
                                  }}
                                  className="shrink-0 rounded-la-xs bg-la-gold px-2.5 py-1 font-la-mono text-[0.625rem] font-bold text-la-text-inverse hover:bg-la-gold-light"
                                >
                                  Usar este tema
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUNA DIREITA (5/12): BIBLIOTECA DE TEMAS PARA ARRASTAR OU VINCULAR */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                    COLUNA DIREITA · BIBLIOTECA DE TEMAS ({themesLibrary.length})
                  </span>
                  <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                    Arraste para um slot ou clique em Vincular
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <input
                    type="search"
                    placeholder="Buscar tema na biblioteca..."
                    value={libraryFilterInIntegration}
                    onChange={(e) =>
                      setLibraryFilterInIntegration(e.target.value)
                    }
                    className="min-h-[2.375rem] w-full rounded-la-md border border-white/12 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />

                  <label className="inline-flex cursor-pointer items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    <input
                      type="checkbox"
                      checked={onlyCompatibleWithSelectedSlot}
                      onChange={(e) =>
                        setOnlyCompatibleWithSelectedSlot(e.target.checked)
                      }
                      className="accent-[#CFA965]"
                    />
                    <span>
                      Filtrar apenas compatíveis com o slot selecionado à
                      esquerda
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex max-h-[48rem] flex-col gap-2.5 overflow-y-auto pr-1">
                {themesLibrary
                  .filter((t) => {
                    if (t.status === "archived") return false;
                    if (
                      onlyCompatibleWithSelectedSlot &&
                      activeSlotIdForAllocation
                    ) {
                      const focusedSlot = activeCalendarRecord.slots.find(
                        (s) => s.id === activeSlotIdForAllocation
                      );
                      if (
                        focusedSlot &&
                        t.retinaType !== focusedSlot.retinaType
                      ) {
                        return false;
                      }
                    }
                    if (!libraryFilterInIntegration.trim()) return true;
                    return t.title
                      .toLowerCase()
                      .includes(libraryFilterInIntegration.toLowerCase());
                  })
                  .map((theme) => {
                    const retMeta = RETINA_META[theme.retinaType];
                    const targetSlotId =
                      activeSlotIdForAllocation ||
                      integrationSlots.find((s) => !s.mainTheme.trim())?.id ||
                      integrationSlots[0]?.id;

                    return (
                      <div
                        key={theme.id}
                        draggable
                        onDragStart={() => setDraggedThemeId(theme.id)}
                        className="group flex flex-col gap-2 rounded-la-xl border border-white/10 bg-[#0A0E18] p-3.5 transition-all hover:border-la-gold"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-la-text-muted group-hover:text-la-gold" />
                            <p className="font-la-sans text-[0.8125rem] font-semibold leading-[1.4] text-la-text-primary">
                              {theme.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={clsx(
                                "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.5625rem]",
                                retMeta.badgeClass
                              )}
                            >
                              {retMeta.label}
                            </span>
                            <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                              {theme.journeyStage} •{" "}
                              {FORMAT_META[theme.recommendedFormat].shortLabel}
                            </span>
                          </div>

                          {targetSlotId ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleAssignThemeToCalendarSlot(
                                  targetSlotId,
                                  theme
                                )
                              }
                              className="rounded-la-xs border border-la-border-gold/60 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                            >
                              Vincular ao Slot
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Lista de Versões Salvas do Calendário com Temas (Seção 5.2) */}
          {savedCalendarVersions.length > 0 ? (
            <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5">
              <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                VERSÕES SALVAS DO CALENDÁRIO COM TEMAS (HISTÓRICO DE CICLOS)
              </span>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {savedCalendarVersions.map((ver) => (
                  <div
                    key={ver.id}
                    className="rounded-la-lg border border-white/10 bg-black/50 p-3.5"
                  >
                    <h4 className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                      {ver.versionName}
                    </h4>
                    <p className="mt-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                      {ver.periodLabel} • {ver.allocatedCount} slots com tema
                    </p>
                    <span className="mt-1 block font-la-mono text-[0.5625rem] text-la-gold-light">
                      Momento: {ver.businessMomentUsed}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* MODAL: SALVAR VERSÃO DO CALENDÁRIO COM TEMAS (SEÇÃO 5.2)            */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isSaveVersionModalOpen ? (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaveVersionModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[30rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                Salvar Versão do Calendário com Temas
              </h3>
              <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                Guarde esta combinação de slots, temas, tipos RETINA e momento
                do negócio para reutilizar ou comparar resultados.
              </p>

              <form
                onSubmit={handleSaveCalendarThemeVersion}
                className="mt-4 flex flex-col gap-3.5"
              >
                <input
                  type="text"
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  placeholder="Ex.: Calendário – Versão A (Pré-lançamento)"
                  className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                />

                <div className="flex justify-end gap-2.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSaveVersionModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    Salvar Versão
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default TemasEditorialModule;