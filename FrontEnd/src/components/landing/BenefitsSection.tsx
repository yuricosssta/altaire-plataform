// FrontEnd/src/components/landing/BenefitsSection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  Compass,
  FolderGit2,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type BenefitBlock,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type BenefitsSectionProps = {
  readonly content?: LandingContent["benefits"];
  readonly className?: string;
};

const BENEFIT_CYCLE_MS = 5200;

const BENEFIT_SPAN_CLASSES: Readonly<Record<BenefitBlock["index"], string>> = {
  "01": "md:col-span-1 lg:col-span-4",
  "02": "md:col-span-1 lg:col-span-4",
  "03": "md:col-span-2 lg:col-span-4",
  "04": "md:col-span-1 lg:col-span-6",
  "05": "md:col-span-1 lg:col-span-6",
};

const SHORT_AXIS_LABELS: Readonly<Record<BenefitBlock["index"], string>> = {
  "01": "Consistência com propósito",
  "02": "Planejamento realista",
  "03": "Conteúdo contextualizado",
  "04": "Repertório reaproveitável",
  "05": "Autoridade e oferta",
};

function formatCleanCategoryLabel(rawLabel: string): string {
  return rawLabel.replace(/^\d+\s*[—–-]\s*/, "").trim();
}

/**
 * Card Individual de Benefício com Spotlight Radial Dourado (Estilo Resend)
 * e Sincronização com o Ciclo Ativo da Seção.
 */
function BenefitBentoCard({
  block,
  isSelected,
  isPaused,
  shouldReduceMotion,
  onSelect,
}: {
  readonly block: BenefitBlock;
  readonly isSelected: boolean;
  readonly isPaused: boolean;
  readonly shouldReduceMotion: boolean | null;
  readonly onSelect: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 200,
    y: 160,
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

  const resolveBenefitIcon = (index: BenefitBlock["index"]) => {
    switch (index) {
      case "01":
        return Compass;
      case "02":
        return CalendarCheck2;
      case "03":
        return Layers;
      case "04":
        return FolderGit2;
      case "05":
        return Target;
    }
  };

  const BenefitIcon = resolveBenefitIcon(block.index);
  const cleanCategory = formatCleanCategoryLabel(block.categoryLabel);
  const spanClass = BENEFIT_SPAN_CLASSES[block.index];

  return (
    <article
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-la-xl border p-5 transition-all duration-200 sm:p-6",
        spanClass,
        isSelected
          ? "border-la-gold/70 bg-[#10131C]/95 shadow-[0_0_32px_rgba(207,169,101,0.12)]"
          : "border-white/10 bg-la-surface-1/85 hover:border-white/25 hover:bg-la-surface-2/70"
      )}
    >
      {/* Spotlight Radial Dourado acompanhando o ponteiro do mouse */}
      <div
        aria-hidden="true"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(380px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.13), transparent 65%)`,
        }}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
      />

      {/* Véu Dourado Translúcido de Progresso no Card Ativo */}
      {isSelected && !shouldReduceMotion && !isPaused ? (
        <motion.div
          key={`benefit-card-sweep-${block.index}`}
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: BENEFIT_CYCLE_MS / 1000,
            ease: "linear",
          }}
          style={{
            background:
              "linear-gradient(90deg, rgba(207, 169, 101, 0.02) 0%, rgba(207, 169, 101, 0.08) 100%)",
            boxShadow: "inset 0 -2px 0 0 rgba(207, 169, 101, 0.85)",
          }}
          className="pointer-events-none absolute inset-0 z-0 origin-left"
        />
      ) : null}

      <div className="relative z-10">
        {/* Topo do Card: Número + Categoria Canônica Limpa + Ícone Linear */}
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
              {block.index}
            </span>
            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
              {cleanCategory}
            </span>
          </div>

          <BenefitIcon
            aria-hidden="true"
            className={clsx(
              "h-4 w-4 shrink-0 transition-colors",
              isSelected ? "text-la-gold" : "text-la-text-muted"
            )}
          />
        </div>

        {/* 1º Passo de Leitura: Título Canônico (`block.title`) */}
        <h3 className="mt-4 text-balance font-la-sans text-[1.1875rem] font-semibold leading-[1.3] text-la-text-primary sm:text-[1.25rem]">
          {block.title}
        </h3>

        {/* Texto Canônico Justificado (`block.description`) */}
        <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
          {block.description}
        </p>

        {/* 2º Passo de Leitura: "O que muda" (`block.businessConsequence`) Justificado */}
        <div className="mt-4 rounded-la-md border border-white/10 bg-black/50 p-3.5">
          <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
            O que muda
          </span>
          <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-primary">
            {block.businessConsequence}
          </p>
        </div>
      </div>

      {/* 3º Passo de Leitura: "Recurso que sustenta" + "Indicador" (Sem repetição entre parênteses!) */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.08em] text-la-text-muted">
            Recurso que sustenta
          </span>
          <span className="font-la-sans text-[0.75rem] font-medium text-la-text-secondary">
            {block.sustainingResource}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
          <CheckCircle2 aria-hidden="true" className="h-3 w-3 text-la-gold" />
          <span>{block.indicatorLabel}</span>
        </span>
      </div>
    </article>
  );
}

/**
 * Seção 10 — Benefícios (`id="beneficios"`).
 *
 * Referências dominantes: Attio (clareza estrutural) + Resend (legibilidade, spotlight e física 3D).
 * Intensidade: 2/5 -> 3/5 | Profundidade: Nível 1 -> Nível 2 (Faixa de Autenticidade + CTA).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §10, Etapa 2D §4.9 & ACCEPTANCE-LANDING.md §23):
 * - Eyebrow estritamente canônico: "O QUE MUDA NA PRÁTICA".
 * - Consome 100% de `landingContent.benefits` sem duplicar textos de `sustainingResource`.
 * - Inclui a Faixa de Autenticidade com sua microcopy oficial ("A IA acelera a produção. A identidade continua sendo sua.").
 * - Inclui o CTA principal oficial ("Começar agora" -> `/cadastro`) e a microcopy ("Transforme sua estratégia em uma operação de conteúdo.").
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function BenefitsSection({
  content = landingContent.benefits,
  className,
}: BenefitsSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stageTilt, setStageTilt] = useState<{
    rotateX: number;
    rotateY: number;
  }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [stageSpotlight, setStageSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 360,
    y: 160,
    opacity: 0,
  });

  const authenticityStageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id ? `${content.id}-title` : "beneficios-title";
  const blocks = content.blocks ?? [];

  /* Autociclo de 5.2s entre os 5 benefícios, pausando imediatamente no hover */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || blocks.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % blocks.length);
    }, BENEFIT_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, blocks.length]);

  const handleStageMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !authenticityStageRef.current) {
      return;
    }

    const rect = authenticityStageRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normalizedX = mouseX / rect.width - 0.5;
    const normalizedY = mouseY / rect.height - 0.5;

    setStageTilt({
      rotateX: Number((-normalizedY * 4).toFixed(2)),
      rotateY: Number((normalizedX * 5).toFixed(2)),
    });

    setStageSpotlight({
      x: Math.round(mouseX),
      y: Math.round(mouseY),
      opacity: 1,
    });
  };

  const handleStageMouseLeave = () => {
    setStageTilt({ rotateX: 0, rotateY: 0 });
    setStageSpotlight((prev) => ({ ...prev, opacity: 0 }));
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
        {/* 1. Cabeçalho Editorial Canônico (§10 de 02. CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          {/* Coluna Esquerda (7 cols): Eyebrow + Headline + Subheadline Justificada */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow Canônico: "O QUE MUDA NA PRÁTICA" (Sem prefixo inventado) */}
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

          {/* Coluna Direita (5 cols): Corpo Canônico Justificado + Encadeamento de Valor */}
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

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 font-la-mono text-[0.6875rem] text-la-text-muted">
              <span className="text-la-text-primary">Decisão estratégica</span>
              <ArrowRight aria-hidden="true" className="h-3 w-3 text-la-gold" />
              <span className="text-la-text-primary">Efeito operacional</span>
              <ArrowRight aria-hidden="true" className="h-3 w-3 text-la-gold" />
              <span className="font-semibold text-la-gold-light">
                Consequência para o negócio
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Barra Interativa dos 5 Benefícios + Grade Assimétrica Bento */}
        <div
          className="flex flex-col gap-5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Seletor Horizontal dos 5 Ganhos com Moldura FLIP (`layoutId`) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            aria-label="Cinco mudanças práticas na comunicação e no negócio"
            className="grid grid-cols-2 gap-2 rounded-la-xl border border-white/10 bg-la-surface-1/80 p-2 sm:grid-cols-5"
          >
            {blocks.map((item, idx) => {
              const isSelected = activeIndex === idx;
              const shortLabel =
                SHORT_AXIS_LABELS[item.index] ??
                formatCleanCategoryLabel(item.categoryLabel);

              return (
                <button
                  key={item.index}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveIndex(idx)}
                  className={clsx(
                    "relative flex items-center gap-2.5 overflow-hidden rounded-la-lg border px-3 py-2.5 text-left transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                    isSelected
                      ? "border-la-gold/70 bg-[#10131C] text-la-text-primary"
                      : "border-white/10 bg-black/40 text-la-text-secondary hover:border-white/25 hover:text-la-text-primary"
                  )}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId="benefits-axis-active-pill"
                      transition={{
                        type: "tween",
                        duration: 0.26,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        backgroundColor: "rgba(207, 169, 101, 0.08)",
                      }}
                      className="pointer-events-none absolute inset-0 z-0 rounded-la-lg"
                    />
                  ) : null}

                  <span
                    className={clsx(
                      "relative z-10 font-la-mono text-[0.6875rem] font-semibold",
                      isSelected ? "text-la-gold-light" : "text-la-text-muted"
                    )}
                  >
                    {item.index}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative z-10 h-3 w-px bg-white/15"
                  />
                  <span className="relative z-10 truncate font-la-sans text-[0.8125rem] font-medium">
                    {shortLabel}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Grade Assimétrica dos 5 Benefícios Canônicos (3 na 1ª linha + 2 amplos na 2ª linha) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12"
          >
            {blocks.map((benefit, idx) => (
              <motion.div
                key={benefit.index}
                variants={staggerItemVariants}
                className={BENEFIT_SPAN_CLASSES[benefit.index]}
              >
                <BenefitBentoCard
                  block={benefit}
                  isSelected={activeIndex === idx}
                  isPaused={isPaused}
                  shouldReduceMotion={shouldReduceMotion}
                  onSelect={() => setActiveIndex(idx)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 3. Palco 3D/2.5D de Fechamento: Faixa de Autenticidade + CTA Canônico da Seção 10 (§10 de CONTENT-LANDING.md) */}
        <motion.div
          ref={authenticityStageRef}
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          style={{ perspective: "1400px" }}
          className="relative w-full select-none"
        >
          {/* Glow Radial Dourado Sutil atrás da Faixa de Autenticidade */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_60%_50%,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.03)_45%,transparent_75%)] blur-2xl"
          />

          <motion.div
            animate={
              shouldReduceMotion
                ? { rotateX: 0, rotateY: 0 }
                : {
                    rotateX: stageTilt.rotateX,
                    rotateY: stageTilt.rotateY,
                  }
            }
            transition={{
              type: "tween",
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_26px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8"
          >
            {/* Spotlight Radial Dourado acompanhando o mouse */}
            <div
              aria-hidden="true"
              style={{
                opacity: stageSpotlight.opacity,
                background: `radial-gradient(460px circle at ${stageSpotlight.x}px ${stageSpotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
              }}
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            />

            {/* Hairline luminosa superior dourada */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
            />

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Esquerda (7 cols): Faixa de Autenticidade Canônica (Título + Texto Justificado + Microcopy Oficial) */}
              <div className="flex flex-col items-start gap-3.5 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-3 py-1">
                  <BookOpenCheck
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Faixa de Autenticidade
                  </span>
                </div>

                <h3 className="text-balance font-la-sans text-[1.375rem] font-semibold leading-[1.25] text-la-text-primary sm:text-[1.5rem]">
                  {content.authenticityBand.title}
                </h3>

                <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                  {content.authenticityBand.description}
                </p>

                {/* Microcopy Oficial da Faixa de Autenticidade (§10: "A IA acelera a produção. A identidade continua sendo sua.") */}
                <div className="mt-1 flex items-center gap-2.5 rounded-la-md border border-white/10 bg-black/50 px-4 py-2.5">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                    {content.authenticityBand.microcopy}
                  </span>
                </div>
              </div>

              {/* Direita (5 cols): Câmara Orbital 3D de Identidade + CTA Principal Canônico da Seção 10 */}
              <div className="flex flex-col items-center justify-between gap-6 rounded-la-xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.95)_65%,#040508_100%)] p-5 sm:p-6 lg:col-span-5">
                {/* Prisma Orbital 3D Girando no Próprio Eixo */}
                <div
                  aria-hidden="true"
                  className="relative flex h-[9.5rem] w-full items-center justify-center"
                  style={{ perspective: "900px" }}
                >
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
                    <div
                      style={{ transform: "translateZ(24px)" }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-la-gold bg-la-gold/25 p-2 shadow-[0_0_26px_rgba(207,169,101,0.38)] backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-la-mono text-[0.48rem] font-semibold uppercase text-la-gold-light">
                          Identidade Real
                        </span>
                        <Sparkles className="h-2.5 w-2.5 text-la-gold" />
                      </div>
                      <div className="h-1 w-2/3 rounded-la-full bg-la-gold" />
                    </div>

                    <div
                      style={{ transform: "translateZ(0px)" }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-white/20 bg-white/[0.05] p-2 backdrop-blur-md"
                    >
                      <span className="font-la-mono text-[0.48rem] uppercase text-la-text-primary">
                        Repertório
                      </span>
                      <div className="h-1 w-3/4 rounded-la-full bg-white/40" />
                    </div>

                    <div
                      style={{ transform: "translateZ(-22px)" }}
                      className="absolute inset-1.5 flex flex-col justify-between rounded-la-lg border border-la-border-gold/45 bg-la-canvas-deep/90 p-2"
                    >
                      <span className="font-la-mono text-[0.48rem] uppercase text-la-gold-light">
                        Contexto
                      </span>
                      <div className="h-1 w-1/2 rounded-la-full bg-la-gold/65" />
                    </div>
                  </motion.div>
                </div>

                {/* CTA Principal Canônico da Seção 10 ("Começar agora" -> `/cadastro`) + Microcopy Oficial */}
                {content.primaryAction ? (
                  <div className="w-full border-t border-white/10 pt-4">
                    <CTAGroup
                      primaryAction={content.primaryAction}
                      secondaryAction={content.secondaryAction}
                      microcopy={content.microcopy}
                      align="center"
                      size="md"
                      showPrimaryArrow={true}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default BenefitsSection;