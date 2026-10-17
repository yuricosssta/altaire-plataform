// FrontEnd/src/components/landing/DemoSection.tsx
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
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  Layers,
  Play,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type DemoCalloutItem,
  type DemoMode,
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

export type DemoVideoProps = {
  readonly title: string;
  readonly poster: string;
  readonly mp4Src?: string | null;
  readonly webmSrc?: string | null;
  readonly transcriptUrl?: string | null;
  readonly captionsSrc?: string | null;
};

export type DemoStageProps = {
  readonly mode: DemoMode;
  readonly stageLabels: readonly string[];
  readonly callouts: readonly DemoCalloutItem[];
  readonly futureVideoSequence: string;
  readonly videoAvailableActionLabel: string;
  readonly honestStatusLabel: string;
  readonly honestStatusDescription: string;
  readonly videoProps: DemoVideoProps;
  readonly activeFocusIndex: number;
  readonly isPaused: boolean;
  readonly onFocusChange: (index: number) => void;
  readonly onPauseChange: (paused: boolean) => void;
};

const DEMO_AUTO_CYCLE_MS = 5200;

const FUTURE_SEQUENCE_NODES = [
  "Projeto Editorial",
  "Base Estratégica",
  "planejamento",
  "conteúdo",
] as const;

type WorkspaceColumnArtifact = {
  readonly label: string;
  readonly value: string;
  readonly badge?: string;
};

type WorkspaceColumnDetail = {
  readonly step: "01" | "02" | "03";
  readonly moduleBadge: string;
  readonly artifacts: readonly WorkspaceColumnArtifact[];
  readonly footerLeft: string;
  readonly footerRight: string;
};

const WORKSPACE_COLUMN_DETAILS: readonly WorkspaceColumnDetail[] = [
  {
    step: "01",
    moduleBadge: "Núcleo do Projeto",
    artifacts: [
      {
        label: "Oferta & Posicionamento",
        value:
          "Oferta principal, promessa, posicionamento e linguagem da marca estruturados no projeto.",
      },
      {
        label: "Público Comprador",
        value:
          "Dores, desejos, objeções e critérios que movem a decisão do comprador.",
      },
      {
        label: "Objetivo & Capacidade Real",
        value:
          "Objetivo do período e capacidade semanal configurados para orientar a agenda.",
        badge: "Ativo",
      },
    ],
    footerLeft: "Decisão 01 consolidada",
    footerRight: "Orienta a Direção (02) →",
  },
  {
    step: "02",
    moduleBadge: "Função 01 & Função 02",
    artifacts: [
      {
        label: "Linha Editorial Aprovada",
        value:
          "Mensagem central, pilares editoriais, tom de voz e objetivos distribuídos no período.",
      },
      {
        label: "Slot no Calendário Editorial",
        value:
          "Terça-feira · Carrossel 4:5 — Frequência e formato compatíveis com a rotina real.",
        badge: "Planejado",
      },
      {
        label: "Tema Vinculado na Biblioteca",
        value:
          "Tema conectado à oferta e ao público aprovado para avançar à produção.",
      },
    ],
    footerLeft: "Decisão 02 aprovada",
    footerRight: "Avança para Execução (03) →",
  },
  {
    step: "03",
    moduleBadge: "Função 03 · Produção",
    artifacts: [
      {
        label: "Roteiro por Formato",
        value:
          "Estrutura narrativa com abertura, desenvolvimento em blocos e chamada para ação.",
        badge: "Gerado",
      },
      {
        label: "Títulos, Legenda & Capa",
        value:
          "Legenda ou descrição, variações de título, thumbnail e instruções visuais.",
      },
      {
        label: "Material Complementar",
        value:
          "Ativado quando qualificado pelas definições estratégicas daquele conteúdo.",
      },
    ],
    footerLeft: "Contexto preservado",
    footerRight: "Pronto para produção",
  },
] as const;

/**
 * Palco da Demonstração (`DemoStage`):
 * - Opera inicialmente em `poster-only` (sem botão de play falso, exibindo poster TSX realista e interativo).
 * - Responde ao mouse com inclinação 3D (`rotateX`, `rotateY`), Blur Dourado (`Spotlight`) e pausa automática na leitura.
 * - Quando `mode === "video-available"` e houver fonte de vídeo real, habilita reprodução sob demanda.
 */
export function DemoStage({
  mode,
  stageLabels,
  callouts,
  futureVideoSequence,
  videoAvailableActionLabel,
  honestStatusLabel,
  honestStatusDescription,
  videoProps,
  activeFocusIndex,
  isPaused,
  onFocusChange,
  onPauseChange,
}: DemoStageProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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
  const shouldReduceMotion = useReducedMotion();

  const hasValidVideoSource = Boolean(videoProps.webmSrc || videoProps.mp4Src);
  const canPlayRealVideo = mode === "video-available" && hasValidVideoSource;

  const currentCallout = callouts[activeFocusIndex] ?? callouts[0];
  const currentWorkspace =
    WORKSPACE_COLUMN_DETAILS[activeFocusIndex] ?? WORKSPACE_COLUMN_DETAILS[0];

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
      rotateX: Number((-normalizedY * 4).toFixed(2)),
      rotateY: Number((normalizedX * 5).toFixed(2)),
    });

    setSpotlight({
      x: Math.round(mouseX),
      y: Math.round(mouseY),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    onPauseChange(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const resolveColumnIcon = (index: number) => {
    switch (index) {
      case 0:
        return SlidersHorizontal;
      case 1:
        return Calendar;
      default:
        return FileText;
    }
  };

  return (
    <div
      ref={stageContainerRef}
      onMouseEnter={() => onPauseChange(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px" }}
      className="relative w-full select-none"
    >
      {/* Glow Radial Dourado Profundo atrás do Palco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_50%_25%,rgba(207,169,101,0.16)_0%,rgba(207,169,101,0.04)_45%,transparent_75%)] blur-2xl"
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
        className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_28px_64px_rgba(0,0,0,0.85),0_0_80px_rgba(207,169,101,0.11)] backdrop-blur-xl"
      >
        {/* Blur Dourado (Spotlight Radial) seguindo o ponteiro do mouse */}
        <div
          aria-hidden="true"
          style={{
            opacity: spotlight.opacity,
            background: `radial-gradient(520px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
          }}
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        />

        {/* Filete luminoso superior dourado */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        {/* 1. TopBar do Palco de Demonstração (Sem numeração duplicada!) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="hidden items-center gap-1.5 sm:flex"
            >
              <span className="h-2 w-2 rounded-la-full bg-white/15" />
              <span className="h-2 w-2 rounded-la-full bg-white/15" />
              <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-la-xs border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                LA
              </span>
              <span className="font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                {videoProps.title}
              </span>
            </div>
          </div>

          {/* Seletor Canônico com Deslizamento FLIP (`01 — CONTEXTO` | `02 — DIREÇÃO` | `03 — EXECUÇÃO`) */}
          <div
            aria-label="Etapas contínuas do Projeto Editorial"
            className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
          >
            {stageLabels.map((label, index) => {
              const isSelected = activeFocusIndex === index;

              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onFocusChange(index)}
                  className={clsx(
                    "relative rounded-la-sm px-3 py-1 font-la-mono text-[0.6875rem] font-medium transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                    isSelected
                      ? "font-semibold text-la-text-inverse"
                      : "text-la-text-secondary hover:text-la-text-primary"
                  )}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId="demo-stage-topbar-active-tab"
                      transition={{
                        type: "tween",
                        duration: 0.26,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Área Principal do Palco */}
        <div className="relative z-10 flex flex-col justify-between p-4 sm:p-6">
          {canPlayRealVideo && isVideoPlaying ? (
            /* Estado Futuro: Player HTML5 Real (`video-available`) */
            <div className="flex h-full w-full flex-col justify-between gap-4">
              <video
                controls
                preload="metadata"
                poster={videoProps.poster}
                className="aspect-video w-full rounded-la-lg border border-white/10 bg-la-canvas object-cover"
              >
                {videoProps.webmSrc ? (
                  <source src={videoProps.webmSrc} type="video/webm" />
                ) : null}
                {videoProps.mp4Src ? (
                  <source src={videoProps.mp4Src} type="video/mp4" />
                ) : null}
                {videoProps.captionsSrc ? (
                  <track
                    kind="captions"
                    src={videoProps.captionsSrc}
                    srcLang="pt-BR"
                    label="Português"
                    default
                  />
                ) : null}
                Seu navegador não suporta reprodução nativa de vídeo.
              </video>

              {videoProps.transcriptUrl ? (
                <div className="flex justify-end">
                  <a
                    href={videoProps.transcriptUrl}
                    className="font-la-mono text-[0.75rem] text-la-gold-light underline underline-offset-4 hover:text-la-text-primary"
                  >
                    Acessar transcrição completa da demonstração
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            /* Estado Inicial Canônico (`poster-only`): Poster Arquitetural Realista 3D/2.5D em TSX */
            <div className="flex flex-col gap-5">
              {/* Faixa Superior: Câmara Orbital 3D Integrada + Status Honesto (Sem botão de play falso) */}
              <div className="relative overflow-hidden rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_82%_50%,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.95)_62%,#040508_100%)] p-4 sm:px-5 sm:py-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
                />

                <div className="relative z-10 grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
                  {/* Esquerda da Faixa (8 cols): Status Honesto + Trilha Contínua do Projeto Editorial */}
                  <div className="flex flex-col gap-3 lg:col-span-8">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                        <Sparkles
                          aria-hidden="true"
                          className="h-3 w-3 text-la-gold"
                        />
                        <span>{honestStatusLabel}</span>
                      </span>

                      <span className="font-la-sans text-[0.875rem] font-medium text-la-text-primary">
                        {honestStatusDescription}
                      </span>
                    </div>

                    {/* Trilha Canônica: Projeto Editorial -> Base Estratégica -> planejamento -> conteúdo */}
                    <div
                      aria-label={`Sequência contínua: ${futureVideoSequence}`}
                      className="flex flex-wrap items-center gap-1.5 font-la-mono text-[0.6875rem]"
                    >
                      {FUTURE_SEQUENCE_NODES.map((node, idx) => {
                        const isNodeHighlighted =
                          (idx === 0 || idx === 1) && activeFocusIndex === 0
                            ? true
                            : idx === 2 && activeFocusIndex === 1
                              ? true
                              : idx === 3 && activeFocusIndex === 2;

                        return (
                          <span
                            key={node}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span
                              className={clsx(
                                "rounded-la-xs border px-2.5 py-0.5 transition-colors duration-300",
                                isNodeHighlighted
                                  ? "border-la-gold bg-la-gold/15 font-semibold text-la-gold-light shadow-[0_0_14px_rgba(207,169,101,0.2)]"
                                  : "border-white/10 bg-black/50 text-la-text-secondary"
                              )}
                            >
                              {node}
                            </span>
                            {idx < FUTURE_SEQUENCE_NODES.length - 1 ? (
                              <ArrowRight
                                aria-hidden="true"
                                className="h-3 w-3 text-la-gold"
                              />
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direita da Faixa (4 cols): Prisma Orbital 3D Girando no Próprio Eixo ou Botão Real quando houver vídeo */}
                  <div className="flex items-center justify-center lg:col-span-4 lg:justify-end">
                    {canPlayRealVideo ? (
                      <button
                        type="button"
                        onClick={() => setIsVideoPlaying(true)}
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      >
                        <Play
                          aria-hidden="true"
                          className="h-3.5 w-3.5 fill-current"
                        />
                        <span>{videoAvailableActionLabel}</span>
                      </button>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="relative flex h-[6.25rem] w-[11rem] items-center justify-center"
                        style={{ perspective: "800px" }}
                      >
                        <motion.div
                          animate={
                            shouldReduceMotion
                              ? { rotateZ: 0 }
                              : { rotateZ: 360 }
                          }
                          transition={{
                            duration: 24,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="pointer-events-none absolute h-24 w-24 rounded-la-full border border-dashed border-la-gold/35"
                        />

                        <motion.div
                          animate={
                            shouldReduceMotion
                              ? { rotateX: 22, rotateY: -26 }
                              : {
                                  rotateX: [20, 28, 20],
                                  rotateY: [-26, 26, -26],
                                }
                          }
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="relative flex h-16 w-24 items-center justify-center"
                        >
                          {[0, 1, 2].map((layerIdx) => {
                            const isLayerActive = activeFocusIndex === layerIdx;
                            const zOffset =
                              layerIdx === 0 ? -14 : layerIdx === 1 ? 0 : 14;

                            return (
                              <motion.div
                                key={layerIdx}
                                animate={{
                                  translateZ: isLayerActive
                                    ? zOffset + 6
                                    : zOffset,
                                  scale: isLayerActive ? 1.06 : 0.94,
                                }}
                                transition={{
                                  duration: 0.35,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className={clsx(
                                  "absolute inset-1 flex items-center justify-between rounded-la-md border px-2.5 py-1.5 backdrop-blur-md",
                                  isLayerActive
                                    ? "border-la-gold bg-la-gold/25 shadow-[0_0_22px_rgba(207,169,101,0.38)]"
                                    : "border-white/15 bg-white/[0.04]"
                                )}
                              >
                                <span className="font-la-mono text-[0.55rem] font-semibold uppercase text-la-gold-light">
                                  0{layerIdx + 1} ·{" "}
                                  {callouts[layerIdx]?.label ?? "ETAPA"}
                                </span>
                                <span className="h-1.5 w-1.5 rounded-la-full bg-la-gold" />
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visão Panorâmica de 3 Colunas Conectadas (01 — CONTEXTO | 02 — DIREÇÃO | 03 — EXECUÇÃO) */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {callouts.map((callout, index) => {
                  const isFocused = activeFocusIndex === index;
                  const columnDetail =
                    WORKSPACE_COLUMN_DETAILS[index] ??
                    WORKSPACE_COLUMN_DETAILS[0];
                  const ColumnIcon = resolveColumnIcon(index);

                  return (
                    <div
                      key={callout.step}
                      onClick={() => onFocusChange(index)}
                      className={clsx(
                        "relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-la-lg border p-4 transition-all duration-200 lg:col-span-4",
                        isFocused
                          ? "border-la-gold/75 bg-[#10131C] shadow-[0_0_28px_rgba(207,169,101,0.14)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Véu Dourado Translúcido de Progresso no Fundo (Pausa quando o mouse está no palco) */}
                      {isFocused && !shouldReduceMotion && !isPaused ? (
                        <motion.div
                          key={`demo-col-sweep-${activeFocusIndex}`}
                          aria-hidden="true"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: DEMO_AUTO_CYCLE_MS / 1000,
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

                      <div className="relative z-10">
                        {/* Topo da Coluna: Rótulo Canônico (`01 — CONTEXTO` | `02 — DIREÇÃO` | `03 — EXECUÇÃO`) */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                          <span className="inline-flex items-center gap-1.5 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            <ColumnIcon
                              aria-hidden="true"
                              className="h-3.5 w-3.5 text-la-gold"
                            />
                            <span>{callout.tag}</span>
                          </span>
                          <span className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                            {columnDetail.moduleBadge}
                          </span>
                        </div>

                        {/* Título e Descrição Canônicos do Item (§07) */}
                        <h3 className="mt-3 font-la-sans text-[1rem] font-semibold text-la-text-primary">
                          {callout.title}
                        </h3>

                        <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.5] text-la-text-secondary">
                          {callout.description}
                        </p>

                        {/* 3 Artefatos Internos da Coluna (Textos Justificados) */}
                        <div className="mt-3.5 flex flex-col gap-2">
                          {columnDetail.artifacts.map((artifact) => (
                            <div
                              key={artifact.label}
                              className="rounded-la-sm border border-white/10 bg-black/55 p-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                                  {artifact.label}
                                </span>
                                {artifact.badge ? (
                                  <span className="inline-flex items-center gap-1 font-la-mono text-[0.5625rem] text-la-gold-light">
                                    <CheckCircle2
                                      aria-hidden="true"
                                      className="h-3 w-3 text-la-gold"
                                    />
                                    <span>{artifact.badge}</span>
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.45] text-la-text-primary/90">
                                {artifact.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative z-10 mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5 font-la-mono text-[0.625rem] text-la-text-muted">
                        <span>{columnDetail.footerLeft}</span>
                        <span className="text-la-gold-light">
                          {columnDetail.footerRight}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé do Poster: Detalhe da Decisão em Foco */}
              {currentCallout ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-la-lg border border-la-border-gold/40 bg-la-gold-faint px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Compass
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-la-gold"
                    />
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {currentCallout.tag} · {currentCallout.title}
                    </span>
                    <span className="font-la-sans text-[0.8125rem] font-medium text-la-text-primary">
                      {currentCallout.description}
                    </span>
                  </div>

                  <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                    {currentWorkspace.moduleBadge}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export type DemoSectionProps = {
  readonly content?: LandingContent["demo"];
  readonly className?: string;
};

/**
 * Seção 07 — Demonstração (`id="demonstracao"`).
 *
 * Referência dominante: Attio (produto como prova visual tangível) + Resend (física 3D no escuro).
 * Intensidade: 4/5 | Profundidade: Nível 3 (Showcase).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §07, Etapa 2B §18, Etapa 2D §4.6 & ACCEPTANCE-LANDING.md §7):
 * - Eyebrow estritamente canônico: "A ESTRATÉGIA EM MOVIMENTO".
 * - Itens estritamente canônicos: 01 — CONTEXTO | 02 — DIREÇÃO | 03 — EXECUÇÃO.
 * - Opera inicialmente no modo `poster-only` sem botão de play falso.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function DemoSection({
  content = landingContent.demo,
  className,
}: DemoSectionProps) {
  const [activeFocusIndex, setActiveFocusIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const headingId = content.id ? `${content.id}-title` : "demonstracao-title";

  const callouts = content.callouts ?? [];

  /* Autociclo de 5.2s que pausa imediatamente quando o mouse entra no palco ou nos cards */
  useEffect(() => {
    if (shouldReduceMotion || isPaused || callouts.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveFocusIndex((prev) => (prev + 1) % callouts.length);
    }, DEMO_AUTO_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, callouts.length]);

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
      surface="surface-1"
      bottomBorder={true}
      className={clsx("relative [color-scheme:dark]", className)}
    >
      <div className="flex flex-col gap-10 lg:gap-12">
        {/* 1. Cabeçalho Editorial Equilibrado (Sem Buraco Vazio à Direita e Sem Prefixo Inventado) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10"
        >
          {/* Coluna Esquerda (7 cols): Eyebrow + Headline com `text-balance` + Subheadline Justificada */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow Canônico: "A ESTRATÉGIA EM MOVIMENTO" */}
            <SectionEyebrow label={content.eyebrow} variant="pill" />

            {content.headline ? (
              <h2
                id={headingId}
                className="mt-4 max-w-[24ch] text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
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

          {/* Coluna Direita (5 cols): Corpo Canônico + Microcopy Oficial em Moldura Editorial */}
          <div className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-la-canvas/75 p-5 sm:p-6 lg:col-span-5">
            {content.body && content.body.length > 0 ? (
              <div className="flex flex-col gap-3 border-l-2 border-la-gold/55 pl-4">
                {content.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] font-medium leading-[1.65] text-la-text-primary"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {content.microcopy && content.microcopy.length > 0 ? (
              <div className="border-t border-white/10 pt-3">
                {content.microcopy.map((line) => (
                  <p
                    key={line}
                    className="w-full text-justify [text-align-last:left] hyphens-auto font-la-mono text-[0.75rem] leading-[1.55] text-la-gold-light"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* 2. Palco Principal da Demonstração (`DemoStage`) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
        >
          <DemoStage
            mode={content.mode}
            stageLabels={content.stageLabels}
            callouts={callouts}
            futureVideoSequence={content.futureVideoSequence}
            videoAvailableActionLabel={content.videoAvailableActionLabel}
            honestStatusLabel={content.honestStatusLabel}
            honestStatusDescription={content.honestStatusDescription}
            activeFocusIndex={activeFocusIndex}
            isPaused={isPaused}
            onFocusChange={setActiveFocusIndex}
            onPauseChange={setIsPaused}
            videoProps={{
              title: "Legion Altaire — Ambiente Integrado do Projeto Editorial",
              poster: content.videoSources.posterSrc,
              mp4Src: content.videoSources.mp4Src,
              webmSrc: content.videoSources.webmSrc,
              captionsSrc: content.videoSources.captionsSrc,
              transcriptUrl: content.videoSources.transcriptUrl,
            }}
          />
        </motion.div>

        {/* 3. Três Callouts Canônicos (`01 — CONTEXTO` | `02 — DIREÇÃO` | `03 — EXECUÇÃO`) */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {callouts.map((callout, index) => {
              const isFocused = activeFocusIndex === index;
              const detail =
                WORKSPACE_COLUMN_DETAILS[index] ?? WORKSPACE_COLUMN_DETAILS[0];

              return (
                <motion.button
                  key={callout.step}
                  type="button"
                  variants={staggerItemVariants}
                  aria-pressed={isFocused}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onClick={() => setActiveFocusIndex(index)}
                  className={clsx(
                    "group relative flex flex-col justify-between overflow-hidden rounded-la-xl border p-5 text-left transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                    isFocused
                      ? "border-la-gold/75 bg-[#10131C] shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                      : "border-white/10 bg-la-canvas/80 hover:border-white/25 hover:bg-la-surface-2/60"
                  )}
                >
                  {/* Moldura Deslizante FLIP (`layoutId`) */}
                  {isFocused ? (
                    <motion.div
                      layoutId="demo-callout-card-active"
                      transition={{
                        type: "tween",
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        backgroundColor: "rgba(207, 169, 101, 0.06)",
                      }}
                      className="pointer-events-none absolute inset-0 z-0 rounded-la-xl"
                    />
                  ) : null}

                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        {callout.tag}
                      </span>
                      <Layers
                        aria-hidden="true"
                        className={clsx(
                          "h-3.5 w-3.5",
                          isFocused ? "text-la-gold" : "text-la-text-muted"
                        )}
                      />
                    </div>

                    <h3 className="mt-3 text-balance font-la-sans text-[1.0625rem] font-semibold leading-[1.3] text-la-text-primary">
                      {callout.title}
                    </h3>

                    <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                      {callout.description}
                    </p>
                  </div>

                  <span className="relative z-10 mt-4 inline-block w-full border-t border-white/10 pt-2.5 font-la-mono text-[0.6875rem] text-la-gold-light">
                    {detail.moduleBadge}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* CTA Opcional (Omitido em `poster-only` conforme `content.primaryAction: null` em §07) */}
          {content.primaryAction ? (
            <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
              <CTAGroup
                primaryAction={content.primaryAction}
                secondaryAction={content.secondaryAction}
                microcopy={content.microcopy}
                align="left"
                size="md"
              />
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

export default DemoSection;