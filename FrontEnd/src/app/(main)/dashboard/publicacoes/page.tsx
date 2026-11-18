// FrontEnd/src/app/(main)/dashboard/publicacoes/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  Film,
  Flame,
  FolderKanban,
  Layers,
  Library,
  Radio,
  Search,
  Sparkles,
  Star,
  Video,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { WORKSPACE_ROUTES } from "@/lib/constants/routes";
import { DarkCustomSelect } from "@/components/ui/DarkCustomSelect";
import { scriptsService } from "@/lib/services/scriptsService";
import { editorialService } from "@/lib/services/editorialService";

/* -------------------------------------------------------------------------- */
/* Tipos e Constantes Canônicas                                               */
/* -------------------------------------------------------------------------- */

export type ContentFormatKey =
  | "short_video"
  | "long_video"
  | "carousel"
  | "stories_sequence"
  | "static_post"
  | "live";

export type ContentStatusKey =
  | "rascunho"
  | "em_revisao"
  | "aprovado"
  | "em_producao"
  | "publicado"
  | "arquivado";

export type RetinaTypeKey =
  | "Transformação"
  | "Autoridade"
  | "Níveis de Consciência"
  | "Relacionamento"
  | "Engajamento"
  | "Interação";

export type EditorialProjectContextSummary = {
  readonly id: string;
  readonly name: string;
  readonly niche: string;
  readonly offer: string;
  readonly romaPromise: string;
  readonly icpSummary: string;
  readonly toneOfVoice: string;
  readonly activeLineName: string;
};

export type ContentLibraryRecord = {
  readonly id: string;
  readonly title: string;
  readonly formatKey: ContentFormatKey;
  readonly formatLabel: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly createdAt: string;
  readonly status: ContentStatusKey;
  readonly themeTitle: string;
  readonly pillarName: string;
  readonly retinaType: RetinaTypeKey;
  readonly scriptMode: "Modo Técnico (Teleprompter)" | "Modo Conexão (Tópicos)";
  readonly hookOutdoor: string;
  readonly scriptPreview: string;
  readonly captionPreview: string;
  readonly coverPromptEn: string;
  readonly ctaLabel: string;
  readonly complementaryMaterial: string | null;
  readonly isFavorite: boolean;
  readonly adaptedFromId?: string;
};

const FORMAT_FILTERS: readonly {
  readonly key: ContentFormatKey | "TODOS";
  readonly label: string;
  readonly badge: string;
}[] = [
  { key: "TODOS", label: "Todos os Formatos", badge: "6" },
  { key: "short_video", label: "Vídeo Curto", badge: "Reels/Shorts" },
  { key: "long_video", label: "Vídeo Longo", badge: "YouTube" },
  { key: "carousel", label: "Carrossel 4:5", badge: "Slides" },
  { key: "stories_sequence", label: "Sequência de Stories", badge: "Diário" },
  { key: "static_post", label: "Post Estático", badge: "4:5" },
  { key: "live", label: "Live / Aula", badge: "Ao Vivo" },
] as const;

const STATUS_META: Record<
  ContentStatusKey,
  { readonly label: string; readonly className: string }
> = {
  rascunho: {
    label: "Rascunho",
    className: "border-white/15 bg-white/[0.05] text-la-text-secondary",
  },
  em_revisao: {
    label: "Em revisão",
    className: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  },
  aprovado: {
    label: "Aprovado",
    className:
      "border-la-gold bg-la-gold/20 text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.2)]",
  },
  em_producao: {
    label: "Em produção",
    className: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  },
  publicado: {
    label: "Publicado",
    className: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  },
  arquivado: {
    label: "Arquivado",
    className: "border-white/10 bg-black/60 text-la-text-muted",
  },
};

const RETINA_OPTIONS: readonly RetinaTypeKey[] = [
  "Transformação",
  "Autoridade",
  "Níveis de Consciência",
  "Relacionamento",
  "Engajamento",
  "Interação",
] as const;

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const FORMAT_LABELS: Record<ContentFormatKey, string> = {
  short_video: "REEL · Vídeo Curto",
  long_video: "YOUTUBE · Vídeo Longo",
  carousel: "CARROSSEL · 4:5",
  stories_sequence: "STORIES · Sequência",
  static_post: "POST · Imagem Única",
  live: "LIVE · Evento",
};

function mapBackendFormatKey(format?: string, formatSlug?: string): ContentFormatKey {
  const f = String(formatSlug || format || "").toLowerCase();
  if (f === "long_video" || f === "video_longo") return "long_video";
  if (f === "carousel" || f === "carrossel") return "carousel";
  if (f === "stories_sequence" || f === "sequencia_stories") return "stories_sequence";
  if (f === "static_post" || f === "post_estatico") return "static_post";
  if (f === "live" || f === "live_semanal") return "live";
  return "short_video";
}

function mapBackendRetinaLabel(raw?: string): RetinaTypeKey {
  const r = String(raw || "").toLowerCase();
  if (r.includes("autor")) return "Autoridade";
  if (r.includes("consci")) return "Níveis de Consciência";
  if (r.includes("relac")) return "Relacionamento";
  if (r.includes("engaj")) return "Engajamento";
  if (r.includes("inter")) return "Interação";
  return "Transformação";
}

function mapBackendPubStatus(raw?: string): ContentStatusKey {
  const s = String(raw || "").toLowerCase();
  if (s === "pronto" || s === "ready" || s === "aprovado") return "aprovado";
  if (s === "in_production" || s === "em_producao") return "em_producao";
  if (s === "teste_ab" || s === "em_revisao" || s === "ab_test") return "em_revisao";
  if (s === "publicado" || s === "published") return "publicado";
  if (s === "arquivado" || s === "archived") return "arquivado";
  return "rascunho";
}

function mapProjectToContextSummary(p: any): EditorialProjectContextSummary {
  const id = String(p.id || p._id || "");
  return {
    id,
    name: String(p.name || "Projeto Editorial"),
    niche: String(p.niche || ""),
    offer: String(p.currentObjectiveLabel || p.currentObjective || "Posicionamento"),
    romaPromise: p.subniche
      ? `Estratégia em ${p.niche || "conteúdo"} · ${p.subniche}`
      : "Base Estratégica do Projeto",
    icpSummary: String(p.brandOrClientName || p.name || ""),
    toneOfVoice: "Definido na Base Estratégica",
    activeLineName: p.hasActiveLineEditorial
      ? "Linha Editorial Ativa"
      : "Linha em preparação",
  };
}

function mapBackendPublicationToRecord(
  s: any,
  projectMap: ReadonlyMap<string, EditorialProjectContextSummary>
): ContentLibraryRecord {
  const projectId = String(s.projectId || "");
  const proj = projectMap.get(projectId);
  const formatKey = mapBackendFormatKey(s.format, s.formatSlug);
  const blocks = Array.isArray(s.scriptBlocks) && s.scriptBlocks.length > 0
    ? s.scriptBlocks
    : Array.isArray(s.blocks)
      ? s.blocks
      : [];
  const firstBlockText =
    blocks[0]?.wordForWordSpeech ||
    blocks[0]?.content ||
    blocks[0]?.connectionBulletLine ||
    s.captionBody ||
    "Pacote de roteiro estruturado pronto para edição no Studio.";
  const compMat =
    s.complementaryMaterial?.title ||
    (Array.isArray(s.complementaryMaterials) && s.complementaryMaterials[0]?.title) ||
    null;
  const coverPrompt =
    (Array.isArray(s.imagePrompts) && s.imagePrompts[0]?.promptEnglish) ||
    (Array.isArray(s.thumbnailPrompts) && s.thumbnailPrompts[0]?.promptEn) ||
    "Minimalist dark obsidian and gold editorial scene";

  return {
    id: String(s.id || s._id || ""),
    title: String(s.title || "Roteiro Editorial"),
    formatKey,
    formatLabel: FORMAT_LABELS[formatKey],
    projectId,
    projectName: String(s.projectName || proj?.name || "Projeto Editorial"),
    createdAt: s.createdAt
      ? new Date(s.createdAt).toLocaleDateString("pt-BR")
      : "Sincronizado",
    status: mapBackendPubStatus(s.status),
    themeTitle: String(s.provisionalName || s.title || ""),
    pillarName: String(s.editorialPillar || "Pilar Estratégico"),
    retinaType: mapBackendRetinaLabel(s.retinaType),
    scriptMode:
      s.mode === "seguranca" || s.speakingMode === "TELEPROMPTER"
        ? "Modo Técnico (Teleprompter)"
        : "Modo Conexão (Tópicos)",
    hookOutdoor: String(s.captionOutdoorHook || s.title || ""),
    scriptPreview: String(firstBlockText).slice(0, 260),
    captionPreview: String(s.captionBody || s.caption || ""),
    coverPromptEn: String(coverPrompt),
    ctaLabel: String(s.captionCta || "Confira no Studio do Roteiro"),
    complementaryMaterial: compMat ? String(compMat) : null,
    isFavorite: Boolean(s.isFavorite),
    adaptedFromId: s.adaptedFromId ? String(s.adaptedFromId) : undefined,
  };
}

function getFormatIcon(formatKey: ContentFormatKey) {
  switch (formatKey) {
    case "short_video":
      return Film;
    case "long_video":
      return Video;
    case "carousel":
      return Layers;
    case "stories_sequence":
      return Flame;
    case "live":
      return Radio;
    case "static_post":
    default:
      return FileText;
  }
}

export default function ContentLibraryPage() {
  const [items, setItems] = useState<readonly ContentLibraryRecord[]>([]);
  const [projectsContext, setProjectsContext] = useState<
    readonly EditorialProjectContextSummary[]
  >([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState<boolean>(true);

  /* Estados de Filtros */
  const [selectedProjectId, setSelectedProjectId] = useState<string>("TODOS");
  const [selectedFormat, setSelectedFormat] = useState<
    ContentFormatKey | "TODOS"
  >("TODOS");
  const [selectedRetina, setSelectedRetina] = useState<
    RetinaTypeKey | "TODOS"
  >("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<
    ContentStatusKey | "ATIVOS"
  >("ATIVOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [onlyWithMaterials, setOnlyWithMaterials] = useState<boolean>(false);

  /* Modais */
  const [inspectedItem, setInspectedItem] =
    useState<ContentLibraryRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [duplicatingItem, setDuplicatingItem] =
    useState<ContentLibraryRecord | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [duplicationStrategy, setDuplicationStrategy] = useState<
    "AI_ADAPT" | "RAW_COPY"
  >("AI_ADAPT");
  const [customDuplicateTitle, setCustomDuplicateTitle] = useState<string>("");
  const [preserveComplementaryMaterial, setPreserveComplementaryMaterial] =
    useState<boolean>(true);
  const [isProcessingAiAdaptation, setIsProcessingAiAdaptation] =
    useState<boolean>(false);
  const [recentBannerMessage, setRecentBannerMessage] = useState<string | null>(
    null
  );

  const loadPublicationsLibrary = useCallback(async () => {
    setIsLoadingLibrary(true);
    try {
      const [rawProjects, rawPublications] = await Promise.all([
        editorialService.listProjects().catch(() => []),
        scriptsService.listPublications().catch(() => []),
      ]);

      const mappedProjects = Array.isArray(rawProjects)
        ? rawProjects.map(mapProjectToContextSummary)
        : [];
      setProjectsContext(mappedProjects);

      const projMap = new Map<string, EditorialProjectContextSummary>(
        mappedProjects.map((p) => [p.id, p])
      );
      const mappedPubs = Array.isArray(rawPublications)
        ? rawPublications.map((s) => mapBackendPublicationToRecord(s, projMap))
        : [];
      setItems(mappedPubs);

      if (mappedProjects[0]) {
        setTargetProjectId((prev) => prev || mappedProjects[0]!.id);
      }
    } finally {
      setIsLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicationsLibrary();
  }, [loadPublicationsLibrary]);

  const activeMetrics = useMemo(() => {
    const nonArchived = items.filter((item) => item.status !== "arquivado");
    const approvedOrPublished = nonArchived.filter(
      (item) => item.status === "aprovado" || item.status === "publicado"
    );
    const withMaterials = nonArchived.filter((item) =>
      Boolean(item.complementaryMaterial)
    );
    const archivedCount = items.filter(
      (item) => item.status === "arquivado"
    ).length;

    return {
      totalActive: nonArchived.length,
      readyCount: approvedOrPublished.length,
      materialsCount: withMaterials.length,
      archivedCount,
    };
  }, [items]);

  /* Opções dos Dropdowns Customizados */
  const projectSelectOptions = useMemo(() => {
    return [
      { value: "TODOS", label: "Projeto: Todos os Projetos" },
      ...projectsContext.map((proj) => ({
        value: proj.id,
        label: proj.name,
      })),
    ];
  }, [projectsContext]);

  const retinaSelectOptions = useMemo(() => {
    return [
      { value: "TODOS", label: "RETINA: Todos" },
      ...RETINA_OPTIONS.map((ret) => ({
        value: ret,
        label: `RETINA: ${ret}`,
      })),
    ];
  }, []);

  const statusSelectOptions = useMemo(() => {
    return [
      { value: "ATIVOS", label: "Status: Operação Ativa (Sem Arquivados)" },
      { value: "rascunho", label: "Rascunho" },
      { value: "em_revisao", label: "Em revisão" },
      { value: "aprovado", label: "Aprovado (Pronto)" },
      { value: "em_producao", label: "Em produção" },
      { value: "publicado", label: "Publicado" },
      { value: "arquivado", label: "Histórico Arquivado" },
    ];
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedStatus === "ATIVOS") {
        if (item.status === "arquivado") return false;
      } else if (item.status !== selectedStatus) {
        return false;
      }

      if (selectedProjectId !== "TODOS" && item.projectId !== selectedProjectId) {
        return false;
      }

      if (selectedFormat !== "TODOS" && item.formatKey !== selectedFormat) {
        return false;
      }

      if (selectedRetina !== "TODOS" && item.retinaType !== selectedRetina) {
        return false;
      }

      if (onlyFavorites && !item.isFavorite) return false;
      if (onlyWithMaterials && !item.complementaryMaterial) return false;

      if (!q) return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.themeTitle.toLowerCase().includes(q) ||
        item.pillarName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.hookOutdoor.toLowerCase().includes(q)
      );
    });
  }, [
    items,
    selectedStatus,
    selectedProjectId,
    selectedFormat,
    selectedRetina,
    onlyFavorites,
    onlyWithMaterials,
    searchQuery,
  ]);

  const targetProjectContext = useMemo(() => {
    return (
      projectsContext.find((p) => p.id === targetProjectId) ??
      projectsContext[0] ??
      null
    );
  }, [projectsContext, targetProjectId]);

  const handleToggleFavorite = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const nextFav = !target.isFavorite;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: nextFav } : item
      )
    );

    if (OBJECT_ID_RE.test(target.projectId) && OBJECT_ID_RE.test(id)) {
      try {
        await scriptsService.updateScript(target.projectId, id, {
          isFavorite: nextFav,
        });
      } catch {
        void loadPublicationsLibrary();
      }
    }
  };

  const handleToggleArchive = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const isArchived = target.status === "arquivado";
    const nextStatus: ContentStatusKey = isArchived ? "rascunho" : "arquivado";
    const nextBackendStatus = isArchived ? "rascunho" : "arquivado";

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );

    if (OBJECT_ID_RE.test(target.projectId) && OBJECT_ID_RE.test(id)) {
      try {
        await scriptsService.updateScript(target.projectId, id, {
          status: nextBackendStatus,
        });
      } catch {
        void loadPublicationsLibrary();
      }
    }
  };

  const handleCopyText = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => null);
    }
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1800);
  };

  const handleOpenDuplicationModal = (item: ContentLibraryRecord) => {
    setDuplicatingItem(item);
    const alternativeProject =
      projectsContext.find((p) => p.id !== item.projectId) ??
      projectsContext[0];
    setTargetProjectId(alternativeProject?.id || item.projectId);
    setDuplicationStrategy("AI_ADAPT");
    setCustomDuplicateTitle(`${item.title} (Adaptação Estratégica)`);
    setPreserveComplementaryMaterial(Boolean(item.complementaryMaterial));
  };

  const handleConfirmDuplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingItem || !targetProjectContext) return;
    if (!OBJECT_ID_RE.test(duplicatingItem.id) || !OBJECT_ID_RE.test(targetProjectContext.id)) {
      return;
    }

    setIsProcessingAiAdaptation(true);
    try {
      const isCrossProject =
        targetProjectContext.id !== duplicatingItem.projectId;
      const isAiAdapted = duplicationStrategy === "AI_ADAPT";

      const createdRaw = await scriptsService.adaptPublication(
        duplicatingItem.id,
        {
          targetProjectId: targetProjectContext.id,
          mode: isAiAdapted ? "AI_ADAPT" : "COPY_LITERAL",
          customTitle:
            customDuplicateTitle.trim() ||
            `${duplicatingItem.title} (${targetProjectContext.name})`,
          preserveComplementaryMaterial,
        }
      );

      const projMap = new Map<string, EditorialProjectContextSummary>(
        projectsContext.map((p) => [p.id, p])
      );
      const newRecord = mapBackendPublicationToRecord(createdRaw, projMap);

      setItems((prev) => [newRecord, ...prev]);
      setDuplicatingItem(null);

      setRecentBannerMessage(
        isAiAdapted
          ? `Pacote duplicado e remodelado para a Base Estratégica de "${targetProjectContext.name}" (${isCrossProject ? "Entre Projetos" : "Mesmo Projeto"}).`
          : `Cópia literal criada em "${targetProjectContext.name}" com status Rascunho para revisão manual.`
      );
      window.setTimeout(() => setRecentBannerMessage(null), 6000);
    } catch {
      setRecentBannerMessage(
        "Não foi possível duplicar/adaptar esta publicação no servidor."
      );
    } finally {
      setIsProcessingAiAdaptation(false);
    }
  };

  return (
    <div
      data-la-surface="dark"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-14 text-la-text-primary"
    >
      {/* 1. CABEÇALHO GLOBAL */}
      <header className="relative overflow-hidden rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              <Library className="h-3.5 w-3.5 text-la-gold" />
              <span>Acervo Central de Roteiros, Carrosséis, Stories & Ativos</span>
            </div>

            <h1 className="mt-2.5 font-la-sans text-2xl font-bold tracking-tight text-la-text-primary sm:text-[1.75rem]">
              Biblioteca de Conteúdo
            </h1>
            <p className="mt-1 max-w-3xl text-justify [text-align-last:left] hyphens-auto font-la-sans text-sm text-la-text-secondary">
              Consulte, filtre e reaproveite roteiros, legendas, títulos, capas e
              materiais complementares gerados nos seus Projetos Editoriais.
              Duplique peças campeãs entre projetos adaptando o contexto com IA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {
                label: "Ativos em Operação",
                value: activeMetrics.totalActive,
                accent: "text-la-gold-light",
              },
              {
                label: "Aprovados / No Ar",
                value: activeMetrics.readyCount,
                accent: "text-emerald-300",
              },
              {
                label: "Com Isca / Material",
                value: activeMetrics.materialsCount,
                accent: "text-sky-300",
              },
              {
                label: "Histórico Arquivado",
                value: activeMetrics.archivedCount,
                accent: "text-la-text-muted",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-la-lg border border-white/10 bg-black/45 px-3.5 py-2.5"
              >
                <span className="block font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                  {stat.label}
                </span>
                <span
                  className={clsx(
                    "mt-0.5 block font-la-mono text-lg font-bold",
                    stat.accent
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TABS DE FORMATOS */}
        <nav
          aria-label="Filtro por formato de conteúdo"
          className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4"
        >
          {FORMAT_FILTERS.map((fmt) => {
            const isActive = selectedFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                type="button"
                onClick={() => setSelectedFormat(fmt.key)}
                className={clsx(
                  "inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-lg border px-3.5 py-1.5 font-la-sans text-xs font-semibold transition-all",
                  isActive
                    ? "border-la-border-gold/75 bg-la-gold-faint text-la-gold-light shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                    : "border-white/10 bg-black/35 text-la-text-secondary hover:border-white/20 hover:text-la-text-primary"
                )}
              >
                <span>{fmt.label}</span>
                <span
                  className={clsx(
                    "rounded-la-full px-2 py-0.5 font-la-mono text-[0.5625rem] uppercase",
                    isActive
                      ? "border border-la-gold/50 bg-la-gold/20 text-la-gold-light"
                      : "bg-white/[0.04] text-la-text-muted"
                  )}
                >
                  {fmt.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {recentBannerMessage ? (
        <div className="flex items-center justify-between gap-3 rounded-la-xl border border-la-border-gold/65 bg-la-gold-faint px-4 py-3 text-xs text-la-gold-light shadow-[0_0_24px_rgba(207,169,101,0.15)]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-la-gold" />
            <span className="font-la-sans font-medium">{recentBannerMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecentBannerMessage(null)}
            className="rounded-la-xs p-1 text-la-text-secondary hover:text-la-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* 2. BARRA DE FILTROS COM DARKCUSTOMSELECT (ZERO SELECT AZUL DO WINDOWS) */}
      <section className="flex flex-col gap-3 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
          {/* Busca Textual */}
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, tema, pilar ou gancho..."
              className="min-h-[2.625rem] w-full rounded-la-md border border-white/12 bg-black/50 pr-4 pl-10 font-la-sans text-xs text-la-text-primary placeholder:text-la-text-muted focus:border-la-gold focus:outline-none"
            />
          </div>

          {/* Filtro por Projeto com DarkCustomSelect */}
          <div className="lg:col-span-3">
            <DarkCustomSelect
              fullWidth
              value={selectedProjectId}
              options={projectSelectOptions}
              onChange={setSelectedProjectId}
              ariaLabel="Filtrar por Projeto Editorial"
            />
          </div>

          {/* Filtro por RETINA com DarkCustomSelect */}
          <div className="lg:col-span-2">
            <DarkCustomSelect
              fullWidth
              value={selectedRetina}
              options={retinaSelectOptions}
              onChange={(val) => setSelectedRetina(val as RetinaTypeKey | "TODOS")}
              ariaLabel="Filtrar por Matriz RETINA"
            />
          </div>

          {/* Filtro por Status com DarkCustomSelect */}
          <div className="lg:col-span-3">
            <DarkCustomSelect
              fullWidth
              value={selectedStatus}
              options={statusSelectOptions}
              onChange={(val) =>
                setSelectedStatus(val as ContentStatusKey | "ATIVOS")
              }
              ariaLabel="Filtrar por Status"
            />
          </div>
        </div>

        {/* Sub-filtros Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={clsx(
                "inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border px-3 py-1 font-la-sans text-xs font-semibold transition-colors",
                onlyFavorites
                  ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                  : "border-white/10 bg-black/40 text-la-text-secondary hover:text-la-text-primary"
              )}
            >
              <Star
                className={clsx(
                  "h-3.5 w-3.5",
                  onlyFavorites ? "fill-la-gold text-la-gold" : "text-la-text-muted"
                )}
              />
              <span>Apenas Favoritos</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyWithMaterials((prev) => !prev)}
              className={clsx(
                "inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border px-3 py-1 font-la-sans text-xs font-semibold transition-colors",
                onlyWithMaterials
                  ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                  : "border-white/10 bg-black/40 text-la-text-secondary hover:text-la-text-primary"
              )}
            >
              <FileCheck2 className="h-3.5 w-3.5 text-la-gold" />
              <span>Com Material Complementar</span>
            </button>
          </div>

          <Link
            href={WORKSPACE_ROUTES.centralEstrategica}
            className="inline-flex items-center gap-1.5 font-la-mono text-xs font-semibold text-la-gold-light hover:underline"
          >
            <FolderKanban className="h-3.5 w-3.5 text-la-gold" />
            <span>Gerar novo roteiro em um Projeto Editorial →</span>
          </Link>
        </div>
      </section>

      {/* 3. LISTA DE PACOTES DE CONTEÚDO */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-la-xl border border-white/10 bg-[#0B0F18]/80 p-12 text-center">
          <BookOpen className="h-10 w-10 text-la-gold/70" />
          <h2 className="mt-3 font-la-sans text-base font-bold text-la-text-primary">
            Nenhum pacote de conteúdo encontrado para estes filtros
          </h2>
          <p className="mt-1 max-w-md font-la-sans text-xs text-la-text-secondary">
            Ajuste os filtros de Projeto Editorial, Formato, Matriz RETINA ou
            Status para visualizar outros roteiros e ativos do acervo.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedProjectId("TODOS");
              setSelectedFormat("TODOS");
              setSelectedRetina("TODOS");
              setSelectedStatus("ATIVOS");
              setOnlyFavorites(false);
              setOnlyWithMaterials(false);
              setSearchQuery("");
            }}
            className="mt-4 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
          >
            Limpar Filtros da Biblioteca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => {
            const FormatIcon = getFormatIcon(item.formatKey);
            const statusMeta = STATUS_META[item.status];

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0B0F18]/95 p-5 transition-all hover:border-la-border-gold/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.6875rem] font-bold text-la-gold-light">
                        <FormatIcon className="h-3.5 w-3.5 text-la-gold" />
                        <span>{item.formatLabel}</span>
                      </span>

                      <span
                        className={clsx(
                          "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase",
                          statusMeta.className
                        )}
                      >
                        {statusMeta.label}
                      </span>

                      <span className="rounded-la-full border border-white/12 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                        RETINA · {item.retinaType}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(item.id)}
                      aria-label="Favoritar conteúdo"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-black/45 text-la-text-muted hover:border-la-gold hover:text-la-gold"
                    >
                      <Star
                        className={clsx(
                          "h-4 w-4",
                          item.isFavorite
                            ? "fill-la-gold text-la-gold"
                            : "text-la-text-muted"
                        )}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-la-mono text-[0.6875rem]">
                    <span className="text-la-gold-light">
                      Projeto: <strong>{item.projectName}</strong>
                    </span>
                    <span className="text-la-text-muted">
                      Criado em {item.createdAt}
                    </span>
                  </div>

                  <h2 className="mt-1.5 font-la-sans text-base font-bold leading-snug text-la-text-primary">
                    {item.title}
                  </h2>

                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {item.pillarName} • {item.scriptMode}
                  </p>

                  <div className="mt-3 rounded-la-lg border border-white/10 bg-black/45 p-3">
                    <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Gancho Central / Linha de Abertura
                    </span>
                    <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-primary">
                      “{item.hookOutdoor}”
                    </p>
                  </div>

                  {item.complementaryMaterial ? (
                    <div className="mt-2.5 inline-flex items-center gap-2 rounded-la-md border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 font-la-mono text-[0.6875rem] text-emerald-200">
                      <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Material Qualificado: {item.complementaryMaterial}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectedItem(item)}
                      className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-3.5 py-1.5 font-la-sans text-xs font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Abrir Pacote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDuplicationModal(item)}
                      className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-xs font-semibold text-la-gold-light transition-colors hover:border-la-gold hover:bg-la-gold hover:text-la-text-inverse"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Duplicar / Adaptar c/ IA</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={WORKSPACE_ROUTES.projectTab(item.projectId, "roteiros")}
                      title="Ir para a aba Roteiros deste Projeto Editorial"
                      className="inline-flex min-h-[2.375rem] items-center gap-1 rounded-la-md border border-white/12 bg-black/50 px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                    >
                      <span>Studio</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleArchive(item.id)}
                      title={
                        item.status === "arquivado"
                          ? "Restaurar para Rascunho"
                          : "Arquivar mantendo referência histórica"
                      }
                      className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-la-md border border-white/10 bg-black/40 text-la-text-muted transition-colors hover:border-amber-400/50 hover:text-amber-200"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL DE DUPLICAÇÃO INTELIGENTE (COM DARKCUSTOMSELECT NO SELECT DE DESTINO) */}
      {duplicatingItem ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-la-xl border border-la-border-gold/65 bg-[#090C14] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  <Sparkles className="h-3.5 w-3.5 text-la-gold" />
                  <span>Reaproveitamento Estratégico Controlado</span>
                </div>
                <h2 className="mt-1 font-la-sans text-lg font-bold text-la-text-primary">
                  Duplicar Conteúdo entre Projetos Editoriais
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDuplicatingItem(null)}
                className="rounded-la-xs p-1 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmDuplication}
              className="mt-4 flex flex-col gap-4"
            >
              <div className="rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                  Conteúdo de Origem ({duplicatingItem.projectName})
                </span>
                <p className="mt-0.5 font-la-sans text-sm font-bold text-la-text-primary">
                  {duplicatingItem.title}
                </p>
                <span className="mt-1 block font-la-mono text-[0.6875rem] text-la-gold-light">
                  {duplicatingItem.formatLabel} • RETINA: {duplicatingItem.retinaType} •{" "}
                  {duplicatingItem.pillarName}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Projeto Editorial de Destino
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    value={targetProjectId}
                    options={projectsContext.map((proj) => ({
                      value: proj.id,
                      label: `${proj.name} ${
                        proj.id === duplicatingItem.projectId
                          ? "(Variação no mesmo)"
                          : ""
                      }`,
                    }))}
                    onChange={setTargetProjectId}
                  />
                </div>

                <label className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Título na Biblioteca de Destino
                  </span>
                  <input
                    type="text"
                    required
                    value={customDuplicateTitle}
                    onChange={(e) => setCustomDuplicateTitle(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-sans text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                  />
                </label>
              </div>

              {targetProjectContext ? (
                <div className="rounded-la-lg border border-la-border-gold/40 bg-[#0B0F18] p-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Base Estratégica Detectada no Destino ({targetProjectContext.name})
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                        Oferta & Linha Ativa:
                      </span>
                      <p className="font-la-sans font-semibold text-la-text-primary">
                        {targetProjectContext.offer} · {targetProjectContext.activeLineName}
                      </p>
                    </div>
                    <div>
                      <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                        Tom de Voz:
                      </span>
                      <p className="font-la-sans font-semibold text-la-text-primary">
                        {targetProjectContext.toneOfVoice}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                    <strong className="text-la-gold-light">Promessa ROMA:</strong>{" "}
                    {targetProjectContext.romaPromise}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                  Modo de Duplicação & Governança de Contexto
                </span>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDuplicationStrategy("AI_ADAPT")}
                    className={clsx(
                      "flex flex-col items-start rounded-la-lg border p-3.5 text-left transition-all",
                      duplicationStrategy === "AI_ADAPT"
                        ? "border-la-gold bg-la-gold-faint shadow-[0_0_20px_rgba(207,169,101,0.16)]"
                        : "border-white/10 bg-black/40 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-la-gold" />
                      <span className="font-la-sans text-xs font-bold text-la-gold-light">
                        Duplicar e adaptar com IA (Recomendado)
                      </span>
                    </div>
                    <p className="mt-1.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.6875rem] leading-relaxed text-la-text-secondary">
                      Mantém a estrutura do formato, mas reescreve gancho,
                      argumentos, exemplos do ICP e CTA para a Base do projeto de
                      destino.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicationStrategy("RAW_COPY")}
                    className={clsx(
                      "flex flex-col items-start rounded-la-lg border p-3.5 text-left transition-all",
                      duplicationStrategy === "RAW_COPY"
                        ? "border-la-gold bg-la-gold-faint shadow-[0_0_20px_rgba(207,169,101,0.16)]"
                        : "border-white/10 bg-black/40 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4 text-la-text-secondary" />
                      <span className="font-la-sans text-xs font-bold text-la-text-primary">
                        Duplicar sem adaptar (Cópia Literal)
                      </span>
                    </div>
                    <p className="mt-1.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.6875rem] leading-relaxed text-la-text-secondary">
                      Copia o texto original sem alterações e marca como Rascunho
                      para revisão manual.
                    </p>
                  </button>
                </div>
              </div>

              {duplicatingItem.complementaryMaterial ? (
                <label className="flex items-center gap-2.5 rounded-la-md border border-white/10 bg-black/40 px-3.5 py-2.5 font-la-sans text-xs text-la-text-secondary">
                  <input
                    type="checkbox"
                    checked={preserveComplementaryMaterial}
                    onChange={(e) =>
                      setPreserveComplementaryMaterial(e.target.checked)
                    }
                    className="h-4 w-4 accent-[#CFA965]"
                  />
                  <span>
                    Vincular e adaptar também a especificação do Material
                    Complementar ({duplicatingItem.complementaryMaterial})
                  </span>
                </label>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setDuplicatingItem(null)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-xs font-semibold text-la-text-secondary hover:text-la-text-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAiAdaptation}
                  className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-xs font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isProcessingAiAdaptation
                      ? "Adaptando Contexto Estratégico..."
                      : duplicationStrategy === "AI_ADAPT"
                        ? "Confirmar: Duplicar e Adaptar com IA"
                        : "Confirmar: Duplicar sem Adaptar"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MODAL DE INSPEÇÃO 360° */}
      {inspectedItem ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-la-xl border border-la-border-gold/60 bg-[#090C14] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-gold-light">
                  {inspectedItem.projectName} · {inspectedItem.formatLabel} · RETINA:{" "}
                  {inspectedItem.retinaType}
                </span>
                <h2 className="mt-1 font-la-sans text-lg font-bold text-la-text-primary">
                  {inspectedItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="rounded-la-xs p-1 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="rounded-la-lg border border-white/10 bg-black/50 p-3.5">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  1. Estrutura do Roteiro ({inspectedItem.scriptMode})
                </span>
                <p className="mt-1.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-primary">
                  {inspectedItem.scriptPreview}
                </p>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-3.5">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  2. Gancho Outdoor & Legenda Estratégica
                </span>
                <p className="mt-1.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-secondary">
                  <strong className="text-la-text-primary">
                    {inspectedItem.hookOutdoor}
                  </strong>{" "}
                  — {inspectedItem.captionPreview}
                </p>
              </div>

              <div className="rounded-la-lg border border-la-border-gold/35 bg-la-gold-faint p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                    3. Prompt de Capa / Thumbnail (Inglês Técnico)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText("prompt", inspectedItem.coverPromptEn)
                    }
                    className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] text-la-gold-light hover:underline"
                  >
                    {copiedKey === "prompt" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Prompt Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiar Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 font-la-mono text-[0.6875rem] leading-relaxed text-la-text-primary">
                  {inspectedItem.coverPromptEn}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedItem;
                    setInspectedItem(null);
                    handleOpenDuplicationModal(target);
                  }}
                  className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-4 py-2 font-la-sans text-xs font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Duplicar para outro Projeto</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={WORKSPACE_ROUTES.projectTab(
                      inspectedItem.projectId,
                      "roteiros"
                    )}
                    className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Abrir no Studio do Projeto</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}