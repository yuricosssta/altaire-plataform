// FrontEnd/src/components/editorial/workspace/CalendarioEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns,
  Copy,
  ExternalLink,
  FileText,
  Gift,
  Layers,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Play,
  Plus,
  Radio,
  Sliders,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  DarkCustomSelect,
  type CustomSelectOption,
} from "@/components/ui/DarkCustomSelect";

/* ========================================================================== */
/* CONTRATOS E TIPAGENS ESTRITAS DA FUNÇÃO 01 — PARTE 2 (CALENDÁRIO)          */
/* ========================================================================== */

export interface CalendarioEditorialModuleProps {
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
  readonly activeLineName?: string;
  readonly initialView?: "calendar" | "list" | "setup" | "review";
  readonly onGoToLineTab?: () => void;
  readonly onRequestGoToLineEditorial?: () => void;
  readonly onGoToThemesTab?: () => void;
  readonly onRequestGoToThemes?: () => void;
  readonly onGoToScriptsTab?: (slotId?: string, themeTitle?: string) => void;
  readonly onRequestGoToScripts?: (slotId?: string, themeTitle?: string) => void;
}

export type CalendarRecordStatus =
  | "active"
  | "draft"
  | "upcoming"
  | "review_recommended"
  | "expired"
  | "archived";

export type SlotContentFormat =
  | "reel_curto"
  | "video_longo"
  | "carrossel"
  | "post_estatico"
  | "live_semanal"
  | "sequencia_stories";

export type RetinaTypeKey =
  | "Relacionamento"
  | "Engajamento"
  | "Transformacao"
  | "Interacao"
  | "NiveisDeConsciencia"
  | "Autoridade";

export type SlotExecutionStatus =
  | "planned"
  | "in_production"
  | "script_ready"
  | "recorded"
  | "published";

export type CalendarSubViewMode = "month" | "week" | "kanban";

export type IcpAwarenessLevel =
  | "Inconsciente"
  | "Consciente do Problema"
  | "Consciente da Solução"
  | "Consciente do Produto"
  | "Totalmente Consciente";

export interface DailyStoryBlockItem {
  readonly period: "Manhã" | "Almoço" | "Tarde" | "Noite";
  readonly suggestedTime: string;
  readonly storiesCount: number;
  readonly retinaFocus: RetinaTypeKey;
  readonly narrativeDirection: string;
  readonly hasQAndABox: boolean;
}

export interface CalendarSlotItem {
  readonly id: string;
  readonly dateISO: string;
  readonly dayNumber: number;
  readonly monthShort: string;
  readonly weekNumber: 1 | 2 | 3 | 4;
  readonly dayOfWeekIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly dayOfWeekLabel: string;
  readonly provisionalTitle: string;
  readonly format: SlotContentFormat;
  readonly retinaType: RetinaTypeKey;
  readonly platforms: readonly string[];
  readonly suggestedTime: string;
  readonly strategicObjective: string;
  readonly secondaryObjective: string;
  readonly editorialLineName: string;
  readonly editorialPillar: string;
  readonly mainTheme: string;
  readonly aiSuggestedThemes: readonly string[];
  readonly icpPainDesireOrObjection: string;
  readonly icpAwarenessLevel: IcpAwarenessLevel;
  readonly referenceLink: string;
  readonly executionNotes: string;
  readonly status: SlotExecutionStatus;
  readonly eligibleForComplementaryMaterial: boolean;
  readonly complementaryMaterialType: string;
  readonly storySequencesBreakdown?: readonly DailyStoryBlockItem[];
}

export interface EditorialCalendarRecord {
  readonly id: string;
  readonly name: string;
  readonly status: CalendarRecordStatus;
  readonly periodLabel: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly mainObjective: string;
  readonly linkedLineName: string;
  readonly platforms: readonly string[];
  readonly weeklyCapacity: {
    readonly reels: number;
    readonly longVideos: number;
    readonly carousels: number;
    readonly staticPosts: number;
    readonly lives: number;
    readonly dailyStorySequences: number;
    readonly storiesPerSequence: number;
  };
  readonly updatedAt: string;
  readonly reviewSuggestions: readonly {
    readonly id: string;
    readonly title: string;
    readonly reason: string;
    readonly actionLabel: string;
    readonly applied: boolean;
  }[];
  readonly slots: readonly CalendarSlotItem[];
}

/* ========================================================================== */
/* METADADOS VISUAIS DE FORMATOS, CORES RETINA E STATUS DE EXECUÇÃO           */
/* ========================================================================== */

export const FORMAT_META: Record<
  SlotContentFormat,
  {
    readonly label: string;
    readonly shortLabel: string;
    readonly icon: typeof Video;
    readonly badgeClass: string;
  }
> = {
  reel_curto: {
    label: "Reel / Vídeo Curto",
    shortLabel: "Reel",
    icon: Play,
    badgeClass: "border-la-border-gold/55 bg-la-gold-faint text-la-gold-light",
  },
  video_longo: {
    label: "Vídeo Longo (YouTube)",
    shortLabel: "Vídeo Longo",
    icon: Video,
    badgeClass: "border-sky-400/45 bg-sky-500/15 text-sky-200",
  },
  carrossel: {
    label: "Carrossel 4:5",
    shortLabel: "Carrossel",
    icon: Columns,
    badgeClass: "border-purple-400/45 bg-purple-500/15 text-purple-200",
  },
  post_estatico: {
    label: "Post Estático",
    shortLabel: "Estático",
    icon: LayoutGrid,
    badgeClass: "border-white/20 bg-white/[0.07] text-la-text-primary",
  },
  live_semanal: {
    label: "Live Semanal",
    shortLabel: "Live",
    icon: Radio,
    badgeClass: "border-rose-400/50 bg-rose-500/15 text-rose-200",
  },
  sequencia_stories: {
    label: "Sequências Diárias de Stories",
    shortLabel: "Stories (3-4 seq)",
    icon: MessageSquare,
    badgeClass: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
  },
};

export const RETINA_META: Record<
  RetinaTypeKey,
  {
    readonly code: string;
    readonly label: string;
    readonly purpose: string;
    readonly badgeClass: string;
    readonly dotClass: string;
    readonly borderAccentClass: string;
  }
> = {
  Relacionamento: {
    code: "R",
    label: "Relacionamento",
    purpose: "Conexão humana, visão de mundo, bastidores e rotina real.",
    badgeClass: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
    dotClass: "bg-emerald-400",
    borderAccentClass: "border-l-emerald-400",
  },
  Engajamento: {
    code: "E",
    label: "Engajamento",
    purpose: "Atração de audiência qualificada, compartilhamento e alcance.",
    badgeClass: "border-sky-400/50 bg-sky-500/15 text-sky-200",
    dotClass: "bg-sky-400",
    borderAccentClass: "border-l-sky-400",
  },
  Transformacao: {
    code: "T",
    label: "Transformação",
    purpose: "Ensino prático aplicável, salvamentos e vitória rápida para o ICP.",
    badgeClass: "border-la-gold bg-la-gold/20 text-la-gold-light",
    dotClass: "bg-la-gold",
    borderAccentClass: "border-l-la-gold",
  },
  Interacao: {
    code: "I",
    label: "Interação",
    purpose: "Diálogo ativo, enquetes diagnósticas, caixinhas Q&A e direct.",
    badgeClass: "border-purple-400/50 bg-purple-500/15 text-purple-200",
    dotClass: "bg-purple-400",
    borderAccentClass: "border-l-purple-400",
  },
  NiveisDeConsciencia: {
    code: "N",
    label: "Níveis de Consciência",
    purpose: "Quebra de objeções, mudança de crença e preparação para compra.",
    badgeClass: "border-amber-400/55 bg-amber-500/15 text-amber-200",
    dotClass: "bg-amber-400",
    borderAccentClass: "border-l-amber-400",
  },
  Autoridade: {
    code: "A",
    label: "Autoridade",
    purpose: "Prova técnica, método proprietário (MUV), estudos de caso e tese.",
    badgeClass: "border-rose-400/55 bg-rose-500/15 text-rose-200",
    dotClass: "bg-rose-400",
    borderAccentClass: "border-l-rose-400",
  },
};

export const SLOT_STATUS_META: Record<
  SlotExecutionStatus,
  {
    readonly label: string;
    readonly badgeClass: string;
  }
> = {
  planned: {
    label: "Planejado",
    badgeClass: "border-white/15 bg-white/[0.05] text-la-text-secondary",
  },
  in_production: {
    label: "Em Produção",
    badgeClass: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  },
  script_ready: {
    label: "Roteiro Pronto",
    badgeClass: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  },
  recorded: {
    label: "Gravado",
    badgeClass: "border-purple-400/50 bg-purple-500/15 text-purple-200",
  },
  published: {
    label: "Publicado",
    badgeClass: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  },
};

const WEEKDAY_HEADERS: readonly {
  readonly index: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly short: string;
  readonly full: string;
}[] = [
  { index: 0, short: "SEG", full: "Segunda-feira" },
  { index: 1, short: "TER", full: "Terça-feira" },
  { index: 2, short: "QUA", full: "Quarta-feira" },
  { index: 3, short: "QUI", full: "Quinta-feira" },
  { index: 4, short: "SEX", full: "Sexta-feira" },
  { index: 5, short: "SÁB", full: "Sábado" },
  { index: 6, short: "DOM", full: "Domingo" },
];

const AVAILABLE_PILLARS: readonly string[] = [
  "01. Visão de Mundo & Quebra de Mitos do Mercado",
  "02. Diagnóstico dos Erros Invisíveis do ICP",
  "03. Mecanismo Único da Oferta (MUV em Ação)",
  "04. Educação Prática & Transformação Aplicável",
  "05. Bastidores da Execução & Provas Reais",
  "06. Superação de Objeções & Condução para Oferta",
];

const AVAILABLE_PLATFORMS: readonly string[] = [
  "Instagram",
  "YouTube",
  "TikTok",
  "LinkedIn",
];

const PERIOD_OBJECTIVES: readonly string[] = [
  "Apoiar um lançamento ou campanha de vendas",
  "Aquecer audiência para abertura de carrinho",
  "Reforçar autoridade e domínio técnico",
  "Aumentar audiência qualificada (Topo/Meio)",
  "Aumentar relacionamento e retenção da base",
  "Melhorar engajamento e conversas no Direct",
];

const PERIOD_DURATION_LABELS: readonly string[] = [
  "2 semanas (Sprint de Aquecimento / Campanha)",
  "4 semanas planejadas (28 dias)",
  "4 semanas de aquecimento (1 mês)",
  "6 semanas (Ciclo de Lançamento Completo)",
  "8 semanas (Operação Contínua Bimestral)",
];

/* ========================================================================== */
/* OPÇÕES CANÔNICAS PARA O DARKCUSTOMSELECT                                   */
/* ========================================================================== */

const FORMAT_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | SlotContentFormat
>[] = [
  { value: "all", label: "Todos os formatos (6)" },
  { value: "reel_curto", label: "Reels / Vídeos Curtos" },
  { value: "video_longo", label: "Vídeos Longos (YouTube)" },
  { value: "carrossel", label: "Carrosséis 4:5" },
  { value: "post_estatico", label: "Posts Estáticos" },
  { value: "live_semanal", label: "Lives Semanais" },
  { value: "sequencia_stories", label: "Sequências de Stories" },
];

const SLOT_FORMAT_OPTIONS: readonly CustomSelectOption<SlotContentFormat>[] = (
  Object.keys(FORMAT_META) as SlotContentFormat[]
).map((fKey) => ({
  value: fKey,
  label: FORMAT_META[fKey].label,
  badge: FORMAT_META[fKey].shortLabel,
}));

const SLOT_FORMAT_SHORT_OPTIONS: readonly CustomSelectOption<SlotContentFormat>[] =
  (Object.keys(FORMAT_META) as SlotContentFormat[]).map((fKey) => ({
    value: fKey,
    label: FORMAT_META[fKey].shortLabel,
  }));

const RETINA_SELECT_OPTIONS: readonly CustomSelectOption<RetinaTypeKey>[] = (
  Object.keys(RETINA_META) as RetinaTypeKey[]
).map((rKey) => ({
  value: rKey,
  label: `${RETINA_META[rKey].code} · ${RETINA_META[rKey].label}`,
  hint: RETINA_META[rKey].purpose,
}));

const SLOT_STATUS_OPTIONS: readonly CustomSelectOption<SlotExecutionStatus>[] =
  (Object.keys(SLOT_STATUS_META) as SlotExecutionStatus[]).map((stKey) => ({
    value: stKey,
    label: SLOT_STATUS_META[stKey].label,
  }));

const PILLAR_SELECT_OPTIONS: readonly CustomSelectOption<string>[] =
  AVAILABLE_PILLARS.map((pil) => ({
    value: pil,
    label: pil,
  }));

const AWARENESS_LEVEL_OPTIONS: readonly CustomSelectOption<IcpAwarenessLevel>[] =
  [
    { value: "Inconsciente", label: "Inconsciente" },
    { value: "Consciente do Problema", label: "Consciente do Problema" },
    { value: "Consciente da Solução", label: "Consciente da Solução" },
    { value: "Consciente do Produto", label: "Consciente do Produto" },
    { value: "Totalmente Consciente", label: "Totalmente Consciente" },
  ];

const PERIOD_OBJECTIVE_OPTIONS: readonly CustomSelectOption<string>[] =
  PERIOD_OBJECTIVES.map((obj) => ({
    value: obj,
    label: obj,
  }));

const PERIOD_DURATION_OPTIONS: readonly CustomSelectOption<string>[] =
  PERIOD_DURATION_LABELS.map((dur) => ({
    value: dur,
    label: dur,
  }));

/* ========================================================================== */
/* GERADOR DE GRADE MENSAL COMPLETA (28 DIAS REAIS — 4 SEMANAS CANÔNICAS)     */
/* ========================================================================== */

function generateCanonicalMonthSlots(
  niche: string,
  subniche: string,
  lineName: string
): CalendarSlotItem[] {
  const slots: CalendarSlotItem[] = [];

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const dayNumber = 2 + dayOffset;
    const dateISO = `2026-11-${String(dayNumber).padStart(2, "0")}`;
    const weekNumber = (Math.floor(dayOffset / 7) + 1) as 1 | 2 | 3 | 4;
    const dayOfWeekIndex = (dayOffset % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const dayOfWeekLabel = WEEKDAY_HEADERS[dayOfWeekIndex].full;

    // Segunda: Reel de Engajamento + Carrossel de Transformação
    if (dayOfWeekIndex === 0) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Mito #${weekNumber} que trava resultados em ${subniche || niche}`,
        format: "reel_curto",
        retinaType: "Engajamento",
        platforms: ["Instagram", "TikTok"],
        suggestedTime: "12:00",
        strategicObjective:
          "Atrair audiência qualificada quebrando uma crença comum",
        secondaryObjective:
          "Gerar compartilhamentos e novos seguidores no perfil",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[0],
        mainTheme:
          weekNumber <= 2
            ? `Por que repetir o padrão tradicional de ${niche} drena sua margem`
            : "",
        aiSuggestedThemes: [
          `Por que repetir o padrão tradicional de ${niche} drena sua margem`,
          `O erro invisível que 90% cometem ao iniciar em ${subniche}`,
          `A verdade que ninguém fala sobre velocidade vs. direção em ${niche}`,
        ],
        icpPainDesireOrObjection:
          "Mito de que volume bruto sem direção estratégica gera resultado consistente.",
        icpAwarenessLevel: "Consciente do Problema",
        referenceLink: "https://instagram.com/p/exemplo-reel-contraste",
        executionNotes:
          "Abrir nos primeiros 3 segundos com afirmação contraintuitiva. Ritmo dinâmico e CTA final para ler a legenda.",
        status:
          weekNumber === 1
            ? "published"
            : weekNumber === 2
              ? "script_ready"
              : "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });

      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-2`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Passo a passo estrutural: Matriz de decisão em ${subniche}`,
        format: "carrossel",
        retinaType: "Transformacao",
        platforms: ["Instagram", "LinkedIn"],
        suggestedTime: "19:00",
        strategicObjective:
          "Gerar salvamentos qualificados e provar competência técnica",
        secondaryObjective: "Educar o comprador sobre o método proprietário (MUV)",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[3],
        mainTheme:
          weekNumber === 1
            ? `Como diagnosticar gargalos operacionais em ${subniche} em 15 minutos`
            : "",
        aiSuggestedThemes: [
          `Como diagnosticar gargalos operacionais em ${subniche} em 15 minutos`,
          `Os 5 critérios técnicos para validar uma decisão em ${niche}`,
          `Guia visual: do improviso ao controle previsível em 4 etapas`,
        ],
        icpPainDesireOrObjection:
          "Desejo de ter um método prático e aplicável que caiba na rotina real.",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "https://instagram.com/p/exemplo-carrossel-transformacao",
        executionNotes:
          "Carrossel de 8 a 10 lâminas (4:5). Lâmina 1 com promessa clara, lâminas 2-8 com framework prático, lâmina final com CTA de salvamento e material complementar.",
        status: weekNumber === 1 ? "published" : "in_production",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Checklist / Diagnóstico PDF Prático",
      });
    }

    // Terça: Reel de Transformação + Post Estático de Interação
    if (dayOfWeekIndex === 1) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Ajuste imediato para destravar sua operação de ${subniche}`,
        format: "reel_curto",
        retinaType: "Transformacao",
        platforms: ["Instagram", "TikTok"],
        suggestedTime: "12:30",
        strategicObjective: "Entregar vitória rápida acionável para o ICP",
        secondaryObjective: "Aumentar taxa de salvamento e autoridade prática",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[3],
        mainTheme: `3 ajustes práticos em ${subniche} que reduzem o retrabalho pela metade`,
        aiSuggestedThemes: [
          `3 ajustes práticos em ${subniche} que reduzem o retrabalho pela metade`,
          `Como corrigir a falha número 1 de execução em ${niche}`,
          `O protocolo de 10 minutos para validar sua estratégia semanal`,
        ],
        icpPainDesireOrObjection:
          "Dor da falta de tempo operacional e excesso de tarefas sem retorno.",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "",
        executionNotes:
          "Gravar em ambiente de trabalho real mostrando tela ou quadro branco.",
        status: weekNumber === 1 ? "recorded" : "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });

      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-2`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Enquete de Diagnóstico: Qual é o seu maior gargalo hoje?`,
        format: "post_estatico",
        retinaType: "Interacao",
        platforms: ["Instagram"],
        suggestedTime: "18:30",
        strategicObjective:
          "Gerar comentários qualificados e mapear objeções no Direct",
        secondaryObjective: "Identificar leads prontos para abordagem consultiva",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[1],
        mainTheme: `Diagnóstico comparativo: Operador Amador vs. Estrategista em ${niche}`,
        aiSuggestedThemes: [
          `Diagnóstico comparativo: Operador Amador vs. Estrategista em ${niche}`,
          `Qual dessas 3 travas mais impede seu avanço hoje? Comente o número`,
          `Matriz comparativa: Improviso Diário vs. Sistema Editorial`,
        ],
        icpPainDesireOrObjection:
          "Dúvida sobre em qual estágio o próprio negócio está travado.",
        icpAwarenessLevel: "Consciente do Problema",
        referenceLink: "",
        executionNotes:
          "Arte estática em alto contraste Dark/Gold com chamada direta para comentar.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });
    }

    // Quarta: Vídeo Longo de Transformação + Carrossel de Autoridade
    if (dayOfWeekIndex === 2) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Aula Profunda #${weekNumber}: A Engenharia Completa do Método em ${subniche}`,
        format: "video_longo",
        retinaType: "Transformacao",
        platforms: ["YouTube"],
        suggestedTime: "17:00",
        strategicObjective:
          "Aprofundar nível de consciência e demonstrar domínio técnico absoluto",
        secondaryObjective:
          "Gerar leads altamente qualificados para a oferta principal",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[2],
        mainTheme: `Como estruturar o Mecanismo Único de ${subniche} do zero até a conversão`,
        aiSuggestedThemes: [
          `Como estruturar o Mecanismo Único de ${subniche} do zero até a conversão`,
          `Masterclass: Por que métodos comuns falham em ${niche} e como blindar sua operação`,
          `Análise completa de caso real: Da estagnação à previsibilidade em 30 dias`,
        ],
        icpPainDesireOrObjection:
          "Objeção: 'Meu subnicho é técnico demais, preciso ver profundidade real antes de confiar.'",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "https://youtube.com/watch?v=exemplo-aula-magna",
        executionNotes:
          "Vídeo de 14 a 20 minutos estruturado em: Gancho de retenção (0-45s), Problema Estrutural, Mecanismo Único (3 pilares), Aplicação Prática e CTA para material complementar / aplicação.",
        status: weekNumber === 1 ? "script_ready" : "planned",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Planilha Executiva / Mapa Mental da Aula",
      });

      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-2`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Estudo de Caso & Bastidor Técnico: Decisões sob pressão`,
        format: "carrossel",
        retinaType: "Autoridade",
        platforms: ["Instagram", "LinkedIn"],
        suggestedTime: "20:00",
        strategicObjective:
          "Reforçar autoridade incontestável com prova lógica e técnica",
        secondaryObjective: "Apoiar o vídeo longo publicado no YouTube",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[4],
        mainTheme: `Análise de bastidor: Os 4 indicadores que definem o sucesso em ${subniche}`,
        aiSuggestedThemes: [
          `Análise de bastidor: Os 4 indicadores que definem o sucesso em ${subniche}`,
          `O que aprendemos analisando dezenas de operações reais de ${niche}`,
          `Raio-X Técnico: Como tomamos decisões estratégicas sem depender de sorte`,
        ],
        icpPainDesireOrObjection:
          "Desejo de aprender com quem realmente executa no campo de batalha.",
        icpAwarenessLevel: "Consciente do Produto",
        referenceLink: "",
        executionNotes: "Conectar o último slide ao vídeo longo do YouTube.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });
    }

    // Quinta: Reel de Nível de Consciência + Post Estático de Relacionamento
    if (dayOfWeekIndex === 3) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Quebra de Objeção Crítica: O custo invisível de adiar sua estrutura`,
        format: "reel_curto",
        retinaType: "NiveisDeConsciencia",
        platforms: ["Instagram", "TikTok"],
        suggestedTime: "12:00",
        strategicObjective:
          "Quebrar objeção de tempo/rotina e preparar para a oferta",
        secondaryObjective:
          "Levar o lead de Consciente da Solução para Consciente do Produto",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[5],
        mainTheme:
          weekNumber <= 2
            ? `"Não tenho tempo para estruturar ${subniche}" — Como resolver isso em 1 hora por semana`
            : "",
        aiSuggestedThemes: [
          `"Não tenho tempo para estruturar ${subniche}" — Como resolver isso em 1 hora por semana`,
          `Por que esperar o "momento ideal" custa caro demais em ${niche}`,
          `A diferença entre gastar energia no improviso e investir em um sistema`,
        ],
        icpPainDesireOrObjection:
          "Objeção: 'Minha rotina é corrida demais, não vou dar conta de aplicar.'",
        icpAwarenessLevel: "Consciente do Produto",
        referenceLink: "",
        executionNotes:
          "Tom direto, firme e empático. Mostrar que a falta de tempo é consequência da falta de método.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });

      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-2`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Visão de Mundo & Princípios: O que não negociamos na nossa operação`,
        format: "post_estatico",
        retinaType: "Relacionamento",
        platforms: ["Instagram"],
        suggestedTime: "19:30",
        strategicObjective:
          "Gerar identificação profunda por valores e visão de mundo",
        secondaryObjective: "Afastar curiosos que buscam atalhos rasos",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[0],
        mainTheme: `Por que recusamos atalhos superficiais em ${niche} e priorizamos fundação sólida`,
        aiSuggestedThemes: [
          `Por que recusamos atalhos superficiais em ${niche} e priorizamos fundação sólida`,
          `3 princípios inegociáveis para quem constrói autoridade de longo prazo`,
          `Carta aberta para profissionais que cansaram do teatro digital`,
        ],
        icpPainDesireOrObjection:
          "Desejo de pertencer a um grupo de alto nível com valores sérios.",
        icpAwarenessLevel: "Consciente da Solução",
        referenceLink: "",
        executionNotes: "Fotografia autoral ou tipografia editorial limpa.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });
    }

    // Sexta: Live Semanal + Carrossel de Autoridade
    if (dayOfWeekIndex === 4) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Live Semanal #${weekNumber}: Consultoria Ao Vivo & Quebra de Travas`,
        format: "live_semanal",
        retinaType: "Autoridade",
        platforms: ["Instagram", "YouTube"],
        suggestedTime: "20:00",
        strategicObjective:
          "Interagir ao vivo, demonstrar repertório e conduzir para a oferta",
        secondaryObjective: "Responder objeções reais da audiência em tempo real",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[5],
        mainTheme: `Análise Ao Vivo: Destravando o planejamento de ${subniche} para o próximo mês`,
        aiSuggestedThemes: [
          `Análise Ao Vivo: Destravando o planejamento de ${subniche} para o próximo mês`,
          `Live de Aquecimento: Os 3 pilares da oferta e como aplicar no seu caso`,
          `Perguntas & Respostas Estratégicas: Diagnóstico de operações ao vivo`,
        ],
        icpPainDesireOrObjection:
          "Objeção: 'Será que esse método funciona especificamente para o meu modelo?'",
        icpAwarenessLevel: "Totalmente Consciente",
        referenceLink: "",
        executionNotes:
          "Duração prevista: 45 a 60 min. Abrir com tese central de 15 min e abrir para 3 análises ao vivo + pitch consultivo.",
        status: "planned",
        eligibleForComplementaryMaterial: true,
        complementaryMaterialType: "Resumo Executivo da Live + Diagnóstico",
      });

      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-2`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Síntese Executiva da Semana: O que separa o plano da execução`,
        format: "carrossel",
        retinaType: "Autoridade",
        platforms: ["Instagram", "LinkedIn"],
        suggestedTime: "13:00",
        strategicObjective:
          "Consolidar a tese da semana e convidar para a Live das 20h",
        secondaryObjective:
          "Gerar salvamentos e lembretes para a transmissão ao vivo",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[2],
        mainTheme: `O mapa mental completo para dominar ${subniche} sem improviso`,
        aiSuggestedThemes: [
          `O mapa mental completo para dominar ${subniche} sem improviso`,
          `5 lições práticas dos bastidores desta semana em ${niche}`,
          `Prepare-se para a Live de hoje às 20h: Os pontos que vamos destrinchar`,
        ],
        icpPainDesireOrObjection:
          "Desejo de ter clareza visual de todo o sistema antes de dar o próximo passo.",
        icpAwarenessLevel: "Consciente do Produto",
        referenceLink: "",
        executionNotes:
          "Último slide com chamada direta para ativar o lembrete da Live das 20h.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });
    }

    // Sábado: Reel de Relacionamento
    if (dayOfWeekIndex === 5) {
      slots.push({
        id: `slot-w${weekNumber}-d${dayNumber}-1`,
        dateISO,
        dayNumber,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        provisionalTitle: `Bastidores Reais & Visão de Longo Prazo em ${niche}`,
        format: "reel_curto",
        retinaType: "Relacionamento",
        platforms: ["Instagram"],
        suggestedTime: "11:30",
        strategicObjective:
          "Humanizar o especialista e gerar conexão com o estilo de vida/trabalho",
        secondaryObjective:
          "Manter proximidade no fim de semana sem perder posicionamento",
        editorialLineName: lineName,
        editorialPillar: AVAILABLE_PILLARS[4],
        mainTheme: `O que acontece nos bastidores de uma operação de ${subniche} organizada`,
        aiSuggestedThemes: [
          `O que acontece nos bastidores de uma operação de ${subniche} organizada`,
          `Reflexão de sábado: O verdadeiro preço da falta de direção estratégica`,
          `Como reviso meus indicadores da semana em 20 minutos`,
        ],
        icpPainDesireOrObjection:
          "Desejo de ter paz mental e controle sobre o negócio sem trabalhar 16h/dia no caos.",
        icpAwarenessLevel: "Consciente do Problema",
        referenceLink: "",
        executionNotes: "Formato mais conversacional e próximo.",
        status: "planned",
        eligibleForComplementaryMaterial: false,
        complementaryMaterialType: "Nenhum",
      });
    }

    // Sequências Diárias de Stories (Seg a Dom)
    const dailyStoriesCount =
      dayOfWeekIndex === 2 || dayOfWeekIndex === 4 ? 4 : 3;

    slots.push({
      id: `slot-w${weekNumber}-d${dayNumber}-stories`,
      dateISO,
      dayNumber,
      monthShort: "Nov",
      weekNumber,
      dayOfWeekIndex,
      dayOfWeekLabel,
      provisionalTitle: `${dailyStoriesCount} Sequências de Stories do Dia (${dailyStoriesCount * 5} stories)`,
      format: "sequencia_stories",
      retinaType:
        dayOfWeekIndex === 4
          ? "NiveisDeConsciencia"
          : dayOfWeekIndex === 6
            ? "Relacionamento"
            : "Interacao",
      platforms: ["Instagram"],
      suggestedTime: "08:30 • 12:30 • 16:30 • 20:30",
      strategicObjective:
        dayOfWeekIndex === 6
          ? "Rotina, conexão genuína, abertura de caixinha e antecipação da nova semana"
          : "Sustentar narrativa fracionada ao longo do dia (Manhã, Almoço, Tarde e Noite)",
      secondaryObjective:
        "Gerar respostas no Direct, enquetes qualificadoras e retenção diária",
      editorialLineName: lineName,
      editorialPillar:
        AVAILABLE_PILLARS[dayOfWeekIndex % AVAILABLE_PILLARS.length],
      mainTheme: `Narrativa Diária de Stories — ${dayOfWeekLabel} (Semana ${weekNumber})`,
      aiSuggestedThemes: [
        `Sequência de Diagnóstico + Bastidor Real + Caixinha de Dúvidas em ${subniche}`,
        `Estudo de Caso Fracionado em 4 Blocos + Enquete de Qualificação`,
        `Quebra de Objeção do Dia + Prova Social + Chamada para Direct`,
      ],
      icpPainDesireOrObjection:
        "Manter o comprador aquecido diariamente combinando relacionamento, prova e interação.",
      icpAwarenessLevel: "Consciente da Solução",
      referenceLink: "",
      executionNotes:
        "Seguir o modelo canônico: 3 a 4 sequências no dia, com 4 a 5 stories encadeados em cada sequência.",
      status: weekNumber === 1 && dayOfWeekIndex <= 2 ? "published" : "planned",
      eligibleForComplementaryMaterial: false,
      complementaryMaterialType: "Nenhum",
      storySequencesBreakdown: [
        {
          period: "Manhã",
          suggestedTime: "08:30",
          storiesCount: 5,
          retinaFocus: "Relacionamento",
          narrativeDirection:
            "Abertura do dia com ritual de trabalho, visão de mundo e contextualização do tema central (5 stories).",
          hasQAndABox: false,
        },
        {
          period: "Almoço",
          suggestedTime: "12:30",
          storiesCount: 4,
          retinaFocus: "Transformacao",
          narrativeDirection:
            "Bastidor técnico de execução + micro-lição prática aplicável com enquete diagnóstica (4 stories).",
          hasQAndABox: false,
        },
        {
          period: "Tarde",
          suggestedTime: "16:30",
          storiesCount: 5,
          retinaFocus: "Autoridade",
          narrativeDirection:
            "Prova real, análise de caso ou resposta aprofundada de caixinha conectada ao MUV (5 stories).",
          hasQAndABox: true,
        },
        {
          period: "Noite",
          suggestedTime: "20:30",
          storiesCount: 4,
          retinaFocus: "NiveisDeConsciencia",
          narrativeDirection:
            "Fechamento reflexivo, quebra de objeção silenciosa e convite para interação/Direct (4 stories).",
          hasQAndABox: true,
        },
      ],
    });
  }

  return slots;
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: CalendarioEditorialModule                            */
/* ========================================================================== */

export function CalendarioEditorialModule(
  props: CalendarioEditorialModuleProps
) {
  const resolvedProjectId = props.projectId || "proj-default";
  const resolvedNiche =
    props.projectNiche || props.niche || "Finanças & Investimentos";
  const resolvedSubniche =
    props.projectSubniche || props.subniche || "Algorithmic Trading";
  const resolvedObjective =
    props.projectObjective || props.currentObjective || "Conversão";
  const resolvedPhase = props.currentPhase || "Aquecimento — Semana 2 de 4";
  const hasActiveLine = props.hasActiveLine ?? true;
  const activeLineName =
    props.activeLineName || "Linha Editorial v1 — Base Estratégica";

  const handleTriggerGoToLine = useCallback(() => {
    if (props.onGoToLineTab) {
      props.onGoToLineTab();
    } else if (props.onRequestGoToLineEditorial) {
      props.onRequestGoToLineEditorial();
    }
  }, [props.onGoToLineTab, props.onRequestGoToLineEditorial]);

  const handleTriggerGoToThemes = useCallback(() => {
    if (props.onGoToThemesTab) {
      props.onGoToThemesTab();
    } else if (props.onRequestGoToThemes) {
      props.onRequestGoToThemes();
    }
  }, [props.onGoToThemesTab, props.onRequestGoToThemes]);

  const handleTriggerGoToScripts = useCallback(
    (slotId?: string, themeTitle?: string) => {
      if (props.onGoToScriptsTab) {
        props.onGoToScriptsTab(slotId, themeTitle);
      } else if (props.onRequestGoToScripts) {
        props.onRequestGoToScripts(slotId, themeTitle);
      }
    },
    [props.onGoToScriptsTab, props.onRequestGoToScripts]
  );

  const storageKey = `la-calendario-editorial-v2-${resolvedProjectId}`;
  const sharedSlotsKey = `la-shared-calendar-slots-${resolvedProjectId}`;

  /* Estado dos Calendários do Projeto */
  const [calendars, setCalendars] = useState<readonly EditorialCalendarRecord[]>(
    () => [
      {
        id: "cal-nov-2026",
        name: `Calendário Editorial — ${resolvedPhase}`,
        status: "active",
        periodLabel: "4 semanas planejadas (28 dias)",
        periodStart: "02/11/2026",
        periodEnd: "29/11/2026",
        mainObjective: PERIOD_OBJECTIVES[0],
        linkedLineName: activeLineName,
        platforms: ["Instagram", "YouTube", "TikTok", "LinkedIn"],
        weeklyCapacity: {
          reels: 4,
          longVideos: 1,
          carousels: 3,
          staticPosts: 2,
          lives: 1,
          dailyStorySequences: 4,
          storiesPerSequence: 5,
        },
        updatedAt: "Sincronizado hoje",
        reviewSuggestions: [
          {
            id: "rev-1",
            title: "Aumentar conteúdos de Transformação nas terças e quartas",
            reason:
              "Conteúdos práticos de Transformação estão gerando o maior volume de salvamentos qualificados do ciclo.",
            actionLabel: "Aplicar reforço de Transformação",
            applied: false,
          },
          {
            id: "rev-2",
            title:
              "Elevar peso de Níveis de Consciência e Autoridade na Semana 3 e 4",
            reason:
              "Com a aproximação do momento de conversão, é recomendável intensificar a quebra de objeções.",
            actionLabel: "Equilibrar Semanas 3 e 4",
            applied: false,
          },
          {
            id: "rev-3",
            title:
              "Preencher os slots restantes que ainda estão sem tema principal",
            reason:
              "Existem slots na primeira e segunda semana com espaço aberto para vincular temas da Biblioteca Estratégica.",
            actionLabel: "Vincular Temas Recomendados",
            applied: false,
          },
        ],
        slots: generateCanonicalMonthSlots(
          resolvedNiche,
          resolvedSubniche,
          activeLineName
        ),
      },
    ]
  );

  const [selectedCalendarId, setSelectedCalendarId] =
    useState<string>("cal-nov-2026");

  /* Controle de Telas da Subfunção */
  const [viewMode, setViewMode] = useState<
    "calendar" | "list" | "setup" | "review"
  >(props.initialView || "calendar");

  /* Modo de visualização do Calendário */
  const [calendarSubView, setCalendarSubView] =
    useState<CalendarSubViewMode>("month");

  /* Filtros da Grade do Calendário */
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<
    "all" | 1 | 2 | 3 | 4
  >("all");
  const [activeWeekInWeeklyView, setActiveWeekInWeeklyView] = useState<
    1 | 2 | 3 | 4
  >(1);
  const [formatFilter, setFormatFilter] = useState<"all" | SlotContentFormat>(
    "all"
  );
  const [retinaFilter, setRetinaFilter] = useState<"all" | RetinaTypeKey>("all");
  const [showDailyStoriesInGrid, setShowDailyStoriesInGrid] =
    useState<boolean>(true);

  /* Estado do Drawer 360° do Slot */
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  /* Modal de Criar Novo Slot */
  const [addingSlotForDate, setAddingSlotForDate] = useState<{
    readonly dateISO: string;
    readonly dayNumber: number;
    readonly weekNumber: 1 | 2 | 3 | 4;
    readonly dayOfWeekIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    readonly dayOfWeekLabel: string;
  } | null>(null);
  const [newSlotTitle, setNewSlotTitle] = useState<string>("");
  const [newSlotFormat, setNewSlotFormat] =
    useState<SlotContentFormat>("reel_curto");
  const [newSlotRetina, setNewSlotRetina] =
    useState<RetinaTypeKey>("Transformacao");
  const [newSlotTime, setNewSlotTime] = useState<string>("18:00");

  /* Criação de Novo Calendário */
  const [newCalName, setNewCalName] = useState<string>("");
  const [newCalPeriodLabel, setNewCalPeriodLabel] = useState<string>(
    "4 semanas de aquecimento (1 mês)"
  );
  const [newCalStart, setNewCalStart] = useState<string>("01/12/2026");
  const [newCalEnd, setNewCalEnd] = useState<string>("28/12/2026");
  const [newCalObjective, setNewCalObjective] = useState<string>(
    PERIOD_OBJECTIVES[0]
  );

  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving">(
    "saved"
  );

  /* Carrega do localStorage */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as EditorialCalendarRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCalendars(parsed);
          setSelectedCalendarId(parsed[0]?.id || "cal-nov-2026");
        }
      }
    } catch {
      /* Ignora erro de storage */
    }
  }, [storageKey]);

  const persistCalendars = useCallback(
    (nextCalendars: readonly EditorialCalendarRecord[]) => {
      setAutosaveStatus("saving");
      setCalendars(nextCalendars);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextCalendars));
        const activeCal = nextCalendars[0];
        if (activeCal) {
          window.localStorage.setItem(
            sharedSlotsKey,
            JSON.stringify(activeCal.slots)
          );
        }
        setTimeout(() => setAutosaveStatus("saved"), 240);
      } catch {
        setAutosaveStatus("saved");
      }
    },
    [storageKey, sharedSlotsKey]
  );

  const currentCalendar = useMemo(() => {
    const fallback: EditorialCalendarRecord = calendars[0] ?? {
      id: "cal-fallback",
      name: `Calendário Editorial — ${resolvedPhase}`,
      status: "active",
      periodLabel: "4 semanas planejadas (28 dias)",
      periodStart: "02/11/2026",
      periodEnd: "29/11/2026",
      mainObjective: PERIOD_OBJECTIVES[0],
      linkedLineName: activeLineName,
      platforms: ["Instagram", "YouTube"],
      weeklyCapacity: {
        reels: 4,
        longVideos: 1,
        carousels: 2,
        staticPosts: 2,
        lives: 1,
        dailyStorySequences: 4,
        storiesPerSequence: 5,
      },
      updatedAt: "Hoje",
      reviewSuggestions: [],
      slots: [],
    };
    return (
      calendars.find((c) => c.id === selectedCalendarId) ??
      calendars.find((c) => c.status === "active") ??
      fallback
    );
  }, [calendars, selectedCalendarId, resolvedPhase, activeLineName]);

  const updateSlotById = useCallback(
    (slotId: string, updater: (prev: CalendarSlotItem) => CalendarSlotItem) => {
      const next = calendars.map((cal) => {
        if (cal.id !== currentCalendar.id) return cal;
        return {
          ...cal,
          updatedAt: "Salvo automaticamente agora",
          slots: cal.slots.map((s) => (s.id === slotId ? updater(s) : s)),
        };
      });
      persistCalendars(next);
    },
    [calendars, currentCalendar.id, persistCalendars]
  );

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return (
      currentCalendar.slots.find((s) => s.id === selectedSlotId) ?? null
    );
  }, [currentCalendar.slots, selectedSlotId]);

  const calendarMetrics = useMemo(() => {
    const allSlots = currentCalendar.slots;
    const feedSlots = allSlots.filter((s) => s.format !== "sequencia_stories");
    const storiesDays = allSlots.filter(
      (s) => s.format === "sequencia_stories"
    );
    const withoutTheme = feedSlots.filter((s) => !s.mainTheme.trim()).length;
    const readyOrPublished = allSlots.filter(
      (s) =>
        s.status === "script_ready" ||
        s.status === "recorded" ||
        s.status === "published"
    ).length;
    const eligibleMaterials = allSlots.filter(
      (s) => s.eligibleForComplementaryMaterial
    ).length;

    return {
      totalSlots: allSlots.length,
      feedSlotsCount: feedSlots.length,
      storiesDaysCount: storiesDays.length,
      withoutTheme,
      readyOrPublished,
      eligibleMaterials,
    };
  }, [currentCalendar.slots]);

  const calendarDaysMatrix = useMemo(() => {
    const days: {
      readonly dayNumber: number;
      readonly dateISO: string;
      readonly monthShort: string;
      readonly weekNumber: 1 | 2 | 3 | 4;
      readonly dayOfWeekIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      readonly dayOfWeekLabel: string;
      readonly isToday: boolean;
      readonly slots: CalendarSlotItem[];
    }[] = [];

    for (let offset = 0; offset < 28; offset++) {
      const dayNumber = 2 + offset;
      const dateISO = `2026-11-${String(dayNumber).padStart(2, "0")}`;
      const weekNumber = (Math.floor(offset / 7) + 1) as 1 | 2 | 3 | 4;
      const dayOfWeekIndex = (offset % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const dayOfWeekLabel = WEEKDAY_HEADERS[dayOfWeekIndex].full;

      const daySlots = currentCalendar.slots.filter((s) => {
        if (s.dayNumber !== dayNumber) return false;
        if (!showDailyStoriesInGrid && s.format === "sequencia_stories") {
          return false;
        }
        if (formatFilter !== "all" && s.format !== formatFilter) {
          return false;
        }
        if (retinaFilter !== "all" && s.retinaType !== retinaFilter) {
          return false;
        }
        return true;
      });

      days.push({
        dayNumber,
        dateISO,
        monthShort: "Nov",
        weekNumber,
        dayOfWeekIndex,
        dayOfWeekLabel,
        isToday: dayNumber === 9,
        slots: daySlots,
      });
    }

    if (selectedWeekFilter !== "all") {
      return days.filter((d) => d.weekNumber === selectedWeekFilter);
    }
    return days;
  }, [
    currentCalendar.slots,
    selectedWeekFilter,
    showDailyStoriesInGrid,
    formatFilter,
    retinaFilter,
  ]);

  const handleAddSlotToDay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingSlotForDate) return;

    const formatMeta = FORMAT_META[newSlotFormat];
    const newSlot: CalendarSlotItem = {
      id: `slot-custom-${Date.now()}`,
      dateISO: addingSlotForDate.dateISO,
      dayNumber: addingSlotForDate.dayNumber,
      monthShort: "Nov",
      weekNumber: addingSlotForDate.weekNumber,
      dayOfWeekIndex: addingSlotForDate.dayOfWeekIndex,
      dayOfWeekLabel: addingSlotForDate.dayOfWeekLabel,
      provisionalTitle:
        newSlotTitle.trim() ||
        `${formatMeta.shortLabel} de ${RETINA_META[newSlotRetina].label} — ${addingSlotForDate.dayOfWeekLabel}`,
      format: newSlotFormat,
      retinaType: newSlotRetina,
      platforms:
        newSlotFormat === "video_longo" ? ["YouTube"] : ["Instagram"],
      suggestedTime: newSlotTime || "18:00",
      strategicObjective: RETINA_META[newSlotRetina].purpose,
      secondaryObjective: `Apoiar ${currentCalendar.mainObjective}`,
      editorialLineName: currentCalendar.linkedLineName,
      editorialPillar: AVAILABLE_PILLARS[0],
      mainTheme: newSlotTitle.trim(),
      aiSuggestedThemes: [
        `Como evitar o erro invisível de ${resolvedSubniche}`,
        `O método passo a passo para gerar previsibilidade em ${resolvedNiche}`,
        `Estudo prático: o que diferencia amadores de profissionais em ${resolvedSubniche}`,
      ],
      icpPainDesireOrObjection:
        "Dor ou objeção prioritária mapeada na Base Estratégica do projeto.",
      icpAwarenessLevel: "Consciente da Solução",
      referenceLink: "",
      executionNotes: "Slot adicionado diretamente na grade do calendário.",
      status: "planned",
      eligibleForComplementaryMaterial:
        newSlotFormat === "carrossel" || newSlotFormat === "video_longo",
      complementaryMaterialType:
        newSlotFormat === "carrossel" || newSlotFormat === "video_longo"
          ? "Checklist / Resumo Executivo PDF"
          : "Nenhum",
    };

    const next = calendars.map((cal) =>
      cal.id === currentCalendar.id
        ? { ...cal, slots: [...cal.slots, newSlot] }
        : cal
    );
    persistCalendars(next);
    setAddingSlotForDate(null);
    setNewSlotTitle("");
    setSelectedSlotId(newSlot.id);
  };

  const handleDeleteSlot = (slotId: string) => {
    const next = calendars.map((cal) =>
      cal.id === currentCalendar.id
        ? { ...cal, slots: cal.slots.filter((s) => s.id !== slotId) }
        : cal
    );
    persistCalendars(next);
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
  };

  const handleCreateNewCalendar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const created: EditorialCalendarRecord = {
      id: `cal-${Date.now()}`,
      name:
        newCalName.trim() || `Calendário Editorial — ${newCalPeriodLabel}`,
      status: "active",
      periodLabel: newCalPeriodLabel,
      periodStart: newCalStart,
      periodEnd: newCalEnd,
      mainObjective: newCalObjective,
      linkedLineName: activeLineName,
      platforms: currentCalendar.platforms,
      weeklyCapacity: { ...currentCalendar.weeklyCapacity },
      updatedAt: "Criado agora",
      reviewSuggestions: currentCalendar.reviewSuggestions,
      slots: generateCanonicalMonthSlots(
        resolvedNiche,
        resolvedSubniche,
        activeLineName
      ),
    };

    const next = [
      created,
      ...calendars.map((c) =>
        c.status === "active" ? { ...c, status: "archived" as const } : c
      ),
    ];
    persistCalendars(next);
    setSelectedCalendarId(created.id);
    setNewCalName("");
    setViewMode("calendar");
  };

  const handleDuplicateCalendar = (cal: EditorialCalendarRecord) => {
    const dup: EditorialCalendarRecord = {
      ...cal,
      id: `cal-dup-${Date.now()}`,
      name: `${cal.name} (Cópia)`,
      status: "draft",
      updatedAt: "Duplicado agora",
      slots: cal.slots.map((s) => ({ ...s, id: `${s.id}-copy-${Date.now()}` })),
    };
    persistCalendars([dup, ...calendars]);
    setSelectedCalendarId(dup.id);
  };

  const handleApplyReviewSuggestion = (suggestionId: string) => {
    const next = calendars.map((cal) => {
      if (cal.id !== currentCalendar.id) return cal;
      return {
        ...cal,
        reviewSuggestions: cal.reviewSuggestions.map((r) =>
          r.id === suggestionId ? { ...r, applied: true } : r
        ),
        slots:
          suggestionId === "rev-3"
            ? cal.slots.map((s) =>
                !s.mainTheme.trim() && s.aiSuggestedThemes[0]
                  ? { ...s, mainTheme: s.aiSuggestedThemes[0] }
                  : s
              )
            : cal.slots,
      };
    });
    persistCalendars(next);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* =================================================================== */}
      {/* AVISO SE NÃO HOUVER LINHA EDITORIAL ATIVA                           */}
      {/* =================================================================== */}
      {!hasActiveLine ? (
        <section className="flex flex-col justify-between gap-4 rounded-la-xl border border-amber-400/50 bg-amber-950/25 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <h3 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                Antes de planejar, defina sua Linha Editorial.
              </h3>
              <p className="mt-0.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                O calendário deve ser sustentado por uma Linha Editorial ativa
                para que a IA distribua formatos, frequência, objetivos e
                matriz RETINA com precisão estratégica.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerGoToLine}
            className="shrink-0 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
          >
            Ir para Linha Editorial
          </button>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CABEÇALHO SUPERIOR DO CALENDÁRIO EDITORIAL                          */}
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
                <CalendarIcon className="h-3.5 w-3.5 text-la-gold" />
                <span>
                  FUNÇÃO 01 · PARTE 2 — CALENDÁRIO EDITORIAL EXECUTÁVEL
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>
                  {autosaveStatus === "saving"
                    ? "Sincronizando agenda..."
                    : `${currentCalendar.periodStart} → ${currentCalendar.periodEnd}`}
                </span>
              </span>
            </div>

            <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
              {currentCalendar.name}
            </h2>
            <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
              Linha associada:{" "}
              <strong className="text-la-gold-light">
                {currentCalendar.linkedLineName}
              </strong>{" "}
              • Objetivo:{" "}
              <strong className="text-la-text-primary">
                {currentCalendar.mainObjective}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTriggerGoToThemes}
              className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
            >
              <Lightbulb className="h-4 w-4" />
              <span>
                Integrar Temas ({calendarMetrics.withoutTheme} sem tema)
              </span>
            </button>

            {/* CORRIGIDO: Ícone <Plus /> preservado e removido o "+" textual duplicado */}
            <button
              type="button"
              onClick={() => setViewMode("setup")}
              className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Novo Calendário / Capacidade</span>
            </button>
          </div>
        </div>

        {/* Navegação entre os 4 Ambientes */}
        <div className="mt-4 flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/55 p-1.5">
            {[
              {
                id: "calendar" as const,
                label: "1. Grade do Calendário Real",
                icon: CalendarIcon,
              },
              {
                id: "setup" as const,
                label: "2. Período & Capacidade Real",
                icon: Sliders,
              },
              {
                id: "review" as const,
                label: `3. Revisão Mensal IA (${currentCalendar.reviewSuggestions.filter((r) => !r.applied).length})`,
                icon: Sparkles,
              },
              {
                id: "list" as const,
                label: `4. Histórico de Calendários (${calendars.length})`,
                icon: Layers,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={clsx(
                    "inline-flex min-h-[2.25rem] items-center gap-2 rounded-la-md px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-medium transition-all",
                    active
                      ? "bg-la-gold font-semibold text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.28)]"
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

          <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-secondary">
            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2.5 py-1">
              <strong className="text-la-text-primary">
                {currentCalendar.weeklyCapacity.reels}
              </strong>{" "}
              Reels/sem
            </span>
            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2.5 py-1">
              <strong className="text-la-text-primary">
                {currentCalendar.weeklyCapacity.carousels}
              </strong>{" "}
              Carrosséis/sem
            </span>
            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2.5 py-1">
              <strong className="text-la-text-primary">
                {currentCalendar.weeklyCapacity.longVideos}
              </strong>{" "}
              Vídeo Longo/sem
            </span>
            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2.5 py-1">
              <strong className="text-la-text-primary">
                {currentCalendar.weeklyCapacity.lives}
              </strong>{" "}
              Live/sem
            </span>
            <span className="rounded-la-xs border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-emerald-200">
              <strong>
                {currentCalendar.weeklyCapacity.dailyStorySequences} seq
              </strong>{" "}
              Stories/dia
            </span>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* AMBIENTE 1: O CALENDÁRIO EDITORIAL REAL                             */}
      {/* =================================================================== */}
      {viewMode === "calendar" ? (
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/60 p-1">
                {[
                  {
                    id: "month" as const,
                    label: "Calendário Mensal (Com Datas)",
                    icon: CalendarIcon,
                  },
                  {
                    id: "week" as const,
                    label: "Visão Semanal Detalhada",
                    icon: Columns,
                  },
                  {
                    id: "kanban" as const,
                    label: "Quadro Operacional (Notion / Cards)",
                    icon: LayoutGrid,
                  },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const active = calendarSubView === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setCalendarSubView(mode.id)}
                      className={clsx(
                        "inline-flex min-h-[2.125rem] items-center gap-2 rounded-la-md px-3 py-1 font-la-sans text-[0.75rem] font-semibold transition-all",
                        active
                          ? "bg-la-gold text-la-text-inverse"
                          : "text-la-text-secondary hover:text-la-text-primary"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-muted">
                  Período:
                </span>
                {(
                  [
                    { id: "all", label: "Mês Completo (02 Nov - 29 Nov)" },
                    { id: 1, label: "Semana 1 (02-08 Nov)" },
                    { id: 2, label: "Semana 2 (09-15 Nov)" },
                    { id: 3, label: "Semana 3 (16-22 Nov)" },
                    { id: 4, label: "Semana 4 (23-29 Nov)" },
                  ] as const
                ).map((w) => {
                  const active =
                    calendarSubView === "week"
                      ? activeWeekInWeeklyView === w.id
                      : selectedWeekFilter === w.id;
                  return (
                    <button
                      key={String(w.id)}
                      type="button"
                      onClick={() => {
                        if (calendarSubView === "week") {
                          if (w.id !== "all") setActiveWeekInWeeklyView(w.id);
                        } else {
                          setSelectedWeekFilter(w.id);
                        }
                      }}
                      className={clsx(
                        "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.6875rem] transition-colors",
                        active
                          ? "border-la-gold bg-la-gold-faint font-semibold text-la-gold-light"
                          : "border-white/10 bg-black/45 text-la-text-secondary hover:border-white/25"
                      )}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-white/8 pt-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                  Matriz RETINA:
                </span>
                <button
                  type="button"
                  onClick={() => setRetinaFilter("all")}
                  className={clsx(
                    "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.625rem]",
                    retinaFilter === "all"
                      ? "border-la-gold bg-la-gold font-bold text-la-text-inverse"
                      : "border-white/12 bg-black/50 text-la-text-secondary"
                  )}
                >
                  Todos (6)
                </button>
                {(Object.keys(RETINA_META) as RetinaTypeKey[]).map((rKey) => {
                  const r = RETINA_META[rKey];
                  const active = retinaFilter === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() =>
                        setRetinaFilter((prev) =>
                          prev === rKey ? "all" : rKey
                        )
                      }
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.625rem] transition-all",
                        active
                          ? `${r.badgeClass} font-bold ring-1 ring-white/40`
                          : "border-white/10 bg-black/40 text-la-text-secondary hover:border-white/25"
                      )}
                    >
                      <span
                        className={clsx("h-2 w-2 rounded-full", r.dotClass)}
                      />
                      <span>
                        {r.code} · {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* SELECT 1: Filtro de Formato com DarkCustomSelect */}
                <div className="min-w-[15rem]">
                  <DarkCustomSelect
                    fullWidth
                    align="right"
                    value={formatFilter}
                    options={FORMAT_FILTER_OPTIONS}
                    onChange={(val) =>
                      setFormatFilter(val as "all" | SlotContentFormat)
                    }
                    ariaLabel="Filtrar por formato"
                  />
                </div>

                <label className="inline-flex min-h-[2.625rem] cursor-pointer items-center gap-1.5 rounded-la-md border border-white/10 bg-black/50 px-3 py-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <input
                    type="checkbox"
                    checked={showDailyStoriesInGrid}
                    onChange={(e) =>
                      setShowDailyStoriesInGrid(e.target.checked)
                    }
                    className="accent-[#CFA965]"
                  />
                  <span>Exibir Bloco Diário de Stories</span>
                </label>
              </div>
            </div>
          </section>

          {/* SUB-VISÃO 1: GRADE MENSAL REAL */}
          {calendarSubView === "month" ? (
            <section className="overflow-x-auto rounded-la-xl border border-white/12 bg-[#070A10] shadow-2xl">
              <div className="min-w-[68rem]">
                <div className="grid grid-cols-7 border-b border-white/12 bg-[#0C101B]">
                  {WEEKDAY_HEADERS.map((wd) => (
                    <div
                      key={wd.index}
                      className="flex items-center justify-between border-r border-white/8 px-3.5 py-3 last:border-r-0"
                    >
                      <span className="font-la-mono text-[0.75rem] font-bold tracking-[0.08em] text-la-gold-light">
                        {wd.short}
                      </span>
                      <span className="font-la-sans text-[0.6875rem] text-la-text-muted">
                        {wd.full.split("-")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 divide-x divide-y divide-white/10">
                  {calendarDaysMatrix.map((day) => {
                    const feedSlots = day.slots.filter(
                      (s) => s.format !== "sequencia_stories"
                    );
                    const storySlot = day.slots.find(
                      (s) => s.format === "sequencia_stories"
                    );

                    return (
                      <div
                        key={day.dateISO}
                        className={clsx(
                          "flex min-h-[14.5rem] flex-col justify-between p-2.5 transition-colors",
                          day.isToday
                            ? "bg-la-gold/[0.06] ring-1 ring-inset ring-la-gold/60"
                            : "bg-[#080B12]/90 hover:bg-[#0B0F1A]"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-white/8 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={clsx(
                                  "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-la-xs px-1.5 font-la-mono text-[0.75rem] font-bold",
                                  day.isToday
                                    ? "bg-la-gold text-la-text-inverse"
                                    : "bg-white/[0.07] text-la-text-primary"
                                )}
                              >
                                {String(day.dayNumber).padStart(2, "0")}
                              </span>
                              <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                                {day.monthShort}
                              </span>
                              {day.isToday ? (
                                <span className="rounded-la-full bg-la-gold/25 px-1.5 py-0.2 font-la-mono text-[0.5625rem] font-bold text-la-gold-light">
                                  HOJE
                                </span>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setAddingSlotForDate({
                                  dateISO: day.dateISO,
                                  dayNumber: day.dayNumber,
                                  weekNumber: day.weekNumber,
                                  dayOfWeekIndex: day.dayOfWeekIndex,
                                  dayOfWeekLabel: day.dayOfWeekLabel,
                                })
                              }
                              title={`Adicionar slot em ${day.dayNumber} ${day.monthShort}`}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-la-xs border border-white/10 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-col gap-2">
                            {feedSlots.map((slot) => {
                              const fmt = FORMAT_META[slot.format];
                              const ret = RETINA_META[slot.retinaType];
                              const st = SLOT_STATUS_META[slot.status];
                              const FormatIcon = fmt.icon;
                              const hasTheme = Boolean(slot.mainTheme.trim());

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  className={clsx(
                                    "group/slot flex w-full flex-col gap-1.5 rounded-la-md border border-white/10 border-l-2 bg-[#0D121F]/95 p-2 text-left transition-all hover:border-la-gold hover:shadow-[0_6px_20px_rgba(0,0,0,0.65)]",
                                    ret.borderAccentClass,
                                    selectedSlotId === slot.id &&
                                      "ring-2 ring-la-gold"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] font-semibold text-la-text-primary">
                                      <FormatIcon className="h-3 w-3 text-la-gold" />
                                      <span>{fmt.shortLabel}</span>
                                    </span>
                                    <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                                      {slot.suggestedTime}
                                    </span>
                                  </div>

                                  <p className="line-clamp-2 font-la-sans text-[0.75rem] font-medium leading-[1.3] text-la-text-primary group-hover/slot:text-la-gold-light">
                                    {hasTheme
                                      ? slot.mainTheme
                                      : slot.provisionalTitle}
                                  </p>

                                  <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                                    <span
                                      className={clsx(
                                        "rounded-la-full border px-1.5 py-0.2 font-la-mono text-[0.5625rem] font-semibold",
                                        ret.badgeClass
                                      )}
                                    >
                                      {ret.code} · {ret.label}
                                    </span>

                                    {!hasTheme ? (
                                      <span className="rounded-la-xs border border-amber-400/45 bg-amber-500/15 px-1.5 py-0.2 font-la-mono text-[0.5rem] font-semibold text-amber-200">
                                        Sem tema
                                      </span>
                                    ) : (
                                      <span
                                        className={clsx(
                                          "rounded-la-xs border px-1.5 py-0.2 font-la-mono text-[0.5rem]",
                                          st.badgeClass
                                        )}
                                      >
                                        {st.label}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {storySlot ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSlotId(storySlot.id)}
                            className={clsx(
                              "mt-2 flex w-full items-center justify-between gap-1.5 rounded-la-md border border-emerald-400/35 bg-emerald-950/25 px-2 py-1.5 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-950/45",
                              selectedSlotId === storySlot.id &&
                                "ring-2 ring-emerald-400"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 shrink-0 text-emerald-300" />
                              <span className="truncate font-la-mono text-[0.625rem] font-semibold text-emerald-200">
                                {storySlot.storySequencesBreakdown?.length || 4}{" "}
                                seq. Stories
                              </span>
                            </div>
                            <span className="shrink-0 font-la-mono text-[0.5625rem] text-emerald-300/80">
                              M·A·T·N
                            </span>
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* SUB-VISÃO 2: VISÃO SEMANAL DETALHADA */}
          {calendarSubView === "week" ? (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-la-xl border border-white/10 bg-[#0B0F1A] px-5 py-3">
                <button
                  type="button"
                  disabled={activeWeekInWeeklyView === 1}
                  onClick={() =>
                    setActiveWeekInWeeklyView(
                      (prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-3 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Semana Anterior</span>
                </button>

                <div className="text-center">
                  <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-gold-light">
                    VISÃO SEMANAL PROFUNDA
                  </span>
                  <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                    Semana {activeWeekInWeeklyView} de 4 — Novembro 2026
                  </h3>
                </div>

                <button
                  type="button"
                  disabled={activeWeekInWeeklyView === 4}
                  onClick={() =>
                    setActiveWeekInWeeklyView(
                      (prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-3 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary disabled:opacity-40"
                >
                  <span>Próxima Semana</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
                {currentCalendar.slots
                  .filter((s) => s.weekNumber === activeWeekInWeeklyView)
                  .reduce<
                    {
                      dayNumber: number;
                      dayOfWeekLabel: string;
                      dateISO: string;
                      slots: CalendarSlotItem[];
                    }[]
                  >((acc, slot) => {
                    const existing = acc.find(
                      (d) => d.dayNumber === slot.dayNumber
                    );
                    if (existing) {
                      existing.slots.push(slot);
                    } else {
                      acc.push({
                        dayNumber: slot.dayNumber,
                        dayOfWeekLabel: slot.dayOfWeekLabel,
                        dateISO: slot.dateISO,
                        slots: [slot],
                      });
                    }
                    return acc;
                  }, [])
                  .map((dayGroup) => (
                    <div
                      key={dayGroup.dateISO}
                      className="flex flex-col gap-3 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-3.5"
                    >
                      <div className="border-b border-white/10 pb-2">
                        <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                          {dayGroup.dayOfWeekLabel.split("-")[0]}
                        </span>
                        <span className="block font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                          {String(dayGroup.dayNumber).padStart(2, "0")} de
                          Novembro
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {dayGroup.slots.map((slot) => {
                          const fmt = FORMAT_META[slot.format];
                          const ret = RETINA_META[slot.retinaType];
                          const FormatIcon = fmt.icon;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={clsx(
                                "flex flex-col gap-1.5 rounded-la-lg border border-white/10 border-l-2 bg-[#0C101B] p-3 text-left transition-all hover:border-la-gold",
                                ret.borderAccentClass
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] font-bold text-la-gold-light">
                                  <FormatIcon className="h-3.5 w-3.5" />
                                  <span>{fmt.shortLabel}</span>
                                </span>
                                <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                                  {slot.suggestedTime.split("•")[0]}
                                </span>
                              </div>

                              <p className="font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
                                {slot.mainTheme || slot.provisionalTitle}
                              </p>

                              <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                                Objetivo: {slot.strategicObjective}
                              </span>

                              <div className="mt-1 flex items-center justify-between border-t border-white/8 pt-1.5">
                                <span
                                  className={clsx(
                                    "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.5625rem]",
                                    ret.badgeClass
                                  )}
                                >
                                  {ret.label}
                                </span>
                                <span className="font-la-mono text-[0.5625rem] text-la-gold-light">
                                  Abrir 360° →
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ) : null}

          {/* SUB-VISÃO 3: QUADRO OPERACIONAL KANBAN */}
          {calendarSubView === "kanban" ? (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {(
                [
                  "planned",
                  "in_production",
                  "script_ready",
                  "recorded",
                  "published",
                ] as SlotExecutionStatus[]
              ).map((stKey) => {
                const stMeta = SLOT_STATUS_META[stKey];
                const columnSlots = currentCalendar.slots.filter((s) => {
                  if (s.status !== stKey) return false;
                  if (
                    selectedWeekFilter !== "all" &&
                    s.weekNumber !== selectedWeekFilter
                  ) {
                    return false;
                  }
                  if (formatFilter !== "all" && s.format !== formatFilter) {
                    return false;
                  }
                  if (retinaFilter !== "all" && s.retinaType !== retinaFilter) {
                    return false;
                  }
                  return true;
                });

                return (
                  <div
                    key={stKey}
                    className="flex flex-col gap-3 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span
                        className={clsx(
                          "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.6875rem] font-semibold",
                          stMeta.badgeClass
                        )}
                      >
                        {stMeta.label}
                      </span>
                      <span className="font-la-mono text-[0.75rem] font-bold text-la-text-muted">
                        {columnSlots.length}
                      </span>
                    </div>

                    <div className="flex max-h-[38rem] flex-col gap-2.5 overflow-y-auto pr-1">
                      {columnSlots.map((slot) => {
                        const fmt = FORMAT_META[slot.format];
                        const ret = RETINA_META[slot.retinaType];
                        const FormatIcon = fmt.icon;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className="cursor-pointer rounded-la-lg border border-white/10 bg-[#0C101B] p-3 transition-all hover:border-la-gold"
                          >
                            <div className="flex items-center justify-between font-la-mono text-[0.625rem] text-la-text-muted">
                              <span>
                                {String(slot.dayNumber).padStart(2, "0")}{" "}
                                {slot.monthShort} ·{" "}
                                {slot.dayOfWeekLabel.split("-")[0]}
                              </span>
                              <span>{slot.suggestedTime.split("•")[0]}</span>
                            </div>

                            <div className="mt-1.5 flex items-center gap-1.5">
                              <FormatIcon className="h-3.5 w-3.5 text-la-gold" />
                              <span className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light">
                                {fmt.shortLabel}
                              </span>
                            </div>

                            <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                              {slot.mainTheme || slot.provisionalTitle}
                            </p>

                            <p className="mt-1 line-clamp-1 font-la-mono text-[0.625rem] text-la-text-secondary">
                              {slot.editorialPillar}
                            </p>

                            <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2">
                              <span
                                className={clsx(
                                  "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.5625rem]",
                                  ret.badgeClass
                                )}
                              >
                                {ret.label}
                              </span>

                              {slot.eligibleForComplementaryMaterial ? (
                                <span className="inline-flex items-center gap-1 font-la-mono text-[0.5625rem] text-la-gold-light">
                                  <Gift className="h-3 w-3" />
                                  <span>Ativo Extra</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* AMBIENTE 2: CONFIGURAÇÃO DE PERÍODO E CAPACIDADE REAL (TELA 1 E 2)  */}
      {/* =================================================================== */}
      {viewMode === "setup" ? (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              TELA 1 E 2 DA FUNÇÃO 01 · CAPACIDADE REAL DE PRODUÇÃO
            </span>
            <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
              Disponibilidade, Objetivo e Limites Reais da Operação
            </h3>
            <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
              O calendário editorial não pode ser construído em fantasia. Ajuste
              o objetivo estratégico do ciclo atual e quantas peças de cada
              formato você realmente consegue sustentar por semana.
            </p>

            {/* Seletores DarkCustomSelect de Período e Objetivo Estratégico na Capacidade Ativa */}
            <div className="mt-4 grid grid-cols-1 gap-3.5 rounded-la-lg border border-la-border-gold/35 bg-black/55 p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  Período Planejado do Calendário Ativo
                </span>
                <DarkCustomSelect
                  fullWidth
                  value={currentCalendar.periodLabel}
                  options={PERIOD_DURATION_OPTIONS}
                  onChange={(nextPeriod) => {
                    const next = calendars.map((cal) =>
                      cal.id === currentCalendar.id
                        ? { ...cal, periodLabel: nextPeriod }
                        : cal
                    );
                    persistCalendars(next);
                  }}
                  ariaLabel="Selecionar duração do período ativo"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  Objetivo Estratégico do Período Ativo
                </span>
                <DarkCustomSelect
                  fullWidth
                  align="right"
                  value={currentCalendar.mainObjective}
                  options={PERIOD_OBJECTIVE_OPTIONS}
                  onChange={(nextObjective) => {
                    const next = calendars.map((cal) =>
                      cal.id === currentCalendar.id
                        ? { ...cal, mainObjective: nextObjective }
                        : cal
                    );
                    persistCalendars(next);
                  }}
                  ariaLabel="Selecionar objetivo estratégico do período ativo"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  key: "reels" as const,
                  label: "Quantos Reels por semana",
                  desc: "Vídeos curtos de Engajamento, Transformação e Consciência",
                },
                {
                  key: "longVideos" as const,
                  label: "Quantos Vídeos Longos por semana",
                  desc: "YouTube / Aulas densas de Transformação e Autoridade",
                },
                {
                  key: "carousels" as const,
                  label: "Quantos Carrosséis por semana",
                  desc: "Sequências de slides 4:5 para salvamento e método",
                },
                {
                  key: "staticPosts" as const,
                  label: "Quantos Posts Estáticos por semana",
                  desc: "Peças de síntese visual, interação e visão de mundo",
                },
                {
                  key: "lives" as const,
                  label: "Quantas Lives Semanais",
                  desc: "Transmissões ao vivo de autoridade e quebra de objeções",
                },
                {
                  key: "dailyStorySequences" as const,
                  label: "Sequências Diárias de Stories (3 a 4/dia)",
                  desc: "Com 4 a 5 stories encadeados em cada sequência",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-la-lg border border-white/10 bg-black/50 p-4"
                >
                  <label className="block font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    {item.label}
                  </label>
                  <span className="mt-0.5 block font-la-sans text-[0.75rem] text-la-text-secondary">
                    {item.desc}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={currentCalendar.weeklyCapacity[item.key]}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      const next = calendars.map((cal) =>
                        cal.id === currentCalendar.id
                          ? {
                              ...cal,
                              weeklyCapacity: {
                                ...cal.weeklyCapacity,
                                [item.key]: val,
                              },
                            }
                          : cal
                      );
                      persistCalendars(next);
                    }}
                    className="mt-3 min-h-[2.5rem] w-full rounded-la-md border border-white/14 bg-black/70 px-3 font-la-mono text-[1rem] font-bold text-la-gold-light"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-la-xl border border-la-border-gold/50 bg-[#080B12]/95 p-6 lg:col-span-5">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              NOVO CICLO DE AGENDA
            </span>
            <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
              Criar Novo Calendário para Outro Período
            </h3>

            <form
              onSubmit={handleCreateNewCalendar}
              className="mt-4 flex flex-col gap-3.5"
            >
              <div className="flex flex-col gap-1">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Nome do Calendário
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Calendário Dezembro — Campanha de Conversão"
                  value={newCalName}
                  onChange={(e) => setNewCalName(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>

              {/* SELECT 2A: Duração / Ciclo do Novo Período com DarkCustomSelect */}
              <div className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Duração / Ciclo do Período
                </span>
                <DarkCustomSelect
                  fullWidth
                  value={newCalPeriodLabel}
                  options={PERIOD_DURATION_OPTIONS}
                  onChange={setNewCalPeriodLabel}
                  ariaLabel="Selecionar duração do novo calendário"
                />
              </div>

              {/* SELECT 2B: Objetivo Estratégico do Período com DarkCustomSelect */}
              <div className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Objetivo Estratégico do Período
                </span>
                <DarkCustomSelect
                  fullWidth
                  value={newCalObjective}
                  options={PERIOD_OBJECTIVE_OPTIONS}
                  onChange={setNewCalObjective}
                  ariaLabel="Selecionar objetivo estratégico do período"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Início do Período
                  </label>
                  <input
                    type="text"
                    value={newCalStart}
                    onChange={(e) => setNewCalStart(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Fim do Período
                  </label>
                  <input
                    type="text"
                    value={newCalEnd}
                    onChange={(e) => setNewCalEnd(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-la-md bg-la-gold px-5 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
              >
                <Sparkles className="h-4 w-4" />
                <span>Gerar Grade Completa do Novo Período</span>
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* AMBIENTE 3: REVISÃO MENSAL DA IA (TELA 5 DA FUNÇÃO 01)              */}
      {/* =================================================================== */}
      {viewMode === "review" ? (
        <section className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
          <div>
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              INFRAESTRUTURA VIVA · REVISÃO PERIÓDICA RECOMENDADA PELA IA
            </span>
            <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
              Diagnóstico de Equilíbrio e Sugestões de Ajuste da Agenda
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {currentCalendar.reviewSuggestions.map((sug) => (
              <div
                key={sug.id}
                className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0B0F1A] p-5"
              >
                <div>
                  <span
                    className={clsx(
                      "inline-flex rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase",
                      sug.applied
                        ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-200"
                        : "border-la-gold/60 bg-la-gold-faint text-la-gold-light"
                    )}
                  >
                    {sug.applied ? "Ajuste Aplicado" : "Recomendação da IA"}
                  </span>
                  <h4 className="mt-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {sug.title}
                  </h4>
                  <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                    {sug.reason}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={sug.applied}
                  onClick={() => handleApplyReviewSuggestion(sug.id)}
                  className={clsx(
                    "mt-4 inline-flex min-h-[2.375rem] w-full items-center justify-center gap-1.5 rounded-la-md px-3.5 py-2 font-la-sans text-[0.8125rem] font-semibold transition-all",
                    sug.applied
                      ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                      : "bg-la-gold text-la-text-inverse hover:bg-la-gold-light"
                  )}
                >
                  {sug.applied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Aplicado na Grade</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{sug.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* AMBIENTE 4: HISTÓRICO E DUPLICAÇÃO DE CALENDÁRIOS (TELA 1 E 5)      */}
      {/* =================================================================== */}
      {viewMode === "list" ? (
        <section className="flex flex-col gap-4">
          {calendars.map((cal) => (
            <article
              key={cal.id}
              className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:flex-row lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {cal.name}
                  </h3>
                  <span className="rounded-la-full border border-la-gold bg-la-gold px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase text-la-text-inverse">
                    {cal.status === "active"
                      ? "ATIVO"
                      : "RASCUNHO / HISTÓRICO"}
                  </span>
                </div>
                <p className="mt-1 font-la-mono text-[0.75rem] text-la-text-secondary">
                  {cal.periodLabel} • {cal.periodStart} → {cal.periodEnd} •{" "}
                  {cal.slots.length} slots planejados
                </p>
                <p className="mt-1 font-la-sans text-[0.8125rem] text-la-gold-light">
                  Objetivo: {cal.mainObjective}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCalendarId(cal.id);
                    setViewMode("calendar");
                  }}
                  className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                >
                  Abrir Calendário
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateCalendar(cal)}
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 bg-black/50 px-3.5 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicar para Outro Período</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* DRAWER LATERAL 360° DO SLOT (COM DARKCUSTOMSELECT EM TODOS CAMPOS)  */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedSlot ? (
          <div className="fixed inset-0 z-[180] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlotId(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes completos do slot do calendário"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative z-10 flex h-full w-full max-w-[44rem] flex-col justify-between overflow-y-auto border-l border-la-border-gold/55 bg-[#090D16] p-6 shadow-[-24px_0_64px_rgba(0,0,0,0.92)]"
            >
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-la-full border border-la-border-gold/60 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                        PAINEL 360° DO SLOT · FUNÇÃO 01
                      </span>
                      <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                        {String(selectedSlot.dayNumber).padStart(2, "0")}{" "}
                        {selectedSlot.monthShort} 2026 •{" "}
                        {selectedSlot.dayOfWeekLabel} (Semana{" "}
                        {selectedSlot.weekNumber})
                      </span>
                    </div>

                    <h3 className="mt-2 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                      {selectedSlot.mainTheme || selectedSlot.provisionalTitle}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSlotId(null)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                      1. Nome Provisório do Conteúdo
                    </label>
                    <input
                      type="text"
                      value={selectedSlot.provisionalTitle}
                      onChange={(e) =>
                        updateSlotById(selectedSlot.id, (prev) => ({
                          ...prev,
                          provisionalTitle: e.target.value,
                        }))
                      }
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* SELECT 3: Formato do Conteúdo no Drawer 360° */}
                    <div className="flex flex-col gap-1">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        2. Formato do Conteúdo
                      </span>
                      <DarkCustomSelect
                        fullWidth
                        menuZIndex="z-[260]"
                        value={selectedSlot.format}
                        options={SLOT_FORMAT_OPTIONS}
                        onChange={(nextFmt) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            format: nextFmt as SlotContentFormat,
                          }))
                        }
                        ariaLabel="Selecionar formato do slot"
                      />
                    </div>

                    {/* SELECT 4: Tipo MATRIZ RETINA no Drawer 360° */}
                    <div className="flex flex-col gap-1">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        3. Tipo MATRIZ RETINA
                      </span>
                      <DarkCustomSelect
                        fullWidth
                        menuZIndex="z-[260]"
                        value={selectedSlot.retinaType}
                        options={RETINA_SELECT_OPTIONS}
                        onChange={(nextRet) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            retinaType: nextRet as RetinaTypeKey,
                          }))
                        }
                        ariaLabel="Selecionar tipo RETINA do slot"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        4. Horário Sugerido
                      </label>
                      <input
                        type="text"
                        value={selectedSlot.suggestedTime}
                        onChange={(e) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            suggestedTime: e.target.value,
                          }))
                        }
                        className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-mono text-[0.8125rem] text-la-gold-light"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* SELECT 5: Status de Execução do Slot no Drawer 360° */}
                    <div className="flex flex-col gap-1">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        5. Status de Execução do Slot
                      </span>
                      <DarkCustomSelect
                        fullWidth
                        menuZIndex="z-[260]"
                        value={selectedSlot.status}
                        options={SLOT_STATUS_OPTIONS}
                        onChange={(nextSt) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            status: nextSt as SlotExecutionStatus,
                          }))
                        }
                        ariaLabel="Selecionar status de execução do slot"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        6. Plataforma(s) Selecionadas
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {AVAILABLE_PLATFORMS.map((plat) => {
                          const active =
                            selectedSlot.platforms.includes(plat);
                          return (
                            <button
                              key={plat}
                              type="button"
                              onClick={() =>
                                updateSlotById(selectedSlot.id, (prev) => ({
                                  ...prev,
                                  platforms: active
                                    ? prev.platforms.filter((p) => p !== plat)
                                    : [...prev.platforms, plat],
                                }))
                              }
                              className={clsx(
                                "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.6875rem] transition-colors",
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
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* SELECT 6: Pilar da Linha Editorial no Drawer 360° */}
                    <div className="flex flex-col gap-1">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        7. Pilar da Linha Editorial Associado
                      </span>
                      <DarkCustomSelect
                        fullWidth
                        menuZIndex="z-[260]"
                        value={selectedSlot.editorialPillar}
                        options={PILLAR_SELECT_OPTIONS}
                        onChange={(nextPillar) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            editorialPillar: nextPillar,
                          }))
                        }
                        ariaLabel="Selecionar pilar editorial do slot"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        8. Objetivo Estratégico Daquele Conteúdo
                      </label>
                      <input
                        type="text"
                        value={selectedSlot.strategicObjective}
                        onChange={(e) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            strategicObjective: e.target.value,
                          }))
                        }
                        className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>
                  </div>

                  <div className="rounded-la-xl border border-la-border-gold/50 bg-la-gold-faint/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        9. Tema Principal do Conteúdo (Conectado à Função 02)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(null);
                          handleTriggerGoToThemes();
                        }}
                        className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                      >
                        Abrir Biblioteca de Temas →
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Digite o tema ou escolha uma das 3 sugestões da IA abaixo..."
                      value={selectedSlot.mainTheme}
                      onChange={(e) =>
                        updateSlotById(selectedSlot.id, (prev) => ({
                          ...prev,
                          mainTheme: e.target.value,
                        }))
                      }
                      className="mt-2 min-h-[2.5rem] w-full rounded-la-md border border-white/15 bg-black/75 px-3.5 py-2 font-la-sans text-[0.875rem] font-medium text-la-text-primary"
                    />

                    <div className="mt-3">
                      <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-secondary">
                        3 Temas Sugeridos pela IA para este Slot (1 clique para
                        aplicar):
                      </span>
                      <div className="mt-1.5 flex flex-col gap-1.5">
                        {selectedSlot.aiSuggestedThemes.map((sugTheme, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              updateSlotById(selectedSlot.id, (prev) => ({
                                ...prev,
                                mainTheme: sugTheme,
                              }))
                            }
                            className={clsx(
                              "flex items-center justify-between gap-2 rounded-la-md border px-3 py-1.5 text-left font-la-sans text-[0.75rem] transition-colors",
                              selectedSlot.mainTheme === sugTheme
                                ? "border-la-gold bg-la-gold font-semibold text-la-text-inverse"
                                : "border-white/10 bg-black/60 text-la-text-secondary hover:border-la-border-gold hover:text-la-text-primary"
                            )}
                          >
                            <span>
                              {idx + 1}. {sugTheme}
                            </span>
                            <span className="shrink-0 font-la-mono text-[0.625rem]">
                              {selectedSlot.mainTheme === sugTheme
                                ? "Em uso"
                                : "Usar tema"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        10. Dor, Desejo, Objeção ou Mito do ICP que será atacado
                      </label>
                      <input
                        type="text"
                        value={selectedSlot.icpPainDesireOrObjection}
                        onChange={(e) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            icpPainDesireOrObjection: e.target.value,
                          }))
                        }
                        className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>

                    {/* SELECT 7: Nível de Consciência do ICP no Drawer 360° */}
                    <div className="flex flex-col gap-1">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                        Nível de Consciência
                      </span>
                      <DarkCustomSelect
                        fullWidth
                        align="right"
                        menuZIndex="z-[260]"
                        value={selectedSlot.icpAwarenessLevel}
                        options={AWARENESS_LEVEL_OPTIONS}
                        onChange={(nextLvl) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            icpAwarenessLevel: nextLvl as IcpAwarenessLevel,
                          }))
                        }
                        ariaLabel="Selecionar nível de consciência do ICP"
                      />
                    </div>
                  </div>

                  {selectedSlot.storySequencesBreakdown ? (
                    <div className="rounded-la-xl border border-emerald-400/40 bg-emerald-950/20 p-4">
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-emerald-300">
                        DETALHAMENTO DAS 4 SEQUÊNCIAS DE STORIES DO DIA (4 A 5
                        STORIES CADA)
                      </span>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {selectedSlot.storySequencesBreakdown.map((seq) => (
                          <div
                            key={seq.period}
                            className="rounded-la-lg border border-white/10 bg-black/60 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-la-mono text-[0.6875rem] font-bold text-emerald-200">
                                {seq.period} ({seq.suggestedTime})
                              </span>
                              <span className="font-la-mono text-[0.625rem] text-la-gold-light">
                                {seq.storiesCount} stories · {seq.retinaFocus}
                              </span>
                            </div>
                            <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                              {seq.narrativeDirection}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                      11. Campo de Referência ou Link de Exemplo / Inspiração
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://instagram.com/p/exemplo..."
                        value={selectedSlot.referenceLink}
                        onChange={(e) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            referenceLink: e.target.value,
                          }))
                        }
                        className="min-h-[2.5rem] flex-1 rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                      {selectedSlot.referenceLink ? (
                        <a
                          href={selectedSlot.referenceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-la-md border border-white/14 bg-black/60 px-3 font-la-mono text-[0.6875rem] text-la-gold-light hover:border-la-gold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Abrir</span>
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-secondary">
                      12. Observações e Briefing de Execução
                    </label>
                    <textarea
                      rows={3}
                      value={selectedSlot.executionNotes}
                      onChange={(e) =>
                        updateSlotById(selectedSlot.id, (prev) => ({
                          ...prev,
                          executionNotes: e.target.value,
                        }))
                      }
                      className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-black/50 p-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-la-gold" />
                        <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                          Qualificação para Material Complementar (Função 03)
                        </span>
                      </div>
                      <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                        Quando habilitado, a Função 03 libera a geração de
                        planilha, checklist ou diagnóstico PDF para este slot.
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSlot.eligibleForComplementaryMaterial}
                        onChange={(e) =>
                          updateSlotById(selectedSlot.id, (prev) => ({
                            ...prev,
                            eligibleForComplementaryMaterial: e.target.checked,
                            complementaryMaterialType: e.target.checked
                              ? "Checklist / Planilha Executiva"
                              : "Nenhum",
                          }))
                        }
                        className="h-4 w-4 accent-[#CFA965]"
                      />
                      <span className="font-la-mono text-[0.75rem] font-semibold text-la-gold-light">
                        {selectedSlot.eligibleForComplementaryMaterial
                          ? "Qualificado"
                          : "Não qualificado"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(selectedSlot.id)}
                  className="inline-flex items-center gap-1.5 rounded-la-md border border-red-500/40 bg-red-950/25 px-3 py-2 font-la-mono text-[0.6875rem] text-red-200 hover:bg-red-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Slot</span>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const slotId = selectedSlot.id;
                      const theme =
                        selectedSlot.mainTheme ||
                        selectedSlot.provisionalTitle;
                      setSelectedSlotId(null);
                      handleTriggerGoToScripts(slotId, theme);
                    }}
                    className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Gerar / Abrir Roteiro deste Slot (F03)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADICIONAR NOVO SLOT EM UMA DATA ESPECÍFICA                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {addingSlotForDate ? (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingSlotForDate(null)}
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
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                    NOVO SLOT NA AGENDA • DIA {addingSlotForDate.dayNumber} NOV
                  </span>
                  <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                    Adicionar Conteúdo ({addingSlotForDate.dayOfWeekLabel})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingSlotForDate(null)}
                  className="text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleAddSlotToDay}
                className="mt-4 flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Título Provisório ou Tema
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: O erro invisível na gestão de risco"
                    value={newSlotTitle}
                    onChange={(e) => setNewSlotTitle(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* SELECT 8: Formato no Modal de Novo Slot */}
                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Formato
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      menuZIndex="z-[260]"
                      value={newSlotFormat}
                      options={SLOT_FORMAT_SHORT_OPTIONS}
                      onChange={(val) =>
                        setNewSlotFormat(val as SlotContentFormat)
                      }
                      ariaLabel="Selecionar formato do novo slot"
                    />
                  </div>

                  {/* SELECT 9: Tipo RETINA no Modal de Novo Slot */}
                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Tipo RETINA
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      align="right"
                      menuZIndex="z-[260]"
                      value={newSlotRetina}
                      options={RETINA_SELECT_OPTIONS}
                      onChange={(val) =>
                        setNewSlotRetina(val as RetinaTypeKey)
                      }
                      ariaLabel="Selecionar tipo RETINA do novo slot"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Horário Sugerido
                  </label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-mono text-[0.8125rem] text-la-gold-light"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddingSlotForDate(null)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    Criar e Abrir Painel 360°
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

export default CalendarioEditorialModule;