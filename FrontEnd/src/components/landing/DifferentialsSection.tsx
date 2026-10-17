// FrontEnd/src/components/landing/DifferentialsSection.tsx
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
  Compass,
  FileText,
  GitCommitHorizontal,
  Info,
  Layers,
  ShieldCheck,
  Sparkles,
  Unlink,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type LandingContent,
} from "@/lib/constants/landing-content";
import { ROUTES } from "@/lib/constants/routes";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type DifferentialsSectionProps = {
  readonly content?: LandingContent["differentiators"];
  readonly className?: string;
};

const CRITERION_CYCLE_MS = 5200;

function parseFlowSequence(flowString: string): readonly string[] {
  return flowString
    .replace(/\.$/, "")
    .split("→")
    .map((node) => node.trim())
    .filter(Boolean);
}

/**
 * Seção 11 — Diferenciais (`id="diferenciais"`).
 *
 * Referências dominantes: Linear (matriz analítica de precisão) + Resend (física 3D e spotlight no escuro).
 * Intensidade: 3/5 | Profundidade: Nível 1 -> Nível 2.
 *
 * Regras inegociáveis (CONTENT-LANDING.md §11, Etapa 2D §4.10 & ACCEPTANCE-LANDING.md §23):
 * - Eyebrow estritamente canônico: "A DIFERENÇA ESTÁ NO FLUXO" (sem duplicação).
 * - Consome os 7 critérios canônicos de `content.comparisonTable` (Desktop: 3 colunas | Mobile: blocos sequenciais).
 * - Exibe os fluxos "Antes" e "Dentro do Legion Altaire", a "Observação da comparação",
 *   os enquadramentos "IA por comando isolado" vs. "Legion Altaire" e a "Frase-síntese" oficial.
 * - Palco 3D/2.5D interativo com inclinação no mouse, blur dourado (`Spotlight`), autociclo de 5.2s
 *   com pausa no hover e seleção por clique nas 7 linhas.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function DifferentialsSection({
  content = landingContent.differentiators,
  className,
}: DifferentialsSectionProps) {
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

  const headingId = content.id ? `${content.id}-title` : "diferenciais-title";
  const comparisonRows = content.comparisonTable ?? [];

  /* Autociclo de 5.2s pelos 7 critérios que pausa imediatamente quando o usuário interage */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || comparisonRows.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % comparisonRows.length);
    }, CRITERION_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, comparisonRows.length]);

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

  const sceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const sectionPrimaryAction = content.primaryAction ?? {
    label: "Começar agora",
    href: ROUTES.cadastro,
    variant: "primary" as const,
  };

  const activeRow = comparisonRows[activeIndex] ?? comparisonRows[0];
  const beforeFlowNodes = parseFlowSequence(content.beforeFlow);
  const insideLegionNodes = parseFlowSequence(content.insideLegionFlow);

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
      {/* Luz Radial Dourada Sutil no Centro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -z-0 h-[28rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.08)_0%,rgba(207,169,101,0.02)_48%,transparent_74%)] blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
        {/* 1. Cabeçalho Editorial Canônico (§11 de 02. CONTENT-LANDING.md — Sem Eyebrow ou Corpo duplicados) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          {/* Coluna Esquerda (7 cols): Eyebrow Único + Headline + Subheadline Justificada */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow Canônico: "A DIFERENÇA ESTÁ NO FLUXO" */}
            <SectionEyebrow label={content.eyebrow} variant="pill" />

            {content.headline ? (
              <h2
                id={headingId}
                className="mt-4 max-w-[23ch] text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
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

          {/* Coluna Direita (5 cols): Corpo Canônico Único + Contraste Direto de Fluxo */}
          <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
            {content.body && content.body.length > 0
              ? content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] font-medium leading-[1.68] text-la-text-primary sm:text-[1rem]"
                  >
                    {paragraph}
                  </p>
                ))
              : null}

            {/* Selo da Lógica de Integração */}
            <div className="flex items-center gap-2.5 rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint px-4 py-3">
              <GitCommitHorizontal
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-la-gold"
              />
              <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                {content.insideLegionFlow}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Palco 3D/2.5D Interativo de Comparação de Fluxo (Antes vs. Dentro do Legion Altaire + Câmara 3D) */}
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
          className="relative w-full select-none"
        >
          {/* Glow Radial Dourado Profundo atrás do Palco */}
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
            {/* Blur Dourado (Spotlight Radial) seguindo o ponteiro do mouse */}
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

            {/* TopBar do Palco com Seletor FLIP (`layoutId`) dos 7 Critérios Canônicos */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div aria-hidden="true" className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-la-full bg-white/15" />
                  <span className="h-2 w-2 rounded-la-full bg-white/15" />
                  <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                </div>
                <Compass
                  aria-hidden="true"
                  className="ml-1 h-4 w-4 text-la-gold"
                />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Arquitetura de Fluxo · 07 Critérios de Comparação
                </span>
              </div>

              {/* Abas Rápidas 01 a 07 */}
              <div
                aria-label="Selecionar critério de comparação"
                className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
              >
                {comparisonRows.map((row, idx) => {
                  const isTabSelected = activeIndex === idx;
                  return (
                    <button
                      key={row.index}
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
                          layoutId="differentials-stage-active-tab"
                          transition={{
                            type: "tween",
                            duration: 0.26,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                        />
                      ) : null}
                      <span className="relative z-10">{row.index}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa Dupla de Encadeamento Canônico (§11: "Antes" vs. "Dentro do Legion Altaire") */}
            <div className="relative z-10 grid grid-cols-1 gap-3 border-b border-white/10 bg-black/40 px-4 py-3.5 sm:px-6 lg:grid-cols-2">
              {/* Antes: Fluxo Fragmentado Manual */}
              <div className="flex flex-col gap-1.5 rounded-la-lg border border-dashed border-white/12 bg-black/45 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                    <Unlink aria-hidden="true" className="h-3 w-3" />
                    <span>Antes (Comandos e ferramentas separadas)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  {beforeFlowNodes.map((node, idx) => (
                    <span
                      key={node}
                      className="inline-flex items-center gap-1"
                    >
                      <span className="rounded-la-xs border border-white/10 bg-white/[0.02] px-1.5 py-0.5">
                        {node}
                      </span>
                      {idx < beforeFlowNodes.length - 1 ? (
                        <ArrowRight
                          aria-hidden="true"
                          className="h-2.5 w-2.5 text-white/30"
                        />
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dentro do Legion Altaire: Fluxo Integrado */}
              <div className="flex flex-col gap-1.5 rounded-la-lg border border-la-border-gold/50 bg-la-gold-faint p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    <Compass
                      aria-hidden="true"
                      className="h-3 w-3 text-la-gold"
                    />
                    <span>Dentro do Legion Altaire</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 font-la-mono text-[0.6875rem] font-medium text-la-text-primary">
                  {insideLegionNodes.map((node, idx) => (
                    <span
                      key={node}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        className={clsx(
                          "rounded-la-xs border px-2 py-0.5",
                          idx === 0 || idx === insideLegionNodes.length - 1
                            ? "border-la-gold bg-la-gold/20 font-semibold text-la-gold-light"
                            : "border-white/15 bg-black/50 text-la-text-primary"
                        )}
                      >
                        {node}
                      </span>
                      {idx < insideLegionNodes.length - 1 ? (
                        <ArrowRight
                          aria-hidden="true"
                          className="h-3 w-3 text-la-gold"
                        />
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Corpo do Palco 3D: Inspeção do Critério Ativo (8 cols) + Câmara Orbital 3D (4 cols) */}
            {activeRow ? (
              <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRow.index}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={sceneVariants}
                      className="flex flex-col gap-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-la-xs border border-la-gold bg-la-gold font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse">
                            {activeRow.index}
                          </span>
                          <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                            Critério: {activeRow.criterion}
                          </h3>
                        </div>

                        <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-gold-light">
                          Critério {activeRow.index} de 07
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Legion Altaire */}
                        <div className="flex flex-col justify-between rounded-la-lg border border-la-border-gold/55 bg-la-surface-2/95 p-4 shadow-[var(--la-elevation-gold)]">
                          <div>
                            <div className="flex items-center gap-2 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                              <CheckCircle2
                                aria-hidden="true"
                                className="h-3.5 w-3.5 text-la-gold"
                              />
                              <span>Legion Altaire</span>
                            </div>
                            <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] font-medium leading-[1.6] text-la-text-primary">
                              {activeRow.legionAltaire}
                            </p>
                          </div>
                        </div>

                        {/* Uso de IA por comandos isolados */}
                        <div className="flex flex-col justify-between rounded-la-lg border border-white/10 bg-black/50 p-4">
                          <div>
                            <div className="flex items-center gap-2 font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                              <FileText
                                aria-hidden="true"
                                className="h-3.5 w-3.5 text-la-text-muted"
                              />
                              <span>Uso de IA por comandos isolados</span>
                            </div>
                            <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                              {activeRow.isolatedCommands}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Direita do Palco (4 cols): Câmara Orbital 3D Girando no Próprio Eixo */}
                <div
                  aria-hidden="true"
                  className="relative flex h-[11rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_62%,#040508_100%)] lg:col-span-4"
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
                    <motion.div
                      key={`prism-top-${activeRow.index}`}
                      animate={{ translateZ: 24, scale: 1.06 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-la-gold bg-la-gold/25 p-2 shadow-[0_0_26px_rgba(207,169,101,0.4)] backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-la-mono text-[0.48rem] font-semibold uppercase text-la-gold-light">
                          {activeRow.index} · {activeRow.criterion}
                        </span>
                        <Sparkles className="h-2.5 w-2.5 shrink-0 text-la-gold" />
                      </div>
                      <div className="h-1 w-2/3 rounded-la-full bg-la-gold" />
                    </motion.div>

                    <div
                      style={{ transform: "translateZ(0px)" }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-white/20 bg-white/[0.05] p-2 backdrop-blur-md"
                    >
                      <span className="font-la-mono text-[0.48rem] uppercase text-la-text-primary">
                        Fluxo Conectado
                      </span>
                      <div className="h-1 w-3/4 rounded-la-full bg-white/40" />
                    </div>

                    <div
                      style={{ transform: "translateZ(-22px)" }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-la-border-gold/45 bg-la-canvas-deep/90 p-2"
                    >
                      <span className="font-la-mono text-[0.48rem] uppercase text-la-gold-light">
                        Projeto Editorial
                      </span>
                      <div className="h-1 w-1/2 rounded-la-full bg-la-gold/65" />
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>

        {/* 3. Matriz Analítica Completa dos 7 Critérios Canônicos (Desktop: 3 Colunas | Mobile: Blocos Sequenciais) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="overflow-hidden rounded-la-xl border border-white/12 bg-la-canvas/95 shadow-[var(--la-elevation-2)]"
        >
          {/* Cabeçalho da Matriz Analítica */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <Layers aria-hidden="true" className="h-4 w-4 text-la-gold" />
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                Matriz Comparativa Completa · 07 Critérios Estruturais
              </span>
            </div>

            <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
              Clique em qualquer critério para destacar
            </span>
          </div>

          {/* Visão Desktop (>= 1024px): Tabela Estrutural Canônica em 3 Colunas */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 border-b border-white/10 bg-la-surface-1/85 px-6 py-3.5 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em]">
              <div className="col-span-3 text-la-text-muted">Critério</div>
              <div className="col-span-5 flex items-center gap-2 text-la-gold-light">
                <Compass
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-la-gold"
                />
                <span>Legion Altaire</span>
              </div>
              <div className="col-span-4 flex items-center gap-2 text-la-text-secondary">
                <FileText
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-la-text-muted"
                />
                <span>Uso de IA por comandos isolados</span>
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {comparisonRows.map((row, idx) => {
                const isSelected = activeIndex === idx;

                return (
                  <div
                    key={row.index}
                    onClick={() => setActiveIndex(idx)}
                    className={clsx(
                      "relative grid cursor-pointer grid-cols-12 items-stretch overflow-hidden px-6 py-4.5 transition-colors duration-200",
                      isSelected
                        ? "bg-[#10131C]/95"
                        : "hover:bg-la-surface-1/40"
                    )}
                  >
                    {/* Véu Dourado Translúcido de Progresso na Linha Ativa */}
                    {isSelected && !shouldReduceMotion && !isPaused ? (
                      <motion.div
                        key={`diff-row-sweep-${activeIndex}`}
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: CRITERION_CYCLE_MS / 1000,
                          ease: "linear",
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(207, 169, 101, 0.02) 0%, rgba(207, 169, 101, 0.09) 100%)",
                          boxShadow:
                            "inset 3px 0 0 0 #CFA965, inset 0 -1px 0 0 rgba(207, 169, 101, 0.6)",
                        }}
                        className="pointer-events-none absolute inset-0 z-0 origin-left"
                      />
                    ) : null}

                    {/* Coluna 1: Critério */}
                    <div className="relative z-10 col-span-3 flex flex-col justify-center pr-6">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={clsx(
                            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold transition-colors",
                            isSelected
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
                          )}
                        >
                          {row.index}
                        </span>
                        <h4 className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                          {row.criterion}
                        </h4>
                      </div>
                    </div>

                    {/* Coluna 2: Legion Altaire (Texto Justificado) */}
                    <div
                      className={clsx(
                        "relative z-10 col-span-5 mr-4 flex items-start gap-3 rounded-la-lg border p-3.5 transition-colors",
                        isSelected
                          ? "border-la-gold/65 bg-la-surface-2/95 shadow-[var(--la-elevation-gold)]"
                          : "border-la-border-gold/35 bg-la-surface-2/75"
                      )}
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-la-gold"
                      />
                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.58] text-la-text-primary">
                        {row.legionAltaire}
                      </p>
                    </div>

                    {/* Coluna 3: Uso de IA por comandos isolados (Texto Justificado) */}
                    <div className="relative z-10 col-span-4 flex items-start gap-3 rounded-la-lg border border-white/10 bg-black/45 p-3.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-la-full bg-white/30"
                      />
                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
                        {row.isolatedCommands}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visão Mobile/Tablet (< 1024px): Blocos Sequenciais por Critério Sem Rolagem Horizontal (§11 Observações) */}
          <div className="divide-y divide-white/10 lg:hidden">
            {comparisonRows.map((row, idx) => {
              const isSelected = activeIndex === idx;

              return (
                <div
                  key={row.index}
                  onClick={() => setActiveIndex(idx)}
                  className={clsx(
                    "flex cursor-pointer flex-col gap-3 p-5 transition-colors",
                    isSelected ? "bg-[#10131C]" : "bg-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={clsx(
                        "inline-flex h-6 w-6 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold",
                        isSelected
                          ? "border-la-gold bg-la-gold text-la-text-inverse"
                          : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
                      )}
                    >
                      {row.index}
                    </span>
                    <h4 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                      {row.criterion}
                    </h4>
                  </div>

                  {/* Bloco Legion Altaire */}
                  <div className="rounded-la-lg border border-la-border-gold/50 bg-la-surface-2/95 p-3.5">
                    <div className="flex items-center gap-1.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-3 w-3 text-la-gold"
                      />
                      <span>Legion Altaire</span>
                    </div>
                    <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.58] text-la-text-primary">
                      {row.legionAltaire}
                    </p>
                  </div>

                  {/* Bloco Uso de IA por comandos isolados */}
                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-3.5">
                    <span className="block font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                      Uso de IA por comandos isolados
                    </span>
                    <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
                      {row.isolatedCommands}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé da Matriz: Observação da Comparação Canônica (§11) */}
          <div className="flex items-start gap-3 border-t border-white/10 bg-black/55 px-5 py-4 sm:items-center sm:px-6">
            <Info
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-la-gold sm:mt-0"
            />
            <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
              <strong className="font-semibold text-la-gold-light">
                Observação da comparação:{" "}
              </strong>
              {content.comparisonObservation}
            </p>
          </div>
        </motion.div>

        {/* 4. Enquadramento de Uso Canônico: "IA por comando isolado" vs. "Legion Altaire" (§11 de CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={staggerContainerVariants}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Quando usar IA por comando isolado */}
          <motion.article
            variants={staggerItemVariants}
            className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-la-canvas/85 p-5 sm:p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="inline-flex items-center gap-2 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary">
                  <FileText
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-text-muted"
                  />
                  <span>Tarefa Pontual</span>
                </span>
                <span className="rounded-la-full border border-white/10 bg-black/40 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-muted">
                  Solicitação avulsa
                </span>
              </div>

              <h3 className="mt-4 text-balance font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                {content.isolatedCommandFit.label}
              </h3>

              <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
                {content.isolatedCommandFit.description}
              </p>
            </div>
          </motion.article>

          {/* Quando usar o Legion Altaire */}
          <motion.article
            variants={staggerItemVariants}
            className="flex flex-col justify-between rounded-la-xl border border-la-border-gold/60 bg-la-surface-2/95 p-5 shadow-[var(--la-elevation-gold)] sm:p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="inline-flex items-center gap-2 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-gold"
                  />
                  <span>Operação Editorial Conectada</span>
                </span>
                <span className="rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
                  Sistema contínuo
                </span>
              </div>

              <h3 className="mt-4 text-balance font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                {content.legionAltaireFit.label}
              </h3>

              <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] font-medium leading-[1.65] text-la-text-primary">
                {content.legionAltaireFit.description}
              </p>
            </div>
          </motion.article>
        </motion.div>

        {/* 5. Fechamento Canônico: Frase-síntese + CTA Principal (/cadastro — §11 de CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="relative overflow-hidden rounded-la-xl border border-white/12 bg-la-canvas/95 p-6 shadow-[var(--la-elevation-2)] sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex max-w-[44rem] flex-col gap-2">
              <div className="inline-flex items-center gap-2">
                <Sparkles aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Frase-síntese
                </span>
              </div>

              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.125rem] font-semibold leading-[1.45] text-la-text-primary sm:text-[1.25rem]">
                {content.synthesisPhrase}
              </p>
            </div>

            <div className="shrink-0">
              <CTAGroup
                primaryAction={sectionPrimaryAction}
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

export const DifferentiationSection = DifferentialsSection;
export default DifferentialsSection;