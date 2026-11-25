import { Injectable } from '@nestjs/common';
import {
  IScriptBlock,
  IScriptContent,
  ITitleSuggestion,
  IThumbnailPrompt,
  ScriptBlockType,
} from '../schemas/models/editorial-script.interface';
import { IScriptGenerationContext, ScriptGenerator } from './script-generator';
import { ContentFormat } from '../schemas/models/editorial-calendar.interface';

interface BlockTemplate {
  type: ScriptBlockType;
  title: string;
  content: (theme: string, mode: string) => string;
  visualDirection: (mode: string) => string;
  timeRange?: string;
}

const BLOCKS_BY_FORMAT: Record<ContentFormat, BlockTemplate[]> = {
  reel: [
    {
      type: 'gancho',
      title: 'Gancho (0-3s)',
      timeRange: '0:00 - 0:03',
      content: (t) => `Pare de fazer isso se você quer dominar ${t}!`,
      visualDirection: (m) =>
        m === 'seguranca'
          ? 'Enquadramento fechado, contato visual firme, corte rápido.'
          : 'Câmera dinâmica, ambiente espontâneo, tom acolhedor.',
    },
    {
      type: 'agitacao',
      title: 'Agitação / Dor (3-15s)',
      timeRange: '0:03 - 0:15',
      content: (t) =>
        `A maioria das pessoas tenta resolver ${t} do jeito errado e acaba perdendo tempo e energia sem sair do lugar.`,
      visualDirection: () =>
        'Corte para plano médio com texto de ênfase na tela.',
    },
    {
      type: 'miolo',
      title: 'Resolução / O Método (15-45s)',
      timeRange: '0:15 - 0:45',
      content: (t) =>
        `O segredo para transformar ${t} está em aplicar 3 passos práticos: clareza na rota, consistência no processo e validação constante.`,
      visualDirection: () =>
        'Demonstração em tela dividida ou tópicos numerados surgindo.',
    },
    {
      type: 'cta',
      title: 'Chamada para Ação (45-60s)',
      timeRange: '0:45 - 0:60',
      content: () =>
        'Comente "ROTEIRO" aqui embaixo para receber o material complementar direto no seu direct!',
      visualDirection: () =>
        'Apontando para a legenda com sticker de engajamento.',
    },
  ],
  long_video: [
    {
      type: 'introducao',
      title: 'Introdução e Promessa',
      timeRange: '0:00 - 1:30',
      content: (t) =>
        `Neste vídeo completo, você vai entender o passo a passo definitivo sobre ${t} e como aplicar de forma prática.`,
      visualDirection: () => 'Apresentação em estúdio com iluminação suave.',
    },
    {
      type: 'contextualizacao',
      title: 'Contextualização e Diagnóstico',
      timeRange: '1:30 - 4:00',
      content: (t) =>
        `Por que entender ${t} é o divisor de águas entre quem estagna e quem escala seus resultados.`,
      visualDirection: () => 'Gráficos explicativos e estudos de caso na tela.',
    },
    {
      type: 'bloco_ensino',
      title: 'O Núcleo Teórico e Prático',
      timeRange: '4:00 - 12:00',
      content: (t) =>
        `Aqui dissecamos a fundo os pilares de ${t}, abordando os erros comuns e os frameworks validados.`,
      visualDirection: () =>
        'Captura de tela/slides intercalados com o apresentador.',
    },
    {
      type: 'recompensa',
      title: 'Recapitulação e Insights de Aplicação',
      timeRange: '12:00 - 14:00',
      content: () =>
        'Um resumo das principais lições para você guardar e implementar agora.',
      visualDirection: () => 'Mapa mental resumido na tela.',
    },
    {
      type: 'cta_final',
      title: 'Conclusão e Próximos Passos',
      timeRange: '14:00 - 15:00',
      content: () =>
        'Inscreva-se no canal, ative o sininho e confira os links na descrição.',
      visualDirection: () => 'Cards finais clicáveis e end-screen.',
    },
  ],
  carousel: [
    {
      type: 'slide_capa',
      title: 'Slide 1: Capa',
      content: (t) => `O guia prático de ${t}: o que ninguém te conta.`,
      visualDirection: () => 'Título impactante em caixa alta, contraste alto.',
    },
    {
      type: 'slide_contextualizacao',
      title: 'Slide 2: O Problema',
      content: () =>
        'Você já sentiu que está se esforçando muito mas colhendo pouco resultado?',
      visualDirection: () => 'Texto curto com ícone de alerta.',
    },
    {
      type: 'slide_miolo',
      title: 'Slide 3: O Ponto de Virada',
      content: (t) =>
        `Quando você ajusta o pilar de ${t}, tudo começa a fluir com naturalidade.`,
      visualDirection: () => 'Diagrama visual de 3 etapas.',
    },
    {
      type: 'slide_recompensa',
      title: 'Slide 4: A Aplicação',
      content: () =>
        'Faça isto hoje: 1) Diagnostique seu gargalo; 2) Aplique a técnica; 3) Meça o avanço.',
      visualDirection: () => 'Checklist visual com caixas de marcação.',
    },
    {
      type: 'slide_cta',
      title: 'Slide 5: CTA',
      content: () =>
        'Salve este post para consultar depois e compartilhe com quem precisa ver isso!',
      visualDirection: () => 'Seta indicando o ícone de salvar do Instagram.',
    },
  ],
  static_post: [
    {
      type: 'outdoor',
      title: 'Arte / Imagem de Impacto',
      content: (t) =>
        `Frase de autoridade: "Quem domina ${t} não compete por preço."`,
      visualDirection: () =>
        'Design minimalista, tipografia elegante e contrastante.',
    },
    {
      type: 'bloco_1_gancho',
      title: 'Início da Legenda',
      content: (t) => `Leia com atenção se você trabalha com ${t}:`,
      visualDirection: () => 'Primeira linha da legenda.',
    },
    {
      type: 'bloco_3_desenvolvimento',
      title: 'Desenvolvimento do Conteúdo',
      content: (t) =>
        `Existe uma diferença fundamental entre executar tarefas e construir estratégia em ${t}. O segredo está nos detalhes do dia a dia.`,
      visualDirection: () => 'Parágrafos curtos e escaneáveis.',
    },
    {
      type: 'bloco_5_cta',
      title: 'Chamada Final',
      content: () => 'Qual é a sua opinião sobre isso? Deixe seu comentário.',
      visualDirection: () => 'Final da legenda com hashtags temáticas.',
    },
  ],
  live: [
    {
      type: 'acolhimento',
      title: 'Acolhimento (0-5 min)',
      timeRange: '0:00 - 5:00',
      content: (t) =>
        `Boas-vindas a todos! Hoje nossa aula ao vivo é sobre ${t}. Mandem de onde estão assistindo!`,
      visualDirection: () =>
        'Música ambiente de entrada, câmera em plano aberto.',
    },
    {
      type: 'ancoragem',
      title: 'Ancoragem do Tema (5-15 min)',
      timeRange: '5:00 - 15:00',
      content: (t) =>
        `Por que esta aula sobre ${t} pode mudar o rumo dos seus próximos 30 dias.`,
      visualDirection: () => 'Apresentação do objetivo da live.',
    },
    {
      type: 'onda',
      title: 'Conteúdo em Ondas (15-40 min)',
      timeRange: '15:00 - 40:00',
      content: (t) =>
        `Primeiro bloco de conteúdo prático, abrindo espaço para dúvidas sobre ${t}.`,
      visualDirection: () =>
        'Quadro branco ou compartilhamento de tela com anotações.',
    },
    {
      type: 'pico',
      title: 'Momento Clímax / Oferta (40-50 min)',
      timeRange: '40:00 - 50:00',
      content: () =>
        'A revelação do próximo nível e apresentação da oportunidade especial para quem está ao vivo.',
      visualDirection: () => 'Slide exclusivo com link fixado nos comentários.',
    },
    {
      type: 'qa_encerramento',
      title: 'Perguntas e Respostas (50-60 min)',
      timeRange: '50:00 - 60:00',
      content: () => 'Respondendo as dúvidas do chat e encerramento caloroso.',
      visualDirection: () => 'Leitura direta dos nomes no chat.',
    },
  ],
  stories_sequence: [
    {
      type: 'manha',
      title: 'Sequência 1: Manhã (Abertura)',
      content: (t) =>
        `Bom dia! Hoje acordei pensando em uma pergunta que sempre me fazem sobre ${t}...`,
      visualDirection: () => 'Caixa de perguntas ou enquete interativa.',
    },
    {
      type: 'almoco',
      title: 'Sequência 2: Almoço (Bastidor)',
      content: (t) =>
        `Olha esse exemplo real que aconteceu hoje ao aplicar ${t}.`,
      visualDirection: () => 'Vídeo em selfie ou foto de bastidor.',
    },
    {
      type: 'tarde',
      title: 'Sequência 3: Tarde (Conteúdo Rápido)',
      content: () =>
        'Se você comete este erro, pare imediatamente. O jeito certo é este:',
      visualDirection: () => 'Texto sobre imagem com sticker de reação.',
    },
    {
      type: 'noite',
      title: 'Sequência 4: Noite (CTA e Conclusão)',
      content: () =>
        'Respondi algumas caixinhas no direct. Quer que eu aprofunde amanhã? Vote abaixo!',
      visualDirection: () => 'Enquete de 2 opções.',
    },
  ],
};

const FORMAT_SLUG_MAP: Record<ContentFormat, string> = {
  reel: 'short_video',
  long_video: 'long_video',
  carousel: 'carousel',
  static_post: 'static_post',
  live: 'live',
  stories_sequence: 'stories_sequence',
};

const SLOT_FORMAT_MAP: Record<ContentFormat, string> = {
  reel: 'reel_curto',
  long_video: 'video_longo',
  carousel: 'carrossel',
  static_post: 'post_estatico',
  live: 'live_semanal',
  stories_sequence: 'sequencia_stories',
};

const DURATION_MAP: Record<ContentFormat, string> = {
  reel: '45s a 60s (~140 palavras)',
  long_video: '10 a 15 min (~1.800 palavras)',
  live: '45 a 60 min (Ao Vivo)',
  carousel: '10 Lâminas (Proporção 4:5)',
  static_post: 'Peça Única + Legenda',
  stories_sequence: '4 Blocos/dia (20 stories)',
};

@Injectable()
export class StubScriptGenerator extends ScriptGenerator {
  async generate(context: IScriptGenerationContext): Promise<IScriptContent> {
    // TODO(LLM): Substituir geração por templates determinísticos por chamada à LLM especializada
    // usando o contexto completo do Projeto, Base Estratégica (ROMA/ICP/Tom de Voz), BrandStory e Briefing.
    // Input: IScriptGenerationContext
    // Output esperado: IScriptContent (blocos, slides de carrossel, 4 sequências de stories, legenda, SEO, títulos e prompts de imagem).

    const theme = context.themeTitle || 'Estratégia e Conteúdo';
    const mode = context.mode;
    const format = context.format;
    const niche = context.niche || 'Estratégia';
    const subniche = context.subniche || niche;
    const editorialPillar =
      context.editorialPillar || '03. Mecanismo Único da Oferta (MUV em Ação)';
    const strategicObjective =
      context.strategicObjective || 'Elevar consciência e converter';
    const icpPainOrObjection =
      context.icpPainOrObjection ||
      'Falta de previsibilidade e direção estratégica na rotina';

    const templates = BLOCKS_BY_FORMAT[format] || BLOCKS_BY_FORMAT.reel;

    const blocks: IScriptBlock[] = templates.map((tpl, idx) => ({
      order: idx,
      type: tpl.type,
      title: tpl.title,
      content: tpl.content(theme, mode),
      visualDirection: tpl.visualDirection(mode),
      timeRange: tpl.timeRange,
    }));

    const scriptBlocks = blocks.map((b, idx) => ({
      id: `blk-${format}-${idx + 1}`,
      timecodeOrStage: b.timeRange
        ? `${b.timeRange} · ${b.title}`
        : b.title || `Bloco ${idx + 1}`,
      psychologicalRole: `Cumprir etapa ${b.type} para ${strategicObjective}`,
      visualAndAudioDirection: b.visualDirection || '',
      wordForWordSpeech: b.content,
      connectionBulletLine: `• ${b.title}: ${b.content}`,
    }));

    const captionOutdoorHook = `${theme.toUpperCase()} — O ponto cego que separa operações previsíveis de quem vive no improviso em ${subniche}.`;
    const captionBody = `Você já parou para analisar como ${theme} impacta sua esteira de resultados? No conteúdo de hoje, abordamos o pilar "${editorialPillar}" para transformar "${icpPainOrObjection}" em execução previsível.`;
    const captionCta = `Me conta nos comentários: qual é o seu maior desafio em ${subniche} hoje?`;
    const caption = `🔥 ${theme}\n\n${captionBody}\n\n👇 ${captionCta}\n\n#estrategia #conteudo #altaire #crescimento`;

    const titles: ITitleSuggestion[] = [
      { title: `Como dominar ${theme} sem perder tempo`, hookType: 'metodo' },
      { title: `O maior erro que cometem em ${theme}`, hookType: 'erro' },
      { title: `O que ninguém te conta sobre ${theme}`, hookType: 'bastidor' },
    ];

    const titleVariations = [
      {
        id: 'ttl-1',
        hookCategory: 'Erro Invisível',
        titleText: theme,
        estimatedCtrBadge: 'CTR Alto • Principal',
        isSelected: true,
      },
      {
        id: 'ttl-2',
        hookCategory: 'Contraste Direto',
        titleText: `Por que 90% trava em ${subniche} (e o protocolo para ter previsibilidade)`,
        estimatedCtrBadge: 'Retenção Forte',
        isSelected: false,
      },
      {
        id: 'ttl-3',
        hookCategory: 'Mecanismo Único (MUV)',
        titleText: `A Engenharia por trás de uma operação de ${subniche} enxuta e lucrativa`,
        estimatedCtrBadge: 'Autoridade Premium',
        isSelected: false,
      },
      {
        id: 'ttl-4',
        hookCategory: 'Anti-Clichê',
        titleText: `Pare de seguir o padrão comum de ${niche}: faça este ajuste antes`,
        estimatedCtrBadge: 'Quebra de Padrão',
        isSelected: false,
      },
      {
        id: 'ttl-5',
        hookCategory: 'Quebra de Objeção',
        titleText: `Como dominar ${theme} em menos de 1 hora por semana`,
        estimatedCtrBadge: 'Foco em Rotina',
        isSelected: false,
      },
      {
        id: 'ttl-6',
        hookCategory: 'Estudo de Caso / Prova',
        titleText: `Por dentro do nosso sistema de ${subniche}: o que mudou a conversão`,
        estimatedCtrBadge: 'Bastidor Real',
        isSelected: false,
      },
    ];

    const thumbnailPrompts: IThumbnailPrompt[] = [
      {
        promptEn: `Professional cinematic shot of an authoritative creator discussing ${theme}, clean studio lighting, high resolution 8k`,
        description: 'Enquadramento profissional com iluminação de estúdio.',
        format:
          format === 'reel' || format === 'stories_sequence' ? '9:16' : '16:9',
      },
      {
        promptEn: `Minimalist split-screen concept highlighting before and after results related to ${theme}, elegant gold and dark theme`,
        description: 'Conceito antes e depois minimalista nas cores da marca.',
        format: '16:9',
      },
    ];

    const imagePrompts = thumbnailPrompts.map((tp, idx) => ({
      id: `img-${idx + 1}`,
      targetPiece:
        idx === 0
          ? 'Thumbnail Principal / Capa de Alto CTR'
          : 'Capa Secundária Dark/Gold',
      visualConceptPT: tp.description || 'Composição editorial Dark/Gold',
      promptEnglish: tp.promptEn,
      textOverlaySuggestion: theme.slice(0, 48).toUpperCase(),
    }));

    const carouselSlides = Array.from({ length: 10 }, (_, idx) => ({
      slideNumber: idx + 1,
      roleLabel: `Slide ${String(idx + 1).padStart(2, '0')}`,
      headline:
        idx === 0
          ? theme
          : idx === 9
            ? 'Salve este post para aplicar na sua semana.'
            : `Etapa ${idx + 1}: Aprofundamento em ${subniche}`,
      bodyLineBreakCopy:
        blocks[idx % blocks.length]?.content ||
        `Desenvolvimento estrutural sobre ${theme}.`,
      visualDesignNote:
        'Fundo #080B12, tipografia clara e destaque em Ouro (#D4AF37).',
      imagePromptEN: `Minimalist dark obsidian slide #080B12 with gold accents for ${subniche} --ar 4:5`,
    }));

    const buildStoryCards = (period: string) =>
      [1, 2, 3, 4, 5].map((num) => ({
        cardNumber: num,
        cardType:
          num === 2 || num === 4
            ? 'video_fala'
            : num === 3
              ? 'bastidor_prova'
              : 'texto_sobre_foto',
        intentionLabel: `Card ${num} (${period})`,
        wordForWordScript: `Foco de ${subniche} (${period} · Card ${num}): ${theme}. Superando "${icpPainOrObjection}".`,
        connectionBullet: `• Card ${num} (${period}): desenvolver "${theme}" conectando a ${editorialPillar}.`,
        mirrorCaptionNoSound: `Resumo na tela: ${theme} (${period}).`,
        instagramSticker:
          num === 1
            ? 'Enquete: Você aplica isso hoje? [Sim / Ainda travo]'
            : num === 5
              ? `Caixa de Perguntas: Qual sua dúvida sobre ${subniche}?`
              : 'Sem sticker',
        visualBrandingNote:
          'Contraste Dark-First e legenda centralizada para leitura sem som.',
      }));

    const storyPeriods = (['Manhã', 'Almoço', 'Tarde', 'Noite'] as const).map(
      (period, idx) => ({
        period,
        suggestedTime: ['08:30', '12:30', '16:30', '20:30'][idx],
        narrativeTheme: `${period} — ${theme}`,
        cards: buildStoryCards(period),
      }),
    );

    const qualified =
      format === 'long_video' || format === 'carousel' || format === 'live';

    return {
      blocks,
      caption,
      titles,
      thumbnailPrompts,
      complementaryMaterials: [
        {
          type: 'pdf_checklist',
          title: `Checklist Prático: ${theme}`,
          promise: `Aplique o passo a passo de ${theme} sem esquecer nenhum ponto crítico.`,
          structure: [
            '1. Diagnóstico Inicial',
            '2. Pontos de Atenção',
            '3. Plano de Ação Imediato',
          ],
          status: 'pronto',
        },
      ],
      explanationMaterials: [
        {
          type: 'mapa_mental',
          title: `Mapa Mental: ${theme}`,
          content: `# ${theme}\n\n- Pilar 1: Fundamentos\n- Pilar 2: Execução\n- Pilar 3: Escala`,
          status: 'pronto',
        },
      ],
      formatSlug: FORMAT_SLUG_MAP[format] || 'short_video',
      calendarSlotFormat: SLOT_FORMAT_MAP[format] || 'reel_curto',
      speakingMode:
        mode === 'seguranca' ? 'seguranca_palavra' : 'conexao_bullets',
      estimatedDurationOrSize: DURATION_MAP[format] || '45s a 60s',
      versionLabel: 'v1.0',
      scriptBlocks,
      connectionSevenLinesChecklist: [
        `01. [GANCHO] Pare de tentar resolver ${subniche} no improviso.`,
        `02. [SINTOMA] ${icpPainOrObjection}`,
        `03. [CAUSA RAIZ] Falta de conexão com "${editorialPillar}".`,
        `04. [VIRADA] Primeiro contexto; depois execução.`,
        `05. [PASSO] Aplique 1 objetivo claro para ${theme}.`,
        `06. [QUEBRA DE TRAVA] Execução enxuta sem retrabalho.`,
        `07. [CTA] ${captionCta}`,
      ],
      carouselSlides,
      storyPeriods,
      predictiveQAs: [
        {
          id: 'qa-1',
          questionFromAudience: `Como começar em ${subniche} com pouco tempo?`,
          strategicAnswerCopy:
            'Isole os 2 formatos de maior alavancagem da semana e siga o contexto definido.',
          recommendedFormat: 'Vídeo com Legenda Espelho',
          qualifiedForMaterial: true,
        },
      ],
      postLiveStoriesSummary: [
        'Story Pós-Live 01: Bastidor da mesa + enquete de maior virada de chave.',
        'Story Pós-Live 02: Resumo de 15s da tese central com legenda espelho.',
        'Story Pós-Live 03: Chamada direta para o Material Complementar.',
      ],
      captionOutdoorHook,
      captionBody,
      captionCta,
      seoKeywords: [niche.toLowerCase(), subniche.toLowerCase(), 'estratégia'],
      seoTags: ['#Altaire', '#EstrategiaEditorial'],
      youtubeChapters: [
        '00:00 Introdução',
        '01:30 Diagnóstico',
        '04:00 Método',
        '12:00 Conclusão e CTA',
      ],
      titleVariations,
      imagePrompts,
      qualifiedForComplementaryMaterial: qualified,
      complementaryMaterial: {
        typeLabel:
          format === 'long_video' ? 'Planilha Executiva XLSX' : 'Checklist PDF',
        title: `Diagnóstico & Checklist — ${theme.slice(0, 44)}`,
        promise: `Aplicar os critérios de ${subniche} sem perder etapas.`,
        sectionsOutline: [
          '1. Recapitulação do Problema Real',
          '2. Checklist de Verificação Rápida',
          '3. Plano de Ação Imediata',
        ],
      },
      explanationMaterial: {
        typeLabel: 'Mapa Mental da Aula',
        title: `Mapa Mental & Diagrama — ${editorialPillar}`,
        diagramNodes: [
          `Nó Central: ${theme}`,
          `Causa Raiz: ${icpPainOrObjection}`,
          `Pilar: ${editorialPillar}`,
        ],
      },
      versionHistory: [
        {
          versionLabel: 'v1.0 (Original)',
          savedAt: 'Criado hoje',
          modeUsed:
            mode === 'seguranca' ? 'seguranca_palavra' : 'conexao_bullets',
          summaryNote: `Gerado com contexto do projeto para ${theme}.`,
        },
      ],
    };
  }

  async regenerateBlock(
    block: IScriptBlock,
    context?: string,
  ): Promise<IScriptBlock> {
    // TODO(LLM): Regenerar bloco individual mantendo coerência narrativa com blocos adjacentes e tom de voz.
    // Input: { block, context }
    // Output esperado: IScriptBlock

    const suffix = context ? ` (Foco adicional: ${context})` : '';
    return {
      ...block,
      content: `[Versão Otimizada] ${block.content}${suffix}`,
      visualDirection: block.visualDirection
        ? `${block.visualDirection} [Alternativa visual: Corte dinâmico]`
        : 'Corte dinâmico com B-Roll de apoio.',
    };
  }

  async regenerateStoryCard(context: {
    period: 'Manhã' | 'Almoço' | 'Tarde' | 'Noite';
    cardNumber: number;
    currentCard: Record<string, unknown>;
    icpPainOrObjection?: string;
    subniche?: string;
  }): Promise<Record<string, unknown>> {
    // TODO(LLM): Regenerar um único card de Story preservando o encadeamento narrativo do período.
    // Input: { period, cardNumber, currentCard, icpPainOrObjection, subniche }
    // Output esperado: StoryCardItem atualizado

    const currentScript = String(context.currentCard.wordForWordScript || '');
    const currentMirror = String(
      context.currentCard.mirrorCaptionNoSound || '',
    );
    return {
      ...context.currentCard,
      wordForWordScript: `${currentScript}\n\n[Ângulo Regenerado pela IA]: Conectando diretamente à superação de "${context.icpPainOrObjection || 'objeção central'}" em ${context.subniche || 'seu mercado'}.`,
      mirrorCaptionNoSound: `${currentMirror} (Versão otimizada p/ retenção sem som)`,
    };
  }

  async adaptScriptToProject(context: {
    sourceScript: Record<string, unknown>;
    targetProject: {
      id: string;
      name: string;
      niche: string;
      subniche: string;
      currentObjective: string;
    };
    targetStrategicBase?: Record<string, unknown>;
    customTitle?: string;
    preserveComplementaryMaterial?: boolean;
  }): Promise<Record<string, unknown>> {
    // TODO(LLM): Reescrever gancho outdoor, blocos de roteiro, legenda e CTA adaptando
    // o pacote de origem para a oferta, promessa ROMA, ICP e tom de voz do projeto de destino.
    // Input: { sourceScript, targetProject, targetStrategicBase, customTitle }
    // Output esperado: Campos adaptados do EditorialScript

    const base = context.targetStrategicBase || {};
    const offer = String(
      base.mainProductOrOffer || context.targetProject.subniche,
    );
    const promise = String(
      base.mainPromise || context.targetProject.currentObjective,
    );
    const sourceTitle = String(context.sourceScript.title || 'Roteiro');
    const sourceHook = String(
      context.sourceScript.captionOutdoorHook ||
        context.sourceScript.caption ||
        '',
    );

    return {
      title:
        context.customTitle?.trim() ||
        `${sourceTitle} (${context.targetProject.name})`,
      status: 'rascunho',
      captionOutdoorHook: `[Adaptado para ${offer}] ${sourceHook}`,
      captionBody: `[Contexto: ${context.targetProject.niche} / ${context.targetProject.subniche}] ${String(context.sourceScript.captionBody || '')}`,
      captionCta: `CTA alinhado à promessa: "${promise}"`,
      caption: `[Adaptado para ${context.targetProject.name}]\n\n${String(context.sourceScript.caption || '')}`,
      complementaryMaterial: context.preserveComplementaryMaterial
        ? context.sourceScript.complementaryMaterial
        : undefined,
      complementaryMaterials: context.preserveComplementaryMaterial
        ? context.sourceScript.complementaryMaterials
        : [],
    };
  }
}
