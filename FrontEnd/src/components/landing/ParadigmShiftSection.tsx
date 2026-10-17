// FrontEnd/src/components/landing/ParadigmShiftSection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Compass,
  GitMerge,
  Layers,
  Sparkles,
  Unlink,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_MASK_REVEAL_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STRATEGIC_LINE_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type ParadigmShiftSectionProps = {
  readonly content?: LandingContent["paradigmShift"];
  readonly className?: string;
};

const CONVERGENCE_CYCLE_MS = 5200;

type VectorInspectionMeta = {
  readonly code: "01" | "02" | "03";
  readonly beforeState: string;
  readonly afterState: string;
  readonly operationalShift: string;
};

const VECTOR_INSPECTION_META: readonly VectorInspectionMeta[] = [
  {
    code: "01",
    beforeState: "A publicação nasce avulsa, sem vínculo com o negócio.",
    afterState:
      "O contexto do negócio orienta o sentido de cada conteúdo antes da criação.",
    operationalShift:
      "O ponto de partida deixa de ser o formato isolado e passa a ser o contexto estratégico.",
  },
  {
    code: "02",
    beforeState:
      "Assuntos alternam sem critério entre engajamento, dúvida e oferta.",
    afterState:
      "A comunicação segue uma direção intencional alinhada ao posicionamento.",
    operationalShift:
      "Esforços dispersos convergem para uma linha clara de construção de percepção.",
  },
  {
    code: "03",
    beforeState:
      "Ideias, pautas e execuções acontecem como tarefas separadas.",
    afterState:
      "Planejamento e produção passam a responder à mesma estrutura editorial.",
    operationalShift:
      "A produção desconectada dá lugar a uma comunicação organizada e coerente.",
  },
] as const;

/**
 * Seção 05 — Mudança de Paradigma (Etapa 2D §4.5, CONTENT-LANDING.md §05 & ACCEPTANCE-LANDING.md §17).
 *
 * Referência dominante: Chronicle (quebra deliberada de ritmo e inflexão narrativa) + Resend (física 3D no escuro).
 * Intensidade: 3/5 | Profundidade: Nível 1 -> Nível 2 (Palco de Convergência).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §05):
 * - Eyebrow: Não se aplica (`null`).
 * - Headline: "É por isso que o Legion Altaire não começa pelo post."
 * - Subheadline: "Ele começa pelo contexto que dá sentido ao que será produzido."
 * - Itens: 3 vetores canônicos de transformação (`transitions` / `items`).
 * - Sem CTA próprio e sem antecipar a explicação detalhada dos três movimentos da seção `/#produto`.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function ParadigmShiftSection({
  content = landingContent.paradigmShift,
  className,
}: ParadigmShiftSectionProps) {
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
    x: 320,
    y: 200,
    opacity: 0,
  });

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id
    ? `${content.id}-title`
    : "mudanca-de-paradigma-title";

  const transitions = content.transitions ?? [];

  /* Autociclo de 5.2s que pausa imediatamente quando o mouse entra no palco */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || transitions.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % transitions.length);
    }, CONVERGENCE_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, transitions.length]);

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
      rotateX: Number((-normalizedY * 5).toFixed(2)),
      rotateY: Number((normalizedX * 6).toFixed(2)),
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

  const maskRevealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_MASK_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

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

  const activeTransition = transitions[activeIndex] ?? transitions[0];
  const activeMeta =
    VECTOR_INSPECTION_META[activeIndex] ?? VECTOR_INSPECTION_META[0];

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="spacious"
      surface="surface-1"
      bottomBorder={true}
      className={clsx("relative overflow-hidden [color-scheme:dark]", className)}
    >
      {/* Luz Radial Dourada Sutil de Convergência no Centro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -z-0 h-[26rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.09)_0%,rgba(207,169,101,0.02)_48%,transparent_74%)] blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
        {/* 1. Bloco Superior de Inflexão Narrativa (Headline + Subheadline Canônicas) */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={maskRevealVariants}
            className="flex flex-col items-start lg:col-span-7"
          >
            {/* Eyebrow só renderiza se existir no objeto canônico (em §05 é null) */}
            {content.eyebrow ? (
              <div className="mb-4">
                <SectionEyebrow label={content.eyebrow} variant="pill" />
              </div>
            ) : null}

            {content.headline ? (
              <h2
                id={headingId}
                className="max-w-[22ch] text-balance font-la-sans text-[clamp(1.875rem,3.1vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-la-text-primary"
              >
                {content.headline}
              </h2>
            ) : null}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="relative flex flex-col justify-center border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 -left-[2px] hidden h-6 w-[2px] bg-la-gold lg:block"
            />

            {content.subheadline ? (
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.125rem] font-medium leading-[1.6] text-la-text-primary sm:text-[1.25rem]">
                {content.subheadline}
              </p>
            ) : null}

            {content.body && content.body.length > 0
              ? content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary"
                  >
                    {paragraph}
                  </p>
                ))
              : null}
          </motion.div>
        </div>

        {/* 2. Palco Principal: Vetores Clicáveis (Esquerda) + Câmara 3D Interativa de Convergência (Direita) */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Coluna Esquerda (5 cols): Os 3 Vetores Canônicos de Mudança de Paradigma + Contraste */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="flex flex-col justify-between gap-5 lg:col-span-5"
          >
            {/* Lista Interativa dos 3 Vetores Canônicos (§05 Itens) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-2 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  <GitMerge
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-gold"
                  />
                  <span>Reenquadramento Estratégico</span>
                </span>
                <span className="font-la-mono text-[0.625rem] text-la-text-muted">
                  Clique para inspecionar
                </span>
              </div>

              <div
                aria-label="Três vetores de mudança de paradigma"
                className="flex flex-col gap-2.5"
              >
                {transitions.map((vector, index) => {
                  const isSelected = activeIndex === index;
                  const stepCode = String(index + 1).padStart(2, "0");
                  const fullItemText =
                    content.items?.[index] ?? `${vector.from} → ${vector.to}`;

                  return (
                    <motion.button
                      key={fullItemText}
                      type="button"
                      variants={staggerItemVariants}
                      aria-pressed={isSelected}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      onClick={() => setActiveIndex(index)}
                      className={clsx(
                        "group relative flex w-full flex-col justify-between overflow-hidden rounded-la-lg border p-4 text-left transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isSelected
                          ? "border-la-gold/75 bg-[#10131C] text-la-text-primary shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                          : "border-white/10 bg-la-canvas/85 text-la-text-secondary hover:border-white/25 hover:bg-la-surface-2/60"
                      )}
                    >
                      {/* Moldura Deslizante FLIP (`layoutId`) */}
                      {isSelected ? (
                        <motion.div
                          layoutId="paradigm-vector-active-tab"
                          transition={{
                            type: "tween",
                            duration: 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          style={{
                            backgroundColor: "rgba(207, 169, 101, 0.06)",
                          }}
                          className="pointer-events-none absolute inset-0 z-0 rounded-la-lg"
                        />
                      ) : null}

                      {/* Véu Dourado Translúcido de Progresso + Filete Inferior Embutido */}
                      {isSelected && !shouldReduceMotion && !isPaused ? (
                        <motion.div
                          key={`paradigm-sweep-${activeIndex}`}
                          aria-hidden="true"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: CONVERGENCE_CYCLE_MS / 1000,
                            ease: "linear",
                          }}
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(207, 169, 101, 0.04) 0%, rgba(207, 169, 101, 0.16) 100%)",
                            boxShadow:
                              "inset 0 -2px 0 0 rgba(207, 169, 101, 0.9)",
                          }}
                          className="pointer-events-none absolute inset-0 z-0 origin-left"
                        />
                      ) : null}

                      <div className="relative z-20 flex w-full items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                          <span
                            className={clsx(
                              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs font-la-mono text-[0.6875rem] font-semibold transition-colors",
                              isSelected
                                ? "bg-la-gold text-la-text-inverse"
                                : "border border-white/15 bg-white/[0.03] text-la-gold-light"
                            )}
                          >
                            {stepCode}
                          </span>

                          <span className="font-la-sans text-[0.875rem] text-la-text-muted line-through decoration-white/25">
                            {vector.from}
                          </span>

                          <ArrowRight
                            aria-hidden="true"
                            className={clsx(
                              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                              isSelected
                                ? "translate-x-0.5 text-la-gold"
                                : "text-la-gold/60"
                            )}
                          />

                          <span className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                            {vector.to}
                          </span>
                        </div>

                        <span
                          aria-hidden="true"
                          className={clsx(
                            "h-2 w-2 shrink-0 rounded-la-full transition-colors",
                            isSelected
                              ? "bg-la-gold shadow-[0_0_8px_#CFA965]"
                              : "bg-white/20"
                          )}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Par de Contraste Canônico (`content.contrastPair`) com Textos Justificados */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Antes: Conteúdo isolado */}
              <div className="flex flex-col justify-between rounded-la-lg border border-dashed border-white/12 bg-la-canvas-deep/75 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                      <Unlink aria-hidden="true" className="h-3 w-3" />
                      <span>Antes</span>
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-balance font-la-sans text-[0.9375rem] font-semibold leading-[1.3] text-la-text-secondary">
                    {content.contrastPair.beforeLabel}
                  </h3>

                  <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-muted">
                    {content.contrastPair.beforeDescription}
                  </p>
                </div>
              </div>

              {/* Depois: Contexto estratégico */}
              <div className="flex flex-col justify-between rounded-la-lg border border-la-border-gold/60 bg-la-surface-2/95 p-4 shadow-[var(--la-elevation-gold)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      <Compass
                        aria-hidden="true"
                        className="h-3 w-3 text-la-gold"
                      />
                      <span>Legion Altaire</span>
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-balance font-la-sans text-[0.9375rem] font-semibold leading-[1.3] text-la-text-primary">
                    {content.contrastPair.afterLabel}
                  </h3>

                  <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
                    {content.contrastPair.afterDescription}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coluna Direita (7 cols): Palco Visual 3D/2.5D de Convergência Interativo */}
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
            className="relative w-full select-none lg:col-span-7"
          >
            {/* Glow Radial Dourado Profundo atrás do Palco */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_55%_32%,rgba(207,169,101,0.16)_0%,rgba(207,169,101,0.04)_44%,transparent_75%)] blur-2xl"
            />

            {/* Contêiner 3D que flutua e inclina suavemente com o ponteiro do mouse */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? { rotateX: 0, rotateY: 0, y: 0 }
                  : {
                      rotateX: tilt.rotateX,
                      rotateY: tilt.rotateY,
                      y: isPaused ? 0 : [0, -4, 0],
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      rotateX: {
                        type: "tween",
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      },
                      rotateY: {
                        type: "tween",
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      },
                      y: {
                        duration: 6.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
              style={{ transformStyle: "preserve-3d" }}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.11)] backdrop-blur-xl"
            >
              {/* Blur Dourado (Spotlight Radial) seguindo o cursor */}
              <div
                aria-hidden="true"
                style={{
                  opacity: spotlight.opacity,
                  background: `radial-gradient(460px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              />

              {/* Hairline luminosa superior dourada */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              {/* TopBar da Câmara de Convergência */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/60 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                  </div>
                  <Compass
                    aria-hidden="true"
                    className="ml-1 h-3.5 w-3.5 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-primary">
                    Convergência para o Contexto Estratégico
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/60 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-medium uppercase tracking-[0.06em] text-la-gold-light">
                  <motion.span
                    aria-hidden="true"
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : {
                            opacity: [0.4, 1, 0.4],
                            scale: [0.92, 1.15, 0.92],
                          }
                    }
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-1.5 w-1.5 rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                  />
                  <span>Núcleo de Sentido Ativo</span>
                </span>
              </div>

              {/* Câmara Central 3D: Feixes de Convergência + Prisma 3D Alinhado no Próprio Eixo */}
              <div className="relative z-10 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_72%_50%,rgba(207,169,101,0.17)_0%,rgba(11,14,21,0.95)_60%,#040508_100%)] p-5 sm:p-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
                />

                <div className="relative z-10 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                  {/* Esquerda da Câmara (7 cols): Seletor Rápido dos 3 Vetores de Alinhamento */}
                  <div className="flex flex-col gap-2.5 sm:col-span-7">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-la-gold"
                      />
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Vetores de Alinhamento ao Núcleo
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {transitions.map((vector, idx) => {
                        const isFocused = activeIndex === idx;
                        const code = String(idx + 1).padStart(2, "0");

                        return (
                          <button
                            key={vector.from}
                            type="button"
                            aria-pressed={isFocused}
                            onClick={() => setActiveIndex(idx)}
                            className={clsx(
                              "flex items-center justify-between gap-2 rounded-la-md border px-3 py-2 text-left transition-all duration-200",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                              isFocused
                                ? "border-la-gold bg-white/[0.06] text-la-text-primary shadow-[0_0_22px_rgba(207,169,101,0.16)]"
                                : "border-white/10 bg-black/40 text-la-text-secondary hover:border-white/25 hover:text-la-text-primary"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={clsx(
                                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-la-xs font-la-mono text-[0.625rem] font-semibold",
                                  isFocused
                                    ? "bg-la-gold text-la-text-inverse"
                                    : "border border-white/15 bg-white/5 text-la-text-muted"
                                )}
                              >
                                {code}
                              </span>
                              <span className="truncate font-la-sans text-[0.8125rem] font-semibold">
                                {vector.to}
                              </span>
                            </div>

                            <span className="shrink-0 font-la-mono text-[0.625rem] text-la-gold-light">
                              ← {vector.from}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direita da Câmara (5 cols): Prisma 3D Convergente Girando no Próprio Eixo */}
                  <div
                    aria-hidden="true"
                    className="relative flex h-[11rem] items-center justify-center sm:col-span-5"
                    style={{ perspective: "900px" }}
                  >
                    {/* Anel Orbital Contínuo (Sinalizando Estabilidade e Alinhamento) */}
                    <motion.div
                      animate={
                        shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: 360 }
                      }
                      transition={{
                        duration: 24,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-la-gold/35 shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                    />

                    {/* Segundo Anel Orbital Inclinado em 3D */}
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? { rotateX: 62, rotateZ: 0 }
                          : { rotateX: 62, rotateZ: -360 }
                      }
                      transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-40 w-40 rounded-la-full border border-white/15"
                    />

                    {/* Prisma 3D Convergindo os 3 Planos em Eixo Próprio */}
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
                        duration: 8.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative flex h-28 w-28 items-center justify-center"
                    >
                      {/* Plano Superior: Comunicação Organizada (Vetor 03) */}
                      <motion.div
                        animate={{
                          translateZ: activeIndex === 2 ? 32 : 22,
                          scale: activeIndex === 2 ? 1.06 : 0.96,
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={clsx(
                          "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                          activeIndex === 2
                            ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.38)]"
                            : "border-white/20 bg-white/[0.06]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-la-mono text-[0.52rem] font-semibold uppercase text-la-gold-light">
                            03 · Organização
                          </span>
                          <span className="h-1.5 w-1.5 rounded-la-full bg-la-gold" />
                        </div>
                        <div className="h-1 w-2/3 rounded-la-full bg-white/35" />
                      </motion.div>

                      {/* Plano Central: Direção (Vetor 02) */}
                      <motion.div
                        animate={{
                          translateZ: activeIndex === 1 ? 8 : 0,
                          scale: activeIndex === 1 ? 1.06 : 0.96,
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={clsx(
                          "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                          activeIndex === 1
                            ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.38)]"
                            : "border-white/15 bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-la-mono text-[0.52rem] font-semibold uppercase text-la-text-primary">
                            02 · Direção
                          </span>
                          <span className="h-1.5 w-1.5 rounded-la-full bg-white/50" />
                        </div>
                        <div className="h-1 w-3/4 rounded-la-full bg-la-gold/55" />
                      </motion.div>

                      {/* Plano Base/Núcleo: Contexto Estratégico (Vetor 01) */}
                      <motion.div
                        animate={{
                          translateZ: activeIndex === 0 ? -18 : -24,
                          scale: activeIndex === 0 ? 1.06 : 0.96,
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={clsx(
                          "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                          activeIndex === 0
                            ? "border-la-gold bg-la-gold/30 shadow-[0_0_32px_rgba(207,169,101,0.45)]"
                            : "border-la-border-gold/50 bg-la-canvas-deep/90"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-la-mono text-[0.52rem] font-semibold uppercase text-la-gold-light">
                            01 · Contexto
                          </span>
                          <Compass className="h-3 w-3 text-la-gold" />
                        </div>
                        <div className="h-1 w-1/2 rounded-la-full bg-la-gold" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Painel Dinâmico da Inflexão Selecionada (Textos Justificados) */}
              <div className="relative z-10 p-4 sm:p-5">
                <AnimatePresence mode="wait">
                  {activeTransition ? (
                    <motion.div
                      key={activeMeta.code}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={sceneVariants}
                      className="flex flex-col gap-3 rounded-la-md border border-white/10 bg-white/[0.025] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            INFLEXÃO {activeMeta.code}
                          </span>
                          <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                            {activeTransition.from} → {activeTransition.to}
                          </span>
                        </div>

                        <Layers
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-la-gold"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-la-sm border border-dashed border-white/10 bg-black/45 p-3">
                          <span className="block font-la-mono text-[0.5625rem] uppercase tracking-[0.08em] text-la-text-muted">
                            Quando começa pelo post
                          </span>
                          <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                            {activeMeta.beforeState}
                          </p>
                        </div>

                        <div className="rounded-la-sm border border-la-border-gold/45 bg-la-gold-faint p-3">
                          <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            Quando começa pelo contexto
                          </span>
                          <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] font-medium leading-[1.55] text-la-text-primary">
                            {activeMeta.afterState}
                          </p>
                        </div>
                      </div>

                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-mono text-[0.6875rem] text-la-gold-light">
                        {activeMeta.operationalShift}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Feixe SVG de Saída preparando a Seção 06 (/#produto) */}
                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-secondary">
                      Contexto estabelecido como ponto de partida
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] text-la-gold-light">
                      <span>Como o Legion Altaire pensa</span>
                      <ArrowDown
                        aria-hidden="true"
                        className="h-3 w-3 text-la-gold"
                      />
                    </span>
                  </div>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 600 8"
                    preserveAspectRatio="none"
                    className="h-2 w-full"
                  >
                    <line
                      x1="0"
                      y1="4"
                      x2="600"
                      y2="4"
                      stroke="rgba(245, 242, 235, 0.1)"
                      strokeWidth="1.5"
                    />
                    <motion.line
                      x1="0"
                      y1="4"
                      x2="600"
                      y2="4"
                      stroke="#CFA965"
                      strokeWidth="2"
                      initial="hidden"
                      whileInView="visible"
                      viewport={MOTION_VIEWPORT}
                      variants={lineVariants}
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionShell>
  );
}

export default ParadigmShiftSection;