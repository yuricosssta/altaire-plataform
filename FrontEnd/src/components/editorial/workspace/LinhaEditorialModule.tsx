// FrontEnd/src/components/editorial/workspace/LinhaEditorialModule.tsx
"use client";

import { useState, type FormEvent } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Edit3,
  Layers,
  Mic,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { clsx } from "clsx";

export type LineEditorialPillarDetail = {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly targetPainOrObjection: string;
  readonly angleExamples: readonly string[];
};

export type LineEditorialToneGuide = {
  readonly adjectives: readonly string[];
  readonly whatToRepeat: readonly string[];
  readonly whatToAvoid: readonly string[];
  readonly howToOpenReasoning: readonly string[];
  readonly proprietaryVocabulary: readonly string[];
  readonly forbiddenTerms: readonly string[];
};

export type ProductionCapacityConfig = {
  readonly reelsPerWeek: number;
  readonly longVideosPerWeek: number;
  readonly carouselsPerWeek: number;
  readonly staticPostsPerWeek: number;
  readonly livesPerWeek: number;
  readonly storiesSequencesPerDay: number;
};

export type FullLineEditorialVersion = {
  readonly id: string;
  readonly name: string;
  readonly status: "active" | "draft" | "review_recommended" | "archived";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly strategicBaseComplete: boolean;
  readonly niche: string;
  readonly subniche: string;
  readonly productAndOffer: string;
  readonly romaPromise: string;
  readonly differentials: string;
  readonly icpPains: readonly string[];
  readonly icpDesires: readonly string[];
  readonly icpObjections: readonly string[];
  readonly icpMyths: readonly string[];
  readonly puv: string;
  readonly muv: string;
  readonly bigIdea: string;
  readonly positioningPhrase: string;
  readonly centralMessage: string;
  readonly worldViewAndEnemy: string;
  readonly pillars: readonly LineEditorialPillarDetail[];
  readonly toneOfVoice: LineEditorialToneGuide;
  readonly retinaDistribution: readonly {
    readonly type:
      | "Relacionamento"
      | "Engajamento"
      | "Transformação"
      | "Interação"
      | "Níveis de Consciência"
      | "Autoridade";
    readonly percentage: number;
    readonly strategicRole: string;
  }[];
  readonly productionCapacity: ProductionCapacityConfig;
  readonly pendingItems?: readonly string[];
};

type InternalSectionKey =
  | "visao-geral"
  | "pilares"
  | "tom-de-voz"
  | "retina-capacidade"
  | "base-estrategica";

export type LinhaEditorialModuleProps = {
  readonly projectName: string;
  readonly projectNiche: string;
  readonly projectSubniche: string;
  readonly projectObjective: string;
  readonly onGoToCalendarTab: () => void;
};

const INITIAL_LINE_VERSIONS = (
  niche: string,
  subniche: string
): readonly FullLineEditorialVersion[] => [
  {
    id: "line-v1-ativa",
    name: "Linha Editorial v1 — Campanha de Aquecimento & Semente",
    status: "active",
    createdAt: "25/07/2026",
    updatedAt: "01/08/2026",
    strategicBaseComplete: true,
    niche,
    subniche,
    productAndOffer: `Mentoria & Sistema Operacional aplicado a ${subniche}, com acompanhamento estratégico de implementação em 8 semanas.`,
    romaPromise: `Estruturar uma operação previsível e autoral em ${subniche} capaz de transformar audiência qualificada em demanda comercial contínua sem depender de improviso diário.`,
    differentials:
      "Arquitetura orientada por contexto persistente, separação estrita por projeto e execução assistida com validação humana.",
    icpPains: [
      "Passa horas tentando decidir o que postar e acaba publicando conteúdo desconectado da oferta.",
      "Atrai seguidores curiosos, mas que não avançam para compra nem enxergam o valor do produto principal.",
      "Sente que usar IA comum deixa os textos genéricos, robóticos e iguais aos de todo o mercado.",
    ],
    icpDesires: [
      "Ter uma linha editorial clara onde cada post prepara o terreno para a venda.",
      "Ser reconhecido como referência incontestável no segmento pela profundidade técnica.",
      "Produzir uma semana inteira de roteiros e stories em poucas horas com direção exata.",
    ],
    icpObjections: [
      "“Não tenho tempo na rotina para gravar e alimentar todas as redes todos os dias.”",
      "“Meu nicho é muito específico/técnico, fórmulas prontas não funcionam para o meu público.”",
      "“Já tentei planejar calendário antes e abandonei na segunda semana por excesso de complexidade.”",
    ],
    icpMyths: [
      "Mito de que postar 3 vezes por dia qualquer assunto gera vendas automáticas.",
      "Mito de que precisa de dezenas de milhares de seguidores antes de lançar uma oferta de alto valor.",
    ],
    puv: `O único método em ${subniche} que une diagnóstico de precisão, rotina enxuta baseada na capacidade real e ativos de conversão acoplados.`,
    muv: "Engenharia de Contexto Persistente: a estratégia orienta a agenda, a agenda orienta o tema e o tema gera o roteiro.",
    bigIdea:
      "Volume sem direção é ruído; autoridade e lucro nascem da coerência entre promessa, calendário e execução.",
    positioningPhrase: `Para especialistas e negócios de ${niche} que recusam o amadorismo e operam comunicação como ativo comercial.`,
    centralMessage: `Transformar domínio técnico em ${niche} (${subniche}) em posicionamento soberano, previsibilidade e decisão de compra consciente.`,
    worldViewAndEnemy:
      "Combatemos o improviso dos posts soltos, as dancinhas sem propósito comercial e os prompts genéricos que destroem a identidade do especialista.",
    pillars: [
      {
        code: "PILAR 01",
        title: "Quebra de Mitos & Visão de Mundo",
        description:
          "Desconstrói os dogmas superficiais do mercado e posiciona a tese central da marca como o único caminho lógico.",
        targetPainOrObjection:
          "Mito de que frequência cega substitui direção estratégica.",
        angleExamples: [
          "Por que seguir o conselho padrão do mercado trava sua margem",
          "O erro silencioso que 90% dos profissionais cometem ao tentar escalar",
        ],
      },
      {
        code: "PILAR 02",
        title: "Diagnóstico de Erros Invisíveis do ICP",
        description:
          "Nomeia os sintomas reais que o comprador sente no dia a dia e revela a causa-raiz técnica do problema.",
        targetPainOrObjection:
          "Imprevisibilidade comercial e estagnação de resultados.",
        angleExamples: [
          "3 sinais de que sua operação está perdendo compradores prontos",
          "O vazamento invisível na sua rotina de captação",
        ],
      },
      {
        code: "PILAR 03",
        title: "Mecanismo Único da Oferta (MUV)",
        description:
          "Apresenta a lógica proprietária do método, mostrando por que ele funciona onde as tentativas anteriores falharam.",
        targetPainOrObjection:
          "Objeção: “Já tentei outras abordagens e não tive consistência”.",
        angleExamples: [
          "Como funciona a Engenharia de Contexto na prática",
          "A diferença entre tentar no braço e operar com sistema",
        ],
      },
      {
        code: "PILAR 04",
        title: "Bastidores da Execução & Aplicação Prática",
        description:
          "Mostra o método rodando na vida real: telas, processos, decisões e rotinas sem filtro.",
        targetPainOrObjection:
          "Objeção: “Não tenho tempo sobrando na minha agenda”.",
        angleExamples: [
          "Como organizo 4 semanas de execução em 45 minutos",
          "Por dentro da preparação da campanha desta semana",
        ],
      },
      {
        code: "PILAR 05",
        title: "Superação de Objeções Críticas",
        description:
          "Desarma diretamente as desculpas mentais, técnicas e financeiras que impedem o público de dar o próximo passo.",
        targetPainOrObjection:
          "Medo de investir tempo/dinheiro e travar na implementação.",
        angleExamples: [
          "Como aplicar mesmo com agenda lotada de atendimentos",
          "Preciso de equipe grande para rodar essa estrutura?",
        ],
      },
      {
        code: "PILAR 06",
        title: "Provas, Estudos de Caso & Autoridade",
        description:
          "Valida a promessa (ROMA) com resultados concretos, análises de casos reais e demonstrações de domínio.",
        targetPainOrObjection:
          "Dúvida se o método funciona para o recorte específico do comprador.",
        angleExamples: [
          "Análise de caso: da desorganização ao calendário enxuto que vende",
          "O que mudou quando trocamos volume por intencionalidade",
        ],
      },
    ],
    toneOfVoice: {
      adjectives: [
        "Direto e sem rodeios",
        "Professoral, mas sem ser cansativo",
        "Elegante, sem parecer distante",
        "Forte e convicto, sem parecer teatral",
      ],
      whatToRepeat: [
        "Estratégia antes da execução",
        "Contexto persistente e respeito à capacidade real",
        "Conteúdo não é apenas presença — é posicionamento e venda",
        "Contraste claro entre o jeito amador (improviso) e o jeito estruturado",
      ],
      whatToAvoid: [
        "Saudações lentas ('Oi pessoal, tudo bem com vocês?')",
        "Promessas milagrosas sem explicação de mecanismo",
        "Jargões vazios ou linguagem infantilizada",
        "Pedir engajamento por caridade sem entregar valor denso antes",
      ],
      howToOpenReasoning: [
        "Começar sempre pelo sintoma concreto ou por uma contradição direta nos primeiros 3 segundos",
        "Validar a frustração do público antes de apresentar o framework técnico",
        "Usar afirmações incisivas no tempo presente",
      ],
      proprietaryVocabulary: [
        "Projeto Editorial",
        "Base Estratégica",
        "Matriz RETINA",
        "Capacidade Real de Produção",
        "Mecanismo Único (MUV)",
      ],
      forbiddenTerms: [
        "Diquinha rápida",
        "Segredinho infalível",
        "Hackzinho mágico",
        "Postar por postar",
      ],
    },
    retinaDistribution: [
      {
        type: "Transformação",
        percentage: 25,
        strategicRole:
          "Educação prática densa que resolve microproblemas e gera salvamentos qualificados.",
      },
      {
        type: "Níveis de Consciência",
        percentage: 20,
        strategicRole:
          "Condução intencional do sintoma até a consciência da oferta e conversão.",
      },
      {
        type: "Relacionamento",
        percentage: 20,
        strategicRole:
          "Conexão humana, valores, bastidores e identificação com a rotina real.",
      },
      {
        type: "Autoridade",
        percentage: 15,
        strategicRole:
          "Provas reais, estudos de caso, teses proprietárias e demonstração de domínio.",
      },
      {
        type: "Engajamento",
        percentage: 10,
        strategicRole:
          "Atração de topo de funil qualificado através de quebras de padrão e temas amplos do nicho.",
      },
      {
        type: "Interação",
        percentage: 10,
        strategicRole:
          "Abertura de diálogo ativo, enquetes estratégicas e coleta de objeções via Q&A.",
      },
    ],
    productionCapacity: {
      reelsPerWeek: 4,
      longVideosPerWeek: 1,
      carouselsPerWeek: 2,
      staticPostsPerWeek: 2,
      livesPerWeek: 1,
      storiesSequencesPerDay: 4,
    },
  },
  {
    id: "line-v2-evergreen",
    name: "Linha Editorial v2 — Operação Perpétua (Rascunho)",
    status: "draft",
    createdAt: "18/10/2026",
    updatedAt: "Ontem",
    strategicBaseComplete: false,
    niche,
    subniche,
    productAndOffer: `Esteira perpétua de entrada + mentoria avançada em ${subniche}.`,
    romaPromise: `Construir aquisição diária previsível no perpétuo.`,
    differentials: "Funil contínuo de conteúdo conectado a materiais complementares.",
    icpPains: ["Oscilação de faturamento entre meses sem lançamento."],
    icpDesires: ["Previsibilidade semanal de novos clientes."],
    icpObjections: ["Dúvida sobre como manter urgência fora de lançamento."],
    icpMyths: ["Achar que perpétuo vende sozinho sem linha editorial ativa."],
    puv: "Sistema de conversão contínua orientado por sinais de mercado.",
    muv: "Ciclos semanais de consciência + iscas qualificadas.",
    bigIdea: "Perpétuo forte exige renovação constante de ângulos sobre a mesma promessa.",
    positioningPhrase: `Referência em aquisição contínua para ${niche}.`,
    centralMessage: "Escala sustentável com rotina editorial enxuta.",
    worldViewAndEnemy: "Contra a dependência exclusiva de picos exaustivos de lançamento.",
    pillars: [
      {
        code: "PILAR 01",
        title: "Diagnóstico de Gargalos no Perpétuo",
        description: "Mostra onde a esteira perde conversão no dia a dia.",
        targetPainOrObjection: "Falta de previsibilidade semanal.",
        angleExamples: ["Por que seu funil perpétuo esfria após 15 dias"],
      },
      {
        code: "PILAR 02",
        title: "Demonstração do Método em Ação",
        description: "Bastidores e provas contínuas.",
        targetPainOrObjection: "Ceticismo de público frio.",
        angleExamples: ["Estudo de caso da semana"],
      },
    ],
    toneOfVoice: {
      adjectives: ["Analítico", "Prático", "Direto"],
      whatToRepeat: ["Previsibilidade diária", "Processo acima de sorte"],
      whatToAvoid: ["Promessas vagas"],
      howToOpenReasoning: ["Dados e contraste prático"],
      proprietaryVocabulary: ["Ciclo Perpétuo Editorial"],
      forbiddenTerms: ["Fórmula mágica"],
    },
    retinaDistribution: [
      {
        type: "Transformação",
        percentage: 30,
        strategicRole: "Atração e salvamentos contínuos.",
      },
      {
        type: "Níveis de Consciência",
        percentage: 25,
        strategicRole: "Conversão diária para a oferta.",
      },
      {
        type: "Autoridade",
        percentage: 20,
        strategicRole: "Prova contínua.",
      },
      {
        type: "Relacionamento",
        percentage: 15,
        strategicRole: "Retenção da base.",
      },
      {
        type: "Interação",
        percentage: 5,
        strategicRole: "Caixinha de dúvidas.",
      },
      {
        type: "Engajamento",
        percentage: 5,
        strategicRole: "Alcance complementar.",
      },
    ],
    productionCapacity: {
      reelsPerWeek: 3,
      longVideosPerWeek: 1,
      carouselsPerWeek: 2,
      staticPostsPerWeek: 1,
      livesPerWeek: 1,
      storiesSequencesPerDay: 3,
    },
    pendingItems: [
      "Concluir mapeamento dos 6 pilares definitivos do perpétuo",
      "Confirmar capacidade real de lives semanais",
    ],
  },
];

export function LinhaEditorialModule({
  projectName,
  projectNiche,
  projectSubniche,
  onGoToCalendarTab,
}: LinhaEditorialModuleProps) {
  const [versions, setVersions] = useState<readonly FullLineEditorialVersion[]>(
    () => INITIAL_LINE_VERSIONS(projectNiche, projectSubniche)
  );

  /* Controle de modo: 'list' (Tela 1), 'onboarding' (Tela 2 - 7 blocos), 'detail' (Tela 3 - Linha Completa separada) */
  const [viewMode, setViewMode] = useState<"list" | "onboarding" | "detail">(
    "list"
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    "line-v1-ativa"
  );
  const [activeDetailSection, setActiveDetailSection] =
    useState<InternalSectionKey>("visao-geral");

  /* Estados de renomeação inline */
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  /* Estados do Onboarding Guiado em 7 Blocos (Tela 2 da Função 01) */
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [obName, setObName] = useState<string>(
    "Linha Editorial v3 — Nova Fase Estratégica"
  );
  const [obNiche, setObNiche] = useState<string>(projectNiche);
  const [obSubniche, setObSubniche] = useState<string>(projectSubniche);
  const [obOffer, setObOffer] = useState<string>(
    `Oferta principal de ${projectSubniche} voltada para resultados práticos.`
  );
  const [obRoma, setObRoma] = useState<string>(
    `Dominar e aplicar ${projectSubniche} com previsibilidade e direção clara.`
  );
  const [obDifferentials, setObDifferentials] = useState<string>(
    "Método passo a passo validado no campo de batalha, sem teoria solta."
  );
  const [obIcpPains, setObIcpPains] = useState<string>(
    "Falta de clareza estratégica, excesso de tentativa e erro, estagnação comercial."
  );
  const [obIcpDesires, setObIcpDesires] = useState<string>(
    "Previsibilidade de vendas, autoridade reconhecida e rotina enxuta."
  );
  const [obIcpObjections, setObIcpObjections] = useState<string>(
    "Falta de tempo na rotina, medo de não conseguir executar sozinho."
  );
  const [obPuvMuv, setObPuvMuv] = useState<string>(
    "Sistema integrado que conecta posicionamento, calendário realista e execução."
  );
  const [obBigIdea, setObBigIdea] = useState<string>(
    "Não é sobre produzir mais conteúdo, é sobre produzir conteúdo intencional conectado à oferta."
  );
  const [obToneStyle, setObToneStyle] = useState<string>(
    "Direto, elegante, técnico na medida certa e focado em decisão prática."
  );
  const [obReels, setObReels] = useState<number>(4);
  const [obLongVideos, setObLongVideos] = useState<number>(1);
  const [obCarousels, setObCarousels] = useState<number>(2);
  const [obStaticPosts, setObStaticPosts] = useState<number>(2);
  const [obLives, setObLives] = useState<number>(1);
  const [obStoriesPerDay, setObStoriesPerDay] = useState<number>(4);

  const selectedVersion =
    versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null;

  const handleOpenVersionDetail = (id: string) => {
    setSelectedVersionId(id);
    setActiveDetailSection("visao-geral");
    setViewMode("detail");
  };

  const handleSetActiveVersion = (id: string) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === id) return { ...v, status: "active" };
        if (v.status === "active") return { ...v, status: "archived" };
        return v;
      })
    );
  };

  const handleDuplicateVersion = (ver: FullLineEditorialVersion) => {
    const duplicated: FullLineEditorialVersion = {
      ...ver,
      id: `line-dup-${Date.now()}`,
      name: `${ver.name} (Cópia)`,
      status: "draft",
      createdAt: "Hoje",
      updatedAt: "Duplicada agora",
    };
    setVersions((prev) => [duplicated, ...prev]);
  };

  const handleToggleArchiveVersion = (id: string) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        return {
          ...v,
          status: v.status === "archived" ? "draft" : "archived",
          updatedAt: "Atualizada agora",
        };
      })
    );
  };

  const handleSaveRename = (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setVersions((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, name: renameValue.trim(), updatedAt: "Renomeada agora" }
          : v
      )
    );
    setRenamingId(null);
  };

  const handleFinishOnboarding = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const createdId = `line-${Date.now()}`;
    const newVersion: FullLineEditorialVersion = {
      ...(versions[0] ?? INITIAL_LINE_VERSIONS(projectNiche, projectSubniche)[0]),
      id: createdId,
      name: obName.trim() || `Linha Editorial v${versions.length + 1}`,
      status: "active",
      createdAt: "Hoje",
      updatedAt: "Gerada agora pela IA",
      strategicBaseComplete: true,
      niche: obNiche.trim() || projectNiche,
      subniche: obSubniche.trim() || projectSubniche,
      productAndOffer: obOffer.trim(),
      romaPromise: obRoma.trim(),
      differentials: obDifferentials.trim(),
      icpPains: obIcpPains
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      icpDesires: obIcpDesires
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      icpObjections: obIcpObjections
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      puv: obPuvMuv.trim(),
      muv: obPuvMuv.trim(),
      bigIdea: obBigIdea.trim(),
      centralMessage: obBigIdea.trim(),
      productionCapacity: {
        reelsPerWeek: obReels,
        longVideosPerWeek: obLongVideos,
        carouselsPerWeek: obCarousels,
        staticPostsPerWeek: obStaticPosts,
        livesPerWeek: obLives,
        storiesSequencesPerDay: obStoriesPerDay,
      },
      pendingItems: undefined,
    };

    setVersions((prev) =>
      prev
        .map((v) =>
          v.status === "active" ? { ...v, status: "archived" as const } : v
        )
        .concat(newVersion)
    );
    setSelectedVersionId(createdId);
    setActiveDetailSection("visao-geral");
    setViewMode("detail");
  };

  /* =========================================================================
     TELA 3: AMBIENTE PRÓPRIO E COMPLETO DE UMA LINHA EDITORIAL (PONTO 05)
     ========================================================================= */
  if (viewMode === "detail" && selectedVersion) {
    return (
      <div className="flex flex-col gap-5">
        {/* Barra Superior da Linha Editorial Aberta */}
        <div className="flex flex-col justify-between gap-4 rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="mt-0.5 inline-flex h-9 items-center gap-1.5 rounded-la-md border border-white/12 bg-white/[0.03] px-3 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
              <span>Todas as Linhas</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  MAPA COMPLETO DA LINHA EDITORIAL
                </span>
                <span
                  className={clsx(
                    "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase",
                    selectedVersion.status === "active"
                      ? "border-la-gold bg-la-gold text-la-text-inverse"
                      : "border-white/20 bg-white/[0.06] text-la-text-primary"
                  )}
                >
                  {selectedVersion.status === "active"
                    ? "LINHA ATIVA DO PROJETO"
                    : "VERSÃO EM RASCUNHO / HISTÓRICO"}
                </span>
              </div>

              <h2 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                {selectedVersion.name}
              </h2>
              <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                Projeto: {projectName} • Criada em {selectedVersion.createdAt} •
                Atualizada em {selectedVersion.updatedAt}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {selectedVersion.status !== "active" ? (
              <button
                type="button"
                onClick={() => handleSetActiveVersion(selectedVersion.id)}
                className="rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3.5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
              >
                Definir como Linha Ativa
              </button>
            ) : null}

            <button
              type="button"
              onClick={onGoToCalendarTab}
              className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <span>Transformar em Calendário</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Layout com Sidebar Interna da Linha Editorial + Painel de Conteúdo Completo */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* Sidebar Interna da Linha Editorial */}
          <aside className="flex flex-col gap-1.5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-3 lg:col-span-3">
            <span className="px-2.5 py-1 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-text-muted">
              Camadas desta Linha
            </span>

            {[
              {
                key: "visao-geral" as const,
                label: "01 · Mensagem Central & Visão",
                icon: Compass,
              },
              {
                key: "pilares" as const,
                label: `02 · Pilares Editoriais (${selectedVersion.pillars.length})`,
                icon: Layers,
              },
              {
                key: "tom-de-voz" as const,
                label: "03 · Tom de Voz & Regras",
                icon: Mic,
              },
              {
                key: "retina-capacidade" as const,
                label: "04 · Matriz RETINA & Capacidade",
                icon: SlidersHorizontal,
              },
              {
                key: "base-estrategica" as const,
                label: "05 · Base Estratégica (ROMA & ICP)",
                icon: Target,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeDetailSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveDetailSection(item.key)}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-la-lg px-3 py-2.5 text-left font-la-sans text-[0.8125rem] transition-all",
                    isSelected
                      ? "border border-la-border-gold/65 bg-la-gold-faint font-semibold text-la-gold-light"
                      : "border border-transparent text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4 shrink-0",
                      isSelected ? "text-la-gold" : "text-la-text-muted"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="mt-3 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setOnboardingStep(1);
                  setViewMode("onboarding");
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-la-md border border-white/12 bg-white/[0.03] px-3 py-2 font-la-mono text-[0.6875rem] text-la-text-secondary hover:border-la-border-gold hover:text-la-gold-light"
              >
                <Edit3 className="h-3.5 w-3.5 text-la-gold" />
                <span>Recalibrar Base Estratégica</span>
              </button>
            </div>
          </aside>

          {/* Painel Principal da Camada Selecionada */}
          <div className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-9">
            {activeDetailSection === "visao-geral" ? (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    BLOCO 01 · ESPÍRITO E DIREÇÃO DA COMUNICAÇÃO
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Mensagem Central, Big Idea e Posicionamento
                  </h3>
                </div>

                <div className="rounded-la-xl border border-la-border-gold/50 bg-[#0C101B] p-5">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    MENSAGEM CENTRAL DA MARCA
                  </span>
                  <p className="mt-2 font-la-sans text-[1.0625rem] font-semibold leading-[1.45] text-la-text-primary">
                    “{selectedVersion.centralMessage}”
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      PROMESSA PRINCIPAL (ROMA)
                    </span>
                    <p className="mt-1.5 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary">
                      {selectedVersion.romaPromise}
                    </p>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      O QUE A MARCA COMBATE (VISÃO DE MUNDO)
                    </span>
                    <p className="mt-1.5 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                      {selectedVersion.worldViewAndEnemy}
                    </p>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      PROPOSTA E MECANISMO ÚNICO (PUV / MUV)
                    </span>
                    <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                      <strong className="text-la-text-primary">PUV:</strong>{" "}
                      {selectedVersion.puv}
                    </p>
                    <p className="mt-2 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                      <strong className="text-la-text-primary">MUV:</strong>{" "}
                      {selectedVersion.muv}
                    </p>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      BIG IDEA & FRASE DE POSICIONAMENTO
                    </span>
                    <p className="mt-1.5 font-la-sans text-[0.8125rem] font-medium leading-[1.6] text-la-text-primary">
                      “{selectedVersion.bigIdea}”
                    </p>
                    <p className="mt-2 font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                      {selectedVersion.positioningPhrase}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {activeDetailSection === "pilares" ? (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    BLOCO 02 · CATEGORIAS ESTRUTURAIS DA COMUNICAÇÃO
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Os {selectedVersion.pillars.length} Pilares Editoriais deste
                    Projeto
                  </h3>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Estes pilares nascem da forma como a oferta resolve o
                    problema do ICP e orientam todos os temas da Função 02.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedVersion.pillars.map((pillar) => (
                    <div
                      key={pillar.code}
                      className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-black/50 p-5"
                    >
                      <div>
                        <span className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                          {pillar.code}
                        </span>
                        <h4 className="mt-2.5 font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                          {pillar.title}
                        </h4>
                        <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-white/8 pt-3">
                        <span className="block font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                          Dor / Objeção Atacada:
                        </span>
                        <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-primary">
                          {pillar.targetPainOrObjection}
                        </p>

                        <span className="mt-2.5 block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                          Exemplos de Ângulos:
                        </span>
                        <ul className="mt-1 flex flex-col gap-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                          {pillar.angleExamples.map((ang) => (
                            <li key={ang}>• “{ang}”</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeDetailSection === "tom-de-voz" ? (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    BLOCO 03 · PERSONALIDADE E REGRAS DE LINGUAGEM
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Manual Prático de Tom de Voz para a IA
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedVersion.toneOfVoice.adjectives.map((adj) => (
                    <span
                      key={adj}
                      className="rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3.5 py-1 font-la-mono text-[0.75rem] font-semibold text-la-gold-light"
                    >
                      ✓ {adj}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-la-lg border border-emerald-500/35 bg-emerald-950/15 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-emerald-300">
                      O QUE REPETIR SEMPRE (REFORÇO DE TESE)
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-primary">
                      {selectedVersion.toneOfVoice.whatToRepeat.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-red-500/35 bg-red-950/15 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-red-300">
                      O QUE NUNCA FAZER OU USAR (PROIBIÇÕES)
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-primary">
                      {selectedVersion.toneOfVoice.whatToAvoid.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-red-400">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      COMO ABRIR RACIOCÍNIOS E GANCHOS
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                      {selectedVersion.toneOfVoice.howToOpenReasoning.map(
                        (item) => (
                          <li key={item}>• {item}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      VOCABULÁRIO PROPRIETÁRIO VS. TERMOS BANIDOS
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {selectedVersion.toneOfVoice.proprietaryVocabulary.map(
                        (term) => (
                          <span
                            key={term}
                            className="rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.6875rem] text-la-gold-light"
                          >
                            +{term}
                          </span>
                        )
                      )}
                      {selectedVersion.toneOfVoice.forbiddenTerms.map(
                        (term) => (
                          <span
                            key={term}
                            className="rounded-la-xs border border-red-500/40 bg-red-950/30 px-2 py-0.5 font-la-mono text-[0.6875rem] text-red-300 line-through"
                          >
                            {term}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeDetailSection === "retina-capacidade" ? (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    BLOCO 04 · EQUILÍBRIO RETINA E CAPACIDADE REAL DE PRODUÇÃO
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Distribuição Estratégica dos 6 Tipos de Conteúdo
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {selectedVersion.retinaDistribution.map((ret) => (
                    <div
                      key={ret.type}
                      className="rounded-la-lg border border-white/10 bg-black/50 p-4"
                    >
                      <div className="flex items-center justify-between font-la-mono text-[0.75rem]">
                        <span className="font-semibold text-la-text-primary">
                          {ret.type}
                        </span>
                        <span className="font-bold text-la-gold-light">
                          {ret.percentage}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-la-full bg-white/10">
                        <div
                          style={{ width: `${ret.percentage}%` }}
                          className="h-full rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                        />
                      </div>
                      <p className="mt-2 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                        {ret.strategicRole}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 rounded-la-xl border border-la-border-gold/45 bg-black/55 p-5">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    CAPACIDADE REAL DE PRODUÇÃO CONFIGURADA NESTA LINHA
                  </span>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Limites semanais e diários sustentáveis que o Calendário
                    Editorial deve respeitar:
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      {
                        label: "Reels / semana",
                        val: `${selectedVersion.productionCapacity.reelsPerWeek}x`,
                      },
                      {
                        label: "Vídeos Longos",
                        val: `${selectedVersion.productionCapacity.longVideosPerWeek}x/sem`,
                      },
                      {
                        label: "Carrosséis",
                        val: `${selectedVersion.productionCapacity.carouselsPerWeek}x/sem`,
                      },
                      {
                        label: "Posts Estáticos",
                        val: `${selectedVersion.productionCapacity.staticPostsPerWeek}x/sem`,
                      },
                      {
                        label: "Lives Semanais",
                        val: `${selectedVersion.productionCapacity.livesPerWeek}x/sem`,
                      },
                      {
                        label: "Seq. Stories / dia",
                        val: `${selectedVersion.productionCapacity.storiesSequencesPerDay} blocos`,
                      },
                    ].map((cap) => (
                      <div
                        key={cap.label}
                        className="rounded-la-md border border-white/10 bg-white/[0.03] p-3 text-center"
                      >
                        <span className="block font-la-sans text-[1.125rem] font-bold text-la-gold-light">
                          {cap.val}
                        </span>
                        <span className="mt-0.5 block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                          {cap.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeDetailSection === "base-estrategica" ? (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    BLOCO 05 · BASE ESTRATÉGICA PERSISTENTE DO PROJETO
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                    Oferta, Público Comprador (ICP) e Árvore de Objeções
                  </h3>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                    PRODUTO E OFERTA CLARA
                  </span>
                  <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-primary">
                    {selectedVersion.productAndOffer}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      DORES VISCERAIS DO ICP
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                      {selectedVersion.icpPains.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      DESEJOS E TRANSFORMAÇÃO BUSCADA
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                      {selectedVersion.icpDesires.map((d) => (
                        <li key={d}>• {d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      ÁRVORE DE OBJEÇÕES PRIORITÁRIAS
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                      {selectedVersion.icpObjections.map((o) => (
                        <li key={o}>• {o}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                      MITOS DO MERCADO PARA DERRUBAR
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 font-la-sans text-[0.8125rem] text-la-text-secondary">
                      {selectedVersion.icpMyths.map((m) => (
                        <li key={m}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     TELA 2: ONBOARDING GUIADO DA LINHA EDITORIAL EM 7 BLOCOS (SEÇÃO 1 DA FUNÇÃO 01)
     ========================================================================= */
  if (viewMode === "onboarding") {
    return (
      <section className="rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              COLETA ESTRATÉGICA GUIADA DA FUNÇÃO 01 (7 ETAPAS)
            </span>
            <h2 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
              Estruturar Nova Linha Editorial & Base Estratégica
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary hover:text-la-gold-light"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
            <span>Voltar para Lista de Linhas</span>
          </button>
        </div>

        {/* Barra das 7 Etapas */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { step: 1, title: "1. Nicho" },
            { step: 2, title: "2. Oferta" },
            { step: 3, title: "3. ROMA" },
            { step: 4, title: "4. ICP & Objeções" },
            { step: 5, title: "5. PUV & Big Idea" },
            { step: 6, title: "6. Tom de Voz" },
            { step: 7, title: "7. Capacidade Real" },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setOnboardingStep(s.step)}
              className={clsx(
                "rounded-la-md border px-2.5 py-2 text-left font-la-mono text-[0.625rem] font-semibold transition-colors",
                onboardingStep === s.step
                  ? "border-la-gold bg-la-gold text-la-text-inverse"
                  : onboardingStep > s.step
                    ? "border-la-border-gold/50 bg-la-gold-faint text-la-gold-light"
                    : "border-white/10 bg-black/45 text-la-text-muted"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleFinishOnboarding}
          className="mt-6 flex flex-col gap-5 rounded-la-xl border border-white/10 bg-black/45 p-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
              Identificação desta Versão da Linha Editorial
            </label>
            <input
              type="text"
              value={obName}
              onChange={(e) => setObName(e.target.value)}
              className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/65 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
            />
          </div>

          {onboardingStep === 1 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Qual é o nicho principal?
                </label>
                <input
                  type="text"
                  value={obNiche}
                  onChange={(e) => setObNiche(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/65 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Qual é o subnicho exato?
                </label>
                <input
                  type="text"
                  value={obSubniche}
                  onChange={(e) => setObSubniche(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/65 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
            </div>
          ) : null}

          {onboardingStep === 2 ? (
            <div className="flex flex-col gap-1.5">
              <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                Produto e Oferta Clara (O que está sendo vendido neste projeto?)
              </label>
              <textarea
                rows={3}
                value={obOffer}
                onChange={(e) => setObOffer(e.target.value)}
                className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
              />
            </div>
          ) : null}

          {onboardingStep === 3 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Promessa Principal e ROMA
                </label>
                <textarea
                  rows={3}
                  value={obRoma}
                  onChange={(e) => setObRoma(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Diferenciais da Marca / Especialista
                </label>
                <textarea
                  rows={3}
                  value={obDifferentials}
                  onChange={(e) => setObDifferentials(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
            </div>
          ) : null}

          {onboardingStep === 4 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Dores Dominantes do ICP
                </label>
                <textarea
                  rows={3}
                  value={obIcpPains}
                  onChange={(e) => setObIcpPains(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Desejos Prioritários
                </label>
                <textarea
                  rows={3}
                  value={obIcpDesires}
                  onChange={(e) => setObIcpDesires(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Objeções e Mitos do Público
                </label>
                <textarea
                  rows={3}
                  value={obIcpObjections}
                  onChange={(e) => setObIcpObjections(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                />
              </div>
            </div>
          ) : null}

          {onboardingStep === 5 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  PUV e MUV (Mecanismo Único)
                </label>
                <textarea
                  rows={3}
                  value={obPuvMuv}
                  onChange={(e) => setObPuvMuv(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Big Idea e Frase de Posicionamento
                </label>
                <textarea
                  rows={3}
                  value={obBigIdea}
                  onChange={(e) => setObBigIdea(e.target.value)}
                  className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                />
              </div>
            </div>
          ) : null}

          {onboardingStep === 6 ? (
            <div className="flex flex-col gap-1.5">
              <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                Estilo de Comunicação e Personalidade da Marca
              </label>
              <textarea
                rows={3}
                value={obToneStyle}
                onChange={(e) => setObToneStyle(e.target.value)}
                className="rounded-la-md border border-white/14 bg-black/65 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
              />
            </div>
          ) : null}

          {onboardingStep === 7 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  label: "Reels / sem",
                  val: obReels,
                  setter: setObReels,
                },
                {
                  label: "Vídeos Longos",
                  val: obLongVideos,
                  setter: setObLongVideos,
                },
                {
                  label: "Carrosséis",
                  val: obCarousels,
                  setter: setObCarousels,
                },
                {
                  label: "Posts Estáticos",
                  val: obStaticPosts,
                  setter: setObStaticPosts,
                },
                {
                  label: "Lives / sem",
                  val: obLives,
                  setter: setObLives,
                },
                {
                  label: "Seq. Stories / dia",
                  val: obStoriesPerDay,
                  setter: setObStoriesPerDay,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 rounded-la-md border border-white/12 bg-black/60 p-3"
                >
                  <label className="font-la-mono text-[0.5625rem] uppercase text-la-text-secondary">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={item.val}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    className="rounded-la-xs border border-white/15 bg-black/70 px-2 py-1 font-la-mono text-[0.9375rem] font-bold text-la-gold-light"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={onboardingStep === 1}
              onClick={() => setOnboardingStep((s) => Math.max(1, s - 1))}
              className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary disabled:opacity-40"
            >
              ← Etapa Anterior
            </button>

            <div className="flex items-center gap-2.5">
              {onboardingStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((s) => Math.min(7, s + 1))}
                  className="rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light"
                >
                  Próxima Etapa →
                </button>
              ) : null}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
              >
                <Sparkles className="h-4 w-4" />
                <span>Gerar Mapa Completo da Linha Editorial</span>
              </button>
            </div>
          </div>
        </form>
      </section>
    );
  }

  /* =========================================================================
     TELA 1: LISTA DE VERSÕES DA LINHA EDITORIAL DO PROJETO
     ========================================================================= */
  return (
    <section className="flex flex-col gap-6 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 sm:p-7">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-la-sans text-[1.5rem] font-semibold text-la-text-primary">
            Versões da Linha Editorial
          </h2>
          <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
            Cada versão guarda a identidade, a mensagem central, os pilares, o
            tom de voz e a distribuição RETINA deste projeto. Clique em qualquer
            linha para abrir seu ambiente completo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setOnboardingStep(1);
            setViewMode("onboarding");
          }}
          className="inline-flex min-h-[2.625rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nova Linha Editorial</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {versions.map((ver) => (
          <article
            key={ver.id}
            className={clsx(
              "flex flex-col gap-4 rounded-la-xl border p-5 transition-all",
              ver.status === "active"
                ? "border-la-gold/70 bg-[#0C101B]/95 shadow-[0_16px_38px_rgba(0,0,0,0.65)]"
                : "border-white/10 bg-black/45 hover:border-white/25"
            )}
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                  <Compass className="h-5 w-5" />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {renamingId === ver.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="rounded-la-md border border-la-gold bg-black/75 px-3 py-1 font-la-sans text-[0.9375rem] text-la-text-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(ver.id)}
                          className="rounded-la-xs bg-la-gold px-2.5 py-1 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                        {ver.name}
                      </h3>
                    )}

                    <span
                      className={clsx(
                        "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase",
                        ver.status === "active"
                          ? "border-la-gold bg-la-gold text-la-text-inverse"
                          : ver.status === "draft"
                            ? "border-white/20 bg-white/[0.06] text-la-text-primary"
                            : "border-white/10 bg-black/60 text-la-text-muted"
                      )}
                    >
                      {ver.status === "active"
                        ? "ATIVA"
                        : ver.status === "draft"
                          ? "RASCUNHO"
                          : "ARQUIVADA"}
                    </span>
                  </div>

                  <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                    Criada em {ver.createdAt} • Atualizada em {ver.updatedAt} •{" "}
                    {ver.pillars.length} pilares estruturais •{" "}
                    {ver.toneOfVoice.adjectives.slice(0, 2).join(" & ")} •
                    Capacidade:{" "}
                    {ver.productionCapacity.reelsPerWeek} Reels/sem +{" "}
                    {ver.productionCapacity.storiesSequencesPerDay} seq.
                    stories/dia
                  </p>
                </div>
              </div>

              {/* Ações da Versão */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenVersionDetail(ver.id)}
                  className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light"
                >
                  <span>Abrir Linha Completa</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {ver.status !== "active" ? (
                  <button
                    type="button"
                    onClick={() => handleSetActiveVersion(ver.id)}
                    className="rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                  >
                    Definir como ativa
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(ver.id);
                    setRenameValue(ver.name);
                  }}
                  title="Renomear versão"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-white/[0.03] text-la-text-secondary hover:text-la-gold-light"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicateVersion(ver)}
                  title="Duplicar versão"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-white/[0.03] text-la-text-secondary hover:text-la-gold-light"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleArchiveVersion(ver.id)}
                  title={
                    ver.status === "archived"
                      ? "Restaurar versão"
                      : "Arquivar versão"
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-white/[0.03] text-la-text-secondary hover:text-amber-300"
                >
                  {ver.status === "archived" ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Resumo Rápido no Card da Versão */}
            <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-3.5 lg:grid-cols-12">
              <div className="rounded-la-lg border border-white/8 bg-black/45 p-3 lg:col-span-7">
                <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                  Mensagem Central:
                </span>
                <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-primary">
                  {ver.centralMessage}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-la-lg border border-white/8 bg-black/45 p-3 lg:col-span-5">
                {ver.retinaDistribution.slice(0, 3).map((r) => (
                  <div key={r.type} className="flex flex-col">
                    <span className="font-la-mono text-[0.5625rem] text-la-text-muted">
                      {r.type}
                    </span>
                    <span className="font-la-mono text-[0.8125rem] font-bold text-la-gold-light">
                      {r.percentage}%
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleOpenVersionDetail(ver.id)}
                  className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                >
                  Ver 6 pilares & Tom de Voz →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}