import type {
  Script,
  ScriptFormat,
  ScriptMode,
  ScriptStatus,
  ScriptBlock,
  TitleSuggestion,
  ThumbnailPrompt,
  ComplementaryMaterial,
  ExplanationMaterial,
  ScriptAttachment,
  ScriptVersion,
  CalendarSlotForScript,
  ThemeForScript,
  BrandStory,
  GenerationResult,
} from '@/lib/dto/editorial.schema';

function generateObjectId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i += 1) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

const PROJECT_ID = '64f1b2c3e4b0a1c2d3e4f5a6';
const NOW = new Date();
const DAY_MS = 86400000;

// ===== FORMAT LABELS =====
export const FORMAT_LABELS: Record<ScriptFormat, string> = {
  video_curto: 'Vídeos Curtos',
  video_longo: 'Vídeos Longos (YouTube)',
  live: 'Lives de Conteúdo',
  carrossel: 'Carrosséis',
  post_estatico: 'Posts Estáticos',
  stories_sequence: 'Sequências de Stories',
};

export const FORMAT_DESCRIPTIONS: Record<ScriptFormat, string> = {
  video_curto: 'Reels, Shorts e TikTok — conteúdo rápido de alta retenção',
  video_longo: 'YouTube — conteúdo profundo com ensino e autoridade',
  live: 'YouTube/Instagram/TikTok — conteúdo ao vivo com interação',
  carrossel: 'Instagram — slides com densidade de valor e salvamentos',
  post_estatico: 'Imagem única com legenda de alto dwell time',
  stories_sequence: 'Sequência diária de stories com narrativa do início ao fim',
};

export const FORMAT_ICONS: Record<ScriptFormat, string> = {
  video_curto: 'Video',
  video_longo: 'Film',
  live: 'Radio',
  carrossel: 'Columns',
  post_estatico: 'Image',
  stories_sequence: 'Square',
};

export const FORMAT_ROUTE: Record<ScriptFormat, string> = {
  video_curto: 'video-curto',
  video_longo: 'video-longo',
  live: 'live',
  carrossel: 'carrossel',
  post_estatico: 'post-estatico',
  stories_sequence: 'stories',
};

// ===== BLOCKS POR FORMATO =====

function videoCurtoBlocks(mode: ScriptMode): ScriptBlock[] {
  if (mode === 'seguranca') {
    return [
      { id: generateObjectId(), order: 0, type: 'gancho', title: 'Gancho', content: 'Você sabia que 90% das pessoas cometem esse erro toda semana?', visualDirection: 'Plano fechado no rosto, sobrancelhas levemente levantadas, tom de curiosidade', modeSpecificData: {}, timeRange: '0s–3s' },
      { id: generateObjectId(), order: 1, type: 'agitacao', title: 'Agitação', content: 'E o pior: esse erro está fazendo você perder dinheiro, tempo e credibilidade sem nem perceber.', visualDirection: 'Mudança para plano médio, mãos gesticulando, expressão de preocupação', modeSpecificData: {}, timeRange: '3s–8s' },
      { id: generateObjectId(), order: 2, type: 'miolo', title: 'Passo 1', content: 'O primeiro passo é identificar o padrão. Pare de fazer tudo sozinho e comece a delegar.', visualDirection: 'Inserir texto na tela: "PASSO 1: IDENTIFICAR"', modeSpecificData: {}, timeRange: '8s–45s' },
      { id: generateObjectId(), order: 3, type: 'miolo', title: 'Passo 2', content: 'Depois, crie um sistema simples de 3 etapas. Nada de planilhas complexas.', visualDirection: 'Gráfico simples aparecendo na tela', modeSpecificData: {}, timeRange: '8s–45s' },
      { id: generateObjectId(), order: 4, type: 'miolo', title: 'Passo 3', content: 'Por fim, automatize o que puder. Ferramentas de IA hoje fazem 80% do trabalho pesado.', visualDirection: 'Zoom no rosto, tom de autoridade', modeSpecificData: {}, timeRange: '8s–45s' },
      { id: generateObjectId(), order: 5, type: 'retencao', title: 'Incentivo de Retenção', content: 'E tem um detalhe que pouca gente sabe e que faz toda diferença...', visualDirection: 'Olhar para baixo, gesto de segredo, diminuição do tom de voz', modeSpecificData: {}, timeRange: '45s–55s' },
      { id: generateObjectId(), order: 6, type: 'cta', title: 'CTA Instantânea', content: 'COMENTA "SISTEMA" QUE EU TE MANDO O PASSO A PASSO COMPLETO.', visualDirection: 'Plano fechado apontando para baixo, texto na tela: "COMENTE SISTEMA"', modeSpecificData: {}, timeRange: '55s–60s' },
    ];
  }
  return [
    { id: generateObjectId(), order: 0, type: 'gancho', content: '[GANCHO - 0s a 3s]: "VOCÊ SABIA QUE 90% DAS PESSOAS PERDEM DINHEIRO POR CAUSA DISSO?" - Plano fechado, tom de ruptura', timeRange: '0s–3s' },
    { id: generateObjectId(), order: 1, type: 'agitacao', content: '[AGITAÇÃO - 3s a 8s]: "ENQUANTO VOCÊ ACHA QUE ESTÁ FAZENDO TUDO CERTO, O ERRO ESTÁ TE CUSTANDO CARO." - Tom de urgência, gestos marcados', timeRange: '3s–8s' },
    { id: generateObjectId(), order: 2, type: 'miolo', content: '[MIOLO - Passo 1]: "PASSO 1: PARE DE FAZER TUDO SOZINHO." - Cena: dedo apontado, texto na tela', timeRange: '8s–45s' },
    { id: generateObjectId(), order: 3, type: 'miolo', content: '[MIOLO - Passo 2]: "PASSO 2: CRIE UM SISTEMA DE 3 ETAPAS." - Cena: gráfico simples', timeRange: '8s–45s' },
    { id: generateObjectId(), order: 4, type: 'miolo', content: '[MIOLO - Passo 3]: "PASSO 3: AUTOMATIZE 80% COM IA." - Cena: zoom no rosto', timeRange: '8s–45s' },
    { id: generateObjectId(), order: 5, type: 'retencao', content: '[INCENTIVO DE RETENÇÃO - 45s a 55s]: "OLHA A LEGENDA QUE TEM UM DETALHE EXTRA." - Olhar para baixo', timeRange: '45s–55s' },
    { id: generateObjectId(), order: 6, type: 'cta', content: '[CTA - 55s a 60s]: "COMENTA SISTEMA PARA EU TE MANDAR." - Plano fechado apontando', timeRange: '55s–60s' },
  ];
}

function videoLongoBlocks(mode: ScriptMode): ScriptBlock[] {
  if (mode === 'seguranca') {
    return [
      { id: generateObjectId(), order: 0, type: 'gancho', title: 'Gancho Expandido', content: 'Hoje eu vou te mostrar o sistema que eu usei para multiplicar meus resultados por 10 nos últimos 12 meses.', visualDirection: 'Plano médio, postura de autoridade, contato visual direto com a lente', timeRange: '0:00–0:15' },
      { id: generateObjectId(), order: 1, type: 'agitacao', title: 'Agitação da Dor', content: 'Se você está cansado de tentar várias estratégias e não ver resultado, fica comigo que isso muda hoje.', visualDirection: 'Expressão de identificação com a dor do público', timeRange: '0:15–0:30' },
      { id: generateObjectId(), order: 2, type: 'introducao', title: 'O Incentivo do Meio', content: 'E no meio do vídeo, eu vou te revelar o segredo que poucas pessoas conhecem e que faz toda diferença.', visualDirection: 'Tom misterioso, mudança de plano', timeRange: '0:30–1:00' },
      { id: generateObjectId(), order: 3, type: 'contextualizacao', title: 'Apresentação de Autoridade', content: 'Meu nome é [Nome] e há mais de 5 anos eu estudo e aplico isso na prática, gerando mais de R$ 2M em resultados.', visualDirection: 'Corte para foto/feed de resultados', timeRange: '1:00–2:30' },
      { id: generateObjectId(), order: 4, type: 'contextualizacao', title: 'Explicação do Problema', content: 'O problema é que a maioria das pessoas acha que X funciona, mas na prática o que realmente funciona é Y.', visualDirection: 'Split screen mostrando antes e depois', timeRange: '1:00–2:30' },
      { id: generateObjectId(), order: 5, type: 'bloco_ensino', title: 'Bloco A — O Diagnóstico', content: 'Antes de qualquer mudança, você precisa saber exatamente onde está pisando. 80% das pessoas pulam essa etapa.', visualDirection: 'Mostrar diagrama de diagnóstico', timeRange: '2:30–10:00' },
      { id: generateObjectId(), order: 6, type: 'bloco_ensino', title: 'Bloco B — O Mecanismo', content: 'Agora que você já sabe qual é o problema, vou te mostrar o mecanismo que resolve isso de forma consistente.', visualDirection: 'Animação mostrando o mecanismo em ação', timeRange: '2:30–10:00' },
      { id: generateObjectId(), order: 7, type: 'bloco_ensino', title: 'Bloco C — A Implementação', content: 'Passo a passo prático de como aplicar o mecanismo no seu negócio ainda hoje.', visualDirection: 'Tela compartilhada mostrando ferramentas', timeRange: '2:30–10:00' },
      { id: generateObjectId(), order: 8, type: 'recompensa', title: 'O Resumo da Ópera', content: 'Então fica claro: identificar o padrão, aplicar o mecanismo e automatizar a execução. Esses 3 passos formam um sistema único.', visualDirection: 'Resumo visual na tela', timeRange: 'Últimos ±2 min' },
      { id: generateObjectId(), order: 9, type: 'recompensa', title: 'A Entrega da Dica Extra', content: 'E para você que teve disciplina de ficar até aqui, a dica extra é: comece pequeno, mas comece hoje.', visualDirection: 'Tom de confiança, olho no olho', timeRange: 'Últimos ±2 min' },
      { id: generateObjectId(), order: 10, type: 'cta_final', title: 'Fusão Temática', content: 'E se você quer se aprofundar ainda mais, eu gravei um vídeo completo sobre isso que está aparecendo na sua tela agora.', visualDirection: 'Plano fechado apontando para o card do YouTube', timeRange: 'Últimos ±20 s' },
    ];
  }
  return [
    { id: generateObjectId(), order: 0, type: 'gancho', content: 'Bullet 1 (Validação do Clique): "O SISTEMA QUE TRANSFORMOU MEUS RESULTADOS EM 12 MESES." Plano fechado, ruptura de padrão', timeRange: '0:00–0:15' },
    { id: generateObjectId(), order: 1, type: 'agitacao', content: 'Bullet 2 (Agitação da Dor): "CANSADO DE TENTAR E NÃO VER RESULTADO?" Tom visceral, conexão com a frustração', timeRange: '0:15–0:30' },
    { id: generateObjectId(), order: 2, type: 'introducao', content: 'Bullet 3 (Promessa + Incentivo do Meio): "NO MEIO DESTE VÍDEO VOU REVELAR O SEGREDO QUE FARÁ TUDO FAZER SENTIDO." Ativação de curiosidade', timeRange: '0:30–1:00' },
    { id: generateObjectId(), order: 3, type: 'contextualizacao', content: 'Bullet 1 (Apresentação de Motivo): Contraste: o que você ganha vs. o que perde se ignorar. Tom de autoridade', timeRange: '1:00–2:30' },
    { id: generateObjectId(), order: 4, type: 'contextualizacao', content: 'Bullet 2 (Esclarecimento de Tópicos): "EXISTEM 3 PASSOS ESSENCIAIS, MAS O TERCEIRO É O MAIS IMPORTANTE." Curiosidade ativa', timeRange: '1:00–2:30' },
    { id: generateObjectId(), order: 5, type: 'bloco_ensino', content: 'Bullet 1 (Bloco A): "O ERRO DO DIAGNÓSTICO INCOMPLETO." + Afirmação + Quebra de expectativa + Humanização + Contraste + Ferramenta + Open Loop', timeRange: '2:30–10:00' },
    { id: generateObjectId(), order: 6, type: 'bloco_ensino', content: 'Bullet 1 (Bloco B): "O MECANISMO OCULTO QUE NINGUÉM ENSINA." + Afirmação + Virada + Metáfora + Contraste operacional + Tutorial + Open Loop', timeRange: '2:30–10:00' },
    { id: generateObjectId(), order: 7, type: 'bloco_ensino', content: 'Bullet 1 (Bloco C): "A IMPLEMENTAÇÃO QUE GERA RESULTADO EM 7 DIAS." + Afirmação + Passo a passo + Ferramentas + Open Loop', timeRange: '2:30–10:00' },
    { id: generateObjectId(), order: 8, type: 'recompensa', content: 'Bullet 1 (O Resumo da Ópera): Amarração dos 3 blocos em Sistema Único. Tom de poder e autoridade máxima', timeRange: 'Últimos ±2 min' },
    { id: generateObjectId(), order: 9, type: 'recompensa', content: 'Bullet 2 (A Entrega da Dica Extra): "QUEM FICOU ATÉ AQUI MERECE A DICA EXTRA..." Pagamento do pacto + macete de ação', timeRange: 'Últimos ±2 min' },
    { id: generateObjectId(), order: 10, type: 'cta_final', content: 'Bullet Único (Fusão Temática): Apontar para tela: "...O VÍDEO COMPLETO ESTÁ NA SUA TELA AGORA. CLICA E VAMOS CONTINUAR." Sem tchau, sem like', timeRange: 'Últimos ±20 s' },
  ];
}

function liveBlocks(): ScriptBlock[] {
  return [
    { id: generateObjectId(), order: 0, type: 'acolhimento', content: 'Bullet 1 (Alta energia): "BEM-VINDOS! HOJE VAMOS DESTRAVAR O SEGREDO QUE NINGUÉM TE CONTA SOBRE [TEMA]." Comando: "COMENTA 1 SE ESTÁ PRONTO"', timeRange: '00–05 min' },
    { id: generateObjectId(), order: 1, type: 'acolhimento', content: 'Bullet 2 (Ciclo de reforço): Quem acabou de chegar, o tema de hoje é [TEMA] e até o final você vai ter na mão o passo a passo. Comando: "DIGITE O QUÊ VOCÊ MAIS QUER APRENDER"', timeRange: '00–05 min' },
    { id: generateObjectId(), order: 2, type: 'ancoragem', content: 'Promessa: Ao final desta live, você terá um sistema completo para [resultado].', timeRange: '05–10 min' },
    { id: generateObjectId(), order: 3, type: 'ancoragem', content: 'Agenda: 1) Diagnóstico 2) Mecanismo 3) Passo a passo 4) Estudo de caso 5) Q&A', timeRange: '05–10 min' },
    { id: generateObjectId(), order: 4, type: 'ancoragem', content: 'Isca de retenção: Checklist completo liberado nos comentários para quem digitar CHECKLIST', timeRange: '05–10 min' },
    { id: generateObjectId(), order: 5, type: 'onda', title: 'Onda 1 — Diagnóstico', content: 'Tópico 01: O erro invisível que sabota seus resultados sem você perceber', timeRange: '10–40 min' },
    { id: generateObjectId(), order: 6, type: 'onda', content: 'Tópico 02: Como identificar esse padrão em 3 minutos', timeRange: '10–40 min' },
    { id: generateObjectId(), order: 7, type: 'onda', content: 'Checkpoint: "Quantos de vocês já passaram por isso? REAGE COM 🖐️"', timeRange: '10–40 min' },
    { id: generateObjectId(), order: 8, type: 'pico', content: 'Pico de valor: O resumo da ópera — 3 pilares que sustentam tudo', timeRange: '40–50 min' },
    { id: generateObjectId(), order: 9, type: 'pico', content: 'Pitch de alternância: "SE VOCÊ QUER O MATERIAL COMPLETO, DIGITE EU QUERO NOS COMENTÁRIOS"', timeRange: '40–50 min' },
    { id: generateObjectId(), order: 10, type: 'qa_encerramento', content: 'Pergunta 1: "Como começar se eu não tenho tempo?" Resposta: Bloco de 15 minutos por dia.', timeRange: '50–60 min' },
    { id: generateObjectId(), order: 11, type: 'qa_encerramento', content: 'Pergunta 2: "Precisa de ferramentas pagas?" Resposta: 70% é feito com ferramentas gratuitas.', timeRange: '50–60 min' },
    { id: generateObjectId(), order: 12, type: 'qa_encerramento', content: 'Encerramento: "PRÓXIMA LIVE SEMANA QUE VEM, MESMO HORÁRIO. UM ABRAÇO E ATÉ LÁ!"', timeRange: '50–60 min' },
  ];
}

function carrosselSlides(): ScriptBlock[] {
  return [
    { id: generateObjectId(), order: 0, type: 'slide_capa', title: 'Slide 1 — Capa', content: 'O ERRO QUE ESTÁ TRAVANDO SEU CRESCIMENTO', visualDirection: 'Fundo preto, texto dourado centralizado, tipografia impactante', timeRange: 'Slide 1' },
    { id: generateObjectId(), order: 1, type: 'slide_contextualizacao', title: 'Slide 2 — Contexto', content: 'Você posta todos os dias, mas os resultados não vêm. O problema não é você.', visualDirection: 'Fundo escuro, texto branco, destaque em dourado na palavra "não"', timeRange: 'Slide 2' },
    { id: generateObjectId(), order: 2, type: 'slide_miolo', title: 'Slide 3 — O Diagnóstico', content: '🔸 80% das pessoas pulam a etapa de diagnóstico', visualDirection: 'Ícone de checklist, bullet points', timeRange: 'Slide 3' },
    { id: generateObjectId(), order: 3, type: 'slide_miolo', title: 'Slide 4 — Passo 1', content: '🔸 PASSO 1: Mapeie onde você está hoje', visualDirection: 'Gráfico simples, seta marcando o ponto atual', timeRange: 'Slide 4' },
    { id: generateObjectId(), order: 4, type: 'slide_miolo', title: 'Slide 5 — Passo 2', content: '🔸 PASSO 2: Defina onde quer chegar em 90 dias', visualDirection: 'Reta com destino marcado, ícone de bandeira', timeRange: 'Slide 5' },
    { id: generateObjectId(), order: 5, type: 'slide_miolo', title: 'Slide 6 — Passo 3', content: '🔸 PASSO 3: Crie o sistema de 3 etapas', visualDirection: 'Diagrama de engrenagens', timeRange: 'Slide 6' },
    { id: generateObjectId(), order: 6, type: 'slide_miolo', title: 'Slide 7 — O Mecanismo', content: '🔸 O segredo: consistência > intensidade', visualDirection: 'Gráfico de linha mostrando crescimento gradual', timeRange: 'Slide 7' },
    { id: generateObjectId(), order: 7, type: 'slide_recompensa', title: 'Slide 8 — Resumo', content: 'Diagnóstico → Sistema → Execução → Resultado', visualDirection: 'Fluxo visual com setas douradas', timeRange: 'Slide 8' },
    { id: generateObjectId(), order: 8, type: 'slide_recompensa', title: 'Slide 9 — Dica Extra', content: 'Comece com 1 hábito novo por semana. O efeito composto é real.', visualDirection: 'Citação em destaque, fundo com textura sutil', timeRange: 'Slide 9' },
    { id: generateObjectId(), order: 9, type: 'slide_cta', title: 'Slide 10 — CTA', content: 'SALVE ESTE CARROSSEL PARA VER DEPOIS', visualDirection: 'Fundo preto, CTA dourado, ícone de salvar', timeRange: 'Slide 10' },
  ];
}

function postEstaticoBlocks(): ScriptBlock[] {
  return [
    { id: generateObjectId(), order: 0, type: 'outdoor', title: 'Outdoor Digital', content: 'O conteúdo barato é o mais caro', visualDirection: 'Frase centralizada em tipografia grande minimalista', timeRange: 'Imagem' },
    { id: generateObjectId(), order: 1, type: 'bloco_1_gancho', content: 'Você já parou para pensar quanto custa produzir conteúdo que não converte? Mais do que você imagina.', visualDirection: 'Primeiras linhas da legenda, sem saudação', timeRange: 'Linhas 1–2' },
    { id: generateObjectId(), order: 2, type: 'bloco_2_contextualizacao', content: 'Lá no início, eu também achava que qualquer conteúdo servia. Publiquei dezenas de posts que não geravam 1 comentário sequer. Até que entendi: não é sobre quantidade, é sobre estratégia.', visualDirection: 'Micro-história de contraste', timeRange: 'Contexto' },
    { id: generateObjectId(), order: 3, type: 'bloco_3_desenvolvimento', content: '🔸 Nicho bem definido\n🔸 Dor atacada sem rodeios\n🔸 Promessa clara\n🔸 CTA cirúrgica\n🔸 Consistência de tom', visualDirection: 'Bullets com emojis funcionais', timeRange: 'Desenvolvimento' },
    { id: generateObjectId(), order: 4, type: 'bloco_4_objecao', content: '"Eu sei que você pode estar pensando que: \"mas não tenho tempo para produzir conteúdo de qualidade.\" A verdade é que com um sistema de 3 passos, você produz melhor em menos tempo."', visualDirection: 'Entre aspas, desmontando a desculpa', timeRange: 'Objeção' },
    { id: generateObjectId(), order: 5, type: 'bloco_5_cta', content: 'Qual foi o conteúdo mais caro que você já produziu e não deu retorno? Conta nos comentários.', visualDirection: 'Pergunta aberta e reflexiva', timeRange: 'CTA' },
  ];
}

function storiesBlocks(mode: ScriptMode): ScriptBlock[] {
  const prefix = mode === 'seguranca' ? '[Texto completo] ' : '[Bullet] ';
  return [
    { id: generateObjectId(), order: 0, type: 'manha', content: `${prefix}Card 1 — MANHÃ: Quebra de padrão. "O SEGREDO QUE NINGUÉM TE CONTA." Sticker: Enquete "Já sabia? Sim/Não"`, timeRange: 'Manhã' },
    { id: generateObjectId(), order: 1, type: 'manha', content: `${prefix}Card 2 — MANHÃ: Vídeo falado. Direção: câmera frontal, luz natural. Fala: "Hoje vou mostrar na prática como [tema] funciona." Legenda espelho: "Hoje: [tema] na prática"`, timeRange: 'Manhã' },
    { id: generateObjectId(), order: 2, type: 'manha', content: `${prefix}Card 3 — MANHÃ: Texto sobre foto. "O erro que todo mundo comete e você vai parar de cometer hoje." Sticker: Slider "0 a 10 — Quanto você já errou isso?"`, timeRange: 'Manhã' },
    { id: generateObjectId(), order: 3, type: 'almoco', content: `${prefix}Card 1 — ALMOÇO: Bastidor. "O processo que eu uso para [resultado]." Foto do setup/tela.`, timeRange: 'Almoço' },
    { id: generateObjectId(), order: 4, type: 'almoco', content: `${prefix}Card 2 — ALMOÇO: Vídeo. "A ferramenta que salvou minhas entregas." Direção: tela compartilhada.`, timeRange: 'Almoço' },
    { id: generateObjectId(), order: 5, type: 'almoco', content: `${prefix}Card 3 — ALMOÇO: Prova social. Resultado real de aluno/cliente. Texto: "O [Nome] conseguiu [resultado] em [tempo]."`, timeRange: 'Almoço' },
    { id: generateObjectId(), order: 6, type: 'tarde', content: `${prefix}Card 1 — TARDE: Filosofia. "O que ninguém te conta sobre consistência." Sticker: Caixa de pergunta "Qual sua maior dificuldade?"`, timeRange: 'Tarde' },
    { id: generateObjectId(), order: 7, type: 'tarde', content: `${prefix}Card 2 — TARDE: Reflexão. "3 lições que aprendi no último ano." Texto com fundo neutro, sem sticker.`, timeRange: 'Tarde' },
    { id: generateObjectId(), order: 8, type: 'noite', content: `${prefix}Card 1 — NOITE: Q&A. "SUA PERGUNTA RESPONDIDA AGORA." Sticker: Caixa de pergunta. Tema: [Tema do dia]`, timeRange: 'Noite' },
    { id: generateObjectId(), order: 9, type: 'noite', content: `${prefix}Card 2 — NOITE: Resposta em vídeo. Direção: plano fechado. "Sobre a pergunta do [Nome]..." Legenda espelho.`, timeRange: 'Noite' },
    { id: generateObjectId(), order: 10, type: 'noite', content: `${prefix}Card 3 — NOITE: Âncora. "LIVE SEMANA QUE VEM: [TEMA]. JÁ ATIVA O SININHO."`, timeRange: 'Noite' },
  ];
}

// ===== TÍTULOS (genérico) =====
function mockTitles(tema: string): TitleSuggestion[] {
  return [
    { id: generateObjectId(), title: `O erro de ${tema} que 90% comete`, hookType: 'erro' },
    { id: generateObjectId(), title: `O método definitivo para ${tema}`, hookType: 'metodo' },
    { id: generateObjectId(), title: `80% não sabe disso sobre ${tema}`, hookType: 'estatistica' },
    { id: generateObjectId(), title: `O maior mito sobre ${tema} — e a verdade`, hookType: 'mito' },
    { id: generateObjectId(), title: `Como ${tema} mudou meu negócio`, hookType: 'bastidor' },
    { id: generateObjectId(), title: `${tema}: o guia completo para iniciantes`, hookType: 'promessa' },
  ];
}

function mockThumbnailPrompts(format: '9:16' | '16:9' | '4:5'): ThumbnailPrompt[] {
  if (format === '16:9') {
    return [
      { id: generateObjectId(), promptEn: 'A professional YouTube thumbnail featuring a confident Brazilian entrepreneur in a dark studio, black suit, golden volumetric lighting, dramatic expression, high contrast, text overlay "O ERRO QUE 90% COMETE", cinematic 8k, 16:9 ratio, dark navy background 70%, golden text 10%, cyan accent 20%.', format: '16:9', description: 'Thumbnail profissional com empresário, fundo escuro e luz dourada' },
      { id: generateObjectId(), promptEn: 'YouTube thumbnail with a laptop screen showing dramatic data chart, dark desk setup, blue neon glow from screen, text "MÉTODO REVELADO" in white bold typography, cinematic depth of field, 16:9, 8k photorealistic.', format: '16:9', description: 'Thumbnail com laptop e gráficos, estilo tech' },
    ];
  }
  if (format === '9:16') {
    return [
      { id: generateObjectId(), promptEn: 'A bold vertical 9:16 cover image for Instagram Reels about business growth, serious Brazilian entrepreneur in black suit, city background bokeh, main text "NÃO COMETA ESSE ERRO", high contrast black and gold palette, cinematic lighting.', format: '9:16', description: 'Capa vertical para Reels/Shorts' },
      { id: generateObjectId(), promptEn: 'Vertical 9:16 cover, dark luxury aesthetic, gold geometric lines, centered text "O SEGREDO REVELADO" in Portuguese, minimalistic, premium feel, black background 70%, gold text 10%, soft spotlight 20%.', format: '9:16', description: 'Capa vertical minimalista premium' },
    ];
  }
  return [
    { id: generateObjectId(), promptEn: 'Clean 4:5 carousel slide design, dark black background 70%, white text 30% with gold accent 10%, elegant serif typography, minimalistic layout, high-end editorial style, aspect ratio 4:5 (1080x1350).', format: '4:5', description: 'Slide limpo para carrossel' },
    { id: generateObjectId(), promptEn: 'Professional 4:5 Instagram post, dark studio aesthetic, bold centered typography in gold, subtle gradient background, premium coaching vibe, text "O CONTEÚDO BARATO É O MAIS CARO", 8k quality.', format: '4:5', description: 'Post estático premium' },
  ];
}

function mockComplementaryMaterials(tema: string): ComplementaryMaterial[] {
  return [
    { id: generateObjectId(), type: 'pdf_checklist', title: `Checklist: ${tema}`, promise: 'Um passo a passo para aplicar imediatamente', structure: ['Identifique seu estágio', 'Aplique os 3 passos', 'Meça os resultados'], status: 'pronto', downloadUrl: '#' },
    { id: generateObjectId(), type: 'pdf_workbook', title: `Workbook: ${tema}`, promise: 'Exercícios práticos para dominar o tema', structure: ['Diagnóstico inicial', 'Plano de ação', 'Revisão semanal'], status: 'pronto', downloadUrl: '#' },
  ];
}

function mockExplanationMaterials(): ExplanationMaterial[] {
  return [
    { id: generateObjectId(), type: 'mapa_mental', title: 'Mapa Mental — Sistema Completo', content: 'Mapa mental com os 3 pilares: Diagnóstico, Mecanismo, Execução', status: 'pronto', downloadUrl: '#' },
    { id: generateObjectId(), type: 'pdf_explicativo', title: 'PDF Explicativo — Frameworks', content: 'Resumo dos principais conceitos e frameworks do conteúdo', status: 'pronto', downloadUrl: '#' },
  ];
}

// ===== BUILD MOCK SCRIPTS =====

function buildVideoCurto(mode: ScriptMode, index: number): Script {
  const tema = index === 0 ? 'crescimento digital' : index === 1 ? 'autoridade de mercado' : 'conversão orgânica';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'video_curto', version: 1, mode, status: index === 0 ? 'pronto' : 'rascunho',
    title: `O erro de ${tema} que 90% comete`,
    provisionalName: `Vídeo Curto — ${tema}`,
    blocks: videoCurtoBlocks(mode),
    caption: `🔥 Você sabia que 90% das pessoas erram em ${tema}?\n\nA verdade é que a maioria repete o mesmo padrão e se pergunta por que não sai do lugar.\n\n🔸 O diagnóstico certo\n🔸 O mecanismo que funciona\n🔸 A execução consistente\n\nSalva esse vídeo pra ver depois e aplicar hoje!\n\nCOMENTA "SISTEMA" QUE EU TE MANDO O MAPA COMPLETO 👇`,
    titles: mockTitles(tema),
    thumbnailPrompts: mockThumbnailPrompts('9:16'),
    complementaryMaterials: mockComplementaryMaterials(tema),
    explanationMaterials: [],
    createdAt: new Date(NOW.getTime() - index * DAY_MS * 3), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

function buildVideoLongo(mode: ScriptMode, index: number): Script {
  const tema = index === 0 ? 'crescimento de audiência' : index === 1 ? 'autoridade digital' : 'funil de vendas';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'video_longo', version: 1, mode, status: index === 0 ? 'pronto' : 'rascunho',
    title: `O sistema definitivo para ${tema} em 2026`,
    provisionalName: `Vídeo Longo — ${tema}`,
    blocks: videoLongoBlocks(mode),
    caption: `📺 O SISTEMA QUE VAI TRANSFORMAR SEUS RESULTADOS\n\nVocê já tentou várias estratégias para ${tema} e nada funcionou? Talvez o problema não seja você.\n\n📌 O que você vai aprender:\n0:00 — O erro que custa caro\n3:15 — O diagnóstico certo\n10:00 — O mecanismo que funciona\n18:30 — Implementação passo a passo\n25:00 — Dica extra\n\n📥 Baixe o checklist gratuito: [link]\n\n#estrategiadigital #autoridade #crescimento`,
    titles: mockTitles(tema),
    thumbnailPrompts: mockThumbnailPrompts('16:9'),
    complementaryMaterials: mockComplementaryMaterials(tema),
    explanationMaterials: mockExplanationMaterials(),
    createdAt: new Date(NOW.getTime() - index * DAY_MS * 5), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

function buildLive(index: number): Script {
  const tema = index === 0 ? 'autoridade ao vivo' : index === 1 ? 'vendas em tempo real' : 'conteúdo que converte';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'live', version: 1, mode: 'conexao', status: index === 0 ? 'pronto' : 'rascunho',
    title: `Live: ${tema}`,
    provisionalName: `Live — ${tema}`,
    blocks: liveBlocks(),
    caption: `🔴 LIVE: ${tema.toUpperCase()}\n\nHoje vou te mostrar na prática como aplicar isso no seu negócio.\n\n✓ Checklist gratuito pra quem ficar até o final\n✓ Q&A ao vivo\n✓ Material complementar exclusivo\n\nATIVA O LEMBRETE E VEM! 🚀`,
    titles: mockTitles(tema),
    thumbnailPrompts: mockThumbnailPrompts('16:9'),
    complementaryMaterials: mockComplementaryMaterials(tema),
    explanationMaterials: mockExplanationMaterials(),
    createdAt: new Date(NOW.getTime() - index * DAY_MS * 2), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

function buildCarrossel(index: number): Script {
  const tema = index === 0 ? 'crescimento estratégico' : index === 1 ? 'produtividade máxima' : 'planejamento editorial';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'carrossel', version: 1, mode: 'seguranca', status: index === 0 ? 'publicado' : 'rascunho',
    title: `O sistema de ${tema} em 10 slides`,
    provisionalName: `Carrossel — ${tema}`,
    blocks: carrosselSlides(),
    caption: `📌 O PASSO A PASSO PARA ${tema.toUpperCase()}\n\n1/10 — O erro que trava seu resultado\n2/10 — O diagnóstico\n3-7/10 — Os 3 passos práticos\n8/10 — O resumo\n9/10 — Dica extra\n10/10 — CTA\n\nSalva esse carrossel pra consultar sempre que precisar! 🔖`,
    titles: mockTitles(tema),
    thumbnailPrompts: mockThumbnailPrompts('4:5'),
    complementaryMaterials: mockComplementaryMaterials(tema),
    explanationMaterials: [],
    createdAt: new Date(NOW.getTime() - index * DAY_MS * 4), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

function buildPostEstatico(index: number): Script {
  const tema = index === 0 ? 'conteúdo barato' : index === 1 ? 'força de vontade' : 'consistência';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'post_estatico', version: 1, mode: 'seguranca', status: index === 0 ? 'publicado' : 'rascunho',
    title: `Post: ${tema}`,
    provisionalName: `Post Estático — ${tema}`,
    blocks: postEstaticoBlocks(),
    caption: `📷 O conteúdo barato é o mais caro do seu negócio.\n\nLá no início... [continua legenda]\n\n🔸 Nicho bem definido\n🔸 Dor atacada\n🔸 Promessa clara\n\nQual foi o conteúdo mais caro que você já produziu?`,
    titles: mockTitles(tema),
    thumbnailPrompts: mockThumbnailPrompts('4:5'),
    complementaryMaterials: mockComplementaryMaterials(tema),
    explanationMaterials: [],
    createdAt: new Date(NOW.getTime() - index * DAY_MS * 2), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

function buildStories(mode: ScriptMode, index: number): Script {
  const tema = index === 0 ? 'rotina de alta performance' : index === 1 ? 'conteúdo diário' : 'planejamento semanal';
  return {
    id: generateObjectId(), projectId: PROJECT_ID, calendarSlotId: generateObjectId(),
    format: 'stories_sequence', version: 1, mode, status: index === 0 ? 'pronto' : 'rascunho',
    title: `Sequência: ${tema}`,
    provisionalName: `Stories — ${tema}`,
    blocks: storiesBlocks(mode),
    caption: `🗓️ HOJE: ${tema.toUpperCase()}\n\n🌅 Manhã: Gancho + quebra de padrão\n🏙️ Almoço: Bastidor + autoridade\n🌆 Tarde: Filosofia + conexão\n🌃 Noite: Q&A + âncora\n\n#storysdiarios #conteudo`,
    titles: mockTitles(tema),
    thumbnailPrompts: [],
    complementaryMaterials: [],
    explanationMaterials: [],
    createdAt: new Date(NOW.getTime() - index * DAY_MS), updatedAt: NOW,
    createdBy: generateObjectId(),
  };
}

// ===== EXPORTED MOCKS =====

export const mockScripts: Record<ScriptFormat, Script[]> = {
  video_curto: [buildVideoCurto('conexao', 0), buildVideoCurto('seguranca', 1), buildVideoCurto('conexao', 2)],
  video_longo: [buildVideoLongo('conexao', 0), buildVideoLongo('seguranca', 1)],
  live: [buildLive(0), buildLive(1)],
  carrossel: [buildCarrossel(0), buildCarrossel(1), buildCarrossel(2)],
  post_estatico: [buildPostEstatico(0), buildPostEstatico(1)],
  stories_sequence: [buildStories('conexao', 0), buildStories('seguranca', 1)],
};

// ===== CALENDAR SLOTS (Fn 01) =====
export const mockCalendarSlots: Record<ScriptFormat, CalendarSlotForScript[]> = {
  video_curto: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS), format: 'video_curto', retinaType: 'engajamento', platforms: ['instagram'], objective: 'Aumentar engajamento e alcance', suggestedTime: '19:00', theme: 'Crescimento digital', provisionalName: 'Reel — Erro de crescimento', strategicObjective: 'Aquecimento de audiência', pillar: 'Educação prática', painDesireObjection: 'Falta de resultado mesmo postando', materialQualified: true, status: 'planned' },
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS * 2), format: 'video_curto', retinaType: 'transformacao', platforms: ['youtube', 'instagram'], objective: 'Entregar valor profundo', suggestedTime: '18:00', theme: 'Autoridade de mercado', provisionalName: 'Shorts — Método de autoridade', strategicObjective: 'Fortalecer autoridade', pillar: 'Narrativas de autoridade', painDesireObjection: 'Falta de reconhecimento', materialQualified: false, status: 'planned' },
  ],
  video_longo: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS * 3), format: 'video_longo', retinaType: 'transformacao', platforms: ['youtube'], objective: 'Educar profundamente sobre o tema', suggestedTime: '10:00', theme: 'Funil de vendas completo', provisionalName: 'Vídeo longo — Funil', strategicObjective: 'Aquecimento para lançamento', pillar: 'Educação prática', painDesireObjection: 'Dúvida sobre como estruturar funil', materialQualified: true, status: 'planned' },
  ],
  live: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS * 4), format: 'live', retinaType: 'autoridade', platforms: ['youtube'], objective: 'Fortalecer comunidade e autoridade', suggestedTime: '20:00', theme: 'Autoridade ao vivo', provisionalName: 'Live semanal — Autoridade', strategicObjective: 'Fortalecer autoridade', pillar: 'Narrativas de autoridade', painDesireObjection: 'Como construir autoridade', materialQualified: true, status: 'planned' },
  ],
  carrossel: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS), format: 'carrossel', retinaType: 'nivel_consciencia', platforms: ['instagram'], objective: 'Aprofundar conhecimento do público', suggestedTime: '10:00', theme: 'Crescimento estratégico', provisionalName: 'Carrossel — Sistema de crescimento', strategicObjective: 'Nutrir leads', pillar: 'Educação prática', painDesireObjection: 'Falta de direção estratégica', materialQualified: true, status: 'planned' },
  ],
  post_estatico: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS * 2), format: 'post_estatico', retinaType: 'relacionamento', platforms: ['instagram'], objective: 'Aumentar conexão com a audiência', suggestedTime: '14:00', theme: 'Reflexão sobre consistência', provisionalName: 'Post — Consistência', strategicObjective: 'Aprofundar relacionamento', pillar: 'Narrativas de autoridade', painDesireObjection: 'Dúvida sobre consistência', materialQualified: false, status: 'planned' },
  ],
  stories_sequence: [
    { id: generateObjectId(), date: new Date(NOW.getTime() + DAY_MS), format: 'stories_sequence', retinaType: 'relacionamento', platforms: ['instagram'], objective: 'Rotina e bastidores', suggestedTime: '09:00', theme: 'Rotina de alta performance', provisionalName: 'Stories do dia', strategicObjective: 'Relacionamento diário', pillar: 'Bastidores da execução', painDesireObjection: 'Como manter consistência', materialQualified: false, status: 'planned' },
  ],
};

// ===== THEMES (Fn 02) =====
export const mockThemesForScript: Record<ScriptFormat, ThemeForScript[]> = {
  video_curto: [
    { id: generateObjectId(), title: 'O erro que 90% comete no crescimento digital', angle: 'Erro crítico que poucos identificam', approach: 'erro', pillar: 'Educação prática', references: ['Vídeo referência sobre o tema'], formatCompatibility: ['video_curto', 'carrossel'], createdAt: new Date(NOW.getTime() - DAY_MS * 10) },
    { id: generateObjectId(), title: 'O método de autoridade que funciona em 30 dias', angle: 'Método direto e comprovado', approach: 'metodo', pillar: 'Narrativas de autoridade', references: ['Case de sucesso'], formatCompatibility: ['video_curto', 'video_longo'], createdAt: new Date(NOW.getTime() - DAY_MS * 8) },
  ],
  video_longo: [
    { id: generateObjectId(), title: 'Sistema completo de funil de vendas orgânicas', angle: 'Passo a passo completo do zero', approach: 'metodo', pillar: 'Educação prática', references: ['Aula completa anterior'], formatCompatibility: ['video_longo', 'live'], createdAt: new Date(NOW.getTime() - DAY_MS * 15) },
  ],
  live: [
    { id: generateObjectId(), title: 'Como construir autoridade ao vivo em 2026', angle: 'Estratégia ao vivo para engajar e vender', approach: 'metodo', pillar: 'Narrativas de autoridade', references: ['Live anterior de alto desempenho'], formatCompatibility: ['live', 'video_longo'], createdAt: new Date(NOW.getTime() - DAY_MS * 5) },
  ],
  carrossel: [
    { id: generateObjectId(), title: 'Sistema de crescimento estratégico em 10 passos', angle: 'Framework visual de alto valor', approach: 'metodo', pillar: 'Educação prática', references: [], formatCompatibility: ['carrossel', 'post_estatico'], createdAt: new Date(NOW.getTime() - DAY_MS * 12) },
  ],
  post_estatico: [
    { id: generateObjectId(), title: 'A força de vontade vai falhar amanhã', angle: 'Reflexão profunda sobre consistência', approach: 'historia', pillar: 'Narrativas de autoridade', references: ['Texto pessoal sobre disciplina'], formatCompatibility: ['post_estatico', 'stories_sequence'], createdAt: new Date(NOW.getTime() - DAY_MS * 7) },
  ],
  stories_sequence: [
    { id: generateObjectId(), title: 'Rotina de alta performance de um criador', angle: 'Bastidores reais do dia a dia', approach: 'bastidor', pillar: 'Bastidores da execução', references: [], formatCompatibility: ['stories_sequence', 'post_estatico'], createdAt: new Date(NOW.getTime() - DAY_MS * 3) },
  ],
};

// ===== BRAND STORY =====
export const mockBrandStory: BrandStory = {
  id: generateObjectId(),
  organizationId: generateObjectId(),
  userId: generateObjectId(),
  originStory: 'Comecei como autônomo, sem estrutura, trabalhando de casa. Foram 3 anos de tentativa e erro até entender que o problema não era esforço, era estratégia.',
  keyTurnarounds: [
    'A virada de chave quando parei de seguir receitas prontas e criei meu próprio método',
    'O momento que entendi que autoridade se constrói com execução, não com aparência',
    'Quando saí de R$ 5k/mês para R$ 50k/mês aplicando consistência estratégica',
  ],
  failures: [
    'Tentei fazer tudo sozinho e quase morri de burnout',
    'Iniciei 3 negócios que falharam porque não tinha ICP definido',
    'Gastei R$ 30k em tráfego pago sem estratégia de conteúdo',
  ],
  achievements: [
    'Construí audiência de 100k seguidores orgânicos em 18 meses',
    'Gerei mais de R$ 2M em vendas com conteúdo orgânico',
    'Formei uma comunidade de 500+ alunos com resultados reais',
  ],
  values: ['Execução acima de teoria', 'Autoridade real sem atalhos', 'Consistência > intensidade'],
  lifestyle: 'Vivo de conteúdo digital, trabalho de casa, dedico manhãs para criação e tardes para estratégia.',
  usableStories: [
    { title: 'O dia que quase desisti', content: 'Em 2020, após 6 meses sem resultado, pensei em desistir. Foi quando um aluno me mandou uma mensagem que mudou tudo.', tags: ['resiliencia', 'propósito'] },
    { title: 'O erro de R$ 30k', content: 'Gastei R$ 30k em tráfego pago sem estratégia de conteúdo. A lição mais cara que aprendi.', tags: ['erro', 'aprendizado'] },
    { title: 'A virada de chave', content: 'Quando parei de imitar e comecei a criar meu próprio método, tudo mudou. Em 3 meses, dobrei os resultados.', tags: ['metodo', 'virada'] },
  ],
  updatedAt: NOW,
};

// ===== VERSIONS =====
export function mockVersionsForScript(scriptId: string): ScriptVersion[] {
  const blockPool = videoCurtoBlocks('conexao');
  return [
    {
      id: generateObjectId(), scriptId, versionNumber: 1, comment: 'Versão inicial',
      blocks: blockPool.slice(0, 5),
      caption: 'Versão 1 da legenda...',
      titles: [{ id: generateObjectId(), title: 'Título v1', hookType: 'erro' }],
      createdAt: new Date(NOW.getTime() - DAY_MS * 5), createdBy: generateObjectId(),
    },
    {
      id: generateObjectId(), scriptId, versionNumber: 2, comment: 'Versão com CTA mais forte',
      blocks: blockPool,
      caption: 'Versão 2 da legenda com novo CTA...',
      titles: [{ id: generateObjectId(), title: 'Título v2 — Mais forte', hookType: 'metodo' }],
      createdAt: new Date(NOW.getTime() - DAY_MS * 2), createdBy: generateObjectId(),
    },
  ];
}

// ===== ATTACHMENTS =====
export function mockAttachmentsForScript(scriptId: string): ScriptAttachment[] {
  return [
    { id: generateObjectId(), scriptId, type: 'brand_story', title: 'História da Marca — Resumo', description: 'Origem, viradas e valores da marca', createdAt: NOW },
    { id: generateObjectId(), scriptId, type: 'referencia_validada', title: 'Vídeo referência — Método X', description: 'Transcrição de vídeo que performou bem', fileName: 'transcricao-metodo-x.pdf', mimeType: 'application/pdf', createdAt: NOW, formatTag: 'video_curto', source: 'project' },
    { id: generateObjectId(), scriptId, type: 'estudo_tema', title: 'Anotações sobre o tema', description: 'Resumo de livro e insights próprios', parsedContent: '# Anotações\n\n## Capítulo 3: O Sistema\n\nO autor explica que...', fileName: 'anotacoes-tema.md', mimeType: 'text/markdown', createdAt: NOW },
  ];
}

// ===== GENERATION RESPONSES =====
export function mockGenerationResult(format: ScriptFormat, mode: ScriptMode, tema: string): GenerationResult {
  let blocks: ScriptBlock[];
  let caption: string;
  let titles: TitleSuggestion[];
  let thumbnailPrompts: ThumbnailPrompt[];
  let complementaryMaterials: ComplementaryMaterial[];
  let explanationMaterials: ExplanationMaterial[];

  switch (format) {
    case 'video_curto':
      blocks = videoCurtoBlocks(mode);
      caption = `🔥 Vídeo curto gerado sobre ${tema}!\n\nSalva esse post e compartilha com alguém que precisa!`;
      titles = mockTitles(tema);
      thumbnailPrompts = mockThumbnailPrompts('9:16');
      complementaryMaterials = mockComplementaryMaterials(tema);
      explanationMaterials = [];
      break;
    case 'video_longo':
      blocks = videoLongoBlocks(mode);
      caption = `📺 Vídeo longo completo sobre ${tema}.\n\nAssista até o final para a dica extra!`;
      titles = mockTitles(tema);
      thumbnailPrompts = mockThumbnailPrompts('16:9');
      complementaryMaterials = mockComplementaryMaterials(tema);
      explanationMaterials = mockExplanationMaterials();
      break;
    case 'live':
      blocks = liveBlocks();
      caption = `🔴 Live sobre ${tema}.\n\nAtive o lembrete e participe!`;
      titles = mockTitles(tema);
      thumbnailPrompts = mockThumbnailPrompts('16:9');
      complementaryMaterials = mockComplementaryMaterials(tema);
      explanationMaterials = mockExplanationMaterials();
      break;
    case 'carrossel':
      blocks = carrosselSlides();
      caption = `📌 Carrossel sobre ${tema}.\n\nSalve para consultar depois!`;
      titles = mockTitles(tema);
      thumbnailPrompts = mockThumbnailPrompts('4:5');
      complementaryMaterials = mockComplementaryMaterials(tema);
      explanationMaterials = [];
      break;
    case 'post_estatico':
      blocks = postEstaticoBlocks();
      caption = `📷 Post sobre ${tema}.\n\nCompartilhe sua experiência nos comentários!`;
      titles = mockTitles(tema);
      thumbnailPrompts = mockThumbnailPrompts('4:5');
      complementaryMaterials = mockComplementaryMaterials(tema);
      explanationMaterials = [];
      break;
    case 'stories_sequence':
      blocks = storiesBlocks(mode);
      caption = `🗓️ Sequência de stories sobre ${tema}.\n\n🌅🌆🌃 Acompanhe o dia todo!`;
      titles = mockTitles(tema);
      thumbnailPrompts = [];
      complementaryMaterials = [];
      explanationMaterials = [];
      break;
    default:
      blocks = [];
      caption = '';
      titles = [];
      thumbnailPrompts = [];
      complementaryMaterials = [];
      explanationMaterials = [];
  }

  return { blocks, caption, titles, thumbnailPrompts, complementaryMaterials, explanationMaterials };
}