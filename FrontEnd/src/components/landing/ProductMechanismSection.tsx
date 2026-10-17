// FrontEnd/src/components/landing/ProductMechanismSection.tsx
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
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  Layers,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type LandingContent,
  type MechanismStage,
  type MechanismStageKey,
} from "@/lib/constants/landing-content";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STICKY_STORY_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type ProductMechanismSectionProps = {
  readonly content?: LandingContent["mechanism"];
  readonly className?: string;
};

type StageRichMockupData = {
  readonly stateKey: MechanismStageKey;
  readonly shortTabLabel: string;
  readonly functionBadge: string;
  readonly windowSubtitle: string;
  readonly contextOrigin: string;
  readonly metricsRow: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly workspaceCards: readonly {
    readonly code: string;
    readonly title: string;
    readonly meta: string;
    readonly badge: string;
  }[];
  readonly aiStatusText: string;
};

const STAGE_MOCKUP_DATA: Readonly<
  Record<MechanismStageKey, StageRichMockupData>
> = {
  StrategicBaseState: {
    stateKey: "StrategicBaseState",
    shortTabLabel: "Entender",
    functionBadge: "MOVIMENTO 01 · BASE ESTRATÉGICA",
    windowSubtitle:
      "Informações que dão contexto ao negócio reunidas no Projeto Editorial",
    contextOrigin: "Negócio → Base Estratégica Ativa",
    metricsRow: [
      { label: "Oferta & Promessa", value: "Estruturadas" },
      { label: "Público Comprador", value: "Mapeado" },
      { label: "Capacidade Real", value: "Configurada" },
    ],
    workspaceCards: [
      {
        code: "01 · OFERTA & POSICIONAMENTO",
        title: "Nicho, subnicho, oferta principal, promessa e tom de voz",
        meta: "Reúne o que diferencia a solução e a linguagem da marca.",
        badge: "Ativo",
      },
      {
        code: "02 · PÚBLICO COMPRADOR",
        title: "Público, dores, desejos, objeções e momento de decisão",
        meta: "Orienta com quem a comunicação conversa e por quê.",
        badge: "Conectado",
      },
      {
        code: "03 · OBJETIVO & CAPACIDADE",
        title: "Objetivo do período e capacidade real de produção",
        meta: "Garante que a criação parta do contexto e da rotina real.",
        badge: "Persistente",
      },
    ],
    aiStatusText:
      "A criação passa a partir do contexto do seu negócio, em vez de começar do zero a cada conteúdo.",
  },

  EditorialPlanningState: {
    stateKey: "EditorialPlanningState",
    shortTabLabel: "Organizar",
    functionBadge: "MOVIMENTO 02 · LINHA EDITORIAL E CALENDÁRIO",
    windowSubtitle:
      "Direção clara de comunicação e calendário organizado no tempo",
    contextOrigin: "Base Estratégica → Linha Editorial e Calendário",
    metricsRow: [
      { label: "Direção Editorial", value: "Mensagem & Pilares" },
      { label: "Estrutura de Agenda", value: "Formatos & Frequência" },
      { label: "Jornada do Público", value: "Objetivos no Tempo" },
    ],
    workspaceCards: [
      {
        code: "01 · LINHA EDITORIAL",
        title: "Mensagem central, pilares editoriais e tom de voz",
        meta: "Transforma a estratégia em direção clara de comunicação.",
        badge: "Estruturado",
      },
      {
        code: "02 · TIPOS & FORMATOS",
        title: "Tipos de conteúdo, formatos e frequência sustentável",
        meta: "Distribui vídeos, carrosséis, posts, lives e Stories com função.",
        badge: "Planejado",
      },
      {
        code: "03 · JORNADA & PERÍODO",
        title: "Objetivo do período e momentos da jornada do público",
        meta: "Mostra como cada peça contribui para a comunicação do negócio.",
        badge: "Alinhado",
      },
    ],
    aiStatusText:
      "Você deixa de escolher conteúdos isolados e passa a enxergar como cada peça contribui para a comunicação do seu negócio.",
  },

  ContentExecutionState: {
    stateKey: "ContentExecutionState",
    shortTabLabel: "Executar",
    functionBadge: "MOVIMENTO 03 · TEMAS, ROTEIROS E ATIVOS",
    windowSubtitle:
      "Conteúdo planejado avançando para materiais concretos por formato",
    contextOrigin: "Slot ou Biblioteca → Pacote de Execução",
    metricsRow: [
      { label: "Ponto de Partida", value: "Slot ou Biblioteca" },
      { label: "Entrega por Formato", value: "Roteiro, Capa & CTA" },
      { label: "Contexto Recebido", value: "100% Preservado" },
    ],
    workspaceCards: [
      {
        code: "01 · TEMA & ROTEIRO",
        title: "Tema estratégico e roteiro adequado ao formato escolhido",
        meta: "Parte de um slot do calendário ou de um tema da biblioteca.",
        badge: "Gerado",
      },
      {
        code: "02 · TÍTULO, LEGENDA & CAPA",
        title: "Legenda, título, thumbnail e chamada para ação",
        meta: "Recebe o contexto do Projeto Editorial, do público e do objetivo.",
        badge: "Sincronizado",
      },
      {
        code: "03 · MATERIAL COMPLEMENTAR",
        title: "Material complementar ativado quando qualificado",
        meta: "Avança do planejamento para materiais concretos de publicação.",
        badge: "Condicional",
      },
    ],
    aiStatusText:
      "A estratégia deixa de ser apenas planejamento e avança para materiais concretos de produção e publicação.",
  },
};

/**
 * Mockup compacto exibido dentro de cada etapa no Mobile (< 1024px),
 * cumprindo a regra de não usar sticky prolongado em telas pequenas (Etapa 2D §4.5).
 */
function MechanismCompactStageCard({
  stage,
}: {
  readonly stage: MechanismStage;
}) {
  const richData = STAGE_MOCKUP_DATA[stage.stateKey];

  return (
    <div className="mt-5 overflow-hidden rounded-la-lg border border-white/12 bg-[#07090F]/95 p-4 shadow-[var(--la-elevation-2)] lg:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
          {richData.functionBadge}
        </span>
        <span className="rounded-la-full border border-la-border-gold/60 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
          {stage.subtitle}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {richData.workspaceCards.map((card) => (
          <div
            key={card.code}
            className="rounded-la-md border border-white/10 bg-white/[0.025] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                {card.code}
              </span>
              <span className="font-la-mono text-[0.5625rem] text-la-text-secondary">
                {card.badge}
              </span>
            </div>
            <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
              {card.title}
            </p>
            <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
              {card.meta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Seção 06 — Como o Legion Altaire pensa (`id="produto"`).
 *
 * Referências dominantes: Chronicle (scrollytelling sticky no desktop) + Resend (física 3D no escuro).
 * Intensidade: 5/5 | Profundidade: Nível 3 (Showcase).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §06, Etapa 2D §4.5 & ACCEPTANCE-LANDING.md §18):
 * - Eyebrow estritamente canônico: "COMO O LEGION ALTAIRE PENSA".
 * - Scrollytelling sticky no desktop onde o painel direito cabe 100% na altura do monitor sem cortar conteúdo.
 * - Inclinação 3D com o mouse + Blur radial dourado (`Spotlight`) + Núcleo Orbital 3D evoluindo entre os 3 movimentos.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function ProductMechanismSection({
  content = landingContent.mechanism,
  className,
}: ProductMechanismSectionProps) {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 340,
    y: 220,
    opacity: 0,
  });

  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const manualLockUntilRef = useRef<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id ? `${content.id}-title` : "produto-title";

  /* Observa o avanço natural do scroll na coluna esquerda com zona central calibrada */
  useEffect(() => {
    const elements = stepRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );

    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < manualLockUntilRef.current) {
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute("data-stage-index");
            if (indexAttr !== null) {
              const parsedIndex = Number(indexAttr);
              if (!Number.isNaN(parsedIndex)) {
                setActiveStageIndex(parsedIndex);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-22% 0px -32% 0px",
        threshold: 0.35,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  /* Seleciona manualmente um movimento e alinha suavemente se clicado na barra direita */
  const handleSelectStage = (index: number, scrollIntoViewOnClick = false) => {
    manualLockUntilRef.current = Date.now() + 900;
    setActiveStageIndex(index);

    if (scrollIntoViewOnClick && stepRefs.current[index]) {
      stepRefs.current[index]?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  };

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
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const revealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const stickyStepVariants = selectMotionPreset(
    shouldReduceMotion,
    STICKY_STORY_VARIANTS,
    REDUCED_MOTION_VARIANTS.stickyStory
  );

  const mockupSceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const activeStage = content.stages[activeStageIndex] ?? content.stages[0];
  const activeMockupData = STAGE_MOCKUP_DATA[activeStage.stateKey];

  const resolveStageIcon = (stateKey: MechanismStageKey) => {
    switch (stateKey) {
      case "StrategicBaseState":
        return SlidersHorizontal;
      case "EditorialPlanningState":
        return Calendar;
      case "ContentExecutionState":
        return FileText;
    }
  };

  const chainNodes = content.logicChainNodes ?? [
    "Negócio",
    "estratégia",
    "conteúdo",
    "autoridade",
    "conexão",
    "vendas",
  ];

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="max"
      spacing="spacious"
      surface="canvas"
      bottomBorder={true}
      className={clsx("relative [color-scheme:dark]", className)}
    >
      {/* Luz atmosférica concentrada atrás do palco do mecanismo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-0 -z-0 hidden h-[30rem] w-[38rem] rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.09)_0%,rgba(207,169,101,0.02)_45%,transparent_72%)] blur-3xl lg:block"
      />

      <div className="relative z-10 flex flex-col gap-12 lg:gap-14">
        {/* 1. Cabeçalho Editorial Canônico (§06 de 02. CONTENT-LANDING.md) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10"
        >
          {/* Coluna Esquerda do Cabeçalho (6 cols): Eyebrow + Headline + Subheadline Justificada */}
          <div className="flex flex-col items-start lg:col-span-6">
            {/* Eyebrow Canônico: "COMO O LEGION ALTAIRE PENSA" (Sem prefixo extra) */}
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

          {/* Coluna Direita do Cabeçalho (6 cols): Corpo Canônico + Cadeia Lógica Oficial */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-6 lg:pt-2">
            {content.body && content.body.length > 0 ? (
              <div className="flex flex-col gap-3.5 border-l border-white/15 pl-4 sm:pl-5">
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

            {/* Cadeia Lógica Canônica: Negócio -> estratégia -> conteúdo -> autoridade -> conexão -> vendas */}
            <div className="rounded-la-lg border border-white/10 bg-la-surface-1/85 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-la-gold"
                />
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Cadeia Estratégica do Projeto Editorial
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 font-la-mono text-[0.75rem]">
                {chainNodes.map((chainStep, index) => (
                  <span
                    key={chainStep}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      className={clsx(
                        "rounded-la-xs border px-2 py-0.5",
                        index === chainNodes.length - 1
                          ? "border-la-border-gold bg-la-gold-faint font-semibold text-la-gold-light"
                          : "border-white/10 bg-black/40 text-la-text-primary"
                      )}
                    >
                      {chainStep}
                    </span>
                    {index < chainNodes.length - 1 ? (
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
        </motion.div>

        {/* 2. Corpo Principal: Scrollytelling Sticky (Desktop) / 3 Blocos Empilhados (Mobile) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Coluna Esquerda (5 cols): Os 3 Movimentos Canônicos (Sem duplicação de texto) */}
          <div className="relative flex flex-col gap-6 lg:col-span-5 lg:gap-10 lg:py-2">
            {/* Fio Estratégico Vertical Contínuo conectando 01 -> 02 -> 03 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-6 bottom-6 left-4 hidden w-px bg-gradient-to-b from-la-gold via-la-gold/40 to-white/10 sm:block"
            />

            {content.stages.map((stage, index) => {
              const isCurrent = activeStageIndex === index;
              const isPast = index < activeStageIndex;
              const variantState = isCurrent
                ? "active"
                : isPast
                  ? "past"
                  : "inactive";

              const StageIcon = resolveStageIcon(stage.stateKey);

              return (
                <motion.div
                  key={stage.stateKey}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  data-stage-index={index}
                  animate={variantState}
                  variants={stickyStepVariants}
                  className="relative sm:pl-10"
                >
                  {/* Nó indicador no Fio Estratégico Vertical */}
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "absolute top-6 left-4 hidden h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-la-full border transition-colors duration-280 sm:flex",
                      isCurrent
                        ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_10px_rgba(207,169,101,0.7)]"
                        : isPast
                          ? "border-la-border-gold bg-la-surface-3 text-la-gold-light"
                          : "border-white/15 bg-la-surface-1 text-la-text-muted"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-la-full",
                        isCurrent ? "bg-la-text-inverse" : "bg-current"
                      )}
                    />
                  </span>

                  {/* Card Canônico do Movimento */}
                  <div
                    onClick={() => handleSelectStage(index, false)}
                    className={clsx(
                      "cursor-pointer rounded-la-xl border p-5 transition-all duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-6",
                      isCurrent
                        ? "border-la-gold/70 bg-[#10131C]/95 shadow-[0_0_32px_rgba(207,169,101,0.12)]"
                        : "border-white/10 bg-la-surface-1/75 hover:border-white/25 hover:bg-la-surface-2/60"
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStage(index, false);
                      }}
                      className="flex w-full flex-col items-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                    >
                      {/* Cabeçalho do Movimento: "Movimento 01 — Entender o negócio" */}
                      <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 rounded-la-xs border border-la-border-gold bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                          <StageIcon
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-la-gold"
                          />
                          <span>{stage.movementLabel}</span>
                        </span>

                        <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
                          {stage.step} / 03
                        </span>
                      </div>

                      {/* Título Canônico do Movimento: "Base Estratégica." | "Linha Editorial e Calendário." | "Temas, Roteiros e Ativos." */}
                      <h3 className="mt-3.5 text-balance font-la-sans text-[1.25rem] font-semibold leading-[1.25] text-la-text-primary sm:text-[1.375rem]">
                        {stage.title}{" "}
                        <span className="font-normal text-la-gold-light">
                          — {stage.subtitle}
                        </span>
                      </h3>

                      {/* Texto Canônico Justificado */}
                      <p className="mt-2.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
                        {stage.description}
                      </p>
                    </button>

                    {/* Elementos Possíveis Canônicos (`stage.possibleElements`) */}
                    <div className="mt-4 border-t border-white/10 pt-3.5">
                      <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                        Elementos possíveis
                      </span>

                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {stage.possibleElements.map((element) => (
                          <li
                            key={element}
                            className="inline-flex items-center gap-1.5 rounded-la-xs border border-white/10 bg-black/45 px-2.5 py-1 font-la-sans text-[0.75rem] font-medium text-la-text-primary"
                          >
                            <CheckCircle2
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0 text-la-gold"
                            />
                            <span>{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Contexto Preservado (Exclusivo do Movimento 03 conforme CONTENT-LANDING.md §06) */}
                    {stage.preservedContext ? (
                      <div className="mt-3.5 rounded-la-md border border-white/10 bg-black/40 p-3">
                        <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          Contexto preservado
                        </span>
                        <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                          {stage.preservedContext}
                        </p>
                      </div>
                    ) : null}

                    {/* Resultado Percebido Único (Sem duplicação) */}
                    <div className="mt-3.5 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-3.5 py-2.5">
                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary">
                        <strong className="font-semibold text-la-gold-light">
                          Resultado percebido:{" "}
                        </strong>
                        {stage.perceivedResult}
                      </p>
                    </div>

                    {/* Mockup Compacto Empilhado exclusivo para Mobile (< 1024px) */}
                    <MechanismCompactStageCard stage={stage} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Coluna Direita (7 cols): Palco Visual 3D/2.5D Sticky 100% Viewport-Fit no Desktop */}
          <div className="hidden lg:col-span-7 lg:sticky lg:top-[5.25rem] lg:block">
            <div
              ref={stageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: "1400px" }}
              className="relative w-full select-none"
            >
              {/* Glow Radial Dourado Profundo atrás do Palco Sticky */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_55%_28%,rgba(207,169,101,0.16)_0%,rgba(207,169,101,0.04)_44%,transparent_75%)] blur-2xl"
              />

              {/* Contêiner 3D que Inclina com o Mouse e Cabe 100% na Altura do Monitor */}
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
                className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.11)] backdrop-blur-xl"
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
                  className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
                />

                {/* 1. TopBar Compacta com Seletor FLIP (`layoutId`) dos 3 Movimentos */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/65 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                    </div>
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-la-xs border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                      LA
                    </span>
                    <span className="font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      Projeto Editorial — Mecanismo em Operação
                    </span>
                  </div>

                  {/* Abas Clicáveis com Moldura Deslizante FLIP */}
                  <div
                    aria-label="Movimentos do mecanismo do Legion Altaire"
                    className="flex items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
                  >
                    {content.stages.map((stageItem, idx) => {
                      const isTabActive = activeStageIndex === idx;
                      const tabData = STAGE_MOCKUP_DATA[stageItem.stateKey];

                      return (
                        <button
                          key={stageItem.stateKey}
                          type="button"
                          aria-pressed={isTabActive}
                          onClick={() => handleSelectStage(idx, true)}
                          className={clsx(
                            "relative rounded-la-sm px-2.5 py-1 font-la-mono text-[0.6875rem] font-medium transition-colors duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                            isTabActive
                              ? "text-la-text-inverse font-semibold"
                              : "text-la-text-secondary hover:text-la-text-primary"
                          )}
                        >
                          {isTabActive ? (
                            <motion.span
                              layoutId="mechanism-sticky-active-tab"
                              transition={{
                                type: "tween",
                                duration: 0.26,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                            />
                          ) : null}
                          <span className="relative z-10">
                            {stageItem.step} · {tabData.shortTabLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Câmara Superior 3D (Split 7 cols Resumo + 5 cols Prisma Orbital 3D no Próprio Eixo) */}
                <div className="relative z-10 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_76%_50%,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.95)_60%,#040508_100%)] px-5 py-4">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
                  />

                  <div className="relative z-10 grid grid-cols-12 items-center gap-4">
                    {/* Esquerda da Câmara (7 cols): Identificação do Movimento + 3 Indicadores Rápidos */}
                    <div className="col-span-7 flex flex-col gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            {activeMockupData.functionBadge}
                          </span>
                          <span className="rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.5625rem] font-medium text-la-gold-light">
                            {activeStage.statusBadge}
                          </span>
                        </div>

                        <h4 className="mt-1 font-la-sans text-[1.0625rem] font-semibold leading-[1.25] text-la-text-primary">
                          {activeStage.title}:{" "}
                          <span className="text-la-gold-light">
                            {activeStage.subtitle}
                          </span>
                        </h4>

                        <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                          {activeMockupData.windowSubtitle}
                        </p>
                      </div>

                      {/* 3 Indicadores Horizontais Compactos */}
                      <div className="grid grid-cols-3 gap-2">
                        {activeMockupData.metricsRow.map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-la-md border border-white/10 bg-black/50 px-2.5 py-2"
                          >
                            <span className="block truncate font-la-mono text-[0.5625rem] uppercase tracking-[0.06em] text-la-text-muted">
                              {metric.label}
                            </span>
                            <span className="mt-0.5 block truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direita da Câmara (5 cols): Prisma Orbital 3D Girando no Próprio Eixo */}
                    <div
                      aria-hidden="true"
                      className="relative col-span-5 flex h-[9.25rem] items-center justify-center"
                      style={{ perspective: "900px" }}
                    >
                      {/* Anel Orbital Contínuo */}
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

                      {/* Segundo Anel Orbital 3D */}
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

                      {/* Prisma 3D dos 3 Movimentos Oscilando em Eixo Próprio */}
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
                          duration: 8.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative flex h-24 w-24 items-center justify-center"
                      >
                        {/* Camada Superior: 03 Executar */}
                        <motion.div
                          animate={{
                            translateZ: activeStageIndex === 2 ? 30 : 20,
                            scale: activeStageIndex === 2 ? 1.08 : 0.94,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={clsx(
                            "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors duration-300",
                            activeStageIndex === 2
                              ? "border-la-gold bg-la-gold/25 shadow-[0_0_26px_rgba(207,169,101,0.4)]"
                              : "border-white/20 bg-white/[0.05]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.5rem] font-semibold uppercase text-la-gold-light">
                              03 · Executar
                            </span>
                            <span className="h-1.5 w-1.5 rounded-la-full bg-la-gold" />
                          </div>
                          <div className="h-1 w-2/3 rounded-la-full bg-white/35" />
                        </motion.div>

                        {/* Camada Central: 02 Organizar */}
                        <motion.div
                          animate={{
                            translateZ: activeStageIndex === 1 ? 8 : 0,
                            scale: activeStageIndex === 1 ? 1.08 : 0.94,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={clsx(
                            "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors duration-300",
                            activeStageIndex === 1
                              ? "border-la-gold bg-la-gold/25 shadow-[0_0_26px_rgba(207,169,101,0.4)]"
                              : "border-white/15 bg-white/[0.04]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.5rem] font-semibold uppercase text-la-text-primary">
                              02 · Organizar
                            </span>
                            <span className="h-1.5 w-1.5 rounded-la-full bg-white/50" />
                          </div>
                          <div className="h-1 w-3/4 rounded-la-full bg-la-gold/55" />
                        </motion.div>

                        {/* Camada Base: 01 Entender */}
                        <motion.div
                          animate={{
                            translateZ: activeStageIndex === 0 ? -16 : -22,
                            scale: activeStageIndex === 0 ? 1.08 : 0.94,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={clsx(
                            "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors duration-300",
                            activeStageIndex === 0
                              ? "border-la-gold bg-la-gold/30 shadow-[0_0_30px_rgba(207,169,101,0.45)]"
                              : "border-la-border-gold/45 bg-la-canvas-deep/90"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.5rem] font-semibold uppercase text-la-gold-light">
                              01 · Entender
                            </span>
                            <Compass className="h-2.5 w-2.5 text-la-gold" />
                          </div>
                          <div className="h-1 w-1/2 rounded-la-full bg-la-gold" />
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* 3. Área de Trabalho Interna Compacta (Grid Horizontal de 3 Colunas — Zero Corte no Monitor) */}
                <div className="relative z-10 p-4 sm:p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMockupData.stateKey}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={mockupSceneVariants}
                      className="flex flex-col gap-3.5"
                    >
                      {/* 3 Camadas Lado a Lado (Mantém altura enxuta para caber 100% na tela) */}
                      <div className="grid grid-cols-3 gap-3">
                        {activeMockupData.workspaceCards.map((card) => (
                          <div
                            key={card.code}
                            className="flex flex-col justify-between rounded-la-lg border border-white/10 bg-white/[0.025] p-3.5 transition-colors hover:border-white/25"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-2">
                                <span className="truncate font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                                  {card.code}
                                </span>
                                <span className="shrink-0 rounded-la-full border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light">
                                  {card.badge}
                                </span>
                              </div>

                              <p className="mt-2.5 font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
                                {card.title}
                              </p>
                            </div>

                            <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                              {card.meta}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Elementos Possíveis do Movimento Ativo dentro do Frame */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-la-md border border-white/10 bg-black/45 px-3.5 py-2.5">
                        <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                          Elementos do movimento:
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {activeStage.possibleElements.map((item) => (
                            <span
                              key={item}
                              className="rounded-la-xs border border-white/10 bg-white/[0.03] px-2 py-0.5 font-la-mono text-[0.625rem] text-la-text-primary"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Barra Inferior de Resultado Percebido e Continuidade */}
                      <div className="flex flex-col gap-1.5 rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Compass
                              aria-hidden="true"
                              className="h-3.5 w-3.5 shrink-0 text-la-gold"
                            />
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                              {activeMockupData.contextOrigin}
                            </span>
                          </div>

                          <span className="font-la-mono text-[0.625rem] text-la-text-secondary">
                            Fluxo integrado no Projeto Editorial
                          </span>
                        </div>

                        <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.45] text-la-text-primary">
                          {activeMockupData.aiStatusText}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 3. Barra de Fechamento Canônica + CTA Secundário para Demonstração (§06 de CONTENT-LANDING.md) */}
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

          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex max-w-[44rem] flex-col gap-2.5">
              <div className="inline-flex items-center gap-2">
                <Layers aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Destaque Visual · Operação Conectada
                </span>
              </div>

              {/* Destaque visual canônico (§06) */}
              <p className="text-balance font-la-sans text-[1.1875rem] font-semibold leading-[1.35] text-la-text-primary sm:text-[1.3125rem]">
                {content.visualHighlight}
              </p>

              {/* Texto de fechamento canônico (§06) justificado */}
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
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
              />
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default ProductMechanismSection;