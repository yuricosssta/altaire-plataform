// FrontEnd/src/components/landing/PositioningBandSection.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
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

export type PositioningBandSectionProps = {
  readonly content?: LandingContent["positioningBand"];
  readonly className?: string;
};

const INDICATOR_CYCLE_MS = 2800;

/**
 * Seção 03 — Faixa de Posicionamento (Etapa 2D §4.3 & CONTENT-LANDING.md §03).
 *
 * Referência dominante: Resend (clareza, silêncio e contenção) + Linear (hairlines precisas).
 * Intensidade: 2/5 | Profundidade: Nível 0 (Plano).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §03):
 * - Identifica para quem o Legion Altaire foi criado e reforça o princípio de direção estratégica.
 * - Renderiza estritamente a copy canônica (Eyebrow, Headline, Subheadline e os 3 itens conceituais).
 * - Sem CTA próprio, sem métricas e sem simular prova social.
 * - Textos de apoio justificados em todas as dimensões (mobile, tablet e desktop) e H2 com `text-balance`.
 */
export function PositioningBandSection({
  content = landingContent.positioningBand,
  className,
}: PositioningBandSectionProps) {
  const [activePulseIndex, setActivePulseIndex] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id
    ? `${content.id}-title`
    : "posicionamento-title";

  /* Lista canônica dos 3 indicadores conceituais (§03: Estratégia conectada. | Conteúdo relevante. | Execução orientada.) */
  const conceptualItems =
    content.items && content.items.length > 0
      ? content.items
      : content.pillars.map((pillar) => pillar.label);

  /* Pulso sequencial suave entre os 3 indicadores conceituais */
  useEffect(() => {
    if (shouldReduceMotion || conceptualItems.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActivePulseIndex((prev) => (prev + 1) % conceptualItems.length);
    }, INDICATOR_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, conceptualItems.length]);

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

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="compact"
      surface="surface-1"
      bottomBorder={true}
      className={clsx("relative overflow-hidden", className)}
    >
      {/* Brilho ambiental sutil centralizado na faixa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-la-gold/25 to-transparent"
      />

      <div className="relative z-10 flex flex-col gap-8 lg:gap-10">
        {/* 1. Bloco Editorial Superior Equilibrado (8 cols Headline + 4 cols Subheadline Justificada) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          {/* Coluna Esquerda (8 cols): Eyebrow + Headline em 3 linhas equilibradas (`text-balance`) */}
          <div className="flex flex-col items-start gap-3.5 lg:col-span-8">
            <SectionEyebrow label={content.eyebrow} variant="default" />

            {content.headline ? (
              <h2
                id={headingId}
                className="max-w-[34ch] text-balance font-la-sans text-[clamp(1.5rem,2.35vw,2.25rem)] font-semibold leading-[1.18] tracking-[-0.022em] text-la-text-primary"
              >
                {content.headline}
              </h2>
            ) : null}
          </div>

          {/* Coluna Direita (4 cols): Subheadline Canônica Justificada em Todas as Dimensões */}
          <div className="relative flex flex-col justify-center border-l-2 border-la-gold/45 pl-4 sm:pl-5 lg:col-span-4 lg:mt-6 lg:border-l lg:border-white/15 lg:pl-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 -left-[3px] hidden h-5 w-[2px] bg-la-gold lg:block"
            />

            {content.subheadline ? (
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1rem] font-medium leading-[1.65] text-la-text-secondary sm:text-[1.0625rem]">
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
          </div>
        </motion.div>

        {/* 2. Barramento Arquitetural dos 3 Indicadores Conceituais (Sem Cards Clicáveis, Sem Repetição) */}
        {conceptualItems.length > 0 ? (
          <div className="relative select-none pt-1">
            {/* Trilha Horizontal SVG com Feixe Dourado Contínuo */}
            <div
              aria-hidden="true"
              className="relative flex w-full items-center"
            >
              <span className="h-2 w-2 shrink-0 rounded-la-full bg-la-gold shadow-[0_0_10px_rgba(207,169,101,0.8)]" />

              <div className="relative h-[2px] w-full overflow-hidden bg-white/10">
                <svg
                  viewBox="0 0 1200 2"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <motion.line
                    x1="0"
                    y1="1"
                    x2="1200"
                    y2="1"
                    stroke="rgba(207, 169, 101, 0.45)"
                    strokeWidth="2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={MOTION_VIEWPORT}
                    variants={lineVariants}
                  />
                </svg>

                {/* Pulso de luz suave percorrendo o fio estratégico */}
                {!shouldReduceMotion ? (
                  <motion.div
                    initial={{ x: "-30%" }}
                    animate={{ x: "130%" }}
                    transition={{
                      duration: 5.4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(207, 169, 101, 0.95) 50%, transparent 100%)",
                    }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/4"
                  />
                ) : null}
              </div>

              <span className="h-1.5 w-1.5 shrink-0 rounded-la-full bg-la-gold/60" />
            </div>

            {/* Lista dos 3 Indicadores Conceituais Canônicos (§03: Estratégia conectada. | Conteúdo relevante. | Execução orientada.) */}
            <motion.ol
              initial="hidden"
              whileInView="visible"
              viewport={MOTION_VIEWPORT}
              variants={staggerContainerVariants}
              aria-label="Indicadores conceituais de direção estratégica"
              className="mt-5 grid grid-cols-1 divide-y divide-white/10 rounded-la-lg border border-white/10 bg-black/30 backdrop-blur-sm md:grid-cols-3 md:divide-x md:divide-y-0"
            >
              {conceptualItems.map((itemLabel, index) => {
                const stepNumber = String(index + 1).padStart(2, "0");
                const isPulsing = activePulseIndex === index;

                return (
                  <motion.li
                    key={itemLabel}
                    variants={staggerItemVariants}
                    className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-4.5"
                  >
                    {/* Destaque sutil sincronizado no fundo do indicador ativo */}
                    <div
                      aria-hidden="true"
                      style={{
                        opacity: isPulsing ? 1 : 0,
                        background:
                          "radial-gradient(240px circle at 20% 50%, rgba(207, 169, 101, 0.08), transparent 75%)",
                      }}
                      className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    />

                    <div className="relative z-10 flex items-center gap-3.5">
                      <span
                        className={clsx(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold tracking-[0.06em] transition-colors duration-500",
                          isPulsing
                            ? "border-la-gold bg-la-gold/15 text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.25)]"
                            : "border-white/15 bg-white/[0.03] text-la-gold-light"
                        )}
                      >
                        {stepNumber}
                      </span>

                      <span
                        aria-hidden="true"
                        className={clsx(
                          "h-px w-4 transition-colors duration-500",
                          isPulsing ? "bg-la-gold" : "bg-white/20"
                        )}
                      />

                      <span className="font-la-sans text-[1rem] font-semibold leading-[1.3] tracking-tight text-la-text-primary sm:text-[1.0625rem]">
                        {itemLabel}
                      </span>
                    </div>

                    {index < conceptualItems.length - 1 ? (
                      <ArrowRight
                        aria-hidden="true"
                        className={clsx(
                          "relative z-10 hidden h-3.5 w-3.5 shrink-0 transition-colors duration-500 md:inline-block",
                          isPulsing ? "text-la-gold" : "text-white/25"
                        )}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "relative z-10 h-2 w-2 shrink-0 rounded-la-full transition-colors duration-500",
                          isPulsing
                            ? "bg-la-gold shadow-[0_0_8px_#CFA965]"
                            : "bg-la-gold/40"
                        )}
                      />
                    )}
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export default PositioningBandSection;