// FrontEnd/src/lib/context/EditorialWorkspaceContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ProjectStatus = "active" | "in_setup" | "in_review" | "archived";

export type ProjectActivityLogItem = {
  readonly id: string;
  readonly occurredAt: string;
  readonly projectName: string;
  readonly label: string;
  readonly resourceHref: string;
};

export type EditorialProjectModel = {
  readonly id: string;
  readonly name: string;
  readonly brandOrClientName: string;
  readonly niche: string;
  readonly subniche: string;
  readonly operationTypeLabel: string;
  readonly currentObjectiveLabel: string;
  readonly currentPhaseLabel: string;
  readonly status: ProjectStatus;
  readonly hasActiveLineEditorial: boolean;
  readonly lineEditorialStatus: string;
  readonly hasActiveCalendar: boolean;
  readonly calendarStatus: string;
  readonly themesCount: number;
  readonly allocatedThemesCount: number;
  readonly approvedScriptsCount: number;
  readonly draftScriptsCount: number;
  readonly nextActionLabel: string;
  readonly nextActionReason: string;
  readonly updatedAtLabel: string;
};

export type TodaySlotStatus =
  | "theme_pending"
  | "ready_for_script"
  | "draft"
  | "script_ready"
  | "in_production"
  | "ready_to_publish"
  | "published"
  | "missing_asset"
  | "complementary_pending";

export type TodaySlotModel = {
  readonly id: string;
  readonly time: string;
  readonly format:
    | "Stories"
    | "Reel"
    | "Carrossel"
    | "Live"
    | "Post Estático"
    | "Vídeo Longo";
  readonly title: string;
  readonly projectId: string;
  readonly retinaType:
    | "Relacionamento"
    | "Transformação"
    | "Autoridade"
    | "Níveis de Consciência"
    | "Engajamento"
    | "Interação";
  readonly status: TodaySlotStatus;
};

export type Upcoming48hSlotModel = {
  readonly id: string;
  readonly dayLabel: string;
  readonly format: string;
  readonly title: string;
  readonly projectId: string;
  readonly retinaType: string;
  readonly statusLabel: string;
  readonly actionLabel: string;
};

export type OperationalTaskModel = {
  readonly id: string;
  readonly title: string;
  readonly projectId: string;
  readonly dueLabel: string;
  readonly dueCategory: "today" | "upcoming";
  readonly origin: "Manual" | "IA sugerida" | "Automática";
  readonly completed: boolean;
  readonly postponed?: boolean;
  readonly resourceLabel?: string;
};

export type AISuggestionModel = {
  readonly id: string;
  readonly typeBadge: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly identifiedWhat: string;
  readonly whyItMatters: string;
  readonly actionLabel: string;
  readonly actionHref: string;
};

export type OperationalAlertModel = {
  readonly id: string;
  readonly severity: "critical" | "warning" | "info";
  readonly projectId: string;
  readonly projectName: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionHref: string;
};

export type DerivedPanelState =
  | "no_projects"
  | "no_active_calendar"
  | "no_slots_today"
  | "day_completed"
  | "active_operation";

type CreateProjectInput = {
  readonly name: string;
  readonly brandOrClientName: string;
  readonly niche: string;
  readonly subniche: string;
  readonly operationTypeLabel: string;
  readonly currentObjectiveLabel: string;
  readonly currentPhaseLabel: string;
};

type UpdateProjectInput = {
  readonly id: string;
  readonly name: string;
  readonly brandOrClientName: string;
  readonly niche: string;
  readonly subniche: string;
  readonly operationTypeLabel: string;
  readonly currentObjectiveLabel: string;
  readonly currentPhaseLabel: string;
  readonly status: ProjectStatus;
};

type DuplicateProjectInput = {
  readonly sourceProjectId: string;
  readonly newName: string;
  readonly copyStrategicBase: boolean;
  readonly copyLineEditorial: boolean;
  readonly copyThemes: boolean;
  readonly copyCalendars: boolean;
  readonly copyScripts: boolean;
};

type EditorialWorkspaceContextValue = {
  readonly workspaceName: string;
  readonly userFullName: string;
  readonly userEmail: string;
  readonly projects: readonly EditorialProjectModel[];
  readonly activeOrReviewProjects: readonly EditorialProjectModel[];
  readonly todaySlots: readonly (TodaySlotModel & {
    readonly projectName: string;
    readonly workspaceHref: string;
  })[];
  readonly upcoming48hSlots: readonly (Upcoming48hSlotModel & {
    readonly projectName: string;
    readonly actionHref: string;
  })[];
  readonly tasks: readonly (OperationalTaskModel & {
    readonly projectName: string;
    readonly resourceHref: string;
  })[];
  readonly aiSuggestions: readonly AISuggestionModel[];
  readonly operationalAlerts: readonly OperationalAlertModel[];
  readonly activityEvents: readonly ProjectActivityLogItem[];
  readonly derivedPanelState: DerivedPanelState;
  readonly topPriorityProject: EditorialProjectModel | null;
  readonly createProject: (input: CreateProjectInput) => EditorialProjectModel;
  readonly updateProject: (input: UpdateProjectInput) => void;
  readonly duplicateProject: (
    input: DuplicateProjectInput
  ) => EditorialProjectModel | null;
  readonly toggleArchiveProject: (projectId: string) => void;
  readonly updateTodaySlotStatus: (
    slotId: string,
    nextStatus: TodaySlotStatus
  ) => void;
  readonly addManualTask: (title: string, projectId: string) => void;
  readonly toggleTaskCompleted: (taskId: string) => void;
  readonly removeOrPostponeTask: (taskId: string) => {
    readonly wasPostponed: boolean;
    readonly message?: string;
  };
};

const STORAGE_KEY = "la-editorial-workspace-state-v2";

let uniqueSequenceCounter = 100;
function createUniqueId(prefix: string): string {
  uniqueSequenceCounter += 1;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${Date.now()}-${uniqueSequenceCounter}-${rand}`;
}

/**
 * Higieniza lista de eventos garantindo que nenhum ID se repita e que
 * eventos consecutivos idênticos gerados anteriormente sejam removidos.
 */
function deduplicateActivityEvents(
  items: readonly ProjectActivityLogItem[]
): readonly ProjectActivityLogItem[] {
  const seenIds = new Set<string>();
  const cleaned: ProjectActivityLogItem[] = [];

  for (const item of items) {
    const safeId = seenIds.has(item.id)
      ? createUniqueId("ev-fixed")
      : item.id;
    seenIds.add(safeId);

    const lastAdded = cleaned[cleaned.length - 1];
    if (
      lastAdded &&
      lastAdded.label === item.label &&
      lastAdded.projectName === item.projectName
    ) {
      continue;
    }

    cleaned.push({
      ...item,
      id: safeId,
      resourceHref: item.resourceHref.replace(
        "/linha-editorial/onboarding",
        ""
      ),
    });
  }

  return cleaned.slice(0, 24);
}

const DEFAULT_PROJECTS: readonly EditorialProjectModel[] = [
  {
    id: "proj-produto-x",
    name: "Produto X — Lançamento Semente",
    brandOrClientName: "Roberto Zane",
    niche: "Finanças",
    subniche: "Algorithmic Trading",
    operationTypeLabel: "Lançamento",
    currentObjectiveLabel: "Conversão",
    currentPhaseLabel: "Aquecimento — Semana 2 de 4",
    status: "active",
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
      "Há conteúdos de Níveis de Consciência previstos para o aquecimento que já possuem tema definido, mas ainda estão sem roteiro.",
    updatedAtLabel: "Atualizado há 2 horas",
  },
  {
    id: "proj-autoridade-imperial",
    name: "Autoridade Imperial — Orgânico",
    brandOrClientName: "Roberto Zane",
    niche: "Desenvolvimento Pessoal",
    subniche: "Alta Performance & Posicionamento",
    operationTypeLabel: "Orgânico",
    currentObjectiveLabel: "Crescimento e Autoridade",
    currentPhaseLabel: "Operação Contínua",
    status: "active",
    hasActiveLineEditorial: true,
    lineEditorialStatus: "Ativa — Linha v1",
    hasActiveCalendar: false,
    calendarStatus: "Pendente — criar Calendário",
    themesCount: 42,
    allocatedThemesCount: 0,
    approvedScriptsCount: 8,
    draftScriptsCount: 4,
    nextActionLabel:
      "Transforme sua estratégia em uma agenda editorial executável",
    nextActionReason:
      "Sua Linha Editorial v1 está ativa, mas este projeto ainda não possui um Calendário Editorial vigente para distribuir os slots.",
    updatedAtLabel: "Atualizado ontem",
  },
  {
    id: "proj-mentoria-premium",
    name: "Mentoria Premium — Aquecimento",
    brandOrClientName: "Roberto Zane",
    niche: "Negócios Digitais",
    subniche: "Mentoria High-Ticket",
    operationTypeLabel: "Campanha",
    currentObjectiveLabel: "Geração de Leads",
    currentPhaseLabel: "Pré-abertura de Carrinho",
    status: "in_setup",
    hasActiveLineEditorial: false,
    lineEditorialStatus: "Em estruturação — dados incompletos",
    hasActiveCalendar: false,
    calendarStatus: "Aguardando Linha Editorial",
    themesCount: 0,
    allocatedThemesCount: 0,
    approvedScriptsCount: 0,
    draftScriptsCount: 0,
    nextActionLabel: "Construa a Linha Editorial para dar contexto à IA",
    nextActionReason:
      "Conclua a promessa principal, ROMA, objeções do ICP e distribuição RETINA antes de gerar o calendário.",
    updatedAtLabel: "Atualizado há 3 dias",
  },
  {
    id: "proj-clinica-alpha",
    name: "Clínica Alpha — Captação de Pacientes",
    brandOrClientName: "Clínica Alpha",
    niche: "Saúde & Medicina",
    subniche: "Longevidade e Performance",
    operationTypeLabel: "Cliente",
    currentObjectiveLabel: "Autoridade",
    currentPhaseLabel: "Revisão de Ciclo",
    status: "in_review",
    hasActiveLineEditorial: true,
    lineEditorialStatus: "Revisão recomendada (45 dias)",
    hasActiveCalendar: false,
    calendarStatus: "Período encerrado — revisar ou duplicar",
    themesCount: 64,
    allocatedThemesCount: 22,
    approvedScriptsCount: 24,
    draftScriptsCount: 0,
    nextActionLabel:
      "Revisar Linha Editorial e duplicar calendário para o novo ciclo",
    nextActionReason:
      "O período ativo encerrou e a operação mudou de fase; revise a distribuição RETINA antes do próximo calendário.",
    updatedAtLabel: "Atualizado há 5 dias",
  },
] as const;

const DEFAULT_TODAY_SLOTS: readonly TodaySlotModel[] = [
  {
    id: "slot-today-01",
    time: "08h00",
    format: "Stories",
    title: "Sequência da Manhã: O erro invisível que trava sua previsibilidade",
    projectId: "proj-produto-x",
    retinaType: "Relacionamento",
    status: "ready_for_script",
  },
  {
    id: "slot-today-02",
    time: "11h00",
    format: "Carrossel",
    title:
      "Por que postar todos os dias sem Linha Editorial destrói sua conversão",
    projectId: "proj-autoridade-imperial",
    retinaType: "Níveis de Consciência",
    status: "in_production",
  },
  {
    id: "slot-today-03",
    time: "16h00",
    format: "Reel",
    title: "O erro invisível que bloqueia sua previsibilidade comercial",
    projectId: "proj-produto-x",
    retinaType: "Transformação",
    status: "script_ready",
  },
  {
    id: "slot-today-04",
    time: "18h30",
    format: "Post Estático",
    title: "Mapa de Decisão: Como separar ofertas em Projetos Editoriais",
    projectId: "proj-produto-x",
    retinaType: "Autoridade",
    status: "complementary_pending",
  },
  {
    id: "slot-today-05",
    time: "20h00",
    format: "Live",
    title: "Live Semanal: Como validar sua oferta no orgânico sem improviso",
    projectId: "proj-produto-x",
    retinaType: "Autoridade",
    status: "missing_asset",
  },
  {
    id: "slot-today-06",
    time: "21h30",
    format: "Stories",
    title: "Sequência da Noite: Respostas de Q&A sobre objeção de tempo",
    projectId: "proj-produto-x",
    retinaType: "Interação",
    status: "draft",
  },
] as const;

const DEFAULT_UPCOMING_SLOTS: readonly Upcoming48hSlotModel[] = [
  {
    id: "up-48-01",
    dayLabel: "AMANHÃ · 11h00",
    format: "Carrossel",
    title: "5 sinais de uma oferta fraca que afasta compradores prontos",
    projectId: "proj-produto-x",
    retinaType: "Níveis de Consciência",
    statusLabel: "Rascunho iniciado",
    actionLabel: "Continuar roteiro",
  },
  {
    id: "up-48-02",
    dayLabel: "AMANHÃ · 16h00",
    format: "Reel",
    title: "Por que repetir prompts soltos faz sua marca soar genérica",
    projectId: "proj-autoridade-imperial",
    retinaType: "Transformação",
    statusLabel: "Tema definido · Sem roteiro",
    actionLabel: "Criar roteiro",
  },
  {
    id: "up-48-03",
    dayLabel: "PRÓXIMAS 48H · 20h00",
    format: "Live",
    title: "Aquecimento Semente: Os 3 pilares da operação editorial enxuta",
    projectId: "proj-produto-x",
    retinaType: "Autoridade",
    statusLabel: "Sem thumbnail e títulos",
    actionLabel: "Criar títulos e capa",
  },
] as const;

const DEFAULT_TASKS: readonly OperationalTaskModel[] = [
  {
    id: "tsk-01",
    title: "Revisar CTA do carrossel de quarta-feira antes de enviar ao design",
    projectId: "proj-produto-x",
    dueLabel: "Hoje",
    dueCategory: "today",
    origin: "Manual",
    completed: false,
    resourceLabel: "Carrossel — 5 sinais de uma oferta fraca",
  },
  {
    id: "tsk-02",
    title: "Criar roteiro para slot de Reel de amanhã ainda sem texto",
    projectId: "proj-autoridade-imperial",
    dueLabel: "Hoje",
    dueCategory: "today",
    origin: "Automática",
    completed: false,
    resourceLabel: "Slot de Reel — Amanhã, 16h",
  },
  {
    id: "tsk-03",
    title: "Preparar thumbnail e 3 variações de título para a Live da semana",
    projectId: "proj-produto-x",
    dueLabel: "Amanhã",
    dueCategory: "upcoming",
    origin: "IA sugerida",
    completed: false,
    resourceLabel: "Live Semanal — 20h",
  },
  {
    id: "tsk-04",
    title: "Aprovar distribuição RETINA da Linha Editorial v1",
    projectId: "proj-produto-x",
    dueLabel: "Concluída",
    dueCategory: "today",
    origin: "Automática",
    completed: true,
    resourceLabel: "Linha Editorial v1",
  },
] as const;

const DEFAULT_ACTIVITY: readonly ProjectActivityLogItem[] = [
  {
    id: "ev-init-01",
    occurredAt: "Hoje, 09:42",
    projectName: "Produto X — Lançamento Semente",
    label:
      "Roteiro “O erro invisível que bloqueia sua previsibilidade comercial” foi marcado como pronto para gravação.",
    resourceHref: "/dashboard/editorial/proj-produto-x",
  },
  {
    id: "ev-init-02",
    occurredAt: "Ontem, 18:10",
    projectName: "Autoridade Imperial — Orgânico",
    label:
      "Tema “Por que repetir prompts soltos faz sua marca soar genérica” foi conectado ao slot de quinta-feira.",
    resourceHref: "/dashboard/editorial/proj-autoridade-imperial",
  },
  {
    id: "ev-init-03",
    occurredAt: "Ontem, 14:30",
    projectName: "Produto X — Lançamento Semente",
    label:
      "Calendário “Contagem Regressiva — Lançamento” recebeu 2 novos slots de Níveis de Consciência.",
    resourceHref: "/dashboard/editorial/proj-produto-x",
  },
  {
    id: "ev-init-04",
    occurredAt: "22/10, 11:20",
    projectName: "Produto X — Lançamento Semente",
    label:
      "Linha Editorial v1 — Lançamento Semente foi aprovada e definida como ativa.",
    resourceHref: "/dashboard/editorial/proj-produto-x",
  },
  {
    id: "ev-init-05",
    occurredAt: "20/10, 16:05",
    projectName: "Clínica Alpha — Captação de Pacientes",
    label:
      "Biblioteca de Temas atualizada com 12 novas pautas de Níveis de Consciência.",
    resourceHref: "/dashboard/editorial/proj-clinica-alpha",
  },
] as const;

const EditorialWorkspaceContext =
  createContext<EditorialWorkspaceContextValue | null>(null);

export function EditorialWorkspaceProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [workspaceName, setWorkspaceName] = useState<string>("Roberto Zane");
  const [userFullName, setUserFullName] = useState<string>("Roberto Zane");
  const [userEmail, setUserEmail] = useState<string>(
    "admin@legionaltaire.com.br"
  );
  const [projects, setProjects] =
    useState<readonly EditorialProjectModel[]>(DEFAULT_PROJECTS);
  const [rawTodaySlots, setRawTodaySlots] =
    useState<readonly TodaySlotModel[]>(DEFAULT_TODAY_SLOTS);
  const [rawUpcomingSlots] = useState<readonly Upcoming48hSlotModel[]>(
    DEFAULT_UPCOMING_SLOTS
  );
  const [rawTasks, setRawTasks] =
    useState<readonly OperationalTaskModel[]>(DEFAULT_TASKS);
  const [activityEvents, setActivityEvents] =
    useState<readonly ProjectActivityLogItem[]>(DEFAULT_ACTIVITY);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      /* Limpa a chave antiga v1 que continha os eventos duplicados */
      window.localStorage.removeItem("la-editorial-workspace-state-v1");

      const savedJson = window.localStorage.getItem(STORAGE_KEY);
      if (savedJson) {
        const parsed = JSON.parse(savedJson) as {
          workspaceName?: string;
          userFullName?: string;
          userEmail?: string;
          projects?: EditorialProjectModel[];
          rawTodaySlots?: TodaySlotModel[];
          rawTasks?: OperationalTaskModel[];
          activityEvents?: ProjectActivityLogItem[];
        };

        if (parsed.workspaceName) setWorkspaceName(parsed.workspaceName);
        if (parsed.userFullName) setUserFullName(parsed.userFullName);
        if (parsed.userEmail) setUserEmail(parsed.userEmail);
        if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
        if (Array.isArray(parsed.rawTodaySlots))
          setRawTodaySlots(parsed.rawTodaySlots);
        if (Array.isArray(parsed.rawTasks)) setRawTasks(parsed.rawTasks);
        if (Array.isArray(parsed.activityEvents)) {
          setActivityEvents(deduplicateActivityEvents(parsed.activityEvents));
        }
      }

      /* Lê nome e e-mail qualificados no novo /cadastro (Ponto 01) */
      const profileQualRaw = window.localStorage.getItem(
        "la-user-profile-qualification"
      );
      if (profileQualRaw) {
        const qual = JSON.parse(profileQualRaw) as {
          fullName?: string;
          email?: string;
        };
        if (qual.fullName) {
          setWorkspaceName(qual.fullName);
          setUserFullName(qual.fullName);
        }
        if (qual.email) {
          setUserEmail(qual.email);
        }
      }
    } catch {
      /* Ignora bloqueios de storage */
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workspaceName,
          userFullName,
          userEmail,
          projects,
          rawTodaySlots,
          rawTasks,
          activityEvents: deduplicateActivityEvents(activityEvents),
        })
      );
    } catch {
      /* Ignora quota */
    }
  }, [
    isHydrated,
    workspaceName,
    userFullName,
    userEmail,
    projects,
    rawTodaySlots,
    rawTasks,
    activityEvents,
  ]);

  const activeOrReviewProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.status === "active" ||
        p.status === "in_review" ||
        p.status === "in_setup"
    );
  }, [projects]);

  const activeProjectMap = useMemo(() => {
    const map = new Map<string, EditorialProjectModel>();
    for (const proj of activeOrReviewProjects) {
      map.set(proj.id, proj);
    }
    return map;
  }, [activeOrReviewProjects]);

  const todaySlots = useMemo(() => {
    return rawTodaySlots
      .filter((slot) => activeProjectMap.has(slot.projectId))
      .map((slot) => {
        const proj = activeProjectMap.get(slot.projectId)!;
        return {
          ...slot,
          projectName: proj.name,
          workspaceHref: `/dashboard/editorial/${proj.id}`,
        };
      });
  }, [rawTodaySlots, activeProjectMap]);

  const upcoming48hSlots = useMemo(() => {
    return rawUpcomingSlots
      .filter((slot) => activeProjectMap.has(slot.projectId))
      .map((slot) => {
        const proj = activeProjectMap.get(slot.projectId)!;
        return {
          ...slot,
          projectName: proj.name,
          actionHref: `/dashboard/editorial/${proj.id}`,
        };
      });
  }, [rawUpcomingSlots, activeProjectMap]);

  const tasks = useMemo(() => {
    return rawTasks
      .filter((task) => activeProjectMap.has(task.projectId))
      .map((task) => {
        const proj = activeProjectMap.get(task.projectId)!;
        return {
          ...task,
          projectName: proj.name,
          resourceHref: `/dashboard/editorial/${proj.id}`,
        };
      });
  }, [rawTasks, activeProjectMap]);

  const aiSuggestions = useMemo<readonly AISuggestionModel[]>(() => {
    const list: AISuggestionModel[] = [];

    for (const proj of activeOrReviewProjects) {
      const href = `/dashboard/editorial/${proj.id}`;

      if (!proj.hasActiveLineEditorial) {
        list.push({
          id: `ai-line-${proj.id}`,
          typeBadge: "ESTRUTURA ESTRATÉGICA · FUNÇÃO 01",
          projectId: proj.id,
          projectName: proj.name,
          identifiedWhat: `O projeto “${proj.name}” ainda não possui uma Linha Editorial ativa.`,
          whyItMatters: `Concluir a promessa, ICP e pilares de ${proj.niche} permite que a IA gere calendários e roteiros sem soar genérica.`,
          actionLabel: "Concluir Linha Editorial",
          actionHref: `${href}?aba=linha-editorial`,
        });
      } else if (!proj.hasActiveCalendar) {
        list.push({
          id: `ai-cal-${proj.id}`,
          typeBadge: "PLANEJAMENTO · FUNÇÃO 01",
          projectId: proj.id,
          projectName: proj.name,
          identifiedWhat: `A Linha Editorial de “${proj.name}” já está aprovada e pronta para virar agenda.`,
          whyItMatters: `Transformar a estratégia de ${proj.currentObjectiveLabel.toLowerCase()} em um Calendário Editorial distribui os slots semanais dentro da sua capacidade real.`,
          actionLabel: "Criar Calendário Editorial",
          actionHref: `${href}?aba=calendario`,
        });
      } else {
        list.push({
          id: `ai-opt-${proj.id}`,
          typeBadge: "REVISÃO DE CALENDÁRIO & TEMAS",
          projectId: proj.id,
          projectName: proj.name,
          identifiedWhat: `Seu calendário ativo em “${proj.name}” possui oportunidades de temas para a fase “${proj.currentPhaseLabel}”.`,
          whyItMatters: `Reforçar conteúdos de Níveis de Consciência e Transformação acelera o objetivo de ${proj.currentObjectiveLabel.toLowerCase()}.`,
          actionLabel: "Revisar slots e temas",
          actionHref: `${href}?aba=temas`,
        });
      }
    }

    return list.slice(0, 4);
  }, [activeOrReviewProjects]);

  const operationalAlerts = useMemo<readonly OperationalAlertModel[]>(() => {
    const alerts: OperationalAlertModel[] = [];

    for (const proj of activeOrReviewProjects) {
      const href = `/dashboard/editorial/${proj.id}`;

      if (proj.status === "in_review") {
        alerts.push({
          id: `al-rev-${proj.id}`,
          severity: "critical",
          projectId: proj.id,
          projectName: proj.name,
          title: `O período ativo de “${proj.name}” exige revisão estratégica.`,
          description:
            "Valide se o objetivo e a capacidade semanal continuam iguais antes de duplicar o calendário.",
          actionLabel: "Revisar projeto",
          actionHref: href,
        });
      } else if (proj.hasActiveCalendar && proj.draftScriptsCount > 0) {
        alerts.push({
          id: `al-scr-${proj.id}`,
          severity: "warning",
          projectId: proj.id,
          projectName: proj.name,
          title: `${proj.draftScriptsCount} roteiros em rascunho precisam ser aprovados em “${proj.name}”.`,
          description:
            "Finalize os rascunhos pendentes para evitar gargalo de gravação e design nos próximos slots.",
          actionLabel: "Abrir roteiros",
          actionHref: `${href}?aba=roteiros`,
        });
      } else if (proj.status === "in_setup") {
        alerts.push({
          id: `al-set-${proj.id}`,
          severity: "info",
          projectId: proj.id,
          projectName: proj.name,
          title: `Base Estratégica em estruturação em “${proj.name}”.`,
          description:
            "Preencha os dados fundamentais da oferta para desbloquear a Linha Editorial e o Calendário.",
          actionLabel: "Continuar estruturação",
          actionHref: `${href}?aba=linha-editorial`,
        });
      }
    }

    return alerts.slice(0, 3);
  }, [activeOrReviewProjects]);

  const derivedPanelState = useMemo<DerivedPanelState>(() => {
    if (activeOrReviewProjects.length === 0) {
      return "no_projects";
    }

    const hasAnyActiveCalendar = activeOrReviewProjects.some(
      (p) => p.hasActiveCalendar
    );
    if (!hasAnyActiveCalendar) {
      return "no_active_calendar";
    }

    if (todaySlots.length === 0) {
      return "no_slots_today";
    }

    const allSlotsPublished = todaySlots.every((s) => s.status === "published");
    if (allSlotsPublished) {
      return "day_completed";
    }

    return "active_operation";
  }, [activeOrReviewProjects, todaySlots]);

  const topPriorityProject = useMemo<EditorialProjectModel | null>(() => {
    const activeOnes = activeOrReviewProjects.filter(
      (p) => p.status === "active"
    );
    return activeOnes[0] ?? activeOrReviewProjects[0] ?? null;
  }, [activeOrReviewProjects]);

  const appendActivityLog = useCallback(
    (projectName: string, label: string, resourceHref: string) => {
      const newEvent: ProjectActivityLogItem = {
        id: createUniqueId("ev-log"),
        occurredAt: "Agora mesmo",
        projectName,
        label,
        resourceHref,
      };
      setActivityEvents((prev) =>
        deduplicateActivityEvents([newEvent, ...prev])
      );
    },
    []
  );

  const createProject = useCallback(
    (input: CreateProjectInput): EditorialProjectModel => {
      const newProjId = createUniqueId("proj");
      const newProj: EditorialProjectModel = {
        id: newProjId,
        name: input.name.trim(),
        brandOrClientName: input.brandOrClientName.trim() || workspaceName,
        niche: input.niche.trim(),
        subniche: input.subniche.trim() || "Especialidade Principal",
        operationTypeLabel: input.operationTypeLabel,
        currentObjectiveLabel: input.currentObjectiveLabel,
        currentPhaseLabel:
          input.currentPhaseLabel.trim() || "Estruturação Inicial",
        status: "in_setup",
        hasActiveLineEditorial: false,
        lineEditorialStatus: "Pendente — criar Linha Editorial",
        hasActiveCalendar: false,
        calendarStatus: "Aguardando Linha Editorial",
        themesCount: 0,
        allocatedThemesCount: 0,
        approvedScriptsCount: 0,
        draftScriptsCount: 0,
        nextActionLabel: "Construa a Linha Editorial para dar contexto à IA",
        nextActionReason:
          "Projeto recém-criado. O primeiro passo é alimentar a Base Estratégica na Função 01.",
        updatedAtLabel: "Criado agora",
      };

      setProjects((prev) => [newProj, ...prev]);
      appendActivityLog(
        newProj.name,
        `Projeto Editorial “${newProj.name}” criado para o nicho ${newProj.niche}.`,
        `/dashboard/editorial/${newProj.id}`
      );

      return newProj;
    },
    [workspaceName, appendActivityLog]
  );

  const updateProject = useCallback(
    (input: UpdateProjectInput) => {
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== input.id) return proj;
          const radicalChange =
            proj.niche.toLowerCase() !== input.niche.trim().toLowerCase() ||
            proj.currentObjectiveLabel !== input.currentObjectiveLabel;

          return {
            ...proj,
            name: input.name.trim(),
            brandOrClientName: input.brandOrClientName.trim(),
            niche: input.niche.trim(),
            subniche: input.subniche.trim(),
            operationTypeLabel: input.operationTypeLabel,
            currentObjectiveLabel: input.currentObjectiveLabel,
            currentPhaseLabel: input.currentPhaseLabel.trim(),
            status: radicalChange ? "in_review" : input.status,
            lineEditorialStatus: radicalChange
              ? "Revisão recomendada após mudança estratégica"
              : proj.lineEditorialStatus,
            updatedAtLabel: "Atualizado agora",
          };
        })
      );

      appendActivityLog(
        input.name.trim(),
        `Contexto administrativo de “${input.name.trim()}” atualizado (${input.niche} • ${input.currentObjectiveLabel}).`,
        `/dashboard/editorial/${input.id}`
      );
    },
    [appendActivityLog]
  );

  const duplicateProject = useCallback(
    (input: DuplicateProjectInput): EditorialProjectModel | null => {
      const source = projects.find((p) => p.id === input.sourceProjectId);
      if (!source) return null;

      const duplicated: EditorialProjectModel = {
        ...source,
        id: createUniqueId("proj-dup"),
        name: input.newName.trim(),
        status: "in_setup",
        hasActiveLineEditorial: false,
        lineEditorialStatus: input.copyLineEditorial
          ? "Versão rascunho copiada — revisar"
          : "Pendente — criar Linha Editorial",
        hasActiveCalendar: input.copyCalendars,
        calendarStatus: input.copyCalendars
          ? "Calendário copiado — revisar datas"
          : "Pendente — criar Calendário",
        themesCount: input.copyThemes ? source.themesCount : 0,
        allocatedThemesCount: 0,
        approvedScriptsCount: 0,
        draftScriptsCount: input.copyScripts
          ? source.approvedScriptsCount + source.draftScriptsCount
          : 0,
        nextActionLabel: input.copyStrategicBase
          ? "Revisar Base Estratégica copiada e aprovar nova Linha Editorial"
          : "Preencher Base Estratégica para este novo contexto",
        nextActionReason:
          "Projeto duplicado com novo ID isolado. Valide a oferta e o objetivo antes de gerar o calendário.",
        updatedAtLabel: "Duplicado agora",
      };

      setProjects((prev) => [duplicated, ...prev]);
      appendActivityLog(
        duplicated.name,
        `Projeto “${duplicated.name}” duplicado a partir de “${source.name}”.`,
        `/dashboard/editorial/${duplicated.id}`
      );

      return duplicated;
    },
    [projects, appendActivityLog]
  );

  const toggleArchiveProject = useCallback(
    (projectId: string) => {
      const target = projects.find((p) => p.id === projectId);
      if (!target) return;

      const restoring = target.status === "archived";
      const nextStatus: ProjectStatus = restoring ? "active" : "archived";

      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                status: nextStatus,
                updatedAtLabel: restoring
                  ? "Restaurado agora"
                  : "Arquivado agora",
              }
            : proj
        )
      );

      appendActivityLog(
        target.name,
        restoring
          ? `Projeto “${target.name}” restaurado para operação ativa.`
          : `Projeto “${target.name}” arquivado (histórico preservado).`,
        `/dashboard/editorial/${target.id}`
      );
    },
    [projects, appendActivityLog]
  );

  const updateTodaySlotStatus = useCallback(
    (slotId: string, nextStatus: TodaySlotStatus) => {
      const targetSlot = rawTodaySlots.find((s) => s.id === slotId);
      if (!targetSlot) return;

      setRawTodaySlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, status: nextStatus } : slot
        )
      );

      const proj = projects.find((p) => p.id === targetSlot.projectId);
      appendActivityLog(
        proj?.name || "Projeto Editorial",
        `Slot “[${targetSlot.format}] ${targetSlot.title}” atualizado no Painel do Dia.`,
        `/dashboard/editorial/${targetSlot.projectId}`
      );
    },
    [rawTodaySlots, projects, appendActivityLog]
  );

  const addManualTask = useCallback(
    (title: string, projectId: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const proj =
        projects.find((p) => p.id === projectId) ?? activeOrReviewProjects[0];
      if (!proj) return;

      const created: OperationalTaskModel = {
        id: createUniqueId("task-manual"),
        title: trimmed,
        projectId: proj.id,
        dueLabel: "Hoje",
        dueCategory: "today",
        origin: "Manual",
        completed: false,
        resourceLabel: "Tarefa criada no Painel",
      };

      setRawTasks((prev) => [created, ...prev]);
      appendActivityLog(
        proj.name,
        `Nova tarefa manual criada: “${trimmed}”.`,
        `/dashboard/editorial/${proj.id}`
      );
    },
    [projects, activeOrReviewProjects, appendActivityLog]
  );

  const toggleTaskCompleted = useCallback((taskId: string) => {
    setRawTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const removeOrPostponeTask = useCallback(
    (
      taskId: string
    ): { readonly wasPostponed: boolean; readonly message?: string } => {
      const target = rawTasks.find((t) => t.id === taskId);
      if (!target) return { wasPostponed: false };

      if (target.origin === "Automática") {
        setRawTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  dueLabel: "Adiada p/ Amanhã",
                  dueCategory: "upcoming",
                  postponed: true,
                }
              : t
          )
        );
        return {
          wasPostponed: true,
          message:
            "Tarefas automáticas nascem de uma pendência real do calendário. O lembrete foi adiado para amanhã e será concluído automaticamente quando o item for resolvido.",
        };
      }

      setRawTasks((prev) => prev.filter((t) => t.id !== taskId));
      return { wasPostponed: false };
    },
    [rawTasks]
  );

  const contextValue = useMemo<EditorialWorkspaceContextValue>(
    () => ({
      workspaceName,
      userFullName,
      userEmail,
      projects,
      activeOrReviewProjects,
      todaySlots,
      upcoming48hSlots,
      tasks,
      aiSuggestions,
      operationalAlerts,
      activityEvents,
      derivedPanelState,
      topPriorityProject,
      createProject,
      updateProject,
      duplicateProject,
      toggleArchiveProject,
      updateTodaySlotStatus,
      addManualTask,
      toggleTaskCompleted,
      removeOrPostponeTask,
    }),
    [
      workspaceName,
      userFullName,
      userEmail,
      projects,
      activeOrReviewProjects,
      todaySlots,
      upcoming48hSlots,
      tasks,
      aiSuggestions,
      operationalAlerts,
      activityEvents,
      derivedPanelState,
      topPriorityProject,
      createProject,
      updateProject,
      duplicateProject,
      toggleArchiveProject,
      updateTodaySlotStatus,
      addManualTask,
      toggleTaskCompleted,
      removeOrPostponeTask,
    ]
  );

  return (
    <EditorialWorkspaceContext.Provider value={contextValue}>
      {children}
    </EditorialWorkspaceContext.Provider>
  );
}

export function useEditorialWorkspace(): EditorialWorkspaceContextValue {
  const ctx = useContext(EditorialWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useEditorialWorkspace deve ser usado dentro de um EditorialWorkspaceProvider."
    );
  }
  return ctx;
}