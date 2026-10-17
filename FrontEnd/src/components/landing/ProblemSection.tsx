// FrontEnd/src/components/landing/ProblemSection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  Calendar,
  Layers,
  Target,
  Unlink,
  Users,
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
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type ProblemSectionProps = {
  readonly content?: LandingContent["problem"];
  readonly className?: string;
};

const DIAGNOSTIC_CYCLE_MS = 5200;

const DISCONNECTED_AXES = [
  { code: "EIXO 01", label: "Estratégia" },
  { code: "EIXO 02", label: "Mensagem" },
  { code: "EIXO 03", label: "Público" },
  { code: "EIXO 04", label: "Execução" },
] as const;

/**
 * Seção 04 — O Problema (Etapa 2D §4.4, CONTENT-LANDING.md §04 & ACCEPTANCE-LANDING.md §17).
 *
 * Física e Interatividade Alinhadas ao Hero:
 * - Inclinação 3D suave ao mover o mouse (`rotateX`, `rotateY`) sobre o palco direito.
 * - Blur radial dourado (`Spotlight`) acompanhando as coordenadas X/Y do ponteiro.
 * - Autociclo de 5.2s que pausa imediatamente ao passar o mouse (`isPaused`) para leitura tranquila.
 * - Eixos (01 a 04) e Rupturas (01 a 04) clicáveis para inspeção direta com transição FLIP (`layoutId`).
 */
export function ProblemSection({
  content = landingContent.problem,
  className,
}: ProblemSectionProps) {
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
    x: 280,
    y: 180,
    opacity: 0,
  });

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id ? `${content.id}-title` : "problema-title";

  const detailedItems = content.detailedItems ?? [];
  const fragments = content.fragments ?? [];

  /* Autociclo que roda apenas quando o usuário não está com o mouse sobre o palco */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || fragments.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % fragments.length);
    }, DIAGNOSTIC_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, fragments.length]);

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

  const sceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const resolveFragmentIcon = (index: number) => {
    switch (index) {
      case 0:
        return Target;
      case 1:
        return Layers;
      case 2:
        return Users;
      default:
        return Calendar;
    }
  };

  const activeFragment = fragments[activeIndex] ?? fragments[0];
  const activeDetailedItem = detailedItems[activeIndex] ?? detailedItems[0];

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="spacious"
      surface="canvas"
      bottomBorder={true}
      className={clsx("relative overflow-hidden", className)}
    >
      <div className="relative z-10 flex flex-col gap-12 lg:gap-14">
        {/* 1. NÍVEL SUPERIOR: Argumento Editorial (Esquerda) + Palco 3D Interativo (Direita) */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Coluna Esquerda (6 cols): Eyebrow + Headline + Subheadline + Corpo Justificado */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="flex w-full flex-col items-start lg:col-span-6"
          >
            {/* Eyebrow Canônico: "O DESAFIO NÃO É APENAS PRODUZIR" */}
            <SectionEyebrow label={content.eyebrow} variant="default" />

            {/* Headline Canônica com `text-balance` */}
            {content.headline ? (
              <h2
                id={headingId}
                className="mt-4 w-full text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
              >
                {content.headline}
              </h2>
            ) : null}

            {/* Subheadline Canônica Justificada em Todas as Dimensões */}
            {content.subheadline ? (
              <p className="mt-5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] font-medium leading-[1.68] text-la-text-primary/90">
                {content.subheadline}
              </p>
            ) : null}

            {/* Corpo Canônico (2 Parágrafos) Justificado em Todas as Dimensões */}
            {content.body && content.body.length > 0 ? (
              <div className="mt-5 flex w-full flex-col gap-4 border-l border-white/15 pl-4 sm:pl-5">
                {content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* Coluna Direita (6 cols): Palco Visual 3D/2.5D Interativo com Tilt e Spotlight Dourado */}
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
            className="relative w-full select-none lg:col-span-6"
          >
            {/* Glow Radial Dourado Profundo no Abismo Escuro (Idêntico ao Hero) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_55%_28%,rgba(207,169,101,0.16)_0%,rgba(207,169,101,0.04)_42%,transparent_74%)] blur-2xl"
            />

            {/* Contêiner 3D que flutua e inclina suavemente com o movimento do mouse */}
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
              className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.10)] backdrop-blur-xl"
            >
              {/* Blur Dourado (Spotlight Radial) seguindo o ponteiro do mouse */}
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
                className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              {/* TopBar da Janela de Diagnóstico */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/60 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                  </div>
                  <Unlink
                    aria-hidden="true"
                    className="ml-1 h-3.5 w-3.5 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary">
                    Diagnóstico de Comunicação Fragmentada
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-gold-light">
                  <motion.span
                    aria-hidden="true"
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: [0.35, 1, 0.35] }
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-1.5 w-1.5 rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                  />
                  <span>Sem conexão estrutural</span>
                </span>
              </div>

              {/* Câmara 3D Superior: 4 Eixos Clicáveis + Prisma 3D Oscilando no Próprio Eixo */}
              <div className="relative z-10 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_75%_50%,rgba(207,169,101,0.15)_0%,rgba(11,14,21,0.95)_60%,#040508_100%)] p-4 sm:p-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
                />

                <div className="relative z-10 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                  {/* Esquerda da Câmara (7 cols): Os 4 Eixos Clicáveis */}
                  <div className="flex flex-col gap-2 sm:col-span-7">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Eixos Operando Isoladamente
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {DISCONNECTED_AXES.map((axis, idx) => {
                        const isFocused = activeIndex === idx;
                        return (
                          <button
                            key={axis.code}
                            type="button"
                            aria-pressed={isFocused}
                            onClick={() => setActiveIndex(idx)}
                            className={clsx(
                              "flex flex-col justify-between rounded-la-md border px-3 py-2 text-left transition-all duration-200",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                              isFocused
                                ? "border-la-gold bg-white/[0.06] shadow-[0_0_20px_rgba(207,169,101,0.15)]"
                                : "border-dashed border-white/12 bg-black/40 hover:border-white/25 hover:bg-white/[0.03]"
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.08em] text-la-text-muted">
                                {axis.code}
                              </span>
                              <Unlink
                                aria-hidden="true"
                                className={clsx(
                                  "h-2.5 w-2.5",
                                  isFocused ? "text-la-gold" : "text-white/25"
                                )}
                              />
                            </div>
                            <span className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                              {axis.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direita da Câmara (5 cols): Cubo/Planos 3D Desalinhados Girando no Próprio Eixo */}
                  <div
                    aria-hidden="true"
                    className="relative flex h-[10.5rem] items-center justify-center sm:col-span-5"
                    style={{ perspective: "900px" }}
                  >
                    {/* Órbita Tracejada Interrompida */}
                    <motion.div
                      animate={
                        shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: -360 }
                      }
                      transition={{
                        duration: 28,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-dashed border-white/15"
                    />

                    {/* Segundo Anel Inclinado mostrando dispersão */}
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? { rotateX: 58, rotateZ: 0 }
                          : { rotateX: 58, rotateZ: 360 }
                      }
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-40 w-40 rounded-la-full border border-dashed border-la-gold/25"
                    />

                    {/* Estrutura 3D de Peças Desconectadas que Oscila em Eixos Opostos */}
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? { rotateX: 20, rotateY: -24 }
                          : {
                              rotateX: [18, 28, 18],
                              rotateY: [-26, 24, -26],
                              rotateZ: [-5, 5, -5],
                            }
                      }
                      transition={{
                        duration: 8.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative flex h-28 w-28 items-center justify-center"
                    >
                      {/* Peça Solta Superior */}
                      <motion.div
                        animate={
                          shouldReduceMotion
                            ? { translateZ: 26 }
                            : {
                                translateZ:
                                  activeIndex % 2 === 0 ? 32 : 22,
                                x: activeIndex % 2 === 0 ? -5 : 5,
                                y: activeIndex < 2 ? -4 : 3,
                              }
                        }
                        transition={{
                          duration: 0.45,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute inset-2 flex flex-col justify-between rounded-la-lg border border-dashed border-la-gold/65 bg-la-gold/15 p-2.5 shadow-[0_0_24px_rgba(207,169,101,0.22)] backdrop-blur-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-la-mono text-[0.55rem] font-semibold uppercase text-la-gold-light">
                            Peça Isolada
                          </span>
                          <Unlink className="h-2.5 w-2.5 text-la-gold" />
                        </div>
                        <div className="h-1 w-1/2 rounded-la-full bg-la-gold/75" />
                      </motion.div>

                      {/* Núcleo Central Vazio (Falta de Base Conectada) */}
                      <div
                        style={{ transform: "translateZ(0px)" }}
                        className="absolute inset-3 flex items-center justify-center rounded-la-lg border border-dashed border-white/20 bg-black/75 backdrop-blur-xs"
                      >
                        <span className="font-la-mono text-[0.5rem] uppercase tracking-[0.1em] text-la-text-muted">
                          Sem Elo
                        </span>
                      </div>

                      {/* Peça Solta Inferior */}
                      <motion.div
                        animate={
                          shouldReduceMotion
                            ? { translateZ: -24 }
                            : {
                                translateZ:
                                  activeIndex % 2 === 1 ? -30 : -20,
                                x: activeIndex % 2 === 1 ? 5 : -5,
                                y: activeIndex >= 2 ? 4 : -3,
                              }
                        }
                        transition={{
                          duration: 0.45,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute inset-2 flex flex-col justify-between rounded-la-lg border border-dashed border-white/20 bg-white/[0.04] p-2.5"
                      >
                        <span className="font-la-mono text-[0.55rem] uppercase text-la-text-secondary">
                          Sem Sequência
                        </span>
                        <div className="h-1 w-2/3 rounded-la-full bg-white/25" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* 4 Fragmentos Clicáveis com Moldura FLIP (`layoutId`) e Varredura Dourada */}
              <div className="relative z-10 border-b border-white/10 bg-black/45 px-4 py-3 sm:px-5">
                <div
                  aria-label="Selecione uma ruptura para inspecionar o diagnóstico"
                  className="grid grid-cols-2 gap-2"
                >
                  {fragments.map((fragment, index) => {
                    const IconComponent = resolveFragmentIcon(index);
                    const isSelected = activeIndex === index;
                    const itemCode = String(index + 1).padStart(2, "0");

                    return (
                      <button
                        key={fragment.label}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveIndex(index)}
                        className={clsx(
                          "group relative flex flex-col justify-between overflow-hidden rounded-la-md border p-2.5 text-left transition-colors duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          isSelected
                            ? "border-la-gold/70 bg-[#10131C] text-la-text-primary shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                            : "border-dashed border-white/10 bg-white/[0.02] text-la-text-secondary hover:border-white/25 hover:bg-white/[0.04]"
                        )}
                      >
                        {/* Moldura Deslizante FLIP (`layoutId`) */}
                        {isSelected ? (
                          <motion.div
                            layoutId="problem-mockup-active-tab"
                            transition={{
                              type: "tween",
                              duration: 0.28,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{
                              backgroundColor: "rgba(207, 169, 101, 0.06)",
                            }}
                            className="pointer-events-none absolute inset-0 z-0 rounded-la-md"
                          />
                        ) : null}

                        {/* Véu Dourado Translúcido de Progresso no Fundo (Pausa quando o mouse está no palco) */}
                        {isSelected && !shouldReduceMotion && !isPaused ? (
                          <motion.div
                            key={`problem-sweep-${activeIndex}`}
                            aria-hidden="true"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              duration: DIAGNOSTIC_CYCLE_MS / 1000,
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

                        <div className="relative z-20 flex w-full items-center justify-between gap-1.5">
                          <span className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                            <IconComponent
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0 text-la-gold"
                            />
                            <span>RUPTURA {itemCode}</span>
                          </span>
                          <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                            Isolado
                          </span>
                        </div>

                        <p className="relative z-20 mt-1 truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                          {fragment.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Painel Dinâmico do Fragmento em Evidência */}
              <div className="relative z-10 p-4 sm:p-5">
                <AnimatePresence mode="wait">
                  {activeFragment && activeDetailedItem ? (
                    <motion.div
                      key={activeDetailedItem.index}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={sceneVariants}
                      className="flex flex-col gap-2.5 rounded-la-md border border-white/10 bg-white/[0.025] p-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          {activeDetailedItem.index} · {activeDetailedItem.title}
                        </span>
                        <span className="rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                          {activeFragment.state}
                        </span>
                      </div>

                      <p className="text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                        {activeDetailedItem.description}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 2. NÍVEL INTERMEDIÁRIO: Grade Arquitetural 2x2 com os 4 Itens Completos de `02. CONTENT-LANDING.md` (§04) */}
        {detailedItems.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            aria-label="As quatro desconexões que enfraquecem a comunicação"
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {detailedItems.map((item, index) => {
              const IconComponent = resolveFragmentIcon(index);
              const isHighlighted = activeIndex === index;

              return (
                <motion.article
                  key={item.index}
                  variants={staggerItemVariants}
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    "relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-la-xl border p-5 transition-colors duration-300 sm:p-6",
                    isHighlighted
                      ? "border-la-gold/55 bg-la-surface-2/90 shadow-[0_0_28px_rgba(207,169,101,0.10)]"
                      : "border-white/10 bg-la-surface-1/75 hover:border-white/20"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={clsx(
                            "inline-flex h-6 w-6 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold transition-colors duration-300",
                            isHighlighted
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
                          )}
                        >
                          {item.index}
                        </span>
                        <h3 className="font-la-sans text-[1.125rem] font-semibold leading-[1.3] text-la-text-primary">
                          {item.title}
                        </h3>
                      </div>

                      <IconComponent
                        aria-hidden="true"
                        className={clsx(
                          "h-4 w-4 shrink-0 transition-colors duration-300",
                          isHighlighted ? "text-la-gold" : "text-la-text-muted"
                        )}
                      />
                    </div>

                    <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ) : null}

        {/* 3. NÍVEL DE FECHAMENTO: Consequência + Frase-síntese Canônica (§04 de CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="relative overflow-hidden rounded-la-xl border border-white/12 bg-la-surface-1/90 p-6 shadow-[var(--la-elevation-2)] sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Bloco Consequência (7 cols) */}
            <div className="flex flex-col gap-2.5 lg:col-span-7">
              <div className="inline-flex items-center gap-2">
                <AlertCircle
                  aria-hidden="true"
                  className="h-4 w-4 text-la-gold"
                />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Consequência
                </span>
              </div>

              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary sm:text-[1rem]">
                {content.consequence}
              </p>
            </div>

            {/* Bloco Frase-síntese (5 cols) */}
            <div className="rounded-la-lg border border-la-border-gold/55 bg-la-canvas-deep/90 p-5 shadow-[var(--la-elevation-gold)] lg:col-span-5">
              <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                Frase-síntese
              </span>

              <p className="mt-2 text-balance font-la-sans text-[1.0625rem] font-semibold leading-[1.45] text-la-text-primary sm:text-[1.125rem]">
                {content.synthesisPhrase}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default ProblemSection;