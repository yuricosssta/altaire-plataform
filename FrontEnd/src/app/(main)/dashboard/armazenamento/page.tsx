// FrontEnd/src/app/(main)/dashboard/armazenamento/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Film,
  FolderArchive,
  Grid,
  LayoutTemplate,
  List,
  Palette,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { WORKSPACE_ROUTES } from "@/lib/constants/routes";
import { DarkCustomSelect } from "@/components/ui/DarkCustomSelect";

/* -------------------------------------------------------------------------- */
/* Tipos e Categorias Canônicas (Seção 2.5.2 — Assets & Arquivos)             */
/* -------------------------------------------------------------------------- */

export type AssetCategoryId =
  | "logos"
  | "paleta"
  | "fotos"
  | "templates"
  | "broll"
  | "guias";

export type BrandAssetItem = {
  readonly id: string;
  readonly title: string;
  readonly category: AssetCategoryId;
  readonly projectScope: string;
  readonly formatLabel: string;
  readonly dimensionsOrSpec: string;
  readonly sizeLabel: string;
  readonly updatedAt: string;
  readonly description: string;
  readonly aiUsageDirective: string;
  readonly hexPreview?: string;
  readonly cssToken?: string;
  readonly tags: readonly string[];
  readonly isFavorite: boolean;
};

const ASSET_CATEGORIES: readonly {
  readonly id: AssetCategoryId;
  readonly code: string;
  readonly label: string;
  readonly subtitle: string;
  readonly icon: typeof ShieldCheck;
}[] = [
  {
    id: "logos",
    code: "01",
    label: "Logos & Símbolos",
    subtitle: "Lockups ALTAIRE / LEGION e brasão vetorial",
    icon: ShieldCheck,
  },
  {
    id: "paleta",
    code: "02",
    label: "Paleta & Tokens",
    subtitle: "Cores canônicas Onyx, Champagne Gold e tipografia",
    icon: Palette,
  },
  {
    id: "fotos",
    code: "03",
    label: "Fotos do Especialista",
    subtitle: "Retratos de autoridade, capas e bastidores",
    icon: Camera,
  },
  {
    id: "templates",
    code: "04",
    label: "Templates Visuais",
    subtitle: "Matrizes 4:5, 9:16 e 16:9 para produção",
    icon: LayoutTemplate,
  },
  {
    id: "broll",
    code: "05",
    label: "B-Roll & Vídeos",
    subtitle: "Clipes de retenção, takes de tela e apoio visual",
    icon: Film,
  },
  {
    id: "guias",
    code: "06",
    label: "Guias & Documentos",
    subtitle: "Manuais de marca, dossiês de ICP e PDFs",
    icon: FileText,
  },
] as const;

const PROJECT_SCOPES = [
  "Todos os Projetos",
  "Acervo Global da Marca",
  "Legion Altaire · SaaS",
  "Mentoria High-Ticket",
  "Imersão Executiva",
] as const;

const INITIAL_ASSETS: readonly BrandAssetItem[] = [
  /* 01. Logos */
  {
    id: "ast-logo-1",
    title: "Lockup Oficial — ALTAIRE / LEGION (Dark Surface)",
    category: "logos",
    projectScope: "Acervo Global da Marca",
    formatLabel: "SVG · Vetorial",
    dimensionsOrSpec: "Escalável · 16px a 512px",
    sizeLabel: "18 KB",
    updatedAt: "Atualizado há 2 dias",
    description:
      "Composição horizontal canônica com brasão simplificado dourado e tipografia geométrica para fundos escuros.",
    aiUsageDirective:
      "Aplicar no cabeçalho de carrosséis institucionais, encerramento de vídeos longos e documentos oficiais.",
    tags: ["Lockup", "Oficial", "Dark-First", "SVG"],
    isFavorite: true,
  },
  {
    id: "ast-logo-2",
    title: "Símbolo Monolítico Dourado — Brasão Simplificado",
    category: "logos",
    projectScope: "Acervo Global da Marca",
    formatLabel: "SVG / PNG 4K",
    dimensionsOrSpec: "1024 × 1024 px",
    sizeLabel: "42 KB",
    updatedAt: "Atualizado há 5 dias",
    description:
      "Marca reduzida reconstruída geometricamente para avatares, selos de assinatura editorial, favicons e marca d'água.",
    aiUsageDirective:
      "Usar como assinatura discreta no canto superior direito de slides de carrossel 4:5.",
    tags: ["Símbolo", "Avatar", "Marca d'água"],
    isFavorite: true,
  },

  /* 02. Paleta & Tokens */
  {
    id: "ast-pal-1",
    title: "Champagne Gold Primary — Destaque Estratégico",
    category: "paleta",
    projectScope: "Acervo Global da Marca",
    formatLabel: "HEX · Token CSS",
    dimensionsOrSpec: "#CFA965",
    sizeLabel: "Contraste AAA",
    updatedAt: "Padrão Canônico",
    description:
      "Tom dourado champagne principal usado para sinalizar o Fio Estratégico, CTAs dominantes, selos ativos e foco.",
    aiUsageDirective:
      "Destacar apenas 1 a 2 palavras-chave nucleares por título de capa ou slide de carrossel.",
    hexPreview: "#CFA965",
    cssToken: "var(--la-gold)",
    tags: ["Cor Primária", "Dourado", "Destaque"],
    isFavorite: true,
  },
  {
    id: "ast-pal-2",
    title: "Onyx Deep Canvas — Superfície Base",
    category: "paleta",
    projectScope: "Acervo Global da Marca",
    formatLabel: "HEX · Token CSS",
    dimensionsOrSpec: "#05060A",
    sizeLabel: "Base Dark-First",
    updatedAt: "Padrão Canônico",
    description:
      "Fundo profundo de alto contraste projetado para leitura prolongada, zero fadiga visual e destaque das camadas em vidro fumê.",
    aiUsageDirective:
      "Definir como fundo padrão em prompts de thumbnails, slides de carrossel e telas de apresentação.",
    hexPreview: "#05060A",
    cssToken: "var(--la-canvas)",
    tags: ["Fundo", "Onyx", "Dark-First"],
    isFavorite: false,
  },
  {
    id: "ast-pal-3",
    title: "Champagne Gold Light — Iluminação & Hover",
    category: "paleta",
    projectScope: "Acervo Global da Marca",
    formatLabel: "HEX · Token CSS",
    dimensionsOrSpec: "#E5C787",
    sizeLabel: "Acento Luminoso",
    updatedAt: "Padrão Canônico",
    description:
      "Variação luminosa para subtítulos técnicos, badges em foco, reflexos superiores de borda e estados interativos.",
    aiUsageDirective:
      "Aplicar em eyebrows, numeração de etapas (01, 02, 03) e conectores de diagramas.",
    hexPreview: "#E5C787",
    cssToken: "var(--la-gold-light)",
    tags: ["Eyebrow", "Luz", "Token"],
    isFavorite: false,
  },

  /* 03. Fotos do Especialista */
  {
    id: "ast-foto-1",
    title: "Retrato Editorial — Direção Executiva (Fundo Onyx)",
    category: "fotos",
    projectScope: "Legion Altaire · SaaS",
    formatLabel: "WEBP / PNG Recortado",
    dimensionsOrSpec: "2400 × 3000 px (4:5)",
    sizeLabel: "1.8 MB",
    updatedAt: "Há 3 dias",
    description:
      "Fotografia de alta nitidez com iluminação lateral quente (key light dourada sutil), ideal para capas de tese e posicionamento.",
    aiUsageDirective:
      "Recomendado para capas de conteúdos de Autoridade e Transformação na Matriz RETINA.",
    tags: ["Autoridade", "Capa 4:5", "Recorte Limpo"],
    isFavorite: true,
  },
  {
    id: "ast-foto-2",
    title: "Bastidores em Mesa de Operação — Duplo Monitor",
    category: "fotos",
    projectScope: "Mentoria High-Ticket",
    formatLabel: "JPG Alta Resolução",
    dimensionsOrSpec: "3840 × 2160 px (16:9)",
    sizeLabel: "2.4 MB",
    updatedAt: "Há 1 semana",
    description:
      "Cena autêntica de planejamento estratégico e revisão de arquitetura editorial em ambiente escuro minimalista.",
    aiUsageDirective:
      "Usar em thumbnails de YouTube/Vídeo Longo e aberturas de sequências de Stories do dia.",
    tags: ["Bastidores", "Thumbnail 16:9", "Conexão"],
    isFavorite: false,
  },

  /* 04. Templates Visuais */
  {
    id: "ast-tpl-1",
    title: "Matriz de Carrossel Editorial 4:5 — 8 a 10 Slides",
    category: "templates",
    projectScope: "Legion Altaire · SaaS",
    formatLabel: "Template Canônico",
    dimensionsOrSpec: "1080 × 1350 px (4:5)",
    sizeLabel: "Sistema Ativo",
    updatedAt: "Sincronizado com Função 03",
    description:
      "Estrutura com Slide 01 de Gancho Outdoor, desenvolvimento com Fio Estratégico Dourado e slide final de CTA orientado à oferta.",
    aiUsageDirective:
      "Vinculado automaticamente ao Studio de Carrossel para formatação dos blocos de texto por slide.",
    tags: ["Carrossel 4:5", "Função 03", "Retenção"],
    isFavorite: true,
  },
  {
    id: "ast-tpl-2",
    title: "Grid de Thumbnail 16:9 — Contraste Tese vs. Sintoma",
    category: "templates",
    projectScope: "Legion Altaire · SaaS",
    formatLabel: "Template de Capa",
    dimensionsOrSpec: "1920 × 1080 px (16:9)",
    sizeLabel: "Sistema Ativo",
    updatedAt: "Sincronizado com Função 03",
    description:
      "Layout dividido com expressão firme do especialista à direita, máximo de 4 palavras de impacto à esquerda e recorte de UI.",
    aiUsageDirective:
      "Usar como referência nos prompts de geração de capa para Vídeos Longos.",
    tags: ["YouTube", "Thumbnail 16:9", "Alto CTR"],
    isFavorite: false,
  },

  /* 05. B-Roll & Vídeos */
  {
    id: "ast-broll-1",
    title: "B-Roll 01 — Navegação Fluida na Linha Editorial & Calendário",
    category: "broll",
    projectScope: "Legion Altaire · SaaS",
    formatLabel: "MP4 · 60fps",
    dimensionsOrSpec: "1920 × 1080 px · 14s",
    sizeLabel: "12.6 MB",
    updatedAt: "Há 4 dias",
    description:
      "Take de tela em close-up mostrando a aprovação da Linha Editorial e o preenchimento imediato dos slots da semana.",
    aiUsageDirective:
      "Sugerir na coluna 'Direção Visual' do roteiro sempre que o locutor mencionar organização ou fim do improviso.",
    tags: ["Screen Take", "Demonstração", "60fps"],
    isFavorite: true,
  },
  {
    id: "ast-broll-2",
    title: "B-Roll 02 — Transição do Mapa de Temas para o Roteiro Pronto",
    category: "broll",
    projectScope: "Legion Altaire · SaaS",
    formatLabel: "MP4 · 60fps",
    dimensionsOrSpec: "1080 × 1920 px (9:16) · 09s",
    sizeLabel: "8.9 MB",
    updatedAt: "Há 6 dias",
    description:
      "Corte dinâmico vertical para Reels/Shorts exibindo um tema sendo enviado ao slot e gerando roteiro técnico.",
    aiUsageDirective:
      "Inserir nos primeiros 4 segundos de Reels de prova operacional para elevar retenção visual.",
    tags: ["Reels 9:16", "Retenção", "Prova Visual"],
    isFavorite: false,
  },

  /* 06. Guias & Documentos */
  {
    id: "ast-doc-1",
    title: "Manual de Identidade Verbal & Regras Anti-Genérico",
    category: "guias",
    projectScope: "Acervo Global da Marca",
    formatLabel: "PDF / Markdown",
    dimensionsOrSpec: "18 páginas · v2.4",
    sizeLabel: "640 KB",
    updatedAt: "Auditado",
    description:
      "Diretrizes de vocabulário, termos proibidos, cadência de frases e postura analítica da marca Legion Altaire.",
    aiUsageDirective:
      "Injetado na camada de sistema da IA para blindar a escrita contra clichês de marketing digital.",
    tags: ["Tom de Voz", "Governança", "IA Context"],
    isFavorite: true,
  },
  {
    id: "ast-doc-2",
    title: "Dossiê de Objeções Reais e Perguntas de Compra — ICP",
    category: "guias",
    projectScope: "Mentoria High-Ticket",
    formatLabel: "PDF Estruturado",
    dimensionsOrSpec: "12 páginas · Pesquisa ICP",
    sizeLabel: "490 KB",
    updatedAt: "Há 5 dias",
    description:
      "Mapeamento das 20 principais objeções silenciosas coletadas em diagnósticos comerciais e sessões estratégicas.",
    aiUsageDirective:
      "Fonte primária para o Modo 1 de Geração de Temas (A partir do negócio e do público).",
    tags: ["ICP", "Objeções", "Base Estratégica"],
    isFavorite: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Componente Principal: BrandAssetsStoragePage                               */
/* -------------------------------------------------------------------------- */

export default function BrandAssetsStoragePage() {
  const [assets, setAssets] =
    useState<readonly BrandAssetItem[]>(INITIAL_ASSETS);
  const [activeCategory, setActiveCategory] =
    useState<AssetCategoryId>("logos");
  const [selectedProject, setSelectedProject] =
    useState<string>("Todos os Projetos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* Feedback de cópia (HEX / Token / Diretriz IA) */
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Ativo selecionado para inspeção detalhada (Modal 360°) */
  const [inspectedAsset, setInspectedAsset] = useState<BrandAssetItem | null>(
    null
  );

  /* Estados do Modal de Upload / Novo Ativo */
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<AssetCategoryId>("logos");
  const [newProjectScope, setNewProjectScope] = useState<string>(
    "Acervo Global da Marca"
  );
  const [newFormatLabel, setNewFormatLabel] = useState<string>("PNG / SVG");
  const [newSpec, setNewSpec] = useState<string>("1920 × 1080 px");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newAiDirective, setNewAiDirective] = useState<string>("");
  const [newHex, setNewHex] = useState<string>("#CFA965");
  const [newTags, setNewTags] = useState<string>("Marca, Oficial");

  /* Opções tipadas para os componentes DarkCustomSelect */
  const projectFilterOptions = useMemo(() => {
    return PROJECT_SCOPES.map((scope) => ({
      value: scope,
      label: `Escopo: ${scope}`,
    }));
  }, []);

  const uploadCategoryOptions = useMemo(() => {
    return ASSET_CATEGORIES.map((c) => ({
      value: c.id,
      label: `${c.code} · ${c.label}`,
      hint: c.subtitle,
    }));
  }, []);

  const uploadProjectScopeOptions = useMemo(() => {
    return PROJECT_SCOPES.filter((s) => s !== "Todos os Projetos").map(
      (scope) => ({
        value: scope,
        label: scope,
      })
    );
  }, []);

  /* Contagem por categoria respeitando o escopo de projeto selecionado */
  const categoryCounts = useMemo(() => {
    const counts: Record<AssetCategoryId, number> = {
      logos: 0,
      paleta: 0,
      fotos: 0,
      templates: 0,
      broll: 0,
      guias: 0,
    };

    for (const item of assets) {
      const matchesProject =
        selectedProject === "Todos os Projetos" ||
        item.projectScope === selectedProject;
      if (matchesProject) {
        counts[item.category] += 1;
      }
    }
    return counts;
  }, [assets, selectedProject]);

  /* Lista filtrada final para a aba ativa */
  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return assets.filter((item) => {
      if (item.category !== activeCategory) return false;
      if (
        selectedProject !== "Todos os Projetos" &&
        item.projectScope !== selectedProject
      ) {
        return false;
      }
      if (onlyFavorites && !item.isFavorite) return false;
      if (!q) return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.formatLabel.toLowerCase().includes(q) ||
        item.dimensionsOrSpec.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [assets, activeCategory, selectedProject, onlyFavorites, searchQuery]);

  const activeCategoryMeta = useMemo(
    () =>
      ASSET_CATEGORIES.find((c) => c.id === activeCategory) ??
      ASSET_CATEGORIES[0],
    [activeCategory]
  );

  const handleCopyText = (id: string, textToCopy: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => null);
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const handleToggleFavorite = (assetId: string) => {
    setAssets((prev) =>
      prev.map((item) =>
        item.id === assetId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    setInspectedAsset((prev) =>
      prev && prev.id === assetId
        ? { ...prev, isFavorite: !prev.isFavorite }
        : prev
    );
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((item) => item.id !== assetId));
    if (inspectedAsset?.id === assetId) {
      setInspectedAsset(null);
    }
  };

  const handleOpenUploadModal = (presetCategory?: AssetCategoryId) => {
    setNewCategory(presetCategory ?? activeCategory);
    setIsUploadModalOpen(true);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: BrandAssetItem = {
      id: `ast-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      projectScope: newProjectScope,
      formatLabel: newFormatLabel.trim() || "Arquivo Digital",
      dimensionsOrSpec: newSpec.trim() || "Padrão Canônico",
      sizeLabel: "Novo · Sincronizado",
      updatedAt: "Agora mesmo",
      description:
        newDescription.trim() ||
        "Ativo cadastrado no acervo central para alimentar a operação editorial.",
      aiUsageDirective:
        newAiDirective.trim() ||
        "Disponível para referência contextual nas Funções 01, 02 e 03.",
      hexPreview: newCategory === "paleta" ? newHex : undefined,
      cssToken: newCategory === "paleta" ? "--la-custom-token" : undefined,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFavorite: false,
    };

    setAssets((prev) => [created, ...prev]);
    setActiveCategory(newCategory);
    setNewTitle("");
    setNewDescription("");
    setNewAiDirective("");
    setIsUploadModalOpen(false);
  };

  return (
    <div
      data-la-surface="dark"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-14 text-la-text-primary"
    >
      {/* 1. CABEÇALHO GLOBAL DO ACERVO DE MARCA & PRODUÇÃO */}
      <header className="relative overflow-hidden rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              <FolderArchive className="h-3.5 w-3.5 text-la-gold" />
              <span>
                Repositório Central de Identidade & Produção · {assets.length}{" "}
                ativos
              </span>
            </div>

            <h1 className="mt-2.5 font-la-sans text-2xl font-bold tracking-tight text-la-text-primary sm:text-[1.75rem]">
              Assets & Arquivos da Marca
            </h1>
            <p className="mt-1 max-w-3xl text-justify [text-align-last:left] hyphens-auto font-la-sans text-sm text-la-text-secondary">
              Centralize logotipos, paleta cromática, fotos do especialista,
              templates visuais, B-Rolls e documentos estratégicos. Todo ativo
              cadastrado aqui abastece diretamente os Studios de Roteirização e
              Criação de Conteúdo.
            </p>
          </div>

          {/* Medidor Compacto de Armazenamento + CTA de Upload */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-la-lg border border-white/10 bg-black/45 px-4 py-2.5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-muted">
                  Armazenamento Pro
                </span>
                <span className="font-la-mono text-xs font-bold text-la-gold-light">
                  3.4 GB / 25 GB
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-44 overflow-hidden rounded-la-full bg-white/10">
                <div className="h-full w-[18%] bg-la-gold" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenUploadModal()}
              className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2.5 font-la-sans text-xs font-bold text-la-text-inverse shadow-[0_0_24px_rgba(207,169,101,0.25)] transition-colors hover:bg-la-gold-light"
            >
              <Upload className="h-4 w-4" />
              <span>Cadastrar Asset / Arquivo</span>
            </button>
          </div>
        </div>

        {/* 2. TABS HORIZONTAIS DAS 6 CATEGORIAS OFICIAIS */}
        <nav
          aria-label="Categorias de Assets e Arquivos"
          className="mt-6 grid grid-cols-2 gap-2 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-6"
        >
          {ASSET_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id];

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "group relative flex flex-col items-start justify-between rounded-la-lg border p-3 text-left transition-all",
                  isActive
                    ? "border-la-border-gold/75 bg-la-gold-faint shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                    : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-white/[0.03]"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-la-xs border border-white/10 bg-black/50">
                    <Icon
                      className={clsx(
                        "h-3.5 w-3.5",
                        isActive
                          ? "text-la-gold"
                          : "text-la-text-muted group-hover:text-la-gold-light"
                      )}
                    />
                  </span>
                  <span
                    className={clsx(
                      "rounded-la-full px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold",
                      isActive
                        ? "border border-la-gold/50 bg-la-gold/20 text-la-gold-light"
                        : "bg-white/[0.04] text-la-text-muted"
                    )}
                  >
                    {count}
                  </span>
                </div>

                <div className="mt-2.5">
                  <span className="block font-la-mono text-[0.5625rem] uppercase tracking-[0.08em] text-la-text-muted">
                    Categoria {cat.code}
                  </span>
                  <span
                    className={clsx(
                      "mt-0.5 block font-la-sans text-xs font-bold leading-snug",
                      isActive ? "text-la-gold-light" : "text-la-text-primary"
                    )}
                  >
                    {cat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* 3. BARRA DE FILTROS CRUZADOS COM DARKCUSTOMSELECT */}
      <section className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar em ${activeCategoryMeta.label} por nome, formato, tag ou HEX...`}
              className="min-h-[2.625rem] w-full rounded-la-md border border-white/12 bg-black/50 pr-4 pl-10 font-la-sans text-xs text-la-text-primary placeholder:text-la-text-muted focus:border-la-gold focus:outline-none"
            />
          </div>

          {/* SELECT 1: Escopo de Projeto Editorial com DarkCustomSelect */}
          <div className="sm:min-w-[17rem]">
            <DarkCustomSelect
              fullWidth
              value={selectedProject}
              options={projectFilterOptions}
              onChange={setSelectedProject}
              ariaLabel="Filtrar por Projeto Editorial"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={clsx(
              "inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md border px-3.5 py-2 font-la-sans text-xs font-semibold transition-colors",
              onlyFavorites
                ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                : "border-white/12 bg-black/40 text-la-text-secondary hover:text-la-text-primary"
            )}
          >
            <Star
              className={clsx(
                "h-3.5 w-3.5",
                onlyFavorites
                  ? "fill-la-gold text-la-gold"
                  : "text-la-text-muted"
              )}
            />
            <span>Favoritos</span>
          </button>

          <div className="inline-flex rounded-la-md border border-white/12 bg-black/50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Visualização em grade"
              className={clsx(
                "inline-flex h-8 w-8 items-center justify-center rounded-la-xs transition-colors",
                viewMode === "grid"
                  ? "bg-la-gold text-la-text-inverse"
                  : "text-la-text-muted hover:text-la-text-primary"
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="Visualização em lista"
              className={clsx(
                "inline-flex h-8 w-8 items-center justify-center rounded-la-xs transition-colors",
                viewMode === "list"
                  ? "bg-la-gold text-la-text-inverse"
                  : "text-la-text-muted hover:text-la-text-primary"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FAIXA CONTEXTUAL DA CATEGORIA ATIVA */}
      <div className="flex flex-col justify-between gap-2 rounded-la-lg border border-la-border-gold/35 bg-[#090D16]/90 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-la-gold" />
          <p className="font-la-sans text-xs text-la-text-secondary">
            <strong className="text-la-gold-light">
              {activeCategoryMeta.code} · {activeCategoryMeta.label}:
            </strong>{" "}
            {activeCategoryMeta.subtitle}
          </p>
        </div>
        <Link
          href={WORKSPACE_ROUTES.bibliotecaConteudo}
          className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
        >
          Ir para Biblioteca de Conteúdo →
        </Link>
      </div>

      {/* 5. GRADE OU LISTA DE ATIVOS DA CATEGORIA SELECIONADA */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-la-xl border border-white/10 bg-[#0B0F18]/80 p-12 text-center">
          <FolderArchive className="h-10 w-10 text-la-gold/70" />
          <h2 className="mt-3 font-la-sans text-base font-bold text-la-text-primary">
            Nenhum ativo encontrado nesta combinação de filtros
          </h2>
          <p className="mt-1 max-w-md font-la-sans text-xs text-la-text-secondary">
            Cadastre um novo recurso em {activeCategoryMeta.label} ou limpe o
            filtro de busca para visualizar todo o acervo da marca.
          </p>
          <button
            type="button"
            onClick={() => handleOpenUploadModal(activeCategory)}
            className="mt-4 inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar em {activeCategoryMeta.label}</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const isCopied = copiedId === asset.id;

            return (
              <article
                key={asset.id}
                className="group flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0B0F18]/95 p-5 transition-all hover:border-la-border-gold/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
              >
                <div>
                  <div className="relative mb-4 flex h-36 w-full flex-col justify-between overflow-hidden rounded-la-lg border border-white/10 bg-[#06080E] p-3.5">
                    {asset.hexPreview ? (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-90"
                        style={{ backgroundColor: asset.hexPreview }}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(207,169,101,0.18),transparent_65%)]"
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="rounded-la-full border border-white/15 bg-black/70 px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light backdrop-blur-md">
                        {asset.formatLabel}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(asset.id)}
                        aria-label="Alternar favorito"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-la-full border border-white/15 bg-black/70 text-la-text-secondary backdrop-blur-md hover:border-la-gold hover:text-la-gold"
                      >
                        <Star
                          className={clsx(
                            "h-3.5 w-3.5",
                            asset.isFavorite
                              ? "fill-la-gold text-la-gold"
                              : "text-la-text-muted"
                          )}
                        />
                      </button>
                    </div>

                    <div className="relative z-10 flex items-end justify-between gap-2">
                      <span className="rounded-la-xs border border-white/10 bg-black/75 px-2 py-1 font-la-mono text-[0.6875rem] font-bold text-la-text-primary backdrop-blur-md">
                        {asset.dimensionsOrSpec}
                      </span>
                      <span className="font-la-mono text-[0.625rem] text-la-text-secondary drop-shadow">
                        {asset.sizeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-gold-light">
                      {asset.projectScope}
                    </span>
                    <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                      {asset.updatedAt}
                    </span>
                  </div>

                  <h2 className="mt-1 font-la-sans text-base font-bold leading-snug text-la-text-primary">
                    {asset.title}
                  </h2>

                  <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-secondary">
                    {asset.description}
                  </p>

                  <div className="mt-3 rounded-la-md border border-la-border-gold/30 bg-black/45 p-2.5">
                    <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Diretriz Contextual para a IA (Função 03)
                    </span>
                    <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.6875rem] leading-relaxed text-la-text-secondary">
                      {asset.aiUsageDirective}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3.5">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-la-xs border border-white/10 bg-white/[0.03] px-2 py-0.5 font-la-mono text-[0.625rem] text-la-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          asset.id,
                          asset.hexPreview ||
                            asset.cssToken ||
                            asset.aiUsageDirective
                        )
                      }
                      className="inline-flex min-h-[2.375rem] flex-1 items-center justify-center gap-1.5 rounded-la-md border border-white/12 bg-black/50 px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-primary transition-colors hover:border-la-gold hover:text-la-gold-light"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-la-gold" />
                          <span>
                            {asset.hexPreview
                              ? `Copiar ${asset.hexPreview}`
                              : "Copiar Diretriz IA"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectedAsset(asset)}
                      title="Inspecionar ativo em 360°"
                      className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-la-md border border-la-border-gold/45 bg-la-gold-faint text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* VISÃO EM LISTA TÉCNICA COMPACTA */
        <div className="flex flex-col gap-2.5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-4 lg:flex-row lg:items-center"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold/50 bg-black/60 font-la-mono text-xs font-bold text-la-gold-light"
                  style={
                    asset.hexPreview
                      ? { backgroundColor: asset.hexPreview, color: "#05060A" }
                      : undefined
                  }
                >
                  {asset.category.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-la-sans text-sm font-bold text-la-text-primary">
                      {asset.title}
                    </h3>
                    <span className="rounded-la-full border border-white/12 bg-black/45 px-2 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                      {asset.formatLabel} · {asset.dimensionsOrSpec}
                    </span>
                  </div>
                  <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                    {asset.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      asset.id,
                      asset.hexPreview || asset.aiUsageDirective
                    )
                  }
                  className="rounded-la-md border border-white/12 bg-black/45 px-3 py-2 font-la-mono text-xs text-la-gold-light hover:border-la-gold"
                >
                  {copiedId === asset.id ? "Copiado!" : "Copiar"}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedAsset(asset)}
                  className="rounded-la-md bg-la-gold px-3.5 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
                >
                  Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: INSPEÇÃO 360° DO ASSET SELECIONADO */}
      {inspectedAsset ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-la-xl border border-la-border-gold/60 bg-[#090C14] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-gold-light">
                  {inspectedAsset.projectScope} · {inspectedAsset.formatLabel}
                </span>
                <h2 className="mt-1 font-la-sans text-lg font-bold text-la-text-primary">
                  {inspectedAsset.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedAsset(null)}
                className="rounded-la-xs p-1 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 rounded-la-lg border border-white/10 bg-black/45 p-3.5 sm:grid-cols-3">
                <div>
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Especificação
                  </span>
                  <span className="font-la-mono text-xs font-bold text-la-gold-light">
                    {inspectedAsset.dimensionsOrSpec}
                  </span>
                </div>
                <div>
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Volume / Status
                  </span>
                  <span className="font-la-mono text-xs text-la-text-primary">
                    {inspectedAsset.sizeLabel}
                  </span>
                </div>
                <div>
                  <span className="block font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                    Atualização
                  </span>
                  <span className="font-la-mono text-xs text-la-text-primary">
                    {inspectedAsset.updatedAt}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                  Descrição Técnica e Visual
                </span>
                <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-secondary">
                  {inspectedAsset.description}
                </p>
              </div>

              <div className="rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint p-3.5">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Como a IA utiliza este ativo nos Studios (Função 03)
                </span>
                <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-primary">
                  {inspectedAsset.aiUsageDirective}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteAsset(inspectedAsset.id)}
                  className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md border border-red-500/35 bg-red-500/10 px-3.5 py-2 font-la-sans text-xs font-semibold text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remover do Acervo</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        inspectedAsset.id,
                        inspectedAsset.hexPreview ||
                          inspectedAsset.aiUsageDirective
                      )
                    }
                    className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md border border-white/15 bg-black/50 px-4 py-2 font-la-sans text-xs font-semibold text-la-text-primary hover:border-la-gold"
                  >
                    <Download className="h-4 w-4 text-la-gold" />
                    <span>Copiar Referência</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectedAsset(null)}
                    className="inline-flex min-h-[2.5rem] items-center rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: UPLOAD / CADASTRO DE NOVO ASSET DA MARCA (COM DARKCUSTOMSELECT) */}
      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-la-xl border border-la-border-gold/60 bg-[#090C14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-gold-light">
                  Novo Recurso de Marca & Produção
                </span>
                <h2 className="font-la-sans text-base font-bold text-la-text-primary">
                  Cadastrar Asset ou Arquivo no Repositório
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded-la-xs p-1 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAsset}
              className="mt-4 flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Título / Identificação do Ativo
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex.: Foto Oficial Capa YouTube — Fundo Escuro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3.5 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* SELECT 2: Categoria Oficial no Modal */}
                <div className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Categoria Oficial (1 a 6)
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    menuZIndex="z-[260]"
                    value={newCategory}
                    options={uploadCategoryOptions}
                    onChange={(val) => setNewCategory(val as AssetCategoryId)}
                    ariaLabel="Selecionar categoria oficial do ativo"
                  />
                </div>

                {/* SELECT 3: Projeto Editorial Vinculado no Modal */}
                <div className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Projeto Editorial Vinculado
                  </span>
                  <DarkCustomSelect
                    fullWidth
                    align="right"
                    menuZIndex="z-[260]"
                    value={newProjectScope}
                    options={uploadProjectScopeOptions}
                    onChange={setNewProjectScope}
                    ariaLabel="Selecionar projeto editorial vinculado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Formato (SVG, WEBP, MP4, PDF, HEX)
                  </span>
                  <input
                    type="text"
                    value={newFormatLabel}
                    onChange={(e) => setNewFormatLabel(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-mono text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Dimensões / Especificação
                  </span>
                  <input
                    type="text"
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-mono text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                  />
                </label>
              </div>

              {newCategory === "paleta" ? (
                <label className="flex flex-col gap-1">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Código HEX da Cor
                  </span>
                  <input
                    type="text"
                    value={newHex}
                    onChange={(e) => setNewHex(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-mono text-xs text-la-gold-light focus:border-la-gold focus:outline-none"
                  />
                </label>
              ) : null}

              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Descrição do Ativo
                </span>
                <textarea
                  rows={2}
                  placeholder="Explique o contexto visual ou documental deste arquivo..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="rounded-la-md border border-white/12 bg-black/50 p-3 font-la-sans text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-gold-light">
                  Diretriz de Uso pela IA (Função 03 — Roteiros & Capas)
                </span>
                <textarea
                  rows={2}
                  placeholder="Ex.: Usar este B-Roll sempre que o roteiro abordar prova de execução..."
                  value={newAiDirective}
                  onChange={(e) => setNewAiDirective(e.target.value)}
                  className="rounded-la-md border border-la-border-gold/40 bg-black/50 p-3 font-la-sans text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Tags (separadas por vírgula)
                </span>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="min-h-[2.5rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-mono text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-xs font-semibold text-la-text-secondary hover:text-la-text-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[2.625rem] rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
                >
                  Salvar no Repositório
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}