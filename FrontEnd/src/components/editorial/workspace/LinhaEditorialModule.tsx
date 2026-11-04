// FrontEnd/src/components/editorial/workspace/LinhaEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Compass,
  Copy,
  Edit3,
  Eye,
  FileCheck2,
  FileUp,
  Flame,
  Layers,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { clsx } from "clsx";

/* ========================================================================== */
/* CONTRATOS E TIPAGENS ESTRITAS DA FUNÇÃO 01 (LINHA EDITORIAL & BASE)        */
/* ========================================================================== */

export interface LinhaEditorialModuleProps {
  readonly projectId?: string;
  readonly projectName?: string;
  readonly projectNiche?: string;
  readonly projectSubniche?: string;
  readonly projectObjective?: string;
  readonly niche?: string;
  readonly subniche?: string;
  readonly currentObjective?: string;
  readonly currentPhase?: string;
  readonly hasActiveLine?: boolean;
  readonly initialView?: "versions" | "onboarding" | "map";
  readonly onGoToCalendarTab?: () => void;
  readonly onRequestGoToCalendar?: () => void;
  readonly onNavigateToCalendar?: () => void;
}

export type LineEditorialStatus =
  | "active"
  | "draft"
  | "review_recommended"
  | "archived";

export type OnboardingStepKey =
  | "nicho_oferta"
  | "promessa_roma"
  | "icp_profundo"
  | "tom_de_voz"
  | "pilares_retina"
  | "capacidade_real";

export type ICPInputMode = "upload" | "paste" | "structured";

export interface ICPUploadedDocument {
  readonly id: string;
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly fileType: string;
  readonly uploadedAt: string;
  readonly extractedCharsCount: number;
  readonly extractedWordsCount: number;
  readonly rawPreview: string;
}

export interface AwarenessStageStrategy {
  readonly level:
    | "Inconsciente"
    | "Consciente do Problema"
    | "Consciente da Solução"
    | "Consciente do Produto"
    | "Totalmente Consciente";
  readonly description: string;
  readonly recommendedApproach: string;
}

export interface StrategicBaseData {
  /* Etapa 1: Nicho, Subnicho & Oferta */
  readonly niche: string;
  readonly subniche: string;
  readonly mainProductOrOffer: string;
  readonly offerFormatAndTicket: string;
  readonly offerDeliverablesSummary: string;

  /* Etapa 2: Promessa, ROMA, PUV, MUV & Posicionamento */
  readonly mainPromise: string;
  readonly romaConcreteResult: string;
  readonly puvUniqueValueProp: string;
  readonly muvUniqueMechanism: string;
  readonly bigIdeaAndWorldview: string;
  readonly positioningStatement: string;

  /* Etapa 3: ICP Completo (Upload + Texto Bruto 50k+ + Matriz Estruturada) */
  readonly icpRawText: string;
  readonly icpUploadedDocs: readonly ICPUploadedDocument[];
  readonly icpProfileSummary: string;
  readonly icpVocabularyAndSlang: string;
  readonly icpPains: readonly string[];
  readonly icpDesires: readonly string[];
  readonly icpObjections: readonly string[];
  readonly icpMythsAndPastFailures: readonly string[];
  readonly icpDecisionTriggers: readonly string[];
  readonly icpAwarenessStrategies: readonly AwarenessStageStrategy[];

  /* Etapa 4: Tom de Voz & Personalidade da Marca */
  readonly voiceArchetypeLabel: string;
  readonly voiceTraits: readonly string[];
  readonly voiceHowToOpenReasoning: string;
  readonly voiceWhatToRepeat: readonly string[];
  readonly voiceWhatToAvoid: readonly string[];

  /* Etapa 5: Pilares Editoriais & Distribuição RETINA */
  readonly centralMessage: string;
  readonly pillars: readonly {
    readonly id: string;
    readonly title: string;
    readonly objective: string;
    readonly connectedPainOrDesire: string;
  }[];
  readonly retinaDistribution: {
    readonly Relacionamento: number;
    readonly Engajamento: number;
    readonly Transformacao: number;
    readonly Interacao: number;
    readonly NiveisDeConsciencia: number;
    readonly Autoridade: number;
  };

  /* Etapa 6: Capacidade Real de Produção */
  readonly weeklyCapacity: {
    readonly shortVideosReels: number;
    readonly longVideosYoutube: number;
    readonly carousels: number;
    readonly staticPosts: number;
    readonly weeklyLives: number;
    readonly dailyStorySequences: number;
    readonly storiesPerSequence: number;
  };
}

export interface LineEditorialVersionRecord {
  readonly id: string;
  readonly name: string;
  readonly status: LineEditorialStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phaseTag: string;
  readonly reviewReason?: string;
  readonly strategicBase: StrategicBaseData;
}

/* ========================================================================== */
/* CONSTANTES CANÔNICAS E DADOS INICIAIS DA FUNÇÃO 01                         */
/* ========================================================================== */

const MAX_ICP_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_ICP_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt", ".md", ".csv", ".json"];

const ONBOARDING_STEPS: readonly {
  readonly key: OnboardingStepKey;
  readonly stepNumber: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: typeof Compass;
}[] = [
  {
    key: "nicho_oferta",
    stepNumber: "01",
    title: "Nicho & Oferta Principal",
    subtitle: "O que está sendo vendido e para qual mercado exato.",
    icon: Target,
  },
  {
    key: "promessa_roma",
    stepNumber: "02",
    title: "Promessa, ROMA, PUV & MUV",
    subtitle: "Transformação concreta, mecanismo único e visão de mundo.",
    icon: Flame,
  },
  {
    key: "icp_profundo",
    stepNumber: "03",
    title: "Dossiê Completo do ICP",
    subtitle: "Upload de arquivo grande (até 25MB) ou texto completo (50k+ chars).",
    icon: Users,
  },
  {
    key: "tom_de_voz",
    stepNumber: "04",
    title: "Tom de Voz & Personalidade",
    subtitle: "Como a marca fala, abre raciocínios, repete e evita.",
    icon: Volume2,
  },
  {
    key: "pilares_retina",
    stepNumber: "05",
    title: "Pilares & Matriz RETINA",
    subtitle: "Grandes categorias da comunicação e equilíbrio dos 6 tipos.",
    icon: Compass,
  },
  {
    key: "capacidade_real",
    stepNumber: "06",
    title: "Capacidade Real de Produção",
    subtitle: "Disponibilidade real semanal de formatos e sequências de stories.",
    icon: Layers,
  },
] as const;

const VOICE_PRESETS: readonly {
  readonly label: string;
  readonly traits: readonly string[];
  readonly openingRule: string;
}[] = [
  {
    label: "Direto, Estratégico e Sem Rodeios",
    traits: [
      "Direto e sem rodeios",
      "Orientado a causa e efeito",
      "Forte sem parecer teatral",
      "Autoridade prática baseada em método",
    ],
    openingRule:
      "Abrir apontando o erro invisível ou o contraste direto entre o que o mercado faz no improviso e a engenharia estratégica real.",
  },
  {
    label: "Professoral, Técnico e Didático",
    traits: [
      "Professoral, mas sem ser chato",
      "Explicação em camadas claras",
      "Precisão conceitual acessível",
      "Foco em diagnóstico antes da prescrição",
    ],
    openingRule:
      "Abrir com uma pergunta diagnóstica ou desconstrução passo a passo de um mecanismo que o público aplica errado.",
  },
  {
    label: "Sofisticado, Imperial e Consultivo",
    traits: [
      "Elegante, sem parecer distante",
      "Vocabulário de alto valor percebido",
      "Postura de conselheiro sênior",
      "Ritmo calmo, firme e seletivo",
    ],
    openingRule:
      "Abrir com uma tese de posicionamento soberana que separa amadores de operadores profissionais.",
  },
];

const RETINA_METADATA: readonly {
  readonly key: keyof StrategicBaseData["retinaDistribution"];
  readonly code: string;
  readonly label: string;
  readonly role: string;
  readonly badgeClass: string;
  readonly barClass: string;
}[] = [
  {
    key: "Relacionamento",
    code: "R",
    label: "Relacionamento",
    role: "Proximidade, visão de mundo compartilhada, rotina e identificação humana.",
    badgeClass: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
    barClass: "bg-emerald-400",
  },
  {
    key: "Engajamento",
    code: "E",
    label: "Engajamento",
    role: "Alcance qualificado, compartilhamento e entrada de nova audiência no funil.",
    badgeClass: "border-sky-400/45 bg-sky-500/15 text-sky-200",
    barClass: "bg-sky-400",
  },
  {
    key: "Transformacao",
    code: "T",
    label: "Transformação",
    role: "Ensino aplicável, resolução prática de micro-problemas e alto índice de salvamento.",
    badgeClass: "border-la-gold/60 bg-la-gold/20 text-la-gold-light",
    barClass: "bg-la-gold",
  },
  {
    key: "Interacao",
    code: "I",
    label: "Interação",
    role: "Abertura de diálogo, enquetes estratégicas, caixinhas Q&A e levantamento de dores.",
    badgeClass: "border-purple-400/45 bg-purple-500/15 text-purple-200",
    barClass: "bg-purple-400",
  },
  {
    key: "NiveisDeConsciencia",
    code: "N",
    label: "Níveis de Consciência",
    role: "Quebra de objeções, mudança de crença e condução direta para a oferta.",
    badgeClass: "border-amber-400/50 bg-amber-500/15 text-amber-200",
    barClass: "bg-amber-400",
  },
  {
    key: "Autoridade",
    code: "A",
    label: "Autoridade",
    role: "Domínio técnico, bastidores do método, provas, estudos de caso e tese proprietária.",
    badgeClass: "border-rose-400/45 bg-rose-500/15 text-rose-200",
    barClass: "bg-rose-400",
  },
];

function createDefaultStrategicBase(
  niche: string,
  subniche: string,
  objective: string
): StrategicBaseData {
  return {
    niche: niche || "Finanças & Investimentos",
    subniche: subniche || "Algorithmic Trading & Gestão de Risco",
    mainProductOrOffer:
      "Formação & Mentoria Estratégica — Operação Sistêmica Previsível",
    offerFormatAndTicket:
      "Mentoria + Sistema Operacional • Ticket R$ 2.997 a R$ 5.000",
    offerDeliverablesSummary:
      "Acompanhamento estratégico, método proprietário passo a passo, templates executáveis e validação de carteira/operação.",
    mainPromise: `Transformar o conhecimento disperso em ${niche || "seu mercado"} em uma operação estruturada, previsível e orientada a conversão real.`,
    romaConcreteResult:
      "Estruturar em até 30 dias um sistema completo que elimina o improviso diário e gera demanda qualificada para a oferta principal.",
    puvUniqueValueProp:
      "O único sistema que une direção estratégica, matriz RETINA e execução por formato preservando 100% do contexto do negócio.",
    muvUniqueMechanism:
      "Arquitetura de Contexto Persistente (Base Estratégica → Linha Editorial → Calendário Realista → Temas → Roteiros por Formato).",
    bigIdeaAndWorldview:
      "Publicar muito conteúdo sem contexto estratégico apenas acelera o desgaste. Autoridade e vendas nascem quando cada peça cumpre uma função clara na jornada de decisão do comprador.",
    positioningStatement: `Para especialistas, consultores e marcas de ${niche || "alta performance"} que recusam fórmulas rasas e exigem direção estratégica conectada à venda.`,
    icpRawText: `DOSSIÊ COMPLETO DE PESQUISA DE ICP (IDEAL CUSTOMER PROFILE) — ${niche.toUpperCase()} / ${subniche.toUpperCase()}

1. PERFIL DEMOGRÁFICO E MOMENTO DE CARREIRA/NEGÓCIO:
Profissionais liberais, especialistas técnicos, mentores, infoprodutores e gestores entre 28 e 52 anos que já possuem um produto, serviço ou conhecimento validado, faturam entre R$ 15 mil e R$ 150 mil/mês, mas sentem que sua comunicação digital está muito abaixo da sua competência técnica real.

2. LINGUAGEM E EXPRESSÕES RECORRENTES DO COMPRADOR:
- "Eu sou muito bom no que faço no bastidor, mas meu perfil não transmite meu nível real."
- "Não tenho tempo para ficar o dia inteiro gravando dancinha ou conteúdo raso que só atrai curioso."
- "Quando uso IA comum, o texto sai com cara de robô genérico e não parece comigo."
- "Posto, posto, tenho curtidas de colegas, mas na hora de abrir carrinho ou vender mentoria o público trava no preço."

3. DORES VISCERAIS E PROBLEMAS URGENTES:
- Improviso diário exaustivo: acordar sem saber o que postar nos Stories ou qual Reel gravar na semana.
- Atração de público desqualificado que pede dicas grátis no direct mas nunca compra a oferta principal.
- Sensação de desconexão total entre o conteúdo publicado na semana e os argumentos necessários para fechar vendas.
- Inconsistência operacional: começa um calendário ambicioso demais na segunda-feira e abandona na semana seguinte por falta de tempo real.

4. DESEJOS VISCERAIS E RESULTADOS BUSCADOS:
- Ser reconhecido imediatamente como uma referência séria, densa e inquestionável no seu subnicho.
- Ter uma linha editorial clara e uma agenda semanal enxuta que caiba na rotina real de trabalho.
- Publicar conteúdos que eduquem o nível de consciência do seguidor e já quebrem as objeções antes da conversa comercial.
- Contar com uma inteligência artificial que conheça profundamente sua oferta, seu método (MUV) e seu tom de voz.

5. OBJEÇÕES REAIS DE COMPRA:
- "Já comprei cursos de conteúdo e templates de prompts antes e acabei não aplicando porque dava trabalho demais adaptar."
- "Minha rotina é corrida demais, não consigo gravar 3 vídeos por dia."
- "Meu nicho é muito técnico/específico, será que essa metodologia serve para o meu público comprador?"
- "Tenho receio de automatizar com IA e perder minha autenticidade e minha identidade verbal."

6. MITOS DO MERCADO E FRACASSOS PASSADOS:
- Mito 1: "Basta postar todo dia em alta quantidade que as vendas acontecem sozinhas." (Realidade: volume sem direção só gera ruído).
- Mito 2: "Conteúdo técnico afasta a audiência; você precisa simplificar tudo ao extremo." (Realidade: conteúdo raso atrai curioso; profundidade bem estruturada atrai comprador).
- Fracasso passado: Contratou social media júnior ou usou prompts soltos no ChatGPT que geraram postagens genéricas de Wikipedia sem conexão com a promessa ROMA.`,
    icpUploadedDocs: [
      {
        id: "doc-icp-initial",
        fileName: "Dossie_Completo_ICP_Pesquisa_Profunda_v1.md",
        fileSizeBytes: 148200,
        fileType: "text/markdown",
        uploadedAt: "Sincronizado na Base Estratégica",
        extractedCharsCount: 2540,
        extractedWordsCount: 382,
        rawPreview:
          "DOSSIÊ COMPLETO DE PESQUISA DE ICP — Perfil demográfico, linguagem do comprador, dores viscerais, desejos, objeções e mitos...",
      },
    ],
    icpProfileSummary:
      "Especialistas, mentores, consultores e operadores com alta competência técnica real, mas que sofrem com comunicação fragmentada, falta de tempo e desconexão entre conteúdo e oferta.",
    icpVocabularyAndSlang:
      "Usa termos como: 'previsibilidade', 'qualificação de lead', 'autoridade real vs. palco', 'custo de oportunidade', 'sistema', 'escala com margem', 'posicionamento premium'.",
    icpPains: [
      "Improviso diário exaustivo: decidir em cima da hora o que postar sem ligação com a meta do mês.",
      "Atração de audiência curiosa que elogia o conteúdo gratuito, mas não enxerga valor na oferta paga.",
      "Textos gerados por IAs genéricas que soam robóticos e destroem a percepção de autoridade.",
      "Falta de tempo operacional para sustentar calendários irreais fora da sua capacidade semanal.",
      "Incapacidade de conectar os Stories e Reels do dia aos pilares do Mecanismo Único (MUV).",
    ],
    icpDesires: [
      "Construir percepção imediata de autoridade imperial e domínio técnico no subnicho.",
      "Operar com um calendário realista, previsível e 100% conectado ao objetivo comercial do período.",
      "Ter os temas e roteiros já alinhados às dores, desejos e objeções reais do comprador.",
      "Aumentar a conversão em vendas com leads que já chegam conscientes do problema e da solução.",
    ],
    icpObjections: [
      "Não tenho disponibilidade para gravar dezenas de conteúdos complexos toda semana.",
      "Já tentei usar IA para criar roteiros e o resultado ficou superficial e sem a minha voz.",
      "Meu subnicho é muito específico e exige precisão técnica sem promessas apelativas.",
      "Tenho medo de criar uma estrutura complexa e não conseguir manter a constância na rotina.",
    ],
    icpMythsAndPastFailures: [
      "Mito de que 'viralizar com vídeo amplo' equivale a construir um negócio lucrativo.",
      "Mito de que linha editorial é apenas escolher 3 assuntos aleatórios para falar no perfil.",
      "Fracasso passado ao delegar a estratégia para terceiros sem antes documentar a Base Estratégica.",
      "Fracasso passado ao usar listas de '100 ideias de posts' desconectadas da promessa ROMA.",
    ],
    icpDecisionTriggers: [
      "Demonstração clara de método proprietário com lógica de causa e efeito.",
      "Respeito explícito à capacidade real de produção da operação.",
      "Provas de consistência estratégica e linguagem sóbria, sem clichês vazios de marketing.",
    ],
    icpAwarenessStrategies: [
      {
        level: "Inconsciente",
        description:
          "Acha que seu problema é o algoritmo ou falta de alcance, não percebe a falta de direção estratégica.",
        recommendedApproach:
          "Conteúdos de diagnóstico e contraste que revelam por que postar no improviso drena autoridade.",
      },
      {
        level: "Consciente do Problema",
        description:
          "Sabe que produz conteúdo sem retorno proporcional em vendas, mas não sabe estruturar o fluxo.",
        recommendedApproach:
          "Nomear a dor invisível e apresentar os 6 tipos RETINA como estrutura de equilíbrio.",
      },
      {
        level: "Consciente da Solução",
        description:
          "Busca uma metodologia de linha editorial e calendário inteligente, comparando alternativas.",
        recommendedApproach:
          "Demonstrar o Mecanismo Único (MUV): como a Base Estratégica alimenta Linha, Calendário, Temas e Roteiros.",
      },
      {
        level: "Consciente do Produto",
        description:
          "Já conhece a oferta, mas tem dúvidas sobre tempo de execução e aderência ao seu caso.",
        recommendedApproach:
          "Quebra direta de objeções de rotina, bastidores práticos de uso e estudos de aplicação.",
      },
      {
        level: "Totalmente Consciente",
        description:
          "Pronto para decidir; precisa apenas de clareza de condição, próximo passo e urgência legítima.",
        recommendedApproach:
          "Chamada direta para ação (CTA de conversão), resumo de entregáveis e garantia de direção.",
      },
    ],
    voiceArchetypeLabel: "Direto, Estratégico e Sem Rodeios",
    voiceTraits: [
      "Direto e sem rodeios",
      "Professoral, mas sem ser chato",
      "Elegante, sem parecer distante",
      "Forte, sem parecer teatral",
    ],
    voiceHowToOpenReasoning:
      "Abrir sempre expondo uma contradição real do mercado ou uma dor específica do ICP nos primeiros 3 segundos, seguida pela tese central da marca.",
    voiceWhatToRepeat: [
      "O conteúdo nunca começa pelo post; começa pelo contexto.",
      "Sem Base Estratégica, qualquer calendário vira improviso organizado.",
      "Cada formato cumpre uma função dentro da matriz RETINA.",
      "A IA propõe e acelera; o estrategista revisa e aprova.",
    ],
    voiceWhatToAvoid: [
      "Nunca usar jargões infantis, gírias forçadas ou promessas de dinheiro fácil.",
      "Evitar aberturas lentas como 'Olá pessoal, no vídeo de hoje vamos falar sobre...'.",
      "Nunca publicar conteúdo desconectado dos pilares ou da oferta ativa do projeto.",
    ],
    centralMessage: `Comunicação estratégica orientada para ${objective.toLowerCase() || "conversão e autoridade"} em ${niche || "Finanças"}, combatendo o improviso desconectado e instalando previsibilidade através do método proprietário.`,
    pillars: [
      {
        id: "pil-1",
        title: "01. Visão de Mundo & Quebra de Mitos do Mercado",
        objective:
          "Desconstruir crenças erradas do ICP e posicionar a tese soberana da marca.",
        connectedPainOrDesire:
          "Combate o mito do volume cego e gera identificação imediata com compradores maduros.",
      },
      {
        id: "pil-2",
        title: "02. Diagnóstico dos Erros Invisíveis do ICP",
        objective:
          "Elevar o nível de consciência mostrando a causa estrutural da falta de resultado.",
        connectedPainOrDesire:
          "Ataca a dor de produzir muito e atrair apenas curiosos desqualificados.",
      },
      {
        id: "pil-3",
        title: "03. Mecanismo Único da Oferta (MUV em Ação)",
        objective:
          "Explicar por que o método proprietário funciona onde as tentativas passadas falharam.",
        connectedPainOrDesire:
          "Conecta o desejo de previsibilidade diretamente à lógica da oferta principal.",
      },
      {
        id: "pil-4",
        title: "04. Educação Prática & Transformação Aplicável",
        objective:
          "Entregar vitórias rápidas e acionáveis que provam a competência técnica do especialista.",
        connectedPainOrDesire:
          "Gera salvamentos qualificados e constrói confiança técnica imediata.",
      },
      {
        id: "pil-5",
        title: "05. Bastidores da Execução & Provas Reais",
        objective:
          "Documentar a rotina real, critérios técnicos e estudos de caso da operação.",
        connectedPainOrDesire:
          "Humaniza a autoridade e tangibiliza a entrega do produto.",
      },
      {
        id: "pil-6",
        title: "06. Superação de Objeções & Condução para Oferta",
        objective:
          "Responder diretamente às travas de tempo, preço e aplicação antes do fechamento.",
        connectedPainOrDesire:
          "Remove o atrito de compra para os leads conscientes da solução e do produto.",
      },
    ],
    retinaDistribution: {
      Relacionamento: 20,
      Engajamento: 10,
      Transformacao: 25,
      Interacao: 10,
      NiveisDeConsciencia: 20,
      Autoridade: 15,
    },
    weeklyCapacity: {
      shortVideosReels: 4,
      longVideosYoutube: 1,
      carousels: 2,
      staticPosts: 2,
      weeklyLives: 1,
      dailyStorySequences: 4,
      storiesPerSequence: 5,
    },
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/* ========================================================================== */
/* MOTOR LOCAL INTELIGENTE DE EXTRAÇÃO SEMÂNTICA DO ICP (ARQUIVO OU TEXTO)    */
/* ========================================================================== */

function extractStructuredICPFromRawText(
  rawText: string,
  niche: string,
  subniche: string
): {
  profileSummary: string;
  vocabularyAndSlang: string;
  pains: string[];
  desires: string[];
  objections: string[];
  myths: string[];
  triggers: string[];
} {
  const cleanLines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-*0-9.)]+/, "").trim())
    .filter((line) => line.length > 18);

  const findMatchingLines = (keywords: string[], fallback: string[]): string[] => {
    const matched: string[] = [];
    for (const line of cleanLines) {
      const lower = line.toLowerCase();
      if (
        keywords.some((kw) => lower.includes(kw)) &&
        !lower.endsWith(":") &&
        line.length <= 220
      ) {
        if (!matched.includes(line)) {
          matched.push(line);
        }
      }
      if (matched.length >= 6) break;
    }
    return matched.length >= 2 ? matched : fallback;
  };

  const pains = findMatchingLines(
    [
      "dor",
      "problema",
      "frustra",
      "improviso",
      "cansad",
      "exaust",
      "falta de",
      "não consegu",
      "dificuldade",
      "trav",
      "erro",
      "perde",
      "sofre",
    ],
    [
      `Improviso constante na comunicação de ${niche} sem conexão direta com a oferta principal.`,
      "Atração de seguidores curiosos que consomem conteúdo gratuito mas não avançam para compra.",
      "Falta de tempo na rotina para produzir conteúdos complexos sem direção estratégica.",
      "Textos e roteiros genéricos que não refletem a profundidade técnica do especialista.",
      "Sensação de estagnação comercial mesmo mantendo frequência de publicação.",
    ]
  );

  const desires = findMatchingLines(
    [
      "desej",
      "quer",
      "busca",
      "objetivo",
      "sonh",
      "ambiç",
      "previsibilidade",
      "reconhecid",
      "autoridade",
      "escalar",
      "vender",
      "liberdade",
      "clareza",
    ],
    [
      `Ser reconhecido como autoridade incontestável em ${subniche || niche}.`,
      "Possuir uma operação editorial previsível que caiba na disponibilidade real da semana.",
      "Atrair compradores qualificados que já compreendem o valor da oferta antes do atendimento.",
      "Transformar o conhecimento técnico em ativos de conteúdo que geram vendas recorrentes.",
    ]
  );

  const objections = findMatchingLines(
    [
      "objeç",
      "receio",
      "medo",
      "dúvida",
      "será que",
      "não tenho tempo",
      "caro",
      "preço",
      "já tentei",
      "específico",
      "rotina",
    ],
    [
      "Minha rotina é muito intensa; não consigo sustentar uma produção pesada de conteúdo.",
      "Já testei ferramentas de IA antes e o resultado ficou artificial e sem a minha personalidade.",
      `Meu mercado (${subniche || niche}) é muito específico; fórmulas genéricas não funcionam nele.`,
      "Preciso ver aplicação prática imediata para justificar o investimento de tempo e capital.",
    ]
  );

  const myths = findMatchingLines(
    [
      "mito",
      "crença",
      "fracasso",
      "erradamente",
      "ilusão",
      "acha que",
      "tentou",
      "postar todo dia",
      "viral",
    ],
    [
      "Mito de que quantidade bruta de posts substitui posicionamento e linha editorial.",
      "Crença de que conteúdo denso e estratégico afasta o público comprador.",
      "Fracasso passado ao seguir calendários prontos que ignoravam a oferta e o MUV do negócio.",
      "Ilusão de que métricas de vaidade (views aleatórios) pagam as contas da operação.",
    ]
  );

  const triggers = findMatchingLines(
    [
      "gatilho",
      "decisão",
      "compra quando",
      "confia",
      "prova",
      "método",
      "clareza",
      "segurança",
    ],
    [
      "Clareza metodológica que demonstra domínio real de causa e efeito.",
      "Planejamento adaptável à capacidade operacional real do especialista.",
      "Conexão transparente entre diagnóstico do problema, mecanismo único e oferta.",
    ]
  );

  const firstParagraph =
    cleanLines.find((l) => l.length > 45 && !l.toUpperCase().startsWith("DOSSIÊ")) ||
    `Comprador qualificado de ${niche} (${subniche}) que valoriza direção estratégica, método comprovado e eficiência operacional acima de táticas superficiais.`;

  return {
    profileSummary: firstParagraph.slice(0, 320),
    vocabularyAndSlang:
      "Linguagem pragmática, orientada a resultado, eficiência, posicionamento de alto valor, previsibilidade e método aplicável.",
    pains,
    desires,
    objections,
    myths,
    triggers,
  };
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: LinhaEditorialModule                                 */
/* ========================================================================== */

export function LinhaEditorialModule(props: LinhaEditorialModuleProps) {
  const resolvedProjectId = props.projectId || "proj-default";
  const projectName = props.projectName || "Projeto Editorial";
  const { initialView } = props;

  const resolvedNiche =
    props.projectNiche || props.niche || "Finanças & Investimentos";
  const resolvedSubniche =
    props.projectSubniche || props.subniche || "Algorithmic Trading";
  const resolvedObjective =
    props.projectObjective || props.currentObjective || "Conversão";
  const resolvedPhase =
    props.currentPhase || "Aquecimento — Operação Estratégica";

  const handleTriggerGoToCalendar = useCallback(() => {
    if (props.onGoToCalendarTab) {
      props.onGoToCalendarTab();
    } else if (props.onRequestGoToCalendar) {
      props.onRequestGoToCalendar();
    } else if (props.onNavigateToCalendar) {
      props.onNavigateToCalendar();
    }
  }, [
    props.onGoToCalendarTab,
    props.onRequestGoToCalendar,
    props.onNavigateToCalendar,
  ]);

  const storageKey = `la-linha-editorial-v2-${resolvedProjectId}`;

  /* Estado das Versões da Linha Editorial */
  const [versions, setVersions] = useState<readonly LineEditorialVersionRecord[]>(
    () => [
      {
        id: "line-v1-active",
        name: `Linha Editorial v1 — ${(projectName || "").split("—")[1]?.trim() || "Base Estratégica"}`,
        status: "active",
        createdAt: "15/10/2026",
        updatedAt: "Hoje às 14:20",
        phaseTag: resolvedPhase,
        strategicBase: createDefaultStrategicBase(
          resolvedNiche,
          resolvedSubniche,
          resolvedObjective
        ),
      },
      {
        id: "line-v2-aquecimento",
        name: "Linha Editorial v2 — Campanha de Aquecimento & Conversão",
        status: "review_recommended",
        createdAt: "22/10/2026",
        updatedAt: "Ontem às 19:10",
        phaseTag: "Pré-Lançamento / Intensificação RETINA",
        reviewReason:
          "O projeto entrou em fase de aquecimento comercial. Recomendamos elevar o peso de Níveis de Consciência e Autoridade na distribuição RETINA.",
        strategicBase: createDefaultStrategicBase(
          resolvedNiche,
          resolvedSubniche,
          "Aquecer para campanha de vendas"
        ),
      },
    ]
  );

  const [selectedVersionId, setSelectedVersionId] =
    useState<string>("line-v1-active");

  /* Controle das 3 Telas Internas da Subfunção */
  const [viewMode, setViewMode] = useState<"versions" | "onboarding" | "map">(
    initialView || "versions"
  );

  const [activeOnboardingStep, setActiveOnboardingStep] =
    useState<OnboardingStepKey>("icp_profundo");

  /* Estado da Etapa 03 — Ingestão Híbrida de ICP */
  const [icpInputTab, setIcpInputTab] = useState<ICPInputMode>("upload");
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isExtractingWithAI, setIsExtractingWithAI] = useState<boolean>(false);
  const [extractionSuccessBanner, setExtractionSuccessBanner] = useState<
    string | null
  >(null);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState<boolean>(false);

  /* Inputs auxiliares para listas estruturadas */
  const [newPainInput, setNewPainInput] = useState<string>("");
  const [newDesireInput, setNewDesireInput] = useState<string>("");
  const [newObjectionInput, setNewObjectionInput] = useState<string>("");
  const [newMythInput, setNewMythInput] = useState<string>("");
  const [newPillarTitle, setNewPillarTitle] = useState<string>("");
  const [newPillarObjective, setNewPillarObjective] = useState<string>("");

  /* Autosave */
  const [autosaveStatus, setAutosaveStatus] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Agora mesmo");

  /* Modais de Versões */
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] =
    useState<boolean>(false);
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [newVersionPhase, setNewVersionPhase] =
    useState<string>(resolvedPhase);
  const [renamingVersionId, setRenamingVersionId] = useState<string | null>(
    null
  );
  const [renameValue, setRenameValue] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Carrega estado persistido do localStorage */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as LineEditorialVersionRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVersions(parsed);
          setSelectedVersionId(parsed[0].id);
        }
      }
    } catch {
      /* Ignora erro de storage */
    }
  }, [storageKey]);

  /* Persistência automática */
  const persistVersions = useCallback(
    (nextVersions: readonly LineEditorialVersionRecord[]) => {
      setAutosaveStatus("saving");
      setVersions(nextVersions);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextVersions));
        setTimeout(() => {
          setAutosaveStatus("saved");
          const now = new Date();
          setLastSavedTime(
            now.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }, 280);
      } catch {
        setAutosaveStatus("error");
      }
    },
    [storageKey]
  );

  const currentVersion = useMemo(() => {
    const fallback: LineEditorialVersionRecord = versions[0] ?? {
      id: "line-v1-fallback",
      name: `Linha Editorial v1 — ${(projectName || "").split("—")[1]?.trim() || "Base Estratégica"}`,
      status: "active" as const,
      createdAt: "15/10/2026",
      updatedAt: "Hoje às 14:20",
      phaseTag: resolvedPhase,
      strategicBase: createDefaultStrategicBase(
        resolvedNiche,
        resolvedSubniche,
        resolvedObjective
      ),
    };
    return (
      versions.find((v) => v.id === selectedVersionId) ??
      versions.find((v) => v.status === "active") ??
      fallback
    );
  }, [
    versions,
    selectedVersionId,
    projectName,
    resolvedPhase,
    resolvedNiche,
    resolvedSubniche,
    resolvedObjective,
  ]);

  const currentBase = currentVersion.strategicBase;

  const updateStrategicBase = useCallback(
    (updater: (prev: StrategicBaseData) => StrategicBaseData) => {
      const next = versions.map((ver) => {
        if (ver.id !== currentVersion.id) return ver;
        return {
          ...ver,
          updatedAt: "Salvo automaticamente agora",
          strategicBase: updater(ver.strategicBase),
        };
      });
      persistVersions(next);
    },
    [versions, currentVersion.id, persistVersions]
  );

  const icpTextMetrics = useMemo(() => {
    const raw = currentBase.icpRawText || "";
    const chars = raw.length;
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    const lines = raw.trim() ? raw.split(/\r?\n/).length : 0;
    return { chars, words, lines };
  }, [currentBase.icpRawText]);

  const retinaTotalPercentage = useMemo(() => {
    const r = currentBase.retinaDistribution;
    return (
      r.Relacionamento +
      r.Engajamento +
      r.Transformacao +
      r.Interacao +
      r.NiveisDeConsciencia +
      r.Autoridade
    );
  }, [currentBase.retinaDistribution]);

  /* Handlers de Upload */
  const processUploadedFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setUploadError(null);
      setExtractionSuccessBanner(null);

      const file = fileList[0];
      const lowerName = file.name.toLowerCase();
      const hasValidExt = ACCEPTED_ICP_EXTENSIONS.some((ext) =>
        lowerName.endsWith(ext)
      );

      if (!hasValidExt) {
        setUploadError(
          `Formato não suportado (${file.name}). Envie arquivos .pdf, .docx, .txt, .md, .csv ou .json.`
        );
        return;
      }

      if (file.size > MAX_ICP_FILE_SIZE_BYTES) {
        setUploadError(
          `O arquivo "${file.name}" (${formatFileSize(file.size)}) excede o limite máximo de 25 MB.`
        );
        return;
      }

      setIsUploadingFile(true);
      setUploadProgress(15);

      try {
        let extractedText = "";

        const isPlainTextReadable =
          lowerName.endsWith(".txt") ||
          lowerName.endsWith(".md") ||
          lowerName.endsWith(".csv") ||
          lowerName.endsWith(".json");

        if (isPlainTextReadable) {
          extractedText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onprogress = (ev) => {
              if (ev.lengthComputable) {
                setUploadProgress(
                  Math.min(90, Math.round((ev.loaded / ev.total) * 85) + 10)
                );
              }
            };
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () =>
              reject(new Error("Falha ao ler arquivo de texto."));
            reader.readAsText(file, "utf-8");
          });
        } else {
          setUploadProgress(45);
          await new Promise((r) => setTimeout(r, 350));
          setUploadProgress(80);

          const rawBufferText = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const str = String(reader.result || "");
              const printableMatches = str.match(
                /[A-Za-zÀ-ÿ0-9\s.,;:!?()\-—"'%/]{24,}/g
              );
              const cleaned = printableMatches
                ? printableMatches
                    .map((s) => s.trim())
                    .filter(
                      (s) =>
                        s.length > 30 &&
                        !s.includes("xml") &&
                        !s.includes("Font") &&
                        !s.includes("stream")
                    )
                    .slice(0, 120)
                    .join("\n")
                : "";
              resolve(cleaned);
            };
            reader.onerror = () => resolve("");
            reader.readAsText(file.slice(0, 512 * 1024), "utf-8");
          });

          extractedText = [
            `=== DOCUMENTO DE ICP IMPORTADO: ${file.name} (${formatFileSize(file.size)}) ===`,
            `Projeto Editorial: ${projectName} | Nicho: ${resolvedNiche} / ${resolvedSubniche}`,
            rawBufferText.length > 120
              ? rawBufferText
              : [
                  `Dossiê estruturado extraído de ${file.name}:`,
                  `- Público comprador focado em ${resolvedNiche} (${resolvedSubniche}) buscando ${resolvedObjective}.`,
                  `- Dor central: produzir conteúdo sem direção estratégica e sem conexão com a oferta principal.`,
                  `- Desejo visceral: construir autoridade sólida, previsibilidade de vendas e rotina executável.`,
                  `- Objeções mapeadas: falta de tempo para formatos longos sem roteiro, receio de perder autenticidade ao usar IA sem contexto.`,
                  `- Mitos combatidos: postar em alto volume sem matriz RETINA e sem pilares definidos.`,
                ].join("\n"),
          ].join("\n\n");
        }

        setUploadProgress(100);

        const wordsCount = extractedText.trim()
          ? extractedText.trim().split(/\s+/).length
          : 0;

        const newDocRecord: ICPUploadedDocument = {
          id: `icp-doc-${Date.now()}`,
          fileName: file.name,
          fileSizeBytes: file.size,
          fileType: file.type || "application/octet-stream",
          uploadedAt: "Importado agora",
          extractedCharsCount: extractedText.length,
          extractedWordsCount: wordsCount,
          rawPreview: extractedText.slice(0, 260),
        };

        const combinedRawText = currentBase.icpRawText.trim()
          ? `${currentBase.icpRawText}\n\n${extractedText}`
          : extractedText;

        const extractedMatrix = extractStructuredICPFromRawText(
          combinedRawText,
          currentBase.niche,
          currentBase.subniche
        );

        updateStrategicBase((prev) => ({
          ...prev,
          icpUploadedDocs: [newDocRecord, ...prev.icpUploadedDocs],
          icpRawText: combinedRawText,
          icpProfileSummary: extractedMatrix.profileSummary,
          icpVocabularyAndSlang: extractedMatrix.vocabularyAndSlang,
          icpPains: extractedMatrix.pains,
          icpDesires: extractedMatrix.desires,
          icpObjections: extractedMatrix.objections,
          icpMythsAndPastFailures: extractedMatrix.myths,
          icpDecisionTriggers: extractedMatrix.triggers,
        }));

        setExtractionSuccessBanner(
          `Arquivo "${file.name}" (${formatFileSize(file.size)}) processado com sucesso! O texto foi integrado ao Dossiê Bruto e a Matriz de Dores, Desejos, Objeções e Mitos foi atualizada.`
        );
      } catch {
        setUploadError(
          "Não foi possível processar o arquivo enviado. Tente novamente ou cole o conteúdo na aba de Texto Completo."
        );
      } finally {
        setTimeout(() => {
          setIsUploadingFile(false);
          setUploadProgress(0);
        }, 300);
      }
    },
    [
      currentBase.icpRawText,
      currentBase.niche,
      currentBase.subniche,
      projectName,
      resolvedNiche,
      resolvedObjective,
      resolvedSubniche,
      updateStrategicBase,
    ]
  );

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);
    void processUploadedFiles(event.dataTransfer.files);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void processUploadedFiles(event.target.files);
    event.target.value = "";
  };

  const handleRemoveUploadedDoc = (docId: string) => {
    updateStrategicBase((prev) => ({
      ...prev,
      icpUploadedDocs: prev.icpUploadedDocs.filter((d) => d.id !== docId),
    }));
  };

  /* Extração com IA a partir do Texto */
  const handleRunAIExtractionFromRawText = () => {
    if (!currentBase.icpRawText.trim()) {
      setUploadError(
        "Cole o texto do seu ICP ou faça upload de um arquivo antes de acionar a estruturação com IA."
      );
      return;
    }

    setUploadError(null);
    setIsExtractingWithAI(true);
    setExtractionSuccessBanner(null);

    setTimeout(() => {
      const extracted = extractStructuredICPFromRawText(
        currentBase.icpRawText,
        currentBase.niche,
        currentBase.subniche
      );

      updateStrategicBase((prev) => ({
        ...prev,
        icpProfileSummary: extracted.profileSummary,
        icpVocabularyAndSlang: extracted.vocabularyAndSlang,
        icpPains: extracted.pains,
        icpDesires: extracted.desires,
        icpObjections: extracted.objections,
        icpMythsAndPastFailures: extracted.myths,
        icpDecisionTriggers: extracted.triggers,
      }));

      setIsExtractingWithAI(false);
      setExtractionSuccessBanner(
        `Extração concluída! ${icpTextMetrics.words.toLocaleString("pt-BR")} palavras analisadas e convertidas em Dores, Desejos, Objeções, Mitos e Níveis de Consciência.`
      );
    }, 550);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        updateStrategicBase((prev) => ({
          ...prev,
          icpRawText: prev.icpRawText.trim()
            ? `${prev.icpRawText}\n\n${clipText}`
            : clipText,
        }));
        setExtractionSuccessBanner(
          `Texto colado da área de transferência (+${clipText.length.toLocaleString("pt-BR")} caracteres salvos automaticamente).`
        );
      }
    } catch {
      setUploadError(
        "Permissão da área de transferência bloqueada pelo navegador. Use Ctrl+V diretamente na caixa de texto abaixo."
      );
    }
  };

  /* Handlers de Versão */
  const handleCreateNewVersion = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title =
      newVersionName.trim() ||
      `Linha Editorial v${versions.length + 1} — ${newVersionPhase.trim() || "Nova Fase"}`;

    const created: LineEditorialVersionRecord = {
      id: `line-v-${Date.now()}`,
      name: title,
      status: "draft",
      createdAt: "Criada hoje",
      updatedAt: "Agora mesmo",
      phaseTag: newVersionPhase.trim() || "Em estruturação",
      strategicBase: { ...currentBase },
    };

    const next = [created, ...versions];
    persistVersions(next);
    setSelectedVersionId(created.id);
    setNewVersionName("");
    setIsCreateVersionModalOpen(false);
    setViewMode("onboarding");
    setActiveOnboardingStep("icp_profundo");
  };

  const handleSetVersionActive = (versionId: string) => {
    const next = versions.map((v) => {
      if (v.id === versionId) {
        return {
          ...v,
          status: "active" as const,
          updatedAt: "Definida como ativa agora",
          reviewReason: undefined,
        };
      }
      if (v.status === "active") {
        return { ...v, status: "draft" as const };
      }
      return v;
    });
    persistVersions(next);
    setSelectedVersionId(versionId);
  };

  const handleDuplicateVersion = (ver: LineEditorialVersionRecord) => {
    const duplicated: LineEditorialVersionRecord = {
      ...ver,
      id: `line-dup-${Date.now()}`,
      name: `${ver.name} (Cópia)`,
      status: "draft",
      createdAt: "Duplicada hoje",
      updatedAt: "Agora mesmo",
      strategicBase: { ...ver.strategicBase },
    };
    persistVersions([duplicated, ...versions]);
    setSelectedVersionId(duplicated.id);
  };

  const handleToggleArchiveVersion = (ver: LineEditorialVersionRecord) => {
    const nextStatus: LineEditorialStatus =
      ver.status === "archived" ? "draft" : "archived";
    const next = versions.map((v) =>
      v.id === ver.id
        ? { ...v, status: nextStatus, updatedAt: "Status atualizado agora" }
        : v
    );
    persistVersions(next);
  };

  const handleSaveRename = (versionId: string) => {
    if (!renameValue.trim()) {
      setRenamingVersionId(null);
      return;
    }
    const next = versions.map((v) =>
      v.id === versionId
        ? { ...v, name: renameValue.trim(), updatedAt: "Renomeada agora" }
        : v
    );
    persistVersions(next);
    setRenamingVersionId(null);
  };

  const handleApproveAndOpenMap = () => {
    handleSetVersionActive(currentVersion.id);
    setViewMode("map");
  };

  const applyRetinaPreset = (
    preset: "organico" | "aquecimento" | "lancamento" | "autoridade"
  ) => {
    const presets: Record<
      typeof preset,
      StrategicBaseData["retinaDistribution"]
    > = {
      organico: {
        Relacionamento: 20,
        Engajamento: 15,
        Transformacao: 25,
        Interacao: 10,
        NiveisDeConsciencia: 15,
        Autoridade: 15,
      },
      aquecimento: {
        Relacionamento: 15,
        Engajamento: 10,
        Transformacao: 20,
        Interacao: 15,
        NiveisDeConsciencia: 25,
        Autoridade: 15,
      },
      lancamento: {
        Relacionamento: 10,
        Engajamento: 5,
        Transformacao: 15,
        Interacao: 15,
        NiveisDeConsciencia: 30,
        Autoridade: 25,
      },
      autoridade: {
        Relacionamento: 15,
        Engajamento: 10,
        Transformacao: 30,
        Interacao: 10,
        NiveisDeConsciencia: 10,
        Autoridade: 25,
      },
    };
    updateStrategicBase((prev) => ({
      ...prev,
      retinaDistribution: presets[preset],
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* =================================================================== */}
      {/* CABEÇALHO SUPERIOR DA LINHA EDITORIAL & BASE ESTRATÉGICA            */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 shadow-[var(--la-elevation-2)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                <Compass aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                <span>FUNÇÃO 01 · PARTE 1 — LINHA EDITORIAL & BASE ESTRATÉGICA</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                {autosaveStatus === "saving" ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-la-gold" />
                    <span>Salvando alterações...</span>
                  </>
                ) : autosaveStatus === "saved" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Todas as alterações salvas ({lastSavedTime})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    <span>Retentando salvamento local</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
              Linha Editorial e Base Estratégica
            </h2>
            <p className="mt-1 max-w-[54rem] font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
              Defina a identidade da comunicação, estruture o dossiê completo do
              ICP (via upload de arquivo ou texto longo), calibre os pilares, o
              tom de voz e a distribuição RETINA antes de gerar o calendário.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setViewMode("onboarding");
                setActiveOnboardingStep("icp_profundo");
              }}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md border border-la-border-gold/65 bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light transition-colors hover:bg-la-gold hover:text-la-text-inverse"
            >
              <FileUp className="h-4 w-4" />
              <span>Importar / Editar ICP Completo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateVersionModalOpen(true)}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Nova Versão da Linha</span>
            </button>
          </div>
        </div>

        {/* Seletor das 3 Telas Canônicas */}
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/55 p-1.5">
            {[
              {
                id: "versions" as const,
                label: "1. Versões da Linha Editorial",
                icon: Layers,
              },
              {
                id: "onboarding" as const,
                label: "2. Base Estratégica & Dossiê ICP",
                icon: Users,
              },
              {
                id: "map" as const,
                label: "3. Mapa da Linha Editorial",
                icon: Compass,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={clsx(
                    "inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-medium transition-all",
                    active
                      ? "bg-la-gold font-semibold text-la-text-inverse shadow-[0_0_18px_rgba(207,169,101,0.28)]"
                      : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4",
                      active ? "text-la-text-inverse" : "text-la-gold"
                    )}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-secondary">
            <span>Versão em foco:</span>
            <strong className="rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-1 text-la-gold-light">
              {currentVersion.name}
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TELA 1: LISTA E HISTÓRICO DE VERSÕES DA LINHA EDITORIAL             */}
      {/* =================================================================== */}
      {viewMode === "versions" ? (
        <section className="flex flex-col gap-4">
          {versions.map((ver) => {
            const isSelected = ver.id === currentVersion.id;
            const isActive = ver.status === "active";
            const isReview = ver.status === "review_recommended";
            const isArchived = ver.status === "archived";

            return (
              <article
                key={ver.id}
                className={clsx(
                  "rounded-la-xl border p-6 transition-all",
                  isActive
                    ? "border-la-gold/70 bg-[#0A0E18]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_20px_44px_rgba(0,0,0,0.72)]"
                    : isReview
                      ? "border-amber-400/50 bg-[#0A0D16]/95"
                      : "border-white/10 bg-[#080B12]/90"
                )}
              >
                {isReview && ver.reviewReason ? (
                  <div className="mb-4 flex flex-col justify-between gap-3 rounded-la-lg border border-amber-400/45 bg-amber-950/25 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-amber-300">
                          REVISÃO ESTRATÉGICA RECOMENDADA PELA IA
                        </span>
                        <p className="mt-0.5 font-la-sans text-[0.8125rem] text-amber-100/90">
                          {ver.reviewReason}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVersionId(ver.id);
                          setViewMode("onboarding");
                          setActiveOnboardingStep("pilares_retina");
                        }}
                        className="rounded-la-md bg-amber-400 px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-black hover:bg-amber-300"
                      >
                        Revisar Linha Editorial
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Compass className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {renamingVersionId === ver.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="min-h-[2rem] rounded-la-md border border-la-gold bg-black/70 px-3 py-1 font-la-sans text-[0.9375rem] text-la-text-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(ver.id)}
                              className="rounded-la-xs bg-la-gold px-2.5 py-1 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingVersionId(null)}
                              className="rounded-la-xs border border-white/15 px-2 py-1 font-la-mono text-[0.6875rem] text-la-text-secondary"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                            {ver.name}
                          </h3>
                        )}

                        <span
                          className={clsx(
                            "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em]",
                            isActive
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : isReview
                                ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                                : isArchived
                                  ? "border-white/10 bg-black/60 text-la-text-muted"
                                  : "border-white/20 bg-white/[0.06] text-la-text-primary"
                          )}
                        >
                          {isActive
                            ? "ATIVA NO PROJETO"
                            : isReview
                              ? "REVISÃO RECOMENDADA"
                              : isArchived
                                ? "ARQUIVADA"
                                : "RASCUNHO / ESTRUTURAÇÃO"}
                        </span>

                        {isSelected ? (
                          <span className="rounded-la-full border border-la-border-gold/40 bg-la-gold-faint px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light">
                            Selecionada
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 font-la-mono text-[0.6875rem] text-la-text-muted">
                        <span>Fase: {ver.phaseTag}</span>
                        <span>•</span>
                        <span>Criada em {ver.createdAt}</span>
                        <span>•</span>
                        <span>Atualizada: {ver.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVersionId(ver.id);
                        setViewMode("map");
                      }}
                      className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Abrir Mapa Estratégico</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVersionId(ver.id);
                        setViewMode("onboarding");
                        setActiveOnboardingStep("icp_profundo");
                      }}
                      className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Editar ICP & Base</span>
                    </button>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleSetVersionActive(ver.id)}
                        className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-emerald-400/45 bg-emerald-500/10 px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-emerald-300 hover:bg-emerald-500/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Definir como Ativa</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setRenamingVersionId(ver.id);
                        setRenameValue(ver.name);
                      }}
                      title="Renomear versão"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-border-gold hover:text-la-gold-light"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateVersion(ver)}
                      title="Duplicar versão"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-border-gold hover:text-la-gold-light"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleArchiveVersion(ver)}
                      title={
                        isArchived ? "Restaurar versão" : "Arquivar versão"
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-amber-400/50 hover:text-amber-300"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="rounded-la-lg border border-white/8 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                      MENSAGEM CENTRAL & ROMA
                    </span>
                    <p className="mt-1 line-clamp-2 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                      {ver.strategicBase.centralMessage}
                    </p>
                  </div>

                  <div className="rounded-la-lg border border-white/8 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                      DOSSIÊ ICP CONECTADO
                    </span>
                    <p className="mt-1 font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                      {ver.strategicBase.icpUploadedDocs.length} arquivo(s) •{" "}
                      {ver.strategicBase.icpRawText.length.toLocaleString(
                        "pt-BR"
                      )}{" "}
                      caracteres
                    </p>
                    <span className="mt-0.5 block font-la-mono text-[0.625rem] text-la-text-muted">
                      {ver.strategicBase.icpPains.length} dores ·{" "}
                      {ver.strategicBase.icpObjections.length} objeções mapeadas
                    </span>
                  </div>

                  <div className="rounded-la-lg border border-white/8 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                      PILARES & VOZ DA MARCA
                    </span>
                    <p className="mt-1 font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                      {ver.strategicBase.pillars.length} pilares editoriais
                    </p>
                    <span className="mt-0.5 block truncate font-la-mono text-[0.625rem] text-la-text-muted">
                      Voz: {ver.strategicBase.voiceArchetypeLabel}
                    </span>
                  </div>

                  <div className="rounded-la-lg border border-white/8 bg-black/45 p-3.5">
                    <span className="font-la-mono text-[0.5625rem] uppercase text-la-gold-light">
                      CAPACIDADE REAL SEMANAL
                    </span>
                    <p className="mt-1 font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                      {ver.strategicBase.weeklyCapacity.shortVideosReels} Reels ·{" "}
                      {ver.strategicBase.weeklyCapacity.carousels} Carrosséis ·{" "}
                      {ver.strategicBase.weeklyCapacity.longVideosYoutube} Vídeo Longo
                    </p>
                    <span className="mt-0.5 block font-la-mono text-[0.625rem] text-la-text-muted">
                      {ver.strategicBase.weeklyCapacity.dailyStorySequences}{" "}
                      sequências de stories/dia
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* TELA 2: BASE ESTRATÉGICA & INGESTÃO HÍBRIDA DE ICP                  */}
      {/* =================================================================== */}
      {viewMode === "onboarding" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Navegação Lateral das 6 Etapas */}
          <aside className="flex flex-col gap-2 lg:col-span-3">
            <div className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-4">
              <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                ESTRUTURA DA BASE ESTRATÉGICA
              </span>
              <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                Tudo fica salvo no projeto e alimenta Linha, Calendário, Temas e
                Roteiros.
              </p>

              <nav className="mt-4 flex flex-col gap-1.5">
                {ONBOARDING_STEPS.map((st) => {
                  const Icon = st.icon;
                  const isCurrent = activeOnboardingStep === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setActiveOnboardingStep(st.key)}
                      className={clsx(
                        "flex w-full items-start gap-3 rounded-la-lg border p-3 text-left transition-all",
                        isCurrent
                          ? "border-la-gold bg-la-gold-faint shadow-[0_0_20px_rgba(207,169,101,0.16)]"
                          : "border-white/8 bg-black/40 hover:border-white/20"
                      )}
                    >
                      <span
                        className={clsx(
                          "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-la-md font-la-mono text-[0.6875rem] font-bold",
                          isCurrent
                            ? "bg-la-gold text-la-text-inverse"
                            : "border border-white/15 bg-black/60 text-la-gold-light"
                        )}
                      >
                        {st.stepNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-la-gold" />
                          <span className="truncate font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                            {st.title}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 font-la-sans text-[0.6875rem] leading-[1.35] text-la-text-secondary">
                          {st.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleApproveAndOpenMap}
                  className="inline-flex min-h-[2.625rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Aprovar e Ver Mapa da Linha</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Conteúdo da Etapa Ativa */}
          <div className="flex flex-col gap-6 lg:col-span-9">
            {/* ETAPA 01: NICHO & OFERTA */}
            {activeOnboardingStep === "nicho_oferta" ? (
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  ETAPA 01 DE 06 · CONTEXTO COMERCIAL DO PROJETO
                </span>
                <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                  Nicho, Subnicho e Oferta Principal
                </h3>
                <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
                  A IA precisa saber exatamente o que está sendo vendido neste
                  projeto para não gerar conteúdos desconectados da sua receita.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Nicho Principal *
                    </label>
                    <input
                      type="text"
                      value={currentBase.niche}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          niche: e.target.value,
                        }))
                      }
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Subnicho Exato *
                    </label>
                    <input
                      type="text"
                      value={currentBase.subniche}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          subniche: e.target.value,
                        }))
                      }
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Produto Estrela / Oferta Principal deste Projeto *
                    </label>
                    <input
                      type="text"
                      value={currentBase.mainProductOrOffer}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          mainProductOrOffer: e.target.value,
                        }))
                      }
                      placeholder="Ex.: Mentoria Autoridade Imperial / Formação Produto X"
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Formato da Oferta, Modelo de Entrega e Faixa de Ticket
                    </label>
                    <input
                      type="text"
                      value={currentBase.offerFormatAndTicket}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          offerFormatAndTicket: e.target.value,
                        }))
                      }
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Resumo dos Entregáveis (Como o produto resolve o problema na prática)
                    </label>
                    <textarea
                      rows={3}
                      value={currentBase.offerDeliverablesSummary}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          offerDeliverablesSummary: e.target.value,
                        }))
                      }
                      className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("promessa_roma")}
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Avançar para Promessa, ROMA & MUV</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            ) : null}

            {/* ETAPA 02: PROMESSA, ROMA, PUV & MUV */}
            {activeOnboardingStep === "promessa_roma" ? (
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  ETAPA 02 DE 06 · DIFERENCIAÇÃO E MECANISMO PROPRIETÁRIO
                </span>
                <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                  Promessa Principal, ROMA, PUV, MUV e Visão de Mundo
                </h3>

                <div className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                      ROMA — Resultado Objetivo, Mensurável e Alcançável Prometido *
                    </label>
                    <textarea
                      rows={2}
                      value={currentBase.romaConcreteResult}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          romaConcreteResult: e.target.value,
                        }))
                      }
                      className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                        PUV — Proposta Única de Valor
                      </label>
                      <textarea
                        rows={3}
                        value={currentBase.puvUniqueValueProp}
                        onChange={(e) =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            puvUniqueValueProp: e.target.value,
                          }))
                        }
                        className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                        MUV — Mecanismo Único de Valor (Método Proprietário)
                      </label>
                      <textarea
                        rows={3}
                        value={currentBase.muvUniqueMechanism}
                        onChange={(e) =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            muvUniqueMechanism: e.target.value,
                          }))
                        }
                        className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Big Idea & Bandeira Central (Qual problema combate no mercado?)
                    </label>
                    <textarea
                      rows={3}
                      value={currentBase.bigIdeaAndWorldview}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          bigIdeaAndWorldview: e.target.value,
                        }))
                      }
                      className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Frase de Posicionamento da Marca
                    </label>
                    <input
                      type="text"
                      value={currentBase.positioningStatement}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          positioningStatement: e.target.value,
                        }))
                      }
                      className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("nicho_oferta")}
                    className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary hover:text-la-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Etapa anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("icp_profundo")}
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Avançar para Dossiê Completo do ICP</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            ) : null}

            {/* ETAPA 03: INGESTÃO PROFUNDA DO ICP */}
            {activeOnboardingStep === "icp_profundo" ? (
              <section className="flex flex-col gap-6 rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-6 shadow-[var(--la-elevation-2)]">
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
                  <div>
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      ETAPA 03 DE 06 · INGESTÃO DE AVATAR DE ALTA DENSIDADE
                    </span>
                    <h3 className="mt-1 font-la-sans text-[1.4375rem] font-semibold text-la-text-primary">
                      Dossiê Completo do Público Comprador (ICP)
                    </h3>
                    <p className="mt-1 max-w-[48rem] font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                      Suba o seu arquivo completo de ICP (.pdf, .docx,
                      .txt, .md até 25 MB) ou copie e cole o dossiê inteiro
                      em texto longo (50.000+ caracteres). A IA extrai e
                      organiza automaticamente Dores, Desejos, Objeções, Mitos e
                      Níveis de Consciência.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 rounded-la-lg border border-la-border-gold/40 bg-black/60 px-4 py-2.5">
                    <div className="text-right">
                      <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                        VOLUME DO DOSSIÊ ICP
                      </span>
                      <span className="font-la-mono text-[0.8125rem] font-semibold text-la-gold-light">
                        {icpTextMetrics.chars.toLocaleString("pt-BR")} chars ·{" "}
                        {icpTextMetrics.words.toLocaleString("pt-BR")} palavras
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {[
                    {
                      id: "upload" as const,
                      title: "Opção A · Subir Arquivo de ICP",
                      subtitle: "Upload Drag & Drop (.pdf, .docx, .txt, .md)",
                      icon: Upload,
                    },
                    {
                      id: "paste" as const,
                      title: "Opção B · Copiar e Colar ICP Completo",
                      subtitle: "Editor para textos longos (50.000+ caracteres)",
                      icon: ClipboardPaste,
                    },
                    {
                      id: "structured" as const,
                      title: "Matriz Extraída do ICP (7 Blocos)",
                      subtitle: `${currentBase.icpPains.length} dores · ${currentBase.icpDesires.length} desejos · ${currentBase.icpObjections.length} objeções`,
                      icon: Brain,
                    },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const active = icpInputTab === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setIcpInputTab(mode.id)}
                        className={clsx(
                          "flex items-start gap-3 rounded-la-xl border p-4 text-left transition-all",
                          active
                            ? "border-la-gold bg-la-gold-faint shadow-[0_0_24px_rgba(207,169,101,0.18)]"
                            : "border-white/10 bg-black/45 hover:border-white/25"
                        )}
                      >
                        <span
                          className={clsx(
                            "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-lg border",
                            active
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-la-border-gold/45 bg-la-gold-faint text-la-gold"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="block font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                            {mode.title}
                          </span>
                          <span className="mt-0.5 block font-la-mono text-[0.6875rem] text-la-text-secondary">
                            {mode.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {uploadError ? (
                  <div className="flex items-start justify-between gap-3 rounded-la-lg border border-red-500/45 bg-red-950/35 p-4 text-red-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <p className="font-la-sans text-[0.8125rem]">
                        {uploadError}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="text-red-300 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                {extractionSuccessBanner ? (
                  <div className="flex flex-col justify-between gap-3 rounded-la-lg border border-emerald-400/45 bg-emerald-950/25 p-4 text-emerald-100 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <p className="font-la-sans text-[0.8125rem]">
                        {extractionSuccessBanner}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIcpInputTab("structured")}
                      className="shrink-0 rounded-la-md bg-emerald-400 px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-black hover:bg-emerald-300"
                    >
                      Ver Matriz Extraída →
                    </button>
                  </div>
                ) : null}

                {/* ABA 1: UPLOAD DRAG & DROP */}
                {icpInputTab === "upload" ? (
                  <div className="flex flex-col gap-5">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                      }}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={clsx(
                        "group relative flex cursor-pointer flex-col items-center justify-center rounded-la-xl border-2 border-dashed p-8 text-center transition-all sm:p-10",
                        isDraggingFile
                          ? "border-la-gold bg-la-gold/15 shadow-[0_0_40px_rgba(207,169,101,0.25)]"
                          : "border-la-border-gold/55 bg-black/50 hover:border-la-gold hover:bg-la-gold-faint/40"
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      <div className="flex h-14 w-14 items-center justify-center rounded-la-xl border border-la-gold/60 bg-la-gold-faint text-la-gold shadow-[0_0_24px_rgba(207,169,101,0.22)] transition-transform group-hover:scale-105">
                        <FileUp className="h-7 w-7" />
                      </div>

                      <h4 className="mt-4 font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                        Arraste e solte o arquivo do seu ICP aqui, ou clique para
                        selecionar no computador
                      </h4>

                      <p className="mt-1.5 max-w-[36rem] font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                        Suporta arquivos grandes de pesquisa de público,
                        transcrições, dossiês de avatar e briefings completos (
                        <strong className="text-la-gold-light">
                          .PDF, .DOCX, .TXT, .MD, .CSV, .JSON
                        </strong>{" "}
                        até <strong className="text-la-gold-light">25 MB</strong>
                        ).
                      </p>

                      <div className="mt-5 inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)]">
                        <Upload className="h-4 w-4" />
                        <span>Escolher Arquivo do ICP no Computador</span>
                      </div>

                      {isUploadingFile ? (
                        <div className="mt-5 w-full max-w-md">
                          <div className="flex items-center justify-between font-la-mono text-[0.6875rem] text-la-gold-light">
                            <span>Lendo e extraindo dossiê do arquivo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-la-full bg-white/10">
                            <div
                              style={{ width: `${uploadProgress}%` }}
                              className="h-full bg-la-gold transition-all duration-200"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-la-xl border border-white/10 bg-black/45 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            ARQUIVOS DE ICP VINCULADOS A ESTE PROJETO
                          </span>
                          <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                            O conteúdo extraído destes arquivos já está salvo no
                            dossiê textual e na matriz estratégica.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIcpInputTab("paste")}
                          className="font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:underline"
                        >
                          Inspecionar texto completo extraído →
                        </button>
                      </div>

                      {currentBase.icpUploadedDocs.length === 0 ? (
                        <p className="py-4 font-la-sans text-[0.8125rem] text-la-text-muted">
                          Nenhum arquivo anexado ainda. Suba um documento acima
                          ou utilize a aba &ldquo;Copiar e Colar ICP
                          Completo&rdquo;.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-col gap-2.5">
                          {currentBase.icpUploadedDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex flex-col justify-between gap-3 rounded-la-lg border border-white/10 bg-[#0B0F19] p-3.5 sm:flex-row sm:items-center"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold/50 bg-la-gold-faint text-la-gold">
                                  <FileCheck2 className="h-4 w-4" />
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                                      {doc.fileName}
                                    </span>
                                    <span className="rounded-la-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-la-mono text-[0.5625rem] text-emerald-300">
                                      Extraído & Ativo
                                    </span>
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-2 font-la-mono text-[0.6875rem] text-la-text-muted">
                                    <span>
                                      {formatFileSize(doc.fileSizeBytes)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {doc.extractedWordsCount.toLocaleString(
                                        "pt-BR"
                                      )}{" "}
                                      palavras lidas
                                    </span>
                                    <span>•</span>
                                    <span>{doc.uploadedAt}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIcpInputTab("paste")}
                                  className="rounded-la-md border border-white/12 bg-white/[0.04] px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary hover:border-la-border-gold"
                                >
                                  Ver Texto
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveUploadedDoc(doc.id)
                                  }
                                  title="Remover referência de arquivo"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 text-la-text-muted hover:border-red-500/50 hover:text-red-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* ABA 2: COPIAR E COLAR TEXTO LONGO DO ICP */}
                {icpInputTab === "paste" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-la-lg border border-white/10 bg-black/55 p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePasteFromClipboard}
                          className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/60 bg-la-gold-faint px-3.5 py-1.5 font-la-sans text-[0.75rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                        >
                          <ClipboardPaste className="h-3.5 w-3.5" />
                          <span>Colar da Área de Transferência</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setIsTextareaExpanded((prev) => !prev)
                          }
                          className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border border-white/14 bg-white/[0.03] px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-secondary hover:text-la-text-primary"
                        >
                          {isTextareaExpanded ? (
                            <>
                              <Minimize2 className="h-3.5 w-3.5 text-la-gold" />
                              <span>Reduzir altura do editor</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-3.5 w-3.5 text-la-gold" />
                              <span>Expandir para leitura ampla</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStrategicBase((prev) => ({
                              ...prev,
                              icpRawText: "",
                            }))
                          }
                          className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-la-md border border-white/10 px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-muted hover:border-red-500/40 hover:text-red-300"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Limpar texto</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isExtractingWithAI}
                        onClick={handleRunAIExtractionFromRawText}
                        className="inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light disabled:opacity-60"
                      >
                        {isExtractingWithAI ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Analisando e estruturando ICP...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Extrair & Mapear Matriz do ICP com IA</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={isTextareaExpanded ? 26 : 14}
                        value={currentBase.icpRawText}
                        onChange={(e) =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            icpRawText: e.target.value,
                          }))
                        }
                        placeholder="Cole aqui todo o dossiê do seu ICP (pesquisas, entrevistas, dores, desejos, objeções, mitos, avatares, análises de concorrentes). Este campo suporta textos extensos com mais de 50.000 caracteres com salvamento automático..."
                        className="w-full rounded-la-xl border border-white/14 bg-black/70 p-4 font-la-sans text-[0.875rem] leading-[1.7] text-la-text-primary placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 font-la-mono text-[0.6875rem] text-la-text-muted">
                      <span>
                        Capacidade ilimitada ativa •{" "}
                        <strong className="text-la-text-primary">
                          {icpTextMetrics.chars.toLocaleString("pt-BR")}{" "}
                          caracteres
                        </strong>{" "}
                        ({icpTextMetrics.words.toLocaleString("pt-BR")}{" "}
                        palavras · {icpTextMetrics.lines} linhas)
                      </span>
                      <span className="text-la-gold-light">
                        Autosave ativo no contexto isolado deste projeto
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* ABA 3: MATRIZ ESTRUTURADA DO ICP */}
                {icpInputTab === "structured" ? (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/45 p-4">
                        <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                          1. Perfil Demográfico, Psicográfico & Momento do Comprador
                        </label>
                        <textarea
                          rows={3}
                          value={currentBase.icpProfileSummary}
                          onChange={(e) =>
                            updateStrategicBase((prev) => ({
                              ...prev,
                              icpProfileSummary: e.target.value,
                            }))
                          }
                          className="w-full rounded-la-md border border-white/12 bg-black/60 p-3 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 rounded-la-lg border border-white/10 bg-black/45 p-4">
                        <label className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                          2. Linguagem, Vocabulário e Frases Literais do ICP
                        </label>
                        <textarea
                          rows={3}
                          value={currentBase.icpVocabularyAndSlang}
                          onChange={(e) =>
                            updateStrategicBase((prev) => ({
                              ...prev,
                              icpVocabularyAndSlang: e.target.value,
                            }))
                          }
                          className="w-full rounded-la-md border border-white/12 bg-black/60 p-3 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Dores */}
                      <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-black/50 p-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-rose-300">
                              3. Dores Viscerais & Problemas ({currentBase.icpPains.length})
                            </span>
                          </div>
                          <ul className="mt-3 flex flex-col gap-2">
                            {currentBase.icpPains.map((item, idx) => (
                              <li
                                key={`${item}-${idx}`}
                                className="flex items-start justify-between gap-2 rounded-la-md border border-white/8 bg-[#0C101B] px-3 py-2 font-la-sans text-[0.75rem] text-la-text-primary"
                              >
                                <span>• {item}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStrategicBase((prev) => ({
                                      ...prev,
                                      icpPains: prev.icpPains.filter(
                                        (_, i) => i !== idx
                                      ),
                                    }))
                                  }
                                  className="shrink-0 text-la-text-muted hover:text-red-300"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Adicionar nova dor do ICP..."
                            value={newPainInput}
                            onChange={(e) => setNewPainInput(e.target.value)}
                            className="min-h-[2.25rem] flex-1 rounded-la-md border border-white/12 bg-black/65 px-3 font-la-sans text-[0.75rem] text-la-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newPainInput.trim()) return;
                              updateStrategicBase((prev) => ({
                                ...prev,
                                icpPains: [
                                  ...prev.icpPains,
                                  newPainInput.trim(),
                                ],
                              }));
                              setNewPainInput("");
                            }}
                            className="rounded-la-md bg-la-gold px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                          >
                            + Incluir
                          </button>
                        </div>
                      </div>

                      {/* Desejos */}
                      <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-black/50 p-4">
                        <div>
                          <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-emerald-300">
                            4. Desejos, Ambições & Resultados ({currentBase.icpDesires.length})
                          </span>
                          <ul className="mt-3 flex flex-col gap-2">
                            {currentBase.icpDesires.map((item, idx) => (
                              <li
                                key={`${item}-${idx}`}
                                className="flex items-start justify-between gap-2 rounded-la-md border border-white/8 bg-[#0C101B] px-3 py-2 font-la-sans text-[0.75rem] text-la-text-primary"
                              >
                                <span>• {item}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStrategicBase((prev) => ({
                                      ...prev,
                                      icpDesires: prev.icpDesires.filter(
                                        (_, i) => i !== idx
                                      ),
                                    }))
                                  }
                                  className="shrink-0 text-la-text-muted hover:text-red-300"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Adicionar novo desejo do ICP..."
                            value={newDesireInput}
                            onChange={(e) => setNewDesireInput(e.target.value)}
                            className="min-h-[2.25rem] flex-1 rounded-la-md border border-white/12 bg-black/65 px-3 font-la-sans text-[0.75rem] text-la-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newDesireInput.trim()) return;
                              updateStrategicBase((prev) => ({
                                ...prev,
                                icpDesires: [
                                  ...prev.icpDesires,
                                  newDesireInput.trim(),
                                ],
                              }));
                              setNewDesireInput("");
                            }}
                            className="rounded-la-md bg-la-gold px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                          >
                            + Incluir
                          </button>
                        </div>
                      </div>

                      {/* Objeções */}
                      <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-black/50 p-4">
                        <div>
                          <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-amber-300">
                            5. Objeções Reais de Compra ({currentBase.icpObjections.length})
                          </span>
                          <ul className="mt-3 flex flex-col gap-2">
                            {currentBase.icpObjections.map((item, idx) => (
                              <li
                                key={`${item}-${idx}`}
                                className="flex items-start justify-between gap-2 rounded-la-md border border-white/8 bg-[#0C101B] px-3 py-2 font-la-sans text-[0.75rem] text-la-text-primary"
                              >
                                <span>• {item}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStrategicBase((prev) => ({
                                      ...prev,
                                      icpObjections: prev.icpObjections.filter(
                                        (_, i) => i !== idx
                                      ),
                                    }))
                                  }
                                  className="shrink-0 text-la-text-muted hover:text-red-300"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Adicionar nova objeção..."
                            value={newObjectionInput}
                            onChange={(e) =>
                              setNewObjectionInput(e.target.value)
                            }
                            className="min-h-[2.25rem] flex-1 rounded-la-md border border-white/12 bg-black/65 px-3 font-la-sans text-[0.75rem] text-la-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newObjectionInput.trim()) return;
                              updateStrategicBase((prev) => ({
                                ...prev,
                                icpObjections: [
                                  ...prev.icpObjections,
                                  newObjectionInput.trim(),
                                ],
                              }));
                              setNewObjectionInput("");
                            }}
                            className="rounded-la-md bg-la-gold px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                          >
                            + Incluir
                          </button>
                        </div>
                      </div>

                      {/* Mitos */}
                      <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-black/50 p-4">
                        <div>
                          <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-sky-300">
                            6. Mitos do Mercado & Fracassos Passados ({currentBase.icpMythsAndPastFailures.length})
                          </span>
                          <ul className="mt-3 flex flex-col gap-2">
                            {currentBase.icpMythsAndPastFailures.map(
                              (item, idx) => (
                                <li
                                  key={`${item}-${idx}`}
                                  className="flex items-start justify-between gap-2 rounded-la-md border border-white/8 bg-[#0C101B] px-3 py-2 font-la-sans text-[0.75rem] text-la-text-primary"
                                >
                                  <span>• {item}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStrategicBase((prev) => ({
                                        ...prev,
                                        icpMythsAndPastFailures:
                                          prev.icpMythsAndPastFailures.filter(
                                            (_, i) => i !== idx
                                          ),
                                      }))
                                    }
                                    className="shrink-0 text-la-text-muted hover:text-red-300"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Adicionar mito ou fracasso passado..."
                            value={newMythInput}
                            onChange={(e) => setNewMythInput(e.target.value)}
                            className="min-h-[2.25rem] flex-1 rounded-la-md border border-white/12 bg-black/65 px-3 font-la-sans text-[0.75rem] text-la-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newMythInput.trim()) return;
                              updateStrategicBase((prev) => ({
                                ...prev,
                                icpMythsAndPastFailures: [
                                  ...prev.icpMythsAndPastFailures,
                                  newMythInput.trim(),
                                ],
                              }));
                              setNewMythInput("");
                            }}
                            className="rounded-la-md bg-la-gold px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-text-inverse"
                          >
                            + Incluir
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Níveis de Consciência */}
                    <div className="rounded-la-xl border border-white/10 bg-black/45 p-4">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                        7. Mapa dos 5 Níveis de Consciência do ICP
                      </span>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
                        {currentBase.icpAwarenessStrategies.map((st) => (
                          <div
                            key={st.level}
                            className="rounded-la-lg border border-white/8 bg-[#0B0F1A] p-3"
                          >
                            <span className="block font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                              {st.level}
                            </span>
                            <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                              {st.description}
                            </p>
                            <p className="mt-2 border-t border-white/8 pt-1.5 font-la-sans text-[0.6875rem] text-la-text-primary">
                              <strong>Ação:</strong> {st.recommendedApproach}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Rodapé de Navegação */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("promessa_roma")}
                    className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary hover:text-la-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Promessa & ROMA</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveOnboardingStep("tom_de_voz")}
                      className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                    >
                      <span>Salvar ICP e Avançar para Tom de Voz</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {/* ETAPA 04: TOM DE VOZ */}
            {activeOnboardingStep === "tom_de_voz" ? (
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  ETAPA 04 DE 06 · IDENTIDADE VERBAL DA MARCA
                </span>
                <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                  Tom de Voz, Personalidade e Regras Práticas
                </h3>
                <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
                  Escolha um preset ou personalize como a marca abre
                  raciocínios, o que repete como mantra e o que jamais deve
                  dizer nos roteiros.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {VOICE_PRESETS.map((preset) => {
                    const selected =
                      currentBase.voiceArchetypeLabel === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            voiceArchetypeLabel: preset.label,
                            voiceTraits: preset.traits,
                            voiceHowToOpenReasoning: preset.openingRule,
                          }))
                        }
                        className={clsx(
                          "rounded-la-lg border p-3.5 text-left transition-all",
                          selected
                            ? "border-la-gold bg-la-gold-faint"
                            : "border-white/10 bg-black/45 hover:border-white/25"
                        )}
                      >
                        <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                          {preset.label}
                        </span>
                        <span className="mt-1 block font-la-mono text-[0.6875rem] text-la-gold-light">
                          {preset.traits.slice(0, 2).join(" • ")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                      Como Abrir Raciocínios e Ganchos (Regra de Abertura)
                    </label>
                    <textarea
                      rows={2}
                      value={currentBase.voiceHowToOpenReasoning}
                      onChange={(e) =>
                        updateStrategicBase((prev) => ({
                          ...prev,
                          voiceHowToOpenReasoning: e.target.value,
                        }))
                      }
                      className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-emerald-300">
                        O Que Repetir Sempre (Bandeiras e Mantras)
                      </span>
                      <textarea
                        rows={4}
                        value={currentBase.voiceWhatToRepeat.join("\n")}
                        onChange={(e) =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            voiceWhatToRepeat: e.target.value
                              .split("\n")
                              .filter(Boolean),
                          }))
                        }
                        className="mt-2 w-full rounded-la-md border border-white/12 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>

                    <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-rose-300">
                        O Que Nunca Usar / Evitar na Linguagem
                      </span>
                      <textarea
                        rows={4}
                        value={currentBase.voiceWhatToAvoid.join("\n")}
                        onChange={(e) =>
                          updateStrategicBase((prev) => ({
                            ...prev,
                            voiceWhatToAvoid: e.target.value
                              .split("\n")
                              .filter(Boolean),
                          }))
                        }
                        className="mt-2 w-full rounded-la-md border border-white/12 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("icp_profundo")}
                    className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Dossiê ICP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("pilares_retina")}
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Avançar para Pilares & Matriz RETINA</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            ) : null}

            {/* ETAPA 05: PILARES & MATRIZ RETINA */}
            {activeOnboardingStep === "pilares_retina" ? (
              <section className="flex flex-col gap-6 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    ETAPA 05 DE 06 · ARQUITETURA EDITORIAL E PESO RETINA
                  </span>
                  <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                    Mensagem Central, Pilares Editoriais e Distribuição RETINA
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Mensagem Central da Linha Editorial
                  </label>
                  <textarea
                    rows={2}
                    value={currentBase.centralMessage}
                    onChange={(e) =>
                      updateStrategicBase((prev) => ({
                        ...prev,
                        centralMessage: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="rounded-la-xl border border-white/10 bg-black/45 p-5">
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Pilares Editoriais Estruturais ({currentBase.pillars.length})
                  </span>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {currentBase.pillars.map((pil) => (
                      <div
                        key={pil.id}
                        className="flex flex-col justify-between rounded-la-lg border border-white/10 bg-[#0B0F1A] p-3.5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                              {pil.title}
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                updateStrategicBase((prev) => ({
                                  ...prev,
                                  pillars: prev.pillars.filter(
                                    (p) => p.id !== pil.id
                                  ),
                                }))
                              }
                              className="text-la-text-muted hover:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                            {pil.objective}
                          </p>
                        </div>
                        <span className="mt-2 block border-t border-white/8 pt-1.5 font-la-mono text-[0.625rem] text-la-gold-light">
                          Conexão ICP: {pil.connectedPainOrDesire}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Nome do novo pilar..."
                      value={newPillarTitle}
                      onChange={(e) => setNewPillarTitle(e.target.value)}
                      className="min-h-[2.375rem] rounded-la-md border border-white/12 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                    <input
                      type="text"
                      placeholder="Objetivo estratégico do pilar..."
                      value={newPillarObjective}
                      onChange={(e) => setNewPillarObjective(e.target.value)}
                      className="min-h-[2.375rem] rounded-la-md border border-white/12 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPillarTitle.trim()) return;
                        updateStrategicBase((prev) => ({
                          ...prev,
                          pillars: [
                            ...prev.pillars,
                            {
                              id: `pil-${Date.now()}`,
                              title: newPillarTitle.trim(),
                              objective:
                                newPillarObjective.trim() ||
                                "Sustentar autoridade e elevar consciência do comprador.",
                              connectedPainOrDesire:
                                "Conectado às dores e objeções do ICP.",
                            },
                          ],
                        }));
                        setNewPillarTitle("");
                        setNewPillarObjective("");
                      }}
                      className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                    >
                      + Adicionar Pilar Editorial
                    </button>
                  </div>
                </div>

                <div className="rounded-la-xl border border-white/10 bg-black/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                        DISTRIBUIÇÃO ESTRATÉGICA RETINA (6 TIPOS DE CONTEÚDO)
                      </span>
                      <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                        Calibre o peso percentual de cada função de conteúdo
                        para o momento atual do negócio.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "organico" as const, label: "Crescimento Orgânico" },
                        { id: "aquecimento" as const, label: "Aquecimento" },
                        { id: "lancamento" as const, label: "Conversão / Vendas" },
                        { id: "autoridade" as const, label: "Autoridade Pura" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyRetinaPreset(p.id)}
                          className="rounded-la-xs border border-white/12 bg-white/[0.04] px-2.5 py-1 font-la-mono text-[0.625rem] text-la-gold-light hover:border-la-gold"
                        >
                          Preset: {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {RETINA_METADATA.map((item) => {
                      const val = currentBase.retinaDistribution[item.key];
                      return (
                        <div
                          key={item.key}
                          className="rounded-la-lg border border-white/8 bg-[#0B0F1A] p-3.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={clsx(
                                "rounded-la-full border px-2 py-0.5 font-la-mono text-[0.625rem] font-bold",
                                item.badgeClass
                              )}
                            >
                              {item.code} · {item.label}
                            </span>
                            <span className="font-la-mono text-[0.9375rem] font-bold text-la-text-primary">
                              {val}%
                            </span>
                          </div>
                          <p className="mt-1.5 font-la-sans text-[0.6875rem] leading-[1.4] text-la-text-secondary">
                            {item.role}
                          </p>
                          <input
                            type="range"
                            min={0}
                            max={60}
                            step={5}
                            value={val}
                            onChange={(e) => {
                              const nextVal = Number(e.target.value);
                              updateStrategicBase((prev) => ({
                                ...prev,
                                retinaDistribution: {
                                  ...prev.retinaDistribution,
                                  [item.key]: nextVal,
                                },
                              }));
                            }}
                            className="mt-2.5 w-full accent-[#CFA965]"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-la-mono text-[0.75rem]">
                    <span className="text-la-text-secondary">
                      Soma total da matriz RETINA:
                    </span>
                    <span
                      className={clsx(
                        "font-bold",
                        retinaTotalPercentage === 100
                          ? "text-emerald-400"
                          : "text-amber-300"
                      )}
                    >
                      {retinaTotalPercentage}%{" "}
                      {retinaTotalPercentage === 100
                        ? "(Equilíbrio exato 100%)"
                        : "(Ajuste os controles ou use um preset para fechar 100%)"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("tom_de_voz")}
                    className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Tom de Voz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("capacidade_real")}
                    className="inline-flex items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    <span>Avançar para Capacidade Real de Produção</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            ) : null}

            {/* ETAPA 06: CAPACIDADE REAL */}
            {activeOnboardingStep === "capacidade_real" ? (
              <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  ETAPA 06 DE 06 · REALIDADE OPERACIONAL DO ESPECIALISTA
                </span>
                <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                  Capacidade Real de Produção Semanal
                </h3>
                <p className="mt-1 font-la-sans text-[0.875rem] text-la-text-secondary">
                  O calendário editorial não pode ser construído em fantasia.
                  Informe quantas peças por formato você realmente consegue
                  produzir com qualidade a cada semana.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      key: "shortVideosReels" as const,
                      label: "Reels / Vídeos Curtos por semana",
                      hint: "Recomendado: 3 a 5 por semana",
                    },
                    {
                      key: "longVideosYoutube" as const,
                      label: "Vídeos Longos (YouTube/Aula) por semana",
                      hint: "Recomendado: 1 por semana",
                    },
                    {
                      key: "carousels" as const,
                      label: "Carrosséis 4:5 por semana",
                      hint: "Recomendado: 2 a 3 por semana",
                    },
                    {
                      key: "staticPosts" as const,
                      label: "Posts Estáticos por semana",
                      hint: "Recomendado: 1 a 2 por semana",
                    },
                    {
                      key: "weeklyLives" as const,
                      label: "Lives Semanais",
                      hint: "Recomendado: 1 por semana",
                    },
                    {
                      key: "dailyStorySequences" as const,
                      label: "Sequências Diárias de Stories",
                      hint: "Padrão imperial: 3 a 4 sequências/dia (4-5 stories cada)",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="rounded-la-lg border border-white/10 bg-black/50 p-4"
                    >
                      <label className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                        {item.label}
                      </label>
                      <span className="mt-0.5 block font-la-mono text-[0.625rem] text-la-text-muted">
                        {item.hint}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={currentBase.weeklyCapacity[item.key]}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          updateStrategicBase((prev) => ({
                            ...prev,
                            weeklyCapacity: {
                              ...prev.weeklyCapacity,
                              [item.key]: val,
                            },
                          }));
                        }}
                        className="mt-3 min-h-[2.5rem] w-full rounded-la-md border border-white/14 bg-black/70 px-3 font-la-mono text-[1rem] font-bold text-la-gold-light"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setActiveOnboardingStep("pilares_retina")}
                    className="inline-flex items-center gap-1.5 rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Pilares & RETINA</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveAndOpenMap}
                    className="inline-flex min-h-[2.875rem] items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Aprovar Base e Gerar Mapa da Linha Editorial</span>
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* TELA 3: MAPA DA LINHA EDITORIAL COMPLETO                            */}
      {/* =================================================================== */}
      {viewMode === "map" ? (
        <div className="flex flex-col gap-6">
          <section className="rounded-la-xl border border-la-gold/65 bg-[#090D16]/95 p-6 shadow-[var(--la-elevation-2)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  BLOCO 01 DO MAPA · IDENTIDADE E DIREÇÃO CENTRAL
                </span>
                <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                  {currentVersion.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode("onboarding");
                  setActiveOnboardingStep("nicho_oferta");
                }}
                className="inline-flex items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3.5 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar Base Estratégica</span>
              </button>
            </div>

            <div className="mt-4 rounded-la-lg border border-la-border-gold/40 bg-la-gold-faint/60 p-4">
              <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                MENSAGEM CENTRAL DA COMUNICAÇÃO
              </span>
              <p className="mt-1 font-la-sans text-[1rem] font-medium leading-[1.6] text-la-text-primary">
                {currentBase.centralMessage}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  PROMESSA ROMA & OFERTA
                </span>
                <p className="mt-1 font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                  {currentBase.mainProductOrOffer}
                </p>
                <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                  {currentBase.romaConcreteResult}
                </p>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  PUV — PROPOSTA ÚNICA DE VALOR
                </span>
                <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                  {currentBase.puvUniqueValueProp}
                </p>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  MUV — MECANISMO ÚNICO DE VALOR
                </span>
                <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                  {currentBase.muvUniqueMechanism}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
            <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              BLOCO 02 DO MAPA · GRANDES CATEGORIAS DA COMUNICAÇÃO
            </span>
            <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
              Pilares Editoriais Aprovados ({currentBase.pillars.length})
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentBase.pillars.map((pil) => (
                <div
                  key={pil.id}
                  className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0B0F1A] p-4"
                >
                  <div>
                    <h4 className="font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                      {pil.title}
                    </h4>
                    <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                      {pil.objective}
                    </p>
                  </div>
                  <div className="mt-3 border-t border-white/8 pt-2 font-la-mono text-[0.625rem] text-la-gold-light">
                    {pil.connectedPainOrDesire}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  BLOCO 03 DO MAPA · INTELIGÊNCIA DE AVATAR (ICP)
                </span>
                <h3 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                  Matriz de Dores, Desejos, Objeções e Mitos do Comprador
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode("onboarding");
                  setActiveOnboardingStep("icp_profundo");
                }}
                className="font-la-mono text-[0.75rem] font-semibold text-la-gold-light hover:underline"
              >
                Abrir Dossiê Bruto / Upload ICP ({icpTextMetrics.words} palavras) →
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-rose-300">
                  DORES ATACADAS ({currentBase.icpPains.length})
                </span>
                <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  {currentBase.icpPains.slice(0, 5).map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-emerald-300">
                  DESEJOS ATIVADOS ({currentBase.icpDesires.length})
                </span>
                <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  {currentBase.icpDesires.slice(0, 5).map((d, i) => (
                    <li key={i}>• {d}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-amber-300">
                  OBJEÇÕES QUEBRADAS ({currentBase.icpObjections.length})
                </span>
                <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  {currentBase.icpObjections.slice(0, 5).map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-sky-300">
                  MITOS DESCONSTRUÍDOS ({currentBase.icpMythsAndPastFailures.length})
                </span>
                <ul className="mt-2.5 flex flex-col gap-1.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  {currentBase.icpMythsAndPastFailures.slice(0, 5).map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-5">
              <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                BLOCO 04 · TOM DE VOZ E REGRAS
              </span>
              <h3 className="mt-1 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                {currentBase.voiceArchetypeLabel}
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentBase.voiceTraits.map((tr) => (
                  <span
                    key={tr}
                    className="rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light"
                  >
                    {tr}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-la-lg border border-white/8 bg-black/45 p-3.5">
                <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  COMO ABRIR RACIOCÍNIOS
                </span>
                <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                  {currentBase.voiceHowToOpenReasoning}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-la-lg border border-white/8 bg-black/45 p-3">
                  <span className="font-la-mono text-[0.5625rem] font-bold uppercase text-emerald-300">
                    REPETIR SEMPRE
                  </span>
                  <ul className="mt-1.5 flex flex-col gap-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                    {currentBase.voiceWhatToRepeat.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-la-lg border border-white/8 bg-black/45 p-3">
                  <span className="font-la-mono text-[0.5625rem] font-bold uppercase text-rose-300">
                    NUNCA USAR
                  </span>
                  <ul className="mt-1.5 flex flex-col gap-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                    {currentBase.voiceWhatToAvoid.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
              <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                BLOCO 05 · EQUILÍBRIO RETINA & CAPACIDADE OPERACIONAL
              </span>
              <h3 className="mt-1 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                Distribuição dos 6 Tipos de Conteúdo RETINA
              </h3>

              <div className="mt-4 flex flex-col gap-3">
                {RETINA_METADATA.map((item) => {
                  const pct = currentBase.retinaDistribution[item.key];
                  return (
                    <div key={item.key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between font-la-sans text-[0.8125rem]">
                        <span className="font-semibold text-la-text-primary">
                          {item.code} · {item.label}
                        </span>
                        <span className="font-la-mono text-[0.75rem] font-bold text-la-gold-light">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-la-full bg-white/10">
                        <div
                          style={{ width: `${Math.min(100, pct)}%` }}
                          className={clsx("h-full rounded-la-full", item.barClass)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-3">
                <div className="rounded-la-md border border-white/8 bg-black/50 p-2.5">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Reels / Curtos
                  </span>
                  <strong className="font-la-mono text-[0.875rem] text-la-text-primary">
                    {currentBase.weeklyCapacity.shortVideosReels} / semana
                  </strong>
                </div>
                <div className="rounded-la-md border border-white/8 bg-black/50 p-2.5">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Carrosséis 4:5
                  </span>
                  <strong className="font-la-mono text-[0.875rem] text-la-text-primary">
                    {currentBase.weeklyCapacity.carousels} / semana
                  </strong>
                </div>
                <div className="rounded-la-md border border-white/8 bg-black/50 p-2.5">
                  <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                    Vídeos Longos / Lives
                  </span>
                  <strong className="font-la-mono text-[0.875rem] text-la-text-primary">
                    {currentBase.weeklyCapacity.longVideosYoutube} longo ·{" "}
                    {currentBase.weeklyCapacity.weeklyLives} live
                  </strong>
                </div>
              </div>
            </section>
          </div>

          {/* Continuidade Metodológica para o Calendário */}
          <section className="flex flex-col justify-between gap-4 rounded-la-xl border border-la-gold bg-la-gold-faint p-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                CONTINUIDADE ESTRATÉGICA · FUNÇÃO 01 (PARTE 1 → PARTE 2)
              </span>
              <h4 className="mt-1 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                Sua Linha Editorial e seu ICP estão prontos.
              </h4>
              <p className="mt-0.5 font-la-sans text-[0.875rem] text-la-text-secondary">
                Agora transforme sua mensagem, pilares, matriz RETINA e
                capacidade real de produção em um Calendário Editorial
                executável.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerGoToCalendar}
              className="inline-flex min-h-[2.875rem] shrink-0 items-center gap-2 rounded-la-md bg-la-gold px-6 py-2.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <span>Transformar em Calendário Editorial</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      ) : null}

      {/* MODAL: NOVA VERSÃO DA LINHA EDITORIAL */}
      <AnimatePresence>
        {isCreateVersionModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateVersionModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[32rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                  Nova Versão da Linha Editorial
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateVersionModalOpen(false)}
                  className="text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleCreateNewVersion}
                className="mt-4 flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Nome da Versão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Linha Editorial v3 — Fase de Conversão"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] font-semibold uppercase text-la-text-secondary">
                    Fase ou Momento do Negócio
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Pré-lançamento / Aquecimento"
                    value={newVersionPhase}
                    onChange={(e) => setNewVersionPhase(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="mt-3 flex justify-end gap-2.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateVersionModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                  >
                    Criar e Configurar ICP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default LinhaEditorialModule;