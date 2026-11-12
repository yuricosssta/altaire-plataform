// FrontEnd/src/app/(main)/dashboard/publicacoes/page.tsx
"use client";

import React, { useMemo, useState } from "react";
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

const EDITORIAL_PROJECTS_CONTEXT: readonly EditorialProjectContextSummary[] = [
  {
    id: "proj-legion-saas",
    name: "Legion Altaire · SaaS",
    niche: "SaaS & Inteligência Editorial",
    offer: "Assinatura Legion Altaire Pro",
    romaPromise:
      "Transformar a estratégia do negócio em conteúdo com direção, autoridade e vendas.",
    icpSummary:
      "Especialistas, mentores, infoprodutores e consultores cansados de posts genéricos.",
    toneOfVoice: "Estratégico, Analítico, Direto e Premium",
    activeLineName: "Linha v1 — Sistema Operacional Editorial",
  },
  {
    id: "proj-produto-x",
    name: "Produto X — Lançamento Semente",
    niche: "Finanças & Investimentos",
    offer: "Mentoria Algorithmic Trading",
    romaPromise:
      "Estruturar uma carteira quantitativa validada sem depender de análises subjetivas.",
    icpSummary:
      "Investidores e profissionais liberais com patrimônio buscando consistência técnica.",
    toneOfVoice: "Técnico, Seguro, Baseado em Dados",
    activeLineName: "Linha v1 — Lançamento Semente",
  },
  {
    id: "proj-mentoria-ht",
    name: "Mentoria High-Ticket — Evergreen",
    niche: "Consultoria & Negócios B2B",
    offer: "Programa Executivo de Escala Comercial",
    romaPromise:
      "Previsibilidade de aquisição de clientes de alto valor com operação enxuta.",
    icpSummary:
      "Fundadores de agências e consultorias B2B faturando entre R$ 30k e R$ 150k/mês.",
    toneOfVoice: "Executivo, Pragmático e Orientado a Margem",
    activeLineName: "Linha v2 — Aquisição Contínua B2B",
  },
] as const;

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

const INITIAL_CONTENT_ITEMS: readonly ContentLibraryRecord[] = [
  {
    id: "pub-01",
    title: "O erro silencioso que bloqueia sua autoridade mesmo postando todo dia",
    formatKey: "short_video",
    formatLabel: "REEL · Vídeo Curto",
    projectId: "proj-produto-x",
    projectName: "Produto X — Lançamento Semente",
    createdAt: "12/09/2026",
    status: "aprovado",
    themeTitle: "Frequência sem direção estratégica vs. Posicionamento",
    pillarName: "Pilar 01 · Posicionamento & Tese",
    retinaType: "Transformação",
    scriptMode: "Modo Técnico (Teleprompter)",
    hookOutdoor:
      "Publicar todo dia sem conectar sua oferta ao seu conteúdo só acelera o desgaste da sua imagem.",
    scriptPreview:
      "[00:00 - GANCHO] Se o seu perfil está ativo, mas as reuniões qualificadas não aumentam, o problema não é falta de constância. [00:12 - DESENVOLVIMENTO] Quando cada post nasce solto...",
    captionPreview:
      "Frequência sem direção é ruído operacional. Veja como alinhar cada formato aos pilares de conversão da sua oferta antes de gravar.",
    coverPromptEn:
      "Minimalist dark luxury editorial portrait, executive strategist in deep onyx studio, subtle champagne gold rim lighting, 9:16 vertical composition --ar 9:16",
    ctaLabel: "Comente DIREÇÃO para receber o Checklist de Auditoria Editorial.",
    complementaryMaterial: "Checklist de Auditoria de Posicionamento (PDF)",
    isFavorite: true,
  },
  {
    id: "pub-02",
    title: "Por que prompts soltos nunca substituem um Sistema Operacional Editorial",
    formatKey: "carousel",
    formatLabel: "CARROSSEL · 10 Lâminas 4:5",
    projectId: "proj-legion-saas",
    projectName: "Legion Altaire · SaaS",
    createdAt: "04/11/2026",
    status: "publicado",
    themeTitle: "Cadeia de Contexto: Base Estratégica → Linha → Calendário → Roteiro",
    pillarName: "Pilar 02 · Arquitetura de Contexto",
    retinaType: "Autoridade",
    scriptMode: "Modo Técnico (Teleprompter)",
    hookOutdoor:
      "Lâmina 01: Uma IA comum responde a um comando. Um Sistema Editorial constrói um ativo de vendas.",
    scriptPreview:
      "Slide 01: Gancho de contraste | Slide 02: A fragmentação do histórico de chat | Slide 03-07: Os 3 elos da cadeia Legion Altaire | Slide 10: CTA para diagnóstico.",
    captionPreview:
      "Quando você precisa reexplicar seu negócio a cada novo prompt, sua comunicação perde unidade. Deslize para ver como blindamos o contexto por Projeto Editorial.",
    coverPromptEn:
      "Architectural dark glassmorphism interface diagram with glowing champagne gold strategic thread connecting 3 monolithic nodes on #05060A background --ar 4:5",
    ctaLabel: "Salve este carrossel e acesse o link da bio para conhecer o Legion Altaire.",
    complementaryMaterial: "Mapa Comparativo: Prompt Isolado vs. Sistema Editorial",
    isFavorite: true,
  },
  {
    id: "pub-03",
    title: "Anatomia da Oferta High-Ticket: Como preparar a audiência em 14 dias",
    formatKey: "long_video",
    formatLabel: "YOUTUBE · Vídeo Longo (18 min)",
    projectId: "proj-mentoria-ht",
    projectName: "Mentoria High-Ticket — Evergreen",
    createdAt: "06/11/2026",
    status: "em_producao",
    themeTitle: "Elevação de Nível de Consciência antes da abertura de agenda",
    pillarName: "Pilar 03 · Quebra de Objeções Silenciosas",
    retinaType: "Níveis de Consciência",
    scriptMode: "Modo Conexão (Tópicos)",
    hookOutdoor:
      "O cliente de alto valor não compra no impulso; ele compra quando sua linha editorial antecipa as 4 objeções centrais.",
    scriptPreview:
      "Bloco 01: O erro de fazer pitch direto para audiência fria | Bloco 02: A matriz de aquecimento em 2 semanas | Bloco 03: Estudo de caso real e estrutura de diagnóstico.",
    captionPreview:
      "Capítulos: 00:00 A armadilha do volume | 04:15 Os 4 níveis de consciência B2B | 11:40 Como estruturar o calendário de aquecimento.",
    coverPromptEn:
      "Cinematic 16:9 YouTube thumbnail, confident B2B advisor next to a dark glass board with gold strategic timeline metrics --ar 16:9",
    ctaLabel: "Preencha a aplicação estratégica no primeiro link da descrição.",
    complementaryMaterial: "Planilha de Qualificação de Leads High-Ticket (XLSX)",
    isFavorite: false,
  },
  {
    id: "pub-04",
    title: "Sequência Narrativa de Quinta: Bastidores de Decisão + Caixa de Perguntas",
    formatKey: "stories_sequence",
    formatLabel: "STORIES · 4 Blocos Diários",
    projectId: "proj-legion-saas",
    projectName: "Legion Altaire · SaaS",
    createdAt: "07/11/2026",
    status: "em_revisao",
    themeTitle: "Rotina real de planejamento sem improviso de última hora",
    pillarName: "Pilar 01 · Clareza Operacional",
    retinaType: "Relacionamento",
    scriptMode: "Modo Conexão (Tópicos)",
    hookOutdoor:
      "Manhã: Contraste entre abrir o celular sem saber o que postar vs. abrir o Painel do Dia.",
    scriptPreview:
      "Manhã (3 stories): Bastidor da mesa + gancho | Almoço (2 stories): Micro-prova | Tarde (3 stories): Abertura de caixinha com 3 perguntas preditivas | Noite: Fechamento e CTA.",
    captionPreview:
      "Sequência completa com textos espelho para leitura sem áudio e 3 respostas estruturadas para Q&A.",
    coverPromptEn:
      "First-person POV of a dark minimalist workspace with a laptop displaying Legion Altaire daily panel in champagne gold accents --ar 9:16",
    ctaLabel: "Responda este story com a palavra AGENDA para ver a demonstração.",
    complementaryMaterial: null,
    isFavorite: false,
  },
  {
    id: "pub-05",
    title: "Live de Diagnóstico: Revisando Linhas Editoriais ao Vivo",
    formatKey: "live",
    formatLabel: "LIVE · Roteiro em Tópicos (60 min)",
    projectId: "proj-produto-x",
    projectName: "Produto X — Lançamento Semente",
    createdAt: "01/11/2026",
    status: "rascunho",
    themeTitle: "Auditoria ao vivo de promessa ROMA e equilíbrio RETINA",
    pillarName: "Pilar 02 · Prova Metodológica",
    retinaType: "Interação",
    scriptMode: "Modo Conexão (Tópicos)",
    hookOutdoor:
      "Como identificar em 5 minutos se o seu calendário está gerando compradores ou apenas curiosos.",
    scriptPreview:
      "00-10 min: Abertura e critério de análise | 10-45 min: 3 diagnósticos práticos na tela | 45-60 min: Transição para oferta e bloco de stories pós-live.",
    captionPreview:
      "Roteiro cronológico em tópicos para condução natural + sequência de 3 stories de colheita imediata pós-transmissão.",
    coverPromptEn:
      "Dark broadcast studio setup, professional microphone, glowing gold live indicator badge --ar 16:9",
    ctaLabel: "Entre no grupo silencioso de avisos para receber o resumo da Live.",
    complementaryMaterial: "Guia Resumo da Live + Checklist de Revisão",
    isFavorite: false,
  },
  {
    id: "pub-06",
    title: "[Histórico] Campanha Q2 — Manifesto de Transição de Posicionamento",
    formatKey: "static_post",
    formatLabel: "POST ESTÁTICO · Síntese 4:5",
    projectId: "proj-mentoria-ht",
    projectName: "Mentoria High-Ticket — Evergreen",
    createdAt: "18/07/2026",
    status: "arquivado",
    themeTitle: "O fim das consultorias genéricas no mercado B2B",
    pillarName: "Pilar 01 · Tese Central",
    retinaType: "Engajamento",
    scriptMode: "Modo Técnico (Teleprompter)",
    hookOutdoor:
      "Mercado maduro não compra promessa vaga; compra método auditável.",
    scriptPreview:
      "Arte única de alto impacto visual com manifesto de 5 parágrafos na legenda.",
    captionPreview:
      "Registro histórico da campanha de reposicionamento Q2 preservado para referência editorial.",
    coverPromptEn:
      "Minimalist monolithic sculpture in dark onyx and brushed gold, editorial typography layout --ar 4:5",
    ctaLabel: "Salve para referência estratégica.",
    complementaryMaterial: null,
    isFavorite: false,
  },
];

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
  const [items, setItems] =
    useState<readonly ContentLibraryRecord[]>(INITIAL_CONTENT_ITEMS);

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
  const [targetProjectId, setTargetProjectId] =
    useState<string>("proj-legion-saas");
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
      ...EDITORIAL_PROJECTS_CONTEXT.map((proj) => ({
        value: proj.id,
        label: proj.name,
      })),
    ];
  }, []);

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
      EDITORIAL_PROJECTS_CONTEXT.find((p) => p.id === targetProjectId) ??
      EDITORIAL_PROJECTS_CONTEXT[0]
    );
  }, [targetProjectId]);

  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleToggleArchive = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: ContentStatusKey =
          item.status === "arquivado" ? "rascunho" : "arquivado";
        return { ...item, status: nextStatus };
      })
    );
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
      EDITORIAL_PROJECTS_CONTEXT.find((p) => p.id !== item.projectId) ??
      EDITORIAL_PROJECTS_CONTEXT[0];
    setTargetProjectId(alternativeProject.id);
    setDuplicationStrategy("AI_ADAPT");
    setCustomDuplicateTitle(`${item.title} (Adaptação Estratégica)`);
    setPreserveComplementaryMaterial(Boolean(item.complementaryMaterial));
  };

  const handleConfirmDuplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingItem) return;

    setIsProcessingAiAdaptation(true);

    window.setTimeout(() => {
      const isCrossProject = targetProjectContext.id !== duplicatingItem.projectId;
      const isAiAdapted = duplicationStrategy === "AI_ADAPT";

      const newRecord: ContentLibraryRecord = {
        ...duplicatingItem,
        id: `pub-${Date.now()}`,
        title:
          customDuplicateTitle.trim() ||
          `${duplicatingItem.title} (${targetProjectContext.name})`,
        projectId: targetProjectContext.id,
        projectName: targetProjectContext.name,
        createdAt: "Agora mesmo",
        status: isAiAdapted ? "em_revisao" : "rascunho",
        hookOutdoor: isAiAdapted
          ? `[Adaptado para ${targetProjectContext.offer}] ${duplicatingItem.hookOutdoor}`
          : duplicatingItem.hookOutdoor,
        scriptPreview: isAiAdapted
          ? `[Contexto Injetado: ICP ${targetProjectContext.icpSummary} · Tom ${targetProjectContext.toneOfVoice}] ${duplicatingItem.scriptPreview}`
          : duplicatingItem.scriptPreview,
        ctaLabel: isAiAdapted
          ? `CTA alinhado à promessa: "${targetProjectContext.romaPromise}"`
          : duplicatingItem.ctaLabel,
        complementaryMaterial: preserveComplementaryMaterial
          ? duplicatingItem.complementaryMaterial
          : null,
        adaptedFromId: duplicatingItem.id,
      };

      setItems((prev) => [newRecord, ...prev]);
      setIsProcessingAiAdaptation(false);
      setDuplicatingItem(null);

      setRecentBannerMessage(
        isAiAdapted
          ? `Pacote duplicado e remodelado com IA para a Base Estratégica de "${targetProjectContext.name}" (${isCrossProject ? "Entre Projetos" : "Mesmo Projeto"}).`
          : `Cópia literal criada em "${targetProjectContext.name}" com status Rascunho para revisão manual.`
      );
      window.setTimeout(() => setRecentBannerMessage(null), 6000);
    }, 550);
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
                    options={EDITORIAL_PROJECTS_CONTEXT.map((proj) => ({
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