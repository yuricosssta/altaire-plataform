// FrontEnd/src/components/editorial/workspace/RoteirosEditorialModule.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Clock,
  Columns,
  Compass,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Flame,
  Gift,
  Hash,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Maximize2,
  MessageSquare,
  Minimize2,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  FORMAT_META,
  RETINA_META,
  type CalendarSlotItem,
  type EditorialCalendarRecord,
  type RetinaTypeKey,
  type SlotContentFormat,
} from "./CalendarioEditorialModule";
import type { StrategicThemeRecord } from "./TemasEditorialModule";

/* ========================================================================== */
/* CONTRATOS E TIPAGENS ESTRITAS DA FUNÇÃO 03 (ROTEIROS E ATIVOS)             */
/* ========================================================================== */

export type ScriptFormatSlug =
  | "short_video"
  | "long_video"
  | "live"
  | "carousel"
  | "static_post"
  | "stories_sequence";

export type ScriptProductionStatus =
  | "draft"
  | "ready"
  | "in_production"
  | "ab_test"
  | "published"
  | "archived";

export type ScriptSpeakingMode = "conexao_bullets" | "seguranca_palavra";

export interface ScriptBlockRow {
  readonly id: string;
  readonly timecodeOrStage: string;
  readonly psychologicalRole: string;
  readonly visualAndAudioDirection: string;
  readonly wordForWordSpeech: string;
  readonly connectionBulletLine: string;
}

export interface CarouselSlideItem {
  readonly slideNumber: number;
  readonly roleLabel: string;
  readonly headline: string;
  readonly bodyLineBreakCopy: string;
  readonly visualDesignNote: string;
  readonly imagePromptEN: string;
}

export interface StoryCardItem {
  readonly cardNumber: 1 | 2 | 3 | 4 | 5;
  readonly cardType: "video_fala" | "texto_sobre_foto" | "bastidor_prova";
  readonly intentionLabel: string;
  readonly wordForWordScript: string;
  readonly connectionBullet: string;
  readonly mirrorCaptionNoSound: string;
  readonly instagramSticker: string;
  readonly visualBrandingNote: string;
}

export interface StoryPeriodSequence {
  readonly period: "Manhã" | "Almoço" | "Tarde" | "Noite";
  readonly suggestedTime: string;
  readonly narrativeTheme: string;
  readonly cards: readonly StoryCardItem[];
}

export interface PredictiveQAItem {
  readonly id: string;
  readonly questionFromAudience: string;
  readonly strategicAnswerCopy: string;
  readonly recommendedFormat: "Vídeo com Legenda Espelho" | "Texto sobre Foto";
  readonly qualifiedForMaterial: boolean;
}

export interface TitleVariationItem {
  readonly id: string;
  readonly hookCategory:
    | "Contraste Direto"
    | "Erro Invisível"
    | "Mecanismo Único (MUV)"
    | "Estudo de Caso / Prova"
    | "Anti-Clichê"
    | "Quebra de Objeção";
  readonly titleText: string;
  readonly estimatedCtrBadge: string;
  readonly isSelected: boolean;
}

export interface ImagePromptAsset {
  readonly id: string;
  readonly targetPiece: string;
  readonly visualConceptPT: string;
  readonly promptEnglish: string;
  readonly textOverlaySuggestion: string;
}

export interface ScriptVersionSnapshot {
  readonly versionLabel: string;
  readonly savedAt: string;
  readonly modeUsed: ScriptSpeakingMode;
  readonly summaryNote: string;
}

export interface EditorialScriptRecord {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly formatSlug: ScriptFormatSlug;
  readonly calendarSlotFormat: SlotContentFormat;
  readonly originType: "calendar_slot" | "theme_library";
  readonly linkedSlotId?: string;
  readonly linkedSlotLabel: string;
  readonly linkedThemeId?: string;
  readonly retinaType: RetinaTypeKey;
  readonly strategicObjective: string;
  readonly editorialPillar: string;
  readonly icpPainOrObjection: string;
  readonly businessMoment: string;
  readonly platform: string;
  readonly estimatedDurationOrSize: string;
  readonly status: ScriptProductionStatus;
  readonly speakingMode: ScriptSpeakingMode;
  readonly version: string;
  readonly updatedAt: string;

  /* 1. Blocos de Roteiro (Vídeo Curto / Vídeo Longo / Live / Post Estático) */
  readonly scriptBlocks: readonly ScriptBlockRow[];
  readonly connectionSevenLinesChecklist: readonly string[];

  /* 2. Lâminas de Carrossel 4:5 (10 slides) */
  readonly carouselSlides: readonly CarouselSlideItem[];

  /* 3. Sequências Diárias de Stories (Manhã, Almoço, Tarde, Noite + Q&A + Pós-Live) */
  readonly storyPeriods: readonly StoryPeriodSequence[];
  readonly predictiveQAs: readonly PredictiveQAItem[];
  readonly postLiveStoriesSummary: readonly string[];

  /* 4. Legenda / Descrição + Metadados de SEO */
  readonly captionOutdoorHook: string;
  readonly captionBody: string;
  readonly captionCta: string;
  readonly seoKeywords: readonly string[];
  readonly seoTags: readonly string[];
  readonly youtubeChapters: readonly string[];

  /* 5. Títulos (Mínimo 5-6) & Prompts de Imagem em Inglês */
  readonly titleVariations: readonly TitleVariationItem[];
  readonly imagePrompts: readonly ImagePromptAsset[];

  /* 6. Materiais Complementares (Funil/Isca) & Materiais de Explicação (Didático) */
  readonly qualifiedForComplementaryMaterial: boolean;
  readonly complementaryMaterial: {
    readonly typeLabel: "Checklist PDF" | "Workbook Prático" | "Planilha Executiva XLSX";
    readonly title: string;
    readonly promise: string;
    readonly sectionsOutline: readonly string[];
  };
  readonly explanationMaterial: {
    readonly typeLabel: "Mapa Mental da Aula" | "Framework Visual PDF" | "Planilha Didática";
    readonly title: string;
    readonly diagramNodes: readonly string[];
  };

  /* 7. Briefing de Recorte, História da Marca & Referências */
  readonly briefingCutAdjustment: string;
  readonly mandatoryExamplesToInclude: string;
  readonly brandStoryConnection: string;
  readonly selectedReferenceNote: string;
  readonly versionHistory: readonly ScriptVersionSnapshot[];
}

export interface RoteirosEditorialModuleProps {
  readonly projectId?: string;
  readonly projectName?: string;
  readonly projectNiche?: string;
  readonly projectSubniche?: string;
  readonly projectObjective?: string;
  readonly currentPhase?: string;
  readonly hasActiveLine?: boolean;
  readonly hasActiveCalendar?: boolean;
  readonly initialFormatSlug?: ScriptFormatSlug | null;
  readonly initialScriptId?: string | null;
  readonly initialPreselectedSlotId?: string | null;
  readonly initialPreselectedThemeTitle?: string | null;
  readonly isStandaloneStudioPage?: boolean;
  readonly onGoToLineTab?: () => void;
  readonly onGoToCalendarTab?: () => void;
  readonly onGoToThemesTab?: () => void;
}

/* ========================================================================== */
/* METADADOS DOS 6 FORMATOS OFICIAIS DA FUNÇÃO 03                             */
/* ========================================================================== */

export const SCRIPT_FORMATS_CATALOG: readonly {
  readonly slug: ScriptFormatSlug;
  readonly slotFormat: SlotContentFormat;
  readonly name: string;
  readonly shortName: string;
  readonly subtitle: string;
  readonly defaultDuration: string;
  readonly supportsSpeakingModeToggle: boolean;
  readonly forcesConnectionModeOnly: boolean;
  readonly icon: typeof Video;
  readonly accentBorder: string;
}[] = [
  {
    slug: "short_video",
    slotFormat: "reel_curto",
    name: "Vídeos Curtos (Reels / Shorts / TikTok)",
    shortName: "Vídeos Curtos",
    subtitle:
      "Scripts de até 60s com retenção cirúrgica, 7 bullets de câmera ou 2 colunas palavra por palavra.",
    defaultDuration: "45s a 60s (~140 palavras)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: Play,
    accentBorder: "border-la-border-gold/65",
  },
  {
    slug: "long_video",
    slotFormat: "video_longo",
    name: "Vídeos Longos (YouTube)",
    shortName: "Vídeos Longos",
    subtitle:
      "Aulas densas de 8 a 15 min em blocos encadeados, microciclos visuais a cada 20s, SEO e material didático.",
    defaultDuration: "10 a 15 min (~1.800 palavras)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: Video,
    accentBorder: "border-sky-400/50",
  },
  {
    slug: "live",
    slotFormat: "live_semanal",
    name: "Lives de Conteúdo (YouTube / Instagram / TikTok)",
    shortName: "Lives",
    subtitle:
      "Roteiro cronológico em Bullets de Alta Retenção + Sequência de Stories de Bastidores Pós-Live.",
    defaultDuration: "45 a 60 min (Ao Vivo)",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: true,
    icon: Radio,
    accentBorder: "border-rose-400/50",
  },
  {
    slug: "carousel",
    slotFormat: "carrossel",
    name: "Carrosséis 4:5 (Anatomia de 10 Slides)",
    shortName: "Carrosséis",
    subtitle:
      "Pipeline slide a slide com psicologia de corte de linha, design escaneável e prompts visuais por lâmina.",
    defaultDuration: "10 Lâminas (Proporção 4:5)",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: false,
    icon: Columns,
    accentBorder: "border-purple-400/50",
  },
  {
    slug: "static_post",
    slotFormat: "post_estatico",
    name: "Posts Estáticos de Alto Impacto",
    shortName: "Posts Estáticos",
    subtitle:
      "Síntese visual de autoridade, contraste ou diagnóstico rápido com legenda densa e prompt em inglês.",
    defaultDuration: "Peça Única + Legenda",
    supportsSpeakingModeToggle: false,
    forcesConnectionModeOnly: false,
    icon: LayoutGrid,
    accentBorder: "border-white/25",
  },
  {
    slug: "stories_sequence",
    slotFormat: "sequencia_stories",
    name: "Sequências Diárias de Stories (M·A·T·N + Q&A)",
    shortName: "Sequências de Stories",
    subtitle:
      "Cronograma completo (Manhã, Almoço, Tarde e Noite) com 5 cards por bloco, legenda espelho e Q&A preditivo.",
    defaultDuration: "4 Blocos/dia (20 stories)",
    supportsSpeakingModeToggle: true,
    forcesConnectionModeOnly: false,
    icon: MessageSquare,
    accentBorder: "border-emerald-400/50",
  },
] as const;

export const SCRIPT_STATUS_META: Record<
  ScriptProductionStatus,
  { readonly label: string; readonly badgeClass: string }
> = {
  draft: {
    label: "Rascunho",
    badgeClass: "border-white/15 bg-white/[0.05] text-la-text-secondary",
  },
  ready: {
    label: "Pronto",
    badgeClass: "border-la-gold bg-la-gold/20 text-la-gold-light",
  },
  in_production: {
    label: "Em Produção",
    badgeClass: "border-sky-400/50 bg-sky-500/15 text-sky-200",
  },
  ab_test: {
    label: "Em Teste A/B",
    badgeClass: "border-purple-400/50 bg-purple-500/15 text-purple-200",
  },
  published: {
    label: "Publicado",
    badgeClass: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  },
  archived: {
    label: "Arquivado",
    badgeClass: "border-white/10 bg-black/50 text-la-text-muted",
  },
};

export function mapSlotFormatToScriptSlug(
  slotFormat: SlotContentFormat
): ScriptFormatSlug {
  switch (slotFormat) {
    case "reel_curto":
      return "short_video";
    case "video_longo":
      return "long_video";
    case "live_semanal":
      return "live";
    case "carrossel":
      return "carousel";
    case "post_estatico":
      return "static_post";
    case "sequencia_stories":
      return "stories_sequence";
  }
}

/* ========================================================================== */
/* MOTOR GERADOR DE PACOTE COMPLETO DE ROTEIRO POR FORMATO                    */
/* ========================================================================== */

export function buildCompleteScriptPackage(params: {
  readonly id?: string;
  readonly projectId: string;
  readonly title: string;
  readonly formatSlug: ScriptFormatSlug;
  readonly originType: "calendar_slot" | "theme_library";
  readonly linkedSlotId?: string;
  readonly linkedSlotLabel: string;
  readonly linkedThemeId?: string;
  readonly retinaType: RetinaTypeKey;
  readonly strategicObjective: string;
  readonly editorialPillar: string;
  readonly icpPainOrObjection: string;
  readonly businessMoment: string;
  readonly platform: string;
  readonly niche: string;
  readonly subniche: string;
  readonly speakingMode?: ScriptSpeakingMode;
  readonly qualifiedForMaterial?: boolean;
  readonly status?: ScriptProductionStatus;
}): EditorialScriptRecord {
  const {
    projectId,
    title,
    formatSlug,
    originType,
    linkedSlotId,
    linkedSlotLabel,
    linkedThemeId,
    retinaType,
    strategicObjective,
    editorialPillar,
    icpPainOrObjection,
    businessMoment,
    platform,
    niche,
    subniche,
  } = params;

  const formatMeta =
    SCRIPT_FORMATS_CATALOG.find((f) => f.slug === formatSlug) ??
    SCRIPT_FORMATS_CATALOG[0]!;

  const resolvedMode: ScriptSpeakingMode = formatMeta.forcesConnectionModeOnly
    ? "conexao_bullets"
    : params.speakingMode || "conexao_bullets";

  const isQualified =
    params.qualifiedForMaterial ??
    (formatSlug === "long_video" ||
      formatSlug === "carousel" ||
      formatSlug === "live");

  /* 1. Blocos Estruturados (Vídeo Curto / Vídeo Longo / Live / Post Estático) */
  const scriptBlocks: ScriptBlockRow[] =
    formatSlug === "long_video"
      ? [
          {
            id: "blk-long-1",
            timecodeOrStage: "0:00 – 1:00 · Fase 1: Introdução Impactante",
            psychologicalRole:
              "Quebra de padrão imediata + Contrato de Clique + Contraste do Motivo Irresistível",
            visualAndAudioDirection:
              "[0:00] Enquadramento fechado, corte seco sem vinheta. [0:18] B-Roll contrastando operação manual caótica vs. painel estruturado + SFX Swoosh grave.",
            wordForWordSpeech: `Se você continua tentando escalar seus resultados em ${subniche} repetindo o padrão tradicional do mercado, você está pagando o imposto mais caro que existe: o imposto do improviso. Nos próximos minutos, vou abrir os 4 pilares exatos para resolver "${title}" — mas preste muita atenção no terceiro pilar, porque é nele que 90% dos profissionais travam.`,
            connectionBulletLine: `BULLET 1 (MOTIVO IRRESISTÍVEL): Contraste o que o comprador ganha aplicando "${title}" hoje vs. o custo invisível de continuar improvisando em ${subniche}.`,
          },
          {
            id: "blk-long-2",
            timecodeOrStage: "1:00 – 2:30 · Fase 2: Contextualização & Autoridade",
            psychologicalRole:
              "Ancoragem de autoridade prática + Desconstrução do mito central do ICP",
            visualAndAudioDirection:
              "[1:15] Zoom in gradual de 8% + GC na parte inferior com a tese central. [1:45] Gráfico comparativo surgindo na tela à esquerda.",
            wordForWordSpeech: `Quando analisamos dezenas de operações reais de ${niche}, descobrimos um padrão silencioso. O problema nunca foi falta de esforço técnico; foi tentar executar peças isoladas sem conectar com a oferta e com o Mecanismo Único. Veja por que a abordagem comum falha...`,
            connectionBulletLine: `BULLET 2 (ESCLARECIMENTO EM CAIXA ALTA): "EXISTEM 4 PILARES ESSENCIAIS PARA DOMINAR ISSO EM ${subniche.toUpperCase()}, MAS O TERCEIRO É O QUE SEPARA AMADORES DE PROFISSIONAIS."`,
          },
          {
            id: "blk-long-3",
            timecodeOrStage: "2:30 – 8:30 · Fase 3: Desenvolvimento em Microciclos (MUV)",
            psychologicalRole:
              "Entrega densa dos pilares + Demonstração prática do método proprietário",
            visualAndAudioDirection:
              "[Marcação a cada 20s] Alternar entre câmera principal, compartilhamento de tela/quadro branco e B-Roll demonstrativo do passo a passo.",
            wordForWordSpeech: `O primeiro movimento consiste em isolar a variável crítica de ${subniche}. Em vez de olhar para dezenas de indicadores soltos, você aplica o filtro de contexto: qual decisão precisa ser tomada antes que a execução comece? Vamos ver na tela os 3 passos operacionais...`,
            connectionBulletLine: `BULLET 3 (DESENVOLVIMENTO MUV): Apresente os 3 passos práticos do pilar "${editorialPillar}", usando exemplo real de bastidor e mantendo open loop para o fechamento.`,
          },
          {
            id: "blk-long-4",
            timecodeOrStage: "8:30 – 11:30 · Fase 4: Quebra de Objeção & Virada de Chave",
            psychologicalRole:
              "Neutralização da trava mental do comprador + Prova de viabilidade na rotina",
            visualAndAudioDirection:
              "[8:45] Mudança de trilha sonora para tom mais firme e consultivo. Corte para câmera próxima aos olhos.",
            wordForWordSpeech: `Talvez você esteja pensando: "${icpPainOrObjection}". E é exatamente por isso que desenhamos este protocolo para funcionar em blocos enxutos, sem exigir que você refaça tudo do zero toda semana.`,
            connectionBulletLine: `BULLET 4 (QUEBRA DE OBJEÇÃO): Responda diretamente à objeção "${icpPainOrObjection}" mostrando como o método economiza tempo real.`,
          },
          {
            id: "blk-long-5",
            timecodeOrStage: "11:30 – 13:30 · Fase 5: CTA Estratégico & Material Complementar",
            psychologicalRole:
              "Chamada para ação sem parecer encerramento precoce + Entrega da isca/próximo passo",
            visualAndAudioDirection:
              "[11:40] Exibir mockup do Material Complementar na tela + Link destacado no primeiro comentário fixado.",
            wordForWordSpeech: `Para você aplicar imediatamente essa estrutura na sua operação de ${subniche}, deixei aqui abaixo o acesso ao nosso diagnóstico prático e ao próximo passo da nossa formação. Clique no primeiro link da descrição agora mesmo.`,
            connectionBulletLine: `BULLET 5 (FECHAMENTO & CTA): Convide para baixar o Material Complementar qualificado e dar o próximo passo na oferta principal.`,
          },
        ]
      : formatSlug === "live"
        ? [
            {
              id: "blk-live-1",
              timecodeOrStage: "00:00 – 08:00 · Bloco 1: Abertura Magnética & Acordo da Live",
              psychologicalRole:
                "Retenção dos primeiros espectadores + Promessa da transmissão + Incentivo de compartilhamento",
              visualAndAudioDirection:
                "Quadro branco ou slides de apoio visíveis. Pedir para a audiência digitar no chat de qual cidade/nicho estão acompanhando.",
              wordForWordSpeech:
                "[Modo Segurança desativado em Lives para preservar naturalidade ao vivo]",
              connectionBulletLine: `• Dar boas-vindas energéticas e cravar a promessa da Live: "${title}".\n• Fazer pergunta diagnóstica no chat: "Quem aqui sente que ${icpPainOrObjection}?"\n• Anunciar o Material Complementar exclusivo para quem ficar até o bloco final.`,
            },
            {
              id: "blk-live-2",
              timecodeOrStage: "08:00 – 25:00 · Bloco 2: Desconstrução do Erro Invisível",
              psychologicalRole:
                "Elevar nível de consciência mostrando por que as tentativas anteriores falharam",
              visualAndAudioDirection:
                "Desenhar o contraste entre o 'Modelo Improvisado' e o 'Sistema Orientado por Contexto'.",
              wordForWordSpeech: "",
              connectionBulletLine: `• Explicar por que 90% do mercado de ${niche} erra ao ignorar "${editorialPillar}".\n• Contar caso real de bastidor demonstrando o custo de operar no improviso.\n• Ler 2 comentários do chat para validar a dor em tempo real.`,
            },
            {
              id: "blk-live-3",
              timecodeOrStage: "25:00 – 45:00 · Bloco 3: Entrega dos 3 Pilares Práticos (MUV)",
              psychologicalRole:
                "Ensino profundo de autoridade + Demonstração do Mecanismo Único da Oferta",
              visualAndAudioDirection:
                "Mostrar na tela o passo a passo estruturado e abrir para 2 diagnósticos ao vivo.",
              wordForWordSpeech: "",
              connectionBulletLine: `• Entregar os 3 pilares práticos de "${title}" sem esconder o jogo no "o quê", gerando desejo pelo "como implementar com acompanhamento".\n• Fazer micro-pitch consultivo conectando o método à oferta principal.`,
            },
            {
              id: "blk-live-4",
              timecodeOrStage: "45:00 – 60:00 · Bloco 4: Q&A Estratégico & Convite de Conversão",
              psychologicalRole:
                "Quebra de objeções ao vivo + Direcionamento direto para aplicação/compra",
              visualAndAudioDirection:
                "Fixar link/palavra-chave no chat e exibir QR Code ou comando de Direct.",
              wordForWordSpeech: "",
              connectionBulletLine: `• Responder as 3 dúvidas mais quentes do chat conectando cada resposta à superação de "${icpPainOrObjection}".\n• Chamada direta para ação (CTA): instruir exatamente onde clicar para acessar o Material Complementar e a oferta.`,
            },
          ]
        : [
            {
              id: "blk-short-1",
              timecodeOrStage: "00s – 03s · 1. Gancho (Hook Ininterrupto)",
              psychologicalRole:
                "Parar o scroll nos primeiros 2 segundos expondo uma contradição ou erro invisível",
              visualAndAudioDirection:
                "Corte seco no frame 1. Expressão firme olhando direto para a lente + Legenda dinâmica destacando a palavra-chave em dourado.",
              wordForWordSpeech: `O maior erro que trava seus resultados em ${subniche} não é falta de técnica — é começar toda semana no improviso.`,
              connectionBulletLine: `1. GANCHO (0-3s): Crave a tese contraintuitiva sobre "${title}" logo na primeira frase.`,
            },
            {
              id: "blk-short-2",
              timecodeOrStage: "03s – 12s · 2. Agitação do Problema Real",
              psychologicalRole:
                "Gerar identificação visceral descrevendo o sintoma exato que o ICP vive na rotina",
              visualAndAudioDirection:
                "Leve aproximação de câmera (zoom in 1.08x) + B-Roll rápido de 2s ilustrando a dor do comprador.",
              wordForWordSpeech: `Você dedica horas na operação, tenta aplicar táticas soltas, mas na hora de converter em vendas previsíveis, parece que todo esforço evapora.`,
              connectionBulletLine: `2. AGITAÇÃO (3-12s): Descreva o sintoma diário de quem sofre com "${icpPainOrObjection}".`,
            },
            {
              id: "blk-short-3",
              timecodeOrStage: "12s – 35s · 3. Virada de Chave & Mecanismo Único",
              psychologicalRole:
                "Entregar a lógica de causa e efeito do método proprietário (MUV)",
              visualAndAudioDirection:
                "Mostrar 3 tópicos visuais curtos surgindo na tela à medida que enumera os pontos.",
              wordForWordSpeech: `Isso acontece porque peças soltas não constroem autoridade. Quando você conecta Base Estratégica, Linha Editorial e execução em ${subniche}, cada ação passa a cumprir uma função clara de conversão.`,
              connectionBulletLine: `3. MECANISMO (12-35s): Explique em 3 passos rápidos como o pilar "${editorialPillar}" resolve a raiz do problema.`,
            },
            {
              id: "blk-short-4",
              timecodeOrStage: "35s – 48s · 4. Quebra de Objeção & Prova",
              psychologicalRole:
                "Remover a desculpa mental imediata do espectador",
              visualAndAudioDirection:
                "Retorno para enquadramento central limpo, tom de voz seguro e pausado.",
              wordForWordSpeech: `E você não precisa de mais horas no seu dia para fazer isso — você precisa apenas parar de decidir em cima da hora.`,
              connectionBulletLine: `4. QUEBRA DE OBJEÇÃO (35-48s): Neutralize a trava de tempo/complexidade mostrando que método reduz esforço.`,
            },
            {
              id: "blk-short-5",
              timecodeOrStage: "48s – 60s · 5. Chamada para Ação (CTA Contextual)",
              psychologicalRole:
                "Conduzir para salvamento, comentário-chave ou leitura da legenda",
              visualAndAudioDirection:
                "Indicação visual apontando para a legenda / ícone de salvar.",
              wordForWordSpeech: `Eu deixei o passo a passo completo detalhado aqui na legenda. Leia agora e salve este vídeo para consultar antes da sua próxima semana.`,
              connectionBulletLine: `5. CTA (48-60s): Peça para salvar o vídeo e ler a legenda onde está o detalhamento prático.`,
            },
          ];

  /* Lista de 7 linhas sequenciais do Modo Conexão (Seção 4.1.2) */
  const connectionSevenLinesChecklist: string[] = [
    `01. [GANCHO 0-3s] Pare de tentar resolver ${subniche} no improviso diário.`,
    `02. [SINTOMA] Você trabalha muito no bastidor, mas sua comunicação não reflete seu nível real.`,
    `03. [CAUSA RAIZ] O problema não é o seu produto — é agir sem conectar com "${editorialPillar}".`,
    `04. [VIRADA MUV] Primeiro defina o contexto e a promessa ROMA; só depois execute a peça.`,
    `05. [PASSO PRÁTICO] Aplique a regra de 1 objetivo claro e 1 tipo RETINA (${retinaType}) por publicação.`,
    `06. [QUEBRA DE TRAVA] Isso leva menos de 45 minutos por semana quando o sistema está montado.`,
    `07. [CTA DIRETO] Salve este conteúdo e leia a legenda para aplicar o protocolo completo hoje.`,
  ];

  /* 2. Lâminas de Carrossel 4:5 (10 slides completos — Seção 4.4) */
  const carouselSlides: CarouselSlideItem[] = [
    {
      slideNumber: 1,
      roleLabel: "Slide 01 · Capa Magnética (Hook & Promessa)",
      headline: title,
      bodyLineBreakCopy: `O protocolo prático para dominar ${subniche}\nsem depender de improviso diário.`,
      visualDesignNote:
        "Fundo #080B12 (Obsidian Dark), tipografia principal em branco puro, destaque na palavra-chave em Ouro (#D4AF37), seta discreta de swipe no canto direito.",
      imagePromptEN: `Minimalist luxury editorial cover, dark obsidian background #080B12, subtle champagne gold geometric lines #D4AF37, high contrast studio lighting, executive authority aesthetic for ${niche}, 4:5 aspect ratio --ar 4:5`,
    },
    {
      slideNumber: 2,
      roleLabel: "Slide 02 · O Sintoma Silencioso (Identificação)",
      headline: "Por que tanto esforço gera tão pouca previsibilidade?",
      bodyLineBreakCopy: `A maioria dos profissionais em ${niche} acredita que\nprecisa apenas aumentar o volume de trabalho.\n\nMas volume sem direção estratégica só acelera o desgaste.`,
      visualDesignNote: "Layout editorial em 2 blocos com linha divisória dourada sutil.",
      imagePromptEN: `Abstract dark editorial graphic showing scattered arrows vs one single golden laser beam of direction, dark navy and gold palette --ar 4:5`,
    },
    {
      slideNumber: 3,
      roleLabel: "Slide 03 · Diagnóstico do Erro Invisível",
      headline: "Onde 90% das operações travam de verdade",
      bodyLineBreakCopy: `O gargalo acontece quando você tenta decidir o que fazer\nno exato momento de executar.\n\nIsso gera ruído e atrai apenas curiosos desqualificados.`,
      visualDesignNote: "Destaque em caixa de alerta escura com borda âmbar/dourada.",
      imagePromptEN: `Dark glassmorphism UI card showing diagnostic metrics in gold and emerald on deep black background --ar 4:5`,
    },
    {
      slideNumber: 4,
      roleLabel: "Slide 04 · A Virada de Paradigma (A Tese)",
      headline: "A execução nunca começa pela peça final.",
      bodyLineBreakCopy: `Ela começa pelo contexto estratégico:\n• Qual oferta precisa ser apoiada?\n• Qual objeção do ICP será quebrada?\n• Qual função RETINA (${retinaType}) está em jogo?`,
      visualDesignNote: "Lista numerada escaneável com ícones dourados.",
      imagePromptEN: `Architectural blueprint in glowing gold lines over dark matte obsidian surface, precision engineering metaphor --ar 4:5`,
    },
    {
      slideNumber: 5,
      roleLabel: "Slide 05 · Passo 01 do Método (MUV em Ação)",
      headline: "Passo 01: Isole a Variável Prioritária",
      bodyLineBreakCopy: `Em ${subniche}, elimine tudo que não contribui para\n"${strategicObjective}".\n\nFoque 100% da mensagem em uma única transformação clara.`,
      visualDesignNote: "Badge 'PASSO 01' no topo esquerdo em fundo dourado.",
      imagePromptEN: `Minimalist golden compass needle pointing north on dark slate texture, macro photography, shallow depth of field --ar 4:5`,
    },
    {
      slideNumber: 6,
      roleLabel: "Slide 06 · Passo 02 do Método (Estrutura)",
      headline: "Passo 02: Conecte o Pilar à Dor do Comprador",
      bodyLineBreakCopy: `Pilar ativo: ${editorialPillar}.\n\nQuando o comprador percebe que você descreve o problema dele\nmelhor do que ele mesmo, a autoridade é instantânea.`,
      visualDesignNote: "Diagrama simples de causa -> efeito no centro da lâmina.",
      imagePromptEN: `Two interlocking golden rings symbolizing connection between strategy and buyer psychology on dark background --ar 4:5`,
    },
    {
      slideNumber: 7,
      roleLabel: "Slide 07 · Passo 03 do Método (Ritmo Realista)",
      headline: "Passo 03: Respeite sua Capacidade Real",
      bodyLineBreakCopy: `Não construa um plano de fantasia.\n\nUma agenda enxuta executada com precisão supera qualquer\nplanejamento gigante que morre na segunda semana.`,
      visualDesignNote: "Comparativo visual lado a lado: Fantasia (X) vs. Realidade Executável (✓).",
      imagePromptEN: `Clean dark executive calendar grid with glowing gold highlights, high-end SaaS interface aesthetic --ar 4:5`,
    },
    {
      slideNumber: 8,
      roleLabel: "Slide 08 · Quebra da Objeção Principal",
      headline: `"Mas e se: ${icpPainOrObjection}?"`,
      bodyLineBreakCopy: `É exatamente quando a rotina está intensa que você mais\nprecisa de um sistema pré-definido.\n\nO método existe para devolver tempo, não para tomar.`,
      visualDesignNote: "Citação da objeção no topo + resposta direta em destaque.",
      imagePromptEN: `Dark luxury hourglass with golden sand flowing smoothly, symbol of time mastery and executive control --ar 4:5`,
    },
    {
      slideNumber: 9,
      roleLabel: "Slide 09 · Resumo Executivo (Lâmina de Salvamento)",
      headline: "Resumo para Consultar Sempre:",
      bodyLineBreakCopy: `1. Nunca execute sem contexto estratégico.\n2. Ataque uma dor ou objeção real de ${subniche}.\n3. Equilibre os 6 tipos da matriz RETINA.\n4. Transforme cada pauta em um ativo reutilizável.`,
      visualDesignNote: "Quadro estilo 'Cheat Sheet' desenhado para estimular o clique em Salvar.",
      imagePromptEN: `Structured golden checklist card floating over dark carbon background, crisp lighting --ar 4:5`,
    },
    {
      slideNumber: 10,
      roleLabel: "Slide 10 · Chamada para Ação (CTA & Próximo Passo)",
      headline: "Salve este post para aplicar na sua semana.",
      bodyLineBreakCopy: `Quer ter acesso ao nosso material prático de ${subniche}?\n\nLeia a legenda abaixo e comente a palavra-chave ou acesse\no link do nosso perfil.`,
      visualDesignNote: "Botão visual de Salvar + Compartilhar destacados em ouro champagne.",
      imagePromptEN: `Minimalist dark luxury closing slide with golden bookmark icon and subtle spotlight --ar 4:5`,
    },
  ];

  /* 3. Sequências Diárias de Stories (4 Blocos x 5 Cards = 20 Stories + Q&A — Seção 4.6) */
  const buildStoryCardsForPeriod = (
    period: "Manhã" | "Almoço" | "Tarde" | "Noite"
  ): StoryCardItem[] => [
    {
      cardNumber: 1,
      cardType: "texto_sobre_foto",
      intentionLabel: `Card 1 (${period}) · Abertura & Contextualização Silenciosa`,
      wordForWordScript: `Hoje o foco na nossa operação de ${subniche} está em um ponto que 90% ignora: "${title}".\n\nSe você já sentiu que ${icpPainOrObjection.toLowerCase()}, acompanhe os próximos stories.`,
      connectionBullet: `Foto de bastidor de trabalho + Texto de 3 parágrafos curtos introduzindo "${title}".`,
      mirrorCaptionNoSound: `Foco do dia em ${subniche}: como resolver "${title}" sem improviso.`,
      instagramSticker: "Enquete: Você já tem isso estruturado hoje? [Sim, 100% / Ainda travo nisso]",
      visualBrandingNote: "Foto autoral escurecida em 40% + Caixa de texto com fundo preto translúcido e título em Ouro.",
    },
    {
      cardNumber: 2,
      cardType: "video_fala",
      intentionLabel: `Card 2 (${period}) · Diagnóstico Falado + Legenda Espelho`,
      wordForWordScript: `Olha só: muita gente me pergunta por que trava nessa etapa de ${subniche}. A verdade é que sem definir "${editorialPillar}" antes, qualquer esforço vira retrabalho.`,
      connectionBullet: `[VÍDEO 15s] Olhar direto p/ câmera -> Explicar a causa raiz de "${title}" em 1 frase forte.`,
      mirrorCaptionNoSound: `RESUMO NA TELA: Por que tentar executar ${subniche} sem definir "${editorialPillar}" gera retrabalho constante.`,
      instagramSticker: "Sem sticker (foco total na retenção da fala e leitura da legenda espelho)",
      visualBrandingNote: "Enquadramento vertical limpo + Legenda espelho posicionada no terço central para leitura sem áudio.",
    },
    {
      cardNumber: 3,
      cardType: "bastidor_prova",
      intentionLabel: `Card 3 (${period}) · Bastidor Prático / Framework na Tela`,
      wordForWordScript: `Aqui está exatamente como nós estruturamos esse bloco na prática:\n1. Diagnóstico do gargalo\n2. Alinhamento com a promessa ROMA\n3. Execução enxuta conectada à meta de ${strategicObjective.toLowerCase()}.`,
      connectionBullet: `Print ou foto da tela mostrando os 3 passos práticos aplicados no projeto.`,
      mirrorCaptionNoSound: `Os 3 passos que usamos no bastidor para garantir ${strategicObjective.toLowerCase()}.`,
      instagramSticker: "Slider de Reação (🔥): Faz sentido essa lógica para o seu momento?",
      visualBrandingNote: "Fundo #080B12 ou foto de monitor com setas douradas apontando para a estrutura.",
    },
    {
      cardNumber: 4,
      cardType: "video_fala",
      intentionLabel: `Card 4 (${period}) · Quebra de Objeção & Aprofundamento`,
      wordForWordScript: `E se você acha que precisa do dia inteiro livre para aplicar isso em ${niche}, é justamente o contrário: ter essa clareza economiza horas da sua semana.`,
      connectionBullet: `[VÍDEO 15s] Quebrar a objeção "${icpPainOrObjection}" com exemplo real.`,
      mirrorCaptionNoSound: `Clareza estratégica não toma o seu tempo — ela devolve horas da sua semana em ${niche}.`,
      instagramSticker: "Sem sticker",
      visualBrandingNote: "Legenda espelho com destaque colorido nas palavras-chave de transformação.",
    },
    {
      cardNumber: 5,
      cardType: "texto_sobre_foto",
      intentionLabel: `Card 5 (${period}) · Fechamento do Bloco & Abertura de Interação`,
      wordForWordScript: `Qual é a sua maior dúvida hoje sobre aplicar essa estrutura na sua operação de ${subniche}?\n\nDeixe aqui abaixo que vou responder as mais estratégicas no próximo bloco.`,
      connectionBullet: `Card final do bloco convidando para interação direta na caixinha ou Direct.`,
      mirrorCaptionNoSound: `Mande sua dúvida específica sobre ${subniche} na caixinha abaixo.`,
      instagramSticker:
        period === "Tarde" || period === "Noite"
          ? `Caixa de Perguntas: "Qual seu maior gargalo hoje em ${subniche}?"`
          : `Enquete Qualificadora: "Quer ver um exemplo prático disso no próximo bloco?"`,
      visualBrandingNote: "Design limpo centralizando o Sticker interativo na zona de toque confortável (Lei de Fitts).",
    },
  ];

  const storyPeriods: StoryPeriodSequence[] = [
    {
      period: "Manhã",
      suggestedTime: "08:30",
      narrativeTheme: `Abertura Contextual & Diagnóstico — ${title}`,
      cards: buildStoryCardsForPeriod("Manhã"),
    },
    {
      period: "Almoço",
      suggestedTime: "12:30",
      narrativeTheme: `Bastidor Técnico & Micro-Transformação — ${editorialPillar}`,
      cards: buildStoryCardsForPeriod("Almoço"),
    },
    {
      period: "Tarde",
      suggestedTime: "16:30",
      narrativeTheme: `Autoridade, Prova Real & Manifesto de Valores`,
      cards: buildStoryCardsForPeriod("Tarde"),
    },
    {
      period: "Noite",
      suggestedTime: "20:30",
      narrativeTheme: `Respostas Preditivas de Q&A & Condução para Oferta`,
      cards: buildStoryCardsForPeriod("Noite"),
    },
  ];

  const predictiveQAs: PredictiveQAItem[] = [
    {
      id: "qa-1",
      questionFromAudience: `Como começar a estruturar isso em ${subniche} se minha rotina já está no limite?`,
      strategicAnswerCopy: `Comece isolando apenas os 2 formatos de maior alavancagem da sua semana. Você não vence pelo volume de horas, mas pela precisão do contexto estratégico antes de executar.`,
      recommendedFormat: "Vídeo com Legenda Espelho",
      qualifiedForMaterial: true,
    },
    {
      id: "qa-2",
      questionFromAudience: `Essa metodologia funciona mesmo para quem tem um público muito técnico em ${niche}?`,
      strategicAnswerCopy: `Públicos técnicos são os que mais rejeitam promessas rasas e mais valorizam método claro (MUV). Quando você organiza sua linha editorial por pilares lógicos, sua autoridade multiplica.`,
      recommendedFormat: "Texto sobre Foto",
      qualifiedForMaterial: false,
    },
    {
      id: "qa-3",
      questionFromAudience: `Qual é o próximo passo para implementar isso com o acompanhamento de vocês?`,
      strategicAnswerCopy: `Nós organizamos todo esse ecossistema junto com você para que sua operação rode com previsibilidade. Me envie a palavra "DIREÇÃO" aqui no Direct que te explico como funciona.`,
      recommendedFormat: "Vídeo com Legenda Espelho",
      qualifiedForMaterial: true,
    },
  ];

  /* 4. Legenda com Gancho Outdoor + SEO */
  const captionOutdoorHook = `${title.toUpperCase()} — A verdade que separa operações previsíveis de quem vive apagando incêndio em ${subniche}.`;
  const captionBody = [
    `Publicar ou executar ações isoladas em ${niche} sem uma direção estratégica clara é o caminho mais rápido para trabalhar muito e colher resultados inconstantes.`,
    `Quando analisamos o pilar "${editorialPillar}", fica evidente que o verdadeiro gargalo não está na falta de esforço, mas em tentar decidir tudo no improviso.`,
    `Neste conteúdo, estruturamos os 3 pontos centrais para você virar essa chave:\n• Como identificar o erro invisível que drena sua margem;\n• Como conectar cada ação ao Mecanismo Único da sua oferta;\n• Como manter consistência respeitando sua capacidade real de produção.`,
  ].join("\n\n");
  const captionCta = isQualified
    ? `Salve este conteúdo para consultar na sua semana e comente "MAPA" (ou acesse o link da descrição/bio) para baixar o material complementar prático desta pauta.`
    : `Salve este post para revisar antes do seu próximo planejamento semanal e compartilhe com quem precisa organizar a operação de ${subniche}.`;

  /* 5. Mínimo de 6 Títulos Etiquetados por Gancho + Prompts de Imagem (EN) */
  const titleVariations: TitleVariationItem[] = [
    {
      id: "ttl-1",
      hookCategory: "Erro Invisível",
      titleText: title,
      estimatedCtrBadge: "CTR Alto • Principal",
      isSelected: true,
    },
    {
      id: "ttl-2",
      hookCategory: "Contraste Direto",
      titleText: `Por que 90% trava em ${subniche} (e o protocolo de 4 etapas para ter previsibilidade)`,
      estimatedCtrBadge: "Retenção Forte",
      isSelected: false,
    },
    {
      id: "ttl-3",
      hookCategory: "Mecanismo Único (MUV)",
      titleText: `A Engenharia Silenciosa por trás de uma operação de ${subniche} enxuta e lucrativa`,
      estimatedCtrBadge: "Autoridade Premium",
      isSelected: false,
    },
    {
      id: "ttl-4",
      hookCategory: "Anti-Clichê",
      titleText: `Pare de seguir a regra tradicional de ${niche}: faça este ajuste estrutural antes`,
      estimatedCtrBadge: "Quebra de Padrão",
      isSelected: false,
    },
    {
      id: "ttl-5",
      hookCategory: "Quebra de Objeção",
      titleText: `Como dominar ${subniche} em menos de 1 hora por semana sem depender de improviso`,
      estimatedCtrBadge: "Foco em Rotina",
      isSelected: false,
    },
    {
      id: "ttl-6",
      hookCategory: "Estudo de Caso / Prova",
      titleText: `Por dentro do nosso sistema de ${subniche}: o que mudamos para destravar a conversão`,
      estimatedCtrBadge: "Bastidor Real",
      isSelected: false,
    },
  ];

  const imagePrompts: ImagePromptAsset[] = [
    {
      id: "img-1",
      targetPiece: "Thumbnail Principal / Capa de Alto CTR",
      visualConceptPT:
        "Especialista em ambiente de estúdio escuro sofisticado, expressão firme de diagnóstico, elemento gráfico dourado representando clareza vs. ruído ao fundo.",
      promptEnglish: `Cinematic executive portrait in a dark luxury studio #080B12, dramatic rim lighting in champagne gold #D4AF37, subtle holographic strategy blueprint in the background representing ${subniche}, ultra-sharp 8k photography, high contrast, editorial authority aesthetic --ar 16:9`,
      textOverlaySuggestion: `FIM DO IMPROVISO EM ${subniche.toUpperCase()}`,
    },
    {
      id: "img-2",
      targetPiece: "Capa Vertical 9:16 / 4:5 (Reels, Carrossel ou Post Estático)",
      visualConceptPT:
        "Composição minimalista Dark/Gold com metáfora visual de precisão e controle estratégico.",
      promptEnglish: `Minimalist dark obsidian composition #080B12 with a glowing golden compass and architectural grid lines #CFA965, depth of field, luxury SaaS brand identity for ${niche}, clean negative space at top for typography --ar 4:5`,
      textOverlaySuggestion: title.slice(0, 48),
    },
  ];

  return {
    id: params.id || `scr-${Date.now()}`,
    projectId,
    title,
    formatSlug,
    calendarSlotFormat: formatMeta.slotFormat,
    originType,
    linkedSlotId,
    linkedSlotLabel,
    linkedThemeId,
    retinaType,
    strategicObjective,
    editorialPillar,
    icpPainOrObjection,
    businessMoment,
    platform,
    estimatedDurationOrSize: formatMeta.defaultDuration,
    status: params.status || "ready",
    speakingMode: resolvedMode,
    version: "v1.0",
    updatedAt: "Gerado e sincronizado agora",
    scriptBlocks,
    connectionSevenLinesChecklist,
    carouselSlides,
    storyPeriods,
    predictiveQAs,
    postLiveStoriesSummary: [
      "Story Pós-Live 01 (Texto sobre Foto): Bastidor da mesa de trabalho + 'Acabamos de encerrar uma aula densa sobre os 3 pilares da semana' + Enquete.",
      "Story Pós-Live 02 (Vídeo com Legenda Espelho): Resumo de 15s da maior virada de chave da Live + chamada para assistir à gravação.",
      "Story Pós-Live 03 (Card de Conversão): Link direto para baixar o Material Complementar liberado durante a transmissão.",
    ],
    captionOutdoorHook,
    captionBody,
    captionCta,
    seoKeywords: [
      niche.toLowerCase(),
      subniche.toLowerCase(),
      "estratégia",
      "método passo a passo",
      "previsibilidade",
    ],
    seoTags: [
      `#${niche.replace(/\s+/g, "")}`,
      `#${subniche.replace(/\s+/g, "")}`,
      "#AutoridadeImperial",
      "#EstrategiaEditorial",
    ],
    youtubeChapters: [
      "00:00 O erro invisível que trava a operação",
      "01:15 Por que o modelo tradicional falha",
      "03:10 Pilar 1: Diagnóstico de contexto",
      "06:20 Pilar 2: Aplicação do Mecanismo Único (MUV)",
      "09:40 Quebra de objeção prática na rotina",
      "11:50 Próximo passo + Material Complementar",
    ],
    titleVariations,
    imagePrompts,
    qualifiedForComplementaryMaterial: isQualified,
    complementaryMaterial: {
      typeLabel:
        formatSlug === "long_video"
          ? "Planilha Executiva XLSX"
          : "Checklist PDF",
      title: `Diagnóstico & Checklist Executivo — ${title.slice(0, 44)}`,
      promise: `Aplicar em 15 minutos os critérios de ${subniche} abordados neste conteúdo sem perder etapas.`,
      sectionsOutline: [
        "1. Recapitulação do Problema Real com as palavras do comprador",
        "2. Checklist de Verificação Rápida em 5 Critérios (Sim / Não)",
        "3. Matriz de Ação Imediata conectada ao Mecanismo Único (MUV)",
        "4. Convite proporcional para o próximo passo da oferta principal",
      ],
    },
    explanationMaterial: {
      typeLabel: "Mapa Mental da Aula",
      title: `Mapa Mental & Diagrama Didático — ${editorialPillar}`,
      diagramNodes: [
        `Nó Central: ${title}`,
        `Ramo 01 (Causa Raiz): Superar "${icpPainOrObjection}"`,
        `Ramo 02 (Pilar da Linha): ${editorialPillar}`,
        `Ramo 03 (Função RETINA): ${RETINA_META[retinaType].label} — ${strategicObjective}`,
        `Ramo 04 (Execução Prática): Checklist de implementação semanal`,
      ],
    },
    briefingCutAdjustment:
      "Manter tom direto, pragmático e orientado a causa e efeito, sem promessas apelativas.",
    mandatoryExamplesToInclude: `Citar exemplo real de tomada de decisão em ${subniche} comparando operação no improviso vs. operação guiada por método.`,
    brandStoryConnection:
      "Conectar com a tese soberana da marca: nenhum ativo nasce solto; toda peça serve à estratégia do negócio.",
    selectedReferenceNote:
      "Estrutura validada de alta retenção nos primeiros 3 segundos + corte de linha escaneável.",
    versionHistory: [
      {
        versionLabel: "v1.0 (Original)",
        savedAt: "Criado hoje",
        modeUsed: resolvedMode,
        summaryNote: `Gerado com contexto completo de ${originType === "calendar_slot" ? "Slot do Calendário" : "Tema da Biblioteca"}.`,
      },
    ],
  };
}

function createInitialScriptsDataset(
  projectId: string,
  niche: string,
  subniche: string
): EditorialScriptRecord[] {
  return [
    buildCompleteScriptPackage({
      id: "scr-canon-01",
      projectId,
      title: `O erro invisível que trava resultados em ${subniche} mesmo dedicando horas`,
      formatSlug: "short_video",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d2-1",
      linkedSlotLabel: "Segunda-feira, 02 Nov • 12:00 • Instagram Reels",
      retinaType: "Engajamento",
      strategicObjective: "Atrair audiência qualificada quebrando uma crença comum",
      editorialPillar: "01. Visão de Mundo & Quebra de Mitos do Mercado",
      icpPainOrObjection: "Mito de que volume bruto sem direção gera resultado",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "Instagram",
      niche,
      subniche,
      speakingMode: "conexao_bullets",
      qualifiedForMaterial: false,
      status: "ready",
    }),
    buildCompleteScriptPackage({
      id: "scr-canon-02",
      projectId,
      title: `Como diagnosticar gargalos operacionais em ${subniche} em 15 minutos`,
      formatSlug: "carousel",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d2-2",
      linkedSlotLabel: "Segunda-feira, 02 Nov • 19:00 • Carrossel 4:5",
      retinaType: "Transformacao",
      strategicObjective: "Gerar salvamentos qualificados e provar competência técnica",
      editorialPillar: "04. Educação Prática & Transformação Aplicável",
      icpPainOrObjection: "Desejo de ter um método prático que caiba na rotina real",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "Instagram",
      niche,
      subniche,
      qualifiedForMaterial: true,
      status: "ready",
    }),
    buildCompleteScriptPackage({
      id: "scr-canon-03",
      projectId,
      title: `Masterclass: Como estruturar o Mecanismo Único de ${subniche} do zero até a conversão`,
      formatSlug: "long_video",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d4-1",
      linkedSlotLabel: "Quarta-feira, 04 Nov • 17:00 • YouTube",
      retinaType: "Transformacao",
      strategicObjective: "Aprofundar consciência e demonstrar domínio técnico",
      editorialPillar: "03. Mecanismo Único da Oferta (MUV em Ação)",
      icpPainOrObjection: "Precisa ver profundidade técnica antes de confiar",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "YouTube",
      niche,
      subniche,
      speakingMode: "seguranca_palavra",
      qualifiedForMaterial: true,
      status: "ready",
    }),
    buildCompleteScriptPackage({
      id: "scr-canon-04",
      projectId,
      title: `Live Semanal #1: Consultoria Ao Vivo & Quebra de Travas em ${subniche}`,
      formatSlug: "live",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d6-1",
      linkedSlotLabel: "Sexta-feira, 06 Nov • 20:00 • YouTube & Instagram",
      retinaType: "Autoridade",
      strategicObjective: "Interagir ao vivo, demonstrar repertório e conduzir para a oferta",
      editorialPillar: "06. Superação de Objeções & Condução para Oferta",
      icpPainOrObjection: "Dúvida se o método funciona especificamente para o seu modelo",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "YouTube",
      niche,
      subniche,
      qualifiedForMaterial: true,
      status: "draft",
    }),
    buildCompleteScriptPackage({
      id: "scr-canon-05",
      projectId,
      title: `Diagnóstico Comparativo: Operador Amador vs. Estrategista em ${niche}`,
      formatSlug: "static_post",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d3-2",
      linkedSlotLabel: "Terça-feira, 03 Nov • 18:30 • Post Estático",
      retinaType: "Interacao",
      strategicObjective: "Gerar comentários qualificados e mapear objeções no Direct",
      editorialPillar: "02. Diagnóstico dos Erros Invisíveis do ICP",
      icpPainOrObjection: "Dúvida sobre em qual estágio o próprio negócio está travado",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "Instagram",
      niche,
      subniche,
      qualifiedForMaterial: false,
      status: "ready",
    }),
    buildCompleteScriptPackage({
      id: "scr-canon-06",
      projectId,
      title: `Narrativa Diária de Stories — 4 Sequências Completas (Manhã, Almoço, Tarde e Noite + Q&A)`,
      formatSlug: "stories_sequence",
      originType: "calendar_slot",
      linkedSlotId: "slot-w1-d2-stories",
      linkedSlotLabel: "Segunda-feira, 02 Nov • 08:30 / 12:30 / 16:30 / 20:30",
      retinaType: "Relacionamento",
      strategicObjective: "Sustentar narrativa fracionada ao longo do dia com Q&A",
      editorialPillar: "05. Bastidores da Execução & Provas Reais",
      icpPainOrObjection: "Manter o comprador aquecido combinando rotina, prova e interação",
      businessMoment: "Aquecimento — Semana 2 de 4",
      platform: "Instagram",
      niche,
      subniche,
      speakingMode: "conexao_bullets",
      qualifiedForMaterial: false,
      status: "ready",
    }),
  ];
}

/* ========================================================================== */
/* COMPONENTE PRINCIPAL: RoteirosEditorialModule                              */
/* ========================================================================== */

export function RoteirosEditorialModule(props: RoteirosEditorialModuleProps) {
  const resolvedProjectId = props.projectId || "proj-default";
  const projectName = props.projectName || "Produto X — Lançamento Semente";
  const resolvedNiche =
    props.projectNiche || "Finanças & Investimentos";
  const resolvedSubniche =
    props.projectSubniche || "Algorithmic Trading";
  const resolvedObjective =
    props.projectObjective || "Conversão";
  const resolvedPhase =
    props.currentPhase || "Aquecimento — Semana 2 de 4";
  const hasActiveLine = props.hasActiveLine ?? true;

  const scriptsStorageKey = `la-roteiros-editorial-v2-${resolvedProjectId}`;
  const calendarStorageKey = `la-calendario-editorial-v2-${resolvedProjectId}`;
  const themesStorageKey = `la-temas-editorial-v2-${resolvedProjectId}`;

  /* Lista de Roteiros do Projeto */
  const [scripts, setScripts] = useState<readonly EditorialScriptRecord[]>(() =>
    createInitialScriptsDataset(
      resolvedProjectId,
      resolvedNiche,
      resolvedSubniche
    )
  );

  /* Slots do Calendário (F01) e Temas da Biblioteca (F02) carregados automaticamente */
  const [calendarSlots, setCalendarSlots] = useState<
    readonly CalendarSlotItem[]
  >([]);
  const [themeLibrary, setThemeLibrary] = useState<
    readonly StrategicThemeRecord[]
  >([]);

  /* Navegação entre as 3 Camadas da Função 03:
     - "hub": Painel dos 6 Cards de Formato (Visão Geral de Produção)
     - "format_list": Tela de Listagem de um Formato Específico (Roteiros + Slots daquele formato + Temas)
     - "studio": Studio Completo do Roteiro Selecionado (Roteiro + Legenda + Títulos/Capas + Materiais + Briefing) */
  const [viewStage, setViewStage] = useState<
    "hub" | "format_list" | "studio"
  >(() => {
    if (props.initialScriptId || props.isStandaloneStudioPage) return "studio";
    if (props.initialFormatSlug) return "format_list";
    return "hub";
  });

  const [selectedFormatSlug, setSelectedFormatSlug] =
    useState<ScriptFormatSlug>(props.initialFormatSlug || "short_video");

  const [activeScriptId, setActiveScriptId] = useState<string>(
    props.initialScriptId || "scr-canon-01"
  );

  /* Aba Interna dentro da Tela de Listagem do Formato */
  const [formatListSubTab, setFormatListSubTab] = useState<
    "scripts" | "calendar_slots" | "library_themes"
  >("scripts");
  const [formatRetinaFilter, setFormatRetinaFilter] = useState<
    "all" | RetinaTypeKey
  >("all");
  const [formatStatusFilter, setFormatStatusFilter] = useState<
    "all" | ScriptProductionStatus
  >("all");
  const [formatSearch, setFormatSearch] = useState<string>("");

  /* Aba Interna dentro do Studio do Roteiro */
  const [studioActiveTab, setStudioActiveTab] = useState<
    | "roteiro_blocos"
    | "legenda_seo"
    | "titulos_capas"
    | "materiais"
    | "briefing_versoes"
  >("roteiro_blocos");

  /* Estados interativos específicos de formatos dentro do Studio */
  const [activeCarouselSlideIndex, setActiveCarouselSlideIndex] =
    useState<number>(0);
  const [activeStoryPeriodTab, setActiveStoryPeriodTab] = useState<
    "Manhã" | "Almoço" | "Tarde" | "Noite"
  >("Manhã");
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  /* Modal de Criação de Novo Roteiro (A partir de Slot F01 ou Tema F02) */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createOrigin, setCreateOrigin] = useState<
    "calendar_slot" | "theme_library"
  >("calendar_slot");
  const [createFormatSlug, setCreateFormatSlug] =
    useState<ScriptFormatSlug>("short_video");
  const [createSelectedSlotId, setCreateSelectedSlotId] = useState<string>("");
  const [createSelectedThemeId, setCreateSelectedThemeId] =
    useState<string>("");
  const [createCustomTitle, setCreateCustomTitle] = useState<string>("");
  const [createSpeakingMode, setCreateSpeakingMode] =
    useState<ScriptSpeakingMode>("conexao_bullets");

  /* Carrega Roteiros, Calendário (F01) e Temas (F02) do localStorage */
  useEffect(() => {
    try {
      const savedScripts = window.localStorage.getItem(scriptsStorageKey);
      if (savedScripts) {
        const parsed = JSON.parse(savedScripts) as EditorialScriptRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScripts(parsed);
          if (props.initialScriptId) {
            const exists = parsed.some((s) => s.id === props.initialScriptId);
            if (exists) {
              setActiveScriptId(props.initialScriptId);
              setViewStage("studio");
            }
          }
        }
      }

      const savedCals = window.localStorage.getItem(calendarStorageKey);
      if (savedCals) {
        const parsedCals = JSON.parse(savedCals) as EditorialCalendarRecord[];
        if (Array.isArray(parsedCals) && parsedCals[0]?.slots) {
          setCalendarSlots(parsedCals[0].slots);
        }
      }

      const savedThemes = window.localStorage.getItem(themesStorageKey);
      if (savedThemes) {
        const parsedThemes = JSON.parse(
          savedThemes
        ) as StrategicThemeRecord[];
        if (Array.isArray(parsedThemes)) {
          setThemeLibrary(parsedThemes);
        }
      }
    } catch {
      /* Ignora bloqueio de storage */
    }
  }, [
    scriptsStorageKey,
    calendarStorageKey,
    themesStorageKey,
    props.initialScriptId,
  ]);

  /* Se veio com um Slot ou Tema pré-selecionado da Aba Calendário ou Temas, abre criação ou gera direto */
  useEffect(() => {
    if (props.initialPreselectedThemeTitle) {
      setCreateCustomTitle(props.initialPreselectedThemeTitle);
      setCreateOrigin(
        props.initialPreselectedSlotId ? "calendar_slot" : "theme_library"
      );
      setIsCreateModalOpen(true);
    }
  }, [props.initialPreselectedSlotId, props.initialPreselectedThemeTitle]);

  const persistScripts = useCallback(
    (nextScripts: readonly EditorialScriptRecord[]) => {
      setScripts(nextScripts);
      try {
        window.localStorage.setItem(
          scriptsStorageKey,
          JSON.stringify(nextScripts)
        );
      } catch {
        /* Ignora erro */
      }
    },
    [scriptsStorageKey]
  );

  const currentScript = useMemo((): EditorialScriptRecord => {
    return (
      scripts.find((s) => s.id === activeScriptId) ??
      scripts[0] ??
      createInitialScriptsDataset(
        resolvedProjectId,
        resolvedNiche,
        resolvedSubniche
      )[0]!
    );
  }, [
    scripts,
    activeScriptId,
    resolvedProjectId,
    resolvedNiche,
    resolvedSubniche,
  ]);

  const updateCurrentScript = useCallback(
    (updater: (prev: EditorialScriptRecord) => EditorialScriptRecord) => {
      const next = scripts.map((s) =>
        s.id === currentScript.id
          ? { ...updater(s), updatedAt: "Salvo automaticamente agora" }
          : s
      );
      persistScripts(next);
    },
    [scripts, currentScript.id, persistScripts]
  );

  const handleCopyText = (text: string, label: string) => {
    try {
      void navigator.clipboard.writeText(text);
      setCopiedFeedback(`${label} copiado para a área de transferência!`);
      setTimeout(() => setCopiedFeedback(null), 2600);
    } catch {
      /* Ignora bloqueio */
    }
  };

  /* Roteirizar diretamente um Slot do Calendário (Função 01 -> Função 03) */
  const handleCreateScriptFromCalendarSlot = (slot: CalendarSlotItem) => {
    const slug = mapSlotFormatToScriptSlug(slot.format);
    const created = buildCompleteScriptPackage({
      projectId: resolvedProjectId,
      title: slot.mainTheme.trim() || slot.provisionalTitle,
      formatSlug: slug,
      originType: "calendar_slot",
      linkedSlotId: slot.id,
      linkedSlotLabel: `${slot.dayOfWeekLabel}, ${String(slot.dayNumber).padStart(2, "0")} ${slot.monthShort} • ${slot.suggestedTime} • ${slot.platforms.join("/")}`,
      retinaType: slot.retinaType,
      strategicObjective: slot.strategicObjective,
      editorialPillar: slot.editorialPillar,
      icpPainOrObjection: slot.icpPainDesireOrObjection,
      businessMoment: resolvedPhase,
      platform: slot.platforms[0] || "Instagram",
      niche: resolvedNiche,
      subniche: resolvedSubniche,
      qualifiedForMaterial: slot.eligibleForComplementaryMaterial,
      status: "ready",
    });

    const next = [created, ...scripts];
    persistScripts(next);
    setSelectedFormatSlug(slug);
    setActiveScriptId(created.id);
    setStudioActiveTab("roteiro_blocos");
    setViewStage("studio");
  };

  /* Roteirizar diretamente um Tema da Biblioteca (Função 02 -> Função 03) */
  const handleCreateScriptFromTheme = (
    theme: StrategicThemeRecord,
    overrideFormatSlug?: ScriptFormatSlug
  ) => {
    const slug =
      overrideFormatSlug || mapSlotFormatToScriptSlug(theme.recommendedFormat);
    const created = buildCompleteScriptPackage({
      projectId: resolvedProjectId,
      title: theme.title,
      formatSlug: slug,
      originType: "theme_library",
      linkedThemeId: theme.id,
      linkedSlotLabel: `Criado a partir da Biblioteca de Temas (${theme.origin})`,
      retinaType: theme.retinaType,
      strategicObjective: `Apoiar ${resolvedObjective} na etapa de ${theme.journeyStage}`,
      editorialPillar: theme.romaPillar,
      icpPainOrObjection: theme.painDesireOrObjection,
      businessMoment: resolvedPhase,
      platform: theme.recommendedPlatform,
      niche: resolvedNiche,
      subniche: resolvedSubniche,
      qualifiedForMaterial:
        slug === "long_video" || slug === "carousel" || slug === "live",
      status: "ready",
    });

    const next = [created, ...scripts];
    persistScripts(next);
    setSelectedFormatSlug(slug);
    setActiveScriptId(created.id);
    setStudioActiveTab("roteiro_blocos");
    setViewStage("studio");
  };

  /* Submissão do Modal de Criação */
  const handleCreateScriptModalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (createOrigin === "calendar_slot" && createSelectedSlotId) {
      const slot = calendarSlots.find((s) => s.id === createSelectedSlotId);
      if (slot) {
        setIsCreateModalOpen(false);
        handleCreateScriptFromCalendarSlot(slot);
        return;
      }
    }

    if (createOrigin === "theme_library" && createSelectedThemeId) {
      const theme = themeLibrary.find((t) => t.id === createSelectedThemeId);
      if (theme) {
        setIsCreateModalOpen(false);
        handleCreateScriptFromTheme(theme, createFormatSlug);
        return;
      }
    }

    const created = buildCompleteScriptPackage({
      projectId: resolvedProjectId,
      title:
        createCustomTitle.trim() ||
        `Roteiro Estratégico de ${resolvedSubniche} — ${resolvedPhase}`,
      formatSlug: createFormatSlug,
      originType: createOrigin,
      linkedSlotLabel:
        createOrigin === "calendar_slot"
          ? "Slot do Calendário Editorial Ativo"
          : "Tema da Biblioteca Estratégica",
      retinaType: "Transformacao",
      strategicObjective: `Apoiar ${resolvedObjective} com conteúdo contextualizado`,
      editorialPillar: "03. Mecanismo Único da Oferta (MUV em Ação)",
      icpPainOrObjection: "Objeção prioritária mapeada na Base Estratégica",
      businessMoment: resolvedPhase,
      platform: createFormatSlug === "long_video" ? "YouTube" : "Instagram",
      niche: resolvedNiche,
      subniche: resolvedSubniche,
      speakingMode: createSpeakingMode,
      status: "ready",
    });

    const next = [created, ...scripts];
    persistScripts(next);
    setSelectedFormatSlug(createFormatSlug);
    setActiveScriptId(created.id);
    setCreateCustomTitle("");
    setIsCreateModalOpen(false);
    setStudioActiveTab("roteiro_blocos");
    setViewStage("studio");
  };

  const handleDuplicateScript = (scr: EditorialScriptRecord) => {
    const dup: EditorialScriptRecord = {
      ...scr,
      id: `scr-dup-${Date.now()}`,
      title: `${scr.title} (Variação A/B)`,
      status: "ab_test",
      version: "v1.1-AB",
      updatedAt: "Duplicado agora",
    };
    persistScripts([dup, ...scripts]);
  };

  const handleSaveNewScriptVersion = () => {
    const nextVerNumber = currentScript.versionHistory.length + 1;
    const nextVerLabel = `v${nextVerNumber}.0`;
    const snapshot: ScriptVersionSnapshot = {
      versionLabel: nextVerLabel,
      savedAt: "Salvo agora",
      modeUsed: currentScript.speakingMode,
      summaryNote: `Versão consolidada com ajustes de recorte (${currentScript.title.slice(0, 36)}...)`,
    };

    updateCurrentScript((prev) => ({
      ...prev,
      version: nextVerLabel,
      versionHistory: [snapshot, ...prev.versionHistory],
    }));

    setCopiedFeedback(`Nova versão ${nextVerLabel} salva no histórico deste roteiro!`);
    setTimeout(() => setCopiedFeedback(null), 2600);
  };

  /* Regenerar um único card de Story mantendo o encadeamento (Seção 4.6.1) */
  const handleRegenerateSingleStoryCard = (
    period: "Manhã" | "Almoço" | "Tarde" | "Noite",
    cardNumber: 1 | 2 | 3 | 4 | 5
  ) => {
    updateCurrentScript((prev) => ({
      ...prev,
      storyPeriods: prev.storyPeriods.map((sp) => {
        if (sp.period !== period) return sp;
        return {
          ...sp,
          cards: sp.cards.map((c) => {
            if (c.cardNumber !== cardNumber) return c;
            return {
              ...c,
              wordForWordScript: `${c.wordForWordScript}\n\n[Ângulo Regenerado pela IA]: Conectando diretamente à superação de "${prev.icpPainOrObjection}" em ${resolvedSubniche}.`,
              mirrorCaptionNoSound: `${c.mirrorCaptionNoSound} (Versão otimizada p/ retenção sem som)`,
            };
          }),
        };
      }),
    }));
    setCopiedFeedback(
      `Story #0${cardNumber} do bloco da ${period} regenerado sem quebrar o encadeamento!`
    );
    setTimeout(() => setCopiedFeedback(null), 2400);
  };

  const activeFormatMeta = useMemo(() => {
    return (
      SCRIPT_FORMATS_CATALOG.find((f) => f.slug === selectedFormatSlug) ??
      SCRIPT_FORMATS_CATALOG[0]!
    );
  }, [selectedFormatSlug]);

  const scriptsForSelectedFormat = useMemo(() => {
    return scripts.filter((s) => {
      if (s.formatSlug !== selectedFormatSlug) return false;
      if (
        formatStatusFilter === "all" &&
        s.status === "archived"
      ) {
        return false;
      }
      if (
        formatStatusFilter !== "all" &&
        s.status !== formatStatusFilter
      ) {
        return false;
      }
      if (
        formatRetinaFilter !== "all" &&
        s.retinaType !== formatRetinaFilter
      ) {
        return false;
      }
      if (!formatSearch.trim()) return true;
      const q = formatSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.editorialPillar.toLowerCase().includes(q) ||
        s.linkedSlotLabel.toLowerCase().includes(q)
      );
    });
  }, [
    scripts,
    selectedFormatSlug,
    formatStatusFilter,
    formatRetinaFilter,
    formatSearch,
  ]);

  const slotsForSelectedFormat = useMemo(() => {
    return calendarSlots.filter(
      (s) => s.format === activeFormatMeta.slotFormat
    );
  }, [calendarSlots, activeFormatMeta.slotFormat]);

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Flutuante de Confirmação de Cópia / Versão */}
      <AnimatePresence>
        {copiedFeedback ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-la-xl border border-emerald-400/50 bg-emerald-950/40 px-4 py-3 text-emerald-100 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="font-la-sans text-[0.8125rem] font-medium">
                {copiedFeedback}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCopiedFeedback(null)}
              className="text-emerald-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* CABEÇALHO SUPERIOR DA FUNÇÃO 03 — MOTOR DE ROTEIRIZAÇÃO E ATIVOS    */}
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
                <FileText className="h-3.5 w-3.5 text-la-gold" />
                <span>
                  FUNÇÃO 03 · MOTOR DE ROTEIRIZAÇÃO E PACOTES DE ATIVOS POR
                  FORMATO
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-la-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-text-secondary">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>
                  {scripts.filter((s) => s.status !== "archived").length}{" "}
                  pacotes de roteiro ativos neste projeto
                </span>
              </span>
            </div>

            <h2 className="mt-2 font-la-sans text-[1.5rem] font-semibold text-la-text-primary sm:text-[1.75rem]">
              Criação de Roteiros e Ativos por Formato
            </h2>
            <p className="mt-1 max-w-[56rem] font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
              Transforme os slots do Calendário Editorial (Função 01) e os temas
              da Biblioteca (Função 02) em pacotes completos de execução:
              roteiro estruturado, legenda, títulos, direção de capa, prompts de
              imagem e materiais complementares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {viewStage !== "hub" && !props.isStandaloneStudioPage ? (
              <button
                type="button"
                onClick={() => setViewStage("hub")}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/14 bg-white/[0.03] px-3.5 py-2 font-la-mono text-[0.75rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
                <span>Painel dos 6 Formatos</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Novo Roteiro Contextualizado</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Rápida entre os 6 Formatos */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/55 p-1.5">
            <button
              type="button"
              onClick={() => setViewStage("hub")}
              className={clsx(
                "rounded-la-md px-3 py-1.5 font-la-mono text-[0.75rem] font-semibold transition-all",
                viewStage === "hub"
                  ? "bg-la-gold text-la-text-inverse"
                  : "text-la-text-secondary hover:text-la-text-primary"
              )}
            >
              Visão Geral (6 Formatos)
            </button>

            {SCRIPT_FORMATS_CATALOG.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected =
                viewStage !== "hub" && selectedFormatSlug === fmt.slug;
              const count = scripts.filter(
                (s) => s.formatSlug === fmt.slug && s.status !== "archived"
              ).length;

              return (
                <button
                  key={fmt.slug}
                  type="button"
                  onClick={() => {
                    setSelectedFormatSlug(fmt.slug);
                    setViewStage("format_list");
                  }}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-la-md px-3 py-1.5 font-la-sans text-[0.75rem] font-medium transition-all",
                    isSelected
                      ? "bg-la-gold font-semibold text-la-text-inverse"
                      : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-3.5 w-3.5",
                      isSelected ? "text-la-text-inverse" : "text-la-gold"
                    )}
                  />
                  <span>{fmt.shortName}</span>
                  <span className="font-la-mono text-[0.625rem] opacity-80">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {viewStage === "studio" ? (
            <Link
              href={`/dashboard/editorial/${resolvedProjectId}/roteiros/${currentScript.formatSlug}/${currentScript.id}`}
              className="inline-flex items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir este Roteiro em Página Própria Dedicada</span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* =================================================================== */}
      {/* CAMADA 1: PAINEL GERAL DOS 6 FORMATOS (SEÇÃO 3.2 DA FUNÇÃO 03)      */}
      {/* =================================================================== */}
      {viewStage === "hub" ? (
        <section className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SCRIPT_FORMATS_CATALOG.map((fmt) => {
            const Icon = fmt.icon;
            const list = scripts.filter(
              (s) => s.formatSlug === fmt.slug && s.status !== "archived"
            );
            const readyCount = list.filter(
              (s) => s.status === "ready" || s.status === "published"
            ).length;
            const draftCount = list.filter((s) => s.status === "draft").length;
            const abTestCount = list.filter(
              (s) => s.status === "ab_test"
            ).length;
            const openSlotsForFormat = calendarSlots.filter(
              (s) => s.format === fmt.slotFormat
            ).length;

            return (
              <article
                key={fmt.slug}
                className={clsx(
                  "flex flex-col justify-between rounded-la-xl border bg-[#090D16]/95 p-6 shadow-xl transition-all hover:border-la-gold",
                  fmt.accentBorder
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-la-lg border border-la-border-gold/55 bg-la-gold-faint text-la-gold">
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="text-right">
                      <span className="font-la-sans text-[1.75rem] font-bold leading-none text-la-text-primary">
                        {list.length}
                      </span>
                      <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                        roteiros
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-4 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {fmt.name}
                  </h3>
                  <p className="mt-1.5 font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-secondary">
                    {fmt.subtitle}
                  </p>

                  {/* Contadores por Status + Slots do Calendário daquele formato */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 font-la-mono text-[0.625rem]">
                    <span className="rounded-la-xs border border-la-border-gold/50 bg-la-gold-faint px-2 py-0.5 font-semibold text-la-gold-light">
                      Prontos: {readyCount}
                    </span>
                    <span className="rounded-la-xs border border-white/12 bg-white/[0.04] px-2 py-0.5 text-la-text-secondary">
                      Rascunhos: {draftCount}
                    </span>
                    {abTestCount > 0 ? (
                      <span className="rounded-la-xs border border-purple-400/45 bg-purple-500/15 px-2 py-0.5 text-purple-200">
                        Teste A/B: {abTestCount}
                      </span>
                    ) : null}
                    <span className="rounded-la-xs border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                      {openSlotsForFormat > 0
                        ? `${openSlotsForFormat} slots na agenda`
                        : "Pronto p/ criar"}
                    </span>
                  </div>
                </div>

                {/* Atalhos Oficiais do Card de Formato (Seção 3.2) */}
                <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormatSlug(fmt.slug);
                      setFormatListSubTab("scripts");
                      setViewStage("format_list");
                    }}
                    className="inline-flex min-h-[2.625rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                  >
                    <span>Abrir Quadro de {fmt.shortName}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormatSlug(fmt.slug);
                        setFormatListSubTab("calendar_slots");
                        setViewStage("format_list");
                      }}
                      className="rounded-la-md border border-white/12 bg-black/50 px-2.5 py-1.5 font-la-mono text-[0.625rem] text-la-gold-light hover:border-la-gold"
                    >
                      + A partir de Slot (F01)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormatSlug(fmt.slug);
                        setFormatListSubTab("library_themes");
                        setViewStage("format_list");
                      }}
                      className="rounded-la-md border border-white/12 bg-black/50 px-2.5 py-1.5 font-la-mono text-[0.625rem] text-la-text-secondary hover:border-la-gold hover:text-la-text-primary"
                    >
                      + A partir de Tema (F02)
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CAMADA 2: TELA DE FORMATO ESPECÍFICO (ROTEIROS + SLOTS + TEMAS)     */}
      {/* =================================================================== */}
      {viewStage === "format_list" ? (
        <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
            <div>
              <span className="font-la-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-la-gold-light">
                QUADRO DE PRODUÇÃO DO FORMATO · {activeFormatMeta.defaultDuration}
              </span>
              <h3 className="mt-1 font-la-sans text-[1.375rem] font-semibold text-la-text-primary">
                {activeFormatMeta.name}
              </h3>
            </div>

            {/* 3 Sub-Abas do Formato: Roteiros Criados | Slots do Calendário deste Formato | Temas da Biblioteca */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/60 p-1">
              {[
                {
                  id: "scripts" as const,
                  label: `1. Roteiros deste Formato (${scriptsForSelectedFormat.length})`,
                },
                {
                  id: "calendar_slots" as const,
                  label: `2. Slots do Calendário p/ ${activeFormatMeta.shortName} (${slotsForSelectedFormat.length})`,
                },
                {
                  id: "library_themes" as const,
                  label: `3. Temas da Biblioteca (${themeLibrary.length})`,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormatListSubTab(st.id)}
                  className={clsx(
                    "rounded-la-md px-3 py-1.5 font-la-sans text-[0.75rem] font-semibold transition-all",
                    formatListSubTab === st.id
                      ? "bg-la-gold text-la-text-inverse"
                      : "text-la-text-secondary hover:text-la-text-primary"
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-ABA A: LISTA DE ROTEIROS CRIADOS NAQUELE FORMATO */}
          {formatListSubTab === "scripts" ? (
            <div className="flex flex-col gap-4">
              {/* Filtros Internos do Formato (Por Tipo RETINA e por Status) */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-[24rem]">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-la-gold" />
                  <input
                    type="search"
                    placeholder="Buscar roteiro por título, pilar ou slot..."
                    value={formatSearch}
                    onChange={(e) => setFormatSearch(e.target.value)}
                    className="min-h-[2.375rem] w-full rounded-la-md border border-white/12 bg-black/60 py-1.5 pr-4 pl-10 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={formatRetinaFilter}
                    onChange={(e) =>
                      setFormatRetinaFilter(
                        e.target.value as "all" | RetinaTypeKey
                      )
                    }
                    className="rounded-la-md border border-white/12 bg-[#0B0F19] px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
                  >
                    <option value="all">Todos os Tipos RETINA</option>
                    {(Object.keys(RETINA_META) as RetinaTypeKey[]).map((r) => (
                      <option key={r} value={r}>
                        {RETINA_META[r].label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formatStatusFilter}
                    onChange={(e) =>
                      setFormatStatusFilter(
                        e.target.value as "all" | ScriptProductionStatus
                      )
                    }
                    className="rounded-la-md border border-white/12 bg-[#0B0F19] px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-text-primary"
                  >
                    <option value="all">Status: Todos Ativos</option>
                    <option value="ready">Pronto</option>
                    <option value="draft">Rascunho</option>
                    <option value="in_production">Em Produção</option>
                    <option value="ab_test">Em Teste A/B</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivados</option>
                  </select>
                </div>
              </div>

              {scriptsForSelectedFormat.length === 0 ? (
                <div className="rounded-la-xl border border-white/10 bg-black/45 p-8 text-center">
                  <p className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                    Nenhum roteiro encontrado neste filtro para{" "}
                    {activeFormatMeta.shortName}.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormatListSubTab("calendar_slots")}
                      className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                    >
                      Escolher Slot do Calendário
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatListSubTab("library_themes")}
                      className="rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light"
                    >
                      Escolher Tema da Biblioteca
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {scriptsForSelectedFormat.map((scr) => {
                    const retMeta = RETINA_META[scr.retinaType];
                    const stMeta = SCRIPT_STATUS_META[scr.status];

                    return (
                      <div
                        key={scr.id}
                        className="flex flex-col justify-between gap-4 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-5 transition-all hover:border-la-gold lg:flex-row lg:items-center"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2 font-la-mono text-[0.625rem]">
                            <span
                              className={clsx(
                                "rounded-la-full border px-2.5 py-0.5 font-semibold",
                                stMeta.badgeClass
                              )}
                            >
                              {stMeta.label}
                            </span>
                            <span
                              className={clsx(
                                "rounded-la-full border px-2.5 py-0.5 font-semibold",
                                retMeta.badgeClass
                              )}
                            >
                              {retMeta.code} · {retMeta.label}
                            </span>
                            <span className="rounded-la-xs border border-white/10 bg-black/50 px-2 py-0.5 text-la-gold-light">
                              {scr.version} •{" "}
                              {scr.speakingMode === "conexao_bullets"
                                ? "Modo Conexão (Bullets)"
                                : "Modo Segurança (Palavra por Palavra)"}
                            </span>
                            <span className="text-la-text-muted">
                              {scr.linkedSlotLabel}
                            </span>
                          </div>

                          <h4 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                            {scr.title}
                          </h4>

                          <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                            Pilar: {scr.editorialPillar} • Objetivo:{" "}
                            {scr.strategicObjective} • Duração:{" "}
                            {scr.estimatedDurationOrSize}
                          </p>
                        </div>

                        {/* Ações Rápidas Oficiais (Abrir Studio, Página Própria, Duplicar, Exportar, Arquivar) */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScriptId(scr.id);
                              setStudioActiveTab("roteiro_blocos");
                              setViewStage("studio");
                            }}
                            className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] hover:bg-la-gold-light"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Abrir Roteiro Completo</span>
                          </button>

                          <Link
                            href={`/dashboard/editorial/${resolvedProjectId}/roteiros/${scr.formatSlug}/${scr.id}`}
                            className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-3 py-1.5 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Página Dedicada</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicateScript(scr)}
                            title="Duplicar roteiro para variação A/B"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                `${scr.title}\n\nLEGENDA:\n${scr.captionOutdoorHook}\n\n${scr.captionBody}\n\n${scr.captionCta}`,
                                "Pacote do roteiro"
                              )
                            }
                            title="Exportar / Copiar pacote"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-white/12 bg-black/50 text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {/* SUB-ABA B: SLOTS DO CALENDÁRIO VINCULADOS A ESTE FORMATO (SEÇÃO 3.1 PASSO 2) */}
          {formatListSubTab === "calendar_slots" ? (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-la-lg border border-la-border-gold/40 bg-black/50 p-4">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                  INTEGRAÇÃO DIRETA COM O CALENDÁRIO EDITORIAL (FUNÇÃO 01)
                </span>
                <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  Exibindo exclusivamente os slots do Calendário Editorial
                  configurados para <strong>{activeFormatMeta.name}</strong>. Ao
                  clicar em &ldquo;Roteirizar este Slot&rdquo;, a IA carrega
                  todos os metadados do slot e gera o pacote completo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {slotsForSelectedFormat.map((slot) => {
                  const retMeta = RETINA_META[slot.retinaType];
                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                          <span className="font-bold text-la-gold-light">
                            {String(slot.dayNumber).padStart(2, "0")}{" "}
                            {slot.monthShort} • {slot.dayOfWeekLabel} (
                            {slot.suggestedTime})
                          </span>
                          <span
                            className={clsx(
                              "rounded-la-full border px-2 py-0.5 font-semibold",
                              retMeta.badgeClass
                            )}
                          >
                            {retMeta.label}
                          </span>
                        </div>

                        <h4 className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                          {slot.mainTheme || slot.provisionalTitle}
                        </h4>

                        <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                          Pilar: {slot.editorialPillar} • Objetivo:{" "}
                          {slot.strategicObjective}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCreateScriptFromCalendarSlot(slot)}
                        className="mt-2 inline-flex min-h-[2.375rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Roteirizar este Slot Agora →</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* SUB-ABA C: TEMAS DA BIBLIOTECA DA FUNÇÃO 02 PARA ROTEIRIZAR NESTE FORMATO */}
          {formatListSubTab === "library_themes" ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {themeLibrary.map((thm) => {
                const retMeta = RETINA_META[thm.retinaType];
                return (
                  <div
                    key={thm.id}
                    className="flex flex-col justify-between gap-3 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                        <span className="text-la-gold-light">
                          Origem: {thm.origin} • {thm.journeyStage}
                        </span>
                        <span
                          className={clsx(
                            "rounded-la-full border px-2 py-0.5 font-semibold",
                            retMeta.badgeClass
                          )}
                        >
                          {retMeta.label}
                        </span>
                      </div>
                      <h4 className="mt-2 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                        {thm.title}
                      </h4>
                      <p className="mt-1 font-la-mono text-[0.6875rem] text-la-text-secondary">
                        Pilar: {thm.romaPillar}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCreateScriptFromTheme(thm, selectedFormatSlug)
                      }
                      className="mt-2 inline-flex min-h-[2.375rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Transformar em Roteiro de {activeFormatMeta.shortName} →
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* =================================================================== */}
      {/* CAMADA 3: STUDIO DEDICADO DO ROTEIRO E PACOTE DE ATIVOS COMPLETO    */}
      {/* =================================================================== */}
      {viewStage === "studio" ? (
        <div className="flex flex-col gap-6">
          {/* Painel de Contexto Herdado das Funções 01 e 02 + Controles do Roteiro */}
          <section className="rounded-la-xl border border-la-gold/65 bg-[#090D16]/98 p-6 shadow-2xl">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 xl:flex-row xl:items-start">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-la-full bg-la-gold px-2.5 py-0.5 font-la-mono text-[0.625rem] font-bold uppercase text-la-text-inverse">
                    STUDIO DO ROTEIRO •{" "}
                    {
                      SCRIPT_FORMATS_CATALOG.find(
                        (f) => f.slug === currentScript.formatSlug
                      )?.shortName
                    }
                  </span>
                  <span
                    className={clsx(
                      "rounded-la-full border px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold",
                      RETINA_META[currentScript.retinaType].badgeClass
                    )}
                  >
                    RETINA: {RETINA_META[currentScript.retinaType].label}
                  </span>
                  <span className="rounded-la-full border border-white/12 bg-black/50 px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                    Versão {currentScript.version}
                  </span>
                  <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
                    {currentScript.linkedSlotLabel}
                  </span>
                </div>

                {/* Título Editável do Roteiro */}
                <input
                  type="text"
                  value={currentScript.title}
                  onChange={(e) =>
                    updateCurrentScript((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-2.5 w-full rounded-la-md border border-transparent bg-transparent px-1 py-0.5 font-la-sans text-[1.375rem] font-semibold text-la-text-primary focus:border-la-gold focus:bg-black/70 focus:outline-none sm:text-[1.5rem]"
                />

                {/* Barra de Metadados Injetados das Funções 01 e 02 */}
                <div className="mt-2 flex flex-wrap items-center gap-3 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <span>
                    Pilar:{" "}
                    <strong className="text-la-text-primary">
                      {currentScript.editorialPillar}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Objetivo:{" "}
                    <strong className="text-la-gold-light">
                      {currentScript.strategicObjective}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Dor/Objeção:{" "}
                    <strong className="text-la-text-primary">
                      {currentScript.icpPainOrObjection}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Controles de Status, Teleprompter e Salvar Nova Versão */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={currentScript.status}
                  onChange={(e) =>
                    updateCurrentScript((prev) => ({
                      ...prev,
                      status: e.target.value as ScriptProductionStatus,
                    }))
                  }
                  className="min-h-[2.375rem] rounded-la-md border border-white/15 bg-black/70 px-3 font-la-mono text-[0.75rem] text-la-gold-light"
                >
                  {(
                    Object.keys(
                      SCRIPT_STATUS_META
                    ) as ScriptProductionStatus[]
                  ).map((stKey) => (
                    <option key={stKey} value={stKey}>
                      Status: {SCRIPT_STATUS_META[stKey].label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsTeleprompterOpen((prev) => !prev)}
                  className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md border border-white/14 bg-black/60 px-3 py-1.5 font-la-mono text-[0.75rem] text-la-text-primary hover:border-la-gold"
                >
                  {isTeleprompterOpen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5 text-la-gold" />
                      <span>Sair do Teleprompter</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5 text-la-gold" />
                      <span>Modo Teleprompter</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveNewScriptVersion}
                  className="inline-flex min-h-[2.375rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Salvar Nova Versão</span>
                </button>
              </div>
            </div>

            {/* Seletor de Modo de Roteiro (Exibido para Vídeos Curtos, Vídeos Longos e Stories; Aviso Especial para Lives) */}
            {currentScript.formatSlug === "short_video" ||
            currentScript.formatSlug === "long_video" ||
            currentScript.formatSlug === "stories_sequence" ? (
              <div className="mt-4 flex flex-col justify-between gap-3 rounded-la-lg border border-white/10 bg-black/50 p-3.5 sm:flex-row sm:items-center">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                    MODO DE ROTEIRIZAÇÃO (SEÇÃO 3.1 DA FUNÇÃO 03)
                  </span>
                  <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                    Escolha entre ler tópicos de alta retenção perto da lente da
                    câmera ou o script técnico palavra por palavra.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        speakingMode: "conexao_bullets",
                      }))
                    }
                    className={clsx(
                      "rounded-la-md border px-3.5 py-2 font-la-sans text-[0.75rem] font-semibold transition-all",
                      currentScript.speakingMode === "conexao_bullets"
                        ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.3)]"
                        : "border-white/12 bg-black/60 text-la-text-secondary"
                    )}
                  >
                    ★ Modo Conexão — Bullet Points de Alta Retenção (Recomendado)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        speakingMode: "seguranca_palavra",
                      }))
                    }
                    className={clsx(
                      "rounded-la-md border px-3.5 py-2 font-la-sans text-[0.75rem] font-semibold transition-all",
                      currentScript.speakingMode === "seguranca_palavra"
                        ? "border-la-gold bg-la-gold text-la-text-inverse shadow-[0_0_16px_rgba(207,169,101,0.3)]"
                        : "border-white/12 bg-black/60 text-la-text-secondary"
                    )}
                  >
                    Modo Segurança — Roteiro Palavra por Palavra (2 Colunas)
                  </button>
                </div>
              </div>
            ) : currentScript.formatSlug === "live" ? (
              <div className="mt-4 rounded-la-lg border border-rose-400/40 bg-rose-950/20 p-3.5">
                <span className="font-la-mono text-[0.625rem] font-bold uppercase text-rose-300">
                  DIRETRIZ OFICIAL DE LIVE · MODO CONEXÃO (BULLET POINTS DE ALTA RETENÇÃO)
                </span>
                <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                  O maior erro em transmissões ao vivo é tentar ler um texto
                  palavra por palavra, o que destrói a naturalidade e a
                  interação com o chat. Por isso, este roteiro de Live opera
                  exclusivamente em blocos cronológicos de Bullet Points de Alta
                  Retenção.
                </p>
              </div>
            ) : null}

            {/* As 5 Abas do Pacote de Execução do Roteiro */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-la-lg border border-white/10 bg-black/60 p-1.5">
              {[
                {
                  id: "roteiro_blocos" as const,
                  label:
                    currentScript.formatSlug === "carousel"
                      ? "1. Anatomia dos 10 Slides (4:5)"
                      : currentScript.formatSlug === "stories_sequence"
                        ? "1. Sequências do Dia (M·A·T·N + Q&A)"
                        : "1. Roteiro Estruturado em Blocos",
                  icon: FileText,
                },
                {
                  id: "legenda_seo" as const,
                  label: "2. Legenda Outdoor & SEO",
                  icon: Hash,
                },
                {
                  id: "titulos_capas" as const,
                  label: `3. Títulos (${currentScript.titleVariations.length}) & Prompts de Capa (EN)`,
                  icon: ImageIcon,
                },
                {
                  id: "materiais" as const,
                  label: "4. Material Complementar & Explicação",
                  icon: Gift,
                },
                {
                  id: "briefing_versoes" as const,
                  label: `5. Briefing de Recorte & Versões (${currentScript.versionHistory.length})`,
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = studioActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStudioActiveTab(tab.id)}
                    className={clsx(
                      "inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md px-3.5 py-1.5 font-la-sans text-[0.8125rem] font-medium transition-all",
                      active
                        ? "bg-la-gold font-semibold text-la-text-inverse"
                        : "text-la-text-secondary hover:bg-white/[0.04] hover:text-la-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* --------------------------------------------------------------- */}
          {/* ABA 1 DO STUDIO: ROTEIRO ESTRUTURADO CONFORME O FORMATO         */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "roteiro_blocos" ? (
            <section className="rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
              {/* CASO A: CARROSSEL 4:5 (10 SLIDES INTERATIVOS) */}
              {currentScript.formatSlug === "carousel" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Coluna Esquerda (5/12): Preview Visual 4:5 do Slide Ativo */}
                  <div className="flex flex-col items-center lg:col-span-5">
                    <div className="flex w-full items-center justify-between pb-3">
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        PREVIEW PROPORÇÃO 4:5 · SLIDE{" "}
                        {activeCarouselSlideIndex + 1} DE{" "}
                        {currentScript.carouselSlides.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={activeCarouselSlideIndex === 0}
                          onClick={() =>
                            setActiveCarouselSlideIndex((prev) =>
                              Math.max(0, prev - 1)
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-la-xs border border-white/14 bg-black/60 text-la-text-primary disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            activeCarouselSlideIndex ===
                            currentScript.carouselSlides.length - 1
                          }
                          onClick={() =>
                            setActiveCarouselSlideIndex((prev) =>
                              Math.min(
                                currentScript.carouselSlides.length - 1,
                                prev + 1
                              )
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-la-xs border border-white/14 bg-black/60 text-la-text-primary disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const slide =
                        currentScript.carouselSlides[
                          activeCarouselSlideIndex
                        ] ?? currentScript.carouselSlides[0]!;
                      return (
                        <div className="flex aspect-[4/5] w-full max-w-[24rem] flex-col justify-between rounded-la-xl border-2 border-la-gold/65 bg-gradient-to-b from-[#0C111E] via-[#080B12] to-[#05070B] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 font-la-mono text-[0.625rem] text-la-gold-light">
                            <span>{projectName.split("—")[0]}</span>
                            <span>
                              {String(slide.slideNumber).padStart(2, "0")} / 10
                            </span>
                          </div>

                          <div className="my-auto py-4">
                            <span className="font-la-mono text-[0.5625rem] uppercase tracking-[0.1em] text-la-gold">
                              {slide.roleLabel}
                            </span>
                            <h4 className="mt-2 font-la-sans text-[1.3125rem] font-bold leading-[1.2] text-la-text-primary">
                              {slide.headline}
                            </h4>
                            <p className="mt-4 whitespace-pre-line font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                              {slide.bodyLineBreakCopy}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/10 pt-3 font-la-mono text-[0.5625rem] text-la-text-muted">
                            <span>Arraste para o lado →</span>
                            <span className="text-la-gold-light">
                              Salvar p/ consultar
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Seletor Rápido de Lâminas 1 a 10 */}
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {currentScript.carouselSlides.map((s, idx) => (
                        <button
                          key={s.slideNumber}
                          type="button"
                          onClick={() => setActiveCarouselSlideIndex(idx)}
                          className={clsx(
                            "h-8 w-8 rounded-la-xs border font-la-mono text-[0.75rem] font-bold transition-all",
                            activeCarouselSlideIndex === idx
                              ? "border-la-gold bg-la-gold text-la-text-inverse"
                              : "border-white/12 bg-black/50 text-la-text-secondary"
                          )}
                        >
                          {s.slideNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coluna Direita (7/12): Editor Cirúrgico Lâmina por Lâmina */}
                  <div className="flex flex-col gap-4 lg:col-span-7">
                    {(() => {
                      const slide =
                        currentScript.carouselSlides[
                          activeCarouselSlideIndex
                        ] ?? currentScript.carouselSlides[0]!;
                      return (
                        <div className="rounded-la-xl border border-white/10 bg-black/50 p-5">
                          <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                            EDIÇÃO DO {slide.roleLabel.toUpperCase()}
                          </span>

                          <div className="mt-4 flex flex-col gap-3.5">
                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                                Headline da Lâmina {slide.slideNumber}
                              </label>
                              <input
                                type="text"
                                value={slide.headline}
                                onChange={(e) =>
                                  updateCurrentScript((prev) => ({
                                    ...prev,
                                    carouselSlides: prev.carouselSlides.map(
                                      (item, i) =>
                                        i === activeCarouselSlideIndex
                                          ? {
                                              ...item,
                                              headline: e.target.value,
                                            }
                                          : item
                                    ),
                                  }))
                                }
                                className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-[#0B0F19] px-3.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                                Corpo Escaneável (Com Psicologia de Corte de
                                Linha)
                              </label>
                              <textarea
                                rows={4}
                                value={slide.bodyLineBreakCopy}
                                onChange={(e) =>
                                  updateCurrentScript((prev) => ({
                                    ...prev,
                                    carouselSlides: prev.carouselSlides.map(
                                      (item, i) =>
                                        i === activeCarouselSlideIndex
                                          ? {
                                              ...item,
                                              bodyLineBreakCopy: e.target.value,
                                            }
                                          : item
                                    ),
                                  }))
                                }
                                className="w-full rounded-la-md border border-white/14 bg-[#0B0F19] p-3 font-la-sans text-[0.875rem] leading-[1.6] text-la-text-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                                Prompt de Imagem da Lâmina em Inglês (Midjourney
                                / IA)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={slide.imagePromptEN}
                                  onChange={(e) =>
                                    updateCurrentScript((prev) => ({
                                      ...prev,
                                      carouselSlides: prev.carouselSlides.map(
                                        (item, i) =>
                                          i === activeCarouselSlideIndex
                                            ? {
                                                ...item,
                                                imagePromptEN: e.target.value,
                                              }
                                            : item
                                      ),
                                    }))
                                  }
                                  className="min-h-[2.375rem] flex-1 rounded-la-md border border-white/14 bg-[#0B0F19] px-3 font-la-mono text-[0.75rem] text-la-text-secondary"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyText(
                                      slide.imagePromptEN,
                                      `Prompt do Slide ${slide.slideNumber}`
                                    )
                                  }
                                  className="rounded-la-md border border-la-border-gold bg-la-gold-faint px-3 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light"
                                >
                                  Copiar Prompt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : /* CASO B: SEQUÊNCIAS DIÁRIAS DE STORIES (MANHÃ, ALMOÇO, TARDE, NOITE + Q&A) */
              currentScript.formatSlug === "stories_sequence" ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(["Manhã", "Almoço", "Tarde", "Noite"] as const).map(
                        (per) => (
                          <button
                            key={per}
                            type="button"
                            onClick={() => setActiveStoryPeriodTab(per)}
                            className={clsx(
                              "rounded-la-md border px-4 py-2 font-la-sans text-[0.8125rem] font-semibold transition-all",
                              activeStoryPeriodTab === per
                                ? "border-la-gold bg-la-gold text-la-text-inverse"
                                : "border-white/12 bg-black/50 text-la-text-secondary"
                            )}
                          >
                            Bloco da {per} (5 Stories)
                          </button>
                        )
                      )}
                    </div>

                    <span className="font-la-mono text-[0.6875rem] text-emerald-300">
                      ✓ Inclui Legenda Espelho obrigatória + Stickers Oficiais
                    </span>
                  </div>

                  {(() => {
                    const activePeriodObj =
                      currentScript.storyPeriods.find(
                        (p) => p.period === activeStoryPeriodTab
                      ) ?? currentScript.storyPeriods[0]!;

                    return (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                        {activePeriodObj.cards.map((card) => (
                          <div
                            key={card.cardNumber}
                            className="flex flex-col justify-between rounded-la-xl border border-white/12 bg-[#0B0F1A] p-4"
                          >
                            <div>
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="font-la-mono text-[0.6875rem] font-bold text-la-gold-light">
                                  STORY 0{card.cardNumber}
                                </span>
                                <span className="rounded-la-xs border border-white/10 bg-black/60 px-2 py-0.5 font-la-mono text-[0.5625rem] text-la-text-secondary">
                                  {card.cardType === "video_fala"
                                    ? "Vídeo Falado"
                                    : "Texto s/ Foto"}
                                </span>
                              </div>

                              <p className="mt-2 font-la-mono text-[0.625rem] text-la-gold">
                                {card.intentionLabel}
                              </p>

                              <div className="mt-2.5 rounded-la-md border border-white/8 bg-black/60 p-2.5">
                                <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                                  {currentScript.speakingMode ===
                                  "conexao_bullets"
                                    ? "Bullet de Oratória / Copy:"
                                    : "Fala Palavra por Palavra:"}
                                </span>
                                <p className="mt-1 whitespace-pre-line font-la-sans text-[0.75rem] leading-[1.5] text-la-text-primary">
                                  {currentScript.speakingMode ===
                                  "conexao_bullets"
                                    ? card.connectionBullet
                                    : card.wordForWordScript}
                                </p>
                              </div>

                              {/* Legenda Espelho Obrigatória */}
                              <div className="mt-2.5 rounded-la-md border border-emerald-400/35 bg-emerald-950/20 p-2.5">
                                <span className="block font-la-mono text-[0.5625rem] font-bold uppercase text-emerald-300">
                                  Legenda Espelho (Sem Som):
                                </span>
                                <p className="mt-1 font-la-sans text-[0.75rem] text-emerald-100">
                                  {card.mirrorCaptionNoSound}
                                </p>
                              </div>

                              <p className="mt-2 font-la-mono text-[0.625rem] text-la-gold-light">
                                <strong>Sticker:</strong>{" "}
                                {card.instagramSticker}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-white/10 pt-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRegenerateSingleStoryCard(
                                    activePeriodObj.period,
                                    card.cardNumber
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-la-xs border border-white/12 bg-black/50 px-2 py-1 font-la-mono text-[0.5625rem] text-la-text-secondary hover:border-la-gold hover:text-la-gold-light"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Regenerar card</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    `${card.wordForWordScript}\n\nLegenda Espelho: ${card.mirrorCaptionNoSound}`,
                                    `Story 0${card.cardNumber}`
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-la-xs bg-la-gold px-2 py-1 font-la-mono text-[0.5625rem] font-bold text-la-text-inverse"
                              >
                                <ClipboardCopy className="h-3 w-3" />
                                <span>Copiar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 3 Perguntas e Respostas Preditivas de Q&A do Dia */}
                  <div className="rounded-la-xl border border-la-border-gold/50 bg-black/50 p-5">
                    <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                      CAIXINHA DE PERGUNTAS PREDITIVA (Q&A ESTRATÉGICO DA NOITE)
                    </span>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {currentScript.predictiveQAs.map((qa) => (
                        <div
                          key={qa.id}
                          className="rounded-la-lg border border-white/10 bg-[#0B0F1A] p-3.5"
                        >
                          <span className="font-la-mono text-[0.625rem] font-bold text-amber-300">
                            Pergunta: &ldquo;{qa.questionFromAudience}&rdquo;
                          </span>
                          <p className="mt-2 font-la-sans text-[0.75rem] leading-[1.5] text-la-text-primary">
                            {qa.strategicAnswerCopy}
                          </p>
                          <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2 font-la-mono text-[0.5625rem] text-la-text-muted">
                            <span>{qa.recommendedFormat}</span>
                            {qa.qualifiedForMaterial ? (
                              <span className="text-emerald-300">
                                ★ Anexar Isca/Material
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : /* CASO C: VÍDEOS CURTOS, VÍDEOS LONGOS, LIVES E POSTS ESTÁTICOS */
              currentScript.speakingMode === "conexao_bullets" &&
                currentScript.formatSlug === "short_video" ? (
                /* Checklist Limpo de 7 Linhas Sequenciais para Colar Perto da Lente da Câmera (Seção 4.1.2) */
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        MODO CONEXÃO · CHECKLIST DE 7 LINHAS SEQUENCIAIS PARA A
                        LENTE DA CÂMERA
                      </span>
                      <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                        Bata o olho nos 7 tópicos sequenciais abaixo enquanto
                        grava com naturalidade e alta retenção.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          currentScript.connectionSevenLinesChecklist.join(
                            "\n"
                          ),
                          "Checklist de 7 linhas"
                        )
                      }
                      className="rounded-la-md bg-la-gold px-4 py-1.5 font-la-mono text-[0.75rem] font-semibold text-la-text-inverse"
                    >
                      Copiar 7 Bullets
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {currentScript.connectionSevenLinesChecklist.map(
                      (line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/45 bg-[#0C111D] p-4"
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-la-full bg-la-gold font-la-mono text-[0.75rem] font-bold text-la-text-inverse">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) =>
                              updateCurrentScript((prev) => ({
                                ...prev,
                                connectionSevenLinesChecklist:
                                  prev.connectionSevenLinesChecklist.map(
                                    (item, i) =>
                                      i === idx ? e.target.value : item
                                  ),
                              }))
                            }
                            className={clsx(
                              "w-full bg-transparent font-la-sans font-semibold text-la-text-primary focus:outline-none",
                              isTeleprompterOpen
                                ? "text-[1.25rem]"
                                : "text-[0.9375rem]"
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                /* Tabela de Blocos Cronológicos (2 Colunas: Direção Visual & SFX | Fala / Bullets) */
                <div className="flex flex-col gap-4">
                  {currentScript.scriptBlocks.map((blk, idx) => (
                    <div
                      key={blk.id}
                      className="grid grid-cols-1 gap-4 rounded-la-xl border border-white/10 bg-[#0B0F1A] p-5 lg:grid-cols-12"
                    >
                      {/* Coluna Esquerda (4/12): Tempo, Função Psicológica e Direção Visual / B-Roll */}
                      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 lg:col-span-4 lg:border-r lg:border-b-0 lg:pr-4 lg:pb-0">
                        <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                          {blk.timecodeOrStage}
                        </span>
                        <p className="font-la-sans text-[0.75rem] font-medium text-la-text-primary">
                          Função: {blk.psychologicalRole}
                        </p>
                        <div className="mt-1 rounded-la-md border border-white/8 bg-black/55 p-3">
                          <span className="block font-la-mono text-[0.5625rem] uppercase text-sky-300">
                            Direção de Cena, B-Roll & Áudio (A cada 20s):
                          </span>
                          <textarea
                            rows={3}
                            value={blk.visualAndAudioDirection}
                            onChange={(e) =>
                              updateCurrentScript((prev) => ({
                                ...prev,
                                scriptBlocks: prev.scriptBlocks.map((b, i) =>
                                  i === idx
                                    ? {
                                        ...b,
                                        visualAndAudioDirection:
                                          e.target.value,
                                      }
                                    : b
                                ),
                              }))
                            }
                            className="mt-1 w-full bg-transparent font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Coluna Direita (8/12): Texto de Narração ou Bullets de Conexão */}
                      <div className="flex flex-col gap-2 lg:col-span-8">
                        <span className="font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                          {currentScript.speakingMode === "conexao_bullets"
                            ? "Bullets de Alta Retenção (Modo Conexão):"
                            : "Locução Palavra por Palavra (Modo Segurança):"}
                        </span>
                        <textarea
                          rows={isTeleprompterOpen ? 6 : 4}
                          value={
                            currentScript.speakingMode === "conexao_bullets"
                              ? blk.connectionBulletLine
                              : blk.wordForWordSpeech
                          }
                          onChange={(e) =>
                            updateCurrentScript((prev) => ({
                              ...prev,
                              scriptBlocks: prev.scriptBlocks.map((b, i) =>
                                i === idx
                                  ? currentScript.speakingMode ===
                                    "conexao_bullets"
                                    ? {
                                        ...b,
                                        connectionBulletLine: e.target.value,
                                      }
                                    : {
                                        ...b,
                                        wordForWordSpeech: e.target.value,
                                      }
                                  : b
                              ),
                            }))
                          }
                          className={clsx(
                            "w-full rounded-la-lg border border-white/12 bg-black/65 p-3.5 font-la-sans leading-[1.65] text-la-text-primary focus:border-la-gold focus:outline-none",
                            isTeleprompterOpen
                              ? "text-[1.1875rem]"
                              : "text-[0.875rem]"
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Se for Live, exibe também o Bloco E: Sequência de Stories de Bastidores Pós-Live */}
                  {currentScript.formatSlug === "live" ? (
                    <div className="rounded-la-xl border border-la-border-gold/50 bg-la-gold-faint/40 p-5">
                      <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                        BLOCO E · SEQUÊNCIA PRONTA DE STORIES DE BASTIDORES
                        PÓS-LIVE (MODO HÍBRIDO)
                      </span>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {currentScript.postLiveStoriesSummary.map((st, i) => (
                          <div
                            key={i}
                            className="rounded-la-lg border border-white/10 bg-black/60 p-3.5 font-la-sans text-[0.75rem] leading-[1.55] text-la-text-primary"
                          >
                            {st}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 2 DO STUDIO: LEGENDA OUTDOOR & METADADOS DE SEO             */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "legenda_seo" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                    LEGENDA / DESCRIÇÃO ACOPLADA AO FORMATO
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${currentScript.captionOutdoorHook}\n\n${currentScript.captionBody}\n\n${currentScript.captionCta}\n\n${currentScript.seoTags.join(" ")}`,
                        "Legenda completa"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-la-md bg-la-gold px-3.5 py-1.5 font-la-mono text-[0.75rem] font-semibold text-la-text-inverse"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    <span>Copiar Legenda Completa</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    1. Gancho Outdoor (Primeiras 2 linhas antes do &ldquo;mais...&rdquo;)
                  </label>
                  <input
                    type="text"
                    value={currentScript.captionOutdoorHook}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionOutdoorHook: e.target.value,
                      }))
                    }
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 font-la-sans text-[0.875rem] font-semibold text-la-gold-light"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    2. Desenvolvimento Escaneável da Legenda / Descrição
                  </label>
                  <textarea
                    rows={8}
                    value={currentScript.captionBody}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionBody: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3.5 font-la-sans text-[0.875rem] leading-[1.65] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    3. Chamada para Ação (CTA da Legenda)
                  </label>
                  <textarea
                    rows={2}
                    value={currentScript.captionCta}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        captionCta: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-emerald-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-5">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  METADADOS DE SEO, ALGORITMO E CAPÍTULOS YOUTUBE
                </span>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Palavras-Chave Principais de Indexação:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {currentScript.seoKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-la-xs border border-la-border-gold/45 bg-la-gold-faint px-2.5 py-1 font-la-mono text-[0.6875rem] text-la-gold-light"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Índice de Capítulos (Timestamps para YouTube / Live):
                  </span>
                  <ul className="mt-2 flex flex-col gap-1.5 font-la-mono text-[0.75rem] text-la-text-primary">
                    {currentScript.youtubeChapters.map((ch) => (
                      <li key={ch}>{ch}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-la-lg border border-white/10 bg-black/50 p-4">
                  <span className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Tags Recomendadas:
                  </span>
                  <p className="mt-1.5 font-la-mono text-[0.75rem] text-sky-300">
                    {currentScript.seoTags.join("  ")}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 3 DO STUDIO: TÍTULOS (MÍN. 6) & PROMPTS DE CAPA/THUMBNAIL   */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "titulos_capas" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-6">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  VARIAÇÕES DE TÍTULOS ETIQUETADAS POR GANCHO (MÍNIMO 5)
                </span>
                <div className="flex flex-col gap-2.5">
                  {currentScript.titleVariations.map((tv) => (
                    <div
                      key={tv.id}
                      onClick={() =>
                        updateCurrentScript((prev) => ({
                          ...prev,
                          title: tv.titleText,
                          titleVariations: prev.titleVariations.map((item) => ({
                            ...item,
                            isSelected: item.id === tv.id,
                          })),
                        }))
                      }
                      className={clsx(
                        "cursor-pointer rounded-la-lg border p-3.5 transition-all",
                        tv.isSelected
                          ? "border-la-gold bg-la-gold-faint"
                          : "border-white/10 bg-black/50 hover:border-white/25"
                      )}
                    >
                      <div className="flex items-center justify-between font-la-mono text-[0.625rem]">
                        <span className="font-bold text-la-gold-light">
                          Gancho: {tv.hookCategory}
                        </span>
                        <span className="text-emerald-300">
                          {tv.estimatedCtrBadge}
                        </span>
                      </div>
                      <p className="mt-1 font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                        {tv.titleText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-6">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  DIREÇÃO DE THUMBNAIL / CAPA & PROMPTS DE IMAGEM EM INGLÊS
                </span>
                {currentScript.imagePrompts.map((prm) => (
                  <div
                    key={prm.id}
                    className="flex flex-col gap-2.5 rounded-la-xl border border-white/10 bg-black/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                        {prm.targetPiece}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(prm.promptEnglish, prm.targetPiece)
                        }
                        className="rounded-la-xs bg-la-gold px-3 py-1 font-la-mono text-[0.625rem] font-bold text-la-text-inverse"
                      >
                        Copiar Prompt EN
                      </button>
                    </div>

                    <p className="font-la-sans text-[0.75rem] text-la-text-secondary">
                      <strong>Conceito Visual (PT):</strong>{" "}
                      {prm.visualConceptPT}
                    </p>

                    <div className="rounded-la-md border border-white/10 bg-[#0B0F1A] p-3 font-la-mono text-[0.75rem] text-la-gold-light">
                      {prm.promptEnglish}
                    </div>

                    <span className="font-la-mono text-[0.6875rem] text-emerald-300">
                      Texto sugerido na capa: &ldquo;
                      {prm.textOverlaySuggestion}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 4 DO STUDIO: MATERIAL COMPLEMENTAR & MATERIAL DE EXPLICAÇÃO */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "materiais" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Categoria A: Material Complementar (Isca / Funil qualificado pelas Funções 01/02) */}
              <div className="flex flex-col justify-between rounded-la-xl border border-la-border-gold/55 bg-[#080B12]/95 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-la-mono text-[0.625rem] font-bold uppercase text-la-gold-light">
                      CATEGORIA 01 · MATERIAL COMPLEMENTAR (FUNIL / ISCA)
                    </span>
                    <label className="inline-flex cursor-pointer items-center gap-2 font-la-mono text-[0.6875rem] text-la-gold-light">
                      <input
                        type="checkbox"
                        checked={
                          currentScript.qualifiedForComplementaryMaterial
                        }
                        onChange={(e) =>
                          updateCurrentScript((prev) => ({
                            ...prev,
                            qualifiedForComplementaryMaterial:
                              e.target.checked,
                          }))
                        }
                        className="accent-[#CFA965]"
                      />
                      <span>Slot Qualificado</span>
                    </label>
                  </div>

                  <h4 className="mt-2 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {currentScript.complementaryMaterial.title}
                  </h4>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Formato:{" "}
                    <strong className="text-la-gold-light">
                      {currentScript.complementaryMaterial.typeLabel}
                    </strong>{" "}
                    • Promessa: {currentScript.complementaryMaterial.promise}
                  </p>

                  {currentScript.qualifiedForComplementaryMaterial ? (
                    <ul className="mt-4 flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4 font-la-sans text-[0.8125rem] text-la-text-primary">
                      {currentScript.complementaryMaterial.sectionsOutline.map(
                        (sec, i) => (
                          <li key={i}>• {sec}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="mt-4 rounded-la-lg border border-white/10 bg-black/45 p-4 font-la-sans text-[0.8125rem] text-la-text-muted">
                      Este slot não está configurado para material complementar
                      de isca nas Funções 01/02. Marque a caixa &ldquo;Slot
                      Qualificado&rdquo; acima caso deseje ativar a geração para
                      este conteúdo.
                    </div>
                  )}
                </div>

                {currentScript.qualifiedForComplementaryMaterial ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${currentScript.complementaryMaterial.title}\n\n${currentScript.complementaryMaterial.sectionsOutline.join("\n")}`,
                        "Estrutura do Material Complementar"
                      )
                    }
                    className="mt-5 inline-flex min-h-[2.5rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Copiar / Exportar Material Complementar</span>
                  </button>
                ) : null}
              </div>

              {/* Categoria B: Material de Explicação (Apoio Didático da Aula/Live) */}
              <div className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-bold uppercase text-sky-300">
                    CATEGORIA 02 · MATERIAL DE EXPLICAÇÃO (APOIO DIDÁTICO DA
                    AULA / LIVE)
                  </span>
                  <h4 className="mt-2 font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                    {currentScript.explanationMaterial.title}
                  </h4>
                  <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Tipo:{" "}
                    <strong className="text-sky-200">
                      {currentScript.explanationMaterial.typeLabel}
                    </strong>{" "}
                    (Focado em visualização didática de frameworks e diagramas).
                  </p>

                  <ul className="mt-4 flex flex-col gap-2 rounded-la-lg border border-white/10 bg-black/50 p-4 font-la-mono text-[0.75rem] text-la-text-primary">
                    {currentScript.explanationMaterial.diagramNodes.map(
                      (node, i) => (
                        <li key={i}>{node}</li>
                      )
                    )}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      currentScript.explanationMaterial.diagramNodes.join("\n"),
                      "Mapa Mental de Explicação"
                    )
                  }
                  className="mt-5 inline-flex min-h-[2.5rem] w-full items-center justify-center gap-2 rounded-la-md border border-la-border-gold bg-la-gold-faint px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light hover:bg-la-gold hover:text-la-text-inverse"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Copiar Estrutura do Mapa Mental Didático</span>
                </button>
              </div>
            </section>
          ) : null}

          {/* --------------------------------------------------------------- */}
          {/* ABA 5 DO STUDIO: BRIEFING DE RECORTE, HISTÓRIA & VERSÕES        */}
          {/* --------------------------------------------------------------- */}
          {studioActiveTab === "briefing_versoes" ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-7">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  AJUSTES DE RECORTE & HISTÓRIA DA MARCA (SEM QUEBRAR A
                  ESTRATÉGIA)
                </span>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Ajuste de Recorte Específico deste Roteiro
                  </label>
                  <textarea
                    rows={2}
                    value={currentScript.briefingCutAdjustment}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        briefingCutAdjustment: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.625rem] uppercase text-la-text-secondary">
                    Exemplos Obrigatórios & Conexão com a História da Marca
                  </label>
                  <textarea
                    rows={3}
                    value={currentScript.mandatoryExamplesToInclude}
                    onChange={(e) =>
                      updateCurrentScript((prev) => ({
                        ...prev,
                        mandatoryExamplesToInclude: e.target.value,
                      }))
                    }
                    className="w-full rounded-la-md border border-white/14 bg-black/60 p-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#080B12]/95 p-6 lg:col-span-5">
                <span className="font-la-mono text-[0.6875rem] font-bold uppercase text-la-gold-light">
                  HISTÓRICO DE VERSÕES DESTE ROTEIRO
                </span>
                <div className="flex flex-col gap-2.5">
                  {currentScript.versionHistory.map((vh, i) => (
                    <div
                      key={i}
                      className="rounded-la-lg border border-white/10 bg-black/50 p-3.5"
                    >
                      <div className="flex items-center justify-between font-la-mono text-[0.6875rem]">
                        <strong className="text-la-gold-light">
                          {vh.versionLabel}
                        </strong>
                        <span className="text-la-text-muted">{vh.savedAt}</span>
                      </div>
                      <p className="mt-1 font-la-sans text-[0.75rem] text-la-text-secondary">
                        {vh.summaryNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* MODAL: CRIAR NOVO ROTEIRO CONTEXTUALIZADO (SLOT F01 OU TEMA F02)    */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isCreateModalOpen ? (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[38rem] rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                  Criar Novo Pacote de Roteiro (Função 03)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleCreateScriptModalSubmit}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreateOrigin("calendar_slot")}
                    className={clsx(
                      "rounded-la-lg border p-3 text-left transition-all",
                      createOrigin === "calendar_slot"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] font-bold uppercase text-la-gold-light">
                      ★ RECOMENDADO (FUNÇÃO 01)
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      A partir de um Slot do Calendário
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateOrigin("theme_library")}
                    className={clsx(
                      "rounded-la-lg border p-3 text-left transition-all",
                      createOrigin === "theme_library"
                        ? "border-la-gold bg-la-gold-faint"
                        : "border-white/10 bg-black/45"
                    )}
                  >
                    <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                      OPÇÃO 02 (FUNÇÃO 02)
                    </span>
                    <span className="mt-0.5 block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      A partir de um Tema da Biblioteca
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Formato do Conteúdo
                  </label>
                  <select
                    value={createFormatSlug}
                    onChange={(e) =>
                      setCreateFormatSlug(e.target.value as ScriptFormatSlug)
                    }
                    className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.875rem] text-la-text-primary"
                  >
                    {SCRIPT_FORMATS_CATALOG.map((f) => (
                      <option key={f.slug} value={f.slug}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {createOrigin === "calendar_slot" &&
                calendarSlots.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Selecionar Slot do Calendário (Opcional)
                    </label>
                    <select
                      value={createSelectedSlotId}
                      onChange={(e) => setCreateSelectedSlotId(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                    >
                      <option value="">
                        Digitar tema personalizado abaixo...
                      </option>
                      {calendarSlots.slice(0, 14).map((s) => (
                        <option key={s.id} value={s.id}>
                          {String(s.dayNumber).padStart(2, "0")} {s.monthShort}{" "}
                          • {FORMAT_META[s.format].shortLabel} •{" "}
                          {s.mainTheme || s.provisionalTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {createOrigin === "theme_library" && themeLibrary.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                      Selecionar Tema Aprovado da Biblioteca (Opcional)
                    </label>
                    <select
                      value={createSelectedThemeId}
                      onChange={(e) => setCreateSelectedThemeId(e.target.value)}
                      className="min-h-[2.5rem] rounded-la-md border border-white/14 bg-black/60 px-3 font-la-sans text-[0.8125rem] text-la-text-primary"
                    >
                      <option value="">
                        Digitar tema personalizado abaixo...
                      </option>
                      {themeLibrary.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.retinaType}] {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="flex flex-col gap-1">
                  <label className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                    Título / Tema do Roteiro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: O erro invisível na gestão de risco"
                    value={createCustomTitle}
                    onChange={(e) => setCreateCustomTitle(e.target.value)}
                    className="min-h-[2.625rem] rounded-la-md border border-white/14 bg-black/60 px-3.5 py-2 font-la-sans text-[0.875rem] text-la-text-primary"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-[0.8125rem] text-la-text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse"
                  >
                    Gerar Pacote Completo e Abrir Studio
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

export default RoteirosEditorialModule;