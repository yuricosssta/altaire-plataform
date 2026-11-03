// FrontEnd/src/app/(main)/dashboard/page.tsx
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  FolderKanban,
  MoreVertical,
  Plus,
  Radar,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  useEditorialWorkspace,
  type TodaySlotStatus,
} from "@/lib/context/EditorialWorkspaceContext";

type StoriesWindowBlock = "morning" | "lunch" | "afternoon" | "night";

const STORIES_WINDOWS: Record<
  StoriesWindowBlock,
  {
    readonly label: string;
    readonly timeRange: string;
    readonly headline: string;
    readonly subtitle: string;
  }
> = {
  morning: {
    label: "Manhã (08h)",
    timeRange: "07h30 – 11h30",
    headline: "Gerar e publicar a sequência de Stories da Manhã",
    subtitle:
      "Abertura narrativa com bastidor estratégico, visão de mundo e enquete de ativação.",
  },
  lunch: {
    label: "Almoço (12h)",
    timeRange: "11h30 – 14h30",
    headline: "Publicar o bloco de Stories do Almoço",
    subtitle:
      "Aprofundamento prático na dor principal do ICP e contraste entre improviso e método.",
  },
  afternoon: {
    label: "Tarde (16h)",
    timeRange: "14h30 – 18h30",
    headline: "Preparar a sequência de Stories da Tarde com prova e aplicação",
    subtitle:
      "Demonstração de bastidor real da operação e transição para o conteúdo do feed.",
  },
  night: {
    label: "Noite / Q&A (20h)",
    timeRange: "18h30 – 22h30",
    headline: "Importar perguntas recebidas para responder a sequência de Q&A",
    subtitle:
      "Quebra de objeções prioritárias com caixinha de perguntas orientada à oferta.",
  },
};

function getCurrentStoriesWindowByHour(): StoriesWindowBlock {
  const hour = new Date().getHours();
  if (hour < 11) return "morning";
  if (hour < 15) return "lunch";
  if (hour < 18) return "afternoon";
  return "night";
}

function getGreetingByHour(firstName: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Bom dia, ${firstName}.`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${firstName}.`;
  return `Boa noite, ${firstName}.`;
}

function getExtendedDatePtBr(): string {
  try {
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return "Domingo, 25 de outubro de 2026";
  }
}

function resolveSlotStatusMeta(status: TodaySlotStatus): {
  readonly statusText: string;
  readonly actionText: string;
  readonly badgeClass: string;
} {
  switch (status) {
    case "theme_pending":
      return {
        statusText: "Tema pendente",
        actionText: "Gerar ou escolher tema",
        badgeClass: "border-amber-400/45 bg-amber-500/15 text-amber-200",
      };
    case "ready_for_script":
      return {
        statusText: "Pronto para roteiro",
        actionText: "Gerar sequência",
        badgeClass:
          "border-la-border-gold/60 bg-la-gold-faint text-la-gold-light",
      };
    case "draft":
      return {
        statusText: "Rascunho",
        actionText: "Continuar roteiro",
        badgeClass: "border-white/20 bg-white/[0.06] text-la-text-primary",
      };
    case "script_ready":
      return {
        statusText: "Pronto para produção",
        actionText: "Abrir roteiro",
        badgeClass: "border-la-gold bg-la-gold/20 text-la-gold-light",
      };
    case "in_production":
      return {
        statusText: "Em produção",
        actionText: "Ver briefing",
        badgeClass: "border-sky-400/45 bg-sky-500/15 text-sky-200",
      };
    case "ready_to_publish":
      return {
        statusText: "Pronto para publicar",
        actionText: "Marcar como publicado",
        badgeClass: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
      };
    case "published":
      return {
        statusText: "Publicado",
        actionText: "Ver item",
        badgeClass: "border-emerald-500/40 bg-emerald-950/50 text-emerald-300",
      };
    case "missing_asset":
      return {
        statusText: "Falta thumbnail e título",
        actionText: "Criar títulos e capa",
        badgeClass: "border-amber-400/45 bg-amber-500/15 text-amber-200",
      };
    case "complementary_pending":
      return {
        statusText: "Ativo complementar pendente",
        actionText: "Criar material",
        badgeClass:
          "border-la-border-gold/60 bg-la-gold-faint text-la-gold-light",
      };
  }
}

/**
 * Dropdown Customizado no Design System Dark-First (--la-*),
 * eliminando o menu cinza/azul nativo do sistema operacional.
 */
function DarkProjectDropdown({
  value,
  options,
  onChange,
}: {
  readonly value: string;
  readonly options: readonly { readonly id: string; readonly label: string }[];
  readonly onChange: (nextId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((o) => o.id === value) ?? options[0] ?? null;

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

  if (!selectedOption) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex min-h-[2.125rem] items-center justify-between gap-2 rounded-la-md border border-white/14 bg-[#0B0F18] px-3 py-1 font-la-mono text-[0.6875rem] text-la-gold-light transition-colors hover:border-la-border-gold"
      >
        <span className="max-w-[14rem] truncate">{selectedOption.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "h-3.5 w-3.5 text-la-gold transition-transform",
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
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-50 mt-1.5 w-64 overflow-hidden rounded-la-lg border border-la-border-gold/55 bg-[#090C14]/98 p-1.5 shadow-[0_20px_44px_rgba(0,0,0,0.92)] backdrop-blur-2xl"
          >
            {options.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] transition-colors",
                    isSelected
                      ? "bg-la-gold-faint font-semibold text-la-gold-light"
                      : "text-la-text-secondary hover:bg-white/[0.05] hover:text-la-text-primary"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? (
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

export default function PainelDoDiaPage() {
  const router = useRouter();
  const {
    userFullName,
    activeOrReviewProjects,
    todaySlots,
    upcoming48hSlots,
    tasks,
    aiSuggestions,
    operationalAlerts,
    activityEvents,
    derivedPanelState,
    updateTodaySlotStatus,
    addManualTask,
    toggleTaskCompleted,
    removeOrPostponeTask,
  } = useEditorialWorkspace();

  const [storiesWindow, setStoriesWindow] = useState<StoriesWindowBlock>(() =>
    getCurrentStoriesWindowByHour()
  );

  const priorityCardRef = useRef<HTMLElement>(null);
  const [prioritySpotlight, setPrioritySpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({ x: 260, y: 120, opacity: 0 });

  /* Filtros do Bloco 2 (Conteúdos de Hoje) */
  const [slotQuickFilter, setSlotQuickFilter] = useState<
    "all" | "my_project" | "scripts" | "stories" | "pending"
  >("all");
  const [selectedProjectIdFilter, setSelectedProjectIdFilter] =
    useState<string>("");
  const [showAllTodaySlots, setShowAllTodaySlots] = useState<boolean>(false);
  const [openSlotMenuId, setOpenSlotMenuId] = useState<string | null>(null);

  /* Filtros e criação do Bloco 5 (Minhas Tarefas) */
  const [taskFilter, setTaskFilter] = useState<
    "today" | "pending" | "completed"
  >("pending");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>("");
  const [autoTaskNotice, setAutoTaskNotice] = useState<string | null>(null);

  /* Modal Global "+ Criar" Contextual (Seção 7.14) */
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] =
    useState<boolean>(false);
  const [quickCreateType, setQuickCreateType] = useState<
    "linha" | "calendario" | "temas" | "roteiro" | "projeto"
  >("roteiro");
  const [quickCreateProjectId, setQuickCreateProjectId] = useState<string>("");
  const [quickCreateOrigin, setQuickCreateOrigin] = useState<
    "calendar_slot" | "theme_library"
  >("calendar_slot");

  /* Garante projeto padrão selecionado nos dropdowns */
  useEffect(() => {
    const firstProjId = activeOrReviewProjects[0]?.id || "";
    if (!selectedProjectIdFilter && firstProjId) {
      setSelectedProjectIdFilter(firstProjId);
    }
    if (!newTaskProjectId && firstProjId) {
      setNewTaskProjectId(firstProjId);
    }
    if (!quickCreateProjectId && firstProjId) {
      setQuickCreateProjectId(firstProjId);
    }
  }, [
    activeOrReviewProjects,
    selectedProjectIdFilter,
    newTaskProjectId,
    quickCreateProjectId,
  ]);

  const firstName = userFullName.trim().split(" ")[0] || "Roberto";
  const greetingText = useMemo(() => getGreetingByHour(firstName), [firstName]);
  const dateText = useMemo(() => getExtendedDatePtBr(), []);

  /* Calcula automaticamente o Slot Prioritário do Dia entre os projetos ativos (Seção 7.5) */
  const topPrioritySlot = useMemo(() => {
    const unpublished = todaySlots.filter((s) => s.status !== "published");
    const reelOrReady = unpublished.find((s) => s.status === "script_ready");
    return reelOrReady ?? unpublished[0] ?? null;
  }, [todaySlots]);

  const handlePriorityMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!priorityCardRef.current) return;
    const rect = priorityCardRef.current.getBoundingClientRect();
    setPrioritySpotlight({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      opacity: 1,
    });
  };

  const handlePriorityMouseLeave = () => {
    setPrioritySpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const filteredTodaySlots = useMemo(() => {
    return todaySlots.filter((slot) => {
      if (slotQuickFilter === "my_project") {
        return slot.projectId === selectedProjectIdFilter;
      }
      if (slotQuickFilter === "scripts") {
        return slot.format !== "Stories";
      }
      if (slotQuickFilter === "stories") {
        return slot.format === "Stories";
      }
      if (slotQuickFilter === "pending") {
        return slot.status !== "published";
      }
      return true;
    });
  }, [todaySlots, slotQuickFilter, selectedProjectIdFilter]);

  const visibleTodaySlots = useMemo(() => {
    if (showAllTodaySlots) return filteredTodaySlots;
    return filteredTodaySlots.slice(0, 5);
  }, [filteredTodaySlots, showAllTodaySlots]);

  const hiddenSlotsCount = Math.max(
    0,
    filteredTodaySlots.length - visibleTodaySlots.length
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskFilter === "today") {
        return !task.completed && task.dueCategory === "today";
      }
      if (taskFilter === "pending") {
        return !task.completed;
      }
      return task.completed;
    });
  }, [tasks, taskFilter]);

  const handleCreateManualTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    addManualTask(
      newTaskTitle,
      newTaskProjectId || activeOrReviewProjects[0]?.id || ""
    );
    setNewTaskTitle("");
  };

  const handleRemoveTaskClick = (taskId: string) => {
    const res = removeOrPostponeTask(taskId);
    if (res.wasPostponed && res.message) {
      setAutoTaskNotice(res.message);
    } else {
      setAutoTaskNotice(null);
    }
  };

  const handleConfirmQuickCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsQuickCreateModalOpen(false);
    if (quickCreateType === "projeto") {
      router.push("/dashboard/editorial?acao=novo-projeto");
      return;
    }
    const targetId =
      quickCreateProjectId ||
      activeOrReviewProjects[0]?.id ||
      "proj-produto-x";
    router.push(`/dashboard/editorial/${targetId}/linha-editorial/onboarding`);
  };

  /* Frase dinâmica de contexto calculada automaticamente pelo estado real do cliente (Seção 7.3) */
  const dynamicContextSentence = useMemo(() => {
    if (derivedPanelState === "no_projects") {
      return "Você ainda não possui Projetos Editoriais ativos. Estruture seu primeiro projeto para iniciar sua operação.";
    }
    if (derivedPanelState === "no_active_calendar") {
      return "Seus projetos ativos ainda precisam de um Calendário Editorial vigente para distribuir as entregas do dia.";
    }
    if (derivedPanelState === "no_slots_today") {
      return "Nenhuma publicação prevista para hoje. Use este tempo para preparar os próximos conteúdos.";
    }
    if (derivedPanelState === "day_completed") {
      return "Os conteúdos previstos para hoje foram concluídos. Aproveite para adiantar os roteiros dos próximos dias.";
    }
    const pendingCount = todaySlots.filter(
      (s) => s.status !== "published"
    ).length;
    return `Você tem ${pendingCount} ações prioritárias hoje nos seus Projetos Editoriais ativos para manter a execução em dia.`;
  }, [derivedPanelState, todaySlots]);

  const projectOptions = useMemo(
    () =>
      activeOrReviewProjects.map((p) => ({
        id: p.id,
        label: p.name,
      })),
    [activeOrReviewProjects]
  );

  const activeStoriesMeta = STORIES_WINDOWS[storiesWindow];

  return (
    <div className="flex flex-col gap-7">
      {/* 1. CABEÇALHO CONTEXTUAL DO PAINEL DO DIA (Seção 7.3 — Sem botões de simulação manual) */}
      <section className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.75rem]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-la-gold-light">
              <Radar aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
              <span>{greetingText}</span>
            </span>
            <span aria-hidden="true" className="text-white/25">
              •
            </span>
            <span className="text-la-text-secondary">{dateText}</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-la-sans text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary sm:text-[2.25rem]">
              Painel do Dia
            </h1>
            <span className="font-la-mono text-[0.6875rem] uppercase tracking-[0.08em] text-la-gold-light">
              Sua operação editorial, organizada por prioridade
            </span>
          </div>

          <p className="mt-0.5 font-la-sans text-[0.9375rem] text-la-text-secondary">
            {dynamicContextSentence}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/editorial"
            className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-4 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-primary transition-colors hover:border-la-border-gold/60 hover:text-la-gold-light"
          >
            <FolderKanban aria-hidden="true" className="h-4 w-4 text-la-gold" />
            <span>Central Estratégica ({activeOrReviewProjects.length})</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsQuickCreateModalOpen(true)}
            className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
          >
            <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
            <span>Criar</span>
          </button>
        </div>
      </section>

      {/* 2. ESTADO AUTOMÁTICO QUANDO O CLIENTE NÃO TEM PROJETOS OU NÃO TEM CALENDÁRIO ATIVO (Seção 7.12) */}
      {derivedPanelState === "no_projects" ? (
        <section className="rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-7 sm:p-8">
          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
            ESTRUTURAÇÃO INICIAL DA CONTA
          </span>
          <h2 className="mt-1.5 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
            Você ainda não possui nenhum Projeto Editorial ativo.
          </h2>
          <p className="mt-2 max-w-[42rem] font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
            Antes de visualizar prioridades diárias, estruture seu primeiro
            Projeto Editorial na Central Estratégica para alimentar a IA com o
            nicho, oferta e público do seu negócio.
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/editorial"
              className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
            >
              <span>Criar primeiro Projeto Editorial</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : derivedPanelState === "no_active_calendar" ? (
        <section className="rounded-la-xl border border-la-border-gold/50 bg-[#080B12]/95 p-7 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[38rem]">
              <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                ORIENTAÇÃO OPERACIONAL
              </span>
              <h2 className="mt-1.5 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                Você ainda não possui conteúdos planejados para hoje.
              </h2>
              <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                Crie ou ative um Calendário Editorial em um dos seus projetos
                para transformar sua estratégia em uma rotina de execução com
                formatos, datas, prioridades e roteiros.
              </p>
            </div>

            <Link
              href="/dashboard/editorial"
              className="inline-flex min-h-[2.875rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <Calendar aria-hidden="true" className="h-4 w-4" />
              <span>Criar Calendário Editorial</span>
            </Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Projetos que precisam avançar:
            </span>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeOrReviewProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/dashboard/editorial/${proj.id}/linha-editorial/onboarding`}
                  className="flex items-center justify-between rounded-la-lg border border-white/10 bg-black/45 p-3.5 transition-colors hover:border-la-border-gold"
                >
                  <div>
                    <p className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                      {proj.name}
                    </p>
                    <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                      {proj.nextActionLabel}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-la-gold" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 3. CORPO EM 2 COLUNAS NO DESKTOP (Seções 7.4 e 7.15) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-7">
        {/* COLUNA PRINCIPAL (7 COLUNAS): Prioridade do Dia + Conteúdos de Hoje + Próximos 48h */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* BLOCO 1 — PRIORIDADE DO DIA (Seção 7.5: Calculada a partir dos slots reais do cliente) */}
          <section
            ref={priorityCardRef}
            onMouseMove={handlePriorityMouseMove}
            onMouseLeave={handlePriorityMouseLeave}
            aria-labelledby="prioridade-do-dia-title"
            style={{
              boxShadow:
                "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 28px 60px rgba(0, 0, 0, 0.8), 0 0 64px rgba(207, 169, 101, 0.12)",
            }}
            className="relative overflow-hidden rounded-la-xl border border-la-gold/70 bg-[#0B0F1A]/95 p-6 sm:p-7"
          >
            <div
              aria-hidden="true"
              style={{
                opacity: prioritySpotlight.opacity,
                background: `radial-gradient(460px circle at ${prioritySpotlight.x}px ${prioritySpotlight.y}px, rgba(207, 169, 101, 0.16), transparent 68%)`,
              }}
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
            />

            <div className="relative z-10 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    id="prioridade-do-dia-title"
                    className="inline-flex items-center gap-1.5 rounded-la-full bg-la-gold px-3 py-0.5 font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.4)]"
                  >
                    <Flame aria-hidden="true" className="h-3 w-3" />
                    <span>Prioridade do Dia</span>
                  </span>

                  {topPrioritySlot ? (
                    <span className="rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                      {topPrioritySlot.projectName}
                    </span>
                  ) : null}
                </div>

                {topPrioritySlot ? (
                  <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                    Hoje, {topPrioritySlot.time} • {topPrioritySlot.format}
                  </span>
                ) : null}
              </div>

              {!topPrioritySlot ? (
                <div className="mt-5 flex flex-col gap-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-la-md border border-emerald-500/40 bg-emerald-950/35 px-3 py-1 font-la-mono text-[0.6875rem] font-semibold text-emerald-300">
                    <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Execução do dia concluída</span>
                  </div>

                  <h2 className="font-la-sans text-[1.3125rem] font-semibold text-la-text-primary">
                    Os conteúdos previstos para hoje foram atualizados.
                  </h2>

                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.62] text-la-text-secondary">
                    Aproveite para adiantar os roteiros dos próximos dias ou
                    revisar o planejamento da semana nos seus projetos ativos.
                  </p>

                  <div className="mt-2">
                    <Link
                      href="/dashboard/editorial"
                      className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                    >
                      <span>Preparar próximos conteúdos</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mt-4 font-la-sans text-[1.375rem] font-semibold leading-[1.2] text-la-text-primary sm:text-[1.5rem]">
                    {topPrioritySlot.status === "script_ready"
                      ? `Grave o ${topPrioritySlot.format} de ${topPrioritySlot.retinaType} previsto para hoje.`
                      : `Conclua o ${topPrioritySlot.format} previsto para hoje às ${topPrioritySlot.time}.`}
                  </h2>

                  <p className="mt-1.5 font-la-sans text-[1rem] font-medium text-la-gold-light">
                    “{topPrioritySlot.title}”
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 font-la-mono text-[0.6875rem]">
                    <span className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-1 text-la-gold-light">
                      RETINA: {topPrioritySlot.retinaType}
                    </span>
                    <span className="rounded-la-xs border border-white/12 bg-black/50 px-2.5 py-1 text-la-text-primary">
                      Formato: {topPrioritySlot.format}
                    </span>
                    <span className="rounded-la-xs border border-white/12 bg-black/50 px-2.5 py-1 text-la-text-secondary">
                      Status:{" "}
                      {resolveSlotStatusMeta(topPrioritySlot.status).statusText}
                    </span>
                  </div>

                  {/* Janela Cronológica de Stories do Dia (Seção 7.5) */}
                  <div className="mt-5 rounded-la-lg border border-white/10 bg-black/50 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Sequência de Stories de Hoje ({activeStoriesMeta.timeRange})
                      </span>

                      <div className="flex flex-wrap items-center gap-1">
                        {(
                          Object.keys(STORIES_WINDOWS) as StoriesWindowBlock[]
                        ).map((winKey) => (
                          <button
                            key={winKey}
                            type="button"
                            onClick={() => setStoriesWindow(winKey)}
                            className={clsx(
                              "rounded-la-xs px-2 py-0.5 font-la-mono text-[0.5625rem] transition-colors",
                              storiesWindow === winKey
                                ? "bg-la-gold font-semibold text-la-text-inverse"
                                : "bg-white/[0.04] text-la-text-secondary hover:text-la-text-primary"
                            )}
                          >
                            {STORIES_WINDOWS[winKey].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="mt-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      {activeStoriesMeta.headline}
                    </p>
                    <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                      {activeStoriesMeta.subtitle}
                    </p>
                  </div>

                  {/* Ações diretas sincronizadas com o estado real do slot */}
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                    <Link
                      href={topPrioritySlot.workspaceHref}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
                    >
                      <span>Abrir roteiro</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        updateTodaySlotStatus(
                          topPrioritySlot.id,
                          topPrioritySlot.status === "in_production"
                            ? "script_ready"
                            : "in_production"
                        )
                      }
                      className={clsx(
                        "inline-flex min-h-[2.75rem] items-center gap-2 rounded-la-md border px-4 py-2.5 font-la-sans text-[0.8125rem] font-medium transition-colors",
                        topPrioritySlot.status === "in_production"
                          ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                          : "border-white/14 bg-white/[0.04] text-la-text-primary hover:border-la-border-gold/60"
                      )}
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 text-la-gold"
                      />
                      <span>
                        {topPrioritySlot.status === "in_production"
                          ? "Em produção ativa"
                          : "Marcar como em produção"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateTodaySlotStatus(topPrioritySlot.id, "published")
                      }
                      className="ml-auto font-la-mono text-[0.6875rem] text-la-text-muted transition-colors hover:text-la-gold-light"
                    >
                      ✓ Marcar como publicado
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* BLOCO 2 — CONTEÚDOS DE HOJE (Seção 7.6) */}
          <section
            aria-labelledby="slots-hoje-heading"
            className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <h2
                  id="slots-hoje-heading"
                  className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary"
                >
                  Conteúdos de Hoje
                </h2>
                <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                  Slots planejados nos seus Calendários Editoriais ativos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-la-lg border border-white/10 bg-black/50 p-1">
                {[
                  { id: "all" as const, label: "Todos" },
                  { id: "my_project" as const, label: "Meu projeto" },
                  { id: "scripts" as const, label: "Roteiros" },
                  { id: "stories" as const, label: "Stories" },
                  { id: "pending" as const, label: "Pendentes" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSlotQuickFilter(f.id)}
                    className={clsx(
                      "rounded-la-xs px-2.5 py-1 font-la-mono text-[0.625rem] font-medium transition-colors",
                      slotQuickFilter === f.id
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:text-la-text-primary"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {slotQuickFilter === "my_project" && projectOptions.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-la-md border border-white/10 bg-black/40 px-3.5 py-2">
                <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                  Filtrando por Projeto Editorial:
                </span>
                <DarkProjectDropdown
                  value={selectedProjectIdFilter}
                  options={projectOptions}
                  onChange={setSelectedProjectIdFilter}
                />
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3">
              {visibleTodaySlots.length === 0 ? (
                <div className="rounded-la-lg border border-white/8 bg-black/40 p-6 text-center">
                  <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    Nenhum slot encontrado neste filtro.
                  </p>
                </div>
              ) : (
                visibleTodaySlots.map((slot) => {
                  const statusMeta = resolveSlotStatusMeta(slot.status);
                  const isMenuOpen = openSlotMenuId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col justify-between gap-3.5 rounded-la-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-la-md border border-la-border-gold/45 bg-la-gold-faint font-la-mono text-[0.75rem] font-semibold text-la-gold-light">
                          {slot.time}
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-la-xs border border-white/12 bg-black/55 px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                              [{slot.format}]
                            </span>
                            <span className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                              {slot.title}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-secondary">
                            <span>Projeto: {slot.projectName}</span>
                            <span>•</span>
                            <span className="text-la-gold-light">
                              {slot.retinaType}
                            </span>
                            <span>•</span>
                            <span
                              className={clsx(
                                "rounded-la-xs border px-2 py-0.5 text-[0.625rem] font-semibold",
                                statusMeta.badgeClass
                              )}
                            >
                              {statusMeta.statusText}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={slot.workspaceHref}
                          className="inline-flex min-h-[2.25rem] items-center justify-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
                        >
                          <span>{statusMeta.actionText}</span>
                          <ArrowRight
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />
                        </Link>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSlotMenuId((prev) =>
                                prev === slot.id ? null : slot.id
                              )
                            }
                            aria-label="Alterar status do slot"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-black/45 text-la-text-muted hover:text-la-text-primary"
                          >
                            <MoreVertical
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          </button>

                          {isMenuOpen ? (
                            <div className="absolute right-0 z-30 mt-1.5 w-48 rounded-la-lg border border-white/15 bg-[#090C14]/98 p-1.5 shadow-[0_18px_36px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenSlotMenuId(null);
                                  updateTodaySlotStatus(
                                    slot.id,
                                    "in_production"
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-la-md px-2.5 py-1.5 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                              >
                                <span>Marcar em produção</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenSlotMenuId(null);
                                  updateTodaySlotStatus(
                                    slot.id,
                                    "script_ready"
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-la-md px-2.5 py-1.5 text-left font-la-sans text-[0.75rem] text-la-text-secondary hover:bg-white/[0.06] hover:text-la-text-primary"
                              >
                                <span>Marcar roteiro pronto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenSlotMenuId(null);
                                  updateTodaySlotStatus(slot.id, "published");
                                }}
                                className="flex w-full items-center gap-2 rounded-la-md px-2.5 py-1.5 text-left font-la-sans text-[0.75rem] text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <span>Marcar como publicado</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {hiddenSlotsCount > 0 || showAllTodaySlots ? (
                <button
                  type="button"
                  onClick={() => setShowAllTodaySlots((prev) => !prev)}
                  className="mt-1 inline-flex items-center justify-center rounded-la-md border border-white/10 bg-black/40 py-2 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light transition-colors hover:border-la-border-gold/50"
                >
                  {showAllTodaySlots
                    ? "Recolher lista para os 5 slots prioritários"
                    : `+ Ver mais ${hiddenSlotsCount} conteúdo(s) de hoje`}
                </button>
              ) : null}
            </div>
          </section>

          {/* BLOCO 3 — PREPARE OS PRÓXIMOS DIAS — 48H (Seção 7.7) */}
          <section
            aria-labelledby="proximos-48h-heading"
            className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h2
                  id="proximos-48h-heading"
                  className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary"
                >
                  Prepare os Próximos Dias (48h)
                </h2>
                <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                  Apenas conteúdos próximos que ainda exigem roteiro, capa ou
                  material complementar.
                </p>
              </div>

              <Link
                href="/dashboard/editorial"
                className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
              >
                Ver calendários →
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {upcoming48hSlots.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-la-lg border border-white/8 bg-black/40 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.625rem]">
                      <span className="font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                        {item.dayLabel}
                      </span>
                      <span className="rounded-la-xs border border-white/12 bg-white/[0.04] px-2 py-0.5 text-la-text-primary">
                        [{item.format}]
                      </span>
                      <span className="text-la-text-muted">
                        {item.projectName}
                      </span>
                    </div>

                    <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                      {item.title}
                    </p>

                    <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                      {item.retinaType} • {item.statusLabel}
                    </span>
                  </div>

                  <Link
                    href={item.actionHref}
                    className="inline-flex min-h-[2.25rem] shrink-0 items-center justify-center gap-1.5 rounded-la-md border border-white/14 bg-white/[0.04] px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-text-primary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUNA SECUNDÁRIA (5 COLUNAS): Sugestões da IA + Minhas Tarefas + Atenção Operacional + Atividade Recente */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* BLOCO 4 — SUGESTÕES DA IA DINÂMICAS POR PROJETO (Seção 7.8) */}
          <section
            aria-labelledby="sugestoes-ia-heading"
            className="rounded-la-xl border border-la-border-gold/45 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <div>
                  <h2
                    id="sugestoes-ia-heading"
                    className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                  >
                    Sugestões da IA
                  </h2>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Ajustes calculados a partir do estado real dos seus projetos.
                  </p>
                </div>
              </div>

              <span className="rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold text-la-gold-light">
                {aiSuggestions.length} ativas
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {aiSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/45 p-3.5 transition-colors hover:border-la-border-gold/45"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {sug.typeBadge}
                    </span>
                    <span className="truncate font-la-mono text-[0.5625rem] text-la-text-muted">
                      {sug.projectName}
                    </span>
                  </div>

                  <p className="font-la-sans text-[0.875rem] font-semibold leading-[1.35] text-la-text-primary">
                    {sug.identifiedWhat}
                  </p>

                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                    {sug.whyItMatters}
                  </p>

                  <div className="mt-1">
                    <Link
                      href={sug.actionHref}
                      className="inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                    >
                      <span>[ {sug.actionLabel} ]</span>
                      <ArrowRight aria-hidden="true" className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCO 5 — MINHAS TAREFAS (Seção 7.9 — Com Dropdown Customizado Dark-First) */}
          <section
            aria-labelledby="minhas-tarefas-heading"
            className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
              <div>
                <h2
                  id="minhas-tarefas-heading"
                  className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                >
                  Minhas Tarefas
                </h2>
                <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                  Pendências manuais e ações vinculadas aos seus projetos.
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-la-md border border-white/10 bg-black/45 p-1">
                {[
                  { id: "today" as const, label: "Hoje" },
                  { id: "pending" as const, label: "Pendentes" },
                  { id: "completed" as const, label: "Concluídas" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTaskFilter(tab.id)}
                    className={clsx(
                      "rounded-la-xs px-2 py-1 font-la-mono text-[0.625rem] transition-colors",
                      taskFilter === tab.id
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:text-la-text-primary"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {autoTaskNotice ? (
              <div className="mt-3 rounded-la-md border border-la-border-gold/50 bg-la-gold-faint p-3 font-la-sans text-[0.75rem] text-la-gold-light">
                {autoTaskNotice}
              </div>
            ) : null}

            <form
              onSubmit={handleCreateManualTask}
              className="mt-3.5 flex flex-col gap-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova tarefa vinculada a um projeto..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="min-h-[2.375rem] flex-1 rounded-la-md border border-white/12 bg-black/55 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                />
                <button
                  type="submit"
                  aria-label="Adicionar tarefa"
                  className="inline-flex h-[2.375rem] w-[2.375rem] shrink-0 items-center justify-center rounded-la-md bg-la-gold text-la-text-inverse transition-colors hover:bg-la-gold-light"
                >
                  <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              {projectOptions.length > 0 ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                    Vincular ao projeto:
                  </span>
                  <DarkProjectDropdown
                    value={newTaskProjectId}
                    options={projectOptions}
                    onChange={setNewTaskProjectId}
                  />
                </div>
              ) : null}
            </form>

            <div className="mt-3.5 flex flex-col gap-2">
              {filteredTasks.length === 0 ? (
                <div className="rounded-la-lg border border-white/8 bg-black/35 p-4 text-center font-la-sans text-[0.8125rem] text-la-text-muted">
                  Nenhuma tarefa neste filtro.
                </div>
              ) : (
                filteredTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-la-lg border border-white/8 bg-black/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex cursor-pointer items-start gap-2.5 select-none">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompleted(task.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-la-xs border transition-colors",
                            task.completed
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-white/25 bg-black/50 text-transparent"
                          )}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <span
                            className={clsx(
                              "font-la-sans text-[0.8125rem] leading-[1.4]",
                              task.completed
                                ? "line-through text-la-text-muted"
                                : "font-medium text-la-text-primary"
                            )}
                          >
                            {task.title}
                          </span>
                          <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                            {task.projectName} • Prazo: {task.dueLabel} •{" "}
                            <span className="text-la-gold-light">
                              {task.origin}
                            </span>
                          </span>
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveTaskClick(task.id)}
                        className="shrink-0 font-la-mono text-[0.5625rem] text-la-text-muted transition-colors hover:text-la-gold-light"
                      >
                        {task.origin === "Automática" ? (
                          <span>Adiar</span>
                        ) : (
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/6 pt-1.5 pl-6">
                      <span className="truncate font-la-mono text-[0.5625rem] text-la-text-muted">
                        {task.resourceLabel || "Objeto vinculado ao projeto"}
                      </span>
                      <Link
                        href={task.resourceHref}
                        className="font-la-mono text-[0.625rem] font-semibold text-la-gold-light hover:underline"
                      >
                        Abrir item relacionado →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* BLOCO 6 — ATENÇÃO OPERACIONAL (Seção 7.10) */}
          <section
            aria-labelledby="atencao-operacional-heading"
            className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4 text-amber-400"
              />
              <div>
                <h2
                  id="atencao-operacional-heading"
                  className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                >
                  Atenção Operacional
                </h2>
                <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                  Riscos objetivos calculados a partir dos seus projetos.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5">
              {operationalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={clsx(
                    "rounded-la-lg border p-3.5",
                    alert.severity === "critical"
                      ? "border-red-500/40 bg-red-950/20"
                      : alert.severity === "warning"
                        ? "border-amber-500/35 bg-amber-950/20"
                        : "border-white/12 bg-black/45"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 font-la-mono text-[0.5625rem]">
                    <span
                      className={clsx(
                        "font-semibold uppercase tracking-[0.08em]",
                        alert.severity === "critical"
                          ? "text-red-300"
                          : alert.severity === "warning"
                            ? "text-amber-300"
                            : "text-la-gold-light"
                      )}
                    >
                      {alert.severity === "critical"
                        ? "CRÍTICO"
                        : alert.severity === "warning"
                          ? "ATENÇÃO"
                          : "ESTRUTURA"}
                    </span>
                    <span className="truncate text-la-text-muted">
                      {alert.projectName}
                    </span>
                  </div>

                  <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                    {alert.title}
                  </p>
                  <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                    {alert.description}
                  </p>

                  <Link
                    href={alert.actionHref}
                    className="mt-2 inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                  >
                    <span>[ {alert.actionLabel} ]</span>
                    <ArrowRight aria-hidden="true" className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCO 7 — ATIVIDADE RECENTE EM TEMPO REAL (Seção 7.11) */}
          <section
            aria-labelledby="atividade-recente-heading"
            className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Clock aria-hidden="true" className="h-4 w-4 text-la-gold" />
              <div>
                <h2
                  id="atividade-recente-heading"
                  className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                >
                  Atividade Recente
                </h2>
                <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                  Movimentações relevantes na sua operação editorial.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex flex-col gap-3">
              {activityEvents.slice(0, 5).map((ev) => (
                <Link
                  key={ev.id}
                  href={ev.resourceHref}
                  className="group border-l-2 border-la-gold/45 pl-3 transition-colors hover:border-la-gold"
                >
                  <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                    <span className="font-semibold text-la-gold-light">
                      {ev.occurredAt}
                    </span>
                    <span className="truncate text-la-text-muted">
                      {ev.projectName}
                    </span>
                  </div>
                  <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary group-hover:text-la-text-primary">
                    {ev.label}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL CONTEXTUAL "+ CRIAR" GLOBAL (Seção 7.14) */}
      <AnimatePresence>
        {isQuickCreateModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickCreateModalOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-create-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    AÇÃO RÁPIDA COM VÍNCULO DE CONTEXTO
                  </span>
                  <h2
                    id="quick-create-modal-title"
                    className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary"
                  >
                    O que você deseja criar agora?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickCreateModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleConfirmQuickCreate}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { id: "roteiro" as const, label: "Novo Roteiro" },
                    { id: "temas" as const, label: "Gerar Temas" },
                    { id: "calendario" as const, label: "Novo Calendário" },
                    { id: "linha" as const, label: "Nova Linha Editorial" },
                    { id: "projeto" as const, label: "Novo Projeto" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuickCreateType(opt.id)}
                      className={clsx(
                        "rounded-la-md border px-3 py-2 text-left font-la-sans text-[0.8125rem] font-medium transition-colors",
                        quickCreateType === opt.id
                          ? "border-la-gold bg-la-gold-faint text-la-gold-light"
                          : "border-white/10 bg-black/45 text-la-text-secondary hover:text-la-text-primary"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {quickCreateType !== "projeto" && projectOptions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-3 rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                        Projeto Editorial de Destino *
                      </span>
                      <DarkProjectDropdown
                        value={quickCreateProjectId}
                        options={projectOptions}
                        onChange={setQuickCreateProjectId}
                      />
                    </div>

                    {quickCreateType === "roteiro" ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                          Origem Recomendada do Roteiro
                        </span>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() =>
                              setQuickCreateOrigin("calendar_slot")
                            }
                            className={clsx(
                              "rounded-la-md border p-3 text-left transition-colors",
                              quickCreateOrigin === "calendar_slot"
                                ? "border-la-gold bg-la-gold-faint"
                                : "border-white/10 bg-black/40"
                            )}
                          >
                            <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                              A partir de Slot do Calendário
                            </span>
                            <span className="mt-0.5 block font-la-mono text-[0.625rem] text-la-gold-light">
                              Recomendado • Carrega RETINA e objetivo
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setQuickCreateOrigin("theme_library")
                            }
                            className={clsx(
                              "rounded-la-md border p-3 text-left transition-colors",
                              quickCreateOrigin === "theme_library"
                                ? "border-la-gold bg-la-gold-faint"
                                : "border-white/10 bg-black/40"
                            )}
                          >
                            <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                              A partir de Tema da Biblioteca
                            </span>
                            <span className="mt-0.5 block font-la-mono text-[0.625rem] text-la-text-secondary">
                              Escolher pauta já aprovada no acervo
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsQuickCreateModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Continuar no Workspace</span>
                    <ArrowRight className="h-4 w-4" />
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