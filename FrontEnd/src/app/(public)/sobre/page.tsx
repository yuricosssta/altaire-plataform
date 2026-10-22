// FrontEnd/src/app/(public)/sobre/page.tsx
"use client";

import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Cpu,
  FileText,
  FolderKanban,
  Layers,
  Library,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAButton } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  MOCKUP_SCENE_VARIANTS,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";
import { ROUTES } from "@/lib/constants/routes";

type ManifestoPillar = {
  readonly code: "01" | "02" | "03";
  readonly eyebrow: string;
  readonly title: string;
  readonly thesis: string;
  readonly operationalReality: string;
};

const MANIFESTO_PILLARS: readonly ManifestoPillar[] = [
  {
    code: "01",
    eyebrow: "PRINCIPIO 01 · RAIZ ANTES DO RAMO",
    title: "Sem Base Estratégica, todo conteúdo vira ruído aleatório.",
    thesis:
      "A indústria digital acostumou o mercado a acreditar que produzir conteúdo é simplesmente preencher uma grade semanal de publicações com frases de efeito e fórmulas de engajamento superficial.",
    operationalReality:
      "No Legion Altaire, nenhuma linha de roteiro é gerada no vazio. Toda criação é obrigatoriamente precedida pela estruturação do seu nicho, da sua oferta, da promessa central, das objeções reais do público comprador e do seu tom de voz.",
  },
  {
    code: "02",
    eyebrow: "PRINCIPIO 02 · FLUXO INTEGRADO",
    title: "A comunicação precisa de continuidade, não de solicitações soltas.",
    thesis:
      "Usar inteligência artificial por meio de conversas avulsas fragmenta a identidade da empresa. A cada novo comando, você precisa reexplicar seu produto, gerando peças desconectadas que não constroem autoridade cumulativa.",
    operationalReality:
      "A plataforma substitui o caos de prompts isolados por um fluxo encadeado: a estratégia define a Linha Editorial; a Linha Editorial alimenta o Calendário; o Calendário direciona os Temas; e os Temas desdobram roteiros e ativos no mesmo contexto.",
  },
  {
    code: "03",
    eyebrow: "PRINCIPIO 03 · SOBERANIA HUMANA",
    title: "A IA propõe e organiza. A decisão e a identidade continuam sendo suas.",
    thesis:
      "Não acreditamos em automações cegas que publicam sem critério nem em ferramentas que inventam histórias e casos de sucesso artificiais que não pertencem à história do negócio.",
    operationalReality:
      "O sistema atua como seu estrategista e copiloto de redação nos bastidores. Ele organiza a complexidade, analisa lacunas de mercado e acelera a escrita — mas você mantém o controle de revisar, ajustar e aprovar cada etapa antes da gravação ou publicação.",
  },
] as const;

type ArchitecturalLayer = {
  readonly layerNumber: string;
  readonly roleBadge: string;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly coreDeliverables: readonly string[];
  readonly businessOutcome: string;
};

const ARCHITECTURAL_LAYERS: readonly ArchitecturalLayer[] = [
  {
    layerNumber: "CAMADA 00",
    roleBadge: "ALIMENTADOR CENTRAL",
    name: "Projeto Editorial & Base Estratégica",
    subtitle: "O contexto persistente que guia toda a operação",
    description:
      "O centro de comando onde o seu negócio é mapeado com rigor: oferta principal, promessa, público comprador (ICP), dores reais, travas de decisão, tom de voz e capacidade real de produção. Permanece ativo para sempre, sem exigir reexplicações.",
    coreDeliverables: [
      "Mapeamento completo de Oferta & Promessa",
      "Diagnóstico do Público Comprador (ICP) e Objeções",
      "Definição da Proposta Única de Valor (PUV)",
      "Calibração de Tom de Voz e Capacidade Real Semanal",
    ],
    businessOutcome: "Fim do retrabalho e coerência inabalável entre todas as postagens.",
  },
  {
    layerNumber: "CAMADA 01",
    roleBadge: "FUNÇÃO 01 · DIREÇÃO",
    name: "Linha Editorial & Calendário Realista",
    subtitle: "Da estratégia para uma agenda sustentável de executar",
    description:
      "Transforma o contexto da base em critérios claros de comunicação (mensagem central e pilares) e distribui os slots no calendário respeitando os formatos e a frequência que sua rotina realmente consegue gravar e publicar.",
    coreDeliverables: [
      "Pilares Editoriais conectados à jornada de compra",
      "Matriz de Equilíbrio RETINA (Autoridade, Conexão e Venda)",
      "Distribuição inteligente por formato (Vídeo, Carrossel, Stories)",
      "Garantia de aprovação prévia do planejamento",
    ],
    businessOutcome: "Calendário sustentável que elimina a sobrecarga operacional.",
  },
  {
    layerNumber: "CAMADA 02",
    roleBadge: "FUNÇÃO 02 · REPERTÓRIO",
    name: "Biblioteca Estratégica de Temas",
    subtitle: "Repertório vivo alimentado pelas 3 origens canônicas",
    description:
      "Em vez de buscar ideias aleatórias, a Biblioteca gera e cataloga pautas a partir de 3 fontes coordenadas: a oferta do negócio, os sinais e dúvidas reais do mercado e o momento comercial atual da operação.",
    coreDeliverables: [
      "Origem A: Temas conectados diretamente à oferta e objeções",
      "Origem B: Pautas a partir de lacunas e sinais do mercado",
      "Origem C: Direcionamento para autoridade, aquecimento ou venda",
      "Filtros por pilar, jornada, plataforma e formato",
    ],
    businessOutcome: "Um acervo estratégico de temas que nunca se perde em anotações soltas.",
  },
  {
    layerNumber: "CAMADA 03",
    roleBadge: "FUNÇÃO 03 · EXECUÇÃO",
    name: "Produção de Roteiros, Capas e Ativos",
    subtitle: "Transformação da oportunidade em material pronto para produzir",
    description:
      "A partir do slot aprovado ou do tema da biblioteca, a plataforma entrega o pacote completo de execução: roteiros estruturados, títulos, legendas escaneáveis, direção de capa e materiais complementares de apoio à conversão.",
    coreDeliverables: [
      "Roteiros em Duplo Modo (Modo Técnico e Modo Conexão)",
      "Variações de Headlines e Legendas com CTA orientado à oferta",
      "Briefing de Thumbnail, Direção Visual e Prompts de Imagem",
      "Materiais Complementares Condicionais (Checklists e Guias)",
    ],
    businessOutcome: "Entrega concreta e pronta para gravação, design e publicação.",
  },
] as const;

export default function SobrePage() {
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [isStagePaused, setIsStagePaused] = useState<boolean>(false);
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

  const stageRef = useRef<HTMLDivElement>(null);
  const isStageInView = useInView(stageRef, { amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const handleStageMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) {
      return;
    }
    const rect = stageRef.current.getBoundingClientRect();
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

  const handleStageMouseLeave = () => {
    setIsStagePaused(false);
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

  const activeLayer =
    ARCHITECTURAL_LAYERS[activeLayerIndex] ?? ARCHITECTURAL_LAYERS[0];

  return (
    <div className="flex flex-col [overflow-anchor:none]">
      {/* 1. HERO INSTITUCIONAL · A TESE E O MANIFESTO */}
      <SectionShell
        id="sobre-manifesto"
        ariaLabelledBy="sobre-hero-title"
        container="max"
        spacing="hero"
        surface="canvas"
        bottomBorder={true}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-14 left-1/2 -z-0 h-[30rem] w-[56rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.03)_50%,transparent_75%)] blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-10 lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="flex flex-col items-start lg:col-span-7">
              <SectionEyebrow
                label="A TESE DO LEGION ALTAIRE"
                variant="pill"
              />

              <h1
                id="sobre-hero-title"
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(2rem,3.4vw,3.125rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-la-text-primary"
              >
                O conteúdo não é o fim da sua empresa. Ele é o meio para
                construir autoridade e gerar demanda.
              </h1>

              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
                Criamos o Legion Altaire a partir de uma constatação prática: o
                mercado digital foi inundado por geradores de texto que prometem
                volume infinito, mas entregam ruído genérico e desconectado do
                que o negócio realmente vende.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                Construímos um Sistema Operacional Editorial. Uma arquitetura que
                conecta o contexto estratégico da sua marca a uma direção clara,
                a um calendário possível de executar e a roteiros que conduzem
                naturalmente à sua oferta.
              </p>

              <div className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint px-4 py-3">
                <Compass aria-hidden="true" className="h-4 w-4 shrink-0 text-la-gold" />
                <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                  Estratégia antes do planejamento. Planejamento antes do post.
                </span>
              </div>
            </div>
          </motion.div>

          {/* 3 Pilares Fundamentais do Manifesto Editorial */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {MANIFESTO_PILLARS.map((pillar) => (
              <motion.article
                key={pillar.code}
                variants={staggerItemVariants}
                className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-la-surface-1/90 p-6 shadow-[var(--la-elevation-2)] transition-colors hover:border-white/25 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {pillar.eyebrow}
                    </span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-la-xs border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.6875rem] font-semibold text-la-gold-light">
                      {pillar.code}
                    </span>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.25rem] font-semibold leading-[1.3] text-la-text-primary">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                    {pillar.thesis}
                  </p>
                </div>

                <div className="mt-5 rounded-la-md border border-la-border-gold/40 bg-la-gold-faint p-3.5">
                  <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Como o Legion Altaire opera
                  </span>
                  <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.55] text-la-text-primary">
                    {pillar.operationalReality}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </SectionShell>

      {/* 2. ARQUITETURA EM 4 CAMADAS · PALCO 3D INTERATIVO */}
      <SectionShell
        id="sobre-arquitetura"
        ariaLabelledBy="sobre-arquitetura-title"
        container="max"
        spacing="spacious"
        surface="surface-1"
        bottomBorder={true}
        className="relative overflow-hidden"
      >
        <div className="flex flex-col gap-10 lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="flex flex-col items-start lg:col-span-7">
              <SectionEyebrow
                label="COMO O SISTEMA SE ORGANIZA"
                variant="pill"
              />

              <h2
                id="sobre-arquitetura-title"
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
              >
                Quatro camadas coordenadas dentro do mesmo Projeto Editorial.
              </h2>
            </div>

            <div className="lg:col-span-5">
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                A plataforma não é um conjunto de ferramentas desconexas. Ela
                funciona como uma esteira lógica contínua onde cada decisão
                estratégica alimenta o próximo passo da execução.
              </p>
            </div>
          </motion.div>

          {/* Palco 3D Interativo com Altura Travada em Grid (`col-start-1 row-start-1`) */}
          <motion.div
            ref={stageRef}
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            onMouseEnter={() => setIsStagePaused(true)}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
            style={{ perspective: "1400px" }}
            className="relative w-full select-none [overflow-anchor:none]"
          >
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
              <div
                aria-hidden="true"
                style={{
                  opacity: spotlight.opacity,
                  background: `radial-gradient(480px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.14), transparent 65%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              {/* TopBar do Palco com Abas das 4 Camadas com FLIP */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                  </div>
                  <Layers aria-hidden="true" className="ml-1 h-4 w-4 text-la-gold" />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Inspeção Estrutural · {activeLayer.name}
                  </span>
                </div>

                <div
                  aria-label="Selecionar camada para inspecionar"
                  className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
                >
                  {ARCHITECTURAL_LAYERS.map((layerItem, idx) => {
                    const isTabSelected = activeLayerIndex === idx;
                    return (
                      <button
                        key={layerItem.layerNumber}
                        type="button"
                        aria-pressed={isTabSelected}
                        onClick={() => setActiveLayerIndex(idx)}
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
                            layoutId="sobre-layers-active-tab"
                            transition={{
                              type: "tween",
                              duration: 0.26,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                          />
                        ) : null}
                        <span className="relative z-10">{layerItem.layerNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conteúdo da Camada com Altura 100% Travada via Grid (`col-start-1 row-start-1`) */}
              <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
                <div className="grid grid-cols-1 lg:col-span-8">
                  {ARCHITECTURAL_LAYERS.map((layerItem, idx) => {
                    const isCurrent = activeLayerIndex === idx;

                    return (
                      <div
                        key={layerItem.layerNumber}
                        aria-hidden={!isCurrent}
                        className={clsx(
                          "col-start-1 row-start-1 flex flex-col gap-4 transition-opacity duration-250",
                          isCurrent
                            ? "relative z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0 select-none"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                              {layerItem.layerNumber} · {layerItem.roleBadge}
                            </span>
                            <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary sm:text-[1.375rem]">
                              {layerItem.name}
                            </h3>
                            <p className="mt-0.5 font-la-sans text-[0.875rem] font-medium text-la-gold-light">
                              {layerItem.subtitle}
                            </p>
                          </div>

                          <span className="rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                            Camada Integrada
                          </span>
                        </div>

                        <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.68] text-la-text-secondary">
                          {layerItem.description}
                        </p>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {layerItem.coreDeliverables.map((deliv) => (
                            <div
                              key={deliv}
                              className="flex items-start gap-2.5 rounded-la-md border border-white/10 bg-white/[0.025] px-3.5 py-2.5"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-la-gold"
                              />
                              <span className="font-la-sans text-[0.8125rem] font-medium text-la-text-primary">
                                {deliv}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-la-md border border-white/10 bg-black/55 p-3.5">
                          <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                            Impacto prático na rotina
                          </span>
                          <p className="mt-1 font-la-sans text-[0.8125rem] font-medium text-la-gold-light">
                            {layerItem.businessOutcome}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Direita do Palco (4 cols): Câmara Orbital 3D em Perspectiva */}
                <div
                  aria-hidden="true"
                  className="relative flex h-[13rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_62%,#040508_100%)] lg:col-span-4"
                  style={{ perspective: "900px" }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isStageInView
                        ? { rotateZ: 0 }
                        : { rotateZ: 360 }
                    }
                    transition={{
                      duration: 24,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-dashed border-la-gold/35"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isStageInView
                        ? { rotateX: 60, rotateZ: 0 }
                        : { rotateX: 60, rotateZ: -360 }
                    }
                    transition={{
                      duration: 16,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="pointer-events-none absolute h-40 w-40 rounded-la-full border border-white/15 shadow-[0_0_24px_rgba(207,169,101,0.14)]"
                  />

                  <motion.div
                    animate={
                      shouldReduceMotion || !isStageInView
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
                    className="relative flex h-28 w-28 items-center justify-center"
                  >
                    {ARCHITECTURAL_LAYERS.map((layer, layerIdx) => {
                      const isLayerActive = activeLayerIndex === layerIdx;
                      const zBase =
                        layerIdx === 3 ? 30 : layerIdx === 2 ? 10 : layerIdx === 1 ? -10 : -30;
                      const zActive =
                        layerIdx === 3 ? 38 : layerIdx === 2 ? 18 : layerIdx === 1 ? -2 : -22;

                      return (
                        <motion.div
                          key={layer.layerNumber}
                          animate={{
                            translateZ: isLayerActive ? zActive : zBase,
                            scale: isLayerActive ? 1.07 : 0.95,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={clsx(
                            "absolute inset-2 flex flex-col justify-between rounded-la-lg border p-2.5 backdrop-blur-md transition-colors duration-300",
                            isLayerActive
                              ? "border-la-gold bg-la-gold/25 shadow-[0_0_28px_rgba(207,169,101,0.4)]"
                              : "border-white/15 bg-white/[0.04]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate font-la-mono text-[0.48rem] font-semibold uppercase text-la-gold-light">
                              {layer.layerNumber}
                            </span>
                            <Sparkles className="h-2.5 w-2.5 shrink-0 text-la-gold" />
                          </div>
                          <div className="h-1 w-2/3 rounded-la-full bg-la-gold/75" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SectionShell>

      {/* 3. GOVERNANÇA HUMANA E COMPROMISSO COM A AUTENTICIDADE */}
      <SectionShell
        id="sobre-compromisso"
        ariaLabelledBy="sobre-compromisso-title"
        container="max"
        spacing="spacious"
        surface="canvas"
        bottomBorder={false}
      >
        <div className="flex flex-col gap-10 lg:gap-12">
          <div className="relative overflow-hidden rounded-la-xl border border-la-border-gold/50 bg-[#07090F]/95 p-6 shadow-[var(--la-elevation-2)] sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
            />

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="flex flex-col items-start gap-4 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-3 py-1">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Compromisso Editorial Inegociável
                  </span>
                </div>

                <h2
                  id="sobre-compromisso-title"
                  className="text-balance font-la-sans text-[clamp(1.5rem,2.5vw,2.125rem)] font-semibold leading-[1.2] text-la-text-primary"
                >
                  Sua experiência real é insubstituível. A IA deve trabalhar
                  para você, e não falar no seu lugar.
                </h2>

                <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                  O Legion Altaire foi projetado para que você possa alimentar o
                  sistema com seus próprios estudos de caso, histórias reais da
                  sua empresa, transcrições de palestras e materiais autorais.
                  Não geramos conteúdos com dados inventados ou promessas
                  irreais: a tecnologia acelera a estrutura, mas a verdade do
                  conteúdo pertence à sua marca.
                </p>
              </div>

              <div className="flex flex-col justify-between gap-6 rounded-la-xl border border-white/10 bg-black/50 p-6 lg:col-span-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Target aria-hidden="true" className="h-4 w-4 text-la-gold" />
                    <span className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                      Pronto para colocar sua estratégia em movimento?
                    </span>
                  </div>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                    Conheça os planos disponíveis e crie seu primeiro Projeto
                    Editorial com acesso imediato à plataforma.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <CTAButton
                    action={{
                      label: "Ver planos e preços",
                      href: ROUTES.precos,
                      variant: "primary",
                    }}
                    variant="primary"
                    size="md"
                    showArrow={true}
                    fullWidthMobile={true}
                    className="w-full justify-center"
                  />
                  <CTAButton
                    action={{
                      label: "Falar com nosso atendimento",
                      href: ROUTES.contato,
                      variant: "secondary",
                    }}
                    variant="secondary"
                    size="md"
                    showArrow={false}
                    fullWidthMobile={true}
                    className="w-full justify-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}