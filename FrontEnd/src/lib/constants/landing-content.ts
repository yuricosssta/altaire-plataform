// FrontEnd/src/lib/constants/landing-content.ts

/**
 * Fonte editorial canônica e imutável da landing page pública do Legion Altaire.
 *
 * Referências de autoridade:
 * - docs/CONTENT-LANDING.md (Versão 1.0 — Fonte Editorial Canônica)
 * - docs/ROUTES-PUBLIC.md
 * - docs/DESIGN-LEGION-PUBLIC.md
 * - docs/ACCEPTANCE-LANDING.md
 *
 * Regras não negociáveis (CONTENT-LANDING.md §0.6 & §0.7):
 * - Não inserir copy comercial diretamente nos componentes.
 * - Não reescrever a copy durante a implementação visual.
 * - Não resumir automaticamente textos no mobile.
 * - Campos não aplicáveis são representados explicitamente por `null`.
 * - Estados condicionais (`poster-only` vs `video-available`, `monitoring` vs `documented-evidence`,
 *   trial comercial e FAQ futuro) são controlados aqui e nunca improvisados na UI.
 */

import {
  COOKIE_PREFERENCES_ACTION,
  FOOTER_NAV_ROUTES,
  HEADER_NAV_ITEMS,
  HEADER_RESOURCE_ROUTES,
  LANDING_DOM_IDS,
  LANDING_SECTION_IDS,
  LANDING_SECTION_ROUTES,
  ROUTES,
} from "./routes";

export type ContentStatus = "aprovado" | "provisorio" | "futuro";
export type DemoMode = "poster-only" | "video-available";
export type EvidenceMode = "monitoring" | "documented-evidence";
export type EvidenceCategory = "experience" | "usage-data" | "business-result";

export type LinkAction = {
  readonly label: string;
  readonly href: string;
  readonly variant?: "primary" | "secondary" | "ghost";
};

export type CopySectionBase = {
  readonly status: ContentStatus;
  readonly id?: string;
  readonly domId?: string;
  readonly objective: string;
  readonly eyebrow: string | null;
  readonly headline: string | null;
  readonly subheadline: string | null;
  readonly body?: readonly string[];
  readonly items?: readonly string[];
  readonly primaryAction?: LinkAction | null;
  readonly secondaryAction?: LinkAction | null;
  readonly microcopy?: readonly string[] | null;
  readonly notes?: readonly string[];
};

export type HeaderNavItemContent = {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly type: "anchor" | "route";
};

export type ResourceMenuItem = {
  readonly key: string;
  readonly title: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly type: "anchor" | "route";
};

export type ConditionalCommercialNote = {
  readonly status: ContentStatus;
  readonly enabled: boolean;
  readonly items: readonly string[];
  readonly conditionNote: string;
};

export type HeroReservedHeadlineVariation = {
  readonly code: "A" | "B" | "C" | "D";
  readonly status: "futuro";
  readonly headline: string;
};

export type HeroMockupModule = {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly title: string;
  readonly meta: string;
  readonly statusLabel: string;
};

export type ProblemDetailedItem = {
  readonly index: "01" | "02" | "03" | "04";
  readonly title: string;
  readonly description: string;
};

export type MechanismStageKey =
  | "StrategicBaseState"
  | "EditorialPlanningState"
  | "ContentExecutionState";

export type MechanismStage = {
  readonly step: "01" | "02" | "03";
  readonly stateKey: MechanismStageKey;
  readonly movementLabel: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly perceivedResult: string;
  readonly preservedContext?: string;
  readonly possibleElements: readonly string[];
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly statusBadge: string;
};

export type DemoCalloutItem = {
  readonly step: "01" | "02" | "03";
  readonly tag: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
};

export type FunctionOriginDetail = {
  readonly label: string;
  readonly description: string;
};

export type FunctionCard = {
  readonly index: "01" | "02" | "03";
  readonly internalName: string;
  readonly categoryTag: string;
  readonly publicName: string;
  readonly subtitle: string;
  readonly mainBenefit: string;
  readonly description: string;
  readonly highlightsLabel: string;
  readonly highlights: readonly string[];
  readonly origins?: readonly FunctionOriginDetail[];
  readonly libraryNote?: string;
  readonly preservedContext?: string;
  readonly resultText: string;
  readonly mockupSummary: {
    readonly moduleTag: string;
    readonly primaryView: string;
    readonly secondaryView: string;
    readonly statusText: string;
    readonly sampleItems: readonly string[];
  };
};

export type HowItWorksStep = {
  readonly step: "01" | "02" | "03";
  readonly stepLabel: string;
  readonly title: string;
  readonly stepSubheadline: string;
  readonly description: string;
  readonly moduleBadge: string;
  readonly interfaceElements?: readonly string[];
  readonly userAction?: string;
  readonly reviewableElements?: readonly string[];
  readonly productionCapacityExamples?: readonly string[];
  readonly executionFlow?: string;
  readonly possibleMaterials?: readonly string[];
  readonly perceivedBenefit: string;
  readonly stepMicrocopy: string;
};

export type BenefitBlock = {
  readonly index: "01" | "02" | "03" | "04" | "05";
  readonly categoryLabel: string;
  readonly strategicDecision: string;
  readonly title: string;
  readonly description: string;
  readonly businessConsequence: string;
  readonly sustainingResource: string;
  readonly indicatorLabel: string;
};

export type BenefitsAuthenticityBand = {
  readonly title: string;
  readonly description: string;
  readonly microcopy: string;
};

export type DifferentiatorComparisonRow = {
  readonly index: string;
  readonly criterion: string;
  readonly legionAltaire: string;
  readonly isolatedCommands: string;
};

export type DifferentiatorBlock = {
  readonly index: string;
  readonly title: string;
  readonly description: string;
  readonly contrastNote: string;
};

export type EvidenceCard = {
  readonly id: string;
  readonly tag: string;
  readonly title: string;
  readonly description: string;
};

export type DocumentedEvidenceItem = {
  readonly id: string;
  readonly type: EvidenceCategory;
  readonly challenge: string;
  readonly usage: string;
  readonly change: string;
  readonly result: string;
  readonly authorName: string;
  readonly authorRole: string;
  readonly company: string;
  readonly usagePeriod: string;
  readonly authorized: boolean;
};

export type FAQItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: readonly string[];
  readonly status: ContentStatus;
  readonly publicationCondition?: string;
};

export type FAQSection = Omit<CopySectionBase, "items"> & {
  readonly items: readonly FAQItem[];
  readonly allItems: readonly FAQItem[];
};

export type FooterLinkItemContent = {
  readonly label: string;
  readonly href: string;
  readonly status?: ContentStatus | "aprovado-dependente";
};

export type FooterLinkGroup = {
  readonly key: "produto" | "empresa" | "legal" | "acesso";
  readonly title: string;
  readonly links: readonly FooterLinkItemContent[];
};

export type FooterContent = {
  readonly status: ContentStatus;
  readonly id: string;
  readonly domId: string;
  readonly objective: string;
  readonly eyebrow: null;
  readonly headline: string;
  readonly subheadline: string;
  readonly brandDescription: string;
  readonly copyright: string;
  readonly legalNotice: string;
  readonly groups: readonly FooterLinkGroup[];
  readonly primaryAction: null;
  readonly secondaryAction: LinkAction;
  readonly cookiePreferencesLabel: string;
  readonly cookiePreferencesActionId: string;
  readonly contactSection: {
    readonly status: ContentStatus;
    readonly enabled: boolean;
    readonly label: string;
    readonly email: string | null;
  };
  readonly microcopy: readonly string[];
  readonly notes: readonly string[];
};

export type LandingContent = {
  readonly header: CopySectionBase & {
    readonly brandLabel: string;
    readonly brandHref: string;
    readonly resourcesLabel: string;
    readonly navItems: readonly HeaderNavItemContent[];
    readonly resourceMenu: readonly ResourceMenuItem[];
  };
  readonly hero: CopySectionBase & {
    readonly visualSequence: readonly [string, string, string];
    readonly visualSequenceText: string;
    readonly identificationMessage: string;
    readonly reservedVariations: readonly HeroReservedHeadlineVariation[];
    readonly conditionalTrialInfo: ConditionalCommercialNote;
    readonly mockupPreview: {
      readonly frameTitle: string;
      readonly projectLabel: string;
      readonly statusLabel: string;
      readonly flowSteps: readonly HeroMockupModule[];
    };
  };
  readonly positioningBand: CopySectionBase & {
    readonly pillars: readonly {
      readonly label: string;
      readonly description: string;
    }[];
    readonly futureSocialProof: {
      readonly status: "futuro";
      readonly enabled: false;
      readonly suggestedEyebrow: string;
      readonly activationCondition: string;
      readonly rule: string;
    };
  };
  readonly problem: CopySectionBase & {
    readonly detailedItems: readonly ProblemDetailedItem[];
    readonly consequence: string;
    readonly synthesisPhrase: string;
    readonly fragments: readonly {
      readonly label: string;
      readonly state: string;
    }[];
  };
  readonly paradigmShift: CopySectionBase & {
    readonly transitions: readonly {
      readonly from: string;
      readonly to: string;
    }[];
    readonly contrastPair: {
      readonly beforeLabel: string;
      readonly beforeDescription: string;
      readonly afterLabel: string;
      readonly afterDescription: string;
    };
  };
  readonly mechanism: CopySectionBase & {
    readonly logicChainText: string;
    readonly logicChainNodes: readonly string[];
    readonly stages: readonly MechanismStage[];
    readonly closingText: string;
    readonly visualHighlight: string;
  };
  readonly demo: CopySectionBase & {
    readonly mode: DemoMode;
    readonly stageLabels: readonly string[];
    readonly callouts: readonly DemoCalloutItem[];
    readonly futureVideoSequence: string;
    readonly targetVideoDuration: string;
    readonly videoAvailableActionLabel: string;
    readonly honestStatusLabel: string;
    readonly honestStatusDescription: string;
    readonly videoSources: {
      readonly posterSrc: string;
      readonly webmSrc: string | null;
      readonly mp4Src: string | null;
      readonly captionsSrc: string | null;
      readonly transcriptUrl: string | null;
    };
    readonly modeNotes: Readonly<Record<DemoMode, readonly string[]>>;
  };
  readonly functions: CopySectionBase & {
    readonly cards: readonly FunctionCard[];
  };
  readonly howItWorks: CopySectionBase & {
    readonly humanApprovalNote: string;
    readonly steps: readonly HowItWorksStep[];
    readonly visualSynthesis: string;
    readonly visualSynthesisNodes: readonly string[];
    readonly closingText: string;
  };
  readonly benefits: CopySectionBase & {
    readonly blocks: readonly BenefitBlock[];
    readonly authenticityBand: BenefitsAuthenticityBand;
  };
  readonly differentiators: CopySectionBase & {
    readonly comparisonTable: readonly DifferentiatorComparisonRow[];
    readonly comparisonObservation: string;
    readonly beforeFlow: string;
    readonly insideLegionFlow: string;
    readonly synthesisPhrase: string;
    readonly isolatedCommandFit: {
      readonly label: string;
      readonly description: string;
    };
    readonly legionAltaireFit: {
      readonly label: string;
      readonly description: string;
    };
    readonly blocks: readonly DifferentiatorBlock[];
  };
  readonly evidence: CopySectionBase & {
    readonly mode: EvidenceMode;
    readonly modeLabel: string;
    readonly progressionSteps: readonly string[];
    readonly cards: readonly EvidenceCard[];
    readonly futureState: {
      readonly status: ContentStatus;
      readonly enabled: boolean;
      readonly eyebrow: string;
      readonly headline: string;
      readonly subheadline: string;
      readonly requiredStructure: string;
      readonly featuredCase: DocumentedEvidenceItem | null;
      readonly secondaryEvidence: readonly DocumentedEvidenceItem[];
      readonly notes: readonly string[];
    };
  };
  readonly faq: FAQSection;
  readonly finalCta: CopySectionBase & {
    readonly conditionalTrialInfo: ConditionalCommercialNote;
  };
  readonly footer: FooterContent;
};

/* -------------------------------------------------------------------------- */
/* 13. FAQ Items (16 aprovados + 1 pendente de validação futura — §13)        */
/* -------------------------------------------------------------------------- */

const ALL_FAQ_ITEMS: readonly FAQItem[] = [
  {
    id: "faq-01-gerador-de-posts",
    question: "O Legion Altaire é apenas um gerador de posts?",
    answer: [
      "Não. O Legion Altaire é uma plataforma de estratégia e produção editorial. Ele conecta sua Base Estratégica, Linha Editorial, Calendário, Temas, Roteiros e Ativos dentro de um Projeto Editorial. A plataforma pode gerar conteúdos, mas o diferencial está em organizar o contexto e o fluxo que dão sentido a cada peça, em vez de tratar cada geração como uma solicitação isolada.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-02-ajuda-a-vender-mais",
    question: "O Legion Altaire ajuda a vender mais?",
    answer: [
      "O Legion Altaire foi criado para ajudar você a transformar sua estratégia em conteúdos que constroem autoridade, relacionamento, consciência e aumentam oportunidades de venda. Ele conecta a comunicação à sua oferta, ao seu público e ao momento do negócio. Isso pode apoiar melhores resultados comerciais, mas a plataforma não garante resultados automáticos: vendas também dependem da oferta, do mercado, da distribuição, da execução e da capacidade comercial.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-03-estrategia-pronta",
    question: "Preciso já ter toda a minha estratégia pronta?",
    answer: [
      "Não. Você pode começar com as informações que já possui e organizar o contexto do projeto ao longo do processo. Quanto mais claro e completo for o contexto fornecido, mais alinhadas tendem a ser as sugestões e gerações da plataforma.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-04-refinando-oferta",
    question: "E se eu ainda estiver refinando minha oferta?",
    answer: [
      "Você pode começar mesmo estando em fase de refinamento. O Projeto Editorial permite organizar o que já está definido e identificar pontos que ainda precisam de clareza. A plataforma não substitui a decisão estratégica sobre sua oferta, mas ajuda a transformar as informações disponíveis em uma direção editorial mais organizada.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-05-para-quem-foi-criado",
    question: "Para quem o Legion Altaire foi criado?",
    answer: [
      "O Legion Altaire foi criado para especialistas, consultores, infoprodutores, mentores, vendedores e marcas que usam conteúdo para construir autoridade, criar relacionamento, comunicar o valor de uma oferta e ampliar oportunidades de venda. Ele é especialmente útil para quem não quer depender de conteúdos isolados, passar muito tempo planejando sozinho e precisa conectar estratégia, planejamento e execução.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-06-entender-de-ia",
    question:
      "Preciso entender de inteligência artificial ou ser bom com tecnologia?",
    answer: [
      "Não. A experiência foi pensada como um painel editorial orientado por etapas. Você responde perguntas, fornece informações, revisa propostas, ajusta decisões e aprova o que faz sentido. A IA trabalha nos bastidores para organizar a estratégia, o calendário, os temas e os materiais de produção.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-07-conteudos-genericos",
    question: "A IA vai criar conteúdos genéricos?",
    answer: [
      "O Legion Altaire foi desenhado para reduzir esse risco trabalhando com o contexto do Projeto Editorial. A IA considera nicho, oferta, público, posicionamento, tom de voz, objetivos, temas, formatos e referências selecionadas. Você também pode adicionar histórias, estudos, transcrições e materiais próprios. Ainda assim, toda geração deve ser revisada para garantir precisão, autenticidade e adequação à comunicação da sua marca.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-08-multiplos-projetos",
    question:
      "Posso usar o Legion Altaire para mais de um produto, oferta ou projeto?",
    answer: [
      "Sim. A recomendação é manter cada contexto em seu próprio Projeto Editorial. Assim, diferentes produtos, ofertas, campanhas ou fases do negócio podem ter sua própria Base Estratégica, decisões editoriais e materiais, evitando misturar contextos diferentes.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-09-formatos-contemplados",
    question: "Quais formatos de conteúdo a plataforma contempla?",
    answer: [
      "O Legion Altaire foi estruturado para trabalhar com vídeos curtos, vídeos longos, lives, carrosséis, posts estáticos e sequências de Stories. Cada formato possui necessidades próprias de roteiro, legenda, descrição, títulos, capas e materiais. Os ativos gerados dependem do formato, do objetivo e das definições estratégicas do conteúdo configuradas no projeto.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-10-como-funcionam-stories",
    question: "Como funcionam os Stories?",
    answer: [
      "Stories são tratados como sequências narrativas, e não apenas como publicações isoladas. A estrutura pode considerar diferentes funções da comunicação, como relacionamento, interação, bastidores, aquecimento e apoio aos objetivos do período. A quantidade respeita a configuração e a capacidade informadas no projeto.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-11-quantidade-fixa-calendario",
    question: "O calendário vai impor uma quantidade fixa de conteúdo?",
    answer: [
      "Não. O calendário deve ser construído com base na capacidade real de produção informada pelo usuário. Você poderá definir quantos vídeos, carrosséis, posts, lives e sequências de Stories consegue produzir. A plataforma utiliza essas informações para propor uma agenda mais realista e compatível com sua rotina.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-12-revisar-e-alterar",
    question: "Posso revisar e alterar o que a IA criar?",
    answer: [
      "Sim. A IA propõe e organiza; você revisa, ajusta, aprova, edita e salva versões. É possível modificar elementos da Linha Editorial, do Calendário, dos Temas e dos Roteiros conforme as permissões e os fluxos de cada etapa.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-13-versoes-do-mesmo-conteudo",
    question: "Posso criar versões diferentes do mesmo conteúdo?",
    answer: [
      "Sim. Os roteiros podem ser salvos como versões, permitindo testar alterações de gancho, abordagem, analogia, chamada para ação, tom e estrutura, conforme o formato. Isso ajuda a comparar alternativas sem perder a versão anterior.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-14-o-que-pode-ser-gerado",
    question: "O que exatamente pode ser gerado?",
    answer: [
      "Dependendo do formato e das definições do conteúdo, a Função 03 pode gerar roteiro, legenda ou descrição, títulos, thumbnail ou capa, chamada para ação, instruções visuais, prompts de imagem, materiais complementares e materiais de explicação. Esses elementos aparecem dentro do pacote de produção associado ao slot ou tema.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-15-materiais-complementares",
    question: "Todos os conteúdos terão materiais complementares?",
    answer: [
      "Não necessariamente. Materiais complementares devem ser ativados quando fizerem sentido para o objetivo, o tema, o formato e as definições daquele conteúdo. Alguns slots podem ser qualificados para materiais como checklist, workbook, guia ou planilha; outros podem exigir apenas roteiro, legenda e chamada para ação. A elegibilidade é definida pelas regras estratégicas do conteúdo e aplicada pela IA da plataforma.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-16-reaproveitar-repertorio",
    question: "Posso reaproveitar temas, conteúdos e materiais que já criei?",
    answer: [
      "Sim. Temas, referências, versões e outros materiais podem permanecer organizados no contexto do projeto e ser consultados, adaptados ou reutilizados conforme o fluxo da plataforma. O objetivo é evitar que o repertório criado desapareça em conversas, documentos ou ferramentas separadas.",
    ],
    status: "aprovado",
  },
  {
    id: "faq-17-privacidade-dados-futuro",
    question: "Como meus dados, referências e materiais são tratados?",
    answer: [
      "Pergunta pendente de validação futura: só será publicada quando a resposta estiver aprovada e coerente com a arquitetura, política de privacidade, segurança, retenção, provedores de IA e controles reais do produto.",
    ],
    status: "futuro",
    publicationCondition:
      "Resposta aprovada e coerente com arquitetura, política de privacidade, segurança, retenção, provedores de IA e controles reais do produto.",
  },
] as const;

const PUBLISHED_FAQ_ITEMS: readonly FAQItem[] = ALL_FAQ_ITEMS.filter(
  (item) => item.status === "aprovado"
);

/* -------------------------------------------------------------------------- */
/* Objeto Canônico Principal: `landingContent` (02. CONTENT-LANDING.md)       */
/* -------------------------------------------------------------------------- */

export const landingContent: LandingContent = {
  /* ------------------------------------------------------------------------ */
  /* 01. Header (§01)                                                         */
  /* ------------------------------------------------------------------------ */
  header: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.header,
    domId: LANDING_DOM_IDS.siteHeader,
    objective:
      "Identificar a marca, orientar o visitante, oferecer acesso às principais áreas da landing e conduzir para uma única ação principal de criação de conta.",
    eyebrow: null,
    headline: null,
    subheadline: null,
    body: [
      "O header deve apresentar a marca LEGION ALTAIRE, a navegação principal, o acesso de usuários existentes e o CTA principal. “Demonstração” permanece no primeiro nível. “Recursos” é um controle expansível e não possui rota própria.",
    ],
    brandLabel: "LEGION ALTAIRE",
    brandHref: ROUTES.home,
    resourcesLabel: "Recursos",
    items: [
      "Produto",
      "Como funciona",
      "Benefícios",
      "Demonstração",
      "Preços",
      "Recursos",
    ],
    navItems: HEADER_NAV_ITEMS,
    resourceMenu: [
      {
        key: "perguntas-frequentes",
        title: "Perguntas frequentes",
        label: "Perguntas frequentes",
        description:
          "Encontre respostas sobre funcionamento, aplicação e acesso.",
        href: HEADER_RESOURCE_ROUTES.perguntasFrequentes,
        type: "anchor",
      },
      {
        key: "sobre",
        title: "Sobre o Legion Altaire",
        label: "Sobre o Legion Altaire",
        description:
          "Conheça a visão, o método e os princípios da plataforma.",
        href: HEADER_RESOURCE_ROUTES.sobre,
        type: "route",
      },
    ],
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: {
      label: "Entrar",
      href: ROUTES.login,
      variant: "ghost",
    },
    microcopy: null,
    notes: [
      "/cadastro é a rota pública canônica.",
      "/signup não deve aparecer na interface pública; poderá existir apenas como redirecionamento legado.",
      "Em páginas auxiliares, as âncoras devem manter o prefixo / para retornar à landing.",
      "“Recursos” deve ser botão com estado acessível; os itens internos são links.",
      "Não inserir “Funções” como item principal da navegação.",
      "Somente Começar agora deve possuir o peso de CTA principal.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 02. Hero (§02)                                                           */
  /* ------------------------------------------------------------------------ */
  hero: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.hero,
    objective:
      "Comunicar imediatamente a transformação central, mostrar que existe um sistema por trás da produção de conteúdo e conduzir o visitante para cadastro ou demonstração.",
    eyebrow: "PLATAFORMA DE IA PARA ESTRATÉGIA, CONTEÚDO, AUTORIDADE E VENDAS",
    headline:
      "Transforme a estratégia do seu negócio em conteúdo que constrói autoridade e gera vendas.",
    subheadline:
      "O Legion Altaire conecta sua oferta, seu público e seu posicionamento a um fluxo estratégico de planejamento, temas e roteiros — usando IA para transformar o contexto do seu negócio em conteúdo consistente, contextualizado e orientado para autoridade, conexão e vendas.",
    body: [],
    items: [
      "Estratégia → Planejamento → Conteúdo.",
      "Para negócios que sabem que conteúdo não é apenas presença — é posicionamento, relacionamento e venda.",
    ],
    visualSequence: ["Estratégia", "Planejamento", "Conteúdo"],
    visualSequenceText: "Estratégia → Planejamento → Conteúdo.",
    identificationMessage:
      "Para negócios que sabem que conteúdo não é apenas presença — é posicionamento, relacionamento e venda.",
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: {
      label: "Ver demonstração",
      href: LANDING_SECTION_ROUTES.demonstracao,
      variant: "secondary",
    },
    microcopy: [
      "Para negócios que sabem que conteúdo não é apenas presença — é posicionamento, relacionamento e venda.",
    ],
    reservedVariations: [
      {
        code: "A",
        status: "futuro",
        headline:
          "Crie conteúdo estratégico para ser lembrado, reconhecido e escolhido.",
      },
      {
        code: "B",
        status: "futuro",
        headline: "Sua estratégia merece mais do que posts soltos.",
      },
      {
        code: "C",
        status: "futuro",
        headline:
          "Planeje, crie e publique conteúdo conectado ao seu negócio.",
      },
      {
        code: "D",
        status: "futuro",
        headline: "Construa autoridade com conteúdo feito para o seu público.",
      },
    ],
    conditionalTrialInfo: {
      status: "provisorio",
      enabled: false,
      items: [
        "O período de teste será de 30 dias mediante CPF e cartão de crédito no checkout Asaas.",
      ],
      conditionNote:
        "O trial de 30 dias está confirmado, mas a landing não deve improvisar microcopy comercial fora deste documento.",
    },
    mockupPreview: {
      frameTitle: "Legion Altaire — Projeto Editorial",
      projectLabel: "Estratégia → Planejamento → Conteúdo",
      statusLabel: "Contexto sincronizado",
      flowSteps: [
        {
          id: "hero-node-base",
          code: "NÚCLEO",
          label: "Base Estratégica",
          title: "Oferta, público, posicionamento, objetivos e capacidade",
          meta: "Contexto do Projeto Editorial",
          statusLabel: "Ativo",
        },
        {
          id: "hero-node-calendar",
          code: "FUNÇÃO 01",
          label: "Linha Editorial e Calendário",
          title: "Direção da comunicação e distribuição no período",
          meta: "Alinhado à capacidade real",
          statusLabel: "Aprovado",
        },
        {
          id: "hero-node-theme",
          code: "FUNÇÃO 02",
          label: "Temas e Biblioteca Estratégica",
          title: "Temas e ângulos conectados ao negócio e ao público",
          meta: "Vinculado ao slot editorial",
          statusLabel: "Selecionado",
        },
        {
          id: "hero-node-script",
          code: "FUNÇÃO 03",
          label: "Roteiros e Ativos",
          title: "Pacote de conteúdo adequado ao formato da publicação",
          meta: "Pronto para produção",
          statusLabel: "Gerado",
        },
      ],
    },
    notes: [
      "A frase de identificação não deve ser apresentada como prova social.",
      "Não publicar métricas, logos ou números até que existam evidências reais e autorizadas.",
      "O CTA principal inicia a criação de conta; o plano será escolhido depois do cadastro.",
      "O trial de 30 dias está confirmado, mas a landing não deve improvisar microcopy comercial fora deste documento.",
      "Variações de headline pertencem a testes futuros e não devem ser implementadas na primeira versão.",
      "O mockup deve representar funcionalidades reais e manter a sequência contexto → planejamento → conteúdo.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 03. Faixa de posicionamento (§03)                                        */
  /* ------------------------------------------------------------------------ */
  positioningBand: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.faixaPosicionamento,
    objective:
      "Identificar para quem o Legion Altaire foi criado, reforçar o princípio de direção estratégica e criar a ponte entre a promessa do Hero e o problema.",
    eyebrow: "CONTEÚDO COM DIREÇÃO ESTRATÉGICA",
    headline:
      "Para especialistas, consultores, infoprodutores, mentores, vendedores e marcas que precisam transformar sua estratégia em conteúdo com direção.",
    subheadline:
      "Oferta, público e posicionamento orientam o que deve ser comunicado — antes que a produção comece.",
    body: [],
    items: [
      "Estratégia conectada.",
      "Conteúdo relevante.",
      "Execução orientada.",
    ],
    pillars: [
      {
        label: "Estratégia conectada.",
        description:
          "Oferta, público e posicionamento orientam o que deve ser comunicado.",
      },
      {
        label: "Conteúdo relevante.",
        description:
          "Temas e formatos alinhados às dores, desejos, objeções e objetivos do negócio.",
      },
      {
        label: "Execução orientada.",
        description:
          "Planejamento, calendário, roteiros e ativos conectados dentro do mesmo Projeto Editorial.",
      },
    ],
    futureSocialProof: {
      status: "futuro",
      enabled: false,
      suggestedEyebrow:
        "NEGÓCIOS QUE ESTÃO TRANSFORMANDO ESTRATÉGIA EM CONTEÚDO",
      activationCondition:
        "Existência de logos autorizados, dados reais, depoimentos identificados ou estudos de caso verificáveis.",
      rule: "Não publicar placeholders, números estimados ou logos sem autorização.",
    },
    primaryAction: null,
    secondaryAction: null,
    microcopy: null,
    notes: [
      "Esta faixa não é prova social.",
      "Os três itens são indicadores conceituais, não métricas ou resultados.",
      "Não inserir CTA nesta seção.",
      "No futuro, a faixa poderá evoluir para prova social somente com evidências reais, específicas, identificáveis e autorizadas.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 04. Problema (§04)                                                       */
  /* ------------------------------------------------------------------------ */
  problem: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.problema,
    objective:
      "Mostrar que o problema não é apenas produzir pouco conteúdo, mas operar uma comunicação desconectada da estratégia, da oferta, do público e da capacidade de execução.",
    eyebrow: "O DESAFIO NÃO É APENAS PRODUZIR",
    headline:
      "Seu conteúdo pode até estar ativo — mas isso não significa que esteja trabalhando pelo seu negócio.",
    subheadline:
      "Publicar com frequência não garante autoridade, conexão ou vendas. Quando cada conteúdo nasce separado da sua oferta, do seu público e do momento do negócio, sua comunicação perde força — mesmo quando você está produzindo muito.",
    body: [
      "Você pode ter boas ideias, conhecimento e algo valioso para vender. Ainda assim, sua comunicação pode parecer fragmentada. Um conteúdo fala de um assunto, outro busca engajamento, outro apresenta uma oferta, outro responde a uma dúvida. Mas poucos constroem uma percepção contínua sobre quem você é, o que defende, para quem trabalha e por que sua solução merece ser escolhida.",
      "O problema, portanto, não é simplesmente saber o que postar. É transformar conhecimento, posicionamento e oferta em uma comunicação que faça sentido para o público ao longo do tempo.",
    ],
    items: [
      "Conteúdo desconectado da oferta: Você publica, mas o conteúdo não conduz até o que você vende.",
      "Comunicação sem sequência: Cada conteúdo parece uma peça isolada.",
      "Público pouco compreendido: Sua mensagem não conversa com o que move a decisão do seu público.",
      "Produção sem direção operacional: O planejamento não traduz o que você consegue executar.",
    ],
    detailedItems: [
      {
        index: "01",
        title: "Conteúdo desconectado da oferta",
        description:
          "Você publica, mas o conteúdo não conduz até o que você vende. Quando os temas e o tipo de conteúdo correto não nascem da sua oferta, do seu público e da transformação que você entrega, a audiência pode consumir seus conteúdos sem entender por que deveria escolher você.",
      },
      {
        index: "02",
        title: "Comunicação sem sequência",
        description:
          "Cada conteúdo parece uma peça isolada. Sem uma sequência estratégica de conteúdos e formatos, você alterna entre engajamento, interação, transformação e venda sem construir uma jornada clara e bem definida para quem está acompanhando sua marca.",
      },
      {
        index: "03",
        title: "Público pouco compreendido",
        description:
          "Sua mensagem não conversa com o que move a decisão do seu público. Um conteúdo pode até ser interessante, mas, se não considera dores, desejos, objeções e o nível de consciência do público comprador, dificilmente cria conexão suficiente para mover uma decisão.",
      },
      {
        index: "04",
        title: "Produção sem direção operacional",
        description:
          "O planejamento não traduz o que você consegue executar. Um calendário pode parecer completo e ainda assim ignorar seu tempo, sua equipe, seus formatos e sua capacidade real de produzir com qualidade.",
      },
    ],
    consequence:
      "O resultado é uma comunicação que exige esforço constante, mas não constrói necessariamente a percepção que você precisa. Você produz, revisa, muda de direção com frequência e continua sem clareza sobre como cada conteúdo contribui para o seu negócio.",
    synthesisPhrase:
      "O problema não é apenas falta de conteúdo. É falta de conexão entre estratégia, mensagem, público e execução.",
    fragments: [
      {
        label: "Conteúdo desconectado da oferta",
        state: "Não conduz até o que você vende",
      },
      {
        label: "Comunicação sem sequência",
        state: "Cada conteúdo parece uma peça isolada",
      },
      {
        label: "Público pouco compreendido",
        state: "Desconsidera dores, desejos e objeções",
      },
      {
        label: "Produção sem direção operacional",
        state: "Ignora a capacidade real de produzir",
      },
    ],
    primaryAction: null,
    secondaryAction: null,
    microcopy: null,
    notes: [
      "A seção deve provocar reconhecimento, não medo.",
      "Não reduzir a dor à falta de ideias.",
      "Não antecipar todo o mecanismo do produto.",
      "A transição final do documento original foi separada como seção própria de Mudança de paradigma.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 05. Mudança de paradigma (§05)                                           */
  /* ------------------------------------------------------------------------ */
  paradigmShift: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.mudancaDeParadigma,
    objective:
      "Reenquadrar o problema e estabelecer o princípio de que o conteúdo não deve começar pelo post isolado, mas pelo contexto estratégico que orienta a comunicação.",
    eyebrow: null,
    headline: "É por isso que o Legion Altaire não começa pelo post.",
    subheadline:
      "Ele começa pelo contexto que dá sentido ao que será produzido.",
    body: [],
    items: [
      "Conteúdo isolado → contexto estratégico.",
      "Dispersão → direção.",
      "Produção desconectada → comunicação organizada.",
    ],
    transitions: [
      { from: "Conteúdo isolado", to: "contexto estratégico." },
      { from: "Dispersão", to: "direção." },
      { from: "Produção desconectada", to: "comunicação organizada." },
    ],
    contrastPair: {
      beforeLabel: "Conteúdo isolado",
      beforeDescription:
        "Dispersão e produção desconectada da estratégia, da mensagem e do momento do negócio.",
      afterLabel: "Contexto estratégico",
      afterDescription:
        "Direção e comunicação organizada antes que a produção de cada conteúdo comece.",
    },
    primaryAction: null,
    secondaryAction: null,
    microcopy: null,
    notes: [
      "Esta seção nasce da transição oficial originalmente posicionada ao final do Problema.",
      "A separação em seção própria não altera a mensagem; apenas formaliza sua função narrativa.",
      "Não explicar aqui os três movimentos completos.",
      "Deve preparar diretamente a seção /#produto.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 06. Como o Legion Altaire pensa (§06 — #produto)                         */
  /* ------------------------------------------------------------------------ */
  mechanism: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.produto,
    objective:
      "Explicar o mecanismo central do Legion Altaire e mostrar por que ele não funciona como uma geração isolada baseada em comandos genéricos.",
    eyebrow: "COMO O LEGION ALTAIRE PENSA",
    headline:
      "Uma IA que entende o seu negócio antes de criar o seu conteúdo.",
    subheadline:
      "O Legion Altaire conecta sua oferta, seu público, seu posicionamento e o momento do negócio antes de transformar essas informações em linha editorial, calendário, temas, roteiros e ativos para publicação.",
    body: [
      "Em vez de gerar uma publicação isolada a partir de um comando genérico, o Legion Altaire trabalha dentro de um Projeto Editorial. A Base Estratégica orienta o que precisa ser comunicado, a sequência editorial organiza a direção e cada conteúdo avança para a execução conforme seu formato, objetivo, público e contexto.",
      "A lógica é: Negócio → estratégia → conteúdo → autoridade → conexão → vendas.",
    ],
    logicChainText:
      "A lógica é: Negócio → estratégia → conteúdo → autoridade → conexão → vendas.",
    logicChainNodes: [
      "Negócio",
      "estratégia",
      "conteúdo",
      "autoridade",
      "conexão",
      "vendas",
    ],
    stages: [
      {
        step: "01",
        stateKey: "StrategicBaseState",
        movementLabel: "Movimento 01 — Entender o negócio",
        title: "Entender o negócio",
        subtitle: "Base Estratégica.",
        description:
          "O Legion Altaire reúne as informações que dão contexto ao seu negócio: oferta, público, posicionamento, objetivos, linguagem e capacidade de produção.",
        perceivedResult:
          "A criação passa a partir do contexto do seu negócio, em vez de começar do zero a cada conteúdo.",
        possibleElements: [
          "nicho e subnicho",
          "oferta e promessa",
          "público comprador",
          "posicionamento",
          "tom de voz",
          "objetivo do período",
          "capacidade de produção",
        ],
        inputs: [
          "nicho e subnicho",
          "oferta e promessa",
          "público comprador",
          "posicionamento e tom de voz",
          "objetivo do período",
          "capacidade de produção",
        ],
        outputs: [
          "A criação passa a partir do contexto do seu negócio, em vez de começar do zero a cada conteúdo.",
        ],
        statusBadge: "Movimento 01 · Base Estratégica",
      },
      {
        step: "02",
        stateKey: "EditorialPlanningState",
        movementLabel: "Movimento 02 — Organizar a comunicação",
        title: "Organizar a comunicação",
        subtitle: "Linha Editorial e Calendário.",
        description:
          "A estratégia se transforma em uma direção clara de comunicação e em um calendário que organiza formatos, frequência, objetivos e momentos da jornada do público.",
        perceivedResult:
          "Você deixa de escolher conteúdos isolados e passa a enxergar como cada peça contribui para a comunicação do seu negócio.",
        possibleElements: [
          "mensagem central",
          "pilares editoriais",
          "tom de voz",
          "tipos de conteúdo",
          "formatos",
          "frequência",
          "objetivo do período",
        ],
        inputs: [
          "mensagem central",
          "pilares editoriais",
          "tom de voz",
          "tipos de conteúdo e formatos",
          "frequência",
          "objetivo do período",
        ],
        outputs: [
          "Você deixa de escolher conteúdos isolados e passa a enxergar como cada peça contribui para a comunicação do seu negócio.",
        ],
        statusBadge: "Movimento 02 · Linha Editorial e Calendário",
      },
      {
        step: "03",
        stateKey: "ContentExecutionState",
        movementLabel: "Movimento 03 — Executar o conteúdo",
        title: "Executar o conteúdo",
        subtitle: "Temas, Roteiros e Ativos.",
        description:
          "Cada conteúdo planejado pode avançar para a execução com tema, roteiro, legenda, título, thumbnail, chamada para ação e materiais complementares adequados ao formato.",
        perceivedResult:
          "A estratégia deixa de ser apenas planejamento e avança para materiais concretos de produção e publicação.",
        preservedContext:
          "O movimento pode partir de um slot do calendário ou de um tema da biblioteca. O conteúdo recebe o contexto do Projeto Editorial, do slot, do tema, do formato, do objetivo, do público e da linha editorial.",
        possibleElements: [
          "tema estratégico",
          "roteiro",
          "legenda",
          "título",
          "thumbnail",
          "chamada para ação",
          "material complementar quando qualificado",
        ],
        inputs: [
          "tema estratégico",
          "roteiro e legenda",
          "título e thumbnail",
          "chamada para ação",
          "material complementar quando qualificado",
        ],
        outputs: [
          "A estratégia deixa de ser apenas planejamento e avança para materiais concretos de produção e publicação.",
        ],
        statusBadge: "Movimento 03 · Temas, Roteiros e Ativos",
      },
    ],
    closingText:
      "O resultado é uma operação de conteúdo em que cada peça nasce com contexto, cumpre uma função e avança a comunicação do seu negócio.",
    visualHighlight:
      "Cada conteúdo nasce com contexto, cumpre uma função e avança sua comunicação.",
    primaryAction: null,
    secondaryAction: {
      label: "Ver demonstração",
      href: LANDING_SECTION_ROUTES.demonstracao,
      variant: "secondary",
    },
    microcopy: [
      "Veja como o contexto estratégico se transforma em conteúdo dentro do Legion Altaire.",
    ],
    notes: [
      "Esta é a única seção com grande scrollytelling.",
      "Os três movimentos formam um fluxo único, não três ferramentas independentes.",
      "A cadeia que termina em vendas descreve a lógica estratégica; não é garantia automática de resultado.",
      "Os nomes das Funções 01, 02 e 03 podem aparecer como identificação secundária, sem substituir Entender, Organizar e Executar.",
      "A seção não deve antecipar todos os detalhes das três funções.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 07. Demonstração (§07 — #demonstracao)                                   */
  /* ------------------------------------------------------------------------ */
  demo: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.demonstracao,
    objective:
      "Transformar a lógica apresentada anteriormente em evidência visual do funcionamento do produto.",
    eyebrow: "A ESTRATÉGIA EM MOVIMENTO",
    headline:
      "Veja a estratégia do seu negócio se transformar em uma operação de conteúdo.",
    subheadline:
      "Veja, em um único ambiente, como as decisões do seu Projeto Editorial ganham forma no planejamento e avançam até a criação dos conteúdos.",
    body: [
      "O que você vê abaixo não são telas isoladas. É o mesmo Projeto Editorial avançando de uma decisão para a próxima.",
    ],
    primaryAction: null,
    secondaryAction: null,
    microcopy: [
      "Veja, na prática, como uma decisão tomada no Projeto Editorial chega até um conteúdo pronto para produção.",
    ],
    mode: "poster-only",
    stageLabels: ["01 — CONTEXTO", "02 — DIREÇÃO", "03 — EXECUÇÃO"],
    callouts: [
      {
        step: "01",
        tag: "01 — CONTEXTO",
        label: "CONTEXTO",
        title: "Base Estratégica.",
        description: "Informações do negócio orientando o Projeto Editorial.",
      },
      {
        step: "02",
        tag: "02 — DIREÇÃO",
        label: "DIREÇÃO",
        title: "Linha Editorial e Calendário.",
        description: "A comunicação organizada antes da produção.",
      },
      {
        step: "03",
        tag: "03 — EXECUÇÃO",
        label: "EXECUÇÃO",
        title: "Tema e Roteiro.",
        description: "O conteúdo avançando para a etapa de produção.",
      },
    ],
    futureVideoSequence:
      "Projeto Editorial → Base Estratégica → planejamento → conteúdo.",
    targetVideoDuration: "de 2 a 5 minutos.",
    videoAvailableActionLabel: "Assistir demonstração",
    honestStatusLabel: "A ESTRATÉGIA EM MOVIMENTO",
    honestStatusDescription:
      "Veja, na prática, como uma decisão tomada no Projeto Editorial chega até um conteúdo pronto para produção.",
    videoSources: {
      posterSrc: "/landing/demo-poster.webp",
      webmSrc: null,
      mp4Src: null,
      captionsSrc: null,
      transcriptUrl: null,
    },
    modeNotes: {
      "poster-only": [
        "Estado poster-only: não renderizar ação de reprodução.",
        "Enquanto o vídeo não existir, utilizar poster realista e reservar a proporção final.",
        "Não publicar botão de play sem vídeo.",
      ],
      "video-available": [
        "Estado video-available: Assistir demonstração — abre o player ou modal real.",
        "Aceitar poster, mp4Src, webmSrc, captionsSrc e transcriptUrl.",
      ],
    },
    notes: [
      "A seção deve existir desde a primeira versão.",
      "Enquanto o vídeo não existir, utilizar poster realista e reservar a proporção final.",
      "O componente deve aceitar posteriormente poster, mp4Src, webmSrc, captionsSrc e transcriptUrl.",
      "Não publicar botão de play sem vídeo.",
      "O CTA do header e do Hero navega até a seção; ele não promete que o vídeo já está disponível.",
      "O vídeo futuro deve mostrar o produto cedo, sem introdução institucional longa.",
      "A demonstração deve mostrar continuidade, não uma coleção de screenshots.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 08. Três funções (§08 — #funcoes)                                        */
  /* ------------------------------------------------------------------------ */
  functions: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.funcoes,
    objective:
      "Apresentar as três funções centrais e o papel específico de cada uma dentro do mesmo Projeto Editorial.",
    eyebrow: "O QUE O LEGION ALTAIRE ORGANIZA",
    headline:
      "Da direção à execução, três funções trabalham dentro do mesmo Projeto Editorial.",
    subheadline:
      "O Legion Altaire organiza a direção da comunicação, encontra temas com contexto e transforma oportunidades em materiais de conteúdo adequados ao formato e ao objetivo de cada publicação.",
    body: [
      "A Base Estratégica alimenta todo o fluxo, enquanto cada função assume uma parte específica da operação — sem transformar a plataforma em um conjunto de ferramentas isoladas.",
    ],
    cards: [
      {
        index: "01",
        internalName: "FUNÇÃO 01 — DIREÇÃO",
        categoryTag: "FUNÇÃO 01 — DIREÇÃO",
        publicName: "Linha Editorial e Calendário.",
        subtitle: "FUNÇÃO 01 — DIREÇÃO",
        mainBenefit:
          "Transforme sua estratégia em uma direção clara e em uma agenda que sua operação consegue sustentar.",
        description:
          "A Linha Editorial organiza mensagem central, pilares, tom de voz e objetivos da comunicação. Em seguida, o Calendário distribui essa direção ao longo do período, considerando plataformas, formatos, frequência e capacidade real de produção.",
        highlightsLabel: "O que você organiza",
        highlights: [
          "mensagem central",
          "pilares editoriais",
          "tom de voz",
          "objetivos de comunicação",
          "formatos",
          "frequência",
          "plataformas",
          "capacidade de produção",
        ],
        resultText:
          "Uma direção editorial clara e um calendário possível de executar.",
        mockupSummary: {
          moduleTag: "FUNÇÃO 01 — DIREÇÃO",
          primaryView: "Linha Editorial e Calendário.",
          secondaryView:
            "Plataformas, formatos, frequência e capacidade real de produção",
          statusText:
            "Uma direção editorial clara e um calendário possível de executar.",
          sampleItems: [
            "Mensagem central e pilares editoriais",
            "Tom de voz e objetivos de comunicação",
            "Formatos, frequência, plataformas e capacidade de produção",
          ],
        },
      },
      {
        index: "02",
        internalName: "FUNÇÃO 02 — TEMAS E ÂNGULOS",
        categoryTag: "FUNÇÃO 02 — TEMAS E ÂNGULOS",
        publicName: "Temas e Biblioteca Estratégica.",
        subtitle: "FUNÇÃO 02 — TEMAS E ÂNGULOS",
        mainBenefit:
          "Encontre temas e ângulos que façam sentido para o seu público, sua oferta e o momento do negócio.",
        description:
          "A Biblioteca Estratégica reúne e organiza temas a partir do contexto do projeto. Eles podem partir do negócio e do público, de sinais e referências do mercado ou do objetivo definido para o período.",
        highlightsLabel: "Origens e organização na Biblioteca",
        highlights: [
          "A partir do negócio e do público",
          "A partir do mercado",
          "A partir do objetivo do período",
          "Biblioteca filtrável por objetivo, pilar, jornada, formato ou plataforma",
        ],
        origins: [
          {
            label: "A partir do negócio e do público",
            description:
              "temas conectados à oferta, promessa, dores, desejos, objeções e necessidades do público.",
          },
          {
            label: "A partir do mercado",
            description:
              "referências, comentários, feedbacks e sinais do mercado ajudam a identificar dúvidas, lacunas e ângulos relevantes.",
          },
          {
            label: "A partir do objetivo do período",
            description:
              "temas direcionados ao momento da operação, como crescimento de audiência, autoridade, aquecimento, apoio à venda ou relacionamento com clientes.",
          },
        ],
        libraryNote:
          "os temas aprovados permanecem organizados e podem ser filtrados e reutilizados conforme objetivo, pilar, jornada, formato ou plataforma.",
        resultText:
          "Um repertório estratégico de temas, pronto para alimentar o planejamento e a produção.",
        mockupSummary: {
          moduleTag: "FUNÇÃO 02 — TEMAS E ÂNGULOS",
          primaryView: "Temas e Biblioteca Estratégica.",
          secondaryView:
            "Filtro e reutilização por objetivo, pilar, jornada, formato ou plataforma",
          statusText:
            "Um repertório estratégico de temas, pronto para alimentar o planejamento e a produção.",
          sampleItems: [
            "A partir do negócio e do público: oferta, promessa, dores, desejos e objeções",
            "A partir do mercado: referências, comentários, feedbacks e sinais",
            "A partir do objetivo do período: audiência, autoridade, aquecimento e venda",
          ],
        },
      },
      {
        index: "03",
        internalName: "FUNÇÃO 03 — PRODUÇÃO E ATIVOS",
        categoryTag: "FUNÇÃO 03 — PRODUÇÃO E ATIVOS",
        publicName: "Roteiros e Ativos.",
        subtitle: "FUNÇÃO 03 — PRODUÇÃO E ATIVOS",
        mainBenefit:
          "Transforme cada oportunidade do calendário em um pacote de conteúdo para produzir e publicar.",
        description:
          "A partir de um slot do calendário ou de um tema da Biblioteca, o Legion Altaire cria os materiais necessários de acordo com o formato e as definições daquele conteúdo.",
        highlightsLabel: "Pacote de execução",
        highlights: [
          "roteiro",
          "legenda ou descrição",
          "títulos",
          "thumbnail ou capa",
          "chamada para ação",
          "instruções visuais",
          "prompts de imagem",
          "materiais complementares quando qualificados",
        ],
        preservedContext:
          "A criação continua vinculada ao Projeto Editorial, ao tema, ao público, à oferta e à direção da comunicação.",
        resultText:
          "Uma oportunidade planejada deixa de ser apenas uma ideia e passa a existir como material concreto para revisão, produção e publicação.",
        mockupSummary: {
          moduleTag: "FUNÇÃO 03 — PRODUÇÃO E ATIVOS",
          primaryView: "Roteiros e Ativos.",
          secondaryView:
            "A criação continua vinculada ao Projeto Editorial, ao tema, ao público, à oferta e à direção da comunicação.",
          statusText:
            "Material concreto para revisão, produção e publicação.",
          sampleItems: [
            "roteiro, legenda ou descrição e títulos",
            "thumbnail ou capa, chamada para ação, instruções visuais e prompts de imagem",
            "materiais complementares quando qualificados",
          ],
        },
      },
    ],
    primaryAction: null,
    secondaryAction: null,
    microcopy: ["Base Estratégica → Direção → Temas → Execução."],
    notes: [
      "A Base Estratégica alimenta as funções; não deve ser apresentada como Função 00 ou quarta função.",
      "As funções não são ferramentas independentes.",
      "O benefício deve aparecer antes da descrição funcional.",
      "Materiais complementares só devem aparecer como possibilidade condicionada à qualificação estratégica.",
      "Não representar a Função 03 como origem da estratégia.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 09. Como funciona (§09 — #como-funciona)                                 */
  /* ------------------------------------------------------------------------ */
  howItWorks: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.comoFunciona,
    objective:
      "Mostrar o caminho prático, controlado pelo usuário, que transforma contexto em execução.",
    eyebrow: "COMO O LEGION ALTAIRE ENTRA NA SUA ROTINA",
    headline:
      "Da estratégia à execução, em um fluxo que acompanha o seu negócio.",
    subheadline:
      "Você define o contexto, aprova a direção da comunicação e transforma cada oportunidade do calendário em conteúdo para produzir, revisar e publicar.",
    body: [
      "O Projeto Editorial mantém as decisões organizadas ao longo do processo, para que você não precise reconstruir o contexto do negócio a cada novo conteúdo.",
    ],
    humanApprovalNote: "A IA propõe. Você revisa, ajusta e aprova.",
    steps: [
      {
        step: "01",
        stepLabel: "Etapa 01 — Configure seu Projeto Editorial",
        title: "Comece pelo contexto do seu negócio.",
        stepSubheadline:
          "Crie uma Base Estratégica própria para o produto, oferta ou fase do negócio que você deseja trabalhar.",
        description:
          "Você informa ou importa os dados que orientam a comunicação — como oferta, público, posicionamento, objetivos e capacidade de produção. O Legion Altaire organiza essas informações dentro do Projeto Editorial e passa a utilizá-las nas decisões seguintes.",
        moduleBadge: "Etapa 01 — Configure seu Projeto Editorial",
        interfaceElements: [
          "nome do Projeto Editorial",
          "oferta principal",
          "público comprador",
          "objetivo atual",
          "tom de voz",
          "capacidade de produção",
          "informações adicionais conforme a configuração",
        ],
        perceivedBenefit:
          "Você cria uma base de contexto que pode orientar toda a operação daquele projeto.",
        stepMicrocopy:
          "Um contexto bem definido orienta as decisões que vêm depois.",
      },
      {
        step: "02",
        stepLabel: "Etapa 02 — Revise e aprove a direção",
        title: "Aprove o plano antes de produzir.",
        stepSubheadline:
          "A IA dedicada à função propõe uma direção editorial e um calendário compatível com o momento e a capacidade da sua operação.",
        description:
          "A plataforma transforma o contexto do Projeto Editorial em uma proposta de comunicação e organização do período. Você analisa, ajusta os pontos necessários e aprova a versão que seguirá para a produção.",
        moduleBadge: "Etapa 02 — Revise e aprove a direção",
        userAction: "Analisa → ajusta → aprova.",
        reviewableElements: [
          "mensagem central",
          "pilares editoriais",
          "tom de voz",
          "formatos",
          "frequência",
          "plataformas",
          "objetivos do período",
          "distribuição do conteúdo no calendário",
        ],
        productionCapacityExamples: [
          "vídeos curtos",
          "vídeos longos",
          "carrosséis",
          "posts estáticos",
          "lives",
          "sequências de Stories, conforme a configuração real do usuário",
        ],
        perceivedBenefit:
          "Você valida a direção antes de transformar o planejamento em produção.",
        stepMicrocopy: "A IA propõe. Você revisa, ajusta e aprova.",
      },
      {
        step: "03",
        stepLabel: "Etapa 03 — Gere e avance para a execução",
        title: "Transforme cada oportunidade em conteúdo.",
        stepSubheadline:
          "Escolha um slot ou tema e avance para um pacote de execução adequado ao formato.",
        description:
          "Com a direção aprovada, você pode selecionar um slot do calendário ou um tema da Biblioteca e avançar para a criação. Antes da geração, o contexto e as definições do conteúdo podem ser revisados para que o material siga a proposta daquele projeto.",
        moduleBadge: "Etapa 03 — Gere e avance para a execução",
        executionFlow:
          "escolha um slot ou tema → confirme o formato e as definições → revise o contexto do conteúdo → gere os materiais → edite e salve → produza, publique ou baixe.",
        possibleMaterials: [
          "roteiro",
          "legenda ou descrição",
          "títulos",
          "thumbnail ou capa",
          "chamada para ação",
          "instruções visuais",
          "prompts de imagem",
          "materiais complementares quando qualificados",
        ],
        perceivedBenefit:
          "Uma oportunidade planejada avança para materiais concretos sem perder o contexto do projeto.",
        stepMicrocopy:
          "Cada oportunidade pode avançar até uma entrega concreta para sua operação.",
      },
    ],
    visualSynthesis:
      "PROJETO EDITORIAL → CONTEXTO → DIREÇÃO APROVADA → OPORTUNIDADE DE CONTEÚDO → EXECUÇÃO.",
    visualSynthesisNodes: [
      "PROJETO EDITORIAL",
      "CONTEXTO",
      "DIREÇÃO APROVADA",
      "OPORTUNIDADE DE CONTEÚDO",
      "EXECUÇÃO",
    ],
    closingText:
      "Você continua tomando as decisões importantes. O Legion Altaire organiza o caminho, conecta as informações e acelera a execução.",
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: null,
    microcopy: ["Crie seu primeiro Projeto Editorial."],
    notes: [
      "O CTA leva ao cadastro; não leva diretamente ao onboarding.",
      "Depois do cadastro, o usuário seguirá para escolha de um dos três planos, dados de cobrança, trial e confirmação do estado necessário antes do onboarding.",
      "A aprovação humana deve permanecer explícita.",
      "A quantidade de conteúdo deve respeitar a capacidade real informada pelo usuário.",
      "A etapa não deve repetir a arquitetura completa das três funções.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 10. Benefícios (§10 — #beneficios)                                       */
  /* ------------------------------------------------------------------------ */
  benefits: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.beneficios,
    objective:
      "Traduzir capacidades e processos do Legion Altaire em mudanças percebidas para a comunicação, a operação e o negócio.",
    eyebrow: "O QUE MUDA NA PRÁTICA",
    headline:
      "Mais do que produzir conteúdo: construa uma comunicação que trabalha pelo seu negócio.",
    subheadline:
      "Quando estratégia, público, oferta e execução estão conectados, cada conteúdo passa a cumprir um papel mais claro na comunicação da sua marca.",
    body: [
      "O Legion Altaire reduz a distância entre saber o que sua marca precisa comunicar e conseguir transformar essa direção em uma operação de conteúdo consistente e executável.",
    ],
    blocks: [
      {
        index: "01",
        categoryLabel: "01 — Consistência com propósito",
        strategicDecision: "Linha Editorial + Calendário Editorial.",
        title: "Publique com uma direção — não apenas com frequência.",
        description:
          "Cada conteúdo pode cumprir uma função diferente dentro da comunicação: gerar relacionamento, estimular interação, educar, reforçar autoridade, desenvolver consciência ou apoiar uma venda.",
        businessConsequence:
          "Sua comunicação deixa de parecer uma sequência de publicações isoladas e passa a construir uma percepção mais contínua sobre sua marca, sua expertise e sua oferta.",
        sustainingResource: "Linha Editorial + Calendário Editorial.",
        indicatorLabel: "Conteúdo com função definida.",
      },
      {
        index: "02",
        categoryLabel: "02 — Planejamento compatível com a realidade",
        strategicDecision: "Calendário baseado em capacidade real de produção.",
        title: "Planeje o que você realmente consegue executar.",
        description:
          "O planejamento considera formatos, plataformas, frequência e capacidade real de produção antes de distribuir o conteúdo ao longo do período.",
        businessConsequence:
          "Você reduz a distância entre o calendário ideal e a rotina possível, criando uma operação que pode ser sustentada sem transformar consistência em sobrecarga.",
        sustainingResource:
          "Calendário baseado em capacidade real de produção.",
        indicatorLabel: "Plano compatível com a operação.",
      },
      {
        index: "03",
        categoryLabel: "03 — Conteúdo contextualizado ao negócio",
        strategicDecision: "Base Estratégica + contexto do Projeto Editorial.",
        title: "Pare de começar cada conteúdo do zero.",
        description:
          "A criação parte do contexto organizado no Projeto Editorial e das definições específicas de cada conteúdo.",
        businessConsequence:
          "Você não precisa reconstruir as mesmas informações a cada geração. A comunicação ganha mais coerência porque os conteúdos permanecem vinculados ao contexto que orienta o projeto.",
        sustainingResource: "Base Estratégica + contexto do Projeto Editorial.",
        indicatorLabel: "Contexto preservado entre as criações.",
      },
      {
        index: "04",
        categoryLabel: "04 — Repertório organizado e reaproveitável",
        strategicDecision:
          "Biblioteca de Temas + histórico de Roteiros e Ativos.",
        title:
          "Transforme ideias em um repertório que continua trabalhando pelo negócio.",
        description:
          "Temas, referências, roteiros e ativos permanecem organizados dentro do Projeto Editorial, com informações que ajudam a localizar, revisar, adaptar e reutilizar o que já foi criado.",
        businessConsequence:
          "Seu conhecimento deixa de ficar espalhado entre conversas, documentos e abas. O que já foi desenvolvido pode voltar a ser consultado e reaproveitado em novos momentos da comunicação.",
        sustainingResource:
          "Biblioteca de Temas + histórico de Roteiros e Ativos.",
        indicatorLabel: "Repertório editorial organizado.",
      },
      {
        index: "05",
        categoryLabel: "05 — Autoridade conectada à oferta",
        strategicDecision:
          "Oferta + público + posicionamento + objetivos de comunicação.",
        title: "Faça seu conteúdo reforçar o valor do que você vende.",
        description:
          "Os conteúdos podem ser planejados considerando a oferta, o público, o posicionamento, a transformação proposta e o objetivo da comunicação.",
        businessConsequence:
          "Sua comunicação deixa de tratar apenas de assuntos interessantes e passa a ajudar o público a compreender problemas, reconhecer valor e perceber a relevância da solução que sua marca oferece.",
        sustainingResource:
          "Oferta + público + posicionamento + objetivos de comunicação.",
        indicatorLabel: "Conteúdo conectado ao negócio.",
      },
    ],
    authenticityBand: {
      title: "Sua experiência continua sendo parte do conteúdo.",
      description:
        "Histórias, estudos, transcrições, referências e materiais próprios podem orientar a criação para que os conteúdos reflitam o conhecimento e a forma de explicar da sua marca — sem copiar conteúdos existentes nem inventar experiências que não pertencem ao negócio.",
      microcopy: "A IA acelera a produção. A identidade continua sendo sua.",
    },
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: null,
    microcopy: ["Transforme sua estratégia em uma operação de conteúdo."],
    notes: [
      "Manter cinco benefícios principais; autenticidade é faixa de fechamento, não sexto benefício.",
      "Autoridade, relacionamento, consciência e vendas são objetivos possíveis, não resultados automáticos garantidos.",
      "Os formatos exibidos são exemplos configuráveis e não promessa de uso simultâneo.",
      "“Patrimônio editorial” pode ser conceito visual, mas não deve substituir benefícios concretos de organização, continuidade e reaproveitamento.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 11. Diferenciais (§11 — #diferenciais)                                   */
  /* ------------------------------------------------------------------------ */
  differentiators: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.diferenciais,
    objective:
      "Explicar por que o Legion Altaire oferece uma estrutura diferente de um fluxo montado apenas com comandos isolados e ferramentas separadas, sem atacar outras soluções.",
    eyebrow: "A DIFERENÇA ESTÁ NO FLUXO",
    headline:
      "Não é apenas uma IA que cria conteúdo. É uma estrutura para transformar estratégia em comunicação.",
    subheadline:
      "O Legion Altaire conecta contexto, planejamento, temas e execução dentro de um único Projeto Editorial — para que a criação não aconteça como uma sequência de solicitações isoladas.",
    body: [
      "Uma IA pode gerar uma ideia a partir de um comando. O Legion Altaire organiza o fluxo que transforma essa ideia em parte de uma operação editorial.",
    ],
    comparisonTable: [
      {
        index: "01",
        criterion: "Ponto de partida",
        legionAltaire:
          "O trabalho começa dentro de um Projeto Editorial com uma Base Estratégica própria.",
        isolatedCommands:
          "O trabalho começa a partir da solicitação e do contexto fornecido naquele momento.",
      },
      {
        index: "02",
        criterion: "Contexto",
        legionAltaire:
          "Oferta, público, posicionamento, objetivos e capacidade de produção ficam organizados no contexto do projeto.",
        isolatedCommands:
          "O usuário precisa fornecer ou recuperar as informações necessárias ao longo das interações e ferramentas utilizadas.",
      },
      {
        index: "03",
        criterion: "Estrutura estratégica",
        legionAltaire:
          "Linha Editorial, Calendário, Temas e Execução fazem parte de um fluxo conectado.",
        isolatedCommands:
          "O usuário pode combinar prompts, documentos, planilhas, calendários e outras ferramentas para estruturar esse fluxo.",
      },
      {
        index: "04",
        criterion: "Planejamento e temas",
        legionAltaire:
          "Temas podem ser relacionados aos objetivos, formatos, plataformas e oportunidades do calendário.",
        isolatedCommands:
          "A IA pode gerar ideias ou planejamentos, mas a relação entre temas, slots e operação depende de como o usuário organiza o processo.",
      },
      {
        index: "05",
        criterion: "Execução",
        legionAltaire:
          "Um slot ou tema pode avançar para um pacote de conteúdo adequado ao formato e às definições daquele conteúdo.",
        isolatedCommands:
          "O usuário pode precisar solicitar, revisar e organizar diferentes peças separadamente.",
      },
      {
        index: "06",
        criterion: "Repertório e continuidade",
        legionAltaire:
          "Temas, referências, conteúdos e ativos podem permanecer organizados e relacionados dentro do Projeto Editorial.",
        isolatedCommands:
          "A organização do histórico e dos materiais depende da estrutura criada pelo usuário entre as ferramentas utilizadas.",
      },
      {
        index: "07",
        criterion: "Controle e autenticidade",
        legionAltaire:
          "A IA propõe, organiza e acelera; o usuário revisa, ajusta, aprova, edita e salva. Histórias, estudos, transcrições e referências próprias podem orientar a criação.",
        isolatedCommands:
          "O usuário continua responsável por fornecer contexto, avaliar as respostas, organizar o processo e manter os materiais e versões conforme sua própria estrutura.",
      },
    ],
    comparisonObservation:
      "A coluna de uso genérico não significa que uma IA isolada não possa realizar determinada tarefa. O Legion Altaire transforma essas tarefas em um fluxo editorial integrado; no uso por comandos isolados, a integração depende da estrutura criada pelo usuário.",
    beforeFlow:
      "Prompt → resposta → novo prompt → outro documento → outra ferramenta → organização manual.",
    insideLegionFlow:
      "Projeto Editorial → contexto → direção → conteúdo → execução.",
    synthesisPhrase:
      "A diferença não está apenas no que uma IA consegue escrever. Está na estrutura que dá contexto ao conteúdo, conecta cada decisão e transforma a geração em parte de uma operação.",
    isolatedCommandFit: {
      label: "IA por comando isolado",
      description:
        "Faz sentido quando você precisa de uma tarefa pontual, como uma ideia rápida, uma reformulação, uma revisão ou uma geração específica.",
    },
    legionAltaireFit: {
      label: "Legion Altaire",
      description:
        "Faz sentido quando você precisa manter uma operação contínua de conteúdo em que contexto, planejamento, temas e execução precisam permanecer conectados.",
    },
    blocks: [
      {
        index: "01",
        title: "Ponto de partida",
        description:
          "O trabalho começa dentro de um Projeto Editorial com uma Base Estratégica própria.",
        contrastNote:
          "No comando isolado: o trabalho começa a partir da solicitação e do contexto fornecido naquele momento.",
      },
      {
        index: "02",
        title: "Contexto",
        description:
          "Oferta, público, posicionamento, objetivos e capacidade de produção ficam organizados no contexto do projeto.",
        contrastNote:
          "No comando isolado: o usuário precisa fornecer ou recuperar as informações necessárias ao longo das interações.",
      },
      {
        index: "03",
        title: "Estrutura estratégica",
        description:
          "Linha Editorial, Calendário, Temas e Execução fazem parte de um fluxo conectado.",
        contrastNote:
          "No comando isolado: o usuário combina prompts, documentos, planilhas e outras ferramentas.",
      },
      {
        index: "04",
        title: "Planejamento e temas",
        description:
          "Temas podem ser relacionados aos objetivos, formatos, plataformas e oportunidades do calendário.",
        contrastNote:
          "No comando isolado: a relação entre temas, slots e operação depende de como o usuário organiza o processo.",
      },
      {
        index: "05",
        title: "Execução, repertório e controle",
        description:
          "Um slot ou tema pode avançar para um pacote de conteúdo adequado ao formato, mantendo repertório, histórico e aprovação humana dentro do Projeto Editorial.",
        contrastNote:
          "No comando isolado: o usuário solicita, revisa e organiza diferentes peças e versões separadamente.",
      },
    ],
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: null,
    microcopy: ["Transforme sua estratégia em um fluxo editorial conectado."],
    notes: [
      "Comparar abordagens de trabalho, não marcas ou tecnologias específicas.",
      "Não afirmar que outras IAs são incapazes.",
      "Não utilizar “X” vermelho, linguagem depreciativa, logos de concorrentes ou caricaturas.",
      "No mobile, converter a tabela em blocos sequenciais por critério; não obrigar rolagem horizontal para compreender a comparação.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 12. Provas / Depoimentos (§12 — #provas)                                 */
  /* ------------------------------------------------------------------------ */
  evidence: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.provas,
    objective:
      "Responder com transparência ao estágio atual das evidências e preparar uma evolução controlada para provas reais documentadas.",
    eyebrow: "PRIMEIROS PROJETOS EM ACOMPANHAMENTO",
    headline:
      "As primeiras histórias do Legion Altaire estão sendo construídas agora.",
    subheadline: null,
    body: [
      "A plataforma está entrando nos primeiros projetos para acompanhar, na prática, como diferentes negócios organizam sua estratégia e transformam essa direção em uma operação de conteúdo.",
      "À medida que os projetos avançarem, vamos registrar mudanças percebidas, dados de uso e resultados que possam ser apresentados com contexto e identificação.",
    ],
    mode: "monitoring",
    modeLabel: "Primeiros projetos em acompanhamento.",
    progressionSteps: [
      "Primeiros projetos",
      "Acompanhamento",
      "Documentação",
      "Prova verificada",
    ],
    cards: [
      {
        id: "criteria-clarity",
        tag: "ESTRATÉGIA MAIS CLARA",
        title: "ESTRATÉGIA MAIS CLARA",
        description:
          "Acompanhar como a Base Estratégica ajuda diferentes negócios a organizar oferta, público, posicionamento e objetivos de comunicação.",
      },
      {
        id: "criteria-connection",
        tag: "PRODUÇÃO MAIS CONECTADA",
        title: "PRODUÇÃO MAIS CONECTADA",
        description:
          "Observar como Linha Editorial, Calendário, Temas e Roteiros se conectam e influenciam a organização da produção e do funil.",
      },
      {
        id: "criteria-learnings",
        tag: "APRENDIZADOS DOCUMENTADOS",
        title: "APRENDIZADOS DOCUMENTADOS",
        description:
          "Registrar o que funcionou, o que precisou ser ajustado e como cada projeto evoluiu ao longo do uso da plataforma.",
      },
    ],
    futureState: {
      status: "futuro",
      enabled: false,
      eyebrow: "EXPERIÊNCIAS REAIS, CONTEXTO REAL",
      headline:
        "Veja como outros negócios estão transformando estratégia em conteúdo.",
      subheadline:
        "Relatos de quem está usando o Legion Altaire para organizar sua comunicação, produzir com mais direção e construir uma presença alinhada ao próprio negócio.",
      requiredStructure: "Desafio → Uso → Mudança → Resultado → Identificação.",
      featuredCase: null,
      secondaryEvidence: [],
      notes: [
        "Estrutura obrigatória: Desafio → Uso → Mudança → Resultado → Identificação.",
        "Identificação mínima, quando autorizada: nome completo; cargo ou tipo de negócio; empresa; período de uso; foto real ou logo autorizado.",
        "Provas aceitas: depoimento textual verdadeiro; vídeo autorizado; dado de uso com contexto; miniestudo de caso; resultado mensurado com período e método de atribuição.",
        "Regra de ativação: só mudar para este estado quando existirem evidências reais, documentadas e autorizadas.",
      ],
    },
    primaryAction: null,
    secondaryAction: null,
    microcopy: ["Primeiros projetos em acompanhamento."],
    notes: [
      "O modo inicial do componente é monitoring.",
      "Os cards são critérios de acompanhamento, não resultados alcançados.",
      "Não usar nomes, fotos, logos, aspas, estrelas, avaliações, métricas ou depoimentos fictícios.",
      "A redação “geram mais resultados no seu funil” foi normalizada para uma formulação de acompanhamento, evitando apresentar resultado ainda não comprovado.",
      "A seção permanece sem CTA próprio por padrão para preservar a hierarquia antes do FAQ e do CTA final.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 13. FAQ (§13 — #perguntas-frequentes)                                    */
  /* ------------------------------------------------------------------------ */
  faq: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.faq,
    objective:
      "Remover dúvidas e objeções finais sem repetir toda a explicação da plataforma.",
    eyebrow: "ANTES DE COMEÇAR",
    headline:
      "Tudo o que você precisa saber antes de colocar sua estratégia em movimento.",
    subheadline:
      "Reunimos as respostas para as dúvidas mais importantes sobre estratégia, conteúdo, IA, produção e uso do Legion Altaire.",
    body: [],
    items: PUBLISHED_FAQ_ITEMS,
    allItems: ALL_FAQ_ITEMS,
    primaryAction: null,
    secondaryAction: null,
    microcopy: [
      "Ainda não precisa ter tudo pronto. Você só precisa começar pelo contexto certo.",
    ],
    notes: [
      "As perguntas devem ser implementadas em acordeão acessível.",
      "Não mostrar todas as respostas abertas por padrão.",
      "O FAQ não possui CTA próprio; a conversão é concentrada na seção seguinte.",
      "A redação foi normalizada apenas para correção gramatical, clareza e redução de promessas automáticas, sem alterar o posicionamento.",
      "Uma pergunta específica sobre dados, privacidade e segurança não deve ser inventada antes da consolidação das políticas e da implementação real.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 14. CTA final (§14 — #comecar)                                           */
  /* ------------------------------------------------------------------------ */
  finalCta: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.ctaFinal,
    objective:
      "Transformar compreensão em decisão de próximo passo, retomando a promessa central sem reexplicar o produto.",
    eyebrow: "SUA ESTRATÉGIA PODE COMEÇAR A GANHAR FORMA",
    headline:
      "Pronto para transformar sua estratégia em conteúdo que trabalha pelo seu negócio?",
    subheadline:
      "Comece pelo contexto certo e coloque sua estratégia em movimento dentro do Legion Altaire.",
    body: [],
    items: ["Estratégia → conteúdo → negócio."],
    primaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "primary",
    },
    secondaryAction: null,
    microcopy: ["Crie seu primeiro Projeto Editorial."],
    conditionalTrialInfo: {
      status: "provisorio",
      enabled: false,
      items: [
        "O botão leva ao cadastro e, depois, ao fluxo de escolha do plano, dados de cobrança, trial e onboarding.",
      ],
      conditionNote:
        "O trial de 30 dias e as condições comerciais poderão ser comunicados em contexto apropriado quando a redação comercial final estiver aprovada.",
    },
    notes: [
      "Manter exatamente o mesmo rótulo do CTA principal do Header, Hero, Como funciona, Benefícios e Diferenciais.",
      "Não introduzir promessa nova.",
      "O botão leva ao cadastro e, depois, ao fluxo de escolha do plano, dados de cobrança, trial e onboarding.",
      "O trial de 30 dias e as condições comerciais poderão ser comunicados em contexto apropriado quando a redação comercial final estiver aprovada.",
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* 15. Footer (§15 — #site-footer)                                          */
  /* ------------------------------------------------------------------------ */
  footer: {
    status: "aprovado",
    id: LANDING_SECTION_IDS.footer,
    domId: LANDING_DOM_IDS.siteFooter,
    objective:
      "Encerrar a experiência, reforçar a marca e oferecer acesso organizado à navegação, páginas institucionais, documentos legais, autenticação, cadastro e contato.",
    eyebrow: null,
    headline: "LEGION ALTAIRE",
    subheadline:
      "Plataforma de IA para estratégia, conteúdo, autoridade e execução editorial.",
    brandDescription:
      "Plataforma de IA para estratégia, conteúdo, autoridade e execução editorial.",
    copyright: "© {year} Legion Altaire. Todos os direitos reservados.",
    legalNotice:
      "A estratégia orienta. A IA organiza. Você revisa, ajusta e aprova.",
    groups: [
      {
        key: "produto",
        title: "PRODUTO",
        links: [
          {
            label: "Produto",
            href: FOOTER_NAV_ROUTES.produto,
            status: "aprovado",
          },
          {
            label: "Como funciona",
            href: FOOTER_NAV_ROUTES.comoFunciona,
            status: "aprovado",
          },
          {
            label: "Benefícios",
            href: FOOTER_NAV_ROUTES.beneficios,
            status: "aprovado",
          },
          {
            label: "Preços",
            href: FOOTER_NAV_ROUTES.precos,
            status: "aprovado-dependente",
          },
          {
            label: "Demonstração",
            href: FOOTER_NAV_ROUTES.demonstracao,
            status: "aprovado",
          },
          {
            label: "Perguntas frequentes",
            href: FOOTER_NAV_ROUTES.perguntasFrequentes,
            status: "aprovado",
          },
        ],
      },
      {
        key: "empresa",
        title: "EMPRESA",
        links: [
          {
            label: "Sobre o Legion Altaire",
            href: FOOTER_NAV_ROUTES.sobre,
            status: "aprovado",
          },
          {
            label: "Contato",
            href: FOOTER_NAV_ROUTES.contato,
            status: "provisorio",
          },
        ],
      },
      {
        key: "legal",
        title: "LEGAL",
        links: [
          {
            label: "Termos de Uso",
            href: FOOTER_NAV_ROUTES.termosDeUso,
            status: "aprovado-dependente",
          },
          {
            label: "Política de Privacidade",
            href: FOOTER_NAV_ROUTES.politicaDePrivacidade,
            status: "aprovado-dependente",
          },
          {
            label: "Política de Cookies",
            href: FOOTER_NAV_ROUTES.politicaDeCookies,
            status: "aprovado-dependente",
          },
        ],
      },
      {
        key: "acesso",
        title: "ACESSO",
        links: [
          {
            label: "Entrar",
            href: FOOTER_NAV_ROUTES.entrar,
            status: "aprovado",
          },
          {
            label: "Começar agora",
            href: FOOTER_NAV_ROUTES.criarConta,
            status: "aprovado",
          },
        ],
      },
    ],
    primaryAction: null,
    secondaryAction: {
      label: "Começar agora",
      href: ROUTES.cadastro,
      variant: "secondary",
    },
    cookiePreferencesLabel: COOKIE_PREFERENCES_ACTION.label,
    cookiePreferencesActionId: COOKIE_PREFERENCES_ACTION.actionId,
    contactSection: {
      status: "futuro",
      enabled: false,
      label: "Fale com o Legion Altaire",
      email: null,
    },
    microcopy: [
      "Plataforma de IA para estratégia, conteúdo, autoridade e execução editorial.",
    ],
    notes: [
      "O ano deve ser dinâmico na implementação.",
      "Não publicar contato@[dominio].com ou qualquer endereço fictício.",
      "O bloco de contato só deve ser renderizado quando o e-mail oficial estiver confirmado.",
      "Os links legais só podem ser publicados como destinos funcionais quando as páginas correspondentes existirem.",
      "“Preferências de Cookies” é uma ação, não uma rota.",
      "A política e o painel de cookies devem corresponder à implementação real de cookies, analytics, pixels e tecnologias semelhantes.",
      "O CTA do Footer não deve competir com o CTA final.",
    ],
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Helpers Utilitários de Consumo Editorial                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retorna apenas os itens do FAQ com status `"aprovado"`, impedindo que itens
 * com status `"futuro"` ou `"provisorio"` vazem para a interface pública.
 */
export function getPublishedFaqItems(): readonly FAQItem[] {
  return landingContent.faq.items;
}

/**
 * Formata a linha de copyright do rodapé com o ano atual dinâmico.
 */
export function formatFooterCopyright(
  year: number = new Date().getFullYear()
): string {
  return landingContent.footer.copyright.replace("{year}", String(year));
}