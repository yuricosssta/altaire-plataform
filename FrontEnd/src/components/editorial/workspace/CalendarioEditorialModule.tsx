// FrontEnd/src/components/editorial/workspace/CalendarioEditorialModule.tsx
"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Edit3,
  FileText,
  Filter,
  Layers,
  LayoutGrid,
  Lightbulb,
  List,
  Plus,
  Sparkles,
  Target,
  Video,
  X,
} from "lucide-react";
import { clsx } from "clsx";

export type CalendarLifecycleStatus =
  | "active"
  | "draft"
  | "upcoming"
  | "expired"
  | "review_recommended"
  | "archived";

export type CalendarSlotStatus =
  | "without_theme"
  | "theme_assigned"
  | "script_draft"
  | "script_approved"
  | "in_production"
  | "published"
  | "missing_thumbnail";

export type RetinaCategory =
  | "Relacionamento"
  | "Engajamento"
  | "Transformação"
  | "Interação"
  | "Níveis de Consciência"
  | "Autoridade";

export type ContentFormatLabel =
  | "Vídeo Curto (Reel)"
  | "Carrossel"
  | "Post Estático"
  | "Vídeo Longo (YouTube)"
  | "Live Semanal"
  | "Sequência de Stories";

export type CalendarSlotItem = {
  readonly id: string;
  readonly weekNumber: 1 | 2 | 3 | 4;
  readonly dayOfWeek:
    | "Segunda"
    | "Terça"
    | "Quarta"
    | "Quinta"
    | "Sexta"
    | "Sábado"
    | "Domingo";
  readonly dateLabel: string;
  readonly time: string;
  readonly format: ContentFormatLabel;
  readonly platform: "Instagram" | "YouTube" | "TikTok" | "Multiplataforma";
  readonly retinaType: RetinaCategory;
  readonly pillar: string;
  readonly themeTitle: string | null;
  readonly status: CalendarSlotStatus;
  readonly storiesBlock?: "Manhã" | "Almoço" | "Tarde" | "Noite / Q&A";
  readonly notes?: string;
  readonly eligibleForComplementaryMaterial?: boolean;
};

export type CalendarAIReviewSuggestion = {
  readonly id: string;
  readonly category: "Equilíbrio RETINA" | "Capacidade Real" | "Lacuna de Funil" | "Ativo de Conversão";
  readonly title: string;
  readonly reason: string;
  readonly impact: string;
  readonly applied: boolean;
};

export type EditorialCalendarCycle = {
  readonly id: string;
  readonly name: string;
  readonly status: CalendarLifecycleStatus;
  readonly durationLabel: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly objective: string;
  readonly phaseLabel: string;
  readonly linkedLineVersionName: string;
  readonly capacityConfig: {
    readonly shortVideosPerWeek: number;
    readonly carouselsPerWeek: number;
    readonly staticPostsPerWeek: number;
    readonly longVideosPerWeek: number;
    readonly livesPerWeek: number;
    readonly storiesBlocksPerDay: number;
  };
  readonly updatedAt: string;
  readonly slots: readonly CalendarSlotItem[];
  readonly aiSuggestions: readonly CalendarAIReviewSuggestion[];
};

export type CalendarioEditorialModuleProps = {
  readonly projectId?: string;
  readonly projectName?: string;
  readonly niche?: string;
  readonly subniche?: string;
  readonly currentObjective?: string;
  readonly currentPhase?: string;
  readonly hasActiveLine?: boolean;
  readonly activeLineName?: string;
  readonly onRequestGoToLineEditorial?: () => void;
  readonly onRequestGoToThemes?: (slotId?: string) => void;
  readonly onRequestGoToScripts?: (slotId?: string, themeTitle?: string) => void;
};

const DAYS_OF_WEEK: readonly CalendarSlotItem["dayOfWeek"][] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const RETINA_BADGE_STYLES: Record<RetinaCategory, string> = {
  Transformação:
    "border-la-gold/60 bg-la-gold/15 text-la-gold-light",
  "Níveis de Consciência":
    "border-sky-400/45 bg-sky-500/15 text-sky-200",
  Autoridade:
    "border-purple-400/45 bg-purple-500/15 text-purple-200",
  Relacionamento:
    "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
  Engajamento:
    "border-amber-400/45 bg-amber-500/15 text-amber-200",
  Interação:
    "border-rose-400/45 bg-rose-500/15 text-rose-200",
};

function resolveSlotStatusMeta(status: CalendarSlotStatus): {
  readonly label: string;
  readonly className: string;
  readonly ctaLabel: string;
} {
  switch (status) {
    case "without_theme":
      return {
        label: "Sem tema",
        className: "border-amber-400/50 bg-amber-500/15 text-amber-200",
        ctaLabel: "Vincular Tema",
      };
    case "theme_assigned":
      return {
        label: "Tema definido • Sem roteiro",
        className:
          "border-la-border-gold/60 bg-la-gold-faint text-la-gold-light",
        ctaLabel: "Criar Roteiro",
      };
    case "script_draft":
      return {
        label: "Roteiro em rascunho",
        className: "border-white/20 bg-white/[0.06] text-la-text-primary",
        ctaLabel: "Continuar Roteiro",
      };
    case "script_approved":
      return {
        label: "Roteiro pronto",
        className: "border-la-gold bg-la-gold/20 text-la-gold-light",
        ctaLabel: "Abrir Roteiro",
      };
    case "in_production":
      return {
        label: "Em produção",
        className: "border-sky-400/50 bg-sky-500/15 text-sky-200",
        ctaLabel: "Ver Briefing",
      };
    case "published":
      return {
        label: "Publicado",
        className: "border-emerald-500/45 bg-emerald-950/50 text-emerald-300",
        ctaLabel: "Ver Publicação",
      };
    case "missing_thumbnail":
      return {
        label: "Falta título e capa",
        className: "border-rose-400/50 bg-rose-500/15 text-rose-200",
        ctaLabel: "Criar Capa",
      };
  }
}

function buildInitialCalendars(
  objective: string,
  phase: string,
  lineName: string
): readonly EditorialCalendarCycle[] {
  return [
    {
      id: "cal-cycle-active-01",
      name: "Contagem Regressiva — Lançamento Semente",
      status: "active",
      durationLabel: "4 semanas de aquecimento",
      periodStart: "09/08/2026",
      periodEnd: "05/09/2026",
      objective,
      phaseLabel: phase,
      linkedLineVersionName: lineName,
      capacityConfig: {
        shortVideosPerWeek: 4,
        carouselsPerWeek: 2,
        staticPostsPerWeek: 2,
        longVideosPerWeek: 1,
        livesPerWeek: 1,
        storiesBlocksPerDay: 4,
      },
      updatedAt: "Hoje, 09:40",
      slots: [
        {
          id: "slot-w2-mon-1",
          weekNumber: 2,
          dayOfWeek: "Segunda",
          dateLabel: "17/08",
          time: "08h30",
          format: "Sequência de Stories",
          platform: "Instagram",
          retinaType: "Relacionamento",
          pillar: "04. Aplicação Prática & Bastidores Reais",
          themeTitle:
            "Bastidor da Semana 2: Como separamos ofertas para não confundir a audiência",
          status: "script_approved",
          storiesBlock: "Manhã",
        },
        {
          id: "slot-w2-mon-2",
          weekNumber: 2,
          dayOfWeek: "Segunda",
          dateLabel: "17/08",
          time: "16h00",
          format: "Vídeo Curto (Reel)",
          platform: "Instagram",
          retinaType: "Transformação",
          pillar: "02. Diagnóstico de Erros Invisíveis do ICP",
          themeTitle:
            "O erro invisível que bloqueia sua previsibilidade comercial",
          status: "script_approved",
        },
        {
          id: "slot-w2-tue-1",
          weekNumber: 2,
          dayOfWeek: "Terça",
          dateLabel: "18/08",
          time: "11h00",
          format: "Carrossel",
          platform: "Instagram",
          retinaType: "Níveis de Consciência",
          pillar: "03. Mecanismo Único da Oferta (MUV)",
          themeTitle:
            "5 sinais de uma oferta fraca que afasta compradores qualificados",
          status: "script_draft",
          eligibleForComplementaryMaterial: true,
        },
        {
          id: "slot-w2-tue-2",
          weekNumber: 2,
          dayOfWeek: "Terça",
          dateLabel: "18/08",
          time: "19h30",
          format: "Sequência de Stories",
          platform: "Instagram",
          retinaType: "Interação",
          pillar: "05. Superação de Objeções Prioritárias",
          themeTitle:
            "Q&A Noturno: Quebra da objeção 'Não tenho tempo para produzir'",
          status: "theme_assigned",
          storiesBlock: "Noite / Q&A",
        },
        {
          id: "slot-w2-wed-1",
          weekNumber: 2,
          dayOfWeek: "Quarta",
          dateLabel: "19/08",
          time: "12h00",
          format: "Post Estático",
          platform: "Instagram",
          retinaType: "Autoridade",
          pillar: "01. Visão de Mundo & Quebra de Mitos",
          themeTitle:
            "Mapa Visual: A diferença entre postar por frequência e operar por contexto",
          status: "in_production",
        },
        {
          id: "slot-w2-wed-2",
          weekNumber: 2,
          dayOfWeek: "Quarta",
          dateLabel: "19/08",
          time: "19h00",
          format: "Vídeo Longo (YouTube)",
          platform: "YouTube",
          retinaType: "Autoridade",
          pillar: "03. Mecanismo Único da Oferta (MUV)",
          themeTitle:
            "Arquitetura Completa de Operação Editorial Orientada por Contexto",
          status: "script_approved",
          eligibleForComplementaryMaterial: true,
        },
        {
          id: "slot-w2-thu-1",
          weekNumber: 2,
          dayOfWeek: "Quinta",
          dateLabel: "20/08",
          time: "16h00",
          format: "Vídeo Curto (Reel)",
          platform: "Instagram",
          retinaType: "Transformação",
          pillar: "01. Visão de Mundo & Quebra de Mitos",
          themeTitle:
            "Por que repetir comandos soltos na IA destrói a voz da sua marca",
          status: "theme_assigned",
        },
        {
          id: "slot-w2-thu-2",
          weekNumber: 2,
          dayOfWeek: "Quinta",
          dateLabel: "20/08",
          time: "18h30",
          format: "Carrossel",
          platform: "Instagram",
          retinaType: "Níveis de Consciência",
          pillar: "05. Superação de Objeções Prioritárias",
          themeTitle: null,
          status: "without_theme",
        },
        {
          id: "slot-w2-fri-1",
          weekNumber: 2,
          dayOfWeek: "Sexta",
          dateLabel: "21/08",
          time: "11h30",
          format: "Vídeo Curto (Reel)",
          platform: "Instagram",
          retinaType: "Engajamento",
          pillar: "02. Diagnóstico de Erros Invisíveis do ICP",
          themeTitle: null,
          status: "without_theme",
        },
        {
          id: "slot-w2-fri-2",
          weekNumber: 2,
          dayOfWeek: "Sexta",
          dateLabel: "21/08",
          time: "20h00",
          format: "Live Semanal",
          platform: "Multiplataforma",
          retinaType: "Autoridade",
          pillar: "06. Provas, Estudos de Caso & Chamada Direta",
          themeTitle:
            "Live Semanal #04: Como validar sua oferta no orgânico sem improviso",
          status: "missing_thumbnail",
          eligibleForComplementaryMaterial: true,
        },
        {
          id: "slot-w2-sat-1",
          weekNumber: 2,
          dayOfWeek: "Sábado",
          dateLabel: "22/08",
          time: "14h00",
          format: "Vídeo Curto (Reel)",
          platform: "Instagram",
          retinaType: "Transformação",
          pillar: "04. Aplicação Prática & Bastidores Reais",
          themeTitle: null,
          status: "without_theme",
        },
        {
          id: "slot-w2-sun-1",
          weekNumber: 2,
          dayOfWeek: "Domingo",
          dateLabel: "23/08",
          time: "18h00",
          format: "Post Estático",
          platform: "Instagram",
          retinaType: "Relacionamento",
          pillar: "01. Visão de Mundo & Quebra de Mitos",
          themeTitle: null,
          status: "without_theme",
        },
      ],
      aiSuggestions: [
        {
          id: "rev-sug-01",
          category: "Equilíbrio RETINA",
          title:
            "Aumentar peso de 'Níveis de Consciência' nos slots de Quinta e Sábado",
          reason:
            "O projeto está na Semana 2 de Aquecimento para Conversão, mas há 2 slots abertos sem tema na reta final da semana.",
          impact:
            "Prepara o comprador para entender por que o Mecanismo Único (MUV) resolve a dor melhor que soluções comuns.",
          applied: false,
        },
        {
          id: "rev-sug-02",
          category: "Ativo de Conversão",
          title:
            "Ativar Material Complementar (Checklist PDF) no Carrossel de Terça-feira",
          reason:
            "O slot '5 sinais de uma oferta fraca' foi qualificado pelas regras estratégicas para captação de leads qualificados.",
          impact:
            "Aumenta a retenção e gera lista aquecida antes da Live Semanal de Sexta-feira.",
          applied: false,
        },
        {
          id: "rev-sug-03",
          category: "Lacuna de Funil",
          title:
            "Conectar chamada da Live de Sexta nos blocos de Stories de Quinta à Noite",
          reason:
            "A Live Semanal das 20h00 ainda está sem sequência preparatória de antecipação no dia anterior.",
          impact:
            "Eleva a comparecimento ao vivo e coleta perguntas reais do público para o roteiro da Live.",
          applied: false,
        },
      ],
    },
    {
      id: "cal-cycle-expired-00",
      name: "Ciclo Base — Construção de Posicionamento",
      status: "expired",
      durationLabel: "4 semanas concluídas",
      periodStart: "12/07/2026",
      periodEnd: "08/08/2026",
      objective: "Autoridade e Posicionamento",
      phaseLabel: "Pré-aquecimento",
      linkedLineVersionName: lineName,
      capacityConfig: {
        shortVideosPerWeek: 3,
        carouselsPerWeek: 2,
        staticPostsPerWeek: 1,
        longVideosPerWeek: 1,
        livesPerWeek: 1,
        storiesBlocksPerDay: 3,
      },
      updatedAt: "Encerrado em 08/08/2026",
      slots: [],
      aiSuggestions: [],
    },
  ];
}

export function CalendarioEditorialModule({
  projectName = "Produto X — Lançamento Semente",
  niche = "Finanças",
  subniche = "Algorithmic Trading",
  currentObjective = "Conversão",
  currentPhase = "Aquecimento — Semana 2 de 4",
  hasActiveLine = true,
  activeLineName = "Linha v1 — Lançamento Semente",
  onRequestGoToLineEditorial,
  onRequestGoToThemes,
  onRequestGoToScripts,
}: CalendarioEditorialModuleProps) {
  const [calendars, setCalendars] = useState<readonly EditorialCalendarCycle[]>(
    () => buildInitialCalendars(currentObjective, currentPhase, activeLineName)
  );

  /* Controle se o usuário está na Lista de Calendários ou dentro de um Calendário Aberto */
  const [openedCalendarId, setOpenedCalendarId] = useState<string | null>(
    "cal-cycle-active-01"
  );
  const [activeViewMode, setActiveViewMode] = useState<
    "weekly_grid" | "tactical_list" | "stories_matrix" | "ai_reviews"
  >("weekly_grid");
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | 3 | 4>(2);
  const [formatFilter, setFormatFilter] = useState<string>("all");

  /* Drawer / Modal de Inspeção e Edição de um Slot Específico */
  const [inspectingSlotId, setInspectingSlotId] = useState<string | null>(null);
  const [slotThemeDraft, setSlotThemeDraft] = useState<string>("");

  /* Modal "+ Novo Calendário" Calibrado por Capacidade Real */
  const [isNewCalendarModalOpen, setIsNewCalendarModalOpen] =
    useState<boolean>(false);
  const [newCalName, setNewCalName] = useState<string>("");
  const [newCalDuration, setNewCalDuration] = useState<string>(
    "4 semanas planejadas"
  );
  const [newCalStart, setNewCalStart] = useState<string>("06/09/2026");
  const [newCalEnd, setNewCalEnd] = useState<string>("03/10/2026");
  const [newCalObjective, setNewCalObjective] =
    useState<string>(currentObjective);
  const [capShortVideos, setCapShortVideos] = useState<number>(4);
  const [capCarousels, setCapCarousels] = useState<number>(2);
  const [capStaticPosts, setCapStaticPosts] = useState<number>(2);
  const [capLongVideos, setCapLongVideos] = useState<number>(1);
  const [capLives, setCapLives] = useState<number>(1);
  const [capStoriesBlocks, setCapStoriesBlocks] = useState<number>(4);

  /* Modal "+ Novo Slot" dentro do Calendário Aberto */
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState<boolean>(false);
  const [newSlotDay, setNewSlotDay] =
    useState<CalendarSlotItem["dayOfWeek"]>("Quinta");
  const [newSlotTime, setNewSlotTime] = useState<string>("16h00");
  const [newSlotFormat, setNewSlotFormat] = useState<ContentFormatLabel>(
    "Vídeo Curto (Reel)"
  );
  const [newSlotRetina, setNewSlotRetina] =
    useState<RetinaCategory>("Transformação");
  const [newSlotPillar, setNewSlotPillar] = useState<string>(
    "03. Mecanismo Único da Oferta (MUV)"
  );
  const [newSlotTheme, setNewSlotTheme] = useState<string>("");

  const activeCalendar = useMemo(
    () => calendars.find((c) => c.id === openedCalendarId) ?? null,
    [calendars, openedCalendarId]
  );

  const inspectingSlot = useMemo(() => {
    if (!activeCalendar || !inspectingSlotId) return null;
    return (
      activeCalendar.slots.find((s) => s.id === inspectingSlotId) ?? null
    );
  }, [activeCalendar, inspectingSlotId]);

  /* Métricas derivadas em tempo real do Calendário Aberto */
  const calendarMetrics = useMemo(() => {
    if (!activeCalendar) {
      return {
        totalSlots: 0,
        withoutTheme: 0,
        withThemeNoScript: 0,
        scriptReady: 0,
        pendingReviews: 0,
      };
    }

    const slots = activeCalendar.slots;
    return {
      totalSlots: slots.length,
      withoutTheme: slots.filter((s) => s.status === "without_theme").length,
      withThemeNoScript: slots.filter(
        (s) => s.status === "theme_assigned" || s.status === "script_draft"
      ).length,
      scriptReady: slots.filter(
        (s) =>
          s.status === "script_approved" ||
          s.status === "in_production" ||
          s.status === "published"
      ).length,
      pendingReviews: activeCalendar.aiSuggestions.filter((a) => !a.applied)
        .length,
    };
  }, [activeCalendar]);

  /* SEÇÃO 6.3.4: Estado de Orientação quando não há Linha Editorial Ativa */
  if (!hasActiveLine) {
    return (
      <section className="rounded-la-xl border border-amber-400/40 bg-[#080B12]/95 p-8 text-center shadow-[var(--la-elevation-2)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-la-xl border border-la-gold/60 bg-la-gold-faint text-la-gold">
          <Compass className="h-7 w-7" />
        </div>
        <span className="mt-4 block font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-la-gold-light">
          DEPENDÊNCIA METODOLÓGICA · FUNÇÃO 01
        </span>
        <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary">
          Antes de planejar, defina sua Linha Editorial.
        </h2>
        <p className="mx-auto mt-2 max-w-[42rem] font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
          O calendário deve ser criado apenas a partir de uma Linha Editorial
          ativa, pois sem ela a IA terá menos contexto para definir formatos,
          frequência, objetivos, distribuição RETINA e prioridades do período.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onRequestGoToLineEditorial}
            className="inline-flex min-h-[2.875rem] items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
          >
            <span>Criar Linha Editorial</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  const handleCreateCalendarSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created: EditorialCalendarCycle = {
      id: `cal-${Date.now()}`,
      name:
        newCalName.trim() ||
        `Calendário — ${newCalObjective} (${projectName.split("—")[0]?.trim()})`,
      status: "active",
      durationLabel: newCalDuration,
      periodStart: newCalStart,
      periodEnd: newCalEnd,
      objective: newCalObjective,
      phaseLabel: currentPhase,
      linkedLineVersionName: activeLineName,
      capacityConfig: {
        shortVideosPerWeek: capShortVideos,
        carouselsPerWeek: capCarousels,
        staticPostsPerWeek: capStaticPosts,
        longVideosPerWeek: capLongVideos,
        livesPerWeek: capLives,
        storiesBlocksPerDay: capStoriesBlocks,
      },
      updatedAt: "Criado agora",
      slots: activeCalendar?.slots ?? [],
      aiSuggestions: [],
    };

    setCalendars((prev) => [created, ...prev]);
    setOpenedCalendarId(created.id);
    setIsNewCalendarModalOpen(false);
    setNewCalName("");
  };

  const handleDuplicateExpiredCalendar = (cal: EditorialCalendarCycle) => {
    const duplicated: EditorialCalendarCycle = {
      ...cal,
      id: `cal-dup-${Date.now()}`,
      name: `${cal.name} (Novo Ciclo)`,
      status: "draft",
      periodStart: "06/09/2026",
      periodEnd: "03/10/2026",
      updatedAt: "Duplicado para ajuste agora",
      slots: activeCalendar?.slots ?? [],
    };
    setCalendars((prev) => [duplicated, ...prev]);
    setOpenedCalendarId(duplicated.id);
  };

  const handleAddSlotSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCalendar) return;

    const newSlot: CalendarSlotItem = {
      id: `slot-${Date.now()}`,
      weekNumber: selectedWeek,
      dayOfWeek: newSlotDay,
      dateLabel: "Semana " + selectedWeek,
      time: newSlotTime,
      format: newSlotFormat,
      platform:
        newSlotFormat === "Vídeo Longo (YouTube)" ? "YouTube" : "Instagram",
      retinaType: newSlotRetina,
      pillar: newSlotPillar,
      themeTitle: newSlotTheme.trim() ? newSlotTheme.trim() : null,
      status: newSlotTheme.trim() ? "theme_assigned" : "without_theme",
    };

    setCalendars((prev) =>
      prev.map((c) =>
        c.id === activeCalendar.id
          ? {
              ...c,
              slots: [...c.slots, newSlot],
              updatedAt: "Slot adicionado agora",
            }
          : c
      )
    );
    setNewSlotTheme("");
    setIsAddSlotModalOpen(false);
  };

  const handleSaveSlotInspection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCalendar || !inspectingSlot) return;

    const trimmed = slotThemeDraft.trim();
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === activeCalendar.id
          ? {
              ...c,
              slots: c.slots.map((s) =>
                s.id === inspectingSlot.id
                  ? {
                      ...s,
                      themeTitle: trimmed || null,
                      status:
                        trimmed && s.status === "without_theme"
                          ? "theme_assigned"
                          : !trimmed
                            ? "without_theme"
                            : s.status,
                    }
                  : s
              ),
              updatedAt: "Slot atualizado agora",
            }
          : c
      )
    );
    setInspectingSlotId(null);
  };

  const handleApplyAISuggestion = (suggestionId: string) => {
    if (!activeCalendar) return;
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === activeCalendar.id
          ? {
              ...c,
              aiSuggestions: c.aiSuggestions.map((sug) =>
                sug.id === suggestionId ? { ...sug, applied: true } : sug
              ),
              updatedAt: "Ajuste da IA aplicado agora",
            }
          : c
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO DO MÓDULO DE CALENDÁRIO EDITORIAL (Seção 6.3.1) */}
      <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 shadow-[var(--la-elevation-2)] sm:p-7">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-la-xl border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  FUNÇÃO 01 · PARTE 2 — AGENDA EXECUTÁVEL
                </span>
                <span className="rounded-la-full border border-emerald-500/40 bg-emerald-950/35 px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold text-emerald-300">
                  Linha Ativa: {activeLineName}
                </span>
              </div>
              <h2 className="mt-1 font-la-sans text-[1.5rem] font-semibold text-la-text-primary">
                Calendários Editoriais
              </h2>
              <p className="mt-0.5 font-la-sans text-[0.875rem] text-la-text-secondary">
                Transforme sua Linha Editorial em uma agenda realista de
                conteúdos, formatos, frequência e prioridades.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {openedCalendarId ? (
              <button
                type="button"
                onClick={() => setOpenedCalendarId(null)}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-2 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold/60 hover:text-la-gold-light"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                <span>Ver todos os períodos ({calendars.length})</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setIsNewCalendarModalOpen(true)}
              className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Novo Calendário</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            VISÃO A: LISTA DE PERÍODOS / CALENDÁRIOS DO PROJETO (Seção 6.3.2)
           ================================================================= */}
        {!activeCalendar ? (
          <div className="mt-6 flex flex-col gap-4">
            {calendars.map((cal) => {
              const isExpired = cal.status === "expired";
              const pendingReviews = cal.aiSuggestions.filter(
                (s) => !s.applied
              ).length;

              return (
                <article
                  key={cal.id}
                  className={clsx(
                    "flex flex-col gap-4 rounded-la-xl border p-5 transition-all",
                    cal.status === "active"
                      ? "border-la-gold/65 bg-[#0C101B]/95 shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
                      : "border-white/10 bg-black/45 hover:border-white/25"
                  )}
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-la-lg border border-la-border-gold/50 bg-la-gold-faint text-la-gold">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                            {cal.name}
                          </h3>
                          <span
                            className={clsx(
                              "rounded-la-full px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase",
                              cal.status === "active"
                                ? "bg-la-gold text-la-text-inverse"
                                : cal.status === "expired"
                                  ? "border border-white/15 bg-black/60 text-la-text-muted"
                                  : "border border-la-border-gold/55 bg-la-gold-faint text-la-gold-light"
                            )}
                          >
                            {cal.status === "active"
                              ? "ATIVO"
                              : cal.status === "expired"
                                ? "ENCERRADO"
                                : "RASCUNHO"}
                          </span>
                        </div>

                        <p className="mt-1 font-la-mono text-[0.75rem] text-la-text-secondary">
                          {cal.durationLabel} • {cal.periodStart} →{" "}
                          {cal.periodEnd} • Objetivo:{" "}
                          <strong className="text-la-gold-light">
                            {cal.objective}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {isExpired ? (
                        <button
                          type="button"
                          onClick={() => handleDuplicateExpiredCalendar(cal)}
                          className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Duplicar e ajustar para próximo ciclo</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenedCalendarId(cal.id)}
                          className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                        >
                          <span>Abrir Calendário</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3.5 font-la-mono text-[0.75rem]">
                    <span className="text-la-text-primary">
                      {cal.capacityConfig.shortVideosPerWeek} Reels ·{" "}
                      {cal.capacityConfig.longVideosPerWeek} vídeo longo ·{" "}
                      {cal.capacityConfig.carouselsPerWeek} carrosséis ·{" "}
                      {cal.capacityConfig.staticPostsPerWeek} posts estáticos ·{" "}
                      {cal.capacityConfig.livesPerWeek} live/semana ·{" "}
                      <strong className="text-la-gold-light">
                        {cal.capacityConfig.storiesBlocksPerDay} sequências de
                        stories/dia
                      </strong>
                    </span>

                    <div className="flex items-center gap-3">
                      {pendingReviews > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-2.5 py-0.5 text-[0.6875rem] font-semibold text-la-gold-light">
                          <Sparkles className="h-3 w-3 text-la-gold" />
                          <span>{pendingReviews} sugestões de revisão</span>
                        </span>
                      ) : null}
                      <span className="text-[0.6875rem] text-la-text-muted">
                        {cal.updatedAt}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* =================================================================
              VISÃO B: INFRAESTRUTURA VISUAL DO CALENDÁRIO ABERTO
             ================================================================= */
          <div className="mt-6 flex flex-col gap-6">
            {/* 1. Faixa Resumo do Período Ativo + Termômetro de Capacidade e Status dos Slots */}
            <div className="grid grid-cols-1 gap-4 rounded-la-xl border border-la-border-gold/45 bg-[#0C101B]/95 p-5 lg:grid-cols-12">
              <div className="flex flex-col justify-between gap-2 lg:col-span-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-la-full bg-la-gold px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-bold uppercase text-la-text-inverse">
                    PERÍODO VIGENTE
                  </span>
                  <span className="font-la-mono text-[0.6875rem] text-la-gold-light">
                    {activeCalendar.periodStart} → {activeCalendar.periodEnd}
                  </span>
                </div>

                <h3 className="font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                  {activeCalendar.name}
                </h3>

                <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                  Sustentado por:{" "}
                  <strong className="text-la-text-primary">
                    {activeCalendar.linkedLineVersionName}
                  </strong>{" "}
                  • Objetivo:{" "}
                  <strong className="text-la-gold-light">
                    {activeCalendar.objective}
                  </strong>
                </p>
              </div>

              {/* Indicadores Operacionais do Calendário (Sem métricas de vaidade) */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:col-span-7">
                <div className="rounded-la-lg border border-white/10 bg-black/50 p-3">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Slots da Semana
                  </span>
                  <span className="mt-1 block font-la-sans text-[1.25rem] font-bold text-la-text-primary">
                    {calendarMetrics.totalSlots}
                  </span>
                  <span className="font-la-mono text-[0.625rem] text-emerald-300">
                    Dentro da capacidade
                  </span>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-3">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Slots sem Tema
                  </span>
                  <span className="mt-1 block font-la-sans text-[1.25rem] font-bold text-amber-300">
                    {calendarMetrics.withoutTheme}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRequestGoToThemes?.()}
                    className="font-la-mono text-[0.625rem] text-la-gold-light hover:underline"
                  >
                    Preencher temas →
                  </button>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-3">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Prontos p/ Roteiro
                  </span>
                  <span className="mt-1 block font-la-sans text-[1.25rem] font-bold text-la-gold-light">
                    {calendarMetrics.withThemeNoScript}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRequestGoToScripts?.()}
                    className="font-la-mono text-[0.625rem] text-la-gold-light hover:underline"
                  >
                    Gerar roteiros →
                  </button>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-3">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Roteiros Prontos
                  </span>
                  <span className="mt-1 block font-la-sans text-[1.25rem] font-bold text-emerald-300">
                    {calendarMetrics.scriptReady}
                  </span>
                  <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                    Aprovados p/ gravar
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Barra de Controles da Agenda: Seletor de Semana + Modos de Visualização + "+ Adicionar Slot" */}
            <div className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-black/45 p-3.5 xl:flex-row xl:items-center">
              {/* Seletor das 4 Semanas do Ciclo */}
              <div className="flex flex-wrap items-center gap-1.5">
                {([1, 2, 3, 4] as const).map((wk) => (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => setSelectedWeek(wk)}
                    className={clsx(
                      "rounded-la-md px-3 py-1.5 font-la-mono text-[0.6875rem] font-medium transition-colors",
                      selectedWeek === wk
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "border border-white/8 bg-white/[0.02] text-la-text-secondary hover:text-la-text-primary"
                    )}
                  >
                    Semana 0{wk} {wk === 2 ? "(Atual)" : ""}
                  </button>
                ))}
              </div>

              {/* Alternador de Visão: Grade Semanal | Lista Tática | Matriz de Stories | Revisões IA */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 rounded-la-lg border border-white/10 bg-[#07090F] p-1">
                  {[
                    {
                      id: "weekly_grid" as const,
                      label: "Grade Semanal",
                      icon: LayoutGrid,
                    },
                    {
                      id: "tactical_list" as const,
                      label: "Lista Tática",
                      icon: List,
                    },
                    {
                      id: "stories_matrix" as const,
                      label: "4 Blocos de Stories",
                      icon: Layers,
                    },
                    {
                      id: "ai_reviews" as const,
                      label: `Revisões IA (${calendarMetrics.pendingReviews})`,
                      icon: Sparkles,
                    },
                  ].map((mode) => {
                    const ModeIcon = mode.icon;
                    const active = activeViewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveViewMode(mode.id)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-la-md px-3 py-1.5 font-la-mono text-[0.6875rem] transition-colors",
                          active
                            ? "bg-la-gold font-semibold text-la-text-inverse"
                            : "text-la-text-secondary hover:text-la-text-primary"
                        )}
                      >
                        <ModeIcon className="h-3.5 w-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(true)}
                  className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Slot</span>
                </button>
              </div>
            </div>

            {/* ===============================================================
                SUB-VISÃO 1: GRADE SEMANAL DE SLOTS (SEGUNDA A DOMINGO)
               =============================================================== */}
            {activeViewMode === "weekly_grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
                {DAYS_OF_WEEK.map((dayName) => {
                  const daySlots = activeCalendar.slots.filter(
                    (s) => s.dayOfWeek === dayName
                  );

                  return (
                    <div
                      key={dayName}
                      className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0A0E17]/95 p-3.5"
                    >
                      <div>
                        {/* Cabeçalho do Dia da Semana */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                            {dayName}
                          </span>
                          <span className="rounded-la-full border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light">
                            {daySlots.length} slot(s)
                          </span>
                        </div>

                        {/* Cards de Slot do Dia */}
                        <div className="mt-3 flex flex-col gap-2.5">
                          {daySlots.map((slot) => {
                            const statusMeta = resolveSlotStatusMeta(
                              slot.status
                            );
                            const retinaStyle =
                              RETINA_BADGE_STYLES[slot.retinaType];

                            return (
                              <div
                                key={slot.id}
                                onClick={() => {
                                  setInspectingSlotId(slot.id);
                                  setSlotThemeDraft(slot.themeTitle || "");
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setInspectingSlotId(slot.id);
                                    setSlotThemeDraft(slot.themeTitle || "");
                                  }
                                }}
                                className={clsx(
                                  "group flex cursor-pointer flex-col gap-2 rounded-la-lg border p-3 text-left transition-all",
                                  slot.status === "without_theme"
                                    ? "border-dashed border-amber-400/50 bg-amber-950/10 hover:border-amber-400"
                                    : "border-white/12 bg-black/55 hover:border-la-gold/70"
                                )}
                              >
                                <div className="flex items-center justify-between gap-1 font-la-mono text-[0.625rem]">
                                  <span className="font-semibold text-la-gold-light">
                                    {slot.time}
                                  </span>
                                  <span
                                    className={clsx(
                                      "rounded-la-xs border px-1.5 py-0.5 text-[0.5rem] font-semibold uppercase",
                                      retinaStyle
                                    )}
                                  >
                                    {slot.retinaType}
                                  </span>
                                </div>

                                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-text-primary">
                                  {slot.format}
                                </span>

                                <p
                                  className={clsx(
                                    "line-clamp-3 font-la-sans text-[0.75rem] leading-[1.4]",
                                    slot.themeTitle
                                      ? "font-medium text-la-text-primary"
                                      : "italic text-amber-200/90"
                                  )}
                                >
                                  {slot.themeTitle ||
                                    "Slot reservado — clique para vincular tema estratégico"}
                                </p>

                                <div className="mt-1 flex items-center justify-between border-t border-white/8 pt-2">
                                  <span
                                    className={clsx(
                                      "rounded-la-xs border px-1.5 py-0.5 font-la-mono text-[0.5rem] font-semibold",
                                      statusMeta.className
                                    )}
                                  >
                                    {statusMeta.label}
                                  </span>

                                  <ArrowRight className="h-3 w-3 text-la-gold opacity-75 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setNewSlotDay(dayName);
                          setIsAddSlotModalOpen(true);
                        }}
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-la-md border border-dashed border-white/12 py-1.5 font-la-mono text-[0.625rem] text-la-text-muted transition-colors hover:border-la-border-gold/50 hover:text-la-gold-light"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Slot em {dayName}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* ===============================================================
                SUB-VISÃO 2: LISTA TÁTICA DE EXECUÇÃO DOS SLOTS
               =============================================================== */}
            {activeViewMode === "tactical_list" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-muted">
                    Filtrar por formato:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1">
                    {[
                      "all",
                      "Vídeo Curto (Reel)",
                      "Carrossel",
                      "Post Estático",
                      "Vídeo Longo (YouTube)",
                      "Live Semanal",
                      "Sequência de Stories",
                    ].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormatFilter(fmt)}
                        className={clsx(
                          "rounded-la-xs px-2.5 py-1 font-la-mono text-[0.625rem]",
                          formatFilter === fmt
                            ? "bg-la-gold font-semibold text-la-text-inverse"
                            : "text-la-text-secondary"
                        )}
                      >
                        {fmt === "all" ? "Todos os Formatos" : fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCalendar.slots
                  .filter(
                    (s) => formatFilter === "all" || s.format === formatFilter
                  )
                  .map((slot) => {
                    const statusMeta = resolveSlotStatusMeta(slot.status);
                    return (
                      <div
                        key={slot.id}
                        className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-black/50 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-12 w-20 shrink-0 flex-col items-center justify-center rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint font-la-mono">
                            <span className="text-[0.625rem] font-semibold uppercase text-la-gold-light">
                              {slot.dayOfWeek}
                            </span>
                            <span className="text-[0.75rem] font-bold text-la-text-primary">
                              {slot.time}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.625rem]">
                              <span className="rounded-la-xs border border-white/12 bg-white/[0.04] px-2 py-0.5 font-semibold text-la-text-primary">
                                {slot.format}
                              </span>
                              <span
                                className={clsx(
                                  "rounded-la-xs border px-2 py-0.5 font-semibold",
                                  RETINA_BADGE_STYLES[slot.retinaType]
                                )}
                              >
                                RETINA: {slot.retinaType}
                              </span>
                              <span
                                className={clsx(
                                  "rounded-la-xs border px-2 py-0.5 font-semibold",
                                  statusMeta.className
                                )}
                              >
                                {statusMeta.label}
                              </span>
                              {slot.eligibleForComplementaryMaterial ? (
                                <span className="rounded-la-xs border border-la-border-gold/55 bg-la-gold-faint px-2 py-0.5 text-la-gold-light">
                                  ★ Ativo Complementar Elegível
                                </span>
                              ) : null}
                            </div>

                            <h4 className="mt-1.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                              {slot.themeTitle ||
                                "Slot sem tema definido — aguardando alocação na Biblioteca de Temas"}
                            </h4>

                            <p className="mt-0.5 font-la-mono text-[0.6875rem] text-la-text-secondary">
                              Pilar: {slot.pillar} • Plataforma: {slot.platform}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (slot.status === "without_theme") {
                                onRequestGoToThemes?.(slot.id);
                              } else {
                                onRequestGoToScripts?.(
                                  slot.id,
                                  slot.themeTitle || undefined
                                );
                              }
                            }}
                            className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md bg-la-gold px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                          >
                            <span>{statusMeta.ctaLabel}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInspectingSlotId(slot.id);
                              setSlotThemeDraft(slot.themeTitle || "");
                            }}
                            className="rounded-la-md border border-white/12 bg-white/[0.04] px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-secondary hover:text-la-text-primary"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : null}

            {/* ===============================================================
                SUB-VISÃO 3: MATRIZ DIÁRIA DOS 4 BLOCOS DE STORIES (Seção 5.9.2 e 7.5)
               =============================================================== */}
            {activeViewMode === "stories_matrix" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    block: "Manhã (08h00)",
                    retina: "Relacionamento & Visão de Mundo",
                    objective:
                      "Contextualizar o dia, abrir bastidor real da operação e ativar primeira micro-interação (enquete binária).",
                    deliverable: "6 sequências planejadas na semana • 4 prontas",
                  },
                  {
                    block: "Almoço (12h30)",
                    retina: "Níveis de Consciência & Diagnóstico",
                    objective:
                      "Educar sobre o erro invisível do ICP e contrastar o jeito comum com o mecanismo único da oferta.",
                    deliverable: "5 sequências planejadas na semana • 4 prontas",
                  },
                  {
                    block: "Tarde (16h30)",
                    retina: "Transformação & Prova Prática",
                    objective:
                      "Mostrar estudo de caso, aplicação de cliente ou bastidor técnico que comprova a promessa.",
                    deliverable: "5 sequências planejadas na semana • 3 prontas",
                  },
                  {
                    block: "Noite / Q&A (20h00)",
                    retina: "Interação, Quebra de Objeções & CTA",
                    objective:
                      "Responder caixinha de perguntas estratégica atacando objeções de compra e conduzindo para link/DM.",
                    deliverable: "5 sequências planejadas na semana • 3 prontas",
                  },
                ].map((stBlock) => (
                  <div
                    key={stBlock.block}
                    className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-black/50 p-5"
                  >
                    <div>
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        BLOCO CRONOLÓGICO DIÁRIO
                      </span>
                      <h4 className="mt-1 font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                        {stBlock.block}
                      </h4>
                      <span className="mt-2 inline-block rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                        {stBlock.retina}
                      </span>
                      <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
                        {stBlock.objective}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-3.5">
                      <span className="block font-la-mono text-[0.6875rem] text-la-text-primary">
                        {stBlock.deliverable}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onRequestGoToScripts?.(
                            undefined,
                            `Sequência de Stories — ${stBlock.block}`
                          )
                        }
                        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint py-2 font-la-sans text-[0.75rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                      >
                        <span>Gerar sequência deste bloco</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* ===============================================================
                SUB-VISÃO 4: SUGESTÕES DE REVISÃO DA IA NO CALENDÁRIO
               =============================================================== */}
            {activeViewMode === "ai_reviews" ? (
              <div className="flex flex-col gap-3.5">
                {activeCalendar.aiSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className={clsx(
                      "flex flex-col justify-between gap-4 rounded-la-xl border p-5 lg:flex-row lg:items-center",
                      sug.applied
                        ? "border-emerald-500/40 bg-emerald-950/15"
                        : "border-la-border-gold/50 bg-black/50"
                    )}
                  >
                    <div className="max-w-[46rem]">
                      <div className="flex items-center gap-2">
                        <span className="rounded-la-xs border border-la-border-gold/55 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase text-la-gold-light">
                          {sug.category}
                        </span>
                        {sug.applied ? (
                          <span className="font-la-mono text-[0.625rem] font-semibold text-emerald-300">
                            ✓ Revisão aplicada ao calendário
                          </span>
                        ) : null}
                      </div>

                      <h4 className="mt-2 font-la-sans text-[1rem] font-semibold text-la-text-primary">
                        {sug.title}
                      </h4>
                      <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                        <strong className="text-la-text-primary">
                          Diagnóstico:
                        </strong>{" "}
                        {sug.reason}
                      </p>
                      <p className="mt-0.5 font-la-sans text-[0.8125rem] text-la-gold-light">
                        <strong>Impacto esperado:</strong> {sug.impact}
                      </p>
                    </div>

                    {!sug.applied ? (
                      <button
                        type="button"
                        onClick={() => handleApplyAISuggestion(sug.id)}
                        className="inline-flex min-h-[2.5rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                      >
                        <Check className="h-4 w-4" />
                        <span>Aplicar ajuste no calendário</span>
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {/* 3. FAIXA DE CONTINUIDADE DO CALENDÁRIO PARA TEMAS (Seção 6.5.7) */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-la-xl border border-la-border-gold/45 bg-la-gold-faint p-5 sm:flex-row sm:items-center">
              <div>
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  CONTINUIDADE DO MÉTODO · FUNÇÃO 01 → FUNÇÃO 02
                </span>
                <p className="mt-1 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                  Seu calendário possui {calendarMetrics.withoutTheme} slots
                  aguardando pauta. Gere e conecte temas estratégicos para
                  preencher cada slot com a dor, desejo, objeção ou objetivo
                  correto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRequestGoToThemes?.()}
                className="inline-flex min-h-[2.625rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
              >
                <span>Ir para Temas ({calendarMetrics.withoutTheme} abertos)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          MODAL 1: INSPEÇÃO E EDIÇÃO DETALHADA DO SLOT DO CALENDÁRIO
         ===================================================================== */}
      <AnimatePresence>
        {inspectingSlot ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingSlotId(null)}
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
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                    SLOT DO CALENDÁRIO · {inspectingSlot.dayOfWeek},{" "}
                    {inspectingSlot.time}
                  </span>
                  <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {inspectingSlot.format} ({inspectingSlot.platform})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingSlotId(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleSaveSlotInspection}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-2.5 rounded-la-lg border border-white/10 bg-black/50 p-3.5 font-la-mono text-[0.6875rem]">
                  <div>
                    <span className="block text-[0.5625rem] uppercase text-la-text-muted">
                      Classificação RETINA
                    </span>
                    <span className="font-semibold text-la-gold-light">
                      {inspectingSlot.retinaType}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[0.5625rem] uppercase text-la-text-muted">
                      Status Atual
                    </span>
                    <span className="font-semibold text-la-text-primary">
                      {resolveSlotStatusMeta(inspectingSlot.status).label}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-white/8 pt-2">
                    <span className="block text-[0.5625rem] uppercase text-la-text-muted">
                      Pilar Editorial Sustentado
                    </span>
                    <span className="text-la-text-primary">
                      {inspectingSlot.pillar}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Tema Estratégico Conectado ao Slot
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Defina ou conecte um tema da Biblioteca Estratégica..."
                    value={slotThemeDraft}
                    onChange={(e) => setSlotThemeDraft(e.target.value)}
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.875rem] text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingSlotId(null);
                        onRequestGoToThemes?.(inspectingSlot.id);
                      }}
                      className="rounded-la-md border border-white/14 bg-white/[0.04] px-3 py-2 font-la-mono text-[0.6875rem] text-la-gold-light hover:border-la-border-gold"
                    >
                      Escolher da Biblioteca de Temas
                    </button>

                    {slotThemeDraft.trim() ? (
                      <button
                        type="button"
                        onClick={() => {
                          const themeToSend = slotThemeDraft.trim();
                          setInspectingSlotId(null);
                          onRequestGoToScripts?.(
                            inspectingSlot.id,
                            themeToSend
                          );
                        }}
                        className="rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3 py-2 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light"
                      >
                        Transformar em Roteiro →
                      </button>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Salvar Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* =====================================================================
          MODAL 2: ADICIONAR NOVO SLOT AO CALENDÁRIO ATIVO
         ===================================================================== */}
      <AnimatePresence>
        {isAddSlotModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddSlotModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[34rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                Adicionar Slot de Conteúdo — Semana 0{selectedWeek}
              </h3>

              <form
                onSubmit={handleAddSlotSubmit}
                className="mt-4 flex flex-col gap-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Dia da Semana
                    </label>
                    <select
                      value={newSlotDay}
                      onChange={(e) =>
                        setNewSlotDay(
                          e.target.value as CalendarSlotItem["dayOfWeek"]
                        )
                      }
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F18] px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d} className="bg-[#090C14]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Horário Sugerido
                    </label>
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Formato
                    </label>
                    <select
                      value={newSlotFormat}
                      onChange={(e) =>
                        setNewSlotFormat(e.target.value as ContentFormatLabel)
                      }
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F18] px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    >
                      {[
                        "Vídeo Curto (Reel)",
                        "Carrossel",
                        "Post Estático",
                        "Vídeo Longo (YouTube)",
                        "Live Semanal",
                        "Sequência de Stories",
                      ].map((f) => (
                        <option key={f} value={f} className="bg-[#090C14]">
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Objetivo RETINA
                    </label>
                    <select
                      value={newSlotRetina}
                      onChange={(e) =>
                        setNewSlotRetina(e.target.value as RetinaCategory)
                      }
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F18] px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    >
                      {[
                        "Transformação",
                        "Níveis de Consciência",
                        "Autoridade",
                        "Relacionamento",
                        "Engajamento",
                        "Interação",
                      ].map((r) => (
                        <option key={r} value={r} className="bg-[#090C14]">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Tema Inicial (Opcional — pode ser vinculado depois)
                  </label>
                  <input
                    type="text"
                    placeholder="Deixe em branco para alocar na aba Temas..."
                    value={newSlotTheme}
                    onChange={(e) => setNewSlotTheme(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddSlotModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    Criar Slot na Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* =====================================================================
          MODAL 3: NOVO CALENDÁRIO CALIBRADO POR CAPACIDADE REAL (Seção 6.3.1)
         ===================================================================== */}
      <AnimatePresence>
        {isNewCalendarModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewCalendarModalOpen(false)}
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
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                    PLANEJAMENTO BASEADO EM CAPACIDADE REAL
                  </span>
                  <h3 className="font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Novo Calendário Editorial
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewCalendarModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleCreateCalendarSubmit}
                className="mt-4 flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Nome do Período / Calendário *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Ciclo de Conversão — Outubro"
                    value={newCalName}
                    onChange={(e) => setNewCalName(e.target.value)}
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Início
                    </label>
                    <input
                      type="text"
                      value={newCalStart}
                      onChange={(e) => setNewCalStart(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Término
                    </label>
                    <input
                      type="text"
                      value={newCalEnd}
                      onChange={(e) => setNewCalEnd(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Objetivo do Ciclo
                    </label>
                    <input
                      type="text"
                      value={newCalObjective}
                      onChange={(e) => setNewCalObjective(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 py-1.5 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                  <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Capacidade Real de Produção Semanal
                  </span>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {[
                      {
                        label: "Reels / sem",
                        val: capShortVideos,
                        setter: setCapShortVideos,
                      },
                      {
                        label: "Carrosséis / sem",
                        val: capCarousels,
                        setter: setCapCarousels,
                      },
                      {
                        label: "Posts Estáticos",
                        val: capStaticPosts,
                        setter: setCapStaticPosts,
                      },
                      {
                        label: "Vídeo Longo",
                        val: capLongVideos,
                        setter: setCapLongVideos,
                      },
                      {
                        label: "Lives / sem",
                        val: capLives,
                        setter: setCapLives,
                      },
                      {
                        label: "Blocos Stories/dia",
                        val: capStoriesBlocks,
                        setter: setCapStoriesBlocks,
                      },
                    ].map((capItem) => (
                      <div
                        key={capItem.label}
                        className="flex items-center justify-between rounded-la-md border border-white/8 bg-white/[0.02] px-2.5 py-1.5 font-la-mono text-[0.6875rem]"
                      >
                        <span className="text-la-text-secondary">
                          {capItem.label}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={14}
                          value={capItem.val}
                          onChange={(e) =>
                            capItem.setter(Number(e.target.value) || 0)
                          }
                          className="w-11 rounded-la-xs border border-white/15 bg-black/70 px-1.5 py-0.5 text-center text-la-gold-light"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewCalendarModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Gerar Calendário Executável
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

export default CalendarioEditorialModule;