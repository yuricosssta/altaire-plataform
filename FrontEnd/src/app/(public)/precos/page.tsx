// FrontEnd/src/app/(public)/precos/page.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileText,
  FolderKanban,
  HelpCircle,
  Layers,
  Library,
  Minus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAButton, CTAGroup } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  FAQ_MOTION,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";
import { ROUTES } from "@/lib/constants/routes";

type BillingCycle = "monthly" | "annual";
type PlanTierKey = "individual" | "pro" | "agency";

type PlanBenefitGroup = {
  readonly moduleCode: string;
  readonly moduleTitle: string;
  readonly items: readonly string[];
};

type PricingPlan = {
  readonly key: PlanTierKey;
  readonly code: "01" | "02" | "03";
  readonly name: string;
  readonly subtitle: string;
  readonly badge?: string;
  readonly featured: boolean;
  readonly monthlyPrice: number;
  readonly annualMonthlyPrice: number;
  readonly annualTotal: number;
  readonly annualSavings: number;
  readonly idealFor: string;
  readonly operationalTransformation: string;
  readonly quickMetrics: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly benefitGroups: readonly PlanBenefitGroup[];
  readonly ctaLabel: string;
  readonly ctaMicrocopy: string;
};

const PRICING_PLANS: readonly PricingPlan[] = [
  {
    key: "individual",
    code: "01",
    name: "Individual",
    subtitle: "Estruturação Editorial para 1 Marca ou Especialista",
    badge: "Ponto de Partida",
    featured: false,
    monthlyPrice: 97,
    annualMonthlyPrice: 79,
    annualTotal: 948,
    annualSavings: 216,
    idealFor:
      "Especialistas, consultores, profissionais liberais e criadores que trabalham uma única oferta principal e querem sair do improviso dos posts soltos.",
    operationalTransformation:
      "Você deixa de depender de comandos avulsos a cada publicação e passa a operar dentro de um Projeto Editorial estruturado, onde sua oferta, seu público comprador e sua capacidade real de produção orientam o calendário, os temas e os roteiros.",
    quickMetrics: [
      { label: "Projetos Editoriais", value: "1 Projeto Ativo" },
      { label: "Capacidade Semanal", value: "Até 4 slots/semana" },
      { label: "Usuários", value: "1 acesso titular" },
    ],
    benefitGroups: [
      {
        moduleCode: "NÚCLEO · BASE ESTRATÉGICA",
        moduleTitle: "Contexto persistente do negócio",
        items: [
          "1 Projeto Editorial completo",
          "Mapeamento de Público e Objeções",
        ],
      },
      {
        moduleCode: "FUNÇÃO 01 · DIREÇÃO & CALENDÁRIO",
        moduleTitle: "Planejamento ajustado à rotina",
        items: [
          "Linha Editorial e Pilares",
          "Até 4 publicações por semana",
        ],
      },
      {
        moduleCode: "FUNÇÕES 02 E 03 · TEMAS E ROTEIROS",
        moduleTitle: "Da oportunidade à execução",
        items: [
          "Biblioteca Estratégica",
          "Roteiros e Legendas curtas",
        ],
      },
    ],
    ctaLabel: "Começar no Individual",
    ctaMicrocopy: "Estruture sua 1ª Base Estratégica.",
  },
  {
    key: "pro",
    code: "02",
    name: "Pro · Operação",
    subtitle: "Sistema Editorial Completo para Autoridade e Conversão",
    badge: "Mais Escolhido",
    featured: true,
    monthlyPrice: 197,
    annualMonthlyPrice: 157,
    annualTotal: 1884,
    annualSavings: 480,
    idealFor:
      "Infoprodutores, mentores, especialistas em expansão e marcas que possuem múltiplas frentes comerciais (ou produtos diferentes) e precisam de todos os formatos e ativos de conversão.",
    operationalTransformation:
      "Sua comunicação passa a funcionar como uma linha de produção estratégica completa: você separa contextos em até 3 Projetos Editoriais, alimenta a IA com seu próprio repertório autoral e desbloqueia vídeos longos, lives, direção visual e materiais complementares de conversão.",
    quickMetrics: [
      { label: "Projetos Editoriais", value: "Até 3 Projetos" },
      { label: "Capacidade & Formatos", value: "Todos os 6 Formatos" },
      { label: "Ativos Condicionais", value: "Inclusos no Fluxo" },
    ],
    benefitGroups: [
      {
        moduleCode: "NÚCLEO AVANÇADO",
        moduleTitle: "Múltiplas ofertas e repertório",
        items: [
          "Até 3 Projetos independentes",
          "Inclusão de repertório autoral",
        ],
      },
      {
        moduleCode: "FUNÇÃO 01 & 02",
        moduleTitle: "Matriz completa e biblioteca",
        items: [
          "Slots semanais ilimitados",
          "Temas por Sinais e Mercado",
        ],
      },
      {
        moduleCode: "FUNÇÃO 03 COMPLETA",
        moduleTitle: "Pacote integral e ativos extras",
        items: [
          "Todos os 6 Formatos + Duplo Modo",
          "Prompts, Checklists e Workbooks",
        ],
      },
    ],
    ctaLabel: "Começar no Plano Pro",
    ctaMicrocopy: "Libere todos os formatos e ativos extras.",
  },
  {
    key: "agency",
    code: "03",
    name: "Agência & Escala",
    subtitle: "Operação Multi-Projeto para Equipes, Agências e Consultorias",
    badge: "Máxima Capacidade",
    featured: false,
    monthlyPrice: 397,
    annualMonthlyPrice: 317,
    annualTotal: 3804,
    annualSavings: 960,
    idealFor:
      "Agências de conteúdo, estrategistas digitais, coprodutores e empresas com múltiplos especialistas ou unidades de negócio que exigem operação em escala com governança humana.",
    operationalTransformation:
      "Você centraliza até 10 operações editoriais inteiras em um único ambiente padronizado, eliminando o caos de pastas, planilhas e chats soltos entre estrategistas, redatores, designers e editores de vídeo.",
    quickMetrics: [
      { label: "Projetos Editoriais", value: "Até 10 Projetos" },
      { label: "Colaboração", value: "Até 5 membros" },
      { label: "Atendimento", value: "Suporte Prioritário" },
    ],
    benefitGroups: [
      {
        moduleCode: "ESCALA MULTI-MARCA",
        moduleTitle: "Isolamento total de clientes",
        items: [
          "Até 10 Projetos simultâneos",
          "Recursos Pro liberados em todos",
        ],
      },
      {
        moduleCode: "GOVERNANÇA DE EQUIPE",
        moduleTitle: "Estrategistas e editores alinhados",
        items: [
          "Até 5 assentos de usuários",
          "Controle avançado de versões",
        ],
      },
      {
        moduleCode: "DISTRIBUIÇÃO PRIORITÁRIA",
        moduleTitle: "Velocidade e suporte total",
        items: [
          "Pacotes de entrega estruturados",
          "Canal prioritário e dedicado",
        ],
      },
    ],
    ctaLabel: "Começar no Agência & Escala",
    ctaMicrocopy: "Centralize múltiplos clientes e equipes.",
  },
] as const;

type FitSimulatorScenario = {
  readonly key: PlanTierKey;
  readonly code: "01" | "02" | "03";
  readonly tabTitle: string;
  readonly profileHeadline: string;
  readonly profileDescription: string;
  readonly recommendedPlanName: string;
  readonly workflowHighlights: readonly {
    readonly tag: string;
    readonly title: string;
    readonly detail: string;
  }[];
};

const FIT_SIMULATOR_SCENARIOS: readonly FitSimulatorScenario[] = [
  {
    key: "individual",
    code: "01",
    tabTitle: "1 Especialista / 1 Oferta",
    profileHeadline:
      "Você vende uma consultoria, mentoria ou serviço principal e produz seu próprio conteúdo",
    profileDescription:
      "Seu maior gargalo hoje não é falta de conhecimento técnico — é sentar para criar conteúdo e perder horas decidindo o que postar, gerando publicações que não conduzem até a sua oferta.",
    recommendedPlanName: "Plano Individual",
    workflowHighlights: [
      {
        tag: "PASSO 01 · CONTEXTO ÚNICO",
        title: "Você configura 1 Projeto Editorial com sua oferta e seu público",
        detail:
          "Nunca mais precisa reexplicar quem você é ou o que vende antes de criar uma pauta.",
      },
      {
        tag: "PASSO 02 · RITMO REALISTA",
        title: "Calendário calibrado para 3 a 4 boas publicações por semana",
        detail:
          "Foco em consistência possível de sustentar sem sobrecarregar sua agenda de atendimento.",
      },
      {
        tag: "PASSO 03 · EXECUÇÃO DIRETA",
        title: "Roteiros prontos para Reels, Carrosséis e Sequências de Stories",
        detail:
          "Você abre o slot da semana, gera o roteiro com título e legenda, revisa e grava.",
      },
    ],
  },
  {
    key: "pro",
    code: "02",
    tabTitle: "Infoprodutor / Múltiplas Frentes",
    profileHeadline:
      "Você opera funis perpétuos, lançamentos ou possui mais de um produto na esteira comercial",
    profileDescription:
      "Você precisa que o conteúdo construa autoridade densa em múltiplos formatos (incluindo YouTube, Lives e Carrosséis profundos) e entregue iscas/materiais complementares conectados à conversão.",
    recommendedPlanName: "Plano Pro · Operação",
    workflowHighlights: [
      {
        tag: "PASSO 01 · ATÉ 3 PROJETOS",
        title: "Separe o produto Front-End, a Mentoria High-Ticket e o Institucional",
        detail:
          "Cada oferta mantém sua própria Base Estratégica, promessa, objeções e calendário.",
      },
      {
        tag: "PASSO 02 · TODOS OS 6 FORMATOS",
        title: "Combine Vídeos Curtos, Vídeos Longos, Lives, Carrosséis e Stories",
        detail:
          "Alterne entre Modo Técnico e Modo Conexão conforme o nível de consciência do público.",
      },
      {
        tag: "PASSO 03 · ATIVOS DE CONVERSÃO",
        title: "Direção de Thumbnail, Prompts Visuais e Materiais Complementares",
        detail:
          "Quando o slot qualifica, o sistema estrutura checklists, guias ou planilhas de apoio à venda.",
      },
    ],
  },
  {
    key: "agency",
    code: "03",
    tabTitle: "Agência / Equipe / Coprodução",
    profileHeadline:
      "Você gerencia a estratégia e a produção editorial de múltiplos clientes, sócios ou especialistas",
    profileDescription:
      "Seu desafio é manter padrão estratégico elevado em várias contas ao mesmo tempo sem que redatores e editores caiam em textos genéricos ou misturem o tom de voz de cada cliente.",
    recommendedPlanName: "Plano Agência & Escala",
    workflowHighlights: [
      {
        tag: "PASSO 01 · ATÉ 10 OPERAÇÕES",
        title: "Cada cliente ou especialista opera em um Projeto Editorial blindado",
        detail:
          "Repertório, histórias, pilares e calendários 100% organizados por conta.",
      },
      {
        tag: "PASSO 02 · EQUIPE SINCRONIZADA",
        title: "Até 5 membros trabalhando sobre a mesma direção aprovada",
        detail:
          "O estrategista aprova a Linha Editorial e a equipe desdobra temas, roteiros e versões.",
      },
      {
        tag: "PASSO 03 · PACOTES DE ENTREGA",
        title: "Roteiro + Título + Legenda + Direção de Capa + Ativo na mesma tela",
        detail:
          "Material completo pronto para revisão humana, gravação e edição audiovisual.",
      },
    ],
  },
] as const;

type ComparisonCategory = {
  readonly categoryCode: string;
  readonly categoryTitle: string;
  readonly rows: readonly {
    readonly feature: string;
    readonly description: string;
    readonly individual: string | boolean;
    readonly pro: string | boolean;
    readonly agency: string | boolean;
  }[];
};

const COMPARISON_CATEGORIES: readonly ComparisonCategory[] = [
  {
    categoryCode: "01 · NÚCLEO ESTRATÉGICO",
    categoryTitle: "Projetos Editoriais, Contexto e Autenticidade",
    rows: [
      {
        feature: "Projetos Editoriais independentes",
        description:
          "Ambientes isolados com Base Estratégica, oferta, público e histórico próprios.",
        individual: "1 projeto",
        pro: "Até 3 projetos",
        agency: "Até 10 projetos",
      },
      {
        feature: "Mapeamento de Oferta, Promessa, PUV/MUV e ICP",
        description:
          "Estruturação das dores, desejos, objeções e tom de voz que alimentam o sistema.",
        individual: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Inclusão de repertório próprio (histórias, estudos e transcrições)",
        description:
          "Uso de materiais autorais para preservar a identidade real do especialista.",
        individual: "Essencial",
        pro: "Avançado por projeto",
        agency: "Avançado multi-cliente",
      },
      {
        feature: "Assentos de usuários / colaboração na conta",
        description:
          "Quantidade de profissionais que podem acessar e operar os projetos.",
        individual: "1 usuário",
        pro: "Até 2 usuários",
        agency: "Até 5 usuários",
      },
    ],
  },
  {
    categoryCode: "02 · FUNÇÃO 01 — DIREÇÃO",
    categoryTitle: "Linha Editorial e Calendário Baseado em Capacidade Real",
    rows: [
      {
        feature: "Linha Editorial (Mensagem Central, Pilares e Objetivos)",
        description:
          "Transformação da Base Estratégica em critérios claros de comunicação.",
        individual: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Calendário Editorial ajustado à capacidade real de produção",
        description:
          "Distribuição de slots conforme a frequência sustentável da operação.",
        individual: "Até 4 slots/semana",
        pro: "Slots ilimitados",
        agency: "Slots ilimitados",
      },
      {
        feature: "Equilíbrio de jornada e consciência (Matriz RETINA)",
        description:
          "Distribuição intencional entre relacionamento, autoridade, consciência e conversão.",
        individual: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Revisão e aprovação humana antes da execução",
        description:
          "Controle total para ajustar pilares e agenda antes de gerar temas e roteiros.",
        individual: true,
        pro: true,
        agency: true,
      },
    ],
  },
  {
    categoryCode: "03 · FUNÇÃO 02 — TEMAS E ÂNGULOS",
    categoryTitle: "Biblioteca Estratégica e Origens de Pauta",
    rows: [
      {
        feature: "Geração de temas a partir do negócio, público e objetivo",
        description:
          "Pautas conectadas diretamente à oferta e às objeções mapeadas no projeto.",
        individual: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Geração a partir de sinais, dúvidas e lacunas do mercado",
        description:
          "Identificação de ângulos estratégicos pouco explorados no seu segmento.",
        individual: "Padrão",
        pro: "Completo + Filtros",
        agency: "Completo + Filtros",
      },
      {
        feature: "Biblioteca filtrável por pilar, formato, jornada e plataforma",
        description:
          "Acervo vivo para consultar, classificar e reaproveitar temas aprovados.",
        individual: true,
        pro: true,
        agency: true,
      },
    ],
  },
  {
    categoryCode: "04 · FUNÇÃO 03 — ROTEIROS E ATIVOS",
    categoryTitle: "Execução por Formato, Direção Visual e Ativos Condicionais",
    rows: [
      {
        feature: "Vídeos curtos, Carrosséis, Posts estáticos e Sequências de Stories",
        description:
          "Roteiros completos com abertura de retenção, desenvolvimento e CTA.",
        individual: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Vídeos longos (YouTube/Aulas) e Lives estratégicas",
        description:
          "Estruturação em blocos profundos para formatos de alta construção de autoridade.",
        individual: false,
        pro: true,
        agency: true,
      },
      {
        feature: "Alternância de Roteiro: Modo Técnico/Segurança & Modo Conexão",
        description:
          "Escolha a densidade argumentativa e narrativa ideal para cada publicação.",
        individual: "Modo Padrão",
        pro: "Duplo Modo Completo",
        agency: "Duplo Modo Completo",
      },
      {
        feature: "Títulos, Legenda, Direção de Thumbnail/Capa e Prompts de Imagem",
        description:
          "Pacote textual e visual gerado na mesma tela a partir do mesmo contexto.",
        individual: "Títulos, Legenda & CTA",
        pro: "Pacote Completo + Prompts",
        agency: "Pacote Completo + Prompts",
      },
      {
        feature: "Materiais Complementares Condicionais (Checklist, Workbook, Guia)",
        description:
          "Ativos extras habilitados quando qualificados pela estratégia do slot.",
        individual: false,
        pro: true,
        agency: true,
      },
    ],
  },
] as const;

type PricingFAQItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: readonly string[];
};

const PRICING_FAQ_ITEMS: readonly PricingFAQItem[] = [
  {
    id: "pricing-faq-01",
    question: "Como saber se devo começar pelo Plano Individual ou pelo Plano Pro?",
    answer: [
      "Se você trabalha uma única oferta principal e foca sua operação em vídeos curtos, carrosséis, posts estáticos e Stories (até 4 publicações por semana), o Plano Individual entrega toda a estrutura de Base Estratégica, Linha Editorial, Calendário, Temas e Roteiros que você precisa.",
      "Se você possui mais de um produto/oferta (ou separa perpétuo e lançamentos), produz vídeos longos ou lives, ou deseja gerar direção visual completa com prompts de imagem e materiais complementares de conversão (como checklists e workbooks), o Plano Pro é a escolha recomendada.",
    ],
  },
  {
    id: "pricing-faq-02",
    question: "O que significa exatamente '1 Projeto Editorial' em cada plano?",
    answer: [
      "Um Projeto Editorial é o ambiente que guarda a Base Estratégica, a Linha Editorial, o Calendário, a Biblioteca de Temas e todos os Roteiros e Ativos de uma operação específica.",
      "Manter cada marca, cliente ou oferta distinta em seu próprio Projeto Editorial garante que a IA nunca misture públicos, promessas ou tons de voz diferentes.",
    ],
  },
  {
    id: "pricing-faq-03",
    question: "Posso mudar de plano depois que minha operação crescer?",
    answer: [
      "Sim. Você pode fazer upgrade do Plano Individual para o Pro ou para o Agência & Escala a qualquer momento diretamente no painel.",
      "Ao alterar de plano, todos os Projetos Editoriais, Bases Estratégicas, calendários, temas e roteiros que você já construiu permanecem 100% preservados.",
    ],
  },
  {
    id: "pricing-faq-04",
    question: "Qual a diferença entre o ciclo mensal e o ciclo anual?",
    answer: [
      "Ambos os ciclos liberam exatamente as mesmas funcionalidades dentro do plano escolhido. No ciclo mensal, a renovação é feita mês a mês com total flexibilidade.",
      "No ciclo anual, você garante 20% de desconto imediato (equivalente a mais de 2 meses de economia ao longo do ano), ideal para operações que já assumiram a comunicação estratégica como processo contínuo.",
    ],
  },
  {
    id: "pricing-faq-05",
    question: "Preciso já ter toda a minha Linha Editorial pronta antes de assinar?",
    answer: [
      "Não. O Legion Altaire foi construído justamente para guiar você desde a etapa zero: você começa preenchendo as informações do seu negócio na Base Estratégica e a própria plataforma estrutura a proposta de Linha Editorial e Calendário para você revisar, ajustar e aprovar.",
    ],
  },
] as const;

function PricingPlanCard({
  plan,
  billingCycle,
  shouldReduceMotion,
}: {
  readonly plan: PricingPlan;
  readonly billingCycle: BillingCycle;
  readonly shouldReduceMotion: boolean | null;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 220,
    y: 180,
    opacity: 0,
  });

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
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

  const displayedPrice =
    billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;

  const targetHref = `${ROUTES.cadastro}?plano=${plan.key}&ciclo=${
    billingCycle === "annual" ? "anual" : "mensal"
  }`;

  const PlanIcon =
    plan.key === "individual"
      ? Compass
      : plan.key === "pro"
        ? Sparkles
        : Users;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        plan.featured
          ? {
              boxShadow:
                "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 28px 64px rgba(0, 0, 0, 0.85), 0 0 72px rgba(207, 169, 101, 0.14)",
            }
          : undefined
      }
      className={clsx(
        "relative flex h-full flex-col overflow-hidden rounded-la-xl border p-6 transition-colors duration-200 sm:p-7",
        plan.featured
          ? "border-la-gold/75 bg-[#0B0E17]/95"
          : "border-white/12 bg-la-surface-1/90 hover:border-white/25"
      )}
    >
      <div
        aria-hidden="true"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(440px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, ${
            plan.featured ? "0.16" : "0.11"
          }), transparent 68%)`,
        }}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
      />

      {plan.featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Topo do Card */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={clsx(
                "inline-flex h-7 w-7 items-center justify-center rounded-la-xs border font-la-mono text-[0.75rem] font-semibold",
                plan.featured
                  ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_14px_rgba(207,169,101,0.45)]"
                  : "border-la-border-gold bg-la-gold-faint text-la-gold-light"
              )}
            >
              {plan.code}
            </span>
            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Plano {plan.code}
            </span>
          </div>

          {plan.badge ? (
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-la-full border px-3 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em]",
                plan.featured
                  ? "border-la-gold bg-la-gold text-la-text-inverse"
                  : "border-white/15 bg-black/45 text-la-text-secondary"
              )}
            >
              <PlanIcon aria-hidden="true" className="h-3 w-3" />
              <span>{plan.badge}</span>
            </span>
          ) : null}
        </div>

        {/* Nome do Plano */}
        <div className="mt-4">
          <h2 className="font-la-sans text-[1.5rem] font-semibold leading-[1.2] text-la-text-primary sm:text-[1.625rem]">
            {plan.name}
          </h2>
          <p className="mt-1 font-la-sans text-[0.875rem] font-medium text-la-gold-light">
            {plan.subtitle}
          </p>
        </div>

        {/* Bloco de Preço Ajustado/Centralizado */}
        <div className="mt-5 flex flex-col items-center justify-center rounded-la-lg border border-white/10 bg-black/50 p-5 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-la-mono text-[0.875rem] font-semibold text-la-text-secondary">
              R$
            </span>
            <span className="font-la-sans text-[2.75rem] font-bold leading-none tracking-[-0.03em] text-la-text-primary">
              {displayedPrice}
            </span>
            <span className="font-la-mono text-[0.75rem] text-la-text-muted">
              /mês
            </span>
          </div>

          <div className="mt-3 flex flex-col items-center gap-1.5 border-t border-white/10 pt-3 font-la-mono text-[0.6875rem]">
            {billingCycle === "annual" ? (
              <>
                <span className="text-la-text-secondary">
                  Faturado anualmente (R$ {plan.annualTotal}/ano)
                </span>
                <span className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2 py-0.5 font-semibold text-la-gold-light">
                  Economia garantida de R$ {plan.annualSavings}/ano
                </span>
              </>
            ) : (
              <>
                <span className="text-la-text-secondary">
                  Renovação mensal flexível
                </span>
                <span className="text-la-gold-light">
                  No plano anual o valor cai para R$ {plan.annualMonthlyPrice}/mês
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {plan.quickMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-la-md border border-white/10 bg-white/[0.025] px-2.5 py-2 text-center"
            >
              <span className="block truncate font-la-mono text-[0.5rem] uppercase tracking-[0.06em] text-la-text-muted">
                {metric.label}
              </span>
              <span className="mt-0.5 block truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
          <div>
            <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              Para quem é ideal
            </span>
            <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
              {plan.idealFor}
            </p>
          </div>
          <div className="rounded-la-md border border-la-border-gold/40 bg-la-gold-faint p-3.5">
            <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              O que muda na sua rotina
            </span>
            <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.58] text-la-text-primary">
              {plan.operationalTransformation}
            </p>
          </div>
        </div>

        {/* Lista Condensada de Benefícios */}
        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 mb-6">
          <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-primary">
            O que está incluído no {plan.name}:
          </span>

          <div className="flex flex-col gap-2">
            {plan.benefitGroups.map((group) => (
              <div
                key={group.moduleCode}
                className="flex flex-col gap-1.5 rounded-la-md border border-white/10 bg-black/40 p-3"
              >
                <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  {group.moduleCode}
                </span>
                <ul className="mt-1 flex flex-col gap-1">
                  {group.items.map((itemText) => (
                    <li
                      key={itemText}
                      className="flex items-start gap-2 font-la-sans text-[0.75rem] leading-[1.4] text-la-text-secondary"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-la-gold"
                      />
                      <span>{itemText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Botão ancorado sempre no final do card flex */}
        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-5">
          <CTAButton
            action={{
              label: plan.ctaLabel,
              href: targetHref,
              variant: plan.featured ? "primary" : "secondary",
            }}
            variant={plan.featured ? "primary" : "secondary"}
            size="md"
            showArrow={true}
            fullWidthMobile={true}
            className="w-full justify-center"
          />
          <p className="text-center font-la-mono text-[0.625rem] text-la-text-muted">
            {plan.ctaMicrocopy}
          </p>
        </div>
      </div>
    </article>
  );
}

function ComparisonValueCell({
  value,
  highlighted = false,
}: {
  readonly value: string | boolean;
  readonly highlighted?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className={clsx(
          "inline-flex h-6 w-6 items-center justify-center rounded-la-full border",
          highlighted
            ? "border-la-gold bg-la-gold/20 text-la-gold-light"
            : "border-la-border-gold/50 bg-la-gold-faint text-la-gold"
        )}
      >
        <Check aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="sr-only">Incluído</span>
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center text-white/25">
        <Minus aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="sr-only">Não aplicável neste plano</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "rounded-la-xs border px-2.5 py-1 font-la-mono text-[0.6875rem] font-medium",
        highlighted
          ? "border-la-border-gold/60 bg-la-gold-faint font-semibold text-la-gold-light"
          : "border-white/10 bg-black/45 text-la-text-primary"
      )}
    >
      {value}
    </span>
  );
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(1);
  const [isStagePaused, setIsStagePaused] = useState<boolean>(false);
  const [openFaqIds, setOpenFaqIds] = useState<readonly string[]>([
    "pricing-faq-01",
  ]);
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

  useEffect(() => {
    if (shouldReduceMotion || isStagePaused || !isStageInView) return;
    const timer = window.setInterval(() => {
      setActiveScenarioIndex(
        (prev) => (prev + 1) % FIT_SIMULATOR_SCENARIOS.length
      );
    }, 5200);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, isStagePaused, isStageInView]);

  const handleStageMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) return;
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

  const toggleFaqItem = (id: string) => {
    setOpenFaqIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
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

  const faqContentVariants = selectMotionPreset(
    shouldReduceMotion,
    FAQ_MOTION.content,
    REDUCED_MOTION_VARIANTS.disclosure
  );

  const activeScenario =
    FIT_SIMULATOR_SCENARIOS[activeScenarioIndex] ?? FIT_SIMULATOR_SCENARIOS[1];

  return (
    <div className="flex flex-col [overflow-anchor:none]">
      <SectionShell
        id="precos-topo"
        ariaLabelledBy="precos-hero-title"
        container="max"
        spacing="hero"
        surface="canvas"
        bottomBorder={true}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 left-1/2 -z-0 h-[28rem] w-[58rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.03)_48%,transparent_74%)] blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="flex flex-col items-start lg:col-span-7">
              <SectionEyebrow
                label="PLANOS E ESTRUTURA DE OPERAÇÃO"
                variant="pill"
              />

              <h1
                id="precos-hero-title"
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(2rem,3.4vw,3.125rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-la-text-primary"
              >
                Escolha a estrutura certa para transformar sua estratégia em
                operação editorial.
              </h1>

              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
                No Legion Altaire, você não contrata um gerador de textos
                avulsos. Você estrutura Projetos Editoriais completos que
                conectam Base Estratégica, Linha Editorial, Calendário,
                Biblioteca de Temas, Roteiros e Ativos no mesmo fluxo.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                Cada plano foi desenhado conforme a quantidade de frentes do seu
                negócio (Projetos Editoriais), a profundidade dos formatos
                utilizados na rotina e o nível de colaboração da sua operação.
              </p>

              <div className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint px-4 py-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-la-gold"
                />
                <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                  A IA propõe e organiza. Você revisa, ajusta e aprova.
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="flex flex-col items-center justify-between gap-4 rounded-la-xl border border-white/12 bg-[#07090F]/90 p-4 sm:flex-row sm:px-6"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal
                aria-hidden="true"
                className="h-4 w-4 text-la-gold"
              />
              <div>
                <span className="block font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                  Modalidade de assinatura
                </span>
                <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                  Alterne entre renovação mensal flexível ou ciclo anual com
                  economia
                </span>
              </div>
            </div>

            <div
              role="group"
              aria-label="Selecionar ciclo de cobrança"
              className="inline-flex items-center gap-1.5 rounded-la-lg border border-white/12 bg-black/60 p-1.5"
            >
              <button
                type="button"
                aria-pressed={billingCycle === "monthly"}
                onClick={() => setBillingCycle("monthly")}
                className={clsx(
                  "relative rounded-la-md px-4 py-2 font-la-mono text-[0.75rem] font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                  billingCycle === "monthly"
                    ? "font-semibold text-la-text-inverse"
                    : "text-la-text-secondary hover:text-la-text-primary"
                )}
              >
                {billingCycle === "monthly" ? (
                  <motion.span
                    layoutId="pricing-billing-cycle-pill"
                    transition={{
                      type: "tween",
                      duration: 0.26,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="pointer-events-none absolute inset-0 z-0 rounded-la-md bg-la-gold"
                  />
                ) : null}
                <span className="relative z-10">Ciclo Mensal</span>
              </button>

              <button
                type="button"
                aria-pressed={billingCycle === "annual"}
                onClick={() => setBillingCycle("annual")}
                className={clsx(
                  "relative inline-flex items-center gap-2 rounded-la-md px-4 py-2 font-la-mono text-[0.75rem] font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                  billingCycle === "annual"
                    ? "font-semibold text-la-text-inverse"
                    : "text-la-text-secondary hover:text-la-text-primary"
                )}
              >
                {billingCycle === "annual" ? (
                  <motion.span
                    layoutId="pricing-billing-cycle-pill"
                    transition={{
                      type: "tween",
                      duration: 0.26,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="pointer-events-none absolute inset-0 z-0 rounded-la-md bg-la-gold"
                  />
                ) : null}
                <span className="relative z-10">Ciclo Anual</span>
                <span
                  className={clsx(
                    "relative z-10 rounded-la-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase",
                    billingCycle === "annual"
                      ? "bg-black/25 text-la-text-inverse"
                      : "border border-la-border-gold/50 bg-la-gold-faint text-la-gold-light"
                  )}
                >
                  -20% OFF
                </span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3"
          >
            {PRICING_PLANS.map((plan) => (
              <motion.div
                key={plan.key}
                variants={staggerItemVariants}
                className="flex"
              >
                <PricingPlanCard
                  plan={plan}
                  billingCycle={billingCycle}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionShell>

      <SectionShell
        id="diagnostico-plano"
        ariaLabelledBy="diagnostico-plano-title"
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
                label="COMO ESCOLHER COM CLAREZA"
                variant="pill"
              />

              <h2
                id="diagnostico-plano-title"
                className="mt-4 max-w-[23ch] text-balance font-la-sans text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
              >
                Veja como cada plano opera dentro da realidade do seu negócio.
              </h2>
            </div>

            <div className="lg:col-span-5">
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                Selecione abaixo o cenário mais próximo da sua estrutura atual
                para inspecionar como os Projetos Editoriais, formatos e ativos
                são organizados em cada nível.
              </p>
            </div>
          </motion.div>

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

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/65 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-white/15" />
                    <span className="h-2 w-2 rounded-la-full bg-la-gold/75" />
                  </div>
                  <FolderKanban
                    aria-hidden="true"
                    className="ml-1 h-4 w-4 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Simulador de Estrutura · {activeScenario.recommendedPlanName}
                  </span>
                </div>

                <div
                  aria-label="Selecionar perfil de operação"
                  className="flex flex-wrap items-center gap-1 rounded-la-md border border-white/10 bg-black/50 p-1"
                >
                  {FIT_SIMULATOR_SCENARIOS.map((scenario, idx) => {
                    const isTabSelected = activeScenarioIndex === idx;
                    return (
                      <button
                        key={scenario.key}
                        type="button"
                        aria-pressed={isTabSelected}
                        onClick={() => setActiveScenarioIndex(idx)}
                        className={clsx(
                          "relative rounded-la-sm px-3 py-1.5 font-la-mono text-[0.6875rem] font-medium transition-colors duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          isTabSelected
                            ? "font-semibold text-la-text-inverse"
                            : "text-la-text-secondary hover:text-la-text-primary"
                        )}
                      >
                        {isTabSelected ? (
                          <motion.span
                            layoutId="pricing-fit-stage-tab"
                            transition={{
                              type: "tween",
                              duration: 0.26,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="pointer-events-none absolute inset-0 z-0 rounded-la-sm bg-la-gold"
                          />
                        ) : null}
                        <span className="relative z-10">
                          {scenario.code} · {scenario.tabTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
                <div className="grid grid-cols-1 lg:col-span-8">
                  {FIT_SIMULATOR_SCENARIOS.map((scenario, idx) => {
                    const isCurrent = activeScenarioIndex === idx;

                    return (
                      <div
                        key={scenario.key}
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
                              Cenário {scenario.code} · {scenario.tabTitle}
                            </span>
                            <h3 className="mt-1 font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                              {scenario.profileHeadline}
                            </h3>
                          </div>

                          <span className="rounded-la-full border border-la-border-gold bg-la-gold-faint px-3 py-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                            Recomendado: {scenario.recommendedPlanName}
                          </span>
                        </div>

                        <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                          {scenario.profileDescription}
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {scenario.workflowHighlights.map((hl) => (
                            <div
                              key={hl.tag}
                              className="flex flex-col justify-between rounded-la-lg border border-white/10 bg-white/[0.025] p-3.5"
                            >
                              <div>
                                <span className="font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                                  {hl.tag}
                                </span>
                                <p className="mt-1.5 font-la-sans text-[0.8125rem] font-semibold leading-[1.35] text-la-text-primary">
                                  {hl.title}
                                </p>
                              </div>
                              <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                                {hl.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  aria-hidden="true"
                  className="relative flex h-[12.5rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.16)_0%,rgba(11,14,21,0.94)_62%,#040508_100%)] lg:col-span-4"
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
                    {FIT_SIMULATOR_SCENARIOS.map((layer, layerIdx) => {
                      const isLayerActive = activeScenarioIndex === layerIdx;
                      const zBase =
                        layerIdx === 2 ? 24 : layerIdx === 1 ? 0 : -22;
                      const zActive =
                        layerIdx === 2 ? 32 : layerIdx === 1 ? 8 : -16;

                      return (
                        <motion.div
                          key={layer.key}
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
                              {layer.recommendedPlanName}
                            </span>
                            <Compass className="h-2.5 w-2.5 shrink-0 text-la-gold" />
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

      <SectionShell
        id="comparativo-planos"
        ariaLabelledBy="comparativo-planos-title"
        container="max"
        spacing="spacious"
        surface="canvas"
        bottomBorder={true}
      >
        <div className="flex flex-col gap-10 lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="flex flex-col items-start gap-3"
          >
            <SectionEyebrow
              label="MATRIZ TÉCNICA DE CAPACIDADES"
              variant="pill"
            />
            <h2
              id="comparativo-planos-title"
              className="max-w-[24ch] text-balance font-la-sans text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
            >
              Compare cada camada da operação entre os três planos.
            </h2>
            <p className="w-full max-w-[46rem] text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
              Todos os planos operam sobre o mesmo método estratégico do Legion
              Altaire. A diferença está no volume de Projetos Editoriais, na
              amplitude de formatos e nos recursos de equipe.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="overflow-hidden rounded-la-xl border border-white/12 bg-la-surface-1/90 shadow-[var(--la-elevation-2)]"
          >
            <div className="hidden grid-cols-12 items-center border-b border-white/10 bg-black/65 px-6 py-4 lg:grid">
              <div className="col-span-5 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
                Camada Funcional / Recurso
              </div>
              <div className="col-span-2 text-center font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                Individual
              </div>
              <div className="col-span-3 flex items-center justify-center gap-1.5 text-center font-la-sans text-[0.9375rem] font-semibold text-la-gold-light">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                <span>Pro · Operação</span>
              </div>
              <div className="col-span-2 text-center font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                Agência & Escala
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {COMPARISON_CATEGORIES.map((category) => (
                <div key={category.categoryCode} className="flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/45 px-5 py-3 sm:px-6">
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {category.categoryCode}
                    </span>
                    <span className="font-la-sans text-[0.8125rem] font-medium text-la-text-secondary">
                      {category.categoryTitle}
                    </span>
                  </div>

                  <div className="divide-y divide-white/10">
                    {category.rows.map((row) => (
                      <div key={row.feature}>
                        <div className="hidden grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-white/[0.02] lg:grid">
                          <div className="col-span-5 pr-6">
                            <p className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                              {row.feature}
                            </p>
                            <p className="mt-0.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                              {row.description}
                            </p>
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <ComparisonValueCell value={row.individual} />
                          </div>

                          <div className="col-span-3 flex justify-center">
                            <ComparisonValueCell
                              value={row.pro}
                              highlighted={true}
                            />
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <ComparisonValueCell value={row.agency} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 p-5 lg:hidden">
                          <div>
                            <p className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                              {row.feature}
                            </p>
                            <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                              {row.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 rounded-la-lg border border-white/10 bg-black/45 p-2.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                                Individual
                              </span>
                              <ComparisonValueCell value={row.individual} />
                            </div>

                            <div className="flex flex-col items-center gap-1 border-x border-white/10 px-1">
                              <span className="font-la-mono text-[0.5625rem] font-semibold uppercase text-la-gold-light">
                                Pro
                              </span>
                              <ComparisonValueCell
                                value={row.pro}
                                highlighted={true}
                              />
                            </div>

                            <div className="flex flex-col items-center gap-1">
                              <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                                Agência
                              </span>
                              <ComparisonValueCell value={row.agency} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </SectionShell>

      <SectionShell
        id="precos-faq"
        ariaLabelledBy="precos-faq-title"
        container="wide"
        spacing="spacious"
        surface="surface-1"
        bottomBorder={false}
      >
        <div className="mx-auto flex w-full max-w-[54rem] flex-col gap-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="flex flex-col items-start gap-3"
          >
            <SectionEyebrow
              label="DÚVIDAS SOBRE PLANOS E ASSINATURA"
              variant="pill"
            />
            <h2
              id="precos-faq-title"
              className="max-w-[24ch] text-balance font-la-sans text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
            >
              Respostas diretas antes de você iniciar seu Projeto Editorial.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-2.5">
            {PRICING_FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIds.includes(item.id);
              const numberCode = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={item.id}
                  style={
                    isOpen
                      ? {
                          boxShadow:
                            "inset 2px 0 0 0 #CFA965, 0 12px 32px rgba(0, 0, 0, 0.45)",
                        }
                      : undefined
                  }
                  className={clsx(
                    "overflow-hidden rounded-la-xl border transition-all duration-200",
                    isOpen
                      ? "border-la-gold/55 bg-[#0C0F17]/95"
                      : "border-white/10 bg-la-canvas/75 hover:border-white/20"
                  )}
                >
                  <h3 className="m-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaqItem(item.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                    >
                      <span className="flex items-center gap-3.5">
                        <span
                          className={clsx(
                            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold",
                            isOpen
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-white/15 bg-black/45 text-la-gold-light"
                          )}
                        >
                          {numberCode}
                        </span>
                        <span className="text-balance font-la-sans text-[1rem] font-semibold text-la-text-primary">
                          {item.question}
                        </span>
                      </span>

                      <ChevronDown
                        aria-hidden="true"
                        className={clsx(
                          "h-4 w-4 shrink-0 text-la-gold transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={faqContentVariants}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 border-t border-white/10 px-5 pt-3.5 pb-5 sm:pl-14">
                          {item.answer.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-la-xl border border-la-border-gold/50 bg-[#07090F]/95 p-6 shadow-[var(--la-elevation-2)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
            />

            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex max-w-[36rem] flex-col gap-2">
                <div className="inline-flex items-center gap-2">
                  <HelpCircle
                    aria-hidden="true"
                    className="h-4 w-4 text-la-gold"
                  />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Próximo Passo
                  </span>
                </div>

                <h3 className="text-balance font-la-sans text-[1.25rem] font-semibold text-la-text-primary sm:text-[1.375rem]">
                  Pronto para estruturar seu primeiro Projeto Editorial?
                </h3>

                <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.65] text-la-text-secondary">
                  Crie sua conta para organizar a Base Estratégica do seu
                  negócio ou fale diretamente com nosso time caso precise de
                  orientação sobre o plano ideal.
                </p>
              </div>

              <div className="shrink-0">
                <CTAGroup
                  primaryAction={{
                    label: "Começar agora",
                    href: ROUTES.cadastro,
                    variant: "primary",
                  }}
                  secondaryAction={{
                    label: "Falar com o atendimento",
                    href: ROUTES.contato,
                    variant: "secondary",
                  }}
                  microcopy={["Acesso imediato à criação do Projeto Editorial."]}
                  align="left"
                  size="md"
                  showPrimaryArrow={true}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}