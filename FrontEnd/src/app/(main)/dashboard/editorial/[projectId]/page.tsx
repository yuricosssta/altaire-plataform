// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/page.tsx
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Edit3,
  FileText,
  Flame,
  Lightbulb,
  MoreVertical,
  Plus,
  Radar,
} from "lucide-react";
import { clsx } from "clsx";
import {
  useEditorialWorkspace,
  type ProjectStatus,
} from "@/lib/context/EditorialWorkspaceContext";
import { LinhaEditorialModule } from "@/components/editorial/workspace/LinhaEditorialModule";
import { CalendarioEditorialModule } from "@/components/editorial/workspace/CalendarioEditorialModule";
import { TemasEditorialModule } from "@/components/editorial/workspace/TemasEditorialModule";
import { RoteirosEditorialModule } from "@/components/editorial/workspace/RoteirosEditorialModule";

export type WorkspaceTabKey =
  | "dashboard"
  | "linha-editorial"
  | "calendario"
  | "temas"
  | "roteiros";

type ThemesSubTabKey = "gerar" | "mapa" | "integracao";

type ThemeLibraryItem = {
  readonly id: string;
  readonly title: string;
  readonly origin: "ROMA & Avatar" | "Dados de Mercado" | "Objetivo e Momento";
  readonly pillar: string;
  readonly retinaType:
    | "Transformação"
    | "Níveis de Consciência"
    | "Autoridade"
    | "Relacionamento"
    | "Engajamento"
    | "Interação";
  readonly painOrObjection: string;
  readonly awarenessLevel: string;
  readonly suggestedFormat: string;
  readonly priority: boolean;
  readonly allocatedSlotLabel: string | null;
};

type OpenCalendarSlotIntegrationItem = {
  readonly id: string;
  readonly slotLabel: string;
  readonly format: string;
  readonly retinaRequired: string;
  readonly assignedThemeTitle: string | null;
};

type ScriptFormatKey =
  | "short_video"
  | "long_video"
  | "live"
  | "carousel"
  | "static_post"
  | "stories_sequence";

type ScriptItemModel = {
  readonly id: string;
  readonly title: string;
  readonly formatKey: ScriptFormatKey;
  readonly formatLabel: string;
  readonly status: "approved" | "draft" | "in_production" | "published";
  readonly retinaType: string;
  readonly pillar: string;
  readonly linkedSlotLabel: string;
  readonly mode: "Modo Conexão" | "Modo Técnico/Segurança";
  readonly updatedAt: string;
};

const WORKSPACE_TABS: readonly {
  readonly key: WorkspaceTabKey;
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: typeof Radar;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: Radar,
  },
  {
    key: "linha-editorial",
    label: "Linha Editorial",
    shortLabel: "Linha",
    icon: Compass,
  },
  {
    key: "calendario",
    label: "Calendário",
    shortLabel: "Calendário",
    icon: Calendar,
  },
  {
    key: "temas",
    label: "Temas",
    shortLabel: "Temas",
    icon: Lightbulb,
  },
  {
    key: "roteiros",
    label: "Roteiros",
    shortLabel: "Roteiros",
    icon: FileText,
  },
] as const;

const STATUS_BADGE_STYLES: Record<
  ProjectStatus,
  { readonly label: string; readonly className: string }
> = {
  active: {
    label: "ATIVO",
    className:
      "border-la-gold bg-la-gold/20 text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.25)]",
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

const SCRIPT_FORMAT_DEFINITIONS: readonly {
  readonly key: ScriptFormatKey;
  readonly name: string;
  readonly description: string;
  readonly plannedWeekly: number;
}[] = [
  {
    key: "short_video",
    name: "Vídeos Curtos",
    description: "Reels, Shorts e TikTok — conteúdo rápido de alta retenção.",
    plannedWeekly: 4,
  },
  {
    key: "long_video",
    name: "Vídeos Longos",
    description: "YouTube e Aulas — conteúdo profundo com ensino e autoridade.",
    plannedWeekly: 1,
  },
  {
    key: "live",
    name: "Lives",
    description:
      "YouTube, Instagram e TikTok — conteúdo ao vivo com interação.",
    plannedWeekly: 1,
  },
  {
    key: "carousel",
    name: "Carrosséis",
    description:
      "Sequência de slides estratégicos para consciência e salvamento.",
    plannedWeekly: 2,
  },
  {
    key: "static_post",
    name: "Posts Estáticos",
    description: "Peças de síntese visual, posicionamento e direção rápida.",
    plannedWeekly: 2,
  },
  {
    key: "stories_sequence",
    name: "Sequências de Stories",
    description:
      "Narrativa fracionada em blocos (Manhã, Almoço, Tarde e Noite + Q&A).",
    plannedWeekly: 21,
  },
] as const;

export default function ProjectWorkspacePage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = params?.projectId || "proj-produto-x";

  const {
    projects,
    tasks,
    activityEvents,
    duplicateProject,
    toggleArchiveProject,
    addManualTask,
    toggleTaskCompleted,
  } = useEditorialWorkspace();

  const project = useMemo(() => {
    return (
      projects.find((p) => p.id === projectId) ??
      projects[0] ?? {
        id: projectId,
        name: "Produto X — Lançamento Semente",
        brandOrClientName: "Roberto Zane",
        niche: "Finanças",
        subniche: "Algorithmic Trading",
        operationTypeLabel: "Lançamento",
        currentObjectiveLabel: "Conversão",
        currentPhaseLabel: "Aquecimento — Semana 2 de 4",
        status: "active" as ProjectStatus,
        hasActiveLineEditorial: true,
        lineEditorialStatus: "Ativa — Linha v1 aprovada",
        hasActiveCalendar: true,
        calendarStatus: "Ativo — 09/08 a 05/09 (28 slots)",
        themesCount: 124,
        allocatedThemesCount: 18,
        approvedScriptsCount: 18,
        draftScriptsCount: 7,
        nextActionLabel: "Criar 3 roteiros prioritários da Semana 2",
        nextActionReason:
          "Três slots prioritários possuem tema definido, mas ainda não possuem roteiro aprovado.",
        updatedAtLabel: "Atualizado há 2 horas",
      }
    );
  }, [projects, projectId]);

  /* Controle da Aba Ativa (Seção 5.8: Dashboard é a porta de entrada padrão) */
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>("dashboard");

  useEffect(() => {
    const tabParam = searchParams?.get("aba") as WorkspaceTabKey | null;
    if (
      tabParam &&
      [
        "dashboard",
        "linha-editorial",
        "calendario",
        "temas",
        "roteiros",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: WorkspaceTabKey) => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("aba", tab);
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* Ignora em SSR */
    }
  };

  /* Menus do Cabeçalho do Workspace (Seção 5.7) */
  const [isHeaderCreateOpen, setIsHeaderCreateOpen] = useState<boolean>(false);
  const [isHeaderMoreOpen, setIsHeaderMoreOpen] = useState<boolean>(false);
  const [dependencyNoticeModal, setDependencyNoticeModal] = useState<{
    readonly title: string;
    readonly description: string;
    readonly targetTab: WorkspaceTabKey;
    readonly ctaLabel: string;
  } | null>(null);

  const headerCreateRef = useRef<HTMLDivElement>(null);
  const headerMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        headerCreateRef.current &&
        !headerCreateRef.current.contains(e.target as Node)
      ) {
        setIsHeaderCreateOpen(false);
      }
      if (
        headerMoreRef.current &&
        !headerMoreRef.current.contains(e.target as Node)
      ) {
        setIsHeaderMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* Dados Operacionais da Aba 4: Temas e Ideias Estratégicas (Seção 6.4) */
  const [themesSubTab, setThemesSubTab] = useState<ThemesSubTabKey>("gerar");
  const [themesList] = useState<readonly ThemeLibraryItem[]>([
    {
      id: "thm-01",
      title: "O erro invisível que bloqueia sua previsibilidade comercial",
      origin: "ROMA & Avatar",
      pillar: "Diagnóstico de Erros Invisíveis do ICP",
      retinaType: "Transformação",
      painOrObjection: "Dor: imprevisibilidade de receita mensal",
      awarenessLevel: "Consciente do Problema",
      suggestedFormat: "Vídeos Curtos",
      priority: true,
      allocatedSlotLabel: "Hoje, 16h00 • Reel",
    },
    {
      id: "thm-02",
      title: "5 sinais de uma oferta fraca que afasta compradores qualificados",
      origin: "Objetivo e Momento",
      pillar: "Mecanismo Único da Oferta (MUV)",
      retinaType: "Níveis de Consciência",
      painOrObjection: "Objeção: será que funciona para o meu modelo?",
      awarenessLevel: "Consciente da Solução",
      suggestedFormat: "Carrosséis",
      priority: true,
      allocatedSlotLabel: "Amanhã, 11h00 • Carrossel",
    },
    {
      id: "thm-03",
      title: "Como validar sua oferta no orgânico sem depender de sorte",
      origin: "Dados de Mercado",
      pillar: "Aplicação Prática & Bastidores Reais",
      retinaType: "Autoridade",
      painOrObjection: "Mito: preciso de milhares de seguidores para vender",
      awarenessLevel: "Consciente do Produto",
      suggestedFormat: "Lives",
      priority: true,
      allocatedSlotLabel: "Sexta, 20h00 • Live Semanal",
    },
    {
      id: "thm-04",
      title: "Por que repetir comandos soltos na IA destrói a voz da sua marca",
      origin: "ROMA & Avatar",
      pillar: "Visão de Mundo & Quebra de Mitos",
      retinaType: "Transformação",
      painOrObjection: "Objeção: IA deixa meu conteúdo artificial",
      awarenessLevel: "Consciente do Problema",
      suggestedFormat: "Vídeos Curtos",
      priority: true,
      allocatedSlotLabel: null,
    },
    {
      id: "thm-05",
      title: "Bastidor Real: Como organizo 4 semanas editoriais em 45 minutos",
      origin: "Dados de Mercado",
      pillar: "Superação de Objeções Prioritárias",
      retinaType: "Relacionamento",
      painOrObjection: "Objeção: não tenho tempo para produzir conteúdo",
      awarenessLevel: "Consciente da Solução",
      suggestedFormat: "Sequências de Stories",
      priority: false,
      allocatedSlotLabel: null,
    },
  ]);

  /* Slots abertos para integração no Dashboard (Seção 6.4.5) */
  const [openCalendarSlots] = useState<
    readonly OpenCalendarSlotIntegrationItem[]
  >([
    {
      id: "open-slot-1",
      slotLabel: "Quinta-feira, 16h00",
      format: "Vídeos Curtos (Reel)",
      retinaRequired: "Transformação",
      assignedThemeTitle: null,
    },
    {
      id: "open-slot-2",
      slotLabel: "Sábado, 11h00",
      format: "Carrossel",
      retinaRequired: "Níveis de Consciência",
      assignedThemeTitle: null,
    },
    {
      id: "open-slot-3",
      slotLabel: "Domingo, 09h00",
      format: "Sequência de Stories",
      retinaRequired: "Relacionamento",
      assignedThemeTitle: null,
    },
    {
      id: "open-slot-4",
      slotLabel: "Segunda-feira, 18h00",
      format: "Post Estático",
      retinaRequired: "Autoridade",
      assignedThemeTitle: null,
    },
  ]);

  /* Dados Operacionais da Aba 5: Roteiros & Ativos por Formato (Seção 6.5) */
  const [isNewScriptModalOpen, setIsNewScriptModalOpen] =
    useState<boolean>(false);
  const [newScriptOrigin, setNewScriptOrigin] = useState<
    "calendar_slot" | "theme_library"
  >("calendar_slot");
  const [newScriptFormat, setNewScriptFormat] =
    useState<ScriptFormatKey>("short_video");
  const [newScriptMode, setNewScriptMode] = useState<
    "Modo Conexão" | "Modo Técnico/Segurança"
  >("Modo Conexão");
  const [newScriptTitle, setNewScriptTitle] = useState<string>("");

  const [scriptsList, setScriptsList] = useState<readonly ScriptItemModel[]>([
    {
      id: "scr-01",
      title: "O erro invisível que bloqueia sua previsibilidade comercial",
      formatKey: "short_video",
      formatLabel: "Vídeos Curtos",
      status: "approved",
      retinaType: "Transformação",
      pillar: "Diagnóstico de Erros Invisíveis",
      linkedSlotLabel: "Hoje, 16h00 • Slot #04",
      mode: "Modo Conexão",
      updatedAt: "Hoje, 09:42",
    },
    {
      id: "scr-02",
      title: "Por que repetir prompts soltos faz sua marca soar genérica",
      formatKey: "short_video",
      formatLabel: "Vídeos Curtos",
      status: "draft",
      retinaType: "Transformação",
      pillar: "Visão de Mundo",
      linkedSlotLabel: "Quinta, 16h00 • Slot #08",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Ontem, 18:20",
    },
    {
      id: "scr-03",
      title: "O mito do conteúdo diário sem arquitetura de conversão",
      formatKey: "short_video",
      formatLabel: "Vídeos Curtos",
      status: "draft",
      retinaType: "Níveis de Consciência",
      pillar: "Quebra de Mitos",
      linkedSlotLabel: "Sábado, 14h00 • Slot #11",
      mode: "Modo Conexão",
      updatedAt: "Há 2 dias",
    },
    {
      id: "scr-04",
      title: "Arquitetura Completa de Operação Editorial Orientada por Contexto",
      formatKey: "long_video",
      formatLabel: "Vídeos Longos",
      status: "approved",
      retinaType: "Autoridade",
      pillar: "Mecanismo Único da Oferta (MUV)",
      linkedSlotLabel: "Quarta, 19h00 • YouTube",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Há 2 dias",
    },
    {
      id: "scr-05",
      title: "Bastidores da Estruturação Estratégica para Ofertas High-Ticket",
      formatKey: "long_video",
      formatLabel: "Vídeos Longos",
      status: "draft",
      retinaType: "Autoridade",
      pillar: "Aplicação Prática",
      linkedSlotLabel: "Próxima Semana • YouTube",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Há 3 dias",
    },
    {
      id: "scr-06",
      title: "Live Semanal: Como validar sua oferta no orgânico sem improviso",
      formatKey: "live",
      formatLabel: "Lives",
      status: "approved",
      retinaType: "Autoridade",
      pillar: "Superação de Objeções",
      linkedSlotLabel: "Sexta, 20h00 • Live #04",
      mode: "Modo Conexão",
      updatedAt: "Ontem",
    },
    {
      id: "scr-07",
      title: "Live de Aquecimento: Diagnóstico de Posicionamento ao Vivo",
      formatKey: "live",
      formatLabel: "Lives",
      status: "draft",
      retinaType: "Interação",
      pillar: "Provas & Estudos de Caso",
      linkedSlotLabel: "Próxima Sexta, 20h00",
      mode: "Modo Conexão",
      updatedAt: "Há 4 dias",
    },
    {
      id: "scr-08",
      title: "5 sinais de uma oferta fraca que afasta compradores qualificados",
      formatKey: "carousel",
      formatLabel: "Carrosséis",
      status: "approved",
      retinaType: "Níveis de Consciência",
      pillar: "Mecanismo Único da Oferta",
      linkedSlotLabel: "Amanhã, 11h00 • Carrossel",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Hoje, 08:15",
    },
    {
      id: "scr-09",
      title: "Por que produzir mais sem Linha Editorial destrói sua conversão",
      formatKey: "carousel",
      formatLabel: "Carrosséis",
      status: "in_production",
      retinaType: "Níveis de Consciência",
      pillar: "Visão de Mundo",
      linkedSlotLabel: "Hoje, 11h00 • Carrossel",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Hoje, 07:50",
    },
    {
      id: "scr-10",
      title: "Mapa de Decisão: Como separar ofertas em Projetos Editoriais",
      formatKey: "static_post",
      formatLabel: "Posts Estáticos",
      status: "approved",
      retinaType: "Autoridade",
      pillar: "Aplicação Prática",
      linkedSlotLabel: "Hoje, 18h30 • Post Estático",
      mode: "Modo Técnico/Segurança",
      updatedAt: "Ontem",
    },
    {
      id: "scr-11",
      title: "Sequência da Manhã: O erro invisível que trava sua previsibilidade",
      formatKey: "stories_sequence",
      formatLabel: "Sequências de Stories",
      status: "approved",
      retinaType: "Relacionamento",
      pillar: "Bastidores Reais",
      linkedSlotLabel: "Hoje, 08h00 • Bloco Manhã",
      mode: "Modo Conexão",
      updatedAt: "Hoje, 07:30",
    },
  ]);

  /* Detalhamento expansível de Stories na Tabela da Semana (Seção 5.9.2 - Bloco 4) */
  const [showStoriesBreakdown, setShowStoriesBreakdown] =
    useState<boolean>(false);

  /* Tarefas vinculadas especificamente a este Projeto Editorial (Seção 5.9.2 - Bloco 7) */
  const [projectTaskFilter, setProjectTaskFilter] = useState<
    "all" | "pending" | "completed"
  >("pending");
  const [newProjectTaskTitle, setNewProjectTaskTitle] = useState<string>("");

  const projectTasks = useMemo(() => {
    const list = tasks.filter((t) => t.projectId === project.id);
    if (projectTaskFilter === "pending") return list.filter((t) => !t.completed);
    if (projectTaskFilter === "completed")
      return list.filter((t) => t.completed);
    return list;
  }, [tasks, project.id, projectTaskFilter]);

  const projectActivities = useMemo(() => {
    const matching = activityEvents.filter(
      (ev) => ev.projectName === project.name
    );
    return matching.length > 0 ? matching : activityEvents.slice(0, 4);
  }, [activityEvents, project.name]);

  const hasActiveLine = project.hasActiveLineEditorial;
  const hasActiveCalendar = project.hasActiveCalendar;
  const activeLineVersionLabel = `Linha v1 — ${
    project.name.split("—")[1]?.trim() || "Principal"
  }`;

  /* Handler do menu "+ Criar" do Cabeçalho com orientação de dependências (Seções 5.7 e 5.10) */
  const handleQuickActionFromHeader = (
    actionType:
      | "linha"
      | "calendario"
      | "temas"
      | "roteiro"
      | "tarefa"
      | "material"
  ) => {
    setIsHeaderCreateOpen(false);

    if (actionType === "linha") {
      handleSelectTab("linha-editorial");
      return;
    }

    if (actionType === "calendario") {
      if (!hasActiveLine) {
        setDependencyNoticeModal({
          title: "Este projeto ainda não possui uma Linha Editorial ativa",
          description:
            "Crie e aprove a Linha Editorial antes de criar o Calendário Editorial. Assim a IA terá contexto completo de promessa, ICP, pilares e distribuição RETINA.",
          targetTab: "linha-editorial",
          ctaLabel: "Ir para Linha Editorial",
        });
        return;
      }
      handleSelectTab("calendario");
      return;
    }

    if (actionType === "temas") {
      if (!hasActiveLine) {
        setDependencyNoticeModal({
          title: "Defina sua Linha Editorial antes de gerar temas",
          description:
            "O motor de temas utiliza os pilares, dores, desejos, objeções e distribuição RETINA aprovados na Linha Editorial para evitar pautas genéricas.",
          targetTab: "linha-editorial",
          ctaLabel: "Ir para Linha Editorial",
        });
        return;
      }
      handleSelectTab("temas");
      setThemesSubTab("gerar");
      return;
    }

    if (actionType === "roteiro") {
      handleSelectTab("roteiros");
      setIsNewScriptModalOpen(true);
      return;
    }

    if (actionType === "material") {
      handleSelectTab("roteiros");
      setIsNewScriptModalOpen(true);
      setNewScriptTitle("Material Complementar — Checklist Prático da Oferta");
      return;
    }

    if (actionType === "tarefa") {
      handleSelectTab("dashboard");
    }
  };

  /* Criar Novo Roteiro contextualizado (Seção 6.5.1) */
  const handleCreateScript = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formatMeta =
      SCRIPT_FORMAT_DEFINITIONS.find((f) => f.key === newScriptFormat) ??
      SCRIPT_FORMAT_DEFINITIONS[0];

    const created: ScriptItemModel = {
      id: `scr-${Date.now()}`,
      title:
        newScriptTitle.trim() ||
        `Novo roteiro de ${formatMeta.name} — ${project.currentPhaseLabel}`,
      formatKey: formatMeta.key,
      formatLabel: formatMeta.name,
      status: "draft",
      retinaType: "Transformação",
      pillar: "Mecanismo Único da Oferta (MUV)",
      linkedSlotLabel:
        newScriptOrigin === "calendar_slot"
          ? "Slot do Calendário Ativo"
          : "Tema da Biblioteca Estratégica",
      mode: newScriptMode,
      updatedAt: "Criado agora",
    };

    setScriptsList((prev) => [created, ...prev]);
    setNewScriptTitle("");
    setIsNewScriptModalOpen(false);
  };

  const handleAddProjectTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectTaskTitle.trim()) return;
    addManualTask(newProjectTaskTitle, project.id);
    setNewProjectTaskTitle("");
  };

  const statusBadge = STATUS_BADGE_STYLES[project.status];

  const unassignedOpenSlotsCount = useMemo(
    () => openCalendarSlots.filter((s) => !s.assignedThemeTitle).length,
    [openCalendarSlots]
  );

  /* Props tipadas corretamente para LinhaEditorialModule e CalendarioEditorialModule */
  const linhaModuleProps: ComponentProps<typeof LinhaEditorialModule> = {
    projectId: project.id,
    projectName: project.name,
    projectNiche: project.niche,
    projectSubniche: project.subniche,
    projectObjective: project.currentObjectiveLabel,
    currentPhase: project.currentPhaseLabel,
    onGoToCalendarTab: () => handleSelectTab("calendario"),
  };

  const calendarioModuleProps = {
    projectId: project.id,
    projectName: project.name,
    niche: project.niche,
    subniche: project.subniche,
    currentObjective: project.currentObjectiveLabel,
    currentPhase: project.currentPhaseLabel,
    hasActiveLine,
    activeLineName: activeLineVersionLabel,
    onRequestGoToLineEditorial: () => handleSelectTab("linha-editorial"),
    onRequestGoToThemes: () => {
      handleSelectTab("temas");
      setThemesSubTab("integracao");
    },
    onRequestGoToScripts: (_slotId?: string, themeTitle?: string) => {
      if (themeTitle) {
        setNewScriptTitle(themeTitle);
        setNewScriptOrigin("calendar_slot");
      }
      handleSelectTab("roteiros");
      setIsNewScriptModalOpen(true);
    },
  } as unknown as ComponentProps<typeof CalendarioEditorialModule>;

  return (
    <div className="flex flex-col gap-6">
      {/* =====================================================================
          CABEÇALHO ESTRATÉGICO PERSISTENTE DO WORKSPACE (SEÇÕES 5.1 A 5.8)
         ===================================================================== */}
      <section className="rounded-la-xl border border-white/12 bg-[#080B12]/95 p-5 shadow-[var(--la-elevation-2)] sm:p-6">
        {/* CAMADA 1 — Retorno à Central Estratégica (Seção 5.3) */}
        <div className="flex items-center justify-between gap-2 border-b border-white/8 pb-3.5">
          <Link
            href="/dashboard/editorial"
            title="Voltar para Central Estratégica"
            className="inline-flex items-center gap-2 rounded-la-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold/60 hover:text-la-gold-light"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
            <span>Voltar para Projetos</span>
          </Link>

          <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
            {project.updatedAtLabel}
          </span>
        </div>

        {/* CAMADA 2 — Identidade Estratégica do Projeto + Ações "+ Criar" e "⋯" (Seções 5.4 a 5.7) */}
        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-la-gold">
                WORKSPACE
              </span>
              <span
                className={clsx(
                  "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em]",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            </div>

            <h1 className="line-clamp-2 font-la-sans text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.025em] text-la-text-primary sm:text-[2rem]">
              {project.name}
            </h1>

            {/* Mini-resumo estratégico (Seção 5.5) */}
            <div className="mt-1 flex flex-wrap items-center gap-2 font-la-sans text-[0.875rem] text-la-text-secondary">
              <span className="font-medium text-la-text-primary">
                {project.niche} / {project.subniche}
              </span>
              <span aria-hidden="true" className="text-white/25">
                •
              </span>
              <span>
                Objetivo atual:{" "}
                <strong className="font-semibold text-la-gold-light">
                  {project.currentObjectiveLabel}
                </strong>
              </span>
              <span aria-hidden="true" className="text-white/25">
                •
              </span>
              <span>
                Fase:{" "}
                <strong className="font-medium text-la-text-primary">
                  {project.currentPhaseLabel}
                </strong>
              </span>
            </div>
          </div>

          {/* Ações no Cabeçalho: [ + Criar ] e [ ⋯ ] (Seção 5.7) */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div ref={headerCreateRef} className="relative">
              <button
                type="button"
                onClick={() => setIsHeaderCreateOpen((prev) => !prev)}
                aria-expanded={isHeaderCreateOpen}
                className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
              >
                <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
                <span>Criar</span>
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
              </button>

              <AnimatePresence>
                {isHeaderCreateOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.92)] backdrop-blur-2xl"
                  >
                    <div className="border-b border-white/10 px-3 py-2 font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Criar neste Projeto Editorial
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {[
                        {
                          id: "linha" as const,
                          label: "Nova Linha Editorial",
                        },
                        {
                          id: "calendario" as const,
                          label: "Novo Calendário",
                        },
                        { id: "temas" as const, label: "Gerar Temas" },
                        { id: "roteiro" as const, label: "Novo Roteiro" },
                        { id: "tarefa" as const, label: "Nova Tarefa" },
                        {
                          id: "material" as const,
                          label: "Novo Material Complementar",
                          conditional: true,
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleQuickActionFromHeader(item.id)}
                          className="flex w-full items-center justify-between rounded-la-md px-3 py-2 text-left font-la-sans text-[0.8125rem] text-la-text-secondary transition-colors hover:bg-white/[0.06] hover:text-la-text-primary"
                        >
                          <span>• {item.label}</span>
                          {item.conditional ? (
                            <span className="rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-1.5 py-0.5 font-la-mono text-[0.5rem] text-la-gold-light">
                              Qualificado
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Menu de Três Pontos "⋯" do Projeto (Seção 5.7) */}
            <div ref={headerMoreRef} className="relative">
              <button
                type="button"
                onClick={() => setIsHeaderMoreOpen((prev) => !prev)}
                aria-label="Opções do Projeto Editorial"
                className="inline-flex h-10 w-10 items-center justify-center rounded-la-md border border-white/12 bg-white/[0.03] text-la-text-secondary transition-colors hover:border-la-border-gold/60 hover:text-la-gold-light"
              >
                <MoreVertical aria-hidden="true" className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isHeaderMoreOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-la-xl border border-white/15 bg-[#090C14]/98 p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.92)] backdrop-blur-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsHeaderMoreOpen(false);
                        router.push("/dashboard/editorial");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-la-md px-3 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-la-gold" />
                      <span>Editar informações do projeto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsHeaderMoreOpen(false);
                        duplicateProject({
                          sourceProjectId: project.id,
                          newName: `${project.name} (Cópia)`,
                          copyStrategicBase: true,
                          copyLineEditorial: true,
                          copyThemes: true,
                          copyCalendars: false,
                          copyScripts: false,
                        });
                        router.push("/dashboard/editorial");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-la-md px-3 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                    >
                      <Copy className="h-3.5 w-3.5 text-la-gold" />
                      <span>Duplicar projeto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsHeaderMoreOpen(false);
                        handleSelectTab("dashboard");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-la-md px-3 py-2 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                    >
                      <Clock className="h-3.5 w-3.5 text-la-gold" />
                      <span>Ver atividade do projeto</span>
                    </button>

                    <div className="my-1 h-px bg-white/10" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsHeaderMoreOpen(false);
                        toggleArchiveProject(project.id);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-la-md px-3 py-2 text-left font-la-sans text-[0.75rem] text-amber-200 hover:bg-amber-500/10"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>
                        {project.status === "archived"
                          ? "Restaurar projeto"
                          : "Arquivar projeto"}
                      </span>
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CAMADA 3 — Barra Superior por Função na Ordem Metodológica Obrigatória (Seções 5.8 e 5.16) */}
        <nav
          aria-label="Funções Metodológicas do Projeto Editorial"
          className="mt-5 flex items-center gap-1.5 overflow-x-auto rounded-la-lg border border-white/10 bg-black/55 p-1.5"
        >
          {WORKSPACE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectTab(tab.key)}
                aria-current={isSelected ? "page" : undefined}
                className={clsx(
                  "relative flex min-h-[2.625rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-la-md px-4 py-2 font-la-sans text-[0.875rem] transition-all duration-180",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                  isSelected
                    ? "bg-la-gold font-semibold text-la-text-inverse shadow-[0_0_20px_rgba(207,169,101,0.32)]"
                    : "font-medium text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={clsx(
                    "h-4 w-4 shrink-0",
                    isSelected ? "text-la-text-inverse" : "text-la-gold"
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* =====================================================================
          ABA 1: DASHBOARD DO PROJETO — CENTRO DE COMANDO EDITORIAL (SEÇÃO 5.9)
         ===================================================================== */}
      {activeTab === "dashboard" ? (
        <div className="flex flex-col gap-6">
          {/* BLOCO 2 — PRÓXIMA AÇÃO IMPERIAL (Seção 5.9.2: Acima da dobra) */}
          <section
            style={{
              boxShadow:
                "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 24px 52px rgba(0, 0, 0, 0.78), 0 0 56px rgba(207, 169, 101, 0.12)",
            }}
            className="relative overflow-hidden rounded-la-xl border border-la-gold/70 bg-[#0B0F1A]/95 p-6 sm:p-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-la-full bg-la-gold px-3 py-0.5 font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-text-inverse">
                <Flame aria-hidden="true" className="h-3 w-3" />
                <span>PRÓXIMA AÇÃO IMPERIAL</span>
              </span>

              <span className="font-la-mono text-[0.6875rem] text-la-gold-light">
                Prioridade #01 do Projeto • {project.currentPhaseLabel}
              </span>
            </div>

            {!hasActiveLine ? (
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-[42rem]">
                  <h2 className="font-la-sans text-[1.375rem] font-semibold text-la-text-primary sm:text-[1.5rem]">
                    Construa sua Linha Editorial para dar contexto à IA.
                  </h2>
                  <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    A IA precisa entender sua oferta, ICP, promessa, tom de voz
                    e objetivo em{" "}
                    <strong className="text-la-text-primary">
                      {project.niche}
                    </strong>{" "}
                    para gerar um calendário, temas e roteiros coerentes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab("linha-editorial")}
                  className="inline-flex min-h-[2.875rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <span>Começar Linha Editorial</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : !hasActiveCalendar ? (
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-[42rem]">
                  <h2 className="font-la-sans text-[1.375rem] font-semibold text-la-text-primary sm:text-[1.5rem]">
                    Transforme a Linha Editorial em um calendário executável.
                  </h2>
                  <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    Sua estratégia está aprovada. Agora crie um Calendário
                    Editorial para organizar formatos, frequência e prioridades
                    dentro da sua capacidade real de produção.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab("calendario")}
                  className="inline-flex min-h-[2.875rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <span>Criar Calendário</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-[44rem]">
                  <h2 className="font-la-sans text-[1.375rem] font-semibold text-la-text-primary sm:text-[1.5rem]">
                    {project.nextActionLabel}
                  </h2>
                  <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    {project.nextActionReason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab("roteiros")}
                  className="inline-flex min-h-[2.875rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <span>Criar roteiros agora</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* BLOCO 3 — RESUMO DAS 4 FUNÇÕES DO MÉTODO (Seção 5.9.2: 4 Cards Clicáveis) */}
          <section aria-label="Resumo das Funções do Método">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Card 1: Linha Editorial */}
              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 transition-colors hover:border-la-border-gold/55">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      LINHA EDITORIAL
                    </span>
                    <Compass className="h-4 w-4 text-la-gold" />
                  </div>
                  <p className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {hasActiveLine ? activeLineVersionLabel : "Em estruturação"}
                  </p>
                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {hasActiveLine
                      ? "6 pilares • RETINA configurada"
                      : "Base estratégica pendente"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab("linha-editorial")}
                  className="mt-4 inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                >
                  <span>[ Abrir Linha ]</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Card 2: Calendário */}
              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 transition-colors hover:border-la-border-gold/55">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      CALENDÁRIO
                    </span>
                    <Calendar className="h-4 w-4 text-la-gold" />
                  </div>
                  <p className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {hasActiveCalendar
                      ? "Ativo — 09/08 a 05/09"
                      : "Pendente — criar agenda"}
                  </p>
                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {hasActiveCalendar
                      ? `28 slots • ${unassignedOpenSlotsCount} sem tema • 2 revisões`
                      : "Aguardando ativação do período"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab("calendario")}
                  className="mt-4 inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                >
                  <span>[ Abrir Calendário ]</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Card 3: Temas */}
              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 transition-colors hover:border-la-border-gold/55">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      TEMAS
                    </span>
                    <Lightbulb className="h-4 w-4 text-la-gold" />
                  </div>
                  <p className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {themesList.length} ideias estratégicas
                  </p>
                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {
                      themesList.filter((t) => Boolean(t.allocatedSlotLabel))
                        .length
                    }{" "}
                    alocadas •{" "}
                    {themesList.filter((t) => t.priority).length} prioritárias
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab("temas")}
                  className="mt-4 inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                >
                  <span>[ Abrir Temas ]</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Card 4: Roteiros */}
              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 transition-colors hover:border-la-border-gold/55">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      ROTEIROS
                    </span>
                    <FileText className="h-4 w-4 text-la-gold" />
                  </div>
                  <p className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {scriptsList.filter((s) => s.status === "approved").length}{" "}
                    prontos ·{" "}
                    {scriptsList.filter((s) => s.status === "draft").length}{" "}
                    rascunhos
                  </p>
                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {
                      scriptsList.filter((s) => s.status === "in_production")
                        .length
                    }{" "}
                    em produção ativa
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab("roteiros")}
                  className="mt-4 inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                >
                  <span>[ Abrir Roteiros ]</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </section>

          {/* GRADE PRINCIPAL DO DASHBOARD DO PROJETO */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-7">
              {/* BLOCO 4 — PLANO DE EXECUÇÃO — ESTA SEMANA */}
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                      Plano de Execução — Esta Semana
                    </h2>
                    <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                      Resumo operacional derivado do Calendário Editorial ativo
                      e do status dos roteiros.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("calendario")}
                    className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                  >
                    Abrir calendário completo →
                  </button>
                </div>

                {!hasActiveCalendar ? (
                  <div className="mt-4 rounded-la-lg border border-white/8 bg-black/45 p-6 text-center">
                    <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                      Ainda não existe um calendário ativo para este projeto.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("calendario")}
                      className="mt-3 inline-flex items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                    >
                      <span>Criar Calendário Editorial</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left font-la-sans text-[0.8125rem]">
                      <thead>
                        <tr className="border-b border-white/10 font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-muted">
                          <th className="pb-2.5">Formato</th>
                          <th className="pb-2.5 text-center">Planejado</th>
                          <th className="pb-2.5 text-center">Roteiro pronto</th>
                          <th className="pb-2.5 text-center">Em produção</th>
                          <th className="pb-2.5 text-center">Publicado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {[
                          {
                            format: "Vídeos curtos",
                            planned: 4,
                            ready: 3,
                            prod: 1,
                            pub: 0,
                          },
                          {
                            format: "Carrosséis",
                            planned: 2,
                            ready: 2,
                            prod: 0,
                            pub: 0,
                          },
                          {
                            format: "Posts estáticos",
                            planned: 2,
                            ready: 1,
                            prod: 1,
                            pub: 0,
                          },
                          {
                            format: "Vídeos longos",
                            planned: 1,
                            ready: 1,
                            prod: 0,
                            pub: 0,
                          },
                          {
                            format: "Lives",
                            planned: 1,
                            ready: 1,
                            prod: 0,
                            pub: 0,
                          },
                        ].map((row) => (
                          <tr key={row.format}>
                            <td className="py-2.5 font-medium text-la-text-primary">
                              {row.format}
                            </td>
                            <td className="py-2.5 text-center font-la-mono text-la-text-secondary">
                              {row.planned}
                            </td>
                            <td className="py-2.5 text-center font-la-mono text-la-gold-light">
                              {row.ready}
                            </td>
                            <td className="py-2.5 text-center font-la-mono text-sky-300">
                              {row.prod}
                            </td>
                            <td className="py-2.5 text-center font-la-mono text-emerald-300">
                              {row.pub}
                            </td>
                          </tr>
                        ))}

                        <tr>
                          <td className="py-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setShowStoriesBreakdown((prev) => !prev)
                              }
                              className="inline-flex items-center gap-1.5 font-semibold text-la-gold-light hover:underline"
                            >
                              <span>Sequências de stories</span>
                              <ChevronDown
                                className={clsx(
                                  "h-3.5 w-3.5 transition-transform",
                                  showStoriesBreakdown && "rotate-180"
                                )}
                              />
                            </button>
                          </td>
                          <td className="py-2.5 text-center font-la-mono text-la-text-secondary">
                            21
                          </td>
                          <td className="py-2.5 text-center font-la-mono text-la-gold-light">
                            14
                          </td>
                          <td className="py-2.5 text-center font-la-mono text-sky-300">
                            0
                          </td>
                          <td className="py-2.5 text-center font-la-mono text-emerald-300">
                            7
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {showStoriesBreakdown ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-la-lg border border-la-border-gold/40 bg-black/50 p-3 font-la-mono text-[0.6875rem] sm:grid-cols-4">
                        <div className="rounded-la-xs border border-white/8 bg-white/[0.02] p-2 text-center">
                          <span className="block text-[0.5625rem] text-la-text-muted">
                            MANHÃ
                          </span>
                          <span className="text-la-gold-light">
                            6 sequências
                          </span>
                        </div>
                        <div className="rounded-la-xs border border-white/8 bg-white/[0.02] p-2 text-center">
                          <span className="block text-[0.5625rem] text-la-text-muted">
                            ALMOÇO
                          </span>
                          <span className="text-la-gold-light">
                            5 sequências
                          </span>
                        </div>
                        <div className="rounded-la-xs border border-white/8 bg-white/[0.02] p-2 text-center">
                          <span className="block text-[0.5625rem] text-la-text-muted">
                            TARDE
                          </span>
                          <span className="text-la-gold-light">
                            5 sequências
                          </span>
                        </div>
                        <div className="rounded-la-xs border border-white/8 bg-white/[0.02] p-2 text-center">
                          <span className="block text-[0.5625rem] text-la-text-muted">
                            NOITE / Q&A
                          </span>
                          <span className="text-la-gold-light">
                            5 sequências
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </section>

              {/* BLOCO 5 — CONTEÚDOS PRIORITÁRIOS DO PROJETO */}
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6">
                <div className="border-b border-white/10 pb-3.5">
                  <h2 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                    Conteúdos Prioritários
                  </h2>
                  <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Itens específicos deste projeto que você deve produzir,
                    revisar ou publicar.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {[
                    {
                      deadline: "Hoje, 11h",
                      format: "Stories",
                      title: "Sequência da Manhã: “O erro invisível…”",
                      retina: "Relacionamento",
                      status: "Pendente",
                      actionLabel: "Gerar sequência",
                    },
                    {
                      deadline: "Hoje, 16h",
                      format: "Reel",
                      title: "“Por que sua estratégia não gera leads”",
                      retina: "Transformação",
                      status: "Roteiro pronto",
                      actionLabel: "Abrir roteiro",
                    },
                    {
                      deadline: "Amanhã",
                      format: "Carrossel",
                      title: "“5 sinais de uma oferta fraca”",
                      retina: "Níveis de Consciência",
                      status: "Em rascunho",
                      actionLabel: "Continuar roteiro",
                    },
                    {
                      deadline: "Sexta, 20h",
                      format: "Live",
                      title: "“Como validar sua oferta no orgânico”",
                      retina: "Autoridade",
                      status: "Falta thumbnail",
                      actionLabel: "Criar títulos e capa",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex flex-col justify-between gap-3 rounded-la-lg border border-white/10 bg-white/[0.02] p-3.5 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.625rem]">
                          <span className="font-semibold text-la-gold-light">
                            {item.deadline}
                          </span>
                          <span className="rounded-la-xs border border-white/12 bg-black/55 px-2 py-0.5 text-la-text-primary">
                            {item.format}
                          </span>
                          <span className="text-la-text-secondary">
                            RETINA: {item.retina}
                          </span>
                          <span>•</span>
                          <span className="text-la-text-muted">
                            {item.status}
                          </span>
                        </div>
                        <p className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                          {item.title}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectTab("roteiros")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* COLUNA DIREITA DO DASHBOARD DO PROJETO */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* BLOCO 6 — ATENÇÃO ESTRATÉGICA */}
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h2 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                    Atenção Estratégica
                  </h2>
                </div>

                <div className="mt-3.5 flex flex-col gap-2.5">
                  <div className="rounded-la-lg border border-amber-500/35 bg-amber-950/20 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] font-semibold uppercase text-amber-300">
                      RISCO DE EXECUÇÃO
                    </span>
                    <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      3 conteúdos previstos para amanhã ainda não possuem
                      roteiro.
                    </p>
                    <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                      Crie os roteiros antes de iniciar a produção para não
                      comprometer a execução da semana.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("roteiros")}
                      className="mt-2 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                    >
                      [ Criar Roteiros ] →
                    </button>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] font-semibold uppercase text-la-gold-light">
                      FALHA DE PLANEJAMENTO
                    </span>
                    <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      {unassignedOpenSlotsCount} slots do calendário não possuem
                      tema conectado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTab("temas");
                        setThemesSubTab("integracao");
                      }}
                      className="mt-2 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                    >
                      [ Gerar ou Conectar Temas ] →
                    </button>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] font-semibold uppercase text-la-gold-light">
                      MATERIAL COMPLEMENTAR QUALIFICADO
                    </span>
                    <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      Um conteúdo qualificado ainda não possui material
                      complementar.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("roteiros")}
                      className="mt-2 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                    >
                      [ Abrir recomendação ] →
                    </button>
                  </div>
                </div>
              </section>

              {/* BLOCO 7 — TAREFAS DESTE PROJETO */}
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <h2 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                    Tarefas deste Projeto
                  </h2>

                  <div className="flex items-center gap-1 rounded-la-md border border-white/10 bg-black/45 p-1">
                    {[
                      { id: "pending" as const, label: "Pendentes" },
                      { id: "completed" as const, label: "Concluídas" },
                      { id: "all" as const, label: "Todas" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setProjectTaskFilter(f.id)}
                        className={clsx(
                          "rounded-la-xs px-2 py-0.5 font-la-mono text-[0.625rem]",
                          projectTaskFilter === f.id
                            ? "bg-la-gold font-semibold text-la-text-inverse"
                            : "text-la-text-secondary"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleAddProjectTask}
                  className="mt-3.5 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Adicionar tarefa neste projeto..."
                    value={newProjectTaskTitle}
                    onChange={(e) => setNewProjectTaskTitle(e.target.value)}
                    className="min-h-[2.375rem] flex-1 rounded-la-md border border-white/12 bg-black/55 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary placeholder:text-white/25"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-la-md bg-la-gold text-la-text-inverse"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </form>

                <div className="mt-3.5 flex flex-col gap-2">
                  {projectTasks.slice(0, 5).map((task) => (
                    <label
                      key={task.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-la-lg border border-white/8 bg-black/40 p-3 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompleted(task.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-la-xs border",
                          task.completed
                            ? "border-la-gold bg-la-gold text-la-text-inverse"
                            : "border-white/25 bg-black/50 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={clsx(
                            "font-la-sans text-[0.8125rem]",
                            task.completed
                              ? "line-through text-la-text-muted"
                              : "font-medium text-la-text-primary"
                          )}
                        >
                          {task.title}
                        </span>
                        <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                          Vinculado: {task.resourceLabel || "Item do projeto"} •
                          Prazo: {task.dueLabel}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* BLOCO 8 — ATIVIDADE RECENTE DO PROJETO */}
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Clock className="h-4 w-4 text-la-gold" />
                  <h2 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                    Atividades Recentes
                  </h2>
                </div>

                <div className="mt-3.5 flex flex-col gap-3">
                  {projectActivities.map((ev) => (
                    <div
                      key={ev.id}
                      className="border-l-2 border-la-gold/50 pl-3 text-[0.75rem]"
                    >
                      <span className="font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                        {ev.occurredAt}
                      </span>
                      <p className="mt-0.5 text-la-text-secondary">
                        {ev.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {/* =====================================================================
          ABA 2: LINHA EDITORIAL — FUNÇÃO 01, PARTE 1 (SEÇÃO 6.2)
         ===================================================================== */}
      {activeTab === "linha-editorial" ? (
        <LinhaEditorialModule {...linhaModuleProps} />
      ) : null}

      {/* =====================================================================
          ABA 3: CALENDÁRIO EDITORIAL — FUNÇÃO 01, PARTE 2 (SEÇÃO 6.3)
         ===================================================================== */}
      {activeTab === "calendario" ? (
        <CalendarioEditorialModule {...calendarioModuleProps} />
      ) : null}

      {/* =====================================================================
          ABA 4: TEMAS E IDEIAS ESTRATÉGICAS — FUNÇÃO 02 (SUBÁREAS 1, 2 E 3)
         ===================================================================== */}
      {activeTab === "temas" ? (
        <TemasEditorialModule
          key={`${project.id}-${themesSubTab}`}
          projectId={project.id}
          projectName={project.name}
          projectNiche={project.niche}
          projectSubniche={project.subniche}
          projectObjective={project.currentObjectiveLabel}
          currentPhase={project.currentPhaseLabel}
          hasActiveLine={hasActiveLine}
          hasActiveCalendar={project.hasActiveCalendar}
          initialSubTab={themesSubTab}
          onGoToLineTab={() => handleSelectTab("linha-editorial")}
          onGoToCalendarTab={() => handleSelectTab("calendario")}
          onGoToScriptsTab={(_slotId, themeTitle, formatKey) => {
            if (themeTitle) {
              setNewScriptTitle(themeTitle);
              setNewScriptOrigin(_slotId ? "calendar_slot" : "theme_library");
            }
            if (
              formatKey &&
              SCRIPT_FORMAT_DEFINITIONS.some((f) => f.key === formatKey)
            ) {
              setNewScriptFormat(formatKey as ScriptFormatKey);
            }
            handleSelectTab("roteiros");
            setIsNewScriptModalOpen(true);
          }}
        />
      ) : null}

      {/* =====================================================================
          ABA 5: CRIAÇÃO DE ROTEIROS — FUNÇÃO 03 (SEÇÃO 6.5)
         ===================================================================== */}
      {activeTab === "roteiros" ? (
        <RoteirosEditorialModule
          projectId={project.id}
          projectName={project.name}
          projectNiche={project.niche}
          projectSubniche={project.subniche}
          projectObjective={project.currentObjectiveLabel}
          currentPhase={project.currentPhaseLabel}
          hasActiveLine={hasActiveLine}
          hasActiveCalendar={project.hasActiveCalendar}
          initialPreselectedThemeTitle={newScriptTitle || null}
          onGoToLineTab={() => handleSelectTab("linha-editorial")}
          onGoToCalendarTab={() => handleSelectTab("calendario")}
          onGoToThemesTab={() => handleSelectTab("temas")}
        />
      ) : null}

      {/* =====================================================================
          MODAIS CONTEXTUAIS DO WORKSPACE
         ===================================================================== */}

      {/* MODAL DE ORIENTAÇÃO DE DEPENDÊNCIA (Seção 5.10) */}
      <AnimatePresence>
        {dependencyNoticeModal ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDependencyNoticeModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[32rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                {dependencyNoticeModal.title}
              </h3>
              <p className="mt-2 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                {dependencyNoticeModal.description}
              </p>
              <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setDependencyNoticeModal(null)}
                  className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = dependencyNoticeModal.targetTab;
                    setDependencyNoticeModal(null);
                    handleSelectTab(target);
                  }}
                  className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                >
                  {dependencyNoticeModal.ctaLabel}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* MODAL: NOVO ROTEIRO (Seção 6.5.1) */}
      <AnimatePresence>
        {isNewScriptModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewScriptModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[36rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                Novo Roteiro Contextualizado
              </h3>
              <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                Escolha o ponto de entrada recomendado pelo método (Seção
                6.5.1):
              </p>

              <form
                onSubmit={handleCreateScript}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setNewScriptOrigin("calendar_slot")}
                    className={clsx(
                      "rounded-la-lg border p-3.5 text-left transition-colors",
                      newScriptOrigin === "calendar_slot"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] font-bold uppercase text-la-gold-light">
                      ★ RECOMENDADO
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                      A partir de um slot do Calendário
                    </span>
                    <span className="mt-1 block font-la-sans text-[0.75rem] text-la-text-secondary">
                      Transporta automaticamente formato, tema, RETINA, pilar e
                      objetivo.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewScriptOrigin("theme_library")}
                    className={clsx(
                      "rounded-la-lg border p-3.5 text-left transition-colors",
                      newScriptOrigin === "theme_library"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                      OPÇÃO 02
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                      A partir de um Tema da Biblioteca
                    </span>
                    <span className="mt-1 block font-la-sans text-[0.75rem] text-la-text-secondary">
                      Transforma uma ideia aprovada do acervo em ativo
                      executável.
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Título ou Tema do Roteiro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: O erro invisível que trava sua previsibilidade"
                    value={newScriptTitle}
                    onChange={(e) => setNewScriptTitle(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SCRIPT_FORMAT_DEFINITIONS.map((fmt) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setNewScriptFormat(fmt.key)}
                      className={clsx(
                        "rounded-la-md border px-3 py-2 text-left font-la-sans text-[0.75rem] font-medium",
                        newScriptFormat === fmt.key
                          ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                          : "border-white/10 bg-black/45 text-la-text-secondary"
                      )}
                    >
                      {fmt.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "Modo Conexão",
                      "Modo Técnico/Segurança",
                    ] as const
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewScriptMode(m)}
                      className={clsx(
                        "rounded-la-md border px-3 py-2 font-la-mono text-[0.6875rem]",
                        newScriptMode === m
                          ? "border-la-gold bg-la-gold text-la-text-inverse font-semibold"
                          : "border-white/10 bg-black/45 text-la-text-secondary"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewScriptModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    Gerar Roteiro com Contexto
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