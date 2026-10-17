// FrontEnd/src/components/landing/EvidenceSection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileCheck2,
  GitBranchPlus,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type DocumentedEvidenceItem,
  type EvidenceCard as EvidenceCriteriaItem,
  type EvidenceCategory,
  type EvidenceMode,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STRATEGIC_LINE_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type EvidenceSectionProps = {
  readonly content?: LandingContent["evidence"];
  readonly mode?: EvidenceMode;
  readonly className?: string;
};

const MONITORING_CYCLE_MS = 5200;

const EVIDENCE_CATEGORY_LABELS: Readonly<Record<EvidenceCategory, string>> = {
  experience: "Relato de Experiência",
  "usage-data": "Dado Operacional de Uso",
  "business-result": "Resultado Mensurado com Contexto",
};

type CriterionProtocolDetail = {
  readonly code: "01" | "02" | "03";
  readonly shortLabel: string;
  readonly observedScope: string;
  readonly modulesInvolved: readonly string[];
  readonly documentationGoal: string;
};

const CRITERION_PROTOCOL_DETAILS: readonly CriterionProtocolDetail[] = [
  {
    code: "01",
    shortLabel: "Base & Direção",
    observedScope:
      "Estruturação inicial do Projeto Editorial com foco em oferta, público comprador, posicionamento e objetivos do período.",
    modulesInvolved: [
      "Projeto Editorial",
      "Base Estratégica",
      "Oferta & Público",
      "Objetivos de Comunicação",
    ],
    documentationGoal:
      "Documentar a clareza de contexto antes e depois da configuração da Base Estratégica.",
  },
  {
    code: "02",
    shortLabel: "Fluxo Conectado",
    observedScope:
      "Continuidade prática entre Linha Editorial, Calendário, Biblioteca de Temas e Roteiros dentro da rotina real.",
    modulesInvolved: [
      "Linha Editorial",
      "Calendário Editorial",
      "Temas & Ângulos",
      "Roteiros & Ativos",
    ],
    documentationGoal:
      "Observar como os módulos conectados reduzem dispersão na organização da produção e do funil.",
  },
  {
    code: "03",
    shortLabel: "Registro Real",
    observedScope:
      "Evolução operacional ao longo do uso real, registrando ajustes de rota, formatos utilizados e aprendizados práticos.",
    modulesInvolved: [
      "Histórico do Projeto",
      "Versões e Ajustes",
      "Contexto de Uso",
      "Identificação Autorizada",
    ],
    documentationGoal:
      "Consolidar relatos e dados verificáveis seguindo a estrutura Desafio → Uso → Mudança → Resultado → Identificação.",
  },
] as const;

/**
 * Card de critério de acompanhamento (Estado Inicial `monitoring`).
 * - Sem duplicação do título no topo (`CRITÉRIO 01`, `02`, `03` no badge e `card.title` apenas no `<h3>`).
 * - Possui Spotlight radial dourado acompanhando o ponteiro do mouse e sincroniza com o palco 3D.
 * - Não possui aspas, estrelas ou aparência de depoimento fictício.
 */
export function EvidenceCriteriaCard({
  card,
  index,
  isSelected = false,
  isPaused = false,
  onSelect,
}: {
  readonly card: EvidenceCriteriaItem;
  readonly index: number;
  readonly isSelected?: boolean;
  readonly isPaused?: boolean;
  readonly onSelect?: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 180,
    y: 140,
    opacity: 0,
  });

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !cardRef.current) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlight({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const resolveCriteriaIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return Compass;
      case 1:
        return GitBranchPlus;
      default:
        return ClipboardList;
    }
  };

  const IconComponent = resolveCriteriaIcon(index);
  const criterionCode = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-la-xl border p-5 transition-all duration-200 sm:p-6",
        isSelected
          ? "border-la-gold/75 bg-[#10131C]/95 shadow-[0_0_28px_rgba(207,169,101,0.14)]"
          : "border-white/10 bg-la-surface-1/85 hover:border-white/25 hover:bg-la-surface-2/65"
      )}
    >
      {/* Spotlight Radial Dourado seguindo o cursor */}
      <div
        aria-hidden="true"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(360px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.13), transparent 65%)`,
        }}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
      />

      {/* Véu Dourado Translúcido de Progresso no Card Ativo */}
      {isSelected && !shouldReduceMotion && !isPaused ? (
        <motion.div
          key={`evidence-card-sweep-${criterionCode}`}
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: MONITORING_CYCLE_MS / 1000,
            ease: "linear",
          }}
          style={{
            background:
              "linear-gradient(90deg, rgba(207, 169, 101, 0.03) 0%, rgba(207, 169, 101, 0.12) 100%)",
            boxShadow: "inset 0 -2px 0 0 rgba(207, 169, 101, 0.9)",
          }}
          className="pointer-events-none absolute inset-0 z-0 origin-left"
        />
      ) : null}

      <div className="relative z-10">
        {/* Topo do Card: Número + Identificação Técnica Única (Sem repetir card.title!) */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className={clsx(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold transition-colors",
                isSelected
                  ? "border-la-gold bg-la-gold text-la-text-inverse"
                  : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
              )}
            >
              {criterionCode}
            </span>
            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Critério de acompanhamento {criterionCode}
            </span>
          </div>

          <span
            aria-hidden="true"
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-la-sm border transition-colors",
              isSelected
                ? "border-la-gold/60 bg-la-gold-faint text-la-gold"
                : "border-white/10 bg-black/50 text-la-gold/80"
            )}
          >
            <IconComponent className="h-4 w-4" />
          </span>
        </div>

        {/* Título Canônico Único (`card.title` — §12: ESTRATÉGIA MAIS CLARA | PRODUÇÃO MAIS CONECTADA | APRENDIZADOS DOCUMENTADOS) */}
        <h3 className="mt-4 text-balance font-la-sans text-[1.125rem] font-semibold leading-[1.3] text-la-text-primary sm:text-[1.25rem]">
          {card.title}
        </h3>

        {/* Descrição Canônica Justificada (`card.description`) */}
        <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
          {card.description}
        </p>
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/10 pt-3 font-la-mono text-[0.6875rem]">
        <span className="text-la-text-muted">Frente em acompanhamento</span>
        <span
          className={clsx(
            "font-semibold transition-colors",
            isSelected ? "text-la-gold-light" : "text-la-text-secondary"
          )}
        >
          {isSelected ? "Em inspeção ↑" : "Inspecionar →"}
        </span>
      </div>
    </article>
  );
}

/**
 * Estado Inicial Oficial: `monitoring` (Etapa 2D §4.11 & CONTENT-LANDING.md §12).
 * Exibe o Palco 3D/2.5D de Acompanhamento Documental e os 3 critérios canônicos.
 */
export function EvidenceMonitoringState({
  content,
}: {
  readonly content: LandingContent["evidence"];
}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 420,
    y: 200,
    opacity: 0,
  });

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const cards = content.cards ?? [];

  /* Autociclo de 5.2s pelos 3 critérios que pausa imediatamente ao passar o mouse */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || cards.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, MONITORING_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, cards.length]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageContainerRef.current) {
      return;
    }

    const rect = stageContainerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normalizedX = mouseX / rect.width - 0.5;
    const normalizedY = mouseY / rect.height - 0.5;

    setTilt({
      rotateX: Number((-normalizedY * 4.2).toFixed(2)),
      rotateY: Number((normalizedX * 5.2).toFixed(2)),
    });

    setSpotlight({
      x: Math.round(mouseX),
      y: Math.round(mouseY),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const revealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const staggerContainerVariants = selectMotionPreset(
    shouldReduceMotion,
    STAGGER_CONTAINER_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const staggerItemVariants = selectMotionPreset(
    shouldReduceMotion,
    STAGGER_ITEM_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const lineVariants = selectMotionPreset(
    shouldReduceMotion,
    STRATEGIC_LINE_VARIANTS,
    REDUCED_MOTION_VARIANTS.strategicLine
  );

  const sceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const activeCard = cards[activeIndex] ?? cards[0];
  const activeProtocol =
    CRITERION_PROTOCOL_DETAILS[activeIndex] ?? CRITERION_PROTOCOL_DETAILS[0];

  const requiredFutureNodes = (
    content.futureState.requiredStructure ||
    "Desafio → Uso → Mudança → Resultado → Identificação."
  )
    .replace(/\.$/, "")
    .split("→")
    .map((node) => node.trim())
    .filter(Boolean);

  return (
    <div
      className="flex flex-col gap-8 lg:gap-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Palco 3D/2.5D Interativo do Protocolo de Acompanhamento */}
      <motion.div
        ref={stageContainerRef}
        initial="hidden"
        whileInView="visible"
        viewport={MOTION_VIEWPORT}
        variants={revealVariants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1400px" }}
        className="relative w-full select-none"
      >
        {/* Glow Radial Dourado Sutil atrás do Palco */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_55%_30%,rgba(207,169,101,0.14)_0%,rgba(207,169,101,0.03)_45%,transparent_75%)] blur-2xl"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? { rotateX: 0, rotateY: 0 }
              : {
                  rotateX: tilt.rotateX,
                  rotateY: tilt.rotateY,
                }
          }
          transition={{
            type: "tween",
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.10)] backdrop-blur-xl"
        >
          {/* Blur Dourado (Spotlight Radial) seguindo o cursor */}
          <div
            aria-hidden="true"
            style={{
              opacity: spotlight.opacity,
              background: `radial-gradient(480px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
            }}
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          />

          {/* Hairline luminosa superior dourada */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          {/* TopBar do Palco com Rótulo Canônico (`content.modeLabel`) e Abas FLIP (`layoutId`) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div aria-hidden="true" className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-la-full bg-white/15" />
                <span className="h-2 w-2 rounded-la-full bg-white/15" />
                <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
              </div>
              <ShieldCheck
                aria-hidden="true"
                className="ml-1 h-4 w-4 shrink-0 text-la-gold"
              />
              <span className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                {content.modeLabel}
              </span>
            </div>

            {/* Seletor Rápido dos 3 Critérios Canônicos */}
            <div
              aria-label="Selecionar frente de acompanhamento"
              className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
            >
              {cards.map((cardItem, idx) => {
                const isTabSelected = activeIndex === idx;
                const code = String(idx + 1).padStart(2, "0");
                const detail =
                  CRITERION_PROTOCOL_DETAILS[idx] ??
                  CRITERION_PROTOCOL_DETAILS[0];

                return (
                  <button
                    key={cardItem.id}
                    type="button"
                    aria-pressed={isTabSelected}
                    onClick={() => setActiveIndex(idx)}
                    className={clsx(
                      "relative rounded-la-sm px-2.5 py-1 font-la-mono text-[0.6875rem] font-medium transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                      isTabSelected
                        ? "font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:text-la-text-primary"
                    )}
                  >
                    {isTabSelected ? (
                      <motion.span
                        layoutId="evidence-monitoring-active-tab"
                        transition={{
                          type: "tween",
                          duration: 0.26,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                      />
                    ) : null}
                    <span className="relative z-10">
                      {code} · {detail.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trilha Documental Progressiva (Primeiros projetos -> Acompanhamento -> Documentação -> Prova verificada) */}
          <div className="relative z-10 border-b border-white/10 bg-black/40 px-4 py-4 sm:px-6">
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 800 8"
                preserveAspectRatio="none"
                className="pointer-events-none absolute top-1/2 right-10 left-10 hidden h-2 w-[calc(100%-5rem)] -translate-y-1/2 md:block"
              >
                <line
                  x1="0"
                  y1="4"
                  x2="800"
                  y2="4"
                  stroke="rgba(245, 242, 235, 0.1)"
                  strokeWidth="1.5"
                />
                <motion.line
                  x1="0"
                  y1="4"
                  x2="520"
                  y2="4"
                  stroke="#CFA965"
                  strokeWidth="2"
                  variants={lineVariants}
                />
              </svg>

              <ol
                aria-label="Etapas do protocolo de acompanhamento e documentação"
                className="relative grid grid-cols-1 gap-3 md:grid-cols-4"
              >
                {content.progressionSteps.map((stepLabel, idx) => {
                  const isFutureDestination =
                    idx === content.progressionSteps.length - 1;
                  const isCurrentStage = idx === 0 || idx === 1;
                  const stepNumber = String(idx + 1).padStart(2, "0");

                  return (
                    <li
                      key={stepLabel}
                      className={clsx(
                        "relative flex items-center justify-between gap-2 rounded-la-lg border px-3.5 py-2.5",
                        isCurrentStage
                          ? "border-la-border-gold/60 bg-la-surface-2/95 text-la-text-primary shadow-[0_0_16px_rgba(207,169,101,0.12)]"
                          : isFutureDestination
                            ? "border-dashed border-white/12 bg-black/55 text-la-text-muted"
                            : "border-white/12 bg-black/45 text-la-text-secondary"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={clsx(
                            "font-la-mono text-[0.6875rem] font-semibold",
                            isCurrentStage
                              ? "text-la-gold-light"
                              : "text-la-text-muted"
                          )}
                        >
                          {stepNumber}
                        </span>
                        <span className="font-la-sans text-[0.8125rem] font-medium">
                          {stepLabel}
                        </span>
                      </div>

                      <span
                        className={clsx(
                          "rounded-la-full px-2 py-0.5 font-la-mono text-[0.5625rem] uppercase tracking-[0.06em]",
                          isCurrentStage
                            ? "border border-la-border-gold/50 bg-la-gold-faint text-la-gold-light"
                            : "text-la-text-muted"
                        )}
                      >
                        {isCurrentStage
                          ? "Ativo"
                          : isFutureDestination
                            ? "Futuro"
                            : "Próximo"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Corpo do Palco 3D: Inspeção do Critério em Foco (8 cols) + Câmara Orbital 3D (4 cols) */}
          {activeCard ? (
            <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard.id}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={sceneVariants}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-la-xs border border-la-gold bg-la-gold font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse">
                          {activeProtocol.code}
                        </span>
                        <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                          {activeCard.title}
                        </h3>
                      </div>

                      <span className="rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-3 py-0.5 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
                        Critério de acompanhamento {activeProtocol.code}
                      </span>
                    </div>

                    <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-primary">
                      {activeCard.description}
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-la-lg border border-white/10 bg-white/[0.025] p-3.5">
                        <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          Escopo observado no projeto
                        </span>
                        <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                          {activeProtocol.observedScope}
                        </p>
                      </div>

                      <div className="rounded-la-lg border border-white/10 bg-white/[0.025] p-3.5">
                        <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          Camadas acompanhadas
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activeProtocol.modulesInvolved.map((mod) => (
                            <span
                              key={mod}
                              className="inline-flex items-center gap-1 rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 font-la-sans text-[0.75rem] text-la-text-primary"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="h-3 w-3 text-la-gold"
                              />
                              <span>{mod}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Direita do Palco (4 cols): Câmara Orbital 3D de Acompanhamento Girando no Próprio Eixo */}
              <div
                aria-hidden="true"
                className="relative flex h-[11.5rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_62%,#040508_100%)] lg:col-span-4"
                style={{ perspective: "900px" }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />

                <motion.div
                  animate={
                    shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: 360 }
                  }
                  transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute h-32 w-32 rounded-la-full border border-dashed border-la-gold/35"
                />

                <motion.div
                  animate={
                    shouldReduceMotion
                      ? { rotateX: 60, rotateZ: 0 }
                      : { rotateX: 60, rotateZ: -360 }
                  }
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-white/15 shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                />

                <motion.div
                  animate={
                    shouldReduceMotion
                      ? { rotateX: 24, rotateY: -28, rotateZ: 0 }
                      : {
                          rotateX: [22, 30, 22],
                          rotateY: [-28, 28, -28],
                          rotateZ: [-3, 3, -3],
                        }
                  }
                  transition={{
                    duration: 8.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative flex h-24 w-24 items-center justify-center"
                >
                  {CRITERION_PROTOCOL_DETAILS.map((layer, layerIdx) => {
                    const isLayerActive = activeIndex === layerIdx;
                    const zBase =
                      layerIdx === 2 ? 24 : layerIdx === 1 ? 0 : -22;
                    const zActive =
                      layerIdx === 2 ? 32 : layerIdx === 1 ? 8 : -16;

                    return (
                      <motion.div
                        key={layer.code}
                        animate={{
                          translateZ: isLayerActive ? zActive : zBase,
                          scale: isLayerActive ? 1.07 : 0.95,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={clsx(
                          "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors duration-300",
                          isLayerActive
                            ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.4)]"
                            : "border-white/15 bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-la-mono text-[0.48rem] font-semibold uppercase text-la-gold-light">
                            {layer.code} · {layer.shortLabel}
                          </span>
                          <Sparkles className="h-2.5 w-2.5 shrink-0 text-la-gold" />
                        </div>
                        <div className="h-1 w-2/3 rounded-la-full bg-la-gold/75" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          ) : null}

          {/* Rodapé do Palco: Estrutura Obrigatória para Futura Publicação (`content.futureState.requiredStructure`) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/55 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-2">
              <FileCheck2 aria-hidden="true" className="h-4 w-4 text-la-gold" />
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary">
                Estrutura futura exigida para publicação:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-la-mono text-[0.6875rem]">
              {requiredFutureNodes.map((node, idx) => (
                <span key={node} className="inline-flex items-center gap-1.5">
                  <span
                    className={clsx(
                      "rounded-la-xs border px-2 py-0.5",
                      idx === requiredFutureNodes.length - 1
                        ? "border-la-border-gold bg-la-gold-faint font-semibold text-la-gold-light"
                        : "border-white/10 bg-white/[0.03] text-la-text-primary"
                    )}
                  >
                    {node}
                  </span>
                  {idx < requiredFutureNodes.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3 w-3 text-la-gold"
                    />
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Três Cartões de Critérios de Acompanhamento (Sem repetição de título, com Spotlight e Justificação) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={MOTION_VIEWPORT}
        variants={staggerContainerVariants}
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        {cards.map((card, index) => (
          <motion.div key={card.id} variants={staggerItemVariants}>
            <EvidenceCriteriaCard
              card={card}
              index={index}
              isSelected={activeIndex === index}
              isPaused={isPaused}
              onSelect={() => setActiveIndex(index)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Estudo de Caso Principal para o Estado Futuro (`documented-evidence`).
 * Segue a anatomia obrigatória: Desafio -> Uso -> Mudança -> Resultado -> Identificação.
 */
export function EvidenceCaseStudy({
  caseItem,
}: {
  readonly caseItem: DocumentedEvidenceItem;
}) {
  return (
    <article className="flex flex-col justify-between rounded-la-xl border border-la-border-gold/55 bg-la-surface-2/95 p-6 shadow-[var(--la-elevation-2)] sm:p-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <span className="rounded-la-full border border-la-border-gold bg-la-gold-faint px-3 py-1 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
            {EVIDENCE_CATEGORY_LABELS[caseItem.type]}
          </span>
          <span className="font-la-mono text-[0.75rem] text-la-text-secondary">
            Período acompanhado: {caseItem.usagePeriod}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-la-md border border-white/10 bg-black/50 p-4">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
              01 · Desafio
            </span>
            <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
              {caseItem.challenge}
            </p>
          </div>

          <div className="rounded-la-md border border-white/10 bg-black/50 p-4">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              02 · Uso
            </span>
            <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary">
              {caseItem.usage}
            </p>
          </div>

          <div className="rounded-la-md border border-white/10 bg-black/50 p-4">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              03 · Mudança
            </span>
            <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary">
              {caseItem.change}
            </p>
          </div>

          <div className="rounded-la-md border border-la-border-gold/45 bg-la-gold-faint p-4">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              04 · Resultado
            </span>
            <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] font-semibold leading-[1.6] text-la-text-primary">
              {caseItem.result}
            </p>
          </div>
        </div>
      </div>

      {/* 05 · Identificação Autorizada */}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div>
          <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
            {caseItem.authorName}
          </p>
          <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
            {caseItem.authorRole} • {caseItem.company}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.6875rem] text-la-gold-light">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
          <span>Publicação autorizada</span>
        </span>
      </footer>
    </article>
  );
}

/**
 * Card Secundário de Evidência Documentada (Estado Futuro `documented-evidence`).
 */
export function EvidenceCard({
  item,
}: {
  readonly item: DocumentedEvidenceItem;
}) {
  return (
    <article className="flex h-full flex-col justify-between rounded-la-lg border border-white/10 bg-la-surface-1/90 p-5">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
            {EVIDENCE_CATEGORY_LABELS[item.type]}
          </span>
          <span className="font-la-mono text-[0.625rem] text-la-text-muted">
            {item.usagePeriod}
          </span>
        </div>

        <p className="mt-3.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] font-medium leading-[1.6] text-la-text-primary">
          {item.change}
        </p>

        <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
          {item.result}
        </p>
      </div>

      <footer className="mt-4 border-t border-white/10 pt-3">
        <p className="font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
          {item.authorName}
        </p>
        <p className="font-la-mono text-[0.6875rem] text-la-text-muted">
          {item.authorRole} • {item.company}
        </p>
      </footer>
    </article>
  );
}

/**
 * Estado Futuro Oficial: `documented-evidence` (Etapa 2D §4.11).
 * Só é ativado quando existirem casos reais autorizados.
 */
export function EvidenceDocumentedState({
  featuredCase,
  secondaryEvidence,
}: {
  readonly featuredCase: DocumentedEvidenceItem;
  readonly secondaryEvidence: readonly DocumentedEvidenceItem[];
}) {
  const authorizedSecondary = secondaryEvidence.filter(
    (item) => item.authorized
  );

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
      <div
        className={clsx(
          authorizedSecondary.length > 0 ? "lg:col-span-7" : "lg:col-span-12"
        )}
      >
        <EvidenceCaseStudy caseItem={featuredCase} />
      </div>

      {authorizedSecondary.length > 0 ? (
        <div className="flex flex-col gap-4 lg:col-span-5">
          {authorizedSecondary.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Seção 12 — Provas e Depoimentos (`id="provas"`).
 *
 * Intensidade: 2/5 -> 3/5 | Profundidade: Nível 1 -> Nível 2.
 *
 * Regras inegociáveis (CONTENT-LANDING.md §12 & Etapa 2D §4.11):
 * - Eyebrow estritamente canônico: "PRIMEIROS PROJETOS EM ACOMPANHAMENTO" (sem prefixos inventados).
 * - Nenhuma prova, métrica, cliente ou citação é inventada.
 * - Opera inicialmente em `"monitoring"` com os 3 critérios de acompanhamento sem duplicar títulos.
 * - Sem CTA próprio por padrão na versão inicial para preservar o fluxo até o CTA Final.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function EvidenceSection({
  content = landingContent.evidence,
  mode = content.mode,
  className,
}: EvidenceSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const headingId = content.id ? `${content.id}-title` : "provas-title";

  const canRenderDocumentedEvidence =
    mode === "documented-evidence" &&
    content.futureState.enabled &&
    content.futureState.featuredCase !== null &&
    content.futureState.featuredCase.authorized;

  const activeEyebrow = canRenderDocumentedEvidence
    ? content.futureState.eyebrow
    : content.eyebrow;

  const activeHeadline = canRenderDocumentedEvidence
    ? content.futureState.headline
    : content.headline;

  const activeSubheadline = canRenderDocumentedEvidence
    ? content.futureState.subheadline
    : content.subheadline;

  const revealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="spacious"
      surface="canvas"
      bottomBorder={true}
      className={clsx("relative overflow-hidden [color-scheme:dark]", className)}
    >
      <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
        {/* 1. Cabeçalho Editorial Canônico (§12 de 02. CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow Canônico: "PRIMEIROS PROJETOS EM ACOMPANHAMENTO" */}
            <SectionEyebrow label={activeEyebrow} variant="pill" />

            {activeHeadline ? (
              <h2
                id={headingId}
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
              >
                {activeHeadline}
              </h2>
            ) : null}

            {activeSubheadline ? (
              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
                {activeSubheadline}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
            {content.body && content.body.length > 0
              ? content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                  >
                    {paragraph}
                  </p>
                ))
              : null}

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 font-la-mono text-[0.6875rem] text-la-text-muted">
              <Layers aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
              <span className="text-la-text-primary">Contexto real</span>
              <ArrowRight aria-hidden="true" className="h-3 w-3 text-la-gold" />
              <span className="text-la-text-primary">Uso documentado</span>
              <ArrowRight aria-hidden="true" className="h-3 w-3 text-la-gold" />
              <span className="font-semibold text-la-gold-light">
                Identificação autorizada
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Renderização Condicional Controlada: `monitoring` vs. `documented-evidence` */}
        {canRenderDocumentedEvidence && content.futureState.featuredCase ? (
          <EvidenceDocumentedState
            featuredCase={content.futureState.featuredCase}
            secondaryEvidence={content.futureState.secondaryEvidence}
          />
        ) : (
          <EvidenceMonitoringState content={content} />
        )}

        {/* 3. CTA Opcional (Omitido por padrão na versão inicial conforme Etapa 2D §4.11) */}
        {content.primaryAction ? (
          <div className="flex justify-start border-t border-white/10 pt-6">
            <CTAGroup
              primaryAction={content.primaryAction}
              secondaryAction={content.secondaryAction}
              microcopy={content.microcopy}
              align="left"
              size="md"
            />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export const ProofSection = EvidenceSection;
export default EvidenceSection;