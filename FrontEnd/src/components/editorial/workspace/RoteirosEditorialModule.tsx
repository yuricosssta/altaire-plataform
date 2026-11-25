// FrontEnd/src/components/editorial/workspace/RoteirosEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Columns,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Gift,
  Hash,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  MessageSquare,
  Minimize2,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
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
import {
  FORMAT_META,
  RETINA_META,
  mapBackendCalendarToRecord,
  mapBackendFormatToUi,
  mapBackendRetinaToUi,
  type CalendarSlotItem,
  type RetinaTypeKey,
  type SlotContentFormat,
} from "./CalendarioEditorialModule";
import {
  mapBackendThemeToRecord,
  type StrategicThemeRecord,
} from "./TemasEditorialModule";
import { scriptsService } from "@/lib/services/scriptsService";
import { editorialService } from "@/lib/services/editorialService";
import { themesService } from "@/lib/services/themesService";
import { storageService } from "@/lib/services/storageService";
import type { ScriptFormat } from "@/lib/dto/editorial.schema";

/* ========================================================================== */
/* CONTRATOS E TIPAGENS ESTRITAS DA FUNÇÃO 03 (ROTEIROS E ATIVOS)             */
/* ========================================================================== */

export type ScriptFormatSlug =
  | "short_video"
  | "long_video"
  | "live"
  | "carousel"
  | "static_post"
  | "stories_sequence";

export type ScriptProductionStatus =
  | "draft"
  | "ready"
  | "in_production"
  | "ab_test"
  | "published"
  | "archived";

export type ScriptSpeakingMode = "conexao_bullets" | "seguranca_palavra";

export interface ScriptBlockRow {
  readonly id: string;
  readonly timecodeOrStage: string;
  readonly psychologicalRole: string;
  readonly visualAndAudioDirection: string;
  readonly wordForWordSpeech: string;
  readonly connectionBulletLine: string;
}

export interface CarouselSlideItem {
  readonly slideNumber: number;
  readonly roleLabel: string;
  readonly headline: string;
  readonly bodyLineBreakCopy: string;
  readonly visualDesignNote: string;
  readonly imagePromptEN: string;
}

export interface StoryCardItem {
  readonly id?: string;
  readonly cardNumber: 1 | 2 | 3 | 4 | 5;
  readonly cardType: "video_fala" | "texto_sobre_foto" | "bastidor_prova";
  readonly intentionLabel: string;
  readonly wordForWordScript: string;
  readonly connectionBullet: string;
  readonly mirrorCaptionNoSound: string;
  readonly instagramSticker: string;
  readonly visualBrandingNote: string;
}

export interface StoryPeriodSequence {
  readonly period: "Manhã" | "Almoço" | "Tarde" | "Noite";
  readonly suggestedTime: string;
  readonly narrativeTheme: string;
  readonly cards: readonly StoryCardItem[];
}

export interface PredictiveQAItem {
  readonly id: string;
  readonly questionFromAudience: string;
  readonly strategicAnswerCopy: string;
  readonly recommendedFormat: "Vídeo com Legenda Espelho" | "Texto sobre Foto";
  readonly qualifiedForMaterial: boolean;
}

export interface TitleVariationItem {
  readonly id: string;
  readonly hookCategory:
    | "Contraste Direto"
    | "Erro Invisível"
    | "Mecanismo Único (MUV)"
    | "Estudo de Caso / Prova"
    | "Anti-Clichê"
    | "Quebra de Objeção";
  readonly titleText: string;
  readonly estimatedCtrBadge: string;
  readonly isSelected: boolean;
}

export interface ImagePromptAsset {
  readonly id: string;
  readonly targetPiece: string;
  readonly visualConceptPT: string;
  readonly promptEnglish: string;
  readonly textOverlaySuggestion: string;
}

export interface ScriptVersionSnapshot {
  readonly versionLabel: string;
  readonly savedAt: string;
  readonly modeUsed: ScriptSpeakingMode;
  readonly summaryNote: string;
}

export interface EditorialScriptRecord {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly formatSlug: ScriptFormatSlug;
  readonly calendarSlotFormat: SlotContentFormat;
  readonly originType: "calendar_slot" | "theme_library";
  readonly linkedSlotId?: string;
  readonly linkedSlotLabel: string;
  readonly linkedThemeId?: string;
  readonly retinaType: RetinaTypeKey;
  readonly strategicObjective: string;
  readonly editorialPillar: string;
  readonly icpPainOrObjection: string;
  readonly businessMoment: string;
  readonly platform: string;
  readonly estimatedDurationOrSize: string;
  readonly status: ScriptProductionStatus;
  readonly speakingMode: ScriptSpeakingMode;
  readonly version: string;
  readonly updatedAt: string;

  /* 1. Blocos de Roteiro (Vídeo Curto / Vídeo Longo / Live / Post Estático) */
  readonly scriptBlocks: readonly ScriptBlockRow[];
  readonly connectionSevenLinesChecklist: readonly string[];

  /* 2. Lâminas de Carrossel 4:5 (10 slides) */
  readonly carouselSlides: readonly CarouselSlideItem[];

  /* 3. Sequências Diárias de Stories (Manhã, Almoço, Tarde, Noite + Q&A + Pós-Live) */
  readonly storyPeriods: readonly StoryPeriodSequence[];
  readonly predictiveQAs: readonly PredictiveQAItem[];
  readonly postLiveStoriesSummary: readonly string[];

  /* 4. Legenda / Descrição + Metadados de SEO */
  readonly captionOutdoorHook: string;
  readonly captionBody: string;
  readonly captionCta: string;
  readonly seoKeywords: readonly string[];
  readonly seoTags: readonly string[];
  readonly youtubeChapters: readonly string[];

  /* 5. Títulos (Mínimo 5-6) & Prompts de Imagem em Inglês */
  readonly titleVariations: readonly TitleVariationItem[];
  readonly imagePrompts: readonly ImagePromptAsset[];

  /* 6. Materiais Complementares (Funil/Isca) & Materiais de Explicação (Didático) */
  readonly qualifiedForComplementaryMaterial: boolean;
  readonly complementaryMaterial: {
    readonly typeLabel:
      | "Checklist PDF"
      | "Workbook Prático"
      | "Planilha Executiva XLSX";
    readonly title: string;
    readonly promise: string;
    readonly sectionsOutline: readonly string[];
  };
  readonly explanationMaterial: {
    readonly typeLabel:
      | "Mapa Mental da Aula"
      | "Framework Visual PDF"
      | "Planilha Didática";
    readonly title: string;
    readonly diagramNodes: readonly string[];
  };

  /* 7. Briefing de Recorte, História da Marca & Referências */
  readonly briefingCutAdjustment: string;
  readonly mandatoryExamplesToInclude: string;
  readonly brandStoryConnection: string;
  readonly selectedReferenceNote: string;
  readonly versionHistory: readonly ScriptVersionSnapshot[];
}

export interface RoteirosEditorialModuleProps {
  readonly projectId?: string;
  readonly projectName?: string;
  readonly projectNiche?: string;
  readonly projectSubniche?: string;
  readonly projectObjective?: string;
  readonly currentPhase?: string;
  readonly hasActiveLine?: boolean;
  readonly hasActiveCalendar?: boolean;
  readonly initialFormatSlug?: ScriptFormatSlug | null;
  readonly initialScriptId?: string | null;
  readonly initialPreselectedSlotId?: string | null;
  readonly initialPreselectedThemeTitle?: string | null;
  readonly isStandaloneStudioPage?: boolean;
  readonly onGoToLineTab?: () => void;
  readonly onGoToCalendarTab?: () => void;
  readonly onGoToThemesTab?: () => void;
}

/* ========================================================================== */
/* METADADOS DOS 6 FORMATOS OFICIAIS DA FUNÇÃO 03                             */
/* ========================================================================== */

export const SCRIPT_FORMATS_CATALOG: readonly {
  readonly slug: ScriptFormatSlug;
  readonly slotFormat: SlotContentFormat;
  readonly name: string;
  readonly shortName: string;
  readonly subtitle: string;
  readonly defaultDuration: string;
  readonly supportsSpeakingModeToggle: boolean;
  readonly forcesConnectionModeOnly: boolean;
  readonly icon: typeof Video;
  readonly accentBorder: string;
}[] = [
  {
    slug: "short_video",
    slotFormat: "reel_curto",
    name: "Vídeos Curtos (Reels / Shorts / TikTok)",
    shortName: "Vídeos Curtos",
    subtitle:
      "Scripts de até 60s com retenção cirúrgica, 7 bullets de câmera ou 2 colunas palavra por palavra.",
    defaultDuration: "45s a 60s (~140 palavras)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: Play,
    accentBorder: "border-la-border-gold/65",
  },
  {
    slug: "long_video",
    slotFormat: "video_longo",
    name: "Vídeos Longos (YouTube)",
    shortName: "Vídeos Longos",
    subtitle:
      "Aulas densas de 8 a 15 min em blocos encadeados, microciclos visuais a cada 20s, SEO e material didático.",
    defaultDuration: "10 a 15 min (~1.800 palavras)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: Video,
    accentBorder: "border-sky-400/50",
  },
  {
    slug: "live",
    slotFormat: "live_semanal",
    name: "Lives de Conteúdo (YouTube / Instagram / TikTok)",
    shortName: "Lives",
    subtitle:
      "Roteiro cronológico em Bullets de Alta Retenção + Sequência de Stories de Bastidores Pós-Live.",
    defaultDuration: "45 a 60 min (Ao Vivo)",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: true,
    icon: Radio,
    accentBorder: "border-rose-400/50",
  },
  {
    slug: "carousel",
    slotFormat: "carrossel",
    name: "Carrosséis 4:5 (Anatomia de 10 Slides)",
    shortName: "Carrosséis",
    subtitle:
      "Pipeline slide a slide com psicologia de corte de linha, design escaneável e prompts visuais por lâmina.",
    defaultDuration: "10 Lâminas (Proporção 4:5)",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: false,
    icon: Columns,
    accentBorder: "border-purple-400/50",
  },
  {
    slug: "static_post",
    slotFormat: "post_estatico",
    name: "Posts Estáticos de Alto Impacto",
    shortName: "Posts Estáticos",
    subtitle:
      "Síntese visual de autoridade, contraste ou diagnóstico rápido com legenda densa e prompt em inglês.",
    defaultDuration: "Peça Única + Legenda",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: false,
    icon: LayoutGrid,
    accentBorder: "border-white/25",
  },
  {
    slug: "stories_sequence",
    slotFormat: "sequencia_stories",
    name: "Sequências Diárias de Stories (M·A·T·N + Q&A)",
    shortName: "Sequências de Stories",
    subtitle:
      "Cronograma completo (Manhã, Almoço, Tarde e Noite) com 5 cards por bloco, legenda espelho e Q&A preditivo.",
    defaultDuration: "4 Blocos/dia (20 stories)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: MessageSquare,
    accentBorder: "border-emerald-400/50",
  },
] as const;

export const SCRIPT_STATUS_META: Record<
  ScriptProductionStatus,
  { readonly label: string; readonly badgeClass: string }
> = {
  draft: {
    label: "Rascunho",
    badgeClass: "border-white/15 bg-white/[0.05] text-la-text-secondary",
  },
  ready: {
    label: "Pronto",
    badgeClass: "border-la-gold bg-la-gold/20 text-la-gold-light",
  },
  in_production: {
    label: "Em Produção",
    badgeClass: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  },
  ab_test: {
    label: "Em Teste A/B",
    badgeClass: "border-purple-400/50 bg-purple-500/15 text-purple-200",
  },
  published: {
    label: "Publicado",
    badgeClass: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  },
  archived: {
    label: "Arquivado",
    badgeClass: "border-white/10 bg-black/50 text-la-text-muted",
  },
};

/* ========================================================================== */
/* OPÇÕES TIPADAS PARA O COMPONENTE DARKCUSTOMSELECT                          */
/* ========================================================================== */

const FORMAT_RETINA_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | RetinaTypeKey
>[] = [
  { value: "all", label: "Todos os Tipos RETINA" },
  ...(Object.keys(RETINA_META) as RetinaTypeKey[]).map((r) => ({
    value: r,
    label: `${RETINA_META[r].code} · ${RETINA_META[r].label}`,
  })),
];

const FORMAT_STATUS_FILTER_OPTIONS: readonly CustomSelectOption<
  "all" | ScriptProductionStatus
>[] = [
  { value: "all", label: "Status: Todos Ativos" },
  { value: "ready", label: "Pronto" },
  { value: "draft", label: "Rascunho" },
  { value: "in_production", label: "Em Produção" },
  { value: "ab_test", label: "Em Teste A/B" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivados" },
];

const STUDIO_STATUS_SELECT_OPTIONS: readonly CustomSelectOption<ScriptProductionStatus>[] =
  (Object.keys(SCRIPT_STATUS_META) as ScriptProductionStatus[]).map(
    (stKey) => ({
      value: stKey,
      label: `Status: ${SCRIPT_STATUS_META[stKey].label}`,
    })
  );

const CREATE_FORMAT_SELECT_OPTIONS: readonly CustomSelectOption<ScriptFormatSlug>[] =
  SCRIPT_FORMATS_CATALOG.map((f) => ({
    value: f.slug,
    label: f.name,
    badge: f.shortName,
  }));

export function mapSlotFormatToScriptSlug(
  slotFormat: SlotContentFormat
): ScriptFormatSlug {
  switch (slotFormat) {
    case "reel_curto":
      return "short_video";
    case "video_longo":
      return "long_video";
    case "live_semanal":
      return "live";
    case "carrossel":
      return "carousel";
    case "post_estatico":
      return "static_post";
    case "sequencia_stories":
      return "stories_sequence";
  }
}

/* ========================================================================== */
/* MAPEAMENTO DETERMINÍSTICO ENTRE SCHEMA BACKEND BFF E UI DA FUNÇÃO 03       */
/* ========================================================================== */

const SCRIPT_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function mapScriptSlugToBackendFormat(slug: ScriptFormatSlug): ScriptFormat {
  if (slug === "short_video") return "reel";
  return slug;
}

function mapBackendFormatToScriptSlug(
  format?: string,
  formatSlug?: string
): ScriptFormatSlug {
  const candidate = String(formatSlug || format || "").toLowerCase();
  if (candidate === "reel" || candidate === "short_video" || candidate === "reel_curto") {
    return "short_video";
  }
  if (candidate === "long_video" || candidate === "video_longo") {
    return "long_video";
  }
  if (candidate === "carousel" || candidate === "carrossel") {
    return "carousel";
  }
  if (candidate === "static_post" || candidate === "post_estatico") {
    return "static_post";
  }
  if (candidate === "live" || candidate === "live_semanal") {
    return "live";
  }
  if (candidate === "stories_sequence" || candidate === "sequencia_stories") {
    return "stories_sequence";
  }
  return "short_video";
}

function mapBackendStatusToUiStatus(st?: string): ScriptProductionStatus {
  const val = String(st || "").toLowerCase();
  if (val === "pronto" || val === "ready") return "ready";
  if (val === "in_production" || val === "em_producao") return "in_production";
  if (val === "teste_ab" || val === "ab_test") return "ab_test";
  if (val === "publicado" || val === "published") return "published";
  if (val === "arquivado" || val === "archived") return "archived";
  return "draft";
}

function mapUiStatusToBackendStatus(
  st: ScriptProductionStatus
): "rascunho" | "in_production" | "pronto" | "teste_ab" | "publicado" | "arquivado" {
  switch (st) {
    case "ready":
      return "pronto";
    case "in_production":
      return "in_production";
    case "ab_test":
      return "teste_ab";
    case "published":
      return "publicado";
    case "archived":
      return "arquivado";
    default:
      return "rascunho";
  }
}

function mapBackendScriptToRecord(
  s: any,
  brandStoryFallback = "",
  referenceNoteFallback = ""
): EditorialScriptRecord {
  const formatSlug = mapBackendFormatToScriptSlug(s.format, s.formatSlug);
  const meta =
    SCRIPT_FORMATS_CATALOG.find((f) => f.slug === formatSlug) ??
    SCRIPT_FORMATS_CATALOG[0]!;

  const speakingMode: ScriptSpeakingMode =
    meta.forcesConnectionModeOnly ||
    s.mode === "conexao" ||
    s.speakingMode === "BULLET_POINTS" ||
    s.speakingMode === "conexao_bullets"
      ? "conexao_bullets"
      : "seguranca_palavra";

  const scriptBlocks: ScriptBlockRow[] =
    Array.isArray(s.scriptBlocks) && s.scriptBlocks.length > 0
      ? s.scriptBlocks.map((b: any, idx: number) => ({
          id: String(b.id || `blk-${idx + 1}`),
          timecodeOrStage: String(b.timecodeOrStage || `Bloco ${idx + 1}`),
          psychologicalRole: String(b.psychologicalRole || "Desenvolvimento estratégico"),
          visualAndAudioDirection: String(b.visualAndAudioDirection || ""),
          wordForWordSpeech: String(b.wordForWordSpeech || ""),
          connectionBulletLine: String(b.connectionBulletLine || ""),
        }))
      : Array.isArray(s.blocks)
        ? s.blocks.map((b: any, idx: number) => ({
            id: String(b.id || b._id || `blk-${idx + 1}`),
            timecodeOrStage: b.timeRange
              ? `${b.timeRange} · ${b.title || `Bloco ${idx + 1}`}`
              : String(b.title || `Bloco ${idx + 1}`),
            psychologicalRole: String(b.type || "Desenvolvimento"),
            visualAndAudioDirection: String(b.visualDirection || ""),
            wordForWordSpeech: String(b.content || ""),
            connectionBulletLine: `• ${b.title || `Bloco ${idx + 1}`}: ${b.content || ""}`,
          }))
        : [];

  const carouselSlides: CarouselSlideItem[] = Array.isArray(s.carouselSlides)
    ? s.carouselSlides.map((sl: any, idx: number) => ({
        slideNumber: Number(sl.slideNumber || idx + 1),
        roleLabel: String(sl.roleLabel || `Slide ${String(idx + 1).padStart(2, "0")}`),
        headline: String(sl.headline || ""),
        bodyLineBreakCopy: String(sl.bodyLineBreakCopy || ""),
        visualDesignNote: String(sl.visualDesignNote || ""),
        imagePromptEN: String(sl.imagePromptEN || ""),
      }))
    : [];

  const storyPeriods: StoryPeriodSequence[] = Array.isArray(s.storyPeriods)
    ? s.storyPeriods.map((sp: any) => ({
        period: (sp.period || "Manhã") as "Manhã" | "Almoço" | "Tarde" | "Noite",
        suggestedTime: String(sp.suggestedTime || "09:00"),
        narrativeTheme: String(sp.narrativeTheme || ""),
        cards: Array.isArray(sp.cards)
          ? sp.cards.map((c: any, cIdx: number) => ({
              id: c.id ? String(c.id) : undefined,
              cardNumber: Math.min(5, Math.max(1, Number(c.cardNumber || cIdx + 1))) as
                | 1
                | 2
                | 3
                | 4
                | 5,
              cardType: (c.cardType || "video_fala") as
                | "video_fala"
                | "texto_sobre_foto"
                | "bastidor_prova",
              intentionLabel: String(c.intentionLabel || `Card ${cIdx + 1}`),
              wordForWordScript: String(c.wordForWordScript || c.spokenText || ""),
              connectionBullet: String(c.connectionBullet || c.wordForWordScript || ""),
              mirrorCaptionNoSound: String(c.mirrorCaptionNoSound || c.mirrorCaption || ""),
              instagramSticker: String(c.instagramSticker || c.sticker || "Sem sticker"),
              visualBrandingNote: String(c.visualBrandingNote || ""),
            }))
          : [],
      }))
    : [];

  const titleVariations: TitleVariationItem[] = Array.isArray(s.titleVariations)
    ? s.titleVariations.map((tv: any, idx: number) => ({
        id: String(tv.id || `tv-${idx + 1}`),
        hookCategory: (tv.hookCategory || "Erro Invisível") as TitleVariationItem["hookCategory"],
        titleText: String(tv.titleText || tv.title || s.title || ""),
        estimatedCtrBadge: String(tv.estimatedCtrBadge || "Variação estratégica"),
        isSelected: Boolean(tv.isSelected),
      }))
    : Array.isArray(s.titles)
      ? s.titles.map((tv: any, idx: number) => ({
          id: `tv-${idx + 1}`,
          hookCategory: "Erro Invisível",
          titleText: String(tv.title || tv),
          estimatedCtrBadge: String(tv.hookType || "Sugestão"),
          isSelected: idx === 0,
        }))
      : [];

  const imagePrompts: ImagePromptAsset[] = Array.isArray(s.imagePrompts)
    ? s.imagePrompts.map((ip: any, idx: number) => ({
        id: String(ip.id || `img-${idx + 1}`),
        targetPiece: String(ip.targetPiece || "Capa Editorial"),
        visualConceptPT: String(ip.visualConceptPT || ""),
        promptEnglish: String(ip.promptEnglish || ""),
        textOverlaySuggestion: String(ip.textOverlaySuggestion || ""),
      }))
    : Array.isArray(s.thumbnailPrompts)
      ? s.thumbnailPrompts.map((tp: any, idx: number) => ({
          id: `img-${idx + 1}`,
          targetPiece: `Capa ${idx + 1}`,
          visualConceptPT: String(tp.description || ""),
          promptEnglish: String(tp.promptEn || ""),
          textOverlaySuggestion: String(s.title || "").slice(0, 48).toUpperCase(),
        }))
      : [];

  const compMat = s.complementaryMaterial || s.complementaryMaterials?.[0];
  const explMat = s.explanationMaterial || s.explanationMaterials?.[0];

  const versionHistory: ScriptVersionSnapshot[] = Array.isArray(s.versionHistory)
    ? s.versionHistory.map((vh: any) => ({
        versionLabel: String(vh.versionLabel || `v${vh.version || 1}.0`),
        savedAt: String(vh.savedAt || "Salvo"),
        modeUsed: speakingMode,
        summaryNote: String(vh.summaryNote || vh.comment || ""),
      }))
    : [];

  const updatedLabel = s.updatedAt
    ? new Date(s.updatedAt).toLocaleDateString("pt-BR")
    : "Atualizado";

  return {
    id: String(s.id || s._id || ""),
    projectId: String(s.projectId || ""),
    title: String(s.title || "Roteiro Editorial"),
    formatSlug,
    calendarSlotFormat: s.calendarSlotFormat
      ? mapBackendFormatToUi(s.calendarSlotFormat)
      : meta.slotFormat,
    originType: s.originType === "theme_library" ? "theme_library" : "calendar_slot",
    linkedSlotId: s.linkedSlotId || s.calendarSlotId || undefined,
    linkedSlotLabel:
      s.linkedSlotLabel ||
      (s.calendarSlotId ? "Vinculado ao Calendário Editorial" : "Criado no Studio"),
    linkedThemeId: s.linkedThemeId || s.themeId || undefined,
    retinaType: mapBackendRetinaToUi(s.retinaType),
    strategicObjective: String(s.strategicObjective || "Posicionamento"),
    editorialPillar: String(s.editorialPillar || "Pilar Estratégico"),
    icpPainOrObjection: String(
      s.icpPainOrObjection || "Contexto mapeado na Base Estratégica."
    ),
    businessMoment: String(s.businessMoment || "Ciclo editorial atual"),
    platform: String(s.platform || "Instagram"),
    estimatedDurationOrSize: String(
      s.estimatedDurationOrSize || meta.defaultDuration
    ),
    status: mapBackendStatusToUiStatus(s.status),
    speakingMode,
    version:
      s.versionLabel || (typeof s.version === "number" ? `v${s.version}.0` : "v1.0"),
    updatedAt: updatedLabel,
    scriptBlocks,
    connectionSevenLinesChecklist: Array.isArray(s.connectionSevenLinesChecklist)
      ? s.connectionSevenLinesChecklist.map(String)
      : [],
    carouselSlides,
    storyPeriods,
    predictiveQAs: Array.isArray(s.predictiveQAs) ? s.predictiveQAs : [],
    postLiveStoriesSummary: Array.isArray(s.postLiveStoriesSummary)
      ? s.postLiveStoriesSummary.map(String)
      : [],
    captionOutdoorHook: String(s.captionOutdoorHook || ""),
    captionBody: String(s.captionBody || s.caption || ""),
    captionCta: String(s.captionCta || ""),
    seoKeywords: Array.isArray(s.seoKeywords) ? s.seoKeywords.map(String) : [],
    seoTags: Array.isArray(s.seoTags) ? s.seoTags.map(String) : [],
    youtubeChapters: Array.isArray(s.youtubeChapters)
      ? s.youtubeChapters.map(String)
      : [],
    titleVariations,
    imagePrompts,
    qualifiedForComplementaryMaterial: Boolean(
      s.qualifiedForComplementaryMaterial ?? compMat
    ),
    complementaryMaterial: compMat
      ? {
          typeLabel: (compMat.typeLabel || "Checklist PDF") as
            | "Checklist PDF"
            | "Workbook Prático"
            | "Planilha Executiva XLSX",
          title: String(compMat.title || `Material: ${s.title || "Conteúdo"}`),
          promise: String(compMat.promise || ""),
          sectionsOutline: Array.isArray(compMat.sectionsOutline)
            ? compMat.sectionsOutline.map(String)
            : Array.isArray(compMat.structure)
              ? compMat.structure.map(String)
              : [],
        }
      : {
          typeLabel: "Checklist PDF",
          title: "Material complementar",
          promise: "",
          sectionsOutline: [],
        },
    explanationMaterial: explMat
      ? {
          typeLabel: (explMat.typeLabel || "Mapa Mental da Aula") as
            | "Mapa Mental da Aula"
            | "Framework Visual PDF"
            | "Planilha Didática",
          title: String(explMat.title || "Mapa Mental de Apoio"),
          diagramNodes: Array.isArray(explMat.diagramNodes)
            ? explMat.diagramNodes.map(String)
            : explMat.content
              ? String(explMat.content).split("\n").filter(Boolean)
              : [],
        }
      : {
          typeLabel: "Mapa Mental da Aula",
          title: "Mapa Mental de Apoio",
          diagramNodes: [],
        },
    briefingCutAdjustment: String(s.briefingCutAdjustment || ""),
    mandatoryExamplesToInclude: String(s.mandatoryExamplesToInclude || ""),
    brandStoryConnection: String(
      s.brandStoryConnection || brandStoryFallback || ""
    ),
    selectedReferenceNote: String(
      s.selectedReferenceNote || referenceNoteFallback || ""
    ),
    versionHistory,
  };
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: RoteirosEditorialModule                              */
/* ========================================================================== */

export function RoteirosEditorialModule(props: RoteirosEditorialModuleProps) {
  const resolvedProjectId = props.projectId || "";
  const hasValidProjectId = SCRIPT_OBJECT_ID_REGEX.test(resolvedProjectId);
  const projectName = props.projectName || "Projeto Editorial";
  const resolvedObjective = props.projectObjective || "Posicionamento";
  const resolvedPhase = props.currentPhase || "Ciclo editorial atual";

  /* Lista de Roteiros do Projeto (MongoDB via BFF) */
  const [scripts, setScripts] = useState<readonly EditorialScriptRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(hasValidProjectId);
  const [isSubmittingScript, setIsSubmittingScript] = useState<boolean>(false);
  const [brandStorySummary, setBrandStorySummary] = useState<string>("");
  const [brandAssetReference, setBrandAssetReference] = useState<string>("");

  /* Slots do Calendário (F01) e Temas da Biblioteca (F02) carregados automaticamente */
  const [calendarSlots, setCalendarSlots] = useState<
    readonly CalendarSlotItem[]
  >([]);
  const [themeLibrary, setThemeLibrary] = useState<
    readonly StrategicThemeRecord[]
  >([]);

  /* Navegação entre as 3 Camadas da Função 03 */
  const [viewStage, setViewStage] = useState<
    "hub" | "format_list" | "studio"
  >(() => {
    if (props.initialScriptId || props.isStandaloneStudioPage) return "studio";
    if (props.initialFormatSlug) return "format_list";
    return "hub";
  });

  const [selectedFormatSlug, setSelectedFormatSlug] =
    useState<ScriptFormatSlug>(props.initialFormatSlug || "short_video");

  const [activeScriptId, setActiveScriptId] = useState<string>(
    props.initialScriptId || ""
  );

  /* Aba Interna dentro da Tela de Listagem do Formato */
  const [formatListSubTab, setFormatListSubTab] = useState<
    "scripts" | "calendar_slots" | "library_themes"
  >("scripts");
  const [formatRetinaFilter, setFormatRetinaFilter] = useState<
    "all" | RetinaTypeKey
  >("all");
  const [formatStatusFilter, setFormatStatusFilter] = useState<
    "all" | ScriptProductionStatus
  >("all");
  const [formatSearch, setFormatSearch] = useState<string>("");

  /* Aba Interna dentro do Studio do Roteiro */
  const [studioActiveTab, setStudioActiveTab] = useState<
    | "roteiro_blocos"
    | "legenda_seo"
    | "titulos_capas"
    | "materiais"
    | "briefing_versoes"
  >("roteiro_blocos");

  /* Estados interativos específicos de formatos dentro do Studio */
  const [activeCarouselSlideIndex, setActiveCarouselSlideIndex] =
    useState<number>(0);
  const [activeStoryPeriodTab, setActiveStoryPeriodTab] = useState<
    "Manhã" | "Almoço" | "Tarde" | "Noite"
  >("Manhã");
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  /* Modal de Criação de Novo Roteiro (A partir de Slot F01 ou Tema F02) */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createOrigin, setCreateOrigin] = useState<
    "calendar_slot" | "theme_library"
  >("calendar_slot");
  const [createFormatSlug, setCreateFormatSlug] =
    useState<ScriptFormatSlug>("short_video");
  const [createSelectedSlotId, setCreateSelectedSlotId] = useState<string>("");
  const [createSelectedThemeId, setCreateSelectedThemeId] =
    useState<string>("");
  const [createCustomTitle, setCreateCustomTitle] = useState<string>("");
  const [createSpeakingMode] =
    useState<ScriptSpeakingMode>("conexao_bullets");

  const studioTitleRef = useRef<HTMLTextAreaElement | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Opções dinâmicas para os seletores do Modal de Criação */
  const createSlotSelectOptions = useMemo((): readonly CustomSelectOption<string>[] => {
    return [
      { value: "", label: "Digitar tema personalizado abaixo..." },
      ...calendarSlots.slice(0, 14).map((s) => ({
        value: s.id,
        label: `${String(s.dayNumber).padStart(2, "0")} ${s.monthShort} • ${FORMAT_META[s.format].shortLabel} • ${s.mainTheme || s.provisionalTitle}`,
      })),
    ];
  }, [calendarSlots]);

  const createThemeSelectOptions = useMemo((): readonly CustomSelectOption<string>[] => {
    return [
      { value: "", label: "Digitar tema personalizado abaixo..." },
      ...themeLibrary.map((t) => ({
        value: t.id,
        label: `[${RETINA_META[t.retinaType].label}] ${t.title}`,
      })),
    ];
  }, [themeLibrary]);

  /* Carrega Roteiros, Calendário (F01), Temas (F02), BrandStory e Ativos via BFF */
  const loadScriptsWorkspaceData = useCallback(async () => {
    if (!hasValidProjectId) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const [rawScripts, rawCalendars, rawThemes, brandStoryRes, assetsRes] =
        await Promise.all([
          scriptsService.listScripts(resolvedProjectId),
          editorialService.listCalendars(resolvedProjectId),
          themesService.listLibrary(resolvedProjectId),
          scriptsService.getBrandStory(resolvedProjectId).catch(() => null),
          storageService.getAssets().catch(() => ({ assets: [] })),
        ]);

      const brandStoryText =
        brandStoryRes?.narrative ||
        brandStoryRes?.story ||
        brandStoryRes?.summary ||
        "";
      const refAssetTitle = assetsRes?.assets?.[0]?.title
        ? `Ativo de marca: ${assetsRes.assets[0].title}`
        : "";
      setBrandStorySummary(brandStoryText);
      setBrandAssetReference(refAssetTitle);

      const mappedScripts = rawScripts.map((s) =>
        mapBackendScriptToRecord(s, brandStoryText, refAssetTitle)
      );
      setScripts(mappedScripts);

      if (props.initialScriptId) {
        const exists = mappedScripts.some(
          (s) => s.id === props.initialScriptId
        );
        if (exists) {
          setActiveScriptId(props.initialScriptId);
          setViewStage("studio");
        }
      } else if (mappedScripts[0]) {
        setActiveScriptId((prev) =>
          prev && mappedScripts.some((s) => s.id === prev)
            ? prev
            : mappedScripts[0]!.id
        );
      }

      const activeCalRaw =
        rawCalendars.find((c) => c.status === "active") ?? rawCalendars[0];
      if (activeCalRaw) {
        const mappedCal = mapBackendCalendarToRecord(
          activeCalRaw,
          "Linha Editorial"
        );
        setCalendarSlots(mappedCal.slots);
      } else {
        setCalendarSlots([]);
      }

      setThemeLibrary(rawThemes.map(mapBackendThemeToRecord));
    } catch {
      setCopiedFeedback(
        "Não foi possível carregar os roteiros do servidor agora."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [hasValidProjectId, resolvedProjectId, props.initialScriptId]);

  useEffect(() => {
    void loadScriptsWorkspaceData();
  }, [loadScriptsWorkspaceData]);

  /* Se veio com um Slot ou Tema pré-selecionado da Aba Calendário ou Temas, abre criação */
  useEffect(() => {
    if (props.initialPreselectedThemeTitle) {
      setCreateCustomTitle(props.initialPreselectedThemeTitle);
      setCreateOrigin(
        props.initialPreselectedSlotId ? "calendar_slot" : "theme_library"
      );
      setIsCreateModalOpen(true);
    }
  }, [props.initialPreselectedSlotId, props.initialPreselectedThemeTitle]);

  const currentScript = useMemo((): EditorialScriptRecord | null => {
    if (scripts.length === 0) return null;
    return scripts.find((s) => s.id === activeScriptId) ?? scripts[0] ?? null;
  }, [scripts, activeScriptId]);

  /* Auto-ajuste de altura do título editável no Studio para nunca cortar */
  useEffect(() => {
    const el = studioTitleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(44, el.scrollHeight)}px`;
  }, [currentScript?.title, viewStage]);

  const updateCurrentScript = useCallback(
    (
      updater: (prev: EditorialScriptRecord) => EditorialScriptRecord,
      immediate = false
    ) => {
      if (!currentScript) return;
      const targetId = currentScript.id;
      let nextRecord: EditorialScriptRecord | null = null;

      setScripts((prevList) =>
        prevList.map((s) => {
          if (s.id !== targetId) return s;
          nextRecord = { ...updater(s), updatedAt: "Salvo agora" };
          return nextRecord;
        })
      );

      if (!hasValidProjectId || !SCRIPT_OBJECT_ID_REGEX.test(targetId)) return;

      const persistPatch = async () => {
        if (!nextRecord) return;
        try {
          await scriptsService.updateScript(resolvedProjectId, targetId, {
            title: nextRecord.title,
            status: mapUiStatusToBackendStatus(nextRecord.status),
            mode:
              nextRecord.speakingMode === "seguranca_palavra"
                ? "seguranca"
                : "conexao",
            speakingMode:
              nextRecord.speakingMode === "seguranca_palavra"
                ? "TELEPROMPTER"
                : "BULLET_POINTS",
            scriptBlocks:
              nextRecord.scriptBlocks as unknown as Record<string, unknown>[],
            carouselSlides:
              nextRecord.carouselSlides as unknown as Record<string, unknown>[],
            storyPeriods:
              nextRecord.storyPeriods as unknown as Record<string, unknown>[],
            caption: [
              nextRecord.captionOutdoorHook,
              nextRecord.captionBody,
              nextRecord.captionCta,
            ]
              .filter(Boolean)
              .join("\n\n"),
            captionOutdoorHook: nextRecord.captionOutdoorHook,
            captionBody: nextRecord.captionBody,
            captionCta: nextRecord.captionCta,
            qualifiedForComplementaryMaterial:
              nextRecord.qualifiedForComplementaryMaterial,
            complementaryMaterial:
              nextRecord.complementaryMaterial as unknown as Record<
                string,
                unknown
              >,
            briefingCutAdjustment: nextRecord.briefingCutAdjustment,
            mandatoryExamplesToInclude: nextRecord.mandatoryExamplesToInclude,
            brandStoryConnection: nextRecord.brandStoryConnection,
            selectedReferenceNote: nextRecord.selectedReferenceNote,
            versionLabel: nextRecord.version,
          });
        } catch {
          /* Mantém UI responsiva caso edição ocorra offline */
        }
      };

      if (immediate) {
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        void persistPatch();
      } else {
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        updateTimerRef.current = setTimeout(() => {
          void persistPatch();
        }, 500);
      }
    },
    [currentScript, hasValidProjectId, resolvedProjectId]
  );

  const handleCopyText = (text: string, label: string) => {
    try {
      void navigator.clipboard.writeText(text);
      setCopiedFeedback(`${label} copiado para a área de transferência!`);
      setTimeout(() => setCopiedFeedback(null), 2600);
    } catch {
      /* Ignora bloqueio */
    }
  };

  /* Roteirizar diretamente um Slot do Calendário (Função 01 -> Função 03) */
  const handleCreateScriptFromCalendarSlot = async (slot: CalendarSlotItem) => {
    if (!hasValidProjectId || isSubmittingScript) return;
    const slug = mapSlotFormatToScriptSlug(slot.format);
    setIsSubmittingScript(true);

    try {
      const createdRaw = await scriptsService.createScript(resolvedProjectId, {
        format: mapScriptSlugToBackendFormat(slug),
        mode: "conexao",
        calendarSlotId: SCRIPT_OBJECT_ID_REGEX.test(slot.id)
          ? slot.id
          : undefined,
        title: slot.mainTheme.trim() || slot.provisionalTitle,
        autoGenerate: true,
        formatSlug: slug,
        calendarSlotFormat: slot.format,
        originType: "calendar_slot",
        linkedSlotId: slot.id,
        linkedSlotLabel: `${slot.dayOfWeekLabel}, ${String(slot.dayNumber).padStart(2, "0")} ${slot.monthShort} • ${slot.suggestedTime} • ${slot.platforms.join("/")}`,
        retinaType: slot.retinaType,
        strategicObjective: slot.strategicObjective,
        editorialPillar: slot.editorialPillar,
        icpPainOrObjection: slot.icpPainDesireOrObjection,
        businessMoment: resolvedPhase,
        platform: slot.platforms[0] || "Instagram",
        speakingMode: "BULLET_POINTS",
      });

      const created = mapBackendScriptToRecord(
        createdRaw,
        brandStorySummary,
        brandAssetReference
      );
      setScripts((prev) => [created, ...prev]);
      setSelectedFormatSlug(slug);
      setActiveScriptId(created.id);
      setStudioActiveTab("roteiro_blocos");
      setViewStage("studio");
    } catch {
      setCopiedFeedback("Erro ao gerar pacote de roteiro a partir do slot.");
    } finally {
      setIsSubmittingScript(false);
    }
  };

  /* Roteirizar diretamente um Tema da Biblioteca (Função 02 -> Função 03) */
  const handleCreateScriptFromTheme = async (
    theme: StrategicThemeRecord,
    overrideFormatSlug?: ScriptFormatSlug
  ) => {
    if (!hasValidProjectId || isSubmittingScript) return;
    const slug =
      overrideFormatSlug || mapSlotFormatToScriptSlug(theme.recommendedFormat);
    setIsSubmittingScript(true);

    try {
      const createdRaw = await scriptsService.createScript(resolvedProjectId, {
        format: mapScriptSlugToBackendFormat(slug),
        mode: "conexao",
        themeId: SCRIPT_OBJECT_ID_REGEX.test(theme.id) ? theme.id : undefined,
        title: theme.title,
        autoGenerate: true,
        formatSlug: slug,
        calendarSlotFormat: theme.recommendedFormat,
        originType: "theme_library",
        linkedThemeId: theme.id,
        linkedSlotLabel: `Criado a partir da Biblioteca de Temas (${theme.origin})`,
        retinaType: theme.retinaType,
        strategicObjective: `Apoiar ${resolvedObjective} na etapa de ${theme.journeyStage}`,
        editorialPillar: theme.romaPillar,
        icpPainOrObjection: theme.painDesireOrObjection,
        businessMoment: resolvedPhase,
        platform: theme.recommendedPlatform,
        speakingMode: "BULLET_POINTS",
      });

      const created = mapBackendScriptToRecord(
        createdRaw,
        brandStorySummary,
        brandAssetReference
      );
      setScripts((prev) => [created, ...prev]);
      setSelectedFormatSlug(slug);
      setActiveScriptId(created.id);
      setStudioActiveTab("roteiro_blocos");
      setViewStage("studio");
    } catch {
      setCopiedFeedback("Erro ao gerar roteiro a partir do tema selecionado.");
    } finally {
      setIsSubmittingScript(false);
    }
  };

  /* Submissão do Modal de Criação */
  const handleCreateScriptModalSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!hasValidProjectId || isSubmittingScript) return;

    if (createOrigin === "calendar_slot" && createSelectedSlotId) {
      const slot = calendarSlots.find((s) => s.id === createSelectedSlotId);
      if (slot) {
        setIsCreateModalOpen(false);
        await handleCreateScriptFromCalendarSlot(slot);
        return;
      }
    }

    if (createOrigin === "theme_library" && createSelectedThemeId) {
      const theme = themeLibrary.find((t) => t.id === createSelectedThemeId);
      if (theme) {
        setIsCreateModalOpen(false);
        await handleCreateScriptFromTheme(theme, createFormatSlug);
        return;
      }
    }

    setIsSubmittingScript(true);
    try {
      const formatMeta =
        SCRIPT_FORMATS_CATALOG.find((f) => f.slug === createFormatSlug) ??
        SCRIPT_FORMATS_CATALOG[0]!;

      const createdRaw = await scriptsService.createScript(resolvedProjectId, {
        format: mapScriptSlugToBackendFormat(createFormatSlug),
        mode:
          createSpeakingMode === "seguranca_palavra" ? "seguranca" : "conexao",
        title:
          createCustomTitle.trim() ||
          `Roteiro Estratégico — ${formatMeta.shortName}`,
        autoGenerate: true,
        formatSlug: createFormatSlug,
        calendarSlotFormat: formatMeta.slotFormat,
        originType: createOrigin,
        linkedSlotLabel:
          createOrigin === "calendar_slot"
            ? "Slot do Calendário Editorial"
            : "Tema da Biblioteca Estratégica",
        retinaType: "Transformacao",
        strategicObjective: `Apoiar ${resolvedObjective} com conteúdo contextualizado`,
        editorialPillar: "Posicionamento & Oferta",
        icpPainOrObjection: "Contexto mapeado na Base Estratégica",
        businessMoment: resolvedPhase,
        platform: createFormatSlug === "long_video" ? "YouTube" : "Instagram",
        speakingMode:
          createSpeakingMode === "seguranca_palavra"
            ? "TELEPROMPTER"
            : "BULLET_POINTS",
      });

      const created = mapBackendScriptToRecord(
        createdRaw,
        brandStorySummary,
        brandAssetReference
      );
      setScripts((prev) => [created, ...prev]);
      setSelectedFormatSlug(createFormatSlug);
      setActiveScriptId(created.id);
      setCreateCustomTitle("");
      setIsCreateModalOpen(false);
      setStudioActiveTab("roteiro_blocos");
      setViewStage("studio");
    } catch {
      setCopiedFeedback("Erro ao criar pacote completo de roteiro.");
    } finally {
      setIsSubmittingScript(false);
    }
  };

  const handleDuplicateScript = async (scr: EditorialScriptRecord) => {
    if (!hasValidProjectId || !SCRIPT_OBJECT_ID_REGEX.test(scr.id)) return;
    try {
      const dupRaw = await scriptsService.duplicateScript(
        resolvedProjectId,
        scr.id
      );
      const dup = mapBackendScriptToRecord(
        dupRaw,
        brandStorySummary,
        brandAssetReference
      );
      setScripts((prev) => [dup, ...prev]);
      setCopiedFeedback("Variação A/B criada no servidor!");
      setTimeout(() => setCopiedFeedback(null), 2600);
    } catch {
      setCopiedFeedback("Não foi possível duplicar este roteiro.");
    }
  };

  const handleDeleteScript = async (scr: EditorialScriptRecord) => {
    if (!hasValidProjectId || !SCRIPT_OBJECT_ID_REGEX.test(scr.id)) return;
    try {
      await scriptsService.archiveScript(resolvedProjectId, scr.id);
      setScripts((prev) => prev.filter((item) => item.id !== scr.id));
      if (activeScriptId === scr.id) {
        setActiveScriptId("");
      }
      setCopiedFeedback("Roteiro arquivado com sucesso.");
      setTimeout(() => setCopiedFeedback(null), 2400);
    } catch {
      setCopiedFeedback("Não foi possível remover o roteiro selecionado.");
    }
  };

  const handleSaveNewScriptVersion = async () => {
    if (
      !currentScript ||
      !hasValidProjectId ||
      !SCRIPT_OBJECT_ID_REGEX.test(currentScript.id)
    ) {
      return;
    }

    const nextVerNumber = currentScript.versionHistory.length + 1;
    const nextVerLabel = `v${nextVerNumber}.0`;
    const note = `Versão consolidada (${currentScript.title.slice(0, 36)}...)`;

    try {
      await scriptsService.createVersion(
        resolvedProjectId,
        currentScript.id,
        note
      );
      const snapshot: ScriptVersionSnapshot = {
        versionLabel: nextVerLabel,
        savedAt: "Salvo agora",
        modeUsed: currentScript.speakingMode,
        summaryNote: note,
      };
      updateCurrentScript(
        (prev) => ({
          ...prev,
          version: nextVerLabel,
          versionHistory: [snapshot, ...prev.versionHistory],
        }),
        true
      );
      setCopiedFeedback(
        `Nova versão ${nextVerLabel} salva no histórico deste roteiro!`
      );
      setTimeout(() => setCopiedFeedback(null), 2600);
    } catch {
      setCopiedFeedback("Não foi possível salvar a nova versão no servidor.");
    }
  };

  /* Regenerar um único card de Story mantendo o encadeamento via BackEnd */
  const handleRegenerateSingleStoryCard = async (
    period: "Manhã" | "Almoço" | "Tarde" | "Noite",
    cardNumber: 1 | 2 | 3 | 4 | 5
  ) => {
    if (
      !currentScript ||
      !hasValidProjectId ||
      !SCRIPT_OBJECT_ID_REGEX.test(currentScript.id)
    ) {
      return;
    }

    const activePeriod = currentScript.storyPeriods.find(
      (p) => p.period === period
    );
    const existingCard = activePeriod?.cards.find(
      (c) => c.cardNumber === cardNumber
    );

    try {
      const res = await scriptsService.regenerateStoryCard(
        resolvedProjectId,
        currentScript.id,
        {
          period,
          cardId: existingCard?.id,
          cardNumber,
          currentCard: existingCard as unknown as Record<string, unknown>,
          currentObjective: existingCard?.intentionLabel,
          currentText: existingCard?.wordForWordScript,
        }
      );

      if (res?.script) {
        const refreshed = mapBackendScriptToRecord(
          res.script,
          brandStorySummary,
          brandAssetReference
        );
        setScripts((prev) =>
          prev.map((s) => (s.id === refreshed.id ? refreshed : s))
        );
      } else if (res?.card) {
        updateCurrentScript(
          (prev) => ({
            ...prev,
            storyPeriods: prev.storyPeriods.map((sp) => {
              if (sp.period !== period) return sp;
              return {
                ...sp,
                cards: sp.cards.map((c) => {
                  if (c.cardNumber !== cardNumber) return c;
                  return {
                    ...c,
                    wordForWordScript: String(
                      res.card.wordForWordScript ||
                        res.card.spokenText ||
                        c.wordForWordScript
                    ),
                    connectionBullet: String(
                      res.card.connectionBullet || c.connectionBullet
                    ),
                    mirrorCaptionNoSound: String(
                      res.card.mirrorCaptionNoSound ||
                        res.card.mirrorCaption ||
                        c.mirrorCaptionNoSound
                    ),
                  };
                }),
              };
            }),
          }),
          true
        );
      }

      setCopiedFeedback(
        `Story #0${cardNumber} do bloco da ${period} regenerado sem quebrar o encadeamento!`
      );
      setTimeout(() => setCopiedFeedback(null), 2400);
    } catch {
      setCopiedFeedback("Não foi possível regenerar o card de Story agora.");
    }
  };

  const activeFormatMeta = useMemo(() => {
    return (
      SCRIPT_FORMATS_CATALOG.find((f) => f.slug === selectedFormatSlug) ??
      SCRIPT_FORMATS_CATALOG[0]!
    );
  }, [selectedFormatSlug]);

  const scriptsForSelectedFormat = useMemo(() => {
    return scripts.filter((s) => {
      if (s.formatSlug !== selectedFormatSlug) return false;
      if (formatStatusFilter === "all" && s.status === "archived") {
        return false;
      }
      if (formatStatusFilter !== "all" && s.status !== formatStatusFilter) {
        return false;
      }
      if (formatRetinaFilter !== "all" && s.retinaType !== formatRetinaFilter) {
        return false;
      }
      if (!formatSearch.trim()) return true;
      const q = formatSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.editorialPillar.toLowerCase().includes(q) ||
        s.linkedSlotLabel.toLowerCase().includes(q)
      );
    });
  }, [
    scripts,
    selectedFormatSlug,
    formatStatusFilter,
    formatRetinaFilter,
    formatSearch,
  ]);

  const slotsForSelectedFormat = useMemo(() => {
    return calendarSlots.filter(
      (s) => s.format === activeFormatMeta.slotFormat
    );
  }, [calendarSlots, activeFormatMeta.slotFormat]);

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Flutuante de Confirmação de Cópia / Versão */}
      <AnimatePresence>
        {copiedFeedback ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-la-xl border border-emerald-400/50 bg-emerald-950/40 px-4 py-3 text-emerald-100 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="font-la-sans text-[0.8125rem] font-medium">
                {copiedFeedback}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCopiedFeedback(null)}
              className="text-emerald-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* CABEÇALHO SUPERIOR DA FUNÇÃO 03 — MOTOR DE ROTEIRIZAÇÃO E ATIVOS    */}
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
                <FileText className="h-3.5 w-3.5 text-la-gold" />
                <span>
                  FUNÇÃO 03 · MOTOR DE ROTEIRIZAÇÃO E PACOTES DE ATIVOS POR
                  FORMATO
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>
                  {scripts.filter((s) => s.status !== "archived").length}{" "}
                  pacotes de roteiro ativos neste projeto
                </span>
              </span>
            </div>

            <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
              Criação de Roteiros e Ativos por Formato
            </h2>
            <p className="mt-1 max-w-[56rem] font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
              Transforme os slots do Calendário Editorial (Função 01) e os temas
              da Biblioteca (Função 02) em pacotes completos de execução:
              roteiro estruturado, legenda, títulos, direção de capa, prompts de
              imagem e materiais complementares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {viewStage !== "hub" && !props.isStandaloneStudioPage ? (
              <button
                type="button"
                onClick={() => setViewStage("hub")}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/14 bg-white/[0.03] px-3.5 py-2 font-la-mono text-[0.75rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                <span>Painel dos 6 Formatos</span>
              </button>
            ) : null}

            {/* CORRIGIDO: Ícone <Plus /> preservado e removido o "+" textual duplicado */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Novo Roteiro Contextualizado</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Rápida entre os 6 Formatos */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/55 p-1.5">
            <button
              type="button"
              onClick={() => setViewStage("hub")}
              className={clsx(
                "rounded-la-md px-3 py-1.5 font-la-mono text-[0.75rem] font-semibold transition-all",
                viewStage === "hub"
                  ? "bg-la-gold text-la-text-inverse"
                  : "text-la-text-secondary hover:text-la-text-primary"
              )}
            >
              Visão Geral (6 Formatos)
            </button>

            {SCRIPT_FORMATS_CATALOG.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected =
                viewStage !== "hub" && selectedFormatSlug === fmt.slug;
              const count = scripts.filter(
                (s) => s.formatSlug === fmt.slug && s.status !== "archived"
              ).length;

              return (
                <button
                  key={fmt.slug}
                  type="button"
                  onClick={() => {
                    setSelectedFormatSlug(fmt.slug);
                    setViewStage("format_list");
                  }}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-la-md px-3 py-1.5 font-la-sans text-[0.75rem] font-medium transition-all",
                    isSelected
                      ? "bg-la-gold font-semibold text-la-text-inverse"
                      : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-3.5 w-3.5",
                      isSelected ? "text-la-text-inverse" : "text-la-gold"
                    )}
                  />
                  <span>{fmt.shortName}</span>
                  <span className="font-la-mono text-[0.625rem] opacity-80">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {viewStage === "studio" && currentScript ? (
            <Link
              href={`/dashboard/editorial/${resolvedProjectId}/roteiros/${currentScript.formatSlug}/${currentScript.id}`}
              className="inline-flex items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir este Roteiro em Página Própria Dedicada</span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* =================================================================== */}
      {/* CAMADA 1: PAINEL GERAL DOS 6 FORMATOS (SEÇÃO 3.2 DA FUNÇÃO 03)      */}
      {/* =================================================================== */}
      {viewStage === "hub" ? (
        <section className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SCRIPT_FORMATS_CATALOG.map((fmt) => {
            const Icon = fmt.icon;
            const list = scripts.filter(
              (s) => s.formatSlug === fmt.slug && s.status !== "archived"
            );
            const readyCount = list.filter(
              (s) => s.status === "ready" || s.status === "published"
            ).length;
            const draftCount = list.filter((s) => s.status === "draft").length;
            const abTestCount = list.filter(
              (s) => s.status === "ab_test"
            ).length;
            const openSlotsForFormat = calendarSlots.filter(
              (s) => s.format === fmt.slotFormat
            ).length;

            return (
              <article
                key={fmt.slug}
                className={clsx(
                  "flex flex-col justify-between rounded-la-xl border bg-[#090D16]/95 p-6 shadow-xl transition-all hover:border-la-gold",
                  fmt.accentBorder
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="text-right">
                      <span className="font-la-sans text-[1.75rem] font-bold leading-none text-la-text-primary">
                        {list.length}
                      </span>
                      <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                        roteiros
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {fmt.name}
                  </h3>
                  <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                    {fmt.subtitle}
                  </p>

                  {/* Contadores por Status + Slots do Calendário daquele formato */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 font-la-mono text-[0.625rem]">
                    <span className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2 py-0.5 font-semibold text-la-gold-light">
                      Prontos: {readyCount}
                    </span>
                    <span className="rounded-la-xs border border-white/12 bg-white/[0.04] px-2 py-0.5 text-la-text-secondary">
                      Rascunhos: {draftCount}
                    </span>
                    {abTestCount > 0 ? (
                      <span className="rounded-la-xs border border-purple-400/45 bg-purple-500/15 px-2 py-0.5 text-purple-200">
                        Teste A/B: {abTestCount}
                      </span>
                    ) : null}
                    <span className="rounded-la-xs border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                      {openSlotsForFormat > 0
                        ? `${openSlotsForFormat} slots na agenda`
                        : "Pronto p/ criar"}
                    </span>
                  </div>
                </div>

                {/* Atalhos Oficiais do Card de Formato (Seção 3.2) */}
                <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormatSlug(fmt.slug);
                      setFormatListSubTab("scripts");
                      setViewStage("format_list");
                    }}
                    className="inline-flex min-h-[2.625rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <span>Abrir Quadro de {fmt.shortName}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormatSlug(fmt.slug);
                        setFormatListSubTab("calendar_slots");
                        setViewStage("format_list");
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-la-md border border-white/12 bg-black/50 px-2.5 py-1.5 font-la-mono text-[0.625rem] text-la-gold-light transition-colors hover:border-la-gold"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>A partir de Slot (F01)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormatSlug(fmt.slug);
                        setFormatListSubTab("library_themes");
                        setViewStage("format_list");
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-la-md border border-white/12 bg-black/50 px-2.5 py-1.5 font-la-mono text-[0.625rem] text-la-text-secondary transition-colors hover:border-la-gold hover:text-la-text-primary"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>A partir de Tema (F02)</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CAMADA 2: TELA DE FORMATO ESPECÍFICO (ROTEIROS + SLOTS + TEMAS)     */}
      {/* =================================================================== */}
      {viewStage === "format_list" ? (
        <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
            <div>
              <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                QUADRO DE PRODUÇÃO DO FORMATO · {activeFormatMeta.defaultDuration}
              </span>
              <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                {activeFormatMeta.name}
              </h3>
            </div>

            {/* 3 Sub-Abas do Formato: Roteiros Criados | Slots do Calendário deste Formato | Temas da Biblioteca */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/60 p-1">
              {[
                {
                  id: "scripts" as const,
                  label: `1. Roteiros deste Formato (${scriptsForSelectedFormat.length})`,
                },
                {
                  id: "calendar_slots" as const,
                  label: `2. Slots do Calendário p/ ${activeFormatMeta.shortName} (${slotsForSelectedFormat.length})`,
                },
                {
                  id: "library_themes" as const,
                  label: `3. Temas da Biblioteca (${themeLibrary.length})`,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormatListSubTab(st.id)}
                  className={clsx(
                    "rounded-la-md px-3 py-1.5 font-la-sans text-[0.75rem] font-semibold transition-all",
                    formatListSubTab === st.id
                      ? "bg-la-gold text-la-text-inverse"
                      : "text-la-text-secondary hover:text-la-text-primary"
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-ABA A: LISTA DE ROTEIROS CRIADOS NAQUELE FORMATO */}
          {formatListSubTab === "scripts" ? (
            <div className="flex flex-col gap-4">
              {/* Filtros Internos do Formato com DarkCustomSelect */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-[24rem]">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-gold" />
                  <input
                    type="search"
                    placeholder="Buscar roteiro por título, pilar ou slot..."
                    value={formatSearch}
                    onChange={(e) => setFormatSearch(e.target.value)}
                    className="min-h-[2.625rem] w-full rounded-la-md border border-white/12 bg-black/60 py-1.5 pr-4 pl-10 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* SELECT 1: Filtro por Tipo RETINA com DarkCustomSelect */}
                  <div className="min-w-[14.5rem]">
                    <DarkCustomSelect
                      fullWidth
                      value={formatRetinaFilter}
                      options={FORMAT_RETINA_FILTER_OPTIONS}
                      onChange={(val) =>
                        setFormatRetinaFilter(val as "all" | RetinaTypeKey)
                      }
                      ariaLabel="Filtrar roteiros por tipo RETINA"
                    />
                  </div>

                  {/* SELECT 2: Filtro por Status com DarkCustomSelect */}
                  <div className="min-w-[14rem]">
                    <DarkCustomSelect
                      fullWidth
                      align="right"
                      value={formatStatusFilter}
                      options={FORMAT_STATUS_FILTER_OPTIONS}
                      onChange={(val) =>
                        setFormatStatusFilter(
                          val as "all" | ScriptProductionStatus
                        )
                      }
                      ariaLabel="Filtrar roteiros por status"
                    />
                  </div>
                </div>
              </div>

              {scriptsForSelectedFormat.length === 0 ? (
                <div className="rounded-la-xl border border-white/10 bg-black/45 p-8 text-center">
                  <p className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                    Nenhum roteiro encontrado neste filtro para{" "}
                    {activeFormatMeta.shortName}.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormatListSubTab("calendar_slots")}
                      className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                    >
                      Escolher Slot do Calendário
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatListSubTab("library_themes")}
                      className="rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light"
                    >
                      Escolher Tema da Biblioteca
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {scriptsForSelectedFormat.map((scr) => {
                    const retMeta = RETINA_META[scr.retinaType];
                    const stMeta = SCRIPT_STATUS_META[scr.status];

                    return (
                      <div
                        key={scr.id}
                        className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-5 transition-all hover:border-la-gold lg:flex-row lg:items-center"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.625rem]">
                            <span
                              className={clsx(
                                "rounded-la-full border px-2.5 py-0.5 font-semibold",
                                stMeta.badgeClass
                              )}
                            >
                              {stMeta.label}
                            </span>
                            <span
                              className={clsx(
                                "rounded-la-full border px-2.5 py-0.5 font-semibold",
                                retMeta.badgeClass
                              )}
                            >
                              {retMeta.code} · {retMeta.label}
                            </span>
                            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 text-la-gold-light">
                              {scr.version} •{" "}
                              {scr.speakingMode === "conexao_bullets"
                                ? "Modo Conexão (Bullets)"
                                : "Modo Segurança (Palavra por Palavra)"}
                            </span>
                            <span className="text-la-text-muted">
                              {scr.linkedSlotLabel}
                            </span>
                          </div>

                          <h4 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                            {scr.title}
                          </h4>

                          <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                            Pilar: {scr.editorialPillar} • Objetivo:{" "}
                            {scr.strategicObjective} • Duração:{" "}
                            {scr.estimatedDurationOrSize}
                          </p>
                        </div>

                        {/* Ações Rápidas Oficiais */}
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScriptId(scr.id);
                              setStudioActiveTab("roteiro_blocos");
                              setViewStage("studio");
                            }}
                            className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Abrir Roteiro Completo</span>
                          </button>

                          <Link
                            href={`/dashboard/editorial/${resolvedProjectId}/roteiros/${scr.formatSlug}/${scr.id}`}
                            className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Página Dedicada</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicateScript(scr)}
                            title="Duplicar roteiro para variação A/B"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                `${scr.title}\n\nLEGENDA:\n${scr.captionOutdoorHook}\n\n${scr.captionBody}\n\n${scr.captionCta}`,
                                "Pacote do roteiro"
                              )
                            }
                            title="Exportar / Copiar pacote"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteScript(scr)}
                            title="Arquivar / Excluir roteiro"
                            aria-label={`Arquivar roteiro ${scr.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-muted hover:border-rose-400/50 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {/* SUB-ABA B: SLOTS DO CALENDÁRIO VINCULADOS A ESTE FORMATO */}
          {formatListSubTab === "calendar_slots" ? (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-la-lg border border-la-border-gold/40 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                  INTEGRAÇÃO DIRETA COM O CALENDÁRIO EDITORIAL (FUNÇÃO 01)
                </span>
                <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  Exibindo exclusivamente os slots do Calendário Editorial
                  configurados para <strong>{activeFormatMeta.name}</strong>. Ao
                  clicar em &ldquo;Roteirizar este Slot&rdquo;, a IA carrega
                  todos os metadados do slot e gera o pacote completo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {slotsForSelectedFormat.length === 0 ? (
                  <div className="col-span-full rounded-la-xl border border-dashed border-white/15 bg-black/45 p-8 text-center">
                    <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                      Nenhum slot de {activeFormatMeta.shortName} encontrado no calendário ativo.
                    </p>
                    {props.onGoToCalendarTab ? (
                      <button
                        type="button"
                        onClick={props.onGoToCalendarTab}
                        className="mt-3 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                      >
                        Ir para Calendário Editorial
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {slotsForSelectedFormat.map((slot) => {
                  const retMeta = RETINA_META[slot.retinaType];
                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                          <span className="font-bold text-la-gold-light">
                            {String(slot.dayNumber).padStart(2, "0")}{" "}
                            {slot.monthShort} • {slot.dayOfWeekLabel} (
                            {slot.suggestedTime})
                          </span>
                          <span
                            className={clsx(
                              "rounded-la-full border px-2 py-0.5 font-semibold",
                              retMeta.badgeClass
                            )}
                          >
                            {retMeta.label}
                          </span>
                        </div>

                        <h4 className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                          {slot.mainTheme || slot.provisionalTitle}
                        </h4>

                        <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                          Pilar: {slot.editorialPillar} • Objetivo:{" "}
                          {slot.strategicObjective}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCreateScriptFromCalendarSlot(slot)}
                        className="mt-2 inline-flex min-h-[2.375rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Roteirizar este Slot Agora →</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* SUB-ABA C: TEMAS DA BIBLIOTECA DA FUNÇÃO 02 PARA ROTEIRIZAR NESTE FORMATO */}
          {formatListSubTab === "library_themes" ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {themeLibrary.length === 0 ? (
                <div className="col-span-full rounded-la-xl border border-dashed border-white/15 bg-black/45 p-8 text-center">
                  <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    Nenhum tema estratégico na biblioteca deste projeto ainda.
                  </p>
                  {props.onGoToThemesTab ? (
                    <button
                      type="button"
                      onClick={props.onGoToThemesTab}
                      className="mt-3 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                    >
                      Gerar Temas na Função 02
                    </button>
                  ) : null}
                </div>
              ) : null}
              {themeLibrary.map((thm) => {
                const retMeta = RETINA_META[thm.retinaType];
                return (
                  <div
                    key={thm.id}
                    className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                        <span className="text-la-gold-light">
                          Origem: {thm.origin} • {thm.journeyStage}
                        </span>
                        <span
                          className={clsx(
                            "rounded-la-full border px-2 py-0.5 font-semibold",
                            retMeta.badgeClass
                          )}
                        >
                          {retMeta.label}
                        </span>
                      </div>
                      <h4 className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                        {thm.title}
                      </h4>
                      <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                        Pilar: {thm.romaPillar}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCreateScriptFromTheme(thm, selectedFormatSlug)
                      }
                      className="mt-2 inline-flex min-h-[2.375rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Transformar em Roteiro de {activeFormatMeta.shortName} →
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CAMADA 3: STUDIO DEDICADO DO ROTEIRO E PACOTE DE ATIVOS COMPLETO    */}
      {/* =================================================================== */}
      {viewStage === "studio" && !currentScript ? (
        <section className="flex flex-col items-center gap-4 rounded-la-xl border border-dashed border-la-border-gold/45 bg-[#090D16]/90 p-10 text-center">
          <FileText className="h-8 w-8 text-la-gold" />
          <div>
            <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
              {isLoadingData
                ? "Carregando roteiros do projeto..."
                : "Nenhum roteiro criado ou selecionado neste projeto ainda"}
            </h3>
            <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
              {isLoadingData
                ? "Buscando roteiros, slots e temas salvos no banco de dados..."
                : "Crie seu primeiro pacote de roteiro contextualizado a partir de um slot do calendário ou tema da biblioteca."}
            </p>
          </div>
          {!isLoadingData ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
              >
                Novo Roteiro Contextualizado
              </button>
              <button
                type="button"
                onClick={() => setViewStage("hub")}
                className="rounded-la-md border border-white/15 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
              >
                Voltar ao Painel dos 6 Formatos
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {viewStage === "studio" && currentScript ? (
        <div className="flex flex-col gap-6">
          {/* Painel de Contexto Herdado das Funções 01 e 02 + Controles do Roteiro */}
          <section className="rounded-la-xl border border-la-gold/65 bg-[#090D16]/98 p-6 shadow-2xl">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 xl:flex-row xl:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-la-full bg-la-gold px-2.5 py-0.5 font-la-mono text-[0.625rem] font-bold uppercase text-la-text-inverse">
                    STUDIO DO ROTEIRO •{" "}
                    {
                      SCRIPT_FORMATS_CATALOG.find(
                        (f) => f.slug === currentScript.formatSlug
                      )?.shortName
                    }
                  </span>
                  <span
                    className={clsx(
                      "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold",
                      RETINA_META[currentScript.retinaType].badgeClass
                    )}
                  >
                    RETINA: {RETINA_META[currentScript.retinaType].label}
                  </span>
                  <span className="rounded-la-full border border-white/12 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                    Versão {currentScript.version}
                  </span>
                  <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
                    {currentScript.linkedSlotLabel}
                  </span>
                </div>

                {/* Título Editável Multilinha (Sem Corte) no Studio */}
                <div className="group/stitle relative mt-2.5">
                  <textarea
                    ref={studioTitleRef}
                    rows={1}
                    value={currentScript.title}
                    aria-label="Editar título do roteiro"
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full resize-none overflow-hidden rounded-la-md border border-white/10 bg-black/45 px-3 py-2 pr-9 font-la-sans text-[1.25rem] font-semibold leading-[1.35] text-la-text-primary transition-colors hover:border-la-border-gold/55 focus:border-la-gold focus:bg-black/75 focus:outline-none sm:text-[1.4375rem]"
                  />
                  <Edit3
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-la-text-muted opacity-65 transition-colors group-hover/stitle:text-la-gold group-hover/stitle:opacity-100"
                  />
                </div>

                {/* Barra de Metadados Injetados das Funções 01 e 02 */}
                <div className="mt-2 flex flex-wrap items-center gap-3 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <span>
                    Pilar:{" "}
                    <strong className="text-la-text-primary">
                      {currentScript.editorialPillar}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Objetivo:{" "}
                    <strong className="text-la-gold-light">
                      {currentScript.strategicObjective}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Dor/Objeção:{" "}
                    <strong className="text-la-text-primary">
                      {currentScript.icpPainOrObjection}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Controles de Status (com DarkCustomSelect), Teleprompter e Salvar Nova Versão */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {/* SELECT 3: Status do Roteiro no Studio com DarkCustomSelect */}
                <div className="min-w-[13.5rem]">
                  <DarkCustomSelect
                    fullWidth
                    align="right"
                    value={currentScript.status}
                    options={STUDIO_STATUS_SELECT_OPTIONS}
                    onChange={(nextStatus) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        status: nextStatus as ScriptProductionStatus,
                      }))
                    }
                    ariaLabel="Alterar status de produção do roteiro"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsTeleprompterOpen((prev) => !prev)}
                  className="inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-mono text-[0.75rem] text-la-text-primary hover:border-la-gold"
                >
                  {isTeleprompterOpen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5 text-la-gold" />
                      <span>Sair do Teleprompter</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5 text-la-gold" />
                      <span>Modo Teleprompter</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveNewScriptVersion}
                  className="inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Salvar Nova Versão</span>
                </button>
              </div>
            </div>

            {/* Seletor de Modo de Roteiro */}
            {currentScript.formatSlug === "short_video" ||
            currentScript.formatSlug === "long_video" ||
            currentScript.formatSlug === "stories_sequence" ? (
              <div className="mt-4 flex flex-col justify-between gap-3 rounded-la-lg border border-white/10 bg-black/50 p-3.5 sm:flex-row sm:items-center">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                    MODO DE ROTEIRIZAÇÃO (SEÇÃO 3.1 DA FUNÇÃO 03)
                  </span>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Escolha entre ler tópicos de alta retenção perto da lente da
                    câmera ou o script técnico palavra por palavra.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        speakingMode: "conexao_bullets",
                      }))
                    }
                    className={clsx(
                      "rounded-la-md border px-3.5 py-2 font-la-sans text-[0.75rem] font-semibold transition-all",
                      currentScript.speakingMode === "conexao_bullets"
                        ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.3)]"
                        : "border-white/12 bg-black/60 text-la-text-secondary"
                    )}
                  >
                    ★ Modo Conexão — Bullet Points de Alta Retenção
                    (Recomendado)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        speakingMode: "seguranca_palavra",
                      }))
                    }
                    className={clsx(
                      "rounded-la-md border px-3.5 py-2 font-la-sans text-[0.75rem] font-semibold transition-all",
                      currentScript.speakingMode === "seguranca_palavra"
                        ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.3)]"
                        : "border-white/12 bg-black/60 text-la-text-secondary"
                    )}
                  >
                    Modo Segurança — Roteiro Palavra por Palavra (2 Colunas)
                  </button>
                </div>
              </div>
            ) : currentScript.formatSlug === "live" ? (
              <div className="mt-4 rounded-la-lg border border-rose-400/40 bg-rose-950/20 p-3.5">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-rose-300">
                  DIRETRIZ OFICIAL DE LIVE · MODO CONEXÃO (BULLET POINTS DE ALTA
                  RETENÇÃO)
                </span>
                <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  O maior erro em transmissões ao vivo é tentar ler um texto
                  palavra por palavra, o que destrói a naturalidade e a
                  interação com o chat. Por isso, este roteiro de Live opera
                  exclusivamente em blocos cronológicos de Bullet Points de Alta
                  Retenção.
                </p>
              </div>
            ) : null}

            {/* As 5 Abas do Pacote de Execução do Roteiro */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/60 p-1.5">
              {[
                {
                  id: "roteiro_blocos" as const,
                  label:
                    currentScript.formatSlug === "carousel"
                      ? "1. Anatomia dos 10 Slides (4:5)"
                      : currentScript.formatSlug === "stories_sequence"
                        ? "1. Sequências do Dia (M·A·T·N + Q&A)"
                        : "1. Roteiro Estruturado em Blocos",
                  icon: FileText,
                },
                {
                  id: "legenda_seo" as const,
                  label: "2. Legenda Outdoor & SEO",
                  icon: Hash,
                },
                {
                  id: "titulos_capas" as const,
                  label: `3. Títulos (${currentScript.titleVariations.length}) & Prompts de Capa (EN)`,
                  icon: ImageIcon,
                },
                {
                  id: "materiais" as const,
                  label: "4. Material Complementar & Explicação",
                  icon: Gift,
                },
                {
                  id: "briefing_versoes" as const,
                  label: `5. Briefing de Recorte & Versões (${currentScript.versionHistory.length})`,
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = studioActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStudioActiveTab(tab.id)}
                    className={clsx(
                      "inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-medium transition-all",
                      active
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* --------------------------------------------------------------- */}
          {/* ABA 1 DO STUDIO: ROTEIRO ESTRUTURADO CONFORME O FORMATO         */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "roteiro_blocos" ? (
            <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
              {/* CASO A: CARROSSEL 4:5 (10 SLIDES INTERATIVOS) */}
              {currentScript.formatSlug === "carousel" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="flex flex-col items-center lg:col-span-5">
                    <div className="flex w-full items-center justify-between pb-3">
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        PREVIEW PROPORÇÃO 4:5 · SLIDE{" "}
                        {activeCarouselSlideIndex + 1} DE{" "}
                        {currentScript.carouselSlides.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={activeCarouselSlideIndex === 0}
                          onClick={() =>
                            setActiveCarouselSlideIndex((prev) =>
                              Math.max(0, prev - 1)
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-la-xs border border-white/14 bg-black/60 text-la-text-primary disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            activeCarouselSlideIndex ===
                            currentScript.carouselSlides.length - 1
                          }
                          onClick={() =>
                            setActiveCarouselSlideIndex((prev) =>
                              Math.min(
                                currentScript.carouselSlides.length - 1,
                                prev + 1
                              )
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-la-xs border border-white/14 bg-black/60 text-la-text-primary disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const slide =
                        currentScript.carouselSlides[
                          activeCarouselSlideIndex
                        ] ?? currentScript.carouselSlides[0];
                      if (!slide) {
                        return (
                          <div className="rounded-la-xl border border-dashed border-white/15 bg-black/40 p-6 text-center font-la-mono text-[0.75rem] text-la-text-muted">
                            Nenhum slide estruturado para este carrossel ainda.
                          </div>
                        );
                      }
                      return (
                        <div className="flex aspect-[4/5] w-full max-w-[24rem] flex-col justify-between rounded-la-xl border-2 border-la-gold/65 bg-gradient-to-b from-[#0C111E] via-[#080B12] to-[#05070B] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 font-la-mono text-[0.625rem] text-la-gold-light">
                            <span>{projectName.split("—")[0]}</span>
                            <span>
                              {String(slide.slideNumber).padStart(2, "0")} / 10
                            </span>
                          </div>

                          <div className="my-auto py-4">
                            <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.1em] text-la-gold">
                              {slide.roleLabel}
                            </span>
                            <h4 className="mt-2 font-la-sans text-[1.3125rem] font-bold leading-[1.2] text-la-text-primary">
                              {slide.headline}
                            </h4>
                            <p className="mt-4 whitespace-pre-line font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                              {slide.bodyLineBreakCopy}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/10 pt-3 font-la-mono text-[0.5625rem] text-la-text-muted">
                            <span>Arraste para o lado →</span>
                            <span className="text-la-gold-light">
                              Salvar p/ consultar
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {currentScript.carouselSlides.map((s, idx) => (
                        <button
                          key={s.slideNumber}
                          type="button"
                          onClick={() => setActiveCarouselSlideIndex(idx)}
                          className={clsx(
                            "h-8 w-8 rounded-la-xs border font-la-mono text-[0.75rem] font-bold transition-all",
                            activeCarouselSlideIndex === idx
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-white/12 bg-black/50 text-la-text-secondary"
                          )}
                        >
                          {s.slideNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 lg:col-span-7">
                    {(() => {
                      const slide =
                        currentScript.carouselSlides[
                          activeCarouselSlideIndex
                        ] ?? currentScript.carouselSlides[0];
                      if (!slide) {
                        return (
                          <div className="rounded-la-xl border border-dashed border-white/15 bg-black/40 p-6 text-center font-la-mono text-[0.75rem] text-la-text-muted">
                            Nenhum slide estruturado para este carrossel ainda.
                          </div>
                        );
                      }
                      return (
                        <div className="rounded-la-xl border border-white/10 bg-black/50 p-5">
                          <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                            EDIÇÃO DO {slide.roleLabel.toUpperCase()}
                          </span>

                          <div className="mt-4 flex flex-col gap-3.5">
                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                                Headline da Lâmina {slide.slideNumber}
                              </label>
                              <input
                                type="text"
                                value={slide.headline}
                                onChange={(e) =>
                                  updateCurrentScript((prev) => ({
                                    ...prev,
                                    carouselSlides: prev.carouselSlides.map(
                                      (item, i) =>
                                        i === activeCarouselSlideIndex
                                          ? {
                                              ...item,
                                              headline: e.target.value,
                                            }
                                          : item
                                    ),
                                  }))
                                }
                                className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                                Corpo Escaneável (Com Psicologia de Corte de
                                Linha)
                              </label>
                              <textarea
                                rows={4}
                                value={slide.bodyLineBreakCopy}
                                onChange={(e) =>
                                  updateCurrentScript((prev) => ({
                                    ...prev,
                                    carouselSlides: prev.carouselSlides.map(
                                      (item, i) =>
                                        i === activeCarouselSlideIndex
                                          ? {
                                              ...item,
                                              bodyLineBreakCopy: e.target.value,
                                            }
                                          : item
                                    ),
                                  }))
                                }
                                className="w-full rounded-la-md border border-white/14 bg-[#0B0F19] p-3 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                                Prompt de Imagem da Lâmina em Inglês (Midjourney
                                / IA)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={slide.imagePromptEN}
                                  onChange={(e) =>
                                    updateCurrentScript((prev) => ({
                                      ...prev,
                                      carouselSlides: prev.carouselSlides.map(
                                        (item, i) =>
                                          i === activeCarouselSlideIndex
                                            ? {
                                                ...item,
                                                imagePromptEN: e.target.value,
                                              }
                                            : item
                                      ),
                                    }))
                                  }
                                  className="min-h-[2.375rem] flex-1 rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-mono text-[0.75rem] text-la-text-secondary"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyText(
                                      slide.imagePromptEN,
                                      `Prompt do Slide ${slide.slideNumber}`
                                    )
                                  }
                                  className="rounded-la-md border border-la-border-gold bg-la-gold-faint px-3 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light"
                                >
                                  Copiar Prompt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : /* CASO B: SEQUÊNCIAS DIÁRIAS DE STORIES */
              currentScript.formatSlug === "stories_sequence" ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(["Manhã", "Almoço", "Tarde", "Noite"] as const).map(
                        (per) => (
                          <button
                            key={per}
                            type="button"
                            onClick={() => setActiveStoryPeriodTab(per)}
                            className={clsx(
                              "rounded-la-md border px-4 py-2 font-la-sans text-[0.8125rem] font-semibold transition-all",
                              activeStoryPeriodTab === per
                                ? "border-la-gold bg-la-gold text-la-text-inverse"
                                : "border-white/12 bg-black/50 text-la-text-secondary"
                            )}
                          >
                            Bloco da {per} (5 Stories)
                          </button>
                        )
                      )}
                    </div>

                    <span className="font-la-mono text-[0.6875rem] text-emerald-300">
                      ✓ Inclui Legenda Espelho obrigatória + Stickers Oficiais
                    </span>
                  </div>

                  {(() => {
                    const activePeriodObj =
                      currentScript.storyPeriods.find(
                        (p) => p.period === activeStoryPeriodTab
                      ) ?? currentScript.storyPeriods[0];
                    if (!activePeriodObj) {
                      return (
                        <div className="rounded-la-xl border border-dashed border-white/15 bg-black/40 p-6 text-center font-la-mono text-[0.75rem] text-la-text-muted">
                          Nenhuma sequência de Stories gerada para este roteiro ainda.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                        {activePeriodObj.cards.map((card) => (
                          <div
                            key={card.cardNumber}
                            className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-[#0B0F1A] p-4"
                          >
                            <div>
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="font-la-mono text-[0.6875rem] font-bold text-la-gold-light">
                                  STORY 0{card.cardNumber}
                                </span>
                                <span className="rounded-la-xs border border-white/10 bg-black/60 px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-text-secondary">
                                  {card.cardType === "video_fala"
                                    ? "Vídeo Falado"
                                    : "Texto s/ Foto"}
                                </span>
                              </div>

                              <p className="mt-2 font-la-mono text-[0.625rem] text-la-gold">
                                {card.intentionLabel}
                              </p>

                              <div className="mt-2.5 rounded-la-md border border-white/8 bg-black/60 p-2.5">
                                <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                                  {currentScript.speakingMode ===
                                  "conexao_bullets"
                                    ? "Bullet de Oratória / Copy:"
                                    : "Fala Palavra por Palavra:"}
                                </span>
                                <p className="mt-1 whitespace-pre-line font-la-sans text-[0.75rem] leading-[1.5] text-la-text-primary">
                                  {currentScript.speakingMode ===
                                  "conexao_bullets"
                                    ? card.connectionBullet
                                    : card.wordForWordScript}
                                </p>
                              </div>

                              <div className="mt-2.5 rounded-la-md border border-emerald-400/35 bg-emerald-950/20 p-2.5">
                                <span className="block font-la-mono text-[0.5625rem] font-bold uppercase text-emerald-300">
                                  Legenda Espelho (Sem Som):
                                </span>
                                <p className="mt-1 font-la-sans text-[0.75rem] text-emerald-100">
                                  {card.mirrorCaptionNoSound}
                                </p>
                              </div>

                              <p className="mt-2 font-la-mono text-[0.625rem] text-la-gold-light">
                                <strong>Sticker:</strong>{" "}
                                {card.instagramSticker}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-white/10 pt-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRegenerateSingleStoryCard(
                                    activePeriodObj.period,
                                    card.cardNumber
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-la-xs border border-white/12 bg-black/50 px-2 py-1 font-la-mono text-[0.5625rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Regenerar card</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    `${card.wordForWordScript}\n\nLegenda Espelho: ${card.mirrorCaptionNoSound}`,
                                    `Story 0${card.cardNumber}`
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-la-xs bg-la-gold px-2 py-1 font-la-mono text-[0.5625rem] font-bold text-la-text-inverse"
                              >
                                <ClipboardCopy className="h-3 w-3" />
                                <span>Copiar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="rounded-la-xl border border-la-border-gold/50 bg-black/50 p-5">
                    <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                      CAIXINHA DE PERGUNTAS PREDITIVA (Q&A ESTRATÉGICO DA NOITE)
                    </span>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {currentScript.predictiveQAs.map((qa) => (
                        <div
                          key={qa.id}
                          className="rounded-la-lg border border-white/10 bg-[#0B0F1A] p-3.5"
                        >
                          <span className="font-la-mono text-[0.625rem] font-bold text-amber-300">
                            Pergunta: &ldquo;{qa.questionFromAudience}&rdquo;
                          </span>
                          <p className="mt-2 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-primary">
                            {qa.strategicAnswerCopy}
                          </p>
                          <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2 font-la-mono text-[0.5625rem] text-la-text-muted">
                            <span>{qa.recommendedFormat}</span>
                            {qa.qualifiedForMaterial ? (
                              <span className="text-emerald-300">
                                ★ Anexar Isca/Material
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : /* CASO C: VÍDEOS CURTOS, VÍDEOS LONGOS, LIVES E POSTS ESTÁTICOS */
              currentScript.speakingMode === "conexao_bullets" &&
                currentScript.formatSlug === "short_video" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        MODO CONEXÃO · CHECKLIST DE 7 LINHAS SEQUENCIAIS PARA A
                        LENTE DA CÂMERA
                      </span>
                      <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                        Bata o olho nos 7 tópicos sequenciais abaixo enquanto
                        grava com naturalidade e alta retenção.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          currentScript.connectionSevenLinesChecklist.join(
                            "\n"
                          ),
                          "Checklist de 7 linhas"
                        )
                      }
                      className="rounded-la-md bg-la-gold px-4 py-1.5 font-la-mono text-[0.75rem] font-semibold text-la-text-inverse"
                    >
                      Copiar 7 Bullets
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {currentScript.connectionSevenLinesChecklist.map(
                      (line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/45 bg-[#0C111D] p-4"
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-la-full bg-la-gold font-la-mono text-[0.75rem] font-bold text-la-text-inverse">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) =>
                              updateCurrentScript((prev) => ({
                                ...prev,
                                connectionSevenLinesChecklist:
                                  prev.connectionSevenLinesChecklist.map(
                                    (item, i) =>
                                      i === idx ? e.target.value : item
                                  ),
                              }))
                            }
                            className={clsx(
                              "w-full bg-transparent font-la-sans font-semibold text-la-text-primary focus:outline-none",
                              isTeleprompterOpen
                                ? "text-[1.25rem]"
                                : "text-[0.9375rem]"
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {currentScript.scriptBlocks.map((blk, idx) => (
                    <div
                      key={blk.id}
                      className="grid grid-cols-1 gap-4 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-5 lg:grid-cols-12"
                    >
                      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 lg:col-span-4 lg:border-r lg:border-b-0 lg:pr-4 lg:pb-0">
                        <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                          {blk.timecodeOrStage}
                        </span>
                        <p className="font-la-sans text-[0.75rem] font-medium text-la-text-primary">
                          Função: {blk.psychologicalRole}
                        </p>
                        <div className="mt-1 rounded-la-md border border-white/8 bg-black/55 p-3">
                          <span className="block font-la-mono text-[0.5625rem] uppercase text-sky-300">
                            Direção de Cena, B-Roll & Áudio (A cada 20s):
                          </span>
                          <textarea
                            rows={3}
                            value={blk.visualAndAudioDirection}
                            onChange={(e) =>
                              updateCurrentScript((prev) => ({
                                ...prev,
                                scriptBlocks: prev.scriptBlocks.map((b, i) =>
                                  i === idx
                                    ? {
                                        ...b,
                                        visualAndAudioDirection:
                                          e.target.value,
                                      }
                                    : b
                                ),
                              }))
                            }
                            className="mt-1 w-full bg-transparent font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:col-span-8">
                        <span className="font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                          {currentScript.speakingMode === "conexao_bullets"
                            ? "Bullets de Alta Retenção (Modo Conexão):"
                            : "Locução Palavra por Palavra (Modo Segurança):"}
                        </span>
                        <textarea
                          rows={isTeleprompterOpen ? 6 : 4}
                          value={
                            currentScript.speakingMode === "conexao_bullets"
                              ? blk.connectionBulletLine
                              : blk.wordForWordSpeech
                          }
                          onChange={(e) =>
                            updateCurrentScript((prev) => ({
                              ...prev,
                              scriptBlocks: prev.scriptBlocks.map((b, i) =>
                                i === idx
                                  ? currentScript.speakingMode ===
                                    "conexao_bullets"
                                    ? {
                                        ...b,
                                        connectionBulletLine: e.target.value,
                                      }
                                    : {
                                        ...b,
                                        wordForWordSpeech: e.target.value,
                                      }
                                  : b
                              ),
                            }))
                          }
                          className={clsx(
                            "w-full rounded-la-lg border border-white/12 bg-black/65 p-3.5 font-la-sans leading-[1.65] text-la-text-primary focus:border-la-gold focus:outline-none",
                            isTeleprompterOpen
                              ? "text-[1.1875rem]"
                              : "text-[0.875rem]"
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  {currentScript.formatSlug === "live" ? (
                    <div className="rounded-la-xl border border-la-border-gold/50 bg-la-gold-faint/40 p-5">
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        BLOCO E · SEQUÊNCIA PRONTA DE STORIES DE BASTIDORES
                        PÓS-LIVE (MODO HÍBRIDO)
                      </span>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {currentScript.postLiveStoriesSummary.map((st, i) => (
                          <div
                            key={i}
                            className="rounded-la-lg border border-white/10 bg-black/60 p-3.5 font-la-sans text-[0.75rem] leading-[1.55] text-la-text-primary"
                          >
                            {st}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 2 DO STUDIO: LEGENDA OUTDOOR & METADADOS DE SEO             */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "legenda_seo" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                    LEGENDA / DESCRIÇÃO ACOPLADA AO FORMATO
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${currentScript.captionOutdoorHook}\n\n${currentScript.captionBody}\n\n${currentScript.captionCta}\n\n${currentScript.seoTags.join(" ")}`,
                        "Legenda completa"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-la-md bg-la-gold px-3.5 py-1.5 font-la-mono text-[0.75rem] font-semibold text-la-text-inverse"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    <span>Copiar Legenda Completa</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    1. Gancho Outdoor (Primeiras 2 linhas antes do &ldquo;mais...&rdquo;)
                  </label>
                  <input
                    type="text"
                    value={currentScript.captionOutdoorHook}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionOutdoorHook: e.target.value,
                      }))
                    }
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 font-la-sans text-[0.875rem] font-semibold text-la-gold-light"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    2. Desenvolvimento Escaneável da Legenda / Descrição
                  </label>
                  <textarea
                    rows={8}
                    value={currentScript.captionBody}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionBody: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] leading-[1.65] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    3. Chamada para Ação (CTA da Legenda)
                  </label>
                  <textarea
                    rows={2}
                    value={currentScript.captionCta}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionCta: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-emerald-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-5">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  METADADOS DE SEO, ALGORITMO E CAPÍTULOS YOUTUBE
                </span>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Palavras-Chave Principais de Indexação:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {currentScript.seoKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.6875rem] text-la-gold-light"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Índice de Capítulos (Timestamps para YouTube / Live):
                  </span>
                  <ul className="mt-2 flex flex-col gap-1.5 font-la-mono text-[0.75rem] text-la-text-primary">
                    {currentScript.youtubeChapters.map((ch) => (
                      <li key={ch}>{ch}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Tags Recomendadas:
                  </span>
                  <p className="mt-1.5 font-la-mono text-[0.75rem] text-sky-300">
                    {currentScript.seoTags.join("  ")}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 3 DO STUDIO: TÍTULOS (MÍN. 6) & PROMPTS DE CAPA/THUMBNAIL   */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "titulos_capas" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-6">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  VARIAÇÕES DE TÍTULOS ETIQUETADAS POR GANCHO (MÍNIMO 5)
                </span>
                <div className="flex flex-col gap-2.5">
                  {currentScript.titleVariations.map((tv) => (
                    <div
                      key={tv.id}
                      onClick={() =>
                        updateCurrentScript((prev) => ({
                          ...prev,
                          title: tv.titleText,
                          titleVariations: prev.titleVariations.map((item) => ({
                            ...item,
                            isSelected: item.id === tv.id,
                          })),
                        }))
                      }
                      className={clsx(
                        "cursor-pointer rounded-la-lg border p-3.5 transition-all",
                        tv.isSelected
                          ? "border-la-gold bg-la-gold-faint"
                          : "border-white/10 bg-black/50 hover:border-white/25"
                      )}
                    >
                      <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                        <span className="font-bold text-la-gold-light">
                          Gancho: {tv.hookCategory}
                        </span>
                        <span className="text-emerald-300">
                          {tv.estimatedCtrBadge}
                        </span>
                      </div>
                      <p className="mt-1 font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                        {tv.titleText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-6">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  DIREÇÃO DE THUMBNAIL / CAPA & PROMPTS DE IMAGEM EM INGLÊS
                </span>
                {currentScript.imagePrompts.map((prm) => (
                  <div
                    key={prm.id}
                    className="flex flex-col gap-2.5 rounded-la-xl border border-white/10 bg-black/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                        {prm.targetPiece}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(prm.promptEnglish, prm.targetPiece)
                        }
                        className="rounded-la-xs bg-la-gold px-3 py-1 font-la-mono text-[0.625rem] font-bold text-la-text-inverse"
                      >
                        Copiar Prompt EN
                      </button>
                    </div>

                    <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                      <strong>Conceito Visual (PT):</strong>{" "}
                      {prm.visualConceptPT}
                    </p>

                    <div className="rounded-la-md border border-white/10 bg-[#0B0F1A] p-3 font-la-mono text-[0.75rem] text-la-gold-light">
                      {prm.promptEnglish}
                    </div>

                    <span className="font-la-mono text-[0.6875rem] text-emerald-300">
                      Texto sugerido na capa: &ldquo;
                      {prm.textOverlaySuggestion}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 4 DO STUDIO: MATERIAL COMPLEMENTAR & MATERIAL DE EXPLICAÇÃO */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "materiais" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col justify-between rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                      CATEGORIA 01 · MATERIAL COMPLEMENTAR (FUNIL / ISCA)
                    </span>
                    <label className="inline-flex cursor-pointer items-center gap-2 font-la-mono text-[0.6875rem] text-la-gold-light">
                      <input
                        type="checkbox"
                        checked={
                          currentScript.qualifiedForComplementaryMaterial
                        }
                        onChange={(e) =>
                          updateCurrentScript((prev) => ({
                            ...prev,
                            qualifiedForComplementaryMaterial:
                              e.target.checked,
                          }))
                        }
                        className="accent-[#CFA965]"
                      />
                      <span>Slot Qualificado</span>
                    </label>
                  </div>

                  <h4 className="mt-2 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {currentScript.complementaryMaterial.title}
                  </h4>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Formato:{" "}
                    <strong className="text-la-gold-light">
                      {currentScript.complementaryMaterial.typeLabel}
                    </strong>{" "}
                    • Promessa: {currentScript.complementaryMaterial.promise}
                  </p>

                  {currentScript.qualifiedForComplementaryMaterial ? (
                    <ul className="mt-4 flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4 font-la-sans text-[0.8125rem] text-la-text-primary">
                      {currentScript.complementaryMaterial.sectionsOutline.map(
                        (sec, i) => (
                          <li key={i}>• {sec}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="mt-4 rounded-la-lg border border-white/10 bg-black/45 p-4 font-la-sans text-[0.8125rem] text-la-text-muted">
                      Este slot não está configurado para material complementar
                      de isca nas Funções 01/02. Marque a caixa &ldquo;Slot
                      Qualificado&rdquo; acima caso deseje ativar a geração para
                      este conteúdo.
                    </div>
                  )}
                </div>

                {currentScript.qualifiedForComplementaryMaterial ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${currentScript.complementaryMaterial.title}\n\n${currentScript.complementaryMaterial.sectionsOutline.join("\n")}`,
                        "Estrutura do Material Complementar"
                      )
                    }
                    className="mt-5 inline-flex min-h-[2.5rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Copiar / Exportar Material Complementar</span>
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-bold uppercase text-sky-300">
                    CATEGORIA 02 · MATERIAL DE EXPLICAÇÃO (APOIO DIDÁTICO DA
                    AULA / LIVE)
                  </span>
                  <h4 className="mt-2 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {currentScript.explanationMaterial.title}
                  </h4>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Tipo:{" "}
                    <strong className="text-sky-200">
                      {currentScript.explanationMaterial.typeLabel}
                    </strong>{" "}
                    (Focado em visualização didática de frameworks e diagramas).
                  </p>

                  <ul className="mt-4 flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4 font-la-mono text-[0.75rem] text-la-text-primary">
                    {currentScript.explanationMaterial.diagramNodes.map(
                      (node, i) => (
                        <li key={i}>{node}</li>
                      )
                    )}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      currentScript.explanationMaterial.diagramNodes.join("\n"),
                      "Mapa Mental de Explicação"
                    )
                  }
                  className="mt-5 inline-flex min-h-[2.5rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Copiar Estrutura do Mapa Mental Didático</span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 5 DO STUDIO: BRIEFING DE RECORTE, HISTÓRIA & VERSÕES        */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "briefing_versoes" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  AJUSTES DE RECORTE & HISTÓRIA DA MARCA (SEM QUEBRAR A
                  ESTRATÉGIA)
                </span>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Ajuste de Recorte Específico deste Roteiro
                  </label>
                  <textarea
                    rows={2}
                    value={currentScript.briefingCutAdjustment}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        briefingCutAdjustment: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Exemplos Obrigatórios & Conexão com a História da Marca
                  </label>
                  <textarea
                    rows={3}
                    value={currentScript.mandatoryExamplesToInclude}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        mandatoryExamplesToInclude: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-5">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  HISTÓRICO DE VERSÕES DESTE ROTEIRO
                </span>
                <div className="flex flex-col gap-2.5">
                  {currentScript.versionHistory.map((vh, i) => (
                    <div
                      key={i}
                      className="rounded-la-lg border border-white/10 bg-black/50 p-3.5"
                    >
                      <div className="flex items-center justify-between font-la-mono text-[0.6875rem]">
                        <strong className="text-la-gold-light">
                          {vh.versionLabel}
                        </strong>
                        <span className="text-la-text-muted">{vh.savedAt}</span>
                      </div>
                      <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                        {vh.summaryNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* MODAL: CRIAR NOVO ROTEIRO CONTEXTUALIZADO (COM DARKCUSTOMSELECT)    */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isCreateModalOpen ? (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[38rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                  Criar Novo Pacote de Roteiro (Função 03)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleCreateScriptModalSubmit}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreateOrigin("calendar_slot")}
                    className={clsx(
                      "rounded-la-lg border p-3 text-left transition-all",
                      createOrigin === "calendar_slot"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] font-bold uppercase text-la-gold-light">
                      ★ RECOMENDADO (FUNÇÃO 01)
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      A partir de um Slot do Calendário
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateOrigin("theme_library")}
                    className={clsx(
                      "rounded-la-lg border p-3 text-left transition-all",
                      createOrigin === "theme_library"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                      OPÇÃO 02 (FUNÇÃO 02)
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      A partir de um Tema da Biblioteca
                    </span>
                  </button>
                </div>

                {/* SELECT 4: Formato do Conteúdo no Modal com DarkCustomSelect */}
                <div className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Formato do Conteúdo
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    menuZIndex="z-[260]"
                    value={createFormatSlug}
                    options={CREATE_FORMAT_SELECT_OPTIONS}
                    onChange={(val) =>
                      setCreateFormatSlug(val as ScriptFormatSlug)
                    }
                    ariaLabel="Selecionar formato do novo roteiro"
                  />
                </div>

                {/* SELECT 5: Slot do Calendário no Modal com DarkCustomSelect */}
                {createOrigin === "calendar_slot" &&
                calendarSlots.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Selecionar Slot do Calendário (Opcional)
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      menuZIndex="z-[260]"
                      value={createSelectedSlotId}
                      options={createSlotSelectOptions}
                      onChange={setCreateSelectedSlotId}
                      ariaLabel="Selecionar slot do calendário editorial"
                    />
                  </div>
                ) : null}

                {/* SELECT 6: Tema da Biblioteca no Modal com DarkCustomSelect */}
                {createOrigin === "theme_library" && themeLibrary.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Selecionar Tema Aprovado da Biblioteca (Opcional)
                    </span>
                    <DarkCustomSelect
                      fullWidth
                      menuZIndex="z-[260]"
                      value={createSelectedThemeId}
                      options={createThemeSelectOptions}
                      onChange={setCreateSelectedThemeId}
                      ariaLabel="Selecionar tema da biblioteca estratégica"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Título / Tema do Roteiro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: O erro invisível na gestão de risco"
                    value={createCustomTitle}
                    onChange={(e) => setCreateCustomTitle(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingScript}
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingScript ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Gerando Pacote Completo...</span>
                      </>
                    ) : (
                      <span>Gerar Pacote Completo e Abrir Studio</span>
                    )}
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

export default RoteirosEditorialModule;