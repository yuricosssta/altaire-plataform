// FrontEnd/src/components/editorial/workspace/TemasEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Flame,
  GripVertical,
  Layers,
  Lightbulb,
  Plus,
  Radar,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  DarkCustomSelect,
  type CustomSelectOption,
} from "@/components/ui/DarkCustomSelect";
import {
  FORMAT_META,
  RETINA_META,
  mapBackendCalendarToRecord,
  mapBackendFormatToUi,
  mapBackendRetinaToUi,
  mapUiFormatToBackend,
  type CalendarSlotItem,
  type EditorialCalendarRecord,
  type RetinaTypeKey,
  type SlotContentFormat,
} from "./CalendarioEditorialModule";
import { themesService } from "@/lib/services/themesService";
import { editorialService } from "@/lib/services/editorialService";
import type {
  BusinessMoment,
  CalendarThemeVersion,
  RetinaPriority,
  Theme,
  ThemeObjective,
  ThemeVolume,
} from "@/lib/dto/themes.schema";
import type { Platform } from "@/lib/dto/editorial.schema";

/* ========================================================================== */
/* COMPONENTE AUXILIAR: TÍTULO DE TEMA EDITÁVEL MULTILINHA (SEM CORTE)        */
/* ========================================================================== */

interface EditableThemeTitleProps {
  readonly value: string;
  readonly onChange: (nextValue: string) => void;
  readonly indexBadge?: string;
  readonly ariaLabel?: string;
}

function EditableThemeTitle({
  value,
  onChange,
  indexBadge,
  ariaLabel,
}: EditableThemeTitleProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, el.scrollHeight)}px`;
  }, [value]);

  return (
    <div className="group/title relative flex w-full items-start gap-2">
      {indexBadge ? (
        <span className="mt-1.5 inline-flex h-6 min-w-[1.625rem] shrink-0 items-center justify-center rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-1.5 font-la-mono text-[0.6875rem] font-bold text-la-gold-light">
          {indexBadge}
        </span>
      ) : null}

      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          aria-label={ariaLabel ?? "Editar título do tema estratégico"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none overflow-hidden rounded-la-md border border-white/10 bg-black/50 px-3 py-2 pr-8 font-la-sans text-[0.9375rem] font-semibold leading-[1.45] text-la-text-primary transition-all placeholder:text-la-text-muted hover:border-la-border-gold/55 focus:border-la-gold focus:bg-[#070A12] focus:outline-none focus:ring-1 focus:ring-la-gold/35"
        />
        <Edit3
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 text-la-text-muted opacity-65 transition-colors group-hover/title:text-la-gold group-hover/title:opacity-100"
        />
      </div>
    </div>
  );
}

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

export type SimulationScenarioKey =
  | "none"
  | "more_transformation"
  | "sales_push"
  | "top_of_funnel";

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

/* ========================================================================== */
/* OPÇÕES TIPADAS PARA O COMPONENTE DARKCUSTOMSELECT                          */
/* ========================================================================== */

const MODE_1_VOLUME_OPTIONS: readonly CustomSelectOption<string>[] = [
  { value: "15", label: "Gerar 15 temas iniciais (~5 por área ROMA)" },
  { value: "20", label: "Gerar 20 temas iniciais (Padrão rápido)" },
  { value: "30", label: "Gerar 30 temas iniciais (10 por área ROMA)" },
  { value: "45", label: "Gerar 45 temas iniciais (15 por área ROMA)" },
];

const MODE_1_RETINA_PRIORITY_OPTIONS: readonly CustomSelectOption<
  "all" | RetinaTypeKey
>[] = [
  {
    value: "all",
    label: "Equilíbrio padrão — Todos os 6 tipos (Recomendado)",
  },
  {
    value: "Relacionamento",
    label: "Focar mais em Relacionamento (Conexão com seguidores)",
  },
  {
    value: "Engajamento",
    label: "Focar mais em Engajamento (Topo de funil, alcance)",
  },
  {
    value: "Transformacao",
    label: "Focar mais em Transformação (Educativo, salvamentos)",
  },
  {
    value: "Interacao",
    label: "Focar mais em Interação (Enquetes, caixinhas, Direct)",
  },
  {
    value: "NiveisDeConsciencia",
    label: "Focar mais em Níveis de Consciência (Conteúdo de venda)",
  },
  {
    value: "Autoridade",
    label: "Focar mais em Autoridade (Resultados, provas, método)",
  },
];

const MODE_2_VOLUME_OPTIONS: readonly CustomSelectOption<string>[] = [
  { value: "12", label: "12 temas avançados de mercado" },
  { value: "20", label: "20 temas avançados de mercado" },
  { value: "30", label: "30 temas avançados de mercado" },
];

const MODE_3_OBJECTIVE_OPTIONS: readonly CustomSelectOption<string>[] =
  MODE_3_OBJECTIVES.map((obj) => ({
    value: obj,
    label: obj,
  }));

const MODE_3_MOMENT_OPTIONS: readonly CustomSelectOption<string>[] =
  MODE_3_BUSINESS_MOMENTS.map((mom) => ({
    value: mom,
    label: mom,
  }));

const MODE_3_VOLUME_OPTIONS: readonly CustomSelectOption<string>[] = [
  { value: "12", label: "Lote de 12 temas alinhados ao momento" },
  { value: "18", label: "Lote de 18 temas alinhados ao momento" },
  { value: "24", label: "Lote de 24 temas alinhados ao momento" },
];

const MAP_ORIGIN_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | ThemeOriginMode
>[] = [
  { value: "all", label: "Origem: Todas (3)" },
  { value: "ROMA & Avatar", label: "ROMA & Avatar" },
  { value: "Dados de Mercado", label: "Dados de Mercado" },
  { value: "Objetivo & Momento", label: "Objetivo & Momento" },
];

const MAP_RETINA_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | RetinaTypeKey
>[] = [
  { value: "all", label: "Tipo RETINA: Todos" },
  ...(Object.keys(RETINA_META) as RetinaTypeKey[]).map((r) => ({
    value: r,
    label: `${RETINA_META[r].code} · ${RETINA_META[r].label}`,
  })),
];

const MAP_AXIS_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | ConsciousnessAxis
>[] = [
  { value: "all", label: "Consciência: Todos (3)" },
  { value: "Sintoma", label: "Eixo 1 · Sintoma" },
  { value: "Solução", label: "Eixo 2 · Solução" },
  { value: "Objeção", label: "Eixo 3 · Objeção" },
];

const MAP_JOURNEY_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | CustomerJourneyStage
>[] = [
  { value: "all", label: "Jornada: Todas (5)" },
  ...JOURNEY_STAGES.map((j) => ({
    value: j,
    label: j,
  })),
];

const MAP_FORMAT_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | SlotContentFormat
>[] = [
  { value: "all", label: "Formato: Todos" },
  ...(Object.keys(FORMAT_META) as SlotContentFormat[]).map((f) => ({
    value: f,
    label: FORMAT_META[f].shortLabel,
  })),
];

const INLINE_RETINA_OPTIONS: readonly CustomSelectOption<RetinaTypeKey>[] = (
  Object.keys(RETINA_META) as RetinaTypeKey[]
).map((r) => ({
  value: r,
  label: `${RETINA_META[r].code} · ${RETINA_META[r].label}`,
}));

const INLINE_AXIS_OPTIONS: readonly CustomSelectOption<ConsciousnessAxis>[] = [
  { value: "Sintoma", label: "Eixo 1 · Sintoma" },
  { value: "Solução", label: "Eixo 2 · Solução" },
  { value: "Objeção", label: "Eixo 3 · Objeção" },
];

const INLINE_JOURNEY_OPTIONS: readonly CustomSelectOption<CustomerJourneyStage>[] =
  JOURNEY_STAGES.map((j) => ({
    value: j,
    label: j,
  }));

const INLINE_FORMAT_OPTIONS: readonly CustomSelectOption<SlotContentFormat>[] =
  (Object.keys(FORMAT_META) as SlotContentFormat[]).map((f) => ({
    value: f,
    label: FORMAT_META[f].shortLabel,
  }));

const SIMULATION_SCENARIO_OPTIONS: readonly CustomSelectOption<SimulationScenarioKey>[] =
  [
    { value: "none", label: "Simular Cenário: Distribuição Padrão" },
    {
      value: "more_transformation",
      label: "Simular: + Transformação, - Engajamento",
    },
    {
      value: "sales_push",
      label: "Simular: Intensificação de Vendas / Carrinho Aberto",
    },
    {
      value: "top_of_funnel",
      label: "Simular: Crescimento de Audiência / Topo de Funil",
    },
  ];

/* ========================================================================== */
/* MAPEAMENTO DETERMINÍSTICO ENTRE SCHEMA BACKEND BFF E UI DA FUNÇÃO 02       */
/* ========================================================================== */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const ALLOWED_VOLUMES = new Set<string>([
  "12",
  "15",
  "18",
  "20",
  "24",
  "30",
  "45",
  "50",
  "100",
]);

function normalizeThemeVolume(count: number, fallback: ThemeVolume): ThemeVolume {
  const str = String(count);
  return (ALLOWED_VOLUMES.has(str) ? str : fallback) as ThemeVolume;
}

function mapBackendOriginToUi(origin?: string): ThemeOriginMode {
  if (origin === "market") return "Dados de Mercado";
  if (origin === "objective") return "Objetivo & Momento";
  return "ROMA & Avatar";
}

function mapUiOriginToBackend(
  origin: ThemeOriginMode
): "roma_avatar" | "market" | "objective" {
  if (origin === "Dados de Mercado") return "market";
  if (origin === "Objetivo & Momento") return "objective";
  return "roma_avatar";
}

function mapUiRetinaToBackend(retina: RetinaTypeKey) {
  switch (retina) {
    case "Relacionamento":
      return "relacionamento" as const;
    case "Engajamento":
      return "engajamento" as const;
    case "Transformacao":
      return "transformacao" as const;
    case "Interacao":
      return "interacao" as const;
    case "NiveisDeConsciencia":
      return "nivel_consciencia" as const;
    case "Autoridade":
      return "autoridade" as const;
  }
}

function mapRetinaPriorityToBackend(
  focus: "all" | RetinaTypeKey
): RetinaPriority {
  if (focus === "all") return "balanced";
  return mapUiRetinaToBackend(focus);
}

function mapBackendAxisToUi(level?: string): ConsciousnessAxis {
  const val = String(level || "").toLowerCase();
  if (val.includes("sintoma")) return "Sintoma";
  if (val.includes("obje")) return "Objeção";
  return "Solução";
}

function mapUiAxisToBackend(
  axis: ConsciousnessAxis
): "sintoma" | "solucao" | "objecao" {
  if (axis === "Sintoma") return "sintoma";
  if (axis === "Objeção") return "objecao";
  return "solucao";
}

function mapBackendJourneyToUi(stage?: string): CustomerJourneyStage {
  const val = String(stage || "").toLowerCase();
  if (val.includes("considera")) return "Consideração";
  if (val.includes("conver")) return "Conversão/Compra";
  if (val.includes("compart")) return "Experiência compartilhada";
  if (val.includes("experi")) return "Experiência do comprador";
  return "Descoberta";
}

function mapUiJourneyToBackend(
  stage: CustomerJourneyStage
): "descoberta" | "consideracao" | "conversao" | "experiencia" | "compartilhamento" {
  switch (stage) {
    case "Descoberta":
      return "descoberta";
    case "Consideração":
      return "consideracao";
    case "Conversão/Compra":
      return "conversao";
    case "Experiência do comprador":
      return "experiencia";
    case "Experiência compartilhada":
      return "compartilhamento";
  }
}

function mapObjectiveLabelToBackend(label: string): ThemeObjective {
  const val = label.toLowerCase();
  if (val.includes("audi")) return "grow_audience";
  if (val.includes("engaj")) return "increase_engagement";
  if (val.includes("relacionamento")) return "increase_relationship";
  if (val.includes("aquecer")) return "warm_up_sales";
  if (val.includes("lançamento") || val.includes("lancamento")) return "sell_launch";
  if (val.includes("perpétuo") || val.includes("perpetuo")) return "sell_evergreen";
  if (val.includes("nutrir") || val.includes("pós-venda")) return "nurture_customers";
  return "strengthen_authority";
}

function mapMomentLabelToBackend(label: string): BusinessMoment {
  const val = label.toLowerCase();
  if (val.includes("audi")) return "building_audience";
  if (val.includes("autoridade")) return "building_authority";
  if (val.includes("pré-venda") || val.includes("pre-venda")) return "pre_sale";
  if (val.includes("carrinho")) return "cart_open";
  if (val.includes("pós-vendas") || val.includes("pos-vendas")) return "post_sale";
  return "organic_maintenance";
}

function mapUiPlatformsToBackend(platforms: readonly string[]): Platform[] {
  const mapped: Platform[] = [];
  for (const p of platforms) {
    const lower = p.toLowerCase();
    if (lower.includes("instagram")) mapped.push("instagram");
    else if (lower.includes("youtube")) mapped.push("youtube");
    else if (lower.includes("tiktok")) mapped.push("tiktok");
    else if (lower.includes("linkedin")) mapped.push("linkedin");
  }
  return mapped.length > 0 ? Array.from(new Set(mapped)) : ["instagram"];
}

function mapBackendPlatformToLabel(platforms?: readonly string[], single?: string): string {
  if (single) return single;
  const first = platforms?.[0];
  if (first === "youtube") return "YouTube";
  if (first === "tiktok") return "TikTok";
  if (first === "linkedin") return "LinkedIn";
  return "Instagram";
}

export function mapBackendThemeToRecord(
  t: Theme | Record<string, any>
): StrategicThemeRecord {
  const id = String((t as any).id || (t as any)._id || "");
  const statusRaw = String(t.status || "active");
  const validStatuses: ThemeLibraryStatus[] = [
    "active",
    "archived",
    "favorite",
    "priority_next_cycle",
    "saved_for_sales",
    "market_test",
  ];
  const status: ThemeLibraryStatus = validStatuses.includes(statusRaw as ThemeLibraryStatus)
    ? (statusRaw as ThemeLibraryStatus)
    : "active";

  const createdLabel =
    t.createdAt instanceof Date
      ? t.createdAt.toLocaleDateString("pt-BR")
      : typeof t.createdAt === "string"
        ? new Date(t.createdAt).toLocaleDateString("pt-BR")
        : "Sincronizado";

  return {
    id,
    title: String(t.title || "Tema estratégico"),
    origin: mapBackendOriginToUi(t.origin),
    techniqueUsed:
      (t as any).techniqueUsed ||
      (t as any).approach ||
      "Motor Editorial ROMA & RETINA",
    romaPillar: (t as any).romaPillar || t.pillar || "Posicionamento & Valor",
    retinaType: mapBackendRetinaToUi(t.retinaType),
    consciousnessAxis: mapBackendAxisToUi(
      (t as any).consciousnessAxis || t.consciousnessLevel
    ),
    journeyStage: mapBackendJourneyToUi(t.journeyStage),
    recommendedFormat: mapBackendFormatToUi(
      (t as any).recommendedFormat || t.format
    ),
    recommendedPlatform: mapBackendPlatformToLabel(
      t.platforms,
      (t as any).recommendedPlatform
    ),
    painDesireOrObjection:
      (t as any).painDesireOrObjection ||
      (t as any).angle ||
      (t as any).sourceContext ||
      "Conectado aos pilares estratégicos do projeto.",
    status,
    isFavorite: Boolean((t as any).isFavorite ?? status === "favorite"),
    isPriorityNextCycle: Boolean(
      (t as any).isPriorityNextCycle ??
        (status === "priority_next_cycle" ||
          (Array.isArray(t.flags) && t.flags.includes("prioritario_proximo_ciclo")))
    ),
    isSavedForSales: Boolean(
      (t as any).isSavedForSales ??
        (status === "saved_for_sales" ||
          (Array.isArray(t.flags) && t.flags.includes("guardado_para_vendas")))
    ),
    isMarketTest: Boolean((t as any).isMarketTest ?? status === "market_test"),
    allocatedSlotIds: Array.isArray((t as any).allocatedSlotIds)
      ? (t as any).allocatedSlotIds.map(String)
      : [],
    createdAt: createdLabel,
  };
}

function mapThemeRecordToBackendPayload(
  t: StrategicThemeRecord
): Record<string, unknown> {
  return {
    origin: mapUiOriginToBackend(t.origin),
    title: t.title,
    pillar: t.romaPillar,
    romaPillar: t.romaPillar,
    retinaType: mapUiRetinaToBackend(t.retinaType),
    consciousnessLevel: mapUiAxisToBackend(t.consciousnessAxis),
    consciousnessAxis: t.consciousnessAxis,
    journeyStage: mapUiJourneyToBackend(t.journeyStage),
    format: mapUiFormatToBackend(t.recommendedFormat),
    recommendedFormat: t.recommendedFormat,
    platforms: mapUiPlatformsToBackend([t.recommendedPlatform]),
    recommendedPlatform: t.recommendedPlatform,
    techniqueUsed: t.techniqueUsed,
    painDesireOrObjection: t.painDesireOrObjection,
    status: t.status,
    isFavorite: t.isFavorite,
    isPriorityNextCycle: t.isPriorityNextCycle,
    isSavedForSales: t.isSavedForSales,
    isMarketTest: t.isMarketTest,
    allocatedSlotIds: [...t.allocatedSlotIds],
  };
}

function mapBackendVersionToSavedVersion(
  v: CalendarThemeVersion | any
): SavedCalendarThemeVersion {
  const start = v.period?.startDate
    ? new Date(v.period.startDate).toLocaleDateString("pt-BR")
    : "";
  const end = v.period?.endDate
    ? new Date(v.period.endDate).toLocaleDateString("pt-BR")
    : "";
  return {
    id: String(v.id || v._id || ""),
    versionName: String(v.name || "Versão salva"),
    periodLabel: start && end ? `${start} → ${end}` : "Ciclo editorial",
    objectiveUsed: String(v.configuration?.objective || ""),
    businessMomentUsed: String(v.configuration?.businessMoment || ""),
    savedAt: v.createdAt
      ? new Date(v.createdAt).toLocaleDateString("pt-BR")
      : "Salvo recentemente",
    allocatedCount: Array.isArray(v.slots) ? v.slots.length : 0,
    slotsSnapshot: [],
  };
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: TemasEditorialModule                                 */
/* ========================================================================== */

export function TemasEditorialModule(props: TemasEditorialModuleProps) {
  const resolvedProjectId = props.projectId || "";
  const hasValidProjectId = OBJECT_ID_REGEX.test(resolvedProjectId);
  const resolvedNiche = props.projectNiche || props.niche || "Nicho não informado";
  const resolvedSubniche = props.projectSubniche || props.subniche || "Subnicho";
  const resolvedPhase = props.currentPhase || "Ciclo editorial atual";
  const hasActiveLine = props.hasActiveLine ?? true;

  /* Subáreas oficiais da Função 02 */
  const [activeSubTab, setActiveSubTab] = useState<
    "gerar" | "mapa" | "integracao"
  >(props.initialSubTab || "gerar");

  /* Qual modo de geração está aberto dentro da Subárea 1 */
  const [generatorMode, setGeneratorMode] = useState<
    "hub" | "roma_avatar" | "dados_mercado" | "objetivo_momento"
  >(props.initialGeneratorMode || "hub");

  /* Biblioteca Oficial de Temas Aprovados do Projeto (MongoDB via BFF) */
  const [themesLibrary, setThemesLibrary] = useState<
    readonly StrategicThemeRecord[]
  >([]);
  const [detectedPillars, setDetectedPillars] = useState<readonly string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(hasValidProjectId);

  /* Lote em Revisão Humana */
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

  /* Parâmetros do Modo 1 — ROMA & Avatar */
  const [mode1Volume, setMode1Volume] = useState<number>(15);
  const [mode1SelectedPillars, setMode1SelectedPillars] = useState<
    readonly string[]
  >([]);
  const [mode1RetinaPriority, setMode1RetinaPriority] = useState<
    "all" | RetinaTypeKey
  >("all");

  /* Parâmetros do Modo 2 — Dados de Mercado Wizard */
  const [mode2Step, setMode2Step] = useState<1 | 2 | 3>(1);
  const [mode2VideoLinks, setMode2VideoLinks] = useState<string>("");
  const [mode2CommentsAndTerms, setMode2CommentsAndTerms] = useState<string>("");
  const [mode2ReviewsAndFeedbacks, setMode2ReviewsAndFeedbacks] =
    useState<string>("");
  const [mode2Volume, setMode2Volume] = useState<number>(12);

  /* Parâmetros do Modo 3 — Objetivo & Momento do Negócio */
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

  /* Filtros da Subárea 2 — Mapa Estratégico de Temas */
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

  /* Estados da Subárea 3 — Integração com Calendário Editorial */
  const [calendarsFromF01, setCalendarsFromF01] = useState<
    readonly EditorialCalendarRecord[]
  >([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");
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
  const [simulationScenario, setSimulationScenario] =
    useState<SimulationScenarioKey>("none");
  const [savedCalendarVersions, setSavedCalendarVersions] = useState<
    readonly SavedCalendarThemeVersion[]
  >([]);
  const [isSaveVersionModalOpen, setIsSaveVersionModalOpen] =
    useState<boolean>(false);
  const [newVersionTitle, setNewVersionTitle] = useState<string>("");
  const [integrationBanner, setIntegrationBanner] = useState<string | null>(
    null
  );
  const [isRebalancing, setIsRebalancing] = useState<boolean>(false);

  const titleSyncTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const loadWorkspaceThemesData = useCallback(async () => {
    if (!hasValidProjectId) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const [rawThemes, pillars, rawCalendars] = await Promise.all([
        themesService.listLibrary(resolvedProjectId),
        themesService.detectPillars(resolvedProjectId),
        editorialService.listCalendars(resolvedProjectId),
      ]);

      setThemesLibrary(rawThemes.map(mapBackendThemeToRecord));
      setDetectedPillars(pillars);

      const mappedCalendars = rawCalendars.map((c) =>
        mapBackendCalendarToRecord(c, "Linha Editorial")
      );
      setCalendarsFromF01(mappedCalendars);

      const defaultCal =
        mappedCalendars.find((c) => c.status === "active") ?? mappedCalendars[0];
      if (defaultCal) {
        setSelectedCalendarId((prev) =>
          prev && mappedCalendars.some((c) => c.id === prev) ? prev : defaultCal.id
        );
      }
    } catch {
      setBatchFeedbackBanner(
        "Não foi possível carregar os temas ou calendários do servidor agora."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [hasValidProjectId, resolvedProjectId]);

  useEffect(() => {
    void loadWorkspaceThemesData();
  }, [loadWorkspaceThemesData]);

  useEffect(() => {
    if (!hasValidProjectId || !OBJECT_ID_REGEX.test(selectedCalendarId)) {
      setSavedCalendarVersions([]);
      return;
    }

    let cancelled = false;
    themesService
      .listVersions(resolvedProjectId, selectedCalendarId)
      .then((versions) => {
        if (!cancelled) {
          setSavedCalendarVersions(
            versions.map(mapBackendVersionToSavedVersion)
          );
        }
      })
      .catch(() => {
        if (!cancelled) setSavedCalendarVersions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [hasValidProjectId, resolvedProjectId, selectedCalendarId]);

  /* Opções dinâmicas de pilares com base na Linha Editorial ativa e biblioteca real */
  const availablePillars = useMemo(() => {
    const set = new Set<string>(detectedPillars);
    for (const t of themesLibrary) {
      if (t.romaPillar) set.add(t.romaPillar);
    }
    return Array.from(set);
  }, [detectedPillars, themesLibrary]);

  const mapPillarFilterOptions = useMemo<readonly CustomSelectOption<string>[]>(
    () => [
      { value: "all", label: "Pilar ROMA: Todos" },
      ...availablePillars.map((p) => ({ value: p, label: p })),
    ],
    [availablePillars]
  );

  const inlinePillarOptions = useMemo<readonly CustomSelectOption<string>[]>(
    () =>
      availablePillars.length > 0
        ? availablePillars.map((p) => ({ value: p, label: p }))
        : [{ value: "Posicionamento & Valor", label: "Posicionamento & Valor" }],
    [availablePillars]
  );

  const activeCalendarRecord =
    useMemo((): EditorialCalendarRecord | null => {
      return (
        calendarsFromF01.find((c) => c.id === selectedCalendarId) ??
        calendarsFromF01[0] ??
        null
      );
    }, [calendarsFromF01, selectedCalendarId]);

  const activeSlots = useMemo(
    () => activeCalendarRecord?.slots ?? [],
    [activeCalendarRecord]
  );

  /* Slots de Feed/Vídeo do Calendário Ativo para a Mesa de Integração */
  const integrationSlots = useMemo(() => {
    const feedSlots = activeSlots.filter(
      (s) => s.format !== "sequencia_stories"
    );
    if (integrationPeriodFilter === "empty_only") {
      return feedSlots.filter((s) => !s.mainTheme.trim());
    }
    if (integrationPeriodFilter !== "all") {
      return feedSlots.filter((s) => s.weekNumber === integrationPeriodFilter);
    }
    return feedSlots;
  }, [activeSlots, integrationPeriodFilter]);

  const unallocatedSlotsCount = useMemo(() => {
    return activeSlots.filter(
      (s) => s.format !== "sequencia_stories" && !s.mainTheme.trim()
    ).length;
  }, [activeSlots]);

  /* ======================================================================== */
  /* HANDLERS DE GERAÇÃO EM LOTE E CURADORIA HUMANA (SUBÁREA 1)               */
  /* ======================================================================== */

  const handleRunModeGeneration = async (mode: ThemeOriginMode) => {
    if (!hasValidProjectId) return;
    setIsGeneratingBatch(true);
    setBatchFeedbackBanner(null);

    try {
      const request =
        mode === "ROMA & Avatar"
          ? {
              mode: "roma_avatar" as const,
              params: {
                volume: normalizeThemeVolume(mode1Volume, "15"),
                pillars:
                  mode1SelectedPillars.length > 0
                    ? [...mode1SelectedPillars]
                    : undefined,
                retinaPriority: mapRetinaPriorityToBackend(mode1RetinaPriority),
              },
              persist: false,
            }
          : mode === "Dados de Mercado"
            ? {
                mode: "market" as const,
                params: {
                  volume: normalizeThemeVolume(mode2Volume, "12"),
                  videoLinks: mode2VideoLinks
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean)
                    .slice(0, 10),
                  comments: mode2CommentsAndTerms
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),
                  reviews: mode2ReviewsAndFeedbacks
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),
                },
                persist: false,
              }
            : {
                mode: "objective" as const,
                params: {
                  volume: normalizeThemeVolume(mode3Volume, "12"),
                  objective: mapObjectiveLabelToBackend(mode3Objective),
                  businessMoment: mapMomentLabelToBackend(mode3Moment),
                  platforms: mapUiPlatformsToBackend(mode3Platforms),
                },
                persist: false,
              };

      const res = await themesService.generate(resolvedProjectId, request);
      const batch = res.themes.map(mapBackendThemeToRecord);

      setStagedBatch(batch);
      setSelectedBatchIds(batch.map((b) => b.id));
      setBatchFeedbackBanner(
        `Lote de ${batch.length} temas estratégicos gerado a partir de "${mode}"! Revise os títulos abaixo antes de salvar na biblioteca.`
      );
    } catch {
      setBatchFeedbackBanner(
        "Erro ao acionar o gerador de temas no servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  /* Botão "Gerar mais temas na mesma linha" (Aprofundar cluster via backend) */
  const handleGenerateMoreLikeThisInBatch = async (
    seedTheme: StrategicThemeRecord
  ) => {
    if (!hasValidProjectId || isGeneratingBatch) return;
    setIsGeneratingBatch(true);

    try {
      let generated: StrategicThemeRecord[] = [];
      if (OBJECT_ID_REGEX.test(seedTheme.id)) {
        const res = await themesService.generateMore(
          resolvedProjectId,
          seedTheme.id,
          3
        );
        generated = res.map(mapBackendThemeToRecord);
      } else {
        const res = await themesService.generate(resolvedProjectId, {
          mode: "market",
          params: {
            marketNotes: seedTheme.title,
            volume: "12",
          },
          persist: false,
        });
        generated = res.themes.slice(0, 3).map((item, idx) => ({
          ...mapBackendThemeToRecord(item),
          id: `preview-cluster-${Date.now()}-${idx}`,
          romaPillar: seedTheme.romaPillar,
        }));
      }

      setStagedBatch((prev) => [...generated, ...prev]);
      setSelectedBatchIds((prev) => [
        ...generated.map((v) => v.id),
        ...prev,
      ]);
      setBatchFeedbackBanner(
        `${generated.length} temas derivados gerados na linha de "${seedTheme.title.slice(0, 45)}...".`
      );
    } catch {
      setBatchFeedbackBanner(
        "Não foi possível gerar variações adicionais neste momento."
      );
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  /* Aprovar Selecionados do Lote e Persistir na Biblioteca MongoDB via BFF */
  const handleApproveBatchToLibrary = async (goToIntegrationAfter = false) => {
    if (!hasValidProjectId) return;
    const approvedItems = stagedBatch.filter((item) =>
      selectedBatchIds.includes(item.id)
    );
    if (approvedItems.length === 0) return;

    setIsGeneratingBatch(true);
    try {
      const res = await themesService.createBatch(resolvedProjectId, {
        themes: approvedItems.map(mapThemeRecordToBackendPayload),
        batchName: `Lote ${generatorMode}`,
      });

      const savedRecords = Array.isArray(res.themes)
        ? res.themes.map(mapBackendThemeToRecord)
        : approvedItems;

      setThemesLibrary((prev) => [...savedRecords, ...prev]);
      setStagedBatch([]);
      setSelectedBatchIds([]);
      setGeneratorMode("hub");

      if (goToIntegrationAfter) {
        setActiveSubTab("integracao");
        setIntegrationBanner(
          `${savedRecords.length} novos temas salvos e prontos para encaixar nos slots do Calendário Editorial.`
        );
      } else {
        setActiveSubTab("mapa");
      }
    } catch {
      setBatchFeedbackBanner(
        "Erro ao salvar o lote aprovado no servidor. Tente novamente."
      );
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  /* ======================================================================== */
  /* HANDLERS DO MAPA ESTRATÉGICO DE TEMAS (SUBÁREA 2)                        */
  /* ======================================================================== */

  const updateLibraryTheme = useCallback(
    (
      themeId: string,
      updater: (prev: StrategicThemeRecord) => StrategicThemeRecord,
      options?: { debounceTitle?: boolean }
    ) => {
      let updatedSnapshot: StrategicThemeRecord | null = null;
      setThemesLibrary((prevList) =>
        prevList.map((t) => {
          if (t.id !== themeId) return t;
          updatedSnapshot = updater(t);
          return updatedSnapshot;
        })
      );

      if (!hasValidProjectId || !OBJECT_ID_REGEX.test(themeId)) return;

      const sendUpdate = async () => {
        if (!updatedSnapshot) return;
        try {
          const patch = {
            title: updatedSnapshot.title,
            pillar: updatedSnapshot.romaPillar,
            romaPillar: updatedSnapshot.romaPillar,
            retinaType: mapUiRetinaToBackend(updatedSnapshot.retinaType),
            consciousnessLevel: mapUiAxisToBackend(
              updatedSnapshot.consciousnessAxis
            ),
            consciousnessAxis: updatedSnapshot.consciousnessAxis,
            journeyStage: mapUiJourneyToBackend(updatedSnapshot.journeyStage),
            format: mapUiFormatToBackend(updatedSnapshot.recommendedFormat),
            recommendedFormat: updatedSnapshot.recommendedFormat,
            status: updatedSnapshot.status,
            isFavorite: updatedSnapshot.isFavorite,
            isPriorityNextCycle: updatedSnapshot.isPriorityNextCycle,
            isSavedForSales: updatedSnapshot.isSavedForSales,
            isMarketTest: updatedSnapshot.isMarketTest,
          };
          await themesService.updateTheme(resolvedProjectId, themeId, patch);
        } catch {
          /* Mantém UI responsiva e evita travamento em digitação */
        }
      };

      if (options?.debounceTitle) {
        const existing = titleSyncTimersRef.current.get(themeId);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
          titleSyncTimersRef.current.delete(themeId);
          void sendUpdate();
        }, 500);
        titleSyncTimersRef.current.set(themeId, timer);
      } else {
        void sendUpdate();
      }
    },
    [hasValidProjectId, resolvedProjectId]
  );

  const handleDeleteLibraryTheme = useCallback(
    async (themeId: string) => {
      if (!hasValidProjectId || !OBJECT_ID_REGEX.test(themeId)) return;
      try {
        await themesService.deleteTheme(resolvedProjectId, themeId);
        setThemesLibrary((prev) => prev.filter((t) => t.id !== themeId));
      } catch {
        setBatchFeedbackBanner("Não foi possível excluir o tema selecionado.");
      }
    },
    [hasValidProjectId, resolvedProjectId]
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

  const handleAssignThemeToCalendarSlot = useCallback(
    async (slotId: string, theme: StrategicThemeRecord) => {
      if (!activeCalendarRecord || !hasValidProjectId) return;

      const updatedSlots = activeCalendarRecord.slots.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          mainTheme: theme.title,
          editorialPillar: theme.romaPillar,
          icpPainDesireOrObjection: theme.painDesireOrObjection,
        };
      });

      const updatedCalendar: EditorialCalendarRecord = {
        ...activeCalendarRecord,
        updatedAt: "Tema integrado agora",
        slots: updatedSlots,
      };

      setCalendarsFromF01((prev) =>
        prev.map((c) => (c.id === updatedCalendar.id ? updatedCalendar : c))
      );

      setThemesLibrary((prev) =>
        prev.map((t) => {
          if (t.id !== theme.id) return t;
          const nextSlotIds = t.allocatedSlotIds.includes(slotId)
            ? t.allocatedSlotIds
            : [...t.allocatedSlotIds, slotId];
          return { ...t, allocatedSlotIds: nextSlotIds };
        })
      );

      try {
        await themesService.assignTheme(resolvedProjectId, activeCalendarRecord.id, {
          calendarItemId: slotId,
          themeId: OBJECT_ID_REGEX.test(theme.id) ? theme.id : undefined,
          title: theme.title,
        });
        setIntegrationBanner(
          `Tema "${theme.title.slice(0, 48)}..." vinculado com sucesso ao slot do Calendário!`
        );
      } catch {
        setIntegrationBanner(
          "Não foi possível persistir a vinculação do tema neste slot."
        );
        void loadWorkspaceThemesData();
      }
    },
    [
      activeCalendarRecord,
      hasValidProjectId,
      resolvedProjectId,
      loadWorkspaceThemesData,
    ]
  );

  const handleClearSlotTheme = async (slotId: string) => {
    if (!activeCalendarRecord || !hasValidProjectId) return;

    const linkedTheme = themesLibrary.find((t) =>
      t.allocatedSlotIds.includes(slotId)
    );

    const updatedSlots = activeCalendarRecord.slots.map((s) =>
      s.id === slotId ? { ...s, mainTheme: "" } : s
    );
    const updatedCal: EditorialCalendarRecord = {
      ...activeCalendarRecord,
      slots: updatedSlots,
    };
    setCalendarsFromF01((prev) =>
      prev.map((c) => (c.id === updatedCal.id ? updatedCal : c))
    );
    setThemesLibrary((prev) =>
      prev.map((t) => ({
        ...t,
        allocatedSlotIds: t.allocatedSlotIds.filter((id) => id !== slotId),
      }))
    );

    try {
      await themesService.assignTheme(resolvedProjectId, activeCalendarRecord.id, {
        calendarItemId: slotId,
        themeId:
          linkedTheme && OBJECT_ID_REGEX.test(linkedTheme.id)
            ? linkedTheme.id
            : undefined,
        unassign: true,
      });
    } catch {
      void loadWorkspaceThemesData();
    }
  };

  const handleAutoRebalanceCalendar = async () => {
    if (!activeCalendarRecord || !hasValidProjectId || isRebalancing) return;
    setIsRebalancing(true);
    try {
      const scenarioMap: Record<SimulationScenarioKey, string> = {
        none: "DISTRIBUICAO_PADRAO",
        more_transformation: "MAIS_TRANSFORMACAO",
        sales_push: "INTENSIFICACAO_VENDAS",
        top_of_funnel: "TOPO_DE_FUNIL",
      };

      await themesService.rebalance(resolvedProjectId, activeCalendarRecord.id, {
        scenario: scenarioMap[simulationScenario],
        objective: mapObjectiveLabelToBackend(mode3Objective),
        businessMoment: mapMomentLabelToBackend(mode3Moment),
        persist: true,
      });

      await loadWorkspaceThemesData();
      setIntegrationBanner(
        "Calendário reequilibrado pela IA e persistido no servidor!"
      );
    } catch {
      setIntegrationBanner(
        "Não foi possível reequilibrar o calendário agora."
      );
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleSaveCalendarThemeVersion = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!activeCalendarRecord || !hasValidProjectId) return;

    const versionTitle =
      newVersionTitle.trim() ||
      `Calendário – Versão ${savedCalendarVersions.length + 1} (${resolvedPhase})`;

    try {
      const saved = await themesService.saveVersion(
        resolvedProjectId,
        activeCalendarRecord.id,
        {
          name: versionTitle,
          objective: mapObjectiveLabelToBackend(mode3Objective),
          businessMoment: mapMomentLabelToBackend(mode3Moment),
        }
      );

      const record = mapBackendVersionToSavedVersion(saved);
      setSavedCalendarVersions((prev) => [record, ...prev]);
      setIsSaveVersionModalOpen(false);
      setNewVersionTitle("");
      setIntegrationBanner(
        `Versão "${record.versionName}" salva com sucesso no histórico!`
      );
    } catch {
      setIntegrationBanner("Não foi possível salvar a versão do calendário.");
    }
  };

  const retinaHeatmap = useMemo(() => {
    const counts: Record<RetinaTypeKey, number> = {
      Relacionamento: 0,
      Engajamento: 0,
      Transformacao: 0,
      Interacao: 0,
      NiveisDeConsciencia: 0,
      Autoridade: 0,
    };
    const feedSlots = activeSlots.filter(
      (s) => s.format !== "sequencia_stories"
    );
    for (const s of feedSlots) {
      counts[s.retinaType] = (counts[s.retinaType] || 0) + 1;
    }
    const total = Math.max(1, feedSlots.length);
    return { counts, total };
  }, [activeSlots]);

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
                Conclua a Linha e o Calendário Editorial para que a
                classificação por pilares ROMA, tom de voz e distribuição
                RETINA tenha máxima precisão.
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
              técnicas de conteúdo raiz e as 8 técnicas avançadas nos
              bastidores.
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    1. Volume de Temas Iniciais
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    value={String(mode1Volume)}
                    options={MODE_1_VOLUME_OPTIONS}
                    onChange={(val) => setMode1Volume(Number(val))}
                    ariaLabel="Selecionar volume de temas iniciais"
                  />
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    2. Prioridade de Tipo de Conteúdo (RETINA)
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    value={mode1RetinaPriority}
                    options={MODE_1_RETINA_PRIORITY_OPTIONS}
                    onChange={(val) =>
                      setMode1RetinaPriority(val as "all" | RetinaTypeKey)
                    }
                    ariaLabel="Selecionar prioridade de tipo de conteúdo RETINA"
                  />
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
                        ? "border-la-gold bg-la-gold font-bold text-la-text-inverse"
                        : "border-white/12 bg-black/50 text-la-text-secondary"
                    )}
                  >
                    Todos os pilares (Recomendado)
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {availablePillars.length > 0 ? (
                    availablePillars.map((pil) => {
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
                              ? "border-la-border-gold bg-la-gold-faint font-medium text-la-gold-light"
                              : "border-white/10 bg-black/50 text-la-text-muted"
                          )}
                        >
                          {pil}
                        </button>
                      );
                    })
                  ) : (
                    <p className="font-la-mono text-[0.6875rem] text-la-text-muted">
                      Nenhum pilar personalizado detectado na Linha Editorial ativa ainda — o motor usará automaticamente os dados estratégicos disponíveis do projeto.
                    </p>
                  )}
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
                    Engenharia Reversa de Comentários (&ldquo;Mas e se...?&rdquo;) e
                    Termos Periféricos
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
                    placeholder='Ex.: Comentário recorrente: "Mas e se eu tiver pouco tempo na rotina?"'
                    className="mt-1 w-full rounded-la-md border border-white/14 bg-black/70 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              ) : null}

              {mode2Step === 3 ? (
                <div className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Reviews (1★, 2★ e 5★ de Amazon/Hotmart) e Feedbacks de
                    Clientes
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
                    placeholder="Cole aqui avaliações positivas (5★) e negativas (1★/2★) ou feedbacks reais de clientes."
                    className="mt-1 w-full rounded-la-md border border-white/14 bg-black/70 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                    Quantidade a extrair:
                  </span>
                  <div className="min-w-[16.5rem]">
                    <DarkCustomSelect
                      fullWidth
                      value={String(mode2Volume)}
                      options={MODE_2_VOLUME_OPTIONS}
                      onChange={(val) => setMode2Volume(Number(val))}
                      ariaLabel="Selecionar quantidade de temas de mercado"
                    />
                  </div>
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    1. Principal objetivo deste ciclo de conteúdo
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    value={mode3Objective}
                    options={MODE_3_OBJECTIVE_OPTIONS}
                    onChange={setMode3Objective}
                    ariaLabel="Selecionar objetivo principal do ciclo"
                  />
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    2. Momento atual do negócio
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    value={mode3Moment}
                    options={MODE_3_MOMENT_OPTIONS}
                    onChange={setMode3Moment}
                    ariaLabel="Selecionar momento atual do negócio"
                  />
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    3. Volume de Temas Priorizados
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    align="right"
                    value={String(mode3Volume)}
                    options={MODE_3_VOLUME_OPTIONS}
                    onChange={(val) => setMode3Volume(Number(val))}
                    ariaLabel="Selecionar volume de temas do momento"
                  />
                </div>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                  4. Em quais plataformas vamos focar neste período?
                  (Multi-select)
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
                  <span>
                    Gerar {mode3Volume} Temas Alinhados ao Período
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* MESA DE CURADORIA E REVISÃO DO LOTE GERADO (100% VISÍVEL)       */}
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
                      Aprovar {selectedBatchIds.length} e Enviar ao Mapa de
                      Temas
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

              {/* Lista Estruturada 100% na Largura da Tela (Títulos Completos + Técnica Abaixo) */}
              <div className="flex flex-col gap-3">
                {stagedBatch.map((item, idx) => {
                  const isChecked = selectedBatchIds.includes(item.id);
                  const retMeta = RETINA_META[item.retinaType];
                  const fmtMeta = FORMAT_META[item.recommendedFormat];

                  return (
                    <article
                      key={item.id}
                      className={clsx(
                        "grid grid-cols-1 gap-4 rounded-la-xl border p-4 transition-all xl:grid-cols-12 xl:items-center",
                        isChecked
                          ? "border-white/12 bg-[#070A12]/90 hover:border-la-border-gold/55"
                          : "border-white/8 bg-black/40 opacity-60 hover:opacity-95"
                      )}
                    >
                      {/* Bloco 1 (6/12): Checkbox + Título Completo Editável + Técnica Abaixo */}
                      <div className="flex items-start gap-3 xl:col-span-6">
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
                          aria-label={`Selecionar tema ${idx + 1}`}
                          className="mt-2.5 h-4 w-4 shrink-0 cursor-pointer accent-[#CFA965]"
                        />

                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <EditableThemeTitle
                            indexBadge={String(idx + 1).padStart(2, "0")}
                            value={item.title}
                            onChange={(nextVal) =>
                              setStagedBatch((prev) =>
                                prev.map((b) =>
                                  b.id === item.id
                                    ? { ...b, title: nextVal }
                                    : b
                                )
                              )
                            }
                          />

                          <div className="flex flex-wrap items-center gap-2 pl-8">
                            <span className="inline-flex items-center gap-1.5 rounded-la-xs border border-la-border-gold/35 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                              <Sparkles className="h-3 w-3 text-la-gold" />
                              <span>{item.techniqueUsed}</span>
                            </span>
                            <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                              • {item.painDesireOrObjection}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bloco 2 (4/12): Pilar ROMA, Tipo RETINA, Consciência, Jornada e Formato */}
                      <div className="grid grid-cols-2 gap-2.5 border-t border-white/8 pt-3 sm:grid-cols-4 xl:col-span-4 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4">
                        <div className="flex flex-col gap-0.5 sm:col-span-2">
                          <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                            Pilar ROMA
                          </span>
                          <span className="font-la-mono text-[0.6875rem] leading-snug text-la-text-secondary">
                            {item.romaPillar}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                            RETINA & Eixo
                          </span>
                          <span
                            className={clsx(
                              "inline-flex w-fit rounded-la-full border px-2 py-0.5 font-la-mono text-[0.5625rem] font-semibold",
                              retMeta.badgeClass
                            )}
                          >
                            {retMeta.code} · {retMeta.label}
                          </span>
                          <span className="font-la-mono text-[0.625rem] text-la-text-primary">
                            Eixo: {item.consciousnessAxis}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                            Jornada & Formato
                          </span>
                          <span className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light">
                            {fmtMeta.shortLabel} ({item.recommendedPlatform})
                          </span>
                          <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                            {item.journeyStage}
                          </span>
                        </div>
                      </div>

                      {/* Bloco 3 (2/12): Ações Rápidas */}
                      <div className="flex items-center justify-end gap-1.5 border-t border-white/8 pt-3 xl:col-span-2 xl:border-t-0 xl:pt-0">
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
                            "inline-flex h-8 w-8 items-center justify-center rounded-la-xs border transition-colors",
                            item.isFavorite
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-white/12 bg-black/50 text-la-text-muted hover:text-la-gold-light"
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
                          className="inline-flex h-8 items-center gap-1 rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
                        >
                          <Plus className="h-3 w-3" />
                          <span>3 similares</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStagedBatch((prev) =>
                              prev.filter((b) => b.id !== item.id)
                            )
                          }
                          title="Excluir do lote"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-la-xs border border-white/12 bg-black/50 text-la-text-muted transition-colors hover:border-red-500/40 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* SUBÁREA 2: MAPA ESTRATÉGICO DE TEMAS (100% NA TELA, SEM SCROLL X)   */}
      {/* =================================================================== */}
      {activeSubTab === "mapa" ? (
        <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
          {/* Barra de Busca e Filtros Multi-Coluna com DarkCustomSelect */}
          <div className="flex flex-col gap-3.5 border-b border-white/10 pb-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1 lg:max-w-[26rem]">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-gold" />
                <input
                  type="search"
                  placeholder="Filtrar biblioteca por tema, pilar, técnica ou objeção..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="min-h-[2.625rem] w-full rounded-la-md border border-white/12 bg-black/60 py-1.5 pr-4 pl-10 font-la-sans text-[0.8125rem] text-la-text-primary"
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

            {/* 6 Seletores DarkCustomSelect para Filtrar Qualquer Coluna do Mapa de Temas */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
              <DarkCustomSelect
                fullWidth
                value={mapOriginFilter}
                options={MAP_ORIGIN_FILTER_OPTIONS}
                onChange={(val) =>
                  setMapOriginFilter(val as "all" | ThemeOriginMode)
                }
                ariaLabel="Filtrar por origem do tema"
              />

              <DarkCustomSelect
                fullWidth
                value={mapPillarFilter}
                options={mapPillarFilterOptions}
                onChange={setMapPillarFilter}
                ariaLabel="Filtrar por pilar ROMA"
              />

              <DarkCustomSelect
                fullWidth
                value={mapRetinaFilter}
                options={MAP_RETINA_FILTER_OPTIONS}
                onChange={(val) =>
                  setMapRetinaFilter(val as "all" | RetinaTypeKey)
                }
                ariaLabel="Filtrar por tipo RETINA"
              />

              <DarkCustomSelect
                fullWidth
                value={mapAxisFilter}
                options={MAP_AXIS_FILTER_OPTIONS}
                onChange={(val) =>
                  setMapAxisFilter(val as "all" | ConsciousnessAxis)
                }
                ariaLabel="Filtrar por eixo de consciência"
              />

              <DarkCustomSelect
                fullWidth
                align="right"
                value={mapJourneyFilter}
                options={MAP_JOURNEY_FILTER_OPTIONS}
                onChange={(val) =>
                  setMapJourneyFilter(val as "all" | CustomerJourneyStage)
                }
                ariaLabel="Filtrar por etapa da jornada"
              />

              <DarkCustomSelect
                fullWidth
                align="right"
                value={mapFormatFilter}
                options={MAP_FORMAT_FILTER_OPTIONS}
                onChange={(val) =>
                  setMapFormatFilter(val as "all" | SlotContentFormat)
                }
                ariaLabel="Filtrar por formato recomendado"
              />
            </div>
          </div>

          {/* Lista Executiva do Mapa de Temas (Zero Scroll Horizontal, Título 100% Visível + Dor/Objeção Abaixo) */}
          <div className="flex flex-col gap-3.5 pb-40">
            {isLoadingData ? (
              <div className="rounded-la-xl border border-white/10 bg-[#0A0E18]/95 p-8 text-center font-la-mono text-[0.75rem] text-la-text-secondary">
                Carregando biblioteca de temas do projeto...
              </div>
            ) : filteredMapThemes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-la-xl border border-dashed border-la-border-gold/40 bg-[#0A0E18]/80 p-8 text-center">
                <Lightbulb className="h-7 w-7 text-la-gold" />
                <div>
                  <h4 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                    {themesLibrary.length === 0
                      ? "Nenhum tema estratégico na biblioteca deste projeto ainda"
                      : "Nenhum tema encontrado com os filtros aplicados"}
                  </h4>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    {themesLibrary.length === 0
                      ? "Utilize os 3 modos de geração na Subárea 1 para criar e aprovar seu primeiro lote de temas."
                      : "Ajuste ou limpe os filtros acima para visualizar outros temas cadastrados."}
                  </p>
                </div>
                {themesLibrary.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("gerar")}
                    className="inline-flex items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Ir para Gerar Temas</span>
                  </button>
                ) : null}
              </div>
            ) : null}

            {filteredMapThemes.map((theme, idx) => (
              <article
                key={theme.id}
                className="relative flex flex-col gap-3.5 rounded-la-xl border border-white/10 bg-[#0A0E18]/95 p-4 transition-all focus-within:z-40 hover:z-30 hover:border-la-border-gold/55"
              >
                {/* ANDAR 1: Identidade Completa do Tema (Título Editável + Dor/Objeção Abaixo) + Status & Ações */}
                <div className="flex flex-col justify-between gap-3.5 xl:flex-row xl:items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {/* Faixa de Metadados de Origem e Técnica */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                        Origem: {theme.origin}
                      </span>
                      <span className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                        {theme.techniqueUsed}
                      </span>
                      {theme.allocatedSlotIds.length > 0 ? (
                        <span className="rounded-la-full border border-emerald-400/45 bg-emerald-500/15 px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-emerald-200">
                          ● Alocado na Agenda ({theme.allocatedSlotIds.length})
                        </span>
                      ) : null}
                    </div>

                    {/* Título Completo Editável (Auto-Expansível, Sem Corte) */}
                    <EditableThemeTitle
                      indexBadge={String(idx + 1).padStart(2, "0")}
                      value={theme.title}
                      onChange={(nextTitle) =>
                        updateLibraryTheme(
                          theme.id,
                          (prev) => ({
                            ...prev,
                            title: nextTitle,
                          }),
                          { debounceTitle: true }
                        )
                      }
                      ariaLabel={`Título do tema ${idx + 1}`}
                    />

                    {/* Dor, Desejo ou Objeção Atacada (Exibida Completa Abaixo do Título) */}
                    <div className="pl-8">
                      <p className="font-la-mono text-[0.6875rem] leading-relaxed text-la-text-secondary">
                        <strong className="text-la-gold-light">
                          Dor / Objeção / Foco:
                        </strong>{" "}
                        {theme.painDesireOrObjection}
                      </p>
                    </div>
                  </div>

                  {/* Classificação / Status + Ações Diretas (Sempre Visíveis à Direita) */}
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 xl:flex-col xl:items-end xl:border-t-0 xl:pt-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateLibraryTheme(theme.id, (prev) => ({
                            ...prev,
                            isFavorite: !prev.isFavorite,
                          }))
                        }
                        title="Favoritar tema"
                        className={clsx(
                          "inline-flex h-7 w-7 items-center justify-center rounded-la-xs border transition-colors",
                          theme.isFavorite
                            ? "border-la-gold bg-la-gold text-la-text-inverse"
                            : "border-white/12 bg-black/50 text-la-text-muted hover:text-la-gold-light"
                        )}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateLibraryTheme(theme.id, (prev) => ({
                            ...prev,
                            isPriorityNextCycle: !prev.isPriorityNextCycle,
                          }))
                        }
                        className={clsx(
                          "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.625rem] transition-colors",
                          theme.isPriorityNextCycle
                            ? "border-sky-400/50 bg-sky-500/15 font-semibold text-sky-200"
                            : "border-white/10 bg-black/45 text-la-text-muted hover:text-la-text-secondary"
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
                          "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.625rem] transition-colors",
                          theme.isSavedForSales
                            ? "border-rose-400/50 bg-rose-500/15 font-semibold text-rose-200"
                            : "border-white/10 bg-black/45 text-la-text-muted hover:text-la-text-secondary"
                        )}
                      >
                        Guardado Vendas
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("integracao")}
                        className="inline-flex min-h-[2.25rem] items-center rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
                      >
                        Alocar no Calendário
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
                          className="inline-flex min-h-[2.25rem] items-center gap-1 rounded-la-md bg-la-gold px-3.5 py-1 font-la-mono text-[0.6875rem] font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light"
                        >
                          <span>Roteirizar</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDeleteLibraryTheme(theme.id)}
                        title="Excluir tema"
                        aria-label={`Excluir tema ${theme.title}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/10 bg-black/45 text-la-text-muted transition-colors hover:border-rose-400/50 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ANDAR 2: Grade de 5 Colunas com os Seletores DarkCustomSelect (100% Dentro da Tela) */}
                <div className="grid grid-cols-1 gap-2.5 border-t border-white/8 pt-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                      1. Pilar ROMA
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      value={theme.romaPillar}
                      options={inlinePillarOptions}
                      onChange={(nextPillar) =>
                        updateLibraryTheme(theme.id, (prev) => ({
                          ...prev,
                          romaPillar: nextPillar,
                        }))
                      }
                      ariaLabel={`Pilar ROMA de ${theme.title}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                      2. Tipo RETINA
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      value={theme.retinaType}
                      options={INLINE_RETINA_OPTIONS}
                      onChange={(nextRetina) =>
                        updateLibraryTheme(theme.id, (prev) => ({
                          ...prev,
                          retinaType: nextRetina as RetinaTypeKey,
                        }))
                      }
                      ariaLabel={`Tipo RETINA de ${theme.title}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                      3. Nível de Consciência
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      value={theme.consciousnessAxis}
                      options={INLINE_AXIS_OPTIONS}
                      onChange={(nextAxis) =>
                        updateLibraryTheme(theme.id, (prev) => ({
                          ...prev,
                          consciousnessAxis: nextAxis as ConsciousnessAxis,
                        }))
                      }
                      ariaLabel={`Eixo de consciência de ${theme.title}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                      4. Jornada (5 Passos)
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      align="right"
                      value={theme.journeyStage}
                      options={INLINE_JOURNEY_OPTIONS}
                      onChange={(nextJourney) =>
                        updateLibraryTheme(theme.id, (prev) => ({
                          ...prev,
                          journeyStage: nextJourney as CustomerJourneyStage,
                        }))
                      }
                      ariaLabel={`Jornada de ${theme.title}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                      5. Formato Recomendado
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      align="right"
                      value={theme.recommendedFormat}
                      options={INLINE_FORMAT_OPTIONS}
                      onChange={(nextFormat) =>
                        updateLibraryTheme(theme.id, (prev) => ({
                          ...prev,
                          recommendedFormat: nextFormat as SlotContentFormat,
                        }))
                      }
                      ariaLabel={`Formato recomendado de ${theme.title}`}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* SUBÁREA 3: INTEGRAÇÃO SPLIT-SCREEN COM O CALENDÁRIO (SEÇÃO 5 F02)   */}
      {/* =================================================================== */}
      {activeSubTab === "integracao" ? (
        <div className="flex flex-col gap-6">
          <section className="rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 xl:flex-row xl:items-center">
              <div>
                <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                  SUBÁREA 3 · MESA DE ENCAIXE E EQUILÍBRIO ESTRATÉGICO (SEÇÃO
                  5.1 E 5.2)
                </span>
                <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                  Integração Direta: Slots do Calendário (F01) ↔ Biblioteca de
                  Temas (F02)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="min-w-[19rem]">
                  <DarkCustomSelect
                    fullWidth
                    align="right"
                    value={simulationScenario}
                    options={SIMULATION_SCENARIO_OPTIONS}
                    onChange={(val) =>
                      setSimulationScenario(val as SimulationScenarioKey)
                    }
                    ariaLabel="Simular outro cenário estratégico"
                  />
                </div>

                <button
                  type="button"
                  disabled={isRebalancing || !activeCalendarRecord}
                  onClick={handleAutoRebalanceCalendar}
                  className="inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRebalancing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {isRebalancing
                      ? "Reequilibrando..."
                      : "Reequilibrar Calendário com IA"}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!activeCalendarRecord}
                  onClick={() => setIsSaveVersionModalOpen(true)}
                  className="inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Versão com Temas</span>
                </button>
              </div>
            </div>

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
                {integrationSlots.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-la-xl border border-dashed border-la-border-gold/40 bg-[#090D16]/90 p-8 text-center">
                    <CalendarIcon className="h-7 w-7 text-la-gold" />
                    <div>
                      <h4 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                        {activeCalendarRecord
                          ? "Nenhum slot encontrado para este filtro"
                          : "Nenhum calendário editorial encontrado neste projeto"}
                      </h4>
                      <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                        {activeCalendarRecord
                          ? "Altere o filtro acima ou adicione novos slots na aba Calendário Editorial."
                          : "Crie e gere um calendário na aba Calendário Editorial para integrar os temas da sua biblioteca."}
                      </p>
                    </div>
                    {!activeCalendarRecord && props.onGoToCalendarTab ? (
                      <button
                        type="button"
                        onClick={props.onGoToCalendarTab}
                        className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                      >
                        Ir para Calendário Editorial
                      </button>
                    ) : null}
                  </div>
                ) : null}

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
                                    {
                                      FORMAT_META[sug.recommendedFormat]
                                        .shortLabel
                                    }
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
                      const focusedSlot = activeSlots.find(
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