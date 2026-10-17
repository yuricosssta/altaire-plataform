// FrontEnd/src/components/landing/ProductFlowMockup.tsx
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
  Library,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import {
  landingContent,
  type HeroMockupModule,
} from "@/lib/constants/landing-content";
import {
  HERO_STAGE_MOTION,
  MOCKUP_SCENE_VARIANTS,
  REDUCED_MOTION_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type ProductFlowMockupProps = {
  readonly frameTitle?: string;
  readonly projectLabel?: string;
  readonly statusLabel?: string;
  readonly visualSequence?: readonly string[];
  readonly flowSteps?: readonly HeroMockupModule[];
  readonly className?: string;
};

type StageEvidenceDetail = {
  readonly code: string;
  readonly axisIndex: 0 | 1 | 2;
  readonly axisLabel: string;
  readonly moduleTitle: string;
  readonly originLabel: string;
  readonly transformationLabel: string;
  readonly artifacts: readonly {
    readonly tag: string;
    readonly title: string;
    readonly detail: string;
    readonly status: string;
  }[];
  readonly aiTrace: string;
};

const AUTO_CYCLE_INTERVAL_MS = 3800;

const STAGE_EVIDENCE_DETAILS: readonly StageEvidenceDetail[] = [
  {
    code: "NÚCLEO",
    axisIndex: 0,
    axisLabel: "Estratégia",
    moduleTitle: "Base Estratégica do Projeto Editorial",
    originLabel: "Contexto do negócio",
    transformationLabel: "Orienta todas as decisões seguintes",
    artifacts: [
      {
        tag: "OFERTA & POSICIONAMENTO",
        title: "Oferta principal, promessa, posicionamento e tom de voz",
        detail: "Contexto estruturado uma única vez dentro do Projeto Editorial",
        status: "Ativo",
      },
      {
        tag: "PÚBLICO COMPRADOR",
        title: "Dores, desejos, objeções e nível de consciência mapeados",
        detail: "Conecta a comunicação ao que realmente move a decisão",
        status: "Conectado",
      },
      {
        tag: "CAPACIDADE DE PRODUÇÃO",
        title: "Formatos, plataformas e frequência que a operação sustenta",
        detail: "Impede agendas irreais antes do planejamento começar",
        status: "Configurado",
      },
    ],
    aiTrace:
      "Contexto estruturado no Projeto Editorial → alimentando Direção, Temas e Execução.",
  },
  {
    code: "FUNÇÃO 01",
    axisIndex: 1,
    axisLabel: "Planejamento",
    moduleTitle: "Linha Editorial e Calendário.",
    originLabel: "Base Estratégica",
    transformationLabel: "Direção clara e agenda executável",
    artifacts: [
      {
        tag: "LINHA EDITORIAL",
        title: "Mensagem central, pilares editoriais e objetivos do período",
        detail: "A estratégia deixa de ser abstrata e vira direção de comunicação",
        status: "Aprovado",
      },
      {
        tag: "CALENDÁRIO EDITORIAL",
        title: "Distribuição de formatos, frequência e plataformas no tempo",
        detail: "Equilíbrio entre relacionamento, autoridade, consciência e venda",
        status: "Sincronizado",
      },
      {
        tag: "GOVERNANÇA HUMANA",
        title: "A IA propõe a estrutura; você analisa, ajusta e aprova",
        detail: "Validação antes de transformar o planejamento em produção",
        status: "Validado",
      },
    ],
    aiTrace:
      "Linha Editorial e Calendário aprovados → slots prontos para geração de temas e roteiros.",
  },
  {
    code: "FUNÇÃO 02",
    axisIndex: 1,
    axisLabel: "Planejamento",
    moduleTitle: "Temas e Biblioteca Estratégica.",
    originLabel: "Linha Editorial + Slots",
    transformationLabel: "Repertório estratégico de temas e ângulos",
    artifacts: [
      {
        tag: "DO NEGÓCIO E DO PÚBLICO",
        title: "Temas conectados à oferta, promessa, dores e objeções",
        detail: "Cada pauta nasce vinculada ao que você vende e para quem vende",
        status: "Qualificado",
      },
      {
        tag: "DO MERCADO E DO PERÍODO",
        title: "Referências, sinais do mercado e objetivo atual da operação",
        detail: "Crescimento, autoridade, aquecimento ou apoio direto à venda",
        status: "Classificado",
      },
      {
        tag: "BIBLIOTECA REAPROVEITÁVEL",
        title: "Filtro por objetivo, pilar, jornada, formato ou plataforma",
        detail: "Repertório organizado que não se perde em conversas soltas",
        status: "Vinculado",
      },
    ],
    aiTrace:
      "Tema e ângulo selecionados na Biblioteca → vinculados ao slot do calendário.",
  },
  {
    code: "FUNÇÃO 03",
    axisIndex: 2,
    axisLabel: "Conteúdo",
    moduleTitle: "Roteiros e Ativos.",
    originLabel: "Slot ou Tema aprovado",
    transformationLabel: "Pacote concreto para produzir e publicar",
    artifacts: [
      {
        tag: "ROTEIRO POR FORMATO",
        title: "Vídeos curtos, vídeos longos, lives, carrosséis, posts e Stories",
        detail: "Estrutura narrativa com abertura, desenvolvimento e chamada para ação",
        status: "Gerado",
      },
      {
        tag: "TÍTULOS, LEGENDA & CAPA",
        title: "Legenda ou descrição, títulos, thumbnail/capa e instruções visuais",
        detail: "Prompts de imagem e diretrizes alinhados à identidade da marca",
        status: "Pronto",
      },
      {
        tag: "ATIVOS COMPLEMENTARES",
        title: "Materiais complementares ativados quando qualificados pelo slot",
        detail: "Checklist, workbook, guia ou planilha conforme a regra estratégica",
        status: "Condicional",
      },
    ],
    aiTrace:
      "Pacote de execução concluído → vínculo integral preservado com o Projeto Editorial.",
  },
] as const;

/**
 * Peça Central 3D/2.5D do Hero (`ProductFlowMockup.tsx`).
 *
 * - Possui um Núcleo Orbital 3D que se move continuamente em seu próprio eixo
 *   representando a sequência `Estratégia → Planejamento → Conteúdo`.
 * - Autocicla pelos 4 estados reais usando apenas o véu translúcido dourado ao fundo (`z-0`)
 *   com filete inferior dourado embutido, garantindo 100% de nitidez no texto (`z-20`).
 */
export function ProductFlowMockup({
  frameTitle = landingContent.hero.mockupPreview.frameTitle,
  projectLabel = landingContent.hero.mockupPreview.projectLabel,
  statusLabel = landingContent.hero.mockupPreview.statusLabel,
  visualSequence = landingContent.hero.visualSequence,
  flowSteps = landingContent.hero.mockupPreview.flowSteps,
  className,
}: ProductFlowMockupProps) {
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

  /* Autociclo contínuo pelos 4 módulos */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || flowSteps.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % flowSteps.length);
    }, AUTO_CYCLE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [shouldReduceMotion, isPaused, flowSteps.length]);

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

  const frameVariants = selectMotionPreset(
    shouldReduceMotion,
    HERO_STAGE_MOTION.productFrame,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const sceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const activeEvidence =
    STAGE_EVIDENCE_DETAILS[activeIndex] ?? STAGE_EVIDENCE_DETAILS[0];

  const resolveStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return SlidersHorizontal;
      case 1:
        return Calendar;
      case 2:
        return Library;
      default:
        return FileText;
    }
  };

  return (
    <motion.div
      ref={stageContainerRef}
      initial="hidden"
      animate="visible"
      variants={frameVariants}
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px" }}
      className={clsx("relative w-full select-none", className)}
    >
      {/* Descrição acessível para leitores de tela */}
      <div className="sr-only">
        Demonstração interativa do sistema Legion Altaire apresentando a
        sequência {visualSequence.join(" para ")} com Base Estratégica, Linha
        Editorial e Calendário, Temas e Biblioteca Estratégica, e Roteiros e
        Ativos.
      </div>

      {/* Glow Radial Dourado Profundo no Abismo Escuro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_55%_28%,rgba(207,169,101,0.18)_0%,rgba(207,169,101,0.05)_42%,transparent_74%)] blur-2xl"
      />

      {/* Contêiner 3D que flutua e responde suavemente ao eixo do mouse */}
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
        className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.12)] backdrop-blur-xl"
      >
        {/* Spotlight Radial que acompanha o ponteiro do mouse */}
        <div
          aria-hidden="true"
          style={{
            opacity: spotlight.opacity,
            background: `radial-gradient(460px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.12), transparent 65%)`,
          }}
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        />

        {/* Hairline luminosa superior dourada */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        {/* 1. AppTopBar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div aria-hidden="true" className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-la-full bg-white/15" />
              <span className="h-2 w-2 rounded-la-full bg-white/15" />
              <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
            </div>

            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-la-xs border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
              LA
            </span>
            <span className="font-la-sans text-[0.8125rem] font-medium text-la-text-primary">
              {frameTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/60 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.6875rem] font-medium text-la-gold-light">
              <motion.span
                aria-hidden="true"
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: [0.4, 1, 0.4], scale: [0.92, 1.15, 0.92] }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
              />
              <span>{statusLabel}</span>
            </span>
          </div>
        </div>

        {/* 2. Palco Superior: Prisma Orbital 3D em Movimento Contínuo + Sequência Visual Central */}
        <div className="relative z-10 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_78%_50%,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_58%,#040508_100%)] p-4 sm:p-5">
          {/* Grade isométrica de fundo sutil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-5 sm:grid-cols-12">
            {/* Esquerda do Palco (7 cols): Sequência Visual Central Canônica */}
            <div className="flex flex-col gap-2.5 sm:col-span-7">
              <div className="flex items-center gap-2">
                <Sparkles
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-la-gold"
                />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Sequência Visual Central
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {visualSequence.map((axisItem, idx) => {
                  const isAxisActive = activeEvidence.axisIndex === idx;
                  const stepCode = String(idx + 1).padStart(2, "0");

                  return (
                    <button
                      key={axisItem}
                      type="button"
                      onClick={() => {
                        const targetStage =
                          idx === 0 ? 0 : idx === 1 ? 1 : 3;
                        setActiveIndex(targetStage);
                      }}
                      className={clsx(
                        "group relative flex items-center justify-between rounded-la-md border px-3 py-2 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isAxisActive
                          ? "border-la-border-gold bg-white/[0.06] text-la-text-primary shadow-[0_0_24px_rgba(207,169,101,0.15)]"
                          : "border-white/10 bg-black/40 text-la-text-secondary hover:border-white/20 hover:text-la-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={clsx(
                            "inline-flex h-5 w-5 items-center justify-center rounded-la-xs font-la-mono text-[0.6875rem] font-semibold",
                            isAxisActive
                              ? "bg-la-gold text-la-text-inverse"
                              : "border border-white/15 bg-white/5 text-la-text-muted"
                          )}
                        >
                          {stepCode}
                        </span>
                        <span className="font-la-sans text-[0.875rem] font-semibold tracking-tight">
                          {axisItem}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-gold-light">
                          {idx === 0
                            ? "Contexto"
                            : idx === 1
                              ? "F01 + F02"
                              : "Função 03"}
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className={clsx(
                            "h-3 w-3 transition-transform duration-200",
                            isAxisActive
                              ? "translate-x-0.5 text-la-gold"
                              : "text-la-text-muted"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direita do Palco (5 cols): Prisma Arquitetural 3D que Gira no Próprio Eixo */}
            <div
              aria-hidden="true"
              className="relative flex h-[11.25rem] items-center justify-center sm:col-span-5"
              style={{ perspective: "900px" }}
            >
              {/* Anel Orbital Externo Girando no Eixo Z */}
              <motion.div
                animate={
                  shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: 360 }
                }
                transition={{
                  duration: 26,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-dashed border-la-gold/30"
              />

              {/* Segundo Anel Orbital Inclinado em 3D */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { rotateX: 60, rotateZ: 0 }
                    : { rotateX: 60, rotateZ: -360 }
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute h-40 w-40 rounded-la-full border border-white/15 shadow-[0_0_30px_rgba(207,169,101,0.12)]"
              />

              {/* Prisma 3D de 3 Camadas Empilhadas que Oscila em Seu Próprio Eixo X/Y/Z */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { rotateX: 24, rotateY: -28, rotateZ: 0 }
                    : {
                        rotateX: [22, 30, 22],
                        rotateY: [-28, 28, -28],
                        rotateZ: [-4, 4, -4],
                      }
                }
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative flex h-28 w-28 items-center justify-center"
              >
                {/* Camada Superior do Prisma: 03 Conteúdo */}
                <motion.div
                  animate={{
                    translateZ: activeEvidence.axisIndex === 2 ? 34 : 24,
                    scale: activeEvidence.axisIndex === 2 ? 1.06 : 0.96,
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx(
                    "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                    activeEvidence.axisIndex === 2
                      ? "border-la-gold bg-la-gold/20 shadow-[0_0_28px_rgba(207,169,101,0.35)]"
                      : "border-white/20 bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-la-mono text-[0.55rem] font-semibold uppercase text-la-gold-light">
                      03 · Conteúdo
                    </span>
                    <span className="h-1.5 w-1.5 rounded-la-full bg-la-gold" />
                  </div>
                  <div className="h-1 w-2/3 rounded-la-full bg-white/30" />
                </motion.div>

                {/* Camada Central do Prisma: 02 Planejamento */}
                <motion.div
                  animate={{
                    translateZ: activeEvidence.axisIndex === 1 ? 8 : 0,
                    scale: activeEvidence.axisIndex === 1 ? 1.06 : 0.96,
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx(
                    "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                    activeEvidence.axisIndex === 1
                      ? "border-la-gold bg-la-gold/20 shadow-[0_0_28px_rgba(207,169,101,0.35)]"
                      : "border-white/15 bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-la-mono text-[0.55rem] font-semibold uppercase text-la-text-primary">
                      02 · Direção
                    </span>
                    <span className="h-1.5 w-1.5 rounded-la-full bg-white/50" />
                  </div>
                  <div className="h-1 w-3/4 rounded-la-full bg-la-gold/50" />
                </motion.div>

                {/* Camada Base do Prisma: 01 Estratégia (Núcleo) */}
                <motion.div
                  animate={{
                    translateZ: activeEvidence.axisIndex === 0 ? -18 : -26,
                    scale: activeEvidence.axisIndex === 0 ? 1.06 : 0.96,
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx(
                    "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                    activeEvidence.axisIndex === 0
                      ? "border-la-gold bg-la-gold/25 shadow-[0_0_32px_rgba(207,169,101,0.45)]"
                      : "border-la-border-gold/40 bg-la-canvas-deep/90"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-la-mono text-[0.55rem] font-semibold uppercase text-la-gold-light">
                      01 · Estratégia
                    </span>
                    <Compass className="h-3 w-3 text-la-gold" />
                  </div>
                  <div className="h-1 w-1/2 rounded-la-full bg-la-gold" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 3. Barra dos 4 Módulos com Véu Translúcido Dourado (Sem Barra Branca Inferior) */}
        <div className="relative z-10 border-b border-white/10 bg-black/45 px-4 py-3 sm:px-5">
          <div
            aria-label="Módulos do Projeto Editorial"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {flowSteps.map((step, index) => {
              const IconComponent = resolveStepIcon(index);
              const isSelected = activeIndex === index;

              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    "group relative flex flex-col justify-between overflow-hidden rounded-la-md border p-2.5 text-left transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                    isSelected
                      ? "border-la-gold/70 bg-[#10131C] text-la-text-primary shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                      : "border-white/10 bg-white/[0.02] text-la-text-secondary hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  {/* Moldura Deslizante FLIP (`layoutId`) */}
                  {isSelected ? (
                    <motion.div
                      layoutId="hero-mockup-active-tab"
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

                  {/* Véu Dourado Translúcido de Progresso no Fundo + Filete Inferior Dourado Embutido */}
                  {isSelected && !shouldReduceMotion && !isPaused ? (
                    <motion.div
                      key={`sweep-${activeIndex}`}
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: AUTO_CYCLE_INTERVAL_MS / 1000,
                        ease: "linear",
                      }}
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(207, 169, 101, 0.04) 0%, rgba(207, 169, 101, 0.16) 100%)",
                        boxShadow: "inset 0 -2px 0 0 rgba(207, 169, 101, 0.9)",
                      }}
                      className="pointer-events-none absolute inset-0 z-0 origin-left"
                    />
                  ) : null}

                  {/* Conteúdo Textual do Card em z-20 (Sempre nítido e contrastado) */}
                  <div className="relative z-20 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                      <IconComponent
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 text-la-gold"
                      />
                      <span>{step.code}</span>
                    </span>

                    <CheckCircle2
                      aria-hidden="true"
                      className={clsx(
                        "h-3 w-3 shrink-0",
                        isSelected ? "text-la-gold" : "text-white/25"
                      )}
                    />
                  </div>

                  <p className="relative z-20 mt-1.5 truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                    {step.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Painel de Evidência Dinâmico da Camada Ativa */}
        <div className="relative z-10 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvidence.code}
              initial="enter"
              animate="center"
              exit="exit"
              variants={sceneVariants}
              className="flex flex-col gap-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    {activeEvidence.code}
                  </span>
                  <h3 className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {activeEvidence.moduleTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <span>{activeEvidence.originLabel}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3 w-3 text-la-gold"
                  />
                  <span className="text-la-gold-light">
                    {activeEvidence.transformationLabel}
                  </span>
                </div>
              </div>

              {/* Lista dos 3 Artefatos Concretos da Etapa */}
              <div className="grid grid-cols-1 gap-2.5">
                {activeEvidence.artifacts.map((artifact) => (
                  <div
                    key={artifact.tag}
                    className="flex items-start justify-between gap-3 rounded-la-md border border-white/10 bg-white/[0.025] px-3.5 py-2.5 transition-colors hover:border-white/20"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          {artifact.tag}
                        </span>
                      </div>
                      <p className="mt-0.5 font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
                        {artifact.title}
                      </p>
                      <p className="mt-0.5 font-la-sans text-[0.75rem] leading-[1.4] text-la-text-secondary">
                        {artifact.detail}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-la-full border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                      {artifact.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rodapé de Rastreabilidade da IA */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-la-md border border-la-border-gold/35 bg-la-gold-faint px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <Layers
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    {projectLabel}
                  </span>
                </div>

                <p className="font-la-sans text-[0.75rem] text-la-text-primary">
                  {activeEvidence.aiTrace}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProductFlowMockup;