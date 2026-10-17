// FrontEnd/src/components/landing/HeroSection.tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { ProductFlowMockup } from "@/components/landing/ProductFlowMockup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  HERO_STAGE_MOTION,
  REDUCED_MOTION_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type HeroSectionProps = {
  readonly content?: LandingContent["hero"];
  readonly className?: string;
};

/**
 * Seção 02 — Hero Definitivo da Landing Pública (CONTENT-LANDING.md §02 & DESIGN-LEGION-PUBLIC.md).
 *
 * Padronização de Alinhamento Editorial (Mobile & Desktop):
 * - Coluna Esquerda unificada em `max-w-[35rem]` para que H1 e Subheadline compartilhem a mesma caixa visual.
 * - `H1` com `text-balance` e escala calibrada (`clamp(2.125rem, 3.25vw, 3.125rem)`).
 * - `Subheadline` com `text-justify [text-align-last:left] hyphens-auto` em todas as larguras (mobile e desktop).
 */
export function HeroSection({
  content = landingContent.hero,
  className,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const headingId = content.id ? `${content.id}-title` : "inicio-title";

  const copyContainerVariants = selectMotionPreset(
    shouldReduceMotion,
    HERO_STAGE_MOTION.copyContainer,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const copyItemVariants = selectMotionPreset(
    shouldReduceMotion,
    HERO_STAGE_MOTION.copyItem,
    REDUCED_MOTION_VARIANTS.reveal
  );

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="hero"
      surface="hero"
      bottomBorder={true}
      className={clsx("overflow-hidden", className)}
    >
      {/* Luz Radial Dourada Concentrada no Topo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-8 left-1/2 -z-0 h-[32rem] w-[60rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.10)_0%,rgba(207,169,101,0.025)_46%,transparent_72%)] blur-3xl"
      />

      {/* Grid Principal Acima da Dobra: Copy à Esquerda + Palco 3D Vivo à Direita */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-10 pt-6 lg:grid-cols-12 lg:gap-10 lg:pt-8 xl:gap-12">
        {/* 1. Coluna Esquerda (6 cols): Bloco Editorial Alinhado e Simétrico */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={copyContainerVariants}
          className="flex w-full max-w-[35rem] flex-col items-start lg:col-span-6"
        >
          {/* Eyebrow Canônico: "PLATAFORMA DE IA PARA ESTRATÉGIA, CONTEÚDO, AUTORIDADE E VENDAS" */}
          <motion.div variants={copyItemVariants}>
            <SectionEyebrow label={content.eyebrow} variant="pill" />
          </motion.div>

          {/* Headline Canônica (H1) com `text-balance` para linhas simétricas */}
          {content.headline ? (
            <motion.h1
              id={headingId}
              variants={copyItemVariants}
              className="mt-5 w-full text-balance font-la-sans text-[clamp(2.125rem,3.25vw,3.125rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-la-text-primary"
            >
              {content.headline}
            </motion.h1>
          ) : null}

          {/* Subheadline Canônica Justificada no Mobile e no Desktop */}
          {content.subheadline ? (
            <motion.p
              variants={copyItemVariants}
              className="mt-5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary"
            >
              {content.subheadline}
            </motion.p>
          ) : null}

          {/* Pílula da Sequência Visual Central (§02 Itens: "Estratégia → Planejamento → Conteúdo.") */}
          <motion.div
            variants={copyItemVariants}
            aria-label={`Sequência visual central: ${content.visualSequenceText}`}
            className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-la-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem]"
          >
            {content.visualSequence.map((stepLabel, idx) => (
              <span key={stepLabel} className="inline-flex items-center gap-2">
                <span
                  className={clsx(
                    idx === content.visualSequence.length - 1
                      ? "font-semibold text-la-gold-light"
                      : "text-la-text-primary"
                  )}
                >
                  {stepLabel}
                </span>
                {idx < content.visualSequence.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3 w-3 text-la-gold"
                  />
                ) : null}
              </span>
            ))}
          </motion.div>

          {/* CTAs Canônicos + Microcopy Oficial */}
          <motion.div
            variants={copyItemVariants}
            className="mt-7 w-full"
          >
            <CTAGroup
              primaryAction={content.primaryAction}
              secondaryAction={content.secondaryAction}
              microcopy={content.microcopy}
              conditionalTrialInfo={content.conditionalTrialInfo}
              align="left"
              size="md"
              showPrimaryArrow={true}
            />
          </motion.div>
        </motion.div>

        {/* 2. Coluna Direita (6 cols): Palco 3D/2.5D Vivo ao Lado do Título */}
        <div className="w-full lg:col-span-6">
          <ProductFlowMockup
            frameTitle={content.mockupPreview.frameTitle}
            projectLabel={content.mockupPreview.projectLabel}
            statusLabel={content.mockupPreview.statusLabel}
            visualSequence={content.visualSequence}
            flowSteps={content.mockupPreview.flowSteps}
          />
        </div>
      </div>
    </SectionShell>
  );
}

export default HeroSection;