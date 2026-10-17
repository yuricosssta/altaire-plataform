// FrontEnd/src/components/landing/FunctionsSection.tsx
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
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  FolderKanban,
  Layers,
  Library,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  landingContent,
  type FunctionCard,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STRATEGIC_LINE_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type FunctionsSectionProps = {
  readonly content?: LandingContent["functions"];
  readonly className?: string;
};

const FUNCTION_STAGE_CYCLE_MS = 5200;

const BASE_FEEDER_INPUTS = [
  "Oferta & Promessa",
  "Público Comprador",
  "Posicionamento",
  "Objetivos do Período",
  "Tom de Voz",
  "Capacidade de Produção",
] as const;

type FunctionStageInspection = {
  readonly code: "01" | "02" | "03";
  readonly tabLabel: string;
  readonly headline: string;
  readonly description: string;
  readonly items: readonly {
    readonly tag: string;
    readonly title: string;
    readonly detail: string;
    readonly status: string;
  }[];
};

const FUNCTION_01_INSPECTIONS: readonly FunctionStageInspection[] = [
  {
    code: "01",
    tabLabel: "Linha Editorial",
    headline: "Mensagem central, pilares, tom de voz e objetivos da comunicação",
    description:
      "A Linha Editorial transforma o contexto da Base Estratégica em critérios claros antes de distribuir qualquer peça no calendário.",
    items: [
      {
        tag: "MENSAGEM CENTRAL",
        title: "Tese principal e posicionamento que orientam o período",
        detail: "Garante que todas as publicações reforcem a mesma direção.",
        status: "Definido",
      },
      {
        tag: "PILARES EDITORIAIS",
        title: "Eixos temáticos conectados à oferta e ao público comprador",
        detail: "Organiza sobre o que a marca fala e com qual finalidade.",
        status: "Estruturado",
      },
      {
        tag: "TOM DE VOZ & OBJETIVOS",
        title: "Linguagem da marca e metas de autoridade, conexão e venda",
        detail: "Mantém consistência de identidade em todos os formatos.",
        status: "Ativo",
      },
    ],
  },
  {
    code: "02",
    tabLabel: "Calendário Editorial",
    headline: "Distribuição ao longo do período por plataformas, formatos e frequência",
    description:
      "O Calendário distribui a direção editorial nos slots da agenda considerando onde e como cada conteúdo será publicado.",
    items: [
      {
        tag: "SLOT 01 · CARROSSEL / POST",
        title: "Educação estratégica e desenvolvimento de consciência",
        detail: "Formato, plataforma e objetivo de comunicação vinculados ao slot.",
        status: "Planejado",
      },
      {
        tag: "SLOT 02 · VÍDEO CURTO / LONGO",
        title: "Construção de autoridade e aprofundamento de argumento",
        detail: "Distribuído na frequência definida para o período.",
        status: "Planejado",
      },
      {
        tag: "SLOT 03 · SEQUÊNCIA DE STORIES",
        title: "Relacionamento, interação, aquecimento e apoio à oferta",
        detail: "Tratado como sequência narrativa, não como post isolado.",
        status: "Planejado",
      },
    ],
  },
  {
    code: "03",
    tabLabel: "Capacidade Real",
    headline: "Agenda possível de executar conforme a realidade da operação",
    description:
      "O planejamento respeita o volume de vídeos, carrosséis, posts, lives e Stories que você realmente consegue produzir.",
    items: [
      {
        tag: "RITMO CONFIGURADO",
        title: "Frequência semanal ajustada à rotina real do negócio",
        detail: "Evita calendários cheios no papel que travam na execução.",
        status: "Sustentável",
      },
      {
        tag: "PLATAFORMAS & FORMATOS",
        title: "Seleção apenas dos canais e formatos ativos no projeto",
        detail: "Concentra energia onde a comunicação gera mais retorno.",
        status: "Calibrado",
      },
      {
        tag: "APROVAÇÃO HUMANA",
        title: "Direção revisada e aprovada antes de gerar temas e roteiros",
        detail: "Segurança estratégica antes de avançar para a Função 02.",
        status: "Aprovado",
      },
    ],
  },
] as const;

const FUNCTION_02_INSPECTIONS: readonly FunctionStageInspection[] = [
  {
    code: "01",
    tabLabel: "Negócio e Público",
    headline: "Temas conectados à oferta, promessa, dores, desejos e objeções",
    description:
      "A primeira origem nasce diretamente das informações estruturadas no Projeto Editorial e das necessidades reais do público comprador.",
    items: [
      {
        tag: "OFERTA & PROMESSA",
        title: "Ângulos que explicam o valor e a transformação da solução",
        detail: "Conecta o tema diretamente ao que o negócio vende.",
        status: "Qualificado",
      },
      {
        tag: "DORES & OBJEÇÕES",
        title: "Pautas que respondem às travas reais de decisão do comprador",
        detail: "Prepara a consciência do público antes da oferta.",
        status: "Mapeado",
      },
      {
        tag: "VÍNCULO COM SLOT",
        title: "Tema classificado e pronto para ocupar slot do calendário",
        detail: "Mantém rastreabilidade entre pauta e objetivo editorial.",
        status: "Conectado",
      },
    ],
  },
  {
    code: "02",
    tabLabel: "Sinais do Mercado",
    headline: "Referências, comentários, feedbacks e sinais que revelam lacunas",
    description:
      "A segunda origem analisa dúvidas recorrentes, referências e movimentos do mercado para encontrar ângulos relevantes e autênticos.",
    items: [
      {
        tag: "DÚVIDAS & COMENTÁRIOS",
        title: "Perguntas reais da audiência transformadas em pautas estruturadas",
        detail: "Gera conexão imediata por responder a demandas concretas.",
        status: "Analisado",
      },
      {
        tag: "REFERÊNCIAS & LACUNAS",
        title: "Identificação de pontos pouco explorados no seu mercado",
        detail: "Reforça posicionamento próprio sem copiar conteúdos alheios.",
        status: "Selecionado",
      },
      {
        tag: "CLASSIFICAÇÃO EDITORIAL",
        title: "Organizado na Biblioteca por pilar, jornada e formato",
        detail: "Fica disponível para uso imediato ou reaproveitamento futuro.",
        status: "Catalogado",
      },
    ],
  },
  {
    code: "03",
    tabLabel: "Objetivo do Período",
    headline: "Temas direcionados ao momento atual da operação comercial",
    description:
      "A terceira origem alinha o repertório ao foco do período: crescimento de audiência, autoridade, aquecimento, venda ou relacionamento.",
    items: [
      {
        tag: "MOMENTO DA OPERAÇÃO",
        title: "Crescimento, autoridade, aquecimento ou apoio direto à venda",
        detail: "Prioriza os temas que servem à meta atual do projeto.",
        status: "Priorizado",
      },
      {
        tag: "FILTRO MULTIDIMENSIONAL",
        title: "Consulta por objetivo, pilar, jornada, formato ou plataforma",
        detail: "Os temas aprovados permanecem organizados na Biblioteca.",
        status: "Filtrável",
      },
      {
        tag: "REAPROVEITAMENTO",
        title: "Repertório estratégico pronto para alimentar a produção",
        detail: "Ideias valiosas nunca se perdem em conversas ou abas soltas.",
        status: "Reutilizável",
      },
    ],
  },
] as const;

const FUNCTION_03_INSPECTIONS: readonly FunctionStageInspection[] = [
  {
    code: "01",
    tabLabel: "Roteiro & Estrutura",
    headline: "Roteiro desenvolvido de acordo com o formato e as definições do conteúdo",
    description:
      "A partir de um slot do calendário ou de um tema da Biblioteca, o sistema estrutura o roteiro preservando o contexto do projeto.",
    items: [
      {
        tag: "ADAPTAÇÃO AO FORMATO",
        title: "Vídeos curtos, vídeos longos, lives, carrosséis, posts e Stories",
        detail: "Cada formato recebe a progressão narrativa adequada.",
        status: "Estruturado",
      },
      {
        tag: "CHAMADA PARA AÇÃO (CTA)",
        title: "Fechamento alinhado ao objetivo e à oferta do Projeto Editorial",
        detail: "Conduz o público para o próximo passo com naturalidade.",
        status: "Integrado",
      },
      {
        tag: "CONTROLE DE VERSÕES",
        title: "Pronto para revisão, edição e salvamento pelo usuário",
        detail: "A IA organiza e acelera; você revisa, ajusta e aprova.",
        status: "Editável",
      },
    ],
  },
  {
    code: "02",
    tabLabel: "Títulos, Legenda & Capa",
    headline: "Legenda ou descrição, títulos, thumbnail ou capa no mesmo pacote",
    description:
      "Todos os elementos textuais e de apresentação da publicação nascem conectados ao roteiro e à direção da comunicação.",
    items: [
      {
        tag: "TÍTULOS & HEADLINES",
        title: "Opções de títulos alinhadas ao ângulo estratégico e ao formato",
        detail: "Clareza e retenção sem apelar para promessas desconectadas.",
        status: "Sincronizado",
      },
      {
        tag: "LEGENDA OU DESCRIÇÃO",
        title: "Texto complementar estruturado para a plataforma de destino",
        detail: "Reforça o contexto, os argumentos e a chamada para ação.",
        status: "Pronto",
      },
      {
        tag: "THUMBNAIL OU CAPA",
        title: "Diretrizes de capa para sustentar a leitura visual da peça",
        detail: "Conecta a primeira impressão visual ao tema do conteúdo.",
        status: "Definido",
      },
    ],
  },
  {
    code: "03",
    tabLabel: "Direção Visual & Ativos",
    headline: "Instruções visuais, prompts de imagem e materiais complementares",
    description:
      "Completa o pacote de publicação com orientação visual e ativos extras ativados quando qualificados pelas regras estratégicas.",
    items: [
      {
        tag: "INSTRUÇÕES VISUAIS",
        title: "Orientações de cena, ritmo e apresentação por formato",
        detail: "Facilita a gravação, o design ou a montagem da peça.",
        status: "Detalhado",
      },
      {
        tag: "PROMPTS DE IMAGEM",
        title: "Prompts visuais estruturados conforme a identidade do projeto",
        detail: "Apoia a criação de capas, lâminas e elementos gráficos.",
        status: "Gerado",
      },
      {
        tag: "MATERIAIS COMPLEMENTARES",
        title: "Ativados somente quando qualificados pela estratégia do conteúdo",
        detail: "Checklist, workbook, guia ou planilha quando fizer sentido.",
        status: "Condicional",
      },
    ],
  },
] as const;

/**
 * Palco 3D/2.5D Interativo para cada uma das 3 Funções (`FunctionInteractiveStage`).
 * - Inclinação 3D suave ao mover o mouse (`rotateX`, `rotateY`).
 * - Blur radial dourado (`Spotlight`) seguindo o cursor.
 * - Autociclo de 5.2s que pausa imediatamente quando o mouse entra no palco (`isPaused`).
 * - Abas clicáveis com transição deslizante FLIP (`layoutId`) e véu dourado translúcido.
 * - Câmara 3D com geometria distinta para Função 01, Função 02 e Função 03.
 */
function FunctionInteractiveStage({
  card,
  inspections,
}: {
  readonly card: FunctionCard;
  readonly inspections: readonly FunctionStageInspection[];
}) {
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
    y: 220,
    opacity: 0,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || isPaused || inspections.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % inspections.length);
    }, FUNCTION_STAGE_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldReduceMotion, isPaused, inspections.length]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normalizedX = mouseX / rect.width - 0.5;
    const normalizedY = mouseY / rect.height - 0.5;

    setTilt({
      rotateX: Number((-normalizedY * 4.8).toFixed(2)),
      rotateY: Number((normalizedX * 5.8).toFixed(2)),
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

  const sceneVariants = selectMotionPreset(
    shouldReduceMotion,
    MOCKUP_SCENE_VARIANTS,
    REDUCED_MOTION_VARIANTS.mockupScene
  );

  const activeInspection = inspections[activeIndex] ?? inspections[0];

  const StageHeaderIcon =
    card.index === "01" ? Compass : card.index === "02" ? Library : FileText;

  return (
    <div
      ref={stageRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px" }}
      className="relative flex h-full w-full select-none flex-col justify-between"
    >
      {/* Glow Radial Dourado Profundo atrás do Palco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_55%_30%,rgba(207,169,101,0.14)_0%,rgba(207,169,101,0.03)_45%,transparent_75%)] blur-2xl"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? { rotateX: 0, rotateY: 0, y: 0 }
            : {
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                y: isPaused ? 0 : [0, -3.5, 0],
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
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_26px_60px_rgba(0,0,0,0.85),0_0_72px_rgba(207,169,101,0.10)] backdrop-blur-xl"
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

        <div>
          {/* 1. TopBar do Palco da Função */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/60 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <div aria-hidden="true" className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-la-full bg-white/15" />
                <span className="h-2 w-2 rounded-la-full bg-white/15" />
                <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
              </div>
              <StageHeaderIcon
                aria-hidden="true"
                className="ml-1 h-3.5 w-3.5 text-la-gold"
              />
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                {card.categoryTag}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-medium text-la-gold-light">
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
              <span>{card.publicName}</span>
            </span>
          </div>

          {/* 2. Câmara Superior 3D Específica por Função */}
          <div className="relative z-10 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_75%_50%,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.95)_60%,#040508_100%)] p-4 sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
            />

            <div className="relative z-10 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
              {/* Esquerda da Câmara (7 cols): Síntese de Amostras da Função */}
              <div className="flex flex-col gap-2 sm:col-span-7">
                <div className="flex items-center gap-2">
                  <Sparkles
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    {card.mockupSummary.secondaryView}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {card.mockupSummary.sampleItems.map((sample, idx) => {
                    const isFocused = activeIndex === idx;
                    return (
                      <button
                        key={sample}
                        type="button"
                        aria-pressed={isFocused}
                        onClick={() => setActiveIndex(idx)}
                        className={clsx(
                          "flex items-center justify-between gap-2 rounded-la-md border px-3 py-2 text-left transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          isFocused
                            ? "border-la-gold bg-white/[0.06] text-la-text-primary shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                            : "border-white/10 bg-black/40 text-la-text-secondary hover:border-white/25 hover:text-la-text-primary"
                        )}
                      >
                        <span className="truncate font-la-sans text-[0.75rem] font-medium">
                          {sample}
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className={clsx(
                            "h-3 w-3 shrink-0 transition-transform",
                            isFocused
                              ? "translate-x-0.5 text-la-gold"
                              : "text-white/25"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direita da Câmara (5 cols): Núcleo 3D Girando no Próprio Eixo */}
              <div
                aria-hidden="true"
                className="relative flex h-[9.75rem] items-center justify-center sm:col-span-5"
                style={{ perspective: "900px" }}
              >
                {/* Anel Orbital Contínuo */}
                <motion.div
                  animate={shouldReduceMotion ? { rotateZ: 0 } : { rotateZ: 360 }}
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

                {/* Prisma 3D de 3 Camadas Oscilando no Próprio Eixo */}
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
                  {inspections.map((layer, layerIdx) => {
                    const isLayerActive = activeIndex === layerIdx;
                    const zBase =
                      layerIdx === 2 ? 24 : layerIdx === 1 ? 0 : -22;
                    const zActive =
                      layerIdx === 2 ? 32 : layerIdx === 1 ? 8 : -16;

                    return (
                      <motion.div
                        key={layer.code}
                        animate={{
                          translateZ: isLayerActive ? zActive : zBase,
                          scale: isLayerActive ? 1.07 : 0.95,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={clsx(
                          "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors duration-300",
                          isLayerActive
                            ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.4)]"
                            : "border-white/15 bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-la-mono text-[0.48rem] font-semibold uppercase text-la-gold-light">
                            {layer.code} · {layer.tabLabel}
                          </span>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-la-full bg-la-gold" />
                        </div>
                        <div className="h-1 w-2/3 rounded-la-full bg-la-gold/65" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>

          {/* 3. Barra de Abas Clicáveis com Moldura FLIP (`layoutId`) e Varredura Dourada */}
          <div className="relative z-10 border-b border-white/10 bg-black/45 px-4 py-3 sm:px-5">
            <div
              aria-label={`Camadas operacionais da ${card.categoryTag}`}
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {inspections.map((tab, idx) => {
                const isSelected = activeIndex === idx;

                return (
                  <button
                    key={tab.code}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveIndex(idx)}
                    className={clsx(
                      "group relative flex flex-col justify-between overflow-hidden rounded-la-md border p-2.5 text-left transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                      isSelected
                        ? "border-la-gold/70 bg-[#10131C] text-la-text-primary shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                        : "border-white/10 bg-white/[0.02] text-la-text-secondary hover:border-white/25 hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Moldura Deslizante FLIP (`layoutId`) */}
                    {isSelected ? (
                      <motion.div
                        layoutId={`function-${card.index}-active-tab`}
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

                    {/* Véu Dourado Translúcido + Filete Inferior Dourado Embutido */}
                    {isSelected && !shouldReduceMotion && !isPaused ? (
                      <motion.div
                        key={`fn-${card.index}-sweep-${activeIndex}`}
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: FUNCTION_STAGE_CYCLE_MS / 1000,
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
                      <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                        CAMADA {tab.code}
                      </span>
                      <CheckCircle2
                        aria-hidden="true"
                        className={clsx(
                          "h-3 w-3 shrink-0",
                          isSelected ? "text-la-gold" : "text-white/25"
                        )}
                      />
                    </div>

                    <p className="relative z-20 mt-1 truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                      {tab.tabLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Painel Dinâmico de Evidência da Camada Ativa */}
          <div className="relative z-10 p-4 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeInspection.code}
                initial="enter"
                animate="center"
                exit="exit"
                variants={sceneVariants}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {activeInspection.code} · {activeInspection.tabLabel}
                    </span>
                    <span className="rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                      Projeto Editorial Ativo
                    </span>
                  </div>

                  <h4 className="mt-1 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                    {activeInspection.headline}
                  </h4>

                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                    {activeInspection.description}
                  </p>
                </div>

                {/* 3 Cards de Evidência Operacional */}
                <div className="grid grid-cols-1 gap-2.5">
                  {activeInspection.items.map((item) => (
                    <div
                      key={item.tag}
                      className="flex items-start justify-between gap-3 rounded-la-md border border-white/10 bg-white/[0.025] px-3.5 py-2.5 transition-colors hover:border-white/20"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          {item.tag}
                        </span>
                        <p className="mt-0.5 font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
                          {item.title}
                        </p>
                        <p className="mt-0.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                          {item.detail}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-la-full border border-white/10 bg-black/50 px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 5. Rodapé de Rastreabilidade do Palco */}
        <div className="relative z-10 border-t border-white/10 bg-black/50 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-text-muted">
              Resultado da {card.categoryTag}
            </span>
            <span className="font-la-sans text-[0.75rem] font-medium text-la-gold-light">
              {card.resultText}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Seção 08 — Três Funções (`id="funcoes"`).
 *
 * Referências dominantes: Linear (precisão operacional) + Attio (produto como evidência) + Resend (física 3D no escuro).
 * Intensidade: 3/5 | Profundidade: Nível 2 (Elevado).
 *
 * Regras inegociáveis (Etapa 2D §4.7, CONTENT-LANDING.md §08 & ACCEPTANCE-LANDING.md §21):
 * - Eyebrow estritamente canônico: "O QUE O LEGION ALTAIRE ORGANIZA".
 * - Apresenta FUNÇÃO 01 — DIREÇÃO, FUNÇÃO 02 — TEMAS E ÂNGULOS e FUNÇÃO 03 — PRODUÇÃO E ATIVOS sem tripla repetição de rótulo.
 * - O benefício principal de cada função aparece antes da explicação funcional.
 * - Inclui as 3 origens e a nota da Biblioteca na Função 02, e o Contexto preservado na Função 03.
 * - Textos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function FunctionsSection({
  content = landingContent.functions,
  className,
}: FunctionsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const headingId = content.id ? `${content.id}-title` : "funcoes-title";

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

  const resolveInspections = (index: FunctionCard["index"]) => {
    switch (index) {
      case "01":
        return FUNCTION_01_INSPECTIONS;
      case "02":
        return FUNCTION_02_INSPECTIONS;
      case "03":
        return FUNCTION_03_INSPECTIONS;
    }
  };

  const microcopySequenceText =
    content.microcopy?.[0] ??
    "Base Estratégica → Direção → Temas → Execução.";

  const microcopyNodes = microcopySequenceText
    .replace(/\.$/, "")
    .split("→")
    .map((part) => part.trim());

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
      <div className="flex flex-col gap-10 lg:gap-14">
        {/* 1. Cabeçalho Editorial Equilibrado (Sem prefixo inventado no Eyebrow) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow Canônico: "O QUE O LEGION ALTAIRE ORGANIZA" */}
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

          <div className="relative flex flex-col justify-center border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 -left-[2px] hidden h-6 w-[2px] bg-la-gold lg:block"
            />

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
          </div>
        </motion.div>

        {/* 2. Barramento Alimentador: Projeto Editorial & Base Estratégica (Núcleo, nunca 4ª função) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="relative overflow-hidden rounded-la-xl border border-la-border-gold/45 bg-la-surface-1/90 p-5 shadow-[var(--la-elevation-1)] sm:p-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint text-la-gold-light"
              >
                <FolderKanban className="h-4 w-4" />
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Camada Alimentadora · Projeto Editorial
                  </span>
                  <span className="rounded-la-full border border-white/10 bg-black/40 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                    Base Estratégica
                  </span>
                </div>

                <h3 className="mt-1 text-balance font-la-sans text-[1rem] font-semibold text-la-text-primary">
                  A Base Estratégica alimenta todo o fluxo, orientando as três
                  funções dentro do mesmo Projeto Editorial.
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {BASE_FEEDER_INPUTS.map((inputLabel) => (
                <span
                  key={inputLabel}
                  className="inline-flex items-center gap-1.5 rounded-la-xs border border-white/10 bg-black/45 px-2.5 py-1 font-la-mono text-[0.6875rem] text-la-text-secondary"
                >
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="h-3 w-3 text-la-gold"
                  />
                  <span>{inputLabel}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3. Os Três Grandes Blocos Conectados (Função 01, Função 02 e Função 03) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={staggerContainerVariants}
          className="relative flex flex-col gap-8 lg:gap-10"
        >
          {content.cards.map((card, idx) => {
            const isFunction03 = card.index === "03";
            const stageInspections = resolveInspections(card.index);

            return (
              <motion.article
                key={card.index}
                variants={staggerItemVariants}
                aria-label={`${card.categoryTag} — ${card.publicName}`}
                className="relative flex flex-col"
              >
                {/* Conector Vertical do Fio Estratégico entre os blocos */}
                {idx > 0 ? (
                  <div
                    aria-hidden="true"
                    className="mb-8 flex items-center justify-center lg:mb-10"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-gradient-to-b from-white/20 to-la-gold" />
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-la-full border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                        <ArrowDown className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ) : null}

                <div
                  className={clsx(
                    "relative overflow-hidden rounded-la-xl border p-5 transition-colors sm:p-7 lg:p-8",
                    isFunction03
                      ? "border-la-border-gold/60 bg-la-surface-2/95 shadow-[var(--la-elevation-3)]"
                      : "border-white/12 bg-la-surface-1/90 shadow-[var(--la-elevation-2)]"
                  )}
                >
                  {isFunction03 ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
                    />
                  ) : null}

                  <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* Coluna Editorial da Função (5 cols): Identificação Única -> Título -> Benefício -> Texto -> Escopo/Origens -> Resultado */}
                    <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                      <div className="flex flex-col items-start">
                        {/* Identificação Secundária Única (Sem tripla repetição) */}
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-la-sm border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.75rem] font-semibold text-la-gold-light">
                            {card.index}
                          </span>
                          <span className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            {card.categoryTag}
                          </span>
                        </div>

                        {/* Título Público Canônico (`card.publicName`) */}
                        <h3 className="mt-3.5 text-balance font-la-sans text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.022em] text-la-text-primary sm:text-[1.75rem]">
                          {card.publicName}
                        </h3>

                        {/* Benefício Principal ANTES da descrição funcional (Regra Canônica §08) */}
                        <div className="mt-4 w-full rounded-la-md border border-la-border-gold/45 bg-la-gold-faint px-4 py-3.5">
                          <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            Benefício principal
                          </span>
                          <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] font-semibold leading-[1.5] text-la-text-primary">
                            {card.mainBenefit}
                          </p>
                        </div>

                        {/* Texto Funcional Canônico Justificado */}
                        <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                          {card.description}
                        </p>

                        {/* Se a função possuir as 3 Origens + Biblioteca (Função 02 — CONTENT-LANDING.md §08) */}
                        {card.origins && card.origins.length > 0 ? (
                          <div className="mt-5 flex w-full flex-col gap-2.5 border-t border-white/10 pt-4">
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                              {card.highlightsLabel}
                            </span>

                            {card.origins.map((origin) => (
                              <div
                                key={origin.label}
                                className="rounded-la-md border border-white/10 bg-black/40 px-3.5 py-2.5"
                              >
                                <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-gold-light">
                                  {origin.label}:
                                </span>
                                <p className="mt-0.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.5] text-la-text-secondary">
                                  {origin.description}
                                </p>
                              </div>
                            ))}

                            {card.libraryNote ? (
                              <div className="rounded-la-md border border-la-border-gold/35 bg-la-gold-faint px-3.5 py-2.5">
                                <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-gold-light">
                                  Biblioteca:
                                </span>
                                <p className="mt-0.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.5] text-la-text-primary">
                                  {card.libraryNote}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          /* Grade de Itens Organizados / Pacote de Execução (Funções 01 e 03) */
                          <div className="mt-5 w-full border-t border-white/10 pt-4">
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                              {card.highlightsLabel}
                            </span>
                            <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {card.highlights.map((highlight) => (
                                <li
                                  key={highlight}
                                  className="flex items-center gap-2 rounded-la-sm border border-white/10 bg-black/45 px-3 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-primary"
                                >
                                  <CheckCircle2
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 shrink-0 text-la-gold"
                                  />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Contexto Preservado (Exclusivo da Função 03 — CONTENT-LANDING.md §08) */}
                        {card.preservedContext ? (
                          <div className="mt-4 w-full rounded-la-md border border-white/10 bg-black/40 px-4 py-3">
                            <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                              Contexto preservado
                            </span>
                            <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                              {card.preservedContext}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Resultado Canônico da Função (`card.resultText`) */}
                      <div className="rounded-la-md border border-white/10 bg-black/55 px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Sparkles
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-la-gold"
                          />
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            Resultado
                          </span>
                        </div>
                        <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.55] text-la-text-primary">
                          {card.resultText}
                        </p>
                      </div>
                    </div>

                    {/* Coluna Visual da Função (7 cols): Palco 3D/2.5D Interativo */}
                    <div className="lg:col-span-7">
                      <FunctionInteractiveStage
                        card={card}
                        inspections={stageInspections}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* 4. Faixa de Continuidade do Sistema (Microcopy Canônica §08: "Base Estratégica → Direção → Temas → Execução.") */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="flex flex-col gap-3 rounded-la-xl border border-white/12 bg-la-surface-1/85 px-5 py-4 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Layers aria-hidden="true" className="h-4 w-4 text-la-gold" />
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary">
                Fluxo Integrado no Mesmo Projeto Editorial
              </span>
            </div>

            <div
              aria-label={microcopySequenceText}
              className="flex flex-wrap items-center gap-2 font-la-mono text-[0.75rem] font-medium text-la-text-primary"
            >
              {microcopyNodes.map((node, index) => (
                <span key={node} className="inline-flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-la-xs border px-2.5 py-1",
                      index === 0 || index === microcopyNodes.length - 1
                        ? "border-la-border-gold bg-la-gold-faint font-semibold text-la-gold-light"
                        : "border-white/10 bg-black/40 text-la-text-primary"
                    )}
                  >
                    {node}
                  </span>
                  {index < microcopyNodes.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-la-gold"
                    />
                  ) : null}
                </span>
              ))}
            </div>
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
            className="h-1 w-full"
          >
            <line
              x1="0"
              y1="2"
              x2="1000"
              y2="2"
              stroke="rgba(245, 242, 235, 0.08)"
              strokeWidth="1.5"
            />
            <motion.line
              x1="0"
              y1="2"
              x2="1000"
              y2="2"
              stroke="#CFA965"
              strokeWidth="2"
              initial="hidden"
              whileInView="visible"
              viewport={MOTION_VIEWPORT}
              variants={lineVariants}
            />
          </svg>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default FunctionsSection;