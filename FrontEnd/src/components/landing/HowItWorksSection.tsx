// FrontEnd/src/components/landing/HowItWorksSection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FolderKanban,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type HowItWorksStep,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STRATEGIC_LINE_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type HowItWorksSectionProps = {
  readonly content?: LandingContent["howItWorks"];
  readonly className?: string;
};

const ROUTINE_STAGE_CYCLE_MS = 5200;

/**
 * Seção 09 — Como funciona (`id="como-funciona"`).
 * - Painel de inspeção inferior travado em célula única de Grid (`col-start-1 row-start-1`)
 *   + `useInView` para garantir variação zero de altura (sem quicar a página).
 */
export function HowItWorksSection({
  content = landingContent.howItWorks,
  className,
}: HowItWorksSectionProps) {
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
    y: 220,
    opacity: 0,
  });

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(stageContainerRef, { amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id
    ? `${content.id}-title`
    : "como-funciona-title";

  const steps = content.steps ?? [];

  /* Autociclo roda apenas quando a seção está visível no monitor e sem o mouse em cima */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || !isInView || steps.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, ROUTINE_STAGE_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, isInView, steps.length]);

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

  const resolveStepIcon = (step: HowItWorksStep["step"]) => {
    switch (step) {
      case "01":
        return FolderKanban;
      case "02":
        return ClipboardCheck;
      case "03":
        return FileCheck2;
    }
  };

  const activeStep = steps[activeIndex] ?? steps[0];
  const ActiveStepIcon = resolveStepIcon(activeStep?.step ?? "01");

  const synthesisNodes = content.visualSynthesisNodes ?? [
    "PROJETO EDITORIAL",
    "CONTEXTO",
    "DIREÇÃO APROVADA",
    "OPORTUNIDADE DE CONTEÚDO",
    "EXECUÇÃO",
  ];

  const parseFlowChain = (flowText?: string): readonly string[] => {
    if (!flowText) {
      return [];
    }
    return flowText
      .replace(/\.$/, "")
      .split("→")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="spacious"
      surface="surface-1"
      bottomBorder={true}
      className={clsx(
        "relative overflow-hidden [color-scheme:dark] [overflow-anchor:none]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[28rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.08)_0%,rgba(207,169,101,0.02)_48%,transparent_74%)] blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
        {/* 1. Cabeçalho Editorial Canônico */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="flex flex-col items-start lg:col-span-7">
            <SectionEyebrow label={content.eyebrow} variant="pill" />

            {content.headline ? (
              <h2
                id={headingId}
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
              >
                {content.headline}
              </h2>
            ) : null}

            {content.subheadline ? (
              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
                {content.subheadline}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
            {content.body && content.body.length > 0
              ? content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary sm:text-[1rem]"
                  >
                    {paragraph}
                  </p>
                ))
              : null}

            <div className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/50 bg-la-gold-faint px-4 py-3">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-la-gold"
              />
              <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                {content.humanApprovalNote}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Barra de Síntese Visual Canônica */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          aria-label={`Síntese visual: ${content.visualSynthesis}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-la-xl border border-white/12 bg-black/45 px-4 py-3.5 sm:px-6"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              aria-hidden="true"
              className="h-3.5 w-3.5 text-la-gold"
            />
            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Síntese Visual da Rotina
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-la-mono text-[0.6875rem] sm:gap-2">
            {synthesisNodes.map((node, idx) => {
              const isHighlighted =
                (activeIndex === 0 && (idx === 0 || idx === 1)) ||
                (activeIndex === 1 && idx === 2) ||
                (activeIndex === 2 && (idx === 3 || idx === 4));

              return (
                <span
                  key={node}
                  className="inline-flex items-center gap-1.5 sm:gap-2"
                >
                  <span
                    className={clsx(
                      "rounded-la-xs border px-2.5 py-1 transition-colors duration-300",
                      isHighlighted
                        ? "border-la-gold bg-la-gold-faint font-semibold text-la-gold-light shadow-[0_0_14px_rgba(207,169,101,0.18)]"
                        : "border-white/10 bg-white/[0.03] text-la-text-primary"
                    )}
                  >
                    {node}
                  </span>
                  {idx < synthesisNodes.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 text-la-gold"
                    />
                  ) : null}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* 3. Trilha Conectada das 3 Etapas */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 10"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-9 right-16 left-16 hidden h-2.5 w-[calc(100%-8rem)] lg:block"
          >
            <line
              x1="0"
              y1="5"
              x2="1000"
              y2="5"
              stroke="rgba(245, 242, 235, 0.1)"
              strokeWidth="1.5"
            />
            <motion.line
              x1="0"
              y1="5"
              x2="1000"
              y2="5"
              stroke="#CFA965"
              strokeWidth="2"
              initial="hidden"
              whileInView="visible"
              viewport={MOTION_VIEWPORT}
              variants={lineVariants}
            />
          </svg>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-8 bottom-8 left-6 w-px bg-gradient-to-b from-la-gold via-la-gold/45 to-white/10 lg:hidden"
          />

          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            aria-label="Três etapas práticas de uso do Legion Altaire"
            className="relative grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {steps.map((stepItem, index) => {
              const isSelected = activeIndex === index;
              const StepIcon = resolveStepIcon(stepItem.step);

              return (
                <motion.li
                  key={stepItem.step}
                  variants={staggerItemVariants}
                  className="flex"
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveIndex(index)}
                    className={clsx(
                      "group relative flex w-full flex-col justify-between overflow-hidden rounded-la-xl border p-5 text-left transition-all duration-200 sm:p-6",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                      isSelected
                        ? "border-la-gold/75 bg-[#10131C] text-la-text-primary shadow-[0_0_28px_rgba(207,169,101,0.14)]"
                        : "border-white/12 bg-la-canvas/90 text-la-text-secondary hover:border-white/25 hover:bg-la-surface-2/60"
                    )}
                  >
                    {isSelected ? (
                      <motion.div
                        layoutId="how-it-works-step-active-card"
                        transition={{
                          type: "tween",
                          duration: 0.28,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{
                          backgroundColor: "rgba(207, 169, 101, 0.05)",
                        }}
                        className="pointer-events-none absolute inset-0 z-0 rounded-la-xl"
                      />
                    ) : null}

                    {isSelected && !shouldReduceMotion && !isPaused && isInView ? (
                      <motion.div
                        key={`how-sweep-${activeIndex}`}
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: ROUTINE_STAGE_CYCLE_MS / 1000,
                          ease: "linear",
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(207, 169, 101, 0.03) 0%, rgba(207, 169, 101, 0.14) 100%)",
                          boxShadow:
                            "inset 0 -2px 0 0 rgba(207, 169, 101, 0.9)",
                        }}
                        className="pointer-events-none absolute inset-0 z-0 origin-left"
                      />
                    ) : null}

                    <div className="relative z-20">
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-md border font-la-mono text-[0.8125rem] font-semibold transition-colors",
                              isSelected
                                ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_14px_rgba(207,169,101,0.4)]"
                                : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
                            )}
                          >
                            {stepItem.step}
                          </span>

                          <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                            {stepItem.stepLabel}
                          </span>
                        </div>

                        <StepIcon
                          aria-hidden="true"
                          className={clsx(
                            "h-4 w-4 shrink-0 transition-colors",
                            isSelected ? "text-la-gold" : "text-white/30"
                          )}
                        />
                      </div>

                      <h3 className="mt-4 text-balance font-la-sans text-[1.25rem] font-semibold leading-[1.25] text-la-text-primary sm:text-[1.375rem]">
                        {stepItem.title}
                      </h3>

                      <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] font-medium leading-[1.55] text-la-gold-light">
                        {stepItem.stepSubheadline}
                      </p>

                      <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                        {stepItem.description}
                      </p>
                    </div>

                    <div className="relative z-20 mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-4">
                      <div className="rounded-la-md border border-white/10 bg-black/45 p-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkles
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0 text-la-gold"
                          />
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            Benefício percebido
                          </span>
                        </div>
                        <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.5] text-la-text-primary">
                          {stepItem.perceivedBenefit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-0.5">
                        <p className="font-la-mono text-[0.6875rem] text-la-text-muted">
                          {stepItem.stepMicrocopy}
                        </p>
                        <span className="shrink-0 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                          {isSelected ? "Em foco ↓" : "Inspecionar →"}
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>

        {/* 4. Palco 3D/2.5D Interativo da Rotina (Com Altura Travada em Grid col-start-1 row-start-1) */}
        {activeStep ? (
          <motion.div
            ref={stageContainerRef}
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            onMouseEnter={() => setIsPaused(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1400px" }}
            className="relative w-full select-none [overflow-anchor:none]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(207,169,101,0.14)_0%,rgba(207,169,101,0.03)_45%,transparent_75%)] blur-2xl"
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
              <div
                aria-hidden="true"
                style={{
                  opacity: spotlight.opacity,
                  background: `radial-gradient(480px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              {/* TopBar do Palco */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                  </div>
                  <ActiveStepIcon
                    aria-hidden="true"
                    className="ml-1 h-4 w-4 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Inspeção da Rotina · {activeStep.stepLabel}
                  </span>
                </div>

                <div
                  aria-label="Alternar visualização da etapa na interface"
                  className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
                >
                  {steps.map((stepTab, idx) => {
                    const isTabSelected = activeIndex === idx;
                    return (
                      <button
                        key={stepTab.step}
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
                            layoutId="how-it-works-stage-active-tab"
                            transition={{
                              type: "tween",
                              duration: 0.26,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                          />
                        ) : null}
                        <span className="relative z-10">
                          Etapa {stepTab.step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Corpo do Palco 3D: Painéis Empilhados em Célula Única de Grid (Altura 100% Fixa) */}
              <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
                <div className="grid grid-cols-1 lg:col-span-8">
                  {steps.map((stepPanel, panelIdx) => {
                    const isPanelActive = activeIndex === panelIdx;

                    return (
                      <div
                        key={stepPanel.step}
                        aria-hidden={!isPanelActive}
                        className={clsx(
                          "col-start-1 row-start-1 flex flex-col gap-4 transition-opacity duration-250",
                          isPanelActive
                            ? "relative z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0 select-none"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                              {stepPanel.stepLabel}
                            </span>
                            <h4 className="mt-0.5 font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                              {stepPanel.title}
                            </h4>
                          </div>

                          <span className="rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
                            {stepPanel.stepMicrocopy}
                          </span>
                        </div>

                        {stepPanel.step === "01" && stepPanel.interfaceElements ? (
                          <div className="flex flex-col gap-3">
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                              Interface · Dados configurados no Projeto Editorial
                            </span>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {stepPanel.interfaceElements.map((item) => (
                                <div
                                  key={item}
                                  className="flex items-center gap-2.5 rounded-la-md border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
                                >
                                  <CheckCircle2
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 shrink-0 text-la-gold"
                                  />
                                  <span className="font-la-sans text-[0.8125rem] font-medium text-la-text-primary">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {stepPanel.step === "02" ? (
                          <div className="flex flex-col gap-3.5">
                            {stepPanel.userAction ? (
                              <div className="flex flex-wrap items-center justify-between gap-2 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-3.5 py-2.5">
                                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                                  Ação do usuário
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 font-la-mono text-[0.75rem] font-semibold text-la-text-primary">
                                  {parseFlowChain(stepPanel.userAction).map(
                                    (actionNode, actionIdx, arr) => (
                                      <span
                                        key={actionNode}
                                        className="inline-flex items-center gap-1.5"
                                      >
                                        <span>{actionNode}</span>
                                        {actionIdx < arr.length - 1 ? (
                                          <ArrowRight
                                            aria-hidden="true"
                                            className="h-3 w-3 text-la-gold"
                                          />
                                        ) : null}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : null}

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {stepPanel.reviewableElements ? (
                                <div className="rounded-la-md border border-white/10 bg-white/[0.025] p-3.5">
                                  <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                                    Elementos revisáveis
                                  </span>
                                  <ul className="mt-2 flex flex-wrap gap-1.5">
                                    {stepPanel.reviewableElements.map((el) => (
                                      <li
                                        key={el}
                                        className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 font-la-sans text-[0.75rem] text-la-text-primary"
                                      >
                                        {el}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}

                              {stepPanel.productionCapacityExamples ? (
                                <div className="rounded-la-md border border-white/10 bg-white/[0.025] p-3.5">
                                  <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                                    Capacidade de produção
                                  </span>
                                  <ul className="mt-2 flex flex-wrap gap-1.5">
                                    {stepPanel.productionCapacityExamples.map(
                                      (cap) => (
                                        <li
                                          key={cap}
                                          className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 font-la-sans text-[0.75rem] text-la-text-secondary"
                                        >
                                          {cap}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {stepPanel.step === "03" ? (
                          <div className="flex flex-col gap-3.5">
                            {stepPanel.executionFlow ? (
                              <div className="rounded-la-md border border-la-border-gold/45 bg-la-gold-faint p-3.5">
                                <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                                  Fluxo de execução controlado pelo usuário
                                </span>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5 font-la-mono text-[0.6875rem] text-la-text-primary">
                                  {parseFlowChain(stepPanel.executionFlow).map(
                                    (flowNode, flowIdx, arr) => (
                                      <span
                                        key={flowNode}
                                        className="inline-flex items-center gap-1.5"
                                      >
                                        <span className="rounded-la-xs border border-white/15 bg-black/50 px-2 py-0.5">
                                          {flowNode}
                                        </span>
                                        {flowIdx < arr.length - 1 ? (
                                          <ArrowRight
                                            aria-hidden="true"
                                            className="h-3 w-3 shrink-0 text-la-gold"
                                          />
                                        ) : null}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : null}

                            {stepPanel.possibleMaterials ? (
                              <div>
                                <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                                  Materiais possíveis no pacote de conteúdo
                                </span>
                                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  {stepPanel.possibleMaterials.map((mat) => (
                                    <div
                                      key={mat}
                                      className="flex items-center gap-2 rounded-la-md border border-white/10 bg-white/[0.03] px-3 py-2"
                                    >
                                      <CheckCircle2
                                        aria-hidden="true"
                                        className="h-3 w-3 shrink-0 text-la-gold"
                                      />
                                      <span className="font-la-sans text-[0.75rem] font-medium text-la-text-primary">
                                        {mat}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Direita do Palco (4 cols): Câmara Orbital 3D */}
                <div
                  aria-hidden="true"
                  className="relative flex h-[12.5rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_62%,#040508_100%)] lg:col-span-4"
                  style={{ perspective: "900px" }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isInView
                        ? { rotateZ: 0 }
                        : { rotateZ: 360 }
                    }
                    transition={{
                      duration: 24,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-dashed border-la-gold/35"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isInView
                        ? { rotateX: 60, rotateZ: 0 }
                        : { rotateX: 60, rotateZ: -360 }
                    }
                    transition={{
                      duration: 16,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="pointer-events-none absolute h-40 w-40 rounded-la-full border border-white/15 shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isInView
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
                    className="relative flex h-28 w-28 items-center justify-center"
                  >
                    {steps.map((layerStep, layerIdx) => {
                      const isLayerActive = activeIndex === layerIdx;
                      const zBase =
                        layerIdx === 2 ? 24 : layerIdx === 1 ? 0 : -22;
                      const zActive =
                        layerIdx === 2 ? 32 : layerIdx === 1 ? 8 : -16;

                      return (
                        <motion.div
                          key={layerStep.step}
                          animate={{
                            translateZ: isLayerActive ? zActive : zBase,
                            scale: isLayerActive ? 1.07 : 0.95,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={clsx(
                            "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                            isLayerActive
                              ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.4)]"
                              : "border-white/15 bg-white/[0.04]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.52rem] font-semibold uppercase text-la-gold-light">
                              Etapa {layerStep.step}
                            </span>
                            <Compass className="h-2.5 w-2.5 text-la-gold" />
                          </div>
                          <div className="h-1 w-2/3 rounded-la-full bg-la-gold/75" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {/* 5. Fechamento Canônico da Seção + CTA Principal (/cadastro) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="relative overflow-hidden rounded-la-xl border border-white/12 bg-la-canvas/90 p-6 shadow-[var(--la-elevation-2)] sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex max-w-[44rem] flex-col gap-2">
              <div className="inline-flex items-center gap-2">
                <Layers aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Controle Humano & Execução Conectada
                </span>
              </div>

              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.125rem] font-semibold leading-[1.4] text-la-text-primary sm:text-[1.25rem]">
                {content.closingText}
              </p>
            </div>

            <div className="shrink-0">
              <CTAGroup
                primaryAction={content.primaryAction}
                secondaryAction={content.secondaryAction}
                microcopy={content.microcopy}
                align="left"
                size="md"
                showPrimaryArrow={true}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default HowItWorksSection;