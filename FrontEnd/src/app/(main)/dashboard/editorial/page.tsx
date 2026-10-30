// FrontEnd/src/app/(main)/dashboard/editorial/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  FolderKanban,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  useEditorialWorkspace,
  type EditorialProjectModel,
  type ProjectStatus,
} from "@/lib/context/EditorialWorkspaceContext";

const NAMING_SUGGESTIONS: readonly string[] = [
  "Autoridade Imperial — Orgânico",
  "Produto X — Lançamento Semente",
  "Mentoria Premium — Aquecimento",
  "Clínica Alpha — Captação de Pacientes",
  "Consultoria B2B — Evergreen",
] as const;

const OPERATION_FILTER_OPTIONS = [
  { value: "all", label: "Todas as operações" },
  { value: "Orgânico", label: "Operação Orgânica" },
  { value: "Lançamento", label: "Lançamento" },
  { value: "Campanha", label: "Campanha" },
  { value: "Evergreen", label: "Perpétuo / Evergreen" },
  { value: "Cliente", label: "Cliente de Agência" },
] as const;

const OPERATION_TYPE_OPTIONS = [
  { value: "Orgânico", label: "Orgânico" },
  { value: "Lançamento", label: "Lançamento" },
  { value: "Evergreen", label: "Evergreen / Perpétuo" },
  { value: "Campanha", label: "Campanha" },
  { value: "Cliente", label: "Cliente" },
  { value: "Produto", label: "Produto" },
] as const;

const OBJECTIVE_OPTIONS = [
  { value: "Conversão", label: "Conversão / Vendas" },
  { value: "Crescimento e Autoridade", label: "Crescimento e Autoridade" },
  { value: "Geração de Leads", label: "Geração de Leads" },
  { value: "Aquecer Audiência", label: "Aquecer Audiência" },
  { value: "Autoridade", label: "Construir Autoridade" },
] as const;

const STATUS_SELECT_OPTIONS: readonly {
  readonly value: ProjectStatus;
  readonly label: string;
}[] = [
  { value: "active", label: "Ativo" },
  { value: "in_setup", label: "Em estruturação" },
  { value: "in_review", label: "Em revisão" },
  { value: "archived", label: "Arquivado" },
];

const STATUS_BADGE_CONFIG: Record<
  ProjectStatus,
  { readonly label: string; readonly className: string }
> = {
  active: {
    label: "ATIVO",
    className:
      "border-la-gold bg-la-gold/20 text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.24)]",
  },
  in_setup: {
    label: "EM ESTRUTURAÇÃO",
    className: "border-white/20 bg-white/[0.06] text-la-text-primary",
  },
  in_review: {
    label: "EM REVISÃO",
    className: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  },
  archived: {
    label: "ARQUIVADO",
    className: "border-white/10 bg-black/55 text-la-text-muted",
  },
};

/**
 * Componente Dropdown Customizado no Design System Dark-First (--la-*).
 * Substitui o `<select>` nativo cinza/azul do Windows/Chrome (Ponto 05).
 */
function DarkCustomSelect<T extends string>({
  value,
  options,
  onChange,
  icon: Icon,
  fullWidth = false,
}: {
  readonly value: T;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (nextVal: T) => void;
  readonly icon?: typeof SlidersHorizontal;
  readonly fullWidth?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((opt) => opt.value === value) ?? options[0] ?? null;

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!selected) return null;

  return (
    <div
      ref={containerRef}
      className={clsx("relative", fullWidth ? "w-full" : "w-auto")}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={clsx(
          "inline-flex min-h-[2.5rem] items-center justify-between gap-2.5 rounded-la-md border px-3.5 py-1.5 font-la-sans text-[0.8125rem] transition-all duration-180",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
          fullWidth ? "w-full" : "min-w-[12.5rem]",
          isOpen
            ? "border-la-gold bg-[#0E1320] text-la-gold-light shadow-[0_0_20px_rgba(207,169,101,0.16)]"
            : "border-white/12 bg-black/60 text-la-text-primary hover:border-la-border-gold/60"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon ? (
            <Icon aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
          ) : null}
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "h-3.5 w-3.5 shrink-0 text-la-gold transition-transform duration-180",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className={clsx(
              "absolute right-0 z-50 mt-1.5 overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.92),0_0_36px_rgba(207,169,101,0.14)] backdrop-blur-2xl",
              fullWidth ? "inset-x-0 w-full" : "w-56"
            )}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-la-md px-3 py-2 text-left font-la-sans text-[0.8125rem] transition-colors",
                    active
                      ? "bg-la-gold-faint font-semibold text-la-gold-light"
                      : "text-la-text-secondary hover:bg-white/[0.05] hover:text-la-text-primary"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {active ? (
                    <Check
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-la-gold"
                    />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function CentralEstrategicaPage() {
  const searchParams = useSearchParams();
  const {
    workspaceName,
    projects,
    activityEvents,
    createProject,
    updateProject,
    duplicateProject,
    toggleArchiveProject,
  } = useEditorialWorkspace();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  /* Modal 1: Criar Novo Projeto Editorial */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newBrand, setNewBrand] = useState<string>(workspaceName);
  const [newNiche, setNewNiche] = useState<string>("");
  const [newSubniche, setNewSubniche] = useState<string>("");
  const [newOpType, setNewOpType] = useState<string>("Orgânico");
  const [newObjective, setNewObjective] = useState<string>("Conversão");
  const [newPhase, setNewPhase] = useState<string>("Estruturação Inicial");
  const [createError, setCreateError] = useState<string | null>(null);

  /* Abre modal automaticamente se vier de "+ Criar -> Novo Projeto" no Header */
  useEffect(() => {
    if (searchParams?.get("acao") === "novo-projeto") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  /* Modal 2: Editar Informações Administrativas do Projeto */
  const [editingProject, setEditingProject] =
    useState<EditorialProjectModel | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editBrand, setEditBrand] = useState<string>("");
  const [editNiche, setEditNiche] = useState<string>("");
  const [editSubniche, setEditSubniche] = useState<string>("");
  const [editOpType, setEditOpType] = useState<string>("Orgânico");
  const [editObjective, setEditObjective] = useState<string>("Conversão");
  const [editPhase, setEditPhase] = useState<string>("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("active");

  /* Modal 3: Duplicar Projeto */
  const [duplicatingProject, setDuplicatingProject] =
    useState<EditorialProjectModel | null>(null);
  const [dupName, setDupName] = useState<string>("");
  const [copyStrategicBase, setCopyStrategicBase] = useState<boolean>(true);
  const [copyLineEditorial, setCopyLineEditorial] = useState<boolean>(true);
  const [copyThemes, setCopyThemes] = useState<boolean>(true);
  const [copyCalendars, setCopyCalendars] = useState<boolean>(false);
  const [copyScripts, setCopyScripts] = useState<boolean>(false);

  /* Modal 4: Arquivar / Restaurar Projeto */
  const [archivingProject, setArchivingProject] =
    useState<EditorialProjectModel | null>(null);

  /* Modal 5: Histórico Auditado de Atividade do Projeto */
  const [activityModalProject, setActivityModalProject] =
    useState<EditorialProjectModel | null>(null);

  const counts = useMemo(() => {
    return {
      nonArchivedTotal: projects.filter((p) => p.status !== "archived").length,
      active: projects.filter((p) => p.status === "active").length,
      inSetup: projects.filter((p) => p.status === "in_setup").length,
      inReview: projects.filter((p) => p.status === "in_review").length,
      archived: projects.filter((p) => p.status === "archived").length,
    };
  }, [projects]);

  /* Se a conta do cliente não tiver nenhum projeto (projects.length === 0), entra automaticamente no Onboarding Inicial (Ponto 02) */
  const accountHasZeroProjects = projects.length === 0;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (statusFilter === "all" && project.status === "archived") {
        return false;
      }
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      if (
        operationFilter !== "all" &&
        project.operationTypeLabel.toLowerCase() !==
          operationFilter.toLowerCase()
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(q) ||
        project.brandOrClientName.toLowerCase().includes(q) ||
        project.niche.toLowerCase().includes(q) ||
        project.subniche.toLowerCase().includes(q) ||
        project.currentObjectiveLabel.toLowerCase().includes(q) ||
        project.operationTypeLabel.toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery, statusFilter, operationFilter]);

  const hasRadicalStrategicChange = useMemo(() => {
    if (!editingProject) return false;
    return (
      editNiche.trim().toLowerCase() !==
        editingProject.niche.trim().toLowerCase() ||
      editObjective !== editingProject.currentObjectiveLabel
    );
  }, [editingProject, editNiche, editObjective]);

  const handleCreateProjectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    if (!newName.trim() || !newBrand.trim() || !newNiche.trim()) {
      setCreateError(
        "Informe obrigatoriamente o Nome do Projeto, a Marca/Especialista e o Nicho principal."
      );
      return;
    }

    createProject({
      name: newName,
      brandOrClientName: newBrand,
      niche: newNiche,
      subniche: newSubniche,
      operationTypeLabel: newOpType,
      currentObjectiveLabel: newObjective,
      currentPhaseLabel: newPhase,
    });

    setIsCreateModalOpen(false);
    setNewName("");
    setNewNiche("");
    setNewSubniche("");
  };

  const handleOpenEditModal = (project: EditorialProjectModel) => {
    setOpenCardMenuId(null);
    setEditingProject(project);
    setEditName(project.name);
    setEditBrand(project.brandOrClientName);
    setEditNiche(project.niche);
    setEditSubniche(project.subniche);
    setEditOpType(project.operationTypeLabel);
    setEditObjective(project.currentObjectiveLabel);
    setEditPhase(project.currentPhaseLabel);
    setEditStatus(project.status);
  };

  const handleSaveEditedProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProject || !editName.trim()) return;

    updateProject({
      id: editingProject.id,
      name: editName,
      brandOrClientName: editBrand,
      niche: editNiche,
      subniche: editSubniche,
      operationTypeLabel: editOpType,
      currentObjectiveLabel: editObjective,
      currentPhaseLabel: editPhase,
      status: editStatus,
    });

    setEditingProject(null);
  };

  const handleOpenDuplicateModal = (project: EditorialProjectModel) => {
    setOpenCardMenuId(null);
    setDuplicatingProject(project);
    setDupName(`${project.brandOrClientName} — Nova Campanha`);
    setCopyStrategicBase(true);
    setCopyLineEditorial(true);
    setCopyThemes(true);
    setCopyCalendars(false);
    setCopyScripts(false);
  };

  const handleConfirmDuplicate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!duplicatingProject || !dupName.trim()) return;

    duplicateProject({
      sourceProjectId: duplicatingProject.id,
      newName: dupName,
      copyStrategicBase,
      copyLineEditorial,
      copyThemes,
      copyCalendars,
      copyScripts,
    });

    setDuplicatingProject(null);
  };

  const handleConfirmArchiveToggle = () => {
    if (!archivingProject) return;
    toggleArchiveProject(archivingProject.id);
    setArchivingProject(null);
  };

  return (
    <div className="flex flex-col gap-7">
      {/* 1. CABEÇALHO DA CENTRAL ESTRATÉGICA (Seção 4.2 — Limpo, apenas com "+ Novo Projeto") */}
      <section className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex w-fit items-center gap-2 rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-3 py-0.5">
            <FolderKanban
              aria-hidden="true"
              className="h-3.5 w-3.5 text-la-gold"
            />
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              PROJETOS EDITORIAIS · AMBIENTES CONTEXTUALIZADOS E ISOLADOS
            </span>
          </div>

          <h1 className="mt-1 font-la-sans text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary sm:text-[2.25rem]">
            Central Estratégica
          </h1>

          <p className="font-la-sans text-[0.9375rem] text-la-text-secondary">
            Gerencie seus projetos, campanhas e operações editoriais em um único
            lugar. Escolha o contexto estratégico em que sua IA vai pensar,
            planejar e produzir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
          >
            <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </section>

      {/* 2. BARRA DE BUSCA, FILTRO DARK-FIRST CUSTOMIZADO E CONTAGEM (Pontos 03 e 05) */}
      {!accountHasZeroProjects ? (
        <section className="flex flex-col gap-3.5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-[26rem]">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-gold/80"
              />
              <input
                type="search"
                placeholder="Buscar projeto por nome, marca, nicho ou objetivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[2.5rem] w-full rounded-la-md border border-white/12 bg-black/55 py-1.5 pr-4 pl-10 font-la-sans text-[0.8125rem] text-la-text-primary placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro de Operações Customizado Dark-First (Sem <select> nativo cinza/azul) */}
              <DarkCustomSelect
                value={operationFilter}
                options={OPERATION_FILTER_OPTIONS}
                onChange={setOperationFilter}
                icon={SlidersHorizontal}
              />

              <div className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1">
                {[
                  { id: "all" as const, label: "Todos" },
                  { id: "active" as const, label: "Ativos" },
                  { id: "in_setup" as const, label: "Em estruturação" },
                  { id: "in_review" as const, label: "Em revisão" },
                  { id: "archived" as const, label: "Arquivados" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={clsx(
                      "rounded-la-xs px-2.5 py-1 font-la-mono text-[0.6875rem] font-medium transition-colors",
                      statusFilter === tab.id
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:text-la-text-primary"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2.5 font-la-mono text-[0.6875rem] text-la-text-muted">
            <span>
              <strong className="text-la-text-primary">
                {counts.nonArchivedTotal} projetos
              </strong>{" "}
              ({counts.active} ativos · {counts.inSetup} em estruturação ·{" "}
              {counts.inReview} em revisão
              {counts.archived > 0 ? ` · ${counts.archived} arquivados` : ""})
            </span>

            {/* Frase em Português Claro e Estratégico (Ponto 03 corrigido) */}
            <span className="text-la-gold-light">
              Cada projeto opera com contexto estratégico e repertório 100%
              isolados
            </span>
          </div>
        </section>
      ) : null}

      {/* 3. CENÁRIO A: CONTA SEM PROJETOS OU FILTRO VAZIO (Seções 1.2 e 4.10) */}
      {accountHasZeroProjects ? (
        <section className="mx-auto flex w-full max-w-[46rem] flex-col items-center rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-8 text-center shadow-[var(--la-elevation-2)] sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-la-xl border border-la-gold/60 bg-la-gold-faint text-la-gold shadow-[0_0_28px_rgba(207,169,101,0.28)]">
            <FolderKanban aria-hidden="true" className="h-7 w-7" />
          </div>

          <span className="mt-4 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-la-gold-light">
            ONBOARDING EDITORIAL INICIAL
          </span>

          <h2 className="mt-2 text-balance font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
            Vamos estruturar seu primeiro Projeto Editorial.
          </h2>

          <p className="mt-2 max-w-[36rem] font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
            Antes de gerar conteúdos, vamos organizar a base estratégica que
            orientará sua linha editorial, calendário, temas e roteiros.
          </p>

          <div className="mt-6 w-full rounded-la-lg border border-white/10 bg-black/50 p-5 text-left">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Criar Projeto Editorial — Isolamento de Contexto
            </span>
            <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
              Seu Projeto Editorial guarda o nicho, a oferta, a promessa, o
              público, a linha editorial, os calendários, os temas e os roteiros
              daquele contexto. Isso impede que a inteligência da plataforma
              misture produtos, campanhas ou estratégias diferentes.
            </p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-[2.875rem] items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
            >
              <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
              <span>Começar meu projeto</span>
            </button>
          </div>
        </section>
      ) : filteredProjects.length === 0 ? (
        <section className="rounded-la-xl border border-white/10 bg-[#080B12]/90 p-8 text-center">
          <p className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
            Nenhum projeto encontrado para os filtros aplicados.
          </p>
          <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
            Limpe a busca ou altere o filtro de status/operação para visualizar
            seus demais projetos.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setOperationFilter("all");
            }}
            className="mt-4 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-4 py-2 font-la-mono text-[0.75rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
          >
            Limpar filtros
          </button>
        </section>
      ) : (
        /* 4. GRADE DE CARDS DOS PROJETOS DO CLIENTE (Seções 4.3 a 4.8) */
        <section className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const badge = STATUS_BADGE_CONFIG[project.status];
            const isMenuOpen = openCardMenuId === project.id;
            const workspaceHref = `/dashboard/editorial/${project.id}`;

            const themesSummaryText =
              project.themesCount === 0
                ? "Pendente — gerar temas"
                : project.allocatedThemesCount > 0
                  ? `${project.themesCount} temas · ${project.allocatedThemesCount} alocados`
                  : `${project.themesCount} temas na biblioteca`;

            const scriptsSummaryText =
              project.approvedScriptsCount === 0 &&
              project.draftScriptsCount === 0
                ? "Pendente — criar roteiros"
                : `${project.approvedScriptsCount} prontos · ${project.draftScriptsCount} rascunhos`;

            return (
              <article
                key={project.id}
                className={clsx(
                  "group relative flex h-full flex-col justify-between rounded-la-xl border p-6 transition-all duration-200",
                  project.status === "active"
                    ? "border-la-border-gold/55 bg-[#090D16]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_20px_44px_rgba(0,0,0,0.75)] hover:border-la-gold"
                    : "border-white/12 bg-[#080B12]/90 hover:border-white/25"
                )}
              >
                <div>
                  {/* CAMADA 1 — IDENTIDADE DO PROJETO + BADGE + MENU 3 PONTOS */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-lg border border-la-border-gold/50 bg-la-gold-faint text-la-gold">
                        <FolderKanban aria-hidden="true" className="h-4 w-4" />
                      </span>

                      <div className="min-w-0">
                        <h2
                          title={project.name}
                          className="line-clamp-2 font-la-sans text-[1.125rem] font-semibold leading-[1.25] text-la-text-primary"
                        >
                          {project.name}
                        </h2>
                        <span className="mt-0.5 block truncate font-la-mono text-[0.6875rem] text-la-text-muted">
                          {project.brandOrClientName}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={clsx(
                          "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em]",
                          badge.className
                        )}
                      >
                        {badge.label}
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCardMenuId((prev) =>
                              prev === project.id ? null : project.id
                            )
                          }
                          aria-label="Menu de ações secundárias do projeto"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-la-md border border-transparent text-la-text-muted transition-colors hover:border-white/12 hover:bg-white/[0.05] hover:text-la-text-primary"
                        >
                          <MoreVertical
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </button>

                        {isMenuOpen ? (
                          <div className="absolute right-0 z-30 mt-1.5 w-56 rounded-la-lg border border-white/15 bg-[#090C14]/98 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.92)] backdrop-blur-xl">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(project)}
                              className="flex w-full items-center gap-2.5 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-la-gold" />
                              <span>Editar informações do projeto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDuplicateModal(project)}
                              className="flex w-full items-center gap-2.5 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                            >
                              <Copy className="h-3.5 w-3.5 text-la-gold" />
                              <span>Duplicar projeto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setActivityModalProject(project);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                            >
                              <Clock className="h-3.5 w-3.5 text-la-gold" />
                              <span>Ver atividade do projeto</span>
                            </button>

                            <div className="my-1 h-px bg-white/10" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setArchivingProject(project);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] text-amber-200 hover:bg-amber-500/10"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              <span>
                                {project.status === "archived"
                                  ? "Restaurar projeto"
                                  : "Arquivar projeto"}
                              </span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* CAMADA 2 — RESUMO ESTRATÉGICO */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-la-lg border border-white/8 bg-black/40 p-3 font-la-sans text-[0.75rem]">
                    <div className="min-w-0">
                      <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                        Nicho e Subnicho
                      </span>
                      <span
                        title={`${project.niche} / ${project.subniche}`}
                        className="mt-0.5 block truncate font-medium text-la-text-primary"
                      >
                        {project.niche} / {project.subniche}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                        Objetivo Atual
                      </span>
                      <span className="mt-0.5 block truncate font-semibold text-la-gold-light">
                        {project.currentObjectiveLabel}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-between border-t border-white/8 pt-2 font-la-mono text-[0.625rem] text-la-text-secondary">
                      <span>Operação: {project.operationTypeLabel}</span>
                      <span className="truncate text-la-text-primary">
                        {project.currentPhaseLabel}
                      </span>
                    </div>
                  </div>

                  {/* CAMADA 3 — PROGRESSO METODOLÓGICO */}
                  <div className="mt-4 flex flex-col gap-1.5 rounded-la-lg border border-white/8 bg-white/[0.015] p-3 font-la-sans text-[0.75rem]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-secondary">
                        LINHA EDITORIAL
                      </span>
                      <span className="truncate font-la-mono text-[0.6875rem] font-medium text-la-text-primary">
                        ● {project.lineEditorialStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-secondary">
                        CALENDÁRIO
                      </span>
                      <span className="truncate font-la-mono text-[0.6875rem] font-medium text-la-text-primary">
                        ● {project.calendarStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-secondary">
                        TEMAS
                      </span>
                      <span className="truncate font-la-mono text-[0.6875rem] font-medium text-la-text-primary">
                        {themesSummaryText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-secondary">
                        ROTEIROS
                      </span>
                      <span className="truncate font-la-mono text-[0.6875rem] font-medium text-la-text-primary">
                        {scriptsSummaryText}
                      </span>
                    </div>
                  </div>

                  {/* CAMADA 4 — PRÓXIMA AÇÃO RECOMENDADA */}
                  <div className="mt-4 rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint p-3.5">
                    <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      PRÓXIMA AÇÃO
                    </span>
                    <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      {project.nextActionLabel}
                    </p>
                    <p className="mt-0.5 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                      {project.nextActionReason}
                    </p>
                  </div>
                </div>

                {/* CTA PRINCIPAL: "Entrar no Workspace" */}
                <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-4">
                  <Link
                    href={workspaceHref}
                    className={clsx(
                      "inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-la-md px-4 py-2.5 font-la-sans text-[0.875rem] font-semibold transition-all",
                      project.status === "active"
                        ? "bg-la-gold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                        : "border border-la-border-gold/60 bg-white/[0.04] text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                    )}
                  >
                    <span>Entrar no Workspace</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>

                  <div className="flex items-center justify-between font-la-mono text-[0.625rem] text-la-text-muted">
                    <span>{project.updatedAtLabel}</span>
                    <span>Contexto estratégico isolado</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* MODAL 1: CRIAR NOVO PROJETO EDITORIAL (Com Dropdowns Dark-First Customizados) */}
      <AnimatePresence>
        {isCreateModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-project-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[38rem] overflow-visible rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    IDENTIFICAÇÃO DO PROJETO EDITORIAL
                  </span>
                  <h2
                    id="create-project-title"
                    className="font-la-sans text-[1.25rem] font-semibold text-la-text-primary"
                  >
                    Criar Projeto Editorial
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleCreateProjectSubmit}
                className="mt-4 flex flex-col gap-3.5"
              >
                {createError ? (
                  <div className="rounded-la-md border border-red-500/45 bg-red-950/40 p-3 font-la-sans text-[0.8125rem] text-red-200">
                    {createError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Nome do Projeto (Marca/Produto — Objetivo ou Fase) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Produto X — Lançamento Semente"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  />

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                      Sugestões:
                    </span>
                    {NAMING_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewName(sug)}
                        className="rounded-la-xs border border-white/10 bg-white/[0.03] px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light transition-colors hover:border-la-border-gold"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Marca, Especialista ou Empresa *
                    </label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Tipo de Projeto / Operação *
                    </label>
                    <DarkCustomSelect
                      value={newOpType}
                      options={OPERATION_TYPE_OPTIONS}
                      onChange={setNewOpType}
                      fullWidth={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Nicho Principal *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Finanças"
                      value={newNiche}
                      onChange={(e) => setNewNiche(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Subnicho (Recomendado)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Algorithmic Trading"
                      value={newSubniche}
                      onChange={(e) => setNewSubniche(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Objetivo Atual *
                    </label>
                    <DarkCustomSelect
                      value={newObjective}
                      options={OBJECTIVE_OPTIONS}
                      onChange={setNewObjective}
                      fullWidth={true}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Período ou Fase Inicial
                    </label>
                    <input
                      type="text"
                      value={newPhase}
                      onChange={(e) => setNewPhase(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                    Status inicial: Em estruturação
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                    >
                      <span>Salvar e Criar Base Estratégica</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* MODAL 2: EDITAR INFORMAÇÕES DO PROJETO */}
      <AnimatePresence>
        {editingProject ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[36rem] overflow-visible rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <h2 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                  Editar Informações do Projeto Editorial
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleSaveEditedProject}
                className="mt-4 flex flex-col gap-3.5"
              >
                {hasRadicalStrategicChange ? (
                  <div className="flex items-start gap-2.5 rounded-la-lg border border-amber-400/50 bg-amber-950/30 p-3.5 text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5]">
                      Essa alteração pode afetar a Linha Editorial, o
                      Calendário, os Temas e os Roteiros existentes.
                      Recomendamos criar uma nova versão da Linha Editorial
                      antes de seguir.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Marca / Especialista / Cliente
                    </label>
                    <input
                      type="text"
                      value={editBrand}
                      onChange={(e) => setEditBrand(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Status Geral
                    </label>
                    <DarkCustomSelect
                      value={editStatus}
                      options={STATUS_SELECT_OPTIONS}
                      onChange={setEditStatus}
                      fullWidth={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Nicho
                    </label>
                    <input
                      type="text"
                      value={editNiche}
                      onChange={(e) => setEditNiche(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Subnicho
                    </label>
                    <input
                      type="text"
                      value={editSubniche}
                      onChange={(e) => setEditSubniche(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Objetivo Atual
                    </label>
                    <DarkCustomSelect
                      value={editObjective}
                      options={OBJECTIVE_OPTIONS}
                      onChange={setEditObjective}
                      fullWidth={true}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Fase ou Período
                    </label>
                    <input
                      type="text"
                      value={editPhase}
                      onChange={(e) => setEditPhase(e.target.value)}
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* MODAL 3: DUPLICAR PROJETO */}
      <AnimatePresence>
        {duplicatingProject ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDuplicatingProject(null)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <h2 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                Duplicar Projeto Editorial
              </h2>
              <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                Um novo ambiente estratégico isolado será criado. Selecione o
                que deseja copiar:
              </p>

              <form
                onSubmit={handleConfirmDuplicate}
                className="mt-4 flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Novo Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={dupName}
                    onChange={(e) => setDupName(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/45 p-3.5 font-la-sans text-[0.8125rem]">
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-la-text-primary">
                      Base Estratégica (copiar e marcar para revisão)
                    </span>
                    <input
                      type="checkbox"
                      checked={copyStrategicBase}
                      onChange={(e) => setCopyStrategicBase(e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-la-text-primary">
                      Linha Editorial ativa (como nova versão rascunho)
                    </span>
                    <input
                      type="checkbox"
                      checked={copyLineEditorial}
                      onChange={(e) => setCopyLineEditorial(e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-la-text-primary">
                      Temas (copiar como biblioteca de referência)
                    </span>
                    <input
                      type="checkbox"
                      checked={copyThemes}
                      onChange={(e) => setCopyThemes(e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-la-text-secondary">
                    <span>Calendários (não copiar por padrão)</span>
                    <input
                      type="checkbox"
                      checked={copyCalendars}
                      onChange={(e) => setCopyCalendars(e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-la-text-secondary">
                    <span>Roteiros (marcar como necessita adaptação)</span>
                    <input
                      type="checkbox"
                      checked={copyScripts}
                      onChange={(e) => setCopyScripts(e.target.checked)}
                    />
                  </label>
                </div>

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicatingProject(null)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Duplicar Projeto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* MODAL 4: CONFIRMAÇÃO DE ARQUIVAMENTO */}
      <AnimatePresence>
        {archivingProject ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setArchivingProject(null)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[30rem] overflow-hidden rounded-la-xl border border-white/15 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <h2 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                {archivingProject.status === "archived"
                  ? "Restaurar este projeto?"
                  : "Arquivar este projeto?"}
              </h2>

              <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                {archivingProject.status === "archived"
                  ? "O projeto voltará a aparecer entre suas operações ativas e no Painel do Dia."
                  : "Os conteúdos, roteiros, calendários e materiais continuarão salvos. O projeto apenas deixará de aparecer entre suas operações ativas e no Painel do Dia."}
              </p>

              <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setArchivingProject(null)}
                  className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmArchiveToggle}
                  className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                >
                  {archivingProject.status === "archived"
                    ? "Restaurar projeto"
                    : "Arquivar projeto"}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* MODAL 5: HISTÓRICO DE ATIVIDADE DO PROJETO */}
      <AnimatePresence>
        {activityModalProject ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivityModalProject(null)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[32rem] overflow-hidden rounded-la-xl border border-la-border-gold/50 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                    HISTÓRICO DE ATIVIDADE DO PROJETO
                  </span>
                  <h2 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                    {activityModalProject.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityModalProject(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {activityEvents
                  .filter((ev) => ev.projectName === activityModalProject.name)
                  .slice(0, 6)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="border-l-2 border-la-gold/55 pl-3 text-[0.8125rem]"
                    >
                      <span className="font-la-mono text-[0.625rem] text-la-gold-light">
                        {ev.occurredAt}
                      </span>
                      <p className="mt-0.5 text-la-text-primary">{ev.label}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-5 flex justify-end border-t border-white/10 pt-3.5">
                <button
                  type="button"
                  onClick={() => setActivityModalProject(null)}
                  className="rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}