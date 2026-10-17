// FrontEnd/src/components/landing/FinalCTASection.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { CTAButton } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type ConditionalCommercialNote,
  type LandingContent,
  type LinkAction,
} from "@/lib/constants/landing-content";
import { ROUTES } from "@/lib/constants/routes";
import {
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STRATEGIC_LINE_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type FinalCTAButtonProps = {
  readonly action?: LinkAction | null;
  readonly microcopy?: readonly string[];
  readonly conditionalTrialInfo?: ConditionalCommercialNote;
  readonly className?: string;
};

const DEFAULT_PRIMARY_ACTION: LinkAction = {
  label: "Começar agora",
  href: ROUTES.cadastro,
  variant: "primary",
};

const NODE_PULSE_INTERVAL_MS = 3200;

function resolveCommercialNoteText(
  note?: ConditionalCommercialNote
): string | null {
  if (!note || !note.enabled) {
    return null;
  }

  if (Array.isArray(note.items) && note.items.length > 0 && note.items[0]) {
    return note.items[0];
  }

  return null;
}

function parseChainNodes(rawItem?: string): readonly string[] {
  const source = rawItem || "Estratégia → conteúdo → negócio.";
  return source
    .replace(/\.$/, "")
    .split("→")
    .map((node) => node.trim())
    .filter(Boolean);
}

/**
 * Componente de apoio da Matriz de Componentes (Etapa 2D §7): `FinalCTAButton`.
 * Renderiza a ação única dominante da Seção 14 (/cadastro) com microcopy controlada
 * e trava explícita para não exibir trial enquanto não habilitado operacionalmente.
 */
export function FinalCTAButton({
  action = DEFAULT_PRIMARY_ACTION,
  microcopy = ["Crie seu primeiro Projeto Editorial."],
  conditionalTrialInfo,
  className,
}: FinalCTAButtonProps) {
  const resolvedAction = action ?? DEFAULT_PRIMARY_ACTION;
  const trialNoteText = resolveCommercialNoteText(conditionalTrialInfo);

  return (
    <div
      className={clsx(
        "flex w-full flex-col items-center justify-center gap-3.5",
        className
      )}
    >
      {/* Halo sutil de foco atrás do botão principal (Estilo inline blindado contra inversão) */}
      <div className="relative inline-flex w-full justify-center sm:w-auto">
        <div
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at center, rgba(207, 169, 101, 0.28) 0%, rgba(207, 169, 101, 0.06) 55%, transparent 78%)",
          }}
          className="pointer-events-none absolute -inset-4 rounded-la-xl blur-xl"
        />

        <CTAButton
          action={resolvedAction}
          variant="primary"
          size="md"
          showArrow={true}
          fullWidthMobile={true}
          className="relative z-10 min-h-[3.375rem] min-w-[16.5rem] px-8 py-3.5 text-[0.9375rem] shadow-[var(--la-elevation-gold)]"
        />
      </div>

      {/* Microcopy oficial abaixo do botão (§14: "Crie seu primeiro Projeto Editorial.") */}
      {microcopy.length > 0 ? (
        <div className="flex flex-col items-center gap-1 text-center">
          {microcopy.map((line) => (
            <p
              key={line}
              className="font-la-mono text-[0.75rem] tracking-[0.04em] text-la-text-secondary"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {/* Informação condicional de trial (oculta por padrão até confirmação operacional) */}
      {trialNoteText ? (
        <p className="max-w-[52ch] text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] text-la-gold-light">
          {trialNoteText}
        </p>
      ) : null}
    </div>
  );
}

export type FinalCTASectionProps = {
  readonly content?: LandingContent["finalCta"];
  readonly className?: string;
};

/**
 * Seção 14 — CTA Final (`id="comecar"`).
 *
 * Objetivo estratégico (CONTENT-LANDING.md §14 & Etapa 2D §6-7):
 * - Transformar compreensão em decisão de próximo passo, retomando a promessa central sem reexplicar o produto.
 * - Fechamento simbólico do Fio Estratégico Dourado convergindo diretamente para o Núcleo Orbital 3D.
 * - Palco 3D/2.5D interativo com inclinação no mouse (`rotateX`, `rotateY`) e Blur Dourado (`Spotlight`).
 * - Uma única ação dominante ("Começar agora" -> `/cadastro`) e microcopy "Crie seu primeiro Projeto Editorial.".
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function FinalCTASection({
  content = landingContent.finalCta,
  className,
}: FinalCTASectionProps) {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
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
    x: 480,
    y: 240,
    opacity: 0,
  });

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id ? `${content.id}-title` : "comecar-title";
  const chainNodes = parseChainNodes(content.items?.[0]);

  /* Pulso sequencial suave pelos 3 elos canônicos: Estratégia -> conteúdo -> negócio */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || chainNodes.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % chainNodes.length);
    }, NODE_PULSE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, chainNodes.length]);

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
      rotateX: Number((-normalizedY * 4.5).toFixed(2)),
      rotateY: Number((normalizedX * 5.5).toFixed(2)),
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

  const eyebrowText =
    content.eyebrow || "SUA ESTRATÉGIA PODE COMEÇAR A GANHAR FORMA";
  const headlineText =
    content.headline ||
    "Pronto para transformar sua estratégia em conteúdo que trabalha pelo seu negócio?";
  const subheadlineText =
    content.subheadline ||
    "Comece pelo contexto certo e coloque sua estratégia em movimento dentro do Legion Altaire.";

  const microcopyList =
    content.microcopy && content.microcopy.length > 0
      ? content.microcopy
      : ["Crie seu primeiro Projeto Editorial."];

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="wide"
      spacing="spacious"
      surface="final-cta"
      bottomBorder={false}
      className={clsx("relative overflow-hidden [color-scheme:dark]", className)}
    >
      {/* Palco Monolítico 3D/2.5D de Conversão em Onyx + Fechamento do Fio Estratégico Dourado */}
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
        className="relative mx-auto w-full max-w-[68rem] select-none"
      >
        {/* 1. Fechamento Simbólico do Fio Estratégico Dourado Conectando o Topo Diretamente ao Card */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 mx-auto flex flex-col items-center"
        >
          <svg
            viewBox="0 0 4 56"
            preserveAspectRatio="none"
            className="h-12 w-1 overflow-visible sm:h-14"
          >
            <line
              x1="2"
              y1="0"
              x2="2"
              y2="56"
              stroke="rgba(245, 242, 235, 0.12)"
              strokeWidth="1.5"
            />
            <motion.line
              x1="2"
              y1="0"
              x2="2"
              y2="56"
              stroke="#CFA965"
              strokeWidth="2"
              initial="hidden"
              whileInView="visible"
              viewport={MOTION_VIEWPORT}
              variants={lineVariants}
            />
          </svg>

          <span
            style={{
              boxShadow: "0 0 16px rgba(207, 169, 101, 0.9)",
            }}
            className="-mb-1.5 h-3 w-3 rounded-la-full border border-la-gold bg-la-gold"
          />
        </div>

        {/* Luz radial dourada controlada no fundo (1 único foco atmosférico Nível 4) */}
        <div
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(207, 169, 101, 0.16) 0%, rgba(207, 169, 101, 0.04) 48%, transparent 74%)",
          }}
          className="pointer-events-none absolute -inset-4 -z-0 rounded-[2.25rem] blur-2xl"
        />

        {/* Contêiner 3D que responde suavemente à inclinação do mouse */}
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
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 32px 72px rgba(0, 0, 0, 0.9), 0 0 88px rgba(207, 169, 101, 0.12)",
          }}
          className="relative z-10 overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#06080E]/95 px-6 py-12 backdrop-blur-xl sm:px-12 sm:py-14 lg:px-16 lg:py-16"
        >
          {/* Blur Dourado (Spotlight Radial) seguindo o ponteiro do mouse */}
          <div
            aria-hidden="true"
            style={{
              opacity: spotlight.opacity,
              background: `radial-gradient(520px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.15), transparent 65%)`,
            }}
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          />

          {/* Hairline luminosa superior dourada (SVG puro para zero artefato de renderização) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 800 2"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-12 top-0 z-10 h-[1px] w-[calc(100%-6rem)]"
          >
            <defs>
              <linearGradient
                id="final-cta-top-gold-line"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(207, 169, 101, 0)" />
                <stop offset="50%" stopColor="rgba(207, 169, 101, 0.85)" />
                <stop offset="100%" stopColor="rgba(207, 169, 101, 0)" />
              </linearGradient>
            </defs>
            <rect
              width="800"
              height="2"
              fill="url(#final-cta-top-gold-line)"
            />
          </svg>

          <motion.div
            variants={staggerContainerVariants}
            className="relative z-10 mx-auto flex max-w-[46rem] flex-col items-center text-center"
          >
            {/* 2. Núcleo Orbital 3D de Convergência (Recebe o Fio Estratégico Dourado) */}
            <motion.div
              variants={staggerItemVariants}
              aria-hidden="true"
              style={{ perspective: "800px" }}
              className="relative mb-5 flex h-24 w-24 items-center justify-center"
            >
              {/* Anel Orbital Externo Girando no Eixo Z */}
              <motion.div
                animate={
                  shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: 360 }
                }
                transition={{
                  duration: 24,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute h-24 w-24 rounded-la-full border border-dashed border-la-gold/40"
              />

              {/* Segundo Anel Orbital Inclinado em 3D */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { rotateX: 62, rotateZ: 0 }
                    : { rotateX: 62, rotateZ: -360 }
                }
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute h-28 w-28 rounded-la-full border border-white/15"
              />

              {/* Prisma Central Dourado Oscilando em Seu Próprio Eixo X/Y/Z */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { rotateX: 22, rotateY: -24, rotateZ: 0 }
                    : {
                        rotateX: [20, 28, 20],
                        rotateY: [-26, 26, -26],
                        rotateZ: [-4, 4, -4],
                      }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative flex h-14 w-14 items-center justify-center"
              >
                <div
                  style={{
                    transform: "translateZ(10px)",
                    boxShadow: "0 0 28px rgba(207, 169, 101, 0.42)",
                  }}
                  className="absolute inset-0 flex items-center justify-center rounded-la-lg border border-la-gold bg-la-gold/20 backdrop-blur-md"
                >
                  <Compass className="h-5 w-5 text-la-gold-light" />
                </div>

                <div
                  style={{ transform: "translateZ(-10px)" }}
                  className="absolute inset-1 rounded-la-lg border border-white/20 bg-white/[0.04]"
                />
              </motion.div>
            </motion.div>

            {/* 3. Eyebrow Canônico Centralizado (Sem prefixo inventado "DECISÃO") */}
            <motion.div variants={staggerItemVariants}>
              <SectionEyebrow
                label={eyebrowText}
                variant="pill"
                align="center"
              />
            </motion.div>

            {/* 4. Trilha Interativa da Síntese Canônica (§14 Itens: "Estratégia → conteúdo → negócio.") */}
            <motion.div
              variants={staggerItemVariants}
              aria-label={`Síntese do fluxo: ${content.items?.[0] ?? "Estratégia → conteúdo → negócio."}`}
              className="mt-5 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-la-full border border-white/12 bg-black/55 p-1.5 font-la-mono text-[0.75rem]"
            >
              {chainNodes.map((node, index) => {
                const isSelected = activeNodeIndex === index;
                const stepCode = String(index + 1).padStart(2, "0");

                return (
                  <span key={node} className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setActiveNodeIndex(index)}
                      className={clsx(
                        "relative inline-flex items-center gap-1.5 rounded-la-full px-3 py-1 transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isSelected
                          ? "font-semibold text-la-text-inverse"
                          : "text-la-text-primary hover:text-la-gold-light"
                      )}
                    >
                      {isSelected ? (
                        <motion.span
                          layoutId="final-cta-chain-active-pill"
                          transition={{
                            type: "tween",
                            duration: 0.26,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="pointer-events-none absolute inset-0 z-0 rounded-la-full bg-la-gold"
                        />
                      ) : null}

                      <span
                        className={clsx(
                          "relative z-10 text-[0.625rem]",
                          isSelected
                            ? "text-la-text-inverse/80"
                            : "text-la-gold"
                        )}
                      >
                        {stepCode}
                      </span>
                      <span className="relative z-10 capitalize">{node}</span>
                    </button>

                    {index < chainNodes.length - 1 ? (
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 text-la-gold"
                      />
                    ) : null}
                  </span>
                );
              })}
            </motion.div>

            {/* 5. Headline Principal Centralizada com `text-balance` (§14) */}
            <motion.h2
              id={headingId}
              variants={staggerItemVariants}
              className="mt-6 max-w-[22ch] text-balance font-la-sans text-[clamp(1.875rem,3.2vw,2.875rem)] font-semibold leading-[1.12] tracking-[-0.028em] text-la-text-primary"
            >
              {headlineText}
            </motion.h2>

            {/* 6. Subheadline Canônica Justificada em Todas as Dimensões (§14) */}
            <motion.div
              variants={staggerItemVariants}
              className="mt-4 w-full max-w-[36rem]"
            >
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary sm:text-[1.125rem]">
                {subheadlineText}
              </p>
            </motion.div>

            {/* Parágrafos adicionais caso existam em content.body */}
            {content.body && content.body.length > 0 ? (
              <motion.div
                variants={staggerItemVariants}
                className="mt-3 flex w-full max-w-[36rem] flex-col gap-2.5"
              >
                {content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            ) : null}

            {/* 7. Botão Único Dominante + Microcopy Oficial (FinalCTAButton) */}
            <motion.div variants={staggerItemVariants} className="mt-8 w-full">
              <FinalCTAButton
                action={content.primaryAction}
                microcopy={microcopyList}
                conditionalTrialInfo={content.conditionalTrialInfo}
              />
            </motion.div>

            {/* Assinatura Silenciosa de Continuidade no Rodapé Interno do Palco */}
            <motion.div
              variants={staggerItemVariants}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-4 font-la-mono text-[0.6875rem] text-la-text-muted"
            >
              <Sparkles aria-hidden="true" className="h-3 w-3 text-la-gold" />
              <span>Projeto Editorial estruturado por contexto</span>
              <span aria-hidden="true">•</span>
              <span className="text-la-gold-light">
                Direção, calendário, temas, roteiros e ativos conectados
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}

export default FinalCTASection;