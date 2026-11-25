// FrontEnd/src/lib/context/EditorialWorkspaceContext.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { selectIsAuthenticated } from '@/lib/redux/slices/authSlice';
import {
  selectCompanyBrands,
  selectCurrentCompany,
  selectSelectedBrandId,
} from '@/lib/redux/slices/companySlice';
import { editorialService } from '@/lib/services/editorialService';

export type ProjectStatus = 'active' | 'in_setup' | 'in_review' | 'archived';

export type ProjectActivityLogItem = {
  readonly id: string;
  readonly occurredAt: string;
  readonly projectName: string;
  readonly label: string;
  readonly resourceHref: string;
};

export type EditorialProjectModel = {
  readonly id: string;
  readonly companyId?: string;
  readonly brandId?: string;
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
  | 'theme_pending'
  | 'ready_for_script'
  | 'draft'
  | 'script_ready'
  | 'in_production'
  | 'ready_to_publish'
  | 'published'
  | 'missing_asset'
  | 'complementary_pending';

export type TodaySlotModel = {
  readonly id: string;
  readonly calendarId?: string;
  readonly time: string;
  readonly format:
    | 'Stories'
    | 'Reel'
    | 'Carrossel'
    | 'Live'
    | 'Post Estático'
    | 'Vídeo Longo';
  readonly title: string;
  readonly projectId: string;
  readonly retinaType:
    | 'Relacionamento'
    | 'Transformação'
    | 'Autoridade'
    | 'Níveis de Consciência'
    | 'Engajamento'
    | 'Interação';
  readonly status: TodaySlotStatus;
};

export type Upcoming48hSlotModel = {
  readonly id: string;
  readonly calendarId?: string;
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
  readonly dueCategory: 'today' | 'upcoming';
  readonly origin: 'Manual' | 'IA sugerida' | 'Automática';
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
  readonly severity: 'critical' | 'warning' | 'info';
  readonly projectId: string;
  readonly projectName: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionHref: string;
};

export type DerivedPanelState =
  | 'no_projects'
  | 'no_active_calendar'
  | 'no_slots_today'
  | 'day_completed'
  | 'active_operation';

type CreateProjectInput = {
  readonly name: string;
  readonly brandId?: string;
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
  readonly isLoading: boolean;
  readonly isLoadingProjects: boolean;
  readonly refreshWorkspace: () => Promise<void>;
  readonly refreshProjects: () => Promise<void>;
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
  readonly createProject: (
    input: CreateProjectInput,
  ) => Promise<EditorialProjectModel | null>;
  readonly updateProject: (input: UpdateProjectInput) => Promise<void>;
  readonly duplicateProject: (
    input: DuplicateProjectInput,
  ) => Promise<EditorialProjectModel | null>;
  readonly toggleArchiveProject: (projectId: string) => Promise<void>;
  readonly updateTodaySlotStatus: (
    slotId: string,
    nextStatus: TodaySlotStatus,
  ) => Promise<void>;
  readonly addManualTask: (title: string, projectId: string) => Promise<void>;
  readonly toggleTaskCompleted: (taskId: string) => Promise<void>;
  readonly removeOrPostponeTask: (taskId: string) => {
    readonly wasPostponed: boolean;
    readonly message?: string;
  };
};

function createUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function deduplicateActivityEvents(
  items: readonly ProjectActivityLogItem[],
): readonly ProjectActivityLogItem[] {
  const seenIds = new Set<string>();
  const result: ProjectActivityLogItem[] = [];
  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    const prev = result[result.length - 1];
    if (
      prev &&
      prev.projectName === item.projectName &&
      prev.label === item.label
    ) {
      continue;
    }
    seenIds.add(item.id);
    result.push(item);
  }
  return result.slice(0, 30);
}

function mapFormatLabel(raw?: string): TodaySlotModel['format'] {
  const normalized = String(raw || '').toLowerCase();
  if (normalized.includes('story') || normalized.includes('stories'))
    return 'Stories';
  if (normalized.includes('reel')) return 'Reel';
  if (normalized.includes('carrossel') || normalized.includes('carousel'))
    return 'Carrossel';
  if (normalized.includes('live')) return 'Live';
  if (normalized.includes('static') || normalized.includes('estático'))
    return 'Post Estático';
  if (normalized.includes('long')) return 'Vídeo Longo';
  return 'Reel';
}

function mapRetinaLabel(raw?: string): TodaySlotModel['retinaType'] {
  const normalized = String(raw || '').toLowerCase();
  if (normalized.includes('relac')) return 'Relacionamento';
  if (normalized.includes('transf')) return 'Transformação';
  if (normalized.includes('autor')) return 'Autoridade';
  if (normalized.includes('consci')) return 'Níveis de Consciência';
  if (normalized.includes('engaj')) return 'Engajamento';
  if (normalized.includes('inter')) return 'Interação';
  return 'Autoridade';
}

function mapSlotStatus(raw?: string): TodaySlotStatus {
  const allowed: TodaySlotStatus[] = [
    'theme_pending',
    'ready_for_script',
    'draft',
    'script_ready',
    'in_production',
    'ready_to_publish',
    'published',
    'missing_asset',
    'complementary_pending',
  ];
  if (raw && allowed.includes(raw as TodaySlotStatus)) {
    return raw as TodaySlotStatus;
  }
  if (raw === 'planned') return 'theme_pending';
  if (raw === 'recorded') return 'ready_to_publish';
  return 'draft';
}

function mapApiProjectToModel(p: any): EditorialProjectModel {
  const id = String(p.id || p._id || '');
  const rawStatus = String(p.status || 'in_setup');
  let status: ProjectStatus = 'in_setup';
  if (
    rawStatus === 'active' ||
    rawStatus === 'in_setup' ||
    rawStatus === 'in_review' ||
    rawStatus === 'archived'
  ) {
    status = rawStatus;
  } else if (rawStatus === 'draft') {
    status = 'in_setup';
  } else if (rawStatus === 'paused') {
    status = 'in_review';
  }

  return {
    id,
    companyId: p.companyId ? String(p.companyId) : undefined,
    brandId: p.brandId ? String(p.brandId) : undefined,
    name: p.name || 'Projeto sem nome',
    brandOrClientName: p.brandOrClientName || p.name || '',
    niche: p.niche || '',
    subniche: p.subniche || '',
    operationTypeLabel: p.operationTypeLabel || 'Orgânico',
    currentObjectiveLabel:
      p.currentObjectiveLabel || p.currentObjective || 'Posicionamento',
    currentPhaseLabel: p.currentPhaseLabel || 'Estruturação Inicial',
    status,
    hasActiveLineEditorial: Boolean(
      p.hasActiveLineEditorial ?? p.editorialLineStatus === 'active',
    ),
    lineEditorialStatus:
      p.lineEditorialStatus ||
      (p.editorialLineStatus === 'active'
        ? 'Ativa'
        : 'Pendente — criar Linha Editorial'),
    hasActiveCalendar: Boolean(
      p.hasActiveCalendar ?? p.calendarStatus === 'active',
    ),
    calendarStatus:
      p.calendarStatus === 'active'
        ? 'Ativo'
        : p.calendarStatus === 'archived'
          ? 'Arquivado'
          : 'Aguardando Linha Editorial',
    themesCount: Number(p.themesCount || 0),
    allocatedThemesCount: Number(p.allocatedThemesCount || 0),
    approvedScriptsCount: Number(p.approvedScriptsCount || 0),
    draftScriptsCount: Number(p.draftScriptsCount || 0),
    nextActionLabel:
      p.nextActionLabel || 'Continuar configuração do projeto editorial',
    nextActionReason:
      p.nextActionReason ||
      'Mantenha a Linha Editorial, o Calendário e o Banco de Temas sincronizados.',
    updatedAtLabel: p.updatedAtLabel || 'Atualizado recentemente',
  };
}

const EditorialWorkspaceContext =
  createContext<EditorialWorkspaceContextValue | null>(null);

export function EditorialWorkspaceProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const authUser = useSelector((state: RootState) => state.auth?.user);
  const authToken = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userProfile = useSelector((state: RootState) => state.user?.profile);
  const currentCompany = useSelector(selectCurrentCompany);
  const brands = useSelector(selectCompanyBrands);
  const selectedBrandId = useSelector(selectSelectedBrandId);

  const [workspaceName, setWorkspaceName] = useState<string>('Meu Workspace');
  const [userFullName, setUserFullName] = useState<string>('Usuário');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [projects, setProjects] = useState<readonly EditorialProjectModel[]>([]);
  const [rawTodaySlots, setRawTodaySlots] = useState<readonly TodaySlotModel[]>(
    [],
  );
  const [rawUpcomingSlots, setRawUpcomingSlots] = useState<
    readonly Upcoming48hSlotModel[]
  >([]);
  const [rawTasks, setRawTasks] = useState<readonly OperationalTaskModel[]>([]);
  const [serverAiSuggestions, setServerAiSuggestions] = useState<
    readonly AISuggestionModel[]
  >([]);
  const [serverAlerts, setServerAlerts] = useState<
    readonly OperationalAlertModel[]
  >([]);
  const [activityEvents, setActivityEvents] = useState<
    readonly ProjectActivityLogItem[]
  >([]);

  useEffect(() => {
    const resolvedName = userProfile?.name || authUser?.name;
    const resolvedEmail = userProfile?.email || authUser?.email;
    if (currentCompany?.name) {
      setWorkspaceName(currentCompany.name);
    } else if (resolvedName) {
      setWorkspaceName(resolvedName);
    }
    if (resolvedName) {
      setUserFullName(resolvedName);
    }
    if (resolvedEmail) {
      setUserEmail(resolvedEmail);
    }
  }, [
    authUser?.email,
    authUser?.name,
    currentCompany?.name,
    userProfile?.email,
    userProfile?.name,
  ]);

  const refreshWorkspace = useCallback(async () => {
    if (!isAuthenticated || !currentCompany?._id) {
      setProjects([]);
      setRawTodaySlots([]);
      setRawUpcomingSlots([]);
      setRawTasks([]);
      setServerAiSuggestions([]);
      setServerAlerts([]);
      setActivityEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const overview = await editorialService.getWorkspaceOverview(
        selectedBrandId || undefined,
      );
      if (!overview) return;

      const brandMap = new Map(brands.map((b) => [b._id, b.name]));
      const mappedProjects = Array.isArray(overview.projects)
        ? overview.projects.map((p: any) => {
            const base = mapApiProjectToModel(p);
            const resolvedBrandName =
              p.brandOrClientName ||
              (base.brandId ? brandMap.get(base.brandId) : undefined) ||
              currentCompany.name;
            return {
              ...base,
              companyId: base.companyId || currentCompany._id,
              brandOrClientName: resolvedBrandName || base.brandOrClientName,
            };
          })
        : [];
      setProjects(mappedProjects);

      if (Array.isArray(overview.todaySlots)) {
        setRawTodaySlots(
          overview.todaySlots.map((s: any) => ({
            id: String(s.id || ''),
            calendarId: s.calendarId ? String(s.calendarId) : undefined,
            time: String(s.scheduledTime || '12:00'),
            format: mapFormatLabel(s.formatLabel || s.format),
            title: String(
              s.provisionalTitle || s.mainTheme || 'Publicação agendada',
            ),
            projectId: String(s.projectId || ''),
            retinaType: mapRetinaLabel(s.retinaBadge),
            status: mapSlotStatus(s.status),
          })),
        );
      }

      if (Array.isArray(overview.upcoming48hSlots)) {
        setRawUpcomingSlots(
          overview.upcoming48hSlots.map((s: any) => ({
            id: String(s.id || ''),
            calendarId: s.calendarId ? String(s.calendarId) : undefined,
            dayLabel: String(s.date || 'Em 48h'),
            format: String(s.formatLabel || s.format || 'Conteúdo'),
            title: String(
              s.provisionalTitle || s.mainTheme || 'Publicação planejada',
            ),
            projectId: String(s.projectId || ''),
            retinaType: String(s.retinaBadge || 'Autoridade'),
            statusLabel: String(s.status || 'Planejado'),
            actionLabel: 'Abrir no workspace',
          })),
        );
      }

      if (Array.isArray(overview.tasks)) {
        setRawTasks(
          overview.tasks.map((t: any) => ({
            id: String(t.id || t._id || ''),
            title: String(t.title || ''),
            projectId: String(t.projectId || ''),
            dueLabel: String(t.dueLabel || 'Hoje'),
            dueCategory: t.dueCategory === 'upcoming' ? 'upcoming' : 'today',
            origin:
              t.origin === 'IA sugerida' || t.origin === 'Automática'
                ? t.origin
                : 'Manual',
            completed: Boolean(t.completed),
            postponed: Boolean(t.postponed),
            resourceLabel: t.resourceLabel ? String(t.resourceLabel) : undefined,
          })),
        );
      }

      if (Array.isArray(overview.aiSuggestions)) {
        setServerAiSuggestions(overview.aiSuggestions);
      }

      if (Array.isArray(overview.operationalAlerts)) {
        setServerAlerts(
          overview.operationalAlerts.map((a: any) => ({
            id: String(a.id || createUniqueId('alert')),
            severity:
              a.severity === 'urgent' || a.severity === 'critical'
                ? 'critical'
                : a.severity === 'info'
                  ? 'info'
                  : 'warning',
            projectId: String(a.projectId || ''),
            projectName: String(a.projectName || 'Projeto'),
            title: String(a.title || ''),
            description: String(a.description || ''),
            actionLabel: String(a.actionLabel || 'Ver projeto'),
            actionHref: String(a.actionHref || '/dashboard/editorial'),
          })),
        );
      }

      if (Array.isArray(overview.recentActivity)) {
        setActivityEvents(
          deduplicateActivityEvents(
            overview.recentActivity.map((ev: any) => ({
              id: String(ev.id || ev._id || createUniqueId('act')),
              occurredAt: ev.occurredAt
                ? new Date(ev.occurredAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recente',
              projectName: String(ev.projectName || 'Projeto Editorial'),
              label: String(ev.label || ''),
              resourceHref: String(ev.resourceHref || '/dashboard/editorial'),
            })),
          ),
        );
      }
    } catch {
      // Silencia erro antes da sessão autenticar ou se rede oscilar
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    currentCompany?._id,
    currentCompany?.name,
    selectedBrandId,
    brands,
  ]);

  const isLoadingProjects = isLoading;
  const refreshProjects = refreshWorkspace;

  useEffect(() => {
    void refreshWorkspace();
  }, [authToken, authUser?.id, authUser?._id, refreshWorkspace]);

  const activeOrReviewProjects = useMemo(
    () => projects.filter((p) => p.status !== 'archived'),
    [projects],
  );

  const activeProjectMap = useMemo(() => {
    const map = new Map<string, EditorialProjectModel>();
    for (const proj of activeOrReviewProjects) {
      map.set(proj.id, proj);
    }
    return map;
  }, [activeOrReviewProjects]);

  const todaySlots = useMemo(() => {
    return rawTodaySlots
      .filter((slot) => !slot.projectId || activeProjectMap.has(slot.projectId))
      .map((slot) => {
        const proj = activeProjectMap.get(slot.projectId);
        return {
          ...slot,
          projectName: proj?.name || 'Projeto Editorial',
          workspaceHref: proj
            ? `/dashboard/editorial/${proj.id}`
            : '/dashboard/editorial',
        };
      });
  }, [rawTodaySlots, activeProjectMap]);

  const upcoming48hSlots = useMemo(() => {
    return rawUpcomingSlots
      .filter((slot) => !slot.projectId || activeProjectMap.has(slot.projectId))
      .map((slot) => {
        const proj = activeProjectMap.get(slot.projectId);
        return {
          ...slot,
          projectName: proj?.name || 'Projeto Editorial',
          actionHref: proj
            ? `/dashboard/editorial/${proj.id}`
            : '/dashboard/editorial',
        };
      });
  }, [rawUpcomingSlots, activeProjectMap]);

  const tasks = useMemo(() => {
    return rawTasks.map((task) => {
      const proj = activeProjectMap.get(task.projectId);
      return {
        ...task,
        projectName: proj?.name || 'Operação Geral',
        resourceHref: proj
          ? `/dashboard/editorial/${proj.id}`
          : '/dashboard/editorial',
      };
    });
  }, [rawTasks, activeProjectMap]);

  const aiSuggestions = useMemo<readonly AISuggestionModel[]>(() => {
    if (serverAiSuggestions.length > 0) return serverAiSuggestions.slice(0, 4);

    const list: AISuggestionModel[] = [];
    for (const proj of activeOrReviewProjects) {
      const href = `/dashboard/editorial/${proj.id}`;
      if (!proj.hasActiveLineEditorial) {
        list.push({
          id: `ai-line-${proj.id}`,
          typeBadge: 'ESTRUTURA ESTRATÉGICA · FUNÇÃO 01',
          projectId: proj.id,
          projectName: proj.name,
          identifiedWhat: `O projeto “${proj.name}” ainda não possui uma Linha Editorial ativa.`,
          whyItMatters: `Concluir a promessa, ICP e pilares de ${proj.niche} permite que a IA gere calendários e roteiros sem soar genérica.`,
          actionLabel: 'Concluir Linha Editorial',
          actionHref: `${href}?aba=linha-editorial`,
        });
      } else if (!proj.hasActiveCalendar) {
        list.push({
          id: `ai-cal-${proj.id}`,
          typeBadge: 'PLANEJAMENTO · FUNÇÃO 01',
          projectId: proj.id,
          projectName: proj.name,
          identifiedWhat: `A Linha Editorial de “${proj.name}” já está aprovada e pronta para virar agenda.`,
          whyItMatters: `Transformar a estratégia de ${proj.currentObjectiveLabel.toLowerCase()} em um Calendário Editorial distribui os slots semanais dentro da sua capacidade real.`,
          actionLabel: 'Criar Calendário Editorial',
          actionHref: `${href}?aba=calendario`,
        });
      }
    }
    return list.slice(0, 4);
  }, [serverAiSuggestions, activeOrReviewProjects]);

  const operationalAlerts = useMemo<readonly OperationalAlertModel[]>(() => {
    if (serverAlerts.length > 0) return serverAlerts.slice(0, 3);

    const alerts: OperationalAlertModel[] = [];
    for (const proj of activeOrReviewProjects) {
      const href = `/dashboard/editorial/${proj.id}`;
      if (proj.status === 'in_review') {
        alerts.push({
          id: `al-rev-${proj.id}`,
          severity: 'critical',
          projectId: proj.id,
          projectName: proj.name,
          title: `O período ativo de “${proj.name}” exige revisão estratégica.`,
          description:
            'Valide se o objetivo e a capacidade semanal continuam iguais antes de duplicar o calendário.',
          actionLabel: 'Revisar projeto',
          actionHref: href,
        });
      } else if (proj.hasActiveCalendar && proj.draftScriptsCount > 0) {
        alerts.push({
          id: `al-scr-${proj.id}`,
          severity: 'warning',
          projectId: proj.id,
          projectName: proj.name,
          title: `${proj.draftScriptsCount} roteiros em rascunho precisam ser aprovados em “${proj.name}”.`,
          description:
            'Finalize os rascunhos pendentes para evitar gargalo nos próximos slots.',
          actionLabel: 'Abrir roteiros',
          actionHref: `${href}?aba=roteiros`,
        });
      }
    }
    return alerts.slice(0, 3);
  }, [serverAlerts, activeOrReviewProjects]);

  const derivedPanelState = useMemo<DerivedPanelState>(() => {
    if (activeOrReviewProjects.length === 0) return 'no_projects';
    const hasAnyActiveCalendar = activeOrReviewProjects.some(
      (p) => p.hasActiveCalendar,
    );
    if (!hasAnyActiveCalendar) return 'no_active_calendar';
    if (todaySlots.length === 0) return 'no_slots_today';
    const allSlotsPublished = todaySlots.every((s) => s.status === 'published');
    if (allSlotsPublished) return 'day_completed';
    return 'active_operation';
  }, [activeOrReviewProjects, todaySlots]);

  const topPriorityProject = useMemo(() => {
    if (activeOrReviewProjects.length === 0) return null;
    const inReview = activeOrReviewProjects.find(
      (p) => p.status === 'in_review',
    );
    if (inReview) return inReview;
    const inSetup = activeOrReviewProjects.find((p) => p.status === 'in_setup');
    if (inSetup) return inSetup;
    return activeOrReviewProjects[0];
  }, [activeOrReviewProjects]);

  const appendActivityLog = useCallback(
    (projectName: string, label: string, resourceHref: string) => {
      const newEvent: ProjectActivityLogItem = {
        id: createUniqueId('act'),
        occurredAt: 'Agora',
        projectName,
        label,
        resourceHref,
      };
      setActivityEvents((prev) =>
        deduplicateActivityEvents([newEvent, ...prev]),
      );
    },
    [],
  );

  const createProject = useCallback(
    async (
      input: CreateProjectInput,
    ): Promise<EditorialProjectModel | null> => {
      const created = await editorialService.createProject({
        name: input.name.trim(),
        brandId: input.brandId,
        brandOrClientName: input.brandOrClientName.trim() || workspaceName,
        niche: input.niche.trim(),
        subniche: input.subniche.trim() || 'Especialidade Principal',
        operationTypeLabel: input.operationTypeLabel,
        currentObjective: input.currentObjectiveLabel,
        currentPhaseLabel:
          input.currentPhaseLabel.trim() || 'Estruturação Inicial',
        status: 'in_setup',
      } as any);

      const mapped = mapApiProjectToModel(created);
      setProjects((prev) => [mapped, ...prev]);
      appendActivityLog(
        mapped.name,
        `Projeto Editorial “${mapped.name}” criado para o nicho ${mapped.niche}.`,
        `/dashboard/editorial/${mapped.id}`,
      );
      return mapped;
    },
    [workspaceName, appendActivityLog],
  );

  const updateProject = useCallback(
    async (input: UpdateProjectInput) => {
      const updated = await editorialService.updateProject(input.id, {
        name: input.name.trim(),
        brandOrClientName: input.brandOrClientName.trim(),
        niche: input.niche.trim(),
        subniche: input.subniche.trim(),
        operationTypeLabel: input.operationTypeLabel,
        currentObjective: input.currentObjectiveLabel,
        currentPhaseLabel: input.currentPhaseLabel.trim(),
        status: input.status,
      } as any);

      const mapped = mapApiProjectToModel(updated);
      setProjects((prev) =>
        prev.map((proj) => (proj.id === input.id ? mapped : proj)),
      );
      appendActivityLog(
        mapped.name,
        `Contexto de “${mapped.name}” atualizado (${mapped.niche} • ${mapped.currentObjectiveLabel}).`,
        `/dashboard/editorial/${mapped.id}`,
      );
    },
    [appendActivityLog],
  );

  const duplicateProject = useCallback(
    async (
      input: DuplicateProjectInput,
    ): Promise<EditorialProjectModel | null> => {
      const source = projects.find((p) => p.id === input.sourceProjectId);
      const duplicated = await editorialService.duplicateProject(
        input.sourceProjectId,
        {
          newName: input.newName.trim(),
          name: input.newName.trim(),
          includeActiveLine: input.copyLineEditorial,
        },
      );
      const mapped = mapApiProjectToModel(duplicated);
      setProjects((prev) => [mapped, ...prev]);
      appendActivityLog(
        mapped.name,
        `Projeto “${mapped.name}” duplicado a partir de “${source?.name || 'original'}”.`,
        `/dashboard/editorial/${mapped.id}`,
      );
      return mapped;
    },
    [projects, appendActivityLog],
  );

  const toggleArchiveProject = useCallback(
    async (projectId: string) => {
      const target = projects.find((p) => p.id === projectId);
      if (!target) return;

      const restoring = target.status === 'archived';
      const nextStatus: ProjectStatus = restoring ? 'active' : 'archived';

      await editorialService.updateProject(projectId, { status: nextStatus });

      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                status: nextStatus,
                updatedAtLabel: restoring
                  ? 'Restaurado agora'
                  : 'Arquivado agora',
              }
            : proj,
        ),
      );

      appendActivityLog(
        target.name,
        restoring
          ? `Projeto “${target.name}” restaurado para operação ativa.`
          : `Projeto “${target.name}” arquivado (histórico preservado).`,
        `/dashboard/editorial/${target.id}`,
      );
    },
    [projects, appendActivityLog],
  );

  const updateTodaySlotStatus = useCallback(
    async (slotId: string, nextStatus: TodaySlotStatus) => {
      const targetSlot = rawTodaySlots.find((s) => s.id === slotId);
      if (!targetSlot) return;

      setRawTodaySlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, status: nextStatus } : slot,
        ),
      );

      if (targetSlot.calendarId) {
        try {
          const backendStatus =
            nextStatus === 'published'
              ? 'published'
              : nextStatus === 'ready_to_publish'
                ? 'recorded'
                : nextStatus === 'script_ready'
                  ? 'script_ready'
                  : nextStatus === 'in_production'
                    ? 'in_production'
                    : 'planned';
          await editorialService.updateCalendarItem(
            targetSlot.calendarId,
            slotId,
            { status: backendStatus as any },
          );
        } catch {
          // Mantém UI responsiva mesmo se slot for derivado
        }
      }

      const proj = projects.find((p) => p.id === targetSlot.projectId);
      appendActivityLog(
        proj?.name || 'Projeto Editorial',
        `Slot “[${targetSlot.format}] ${targetSlot.title}” atualizado no Painel do Dia.`,
        `/dashboard/editorial/${targetSlot.projectId}`,
      );
    },
    [rawTodaySlots, projects, appendActivityLog],
  );

  const addManualTask = useCallback(
    async (title: string, projectId: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const proj =
        projects.find((p) => p.id === projectId) ?? activeOrReviewProjects[0];

      const created = await editorialService.createTask({
        title: trimmed,
        projectId: proj?.id,
        dueLabel: 'Hoje',
        dueCategory: 'today',
        origin: 'Manual',
        completed: false,
        resourceLabel: 'Tarefa criada no Painel',
      });

      const mapped: OperationalTaskModel = {
        id: String(created.id || created._id || createUniqueId('task')),
        title: created.title,
        projectId: String(created.projectId || proj?.id || ''),
        dueLabel: created.dueLabel || 'Hoje',
        dueCategory: 'today',
        origin: 'Manual',
        completed: Boolean(created.completed),
        resourceLabel: created.resourceLabel,
      };

      setRawTasks((prev) => [mapped, ...prev]);
      appendActivityLog(
        proj?.name || 'Operação Editorial',
        `Nova tarefa manual criada: “${trimmed}”.`,
        proj ? `/dashboard/editorial/${proj.id}` : '/dashboard',
      );
    },
    [projects, activeOrReviewProjects, appendActivityLog],
  );

  const toggleTaskCompleted = useCallback(
    async (taskId: string) => {
      const target = rawTasks.find((t) => t.id === taskId);
      if (!target) return;
      const nextCompleted = !target.completed;
      setRawTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: nextCompleted } : t,
        ),
      );
      try {
        await editorialService.updateTask(taskId, { completed: nextCompleted });
      } catch {
        // Revert handled lazily
      }
    },
    [rawTasks],
  );

  const removeOrPostponeTask = useCallback(
    (
      taskId: string,
    ): { readonly wasPostponed: boolean; readonly message?: string } => {
      const target = rawTasks.find((t) => t.id === taskId);
      if (!target) return { wasPostponed: false };

      if (target.origin === 'Automática') {
        setRawTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  dueLabel: 'Adiada p/ Amanhã',
                  dueCategory: 'upcoming',
                  postponed: true,
                }
              : t,
          ),
        );
        void editorialService.updateTask(taskId, {
          dueLabel: 'Adiada p/ Amanhã',
          dueCategory: 'upcoming',
          postponed: true,
        });
        return {
          wasPostponed: true,
          message:
            'Tarefas automáticas nascem de uma pendência real do calendário. O lembrete foi adiado para amanhã e será concluído automaticamente quando o item for resolvido.',
        };
      }

      setRawTasks((prev) => prev.filter((t) => t.id !== taskId));
      void editorialService.deleteTask(taskId);
      return { wasPostponed: false };
    },
    [rawTasks],
  );

  const contextValue = useMemo<EditorialWorkspaceContextValue>(
    () => ({
      workspaceName,
      userFullName,
      userEmail,
      isLoading,
      refreshWorkspace,
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
      isLoadingProjects,
      refreshProjects,
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
      isLoading,
      refreshWorkspace,
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
      isLoadingProjects,
      refreshProjects,
      createProject,
      updateProject,
      duplicateProject,
      toggleArchiveProject,
      updateTodaySlotStatus,
      addManualTask,
      toggleTaskCompleted,
      removeOrPostponeTask,
    ],
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
      'useEditorialWorkspace deve ser usado dentro de um EditorialWorkspaceProvider.',
    );
  }
  return ctx;
}
