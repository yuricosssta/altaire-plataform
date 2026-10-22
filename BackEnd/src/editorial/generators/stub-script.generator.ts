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

@Injectable()
export class StubScriptGenerator extends ScriptGenerator {
  async generate(context: IScriptGenerationContext): Promise<IScriptContent> {
    const theme = context.themeTitle || 'Estratégia e Conteúdo';
    const mode = context.mode;
    const format = context.format;

    const templates = BLOCKS_BY_FORMAT[format] || BLOCKS_BY_FORMAT.reel;

    const blocks: IScriptBlock[] = templates.map((tpl, idx) => ({
      order: idx,
      type: tpl.type,
      title: tpl.title,
      content: tpl.content(theme, mode),
      visualDirection: tpl.visualDirection(mode),
      timeRange: tpl.timeRange,
    }));

    const caption = `🔥 ${theme}\n\nVocê já parou para analisar como isso impacta sua esteira de resultados? No conteúdo de hoje, abordamos exatamente os pontos cegos que a maioria ignora.\n\n👇 Me conta nos comentários: qual é o seu maior desafio nisso hoje?\n\n#estrategia #conteudo #altaire #crescimento`;

    const titles: ITitleSuggestion[] = [
      {
        title: `Como dominar ${theme} sem perder tempo`,
        hookType: 'metodo',
      },
      {
        title: `O maior erro que cometem em ${theme}`,
        hookType: 'erro',
      },
      {
        title: `O que ninguém te conta sobre ${theme}`,
        hookType: 'bastidor',
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

    return {
      blocks,
      caption,
      titles,
      thumbnailPrompts,
      complementaryMaterials: [
        {
          type: 'pdf_checklist',
          title: `Checklist Prático: ${theme}`,
          promise: 'Guia de bolso para validar cada etapa antes de publicar.',
          structure: [
            'Passo 1: Diagnóstico',
            'Passo 2: Execução',
            'Passo 3: Métricas',
          ],
          status: 'pronto',
        },
      ],
      explanationMaterials: [
        {
          type: 'mapa_mental',
          title: `Estrutura Mental: ${theme}`,
          content: `Visão geral hierárquica dos conceitos fundamentais de ${theme}.`,
          status: 'pronto',
        },
      ],
    };
  }

  async regenerateBlock(
    block: IScriptBlock,
    context?: string,
  ): Promise<IScriptBlock> {
    const additional = context ? ` (${context})` : '';
    return {
      ...block,
      content: `${block.content}\n\n[Regenerado com foco aprimorado${additional}]`,
      visualDirection: `${block.visualDirection || ''} [Alternativa visual dinâmica aplicada.]`,
    };
  }
}
