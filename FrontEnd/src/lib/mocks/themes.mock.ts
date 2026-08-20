// src/lib/mocks/themes.mock.ts
// Dados mock do Motor de Temas Estratégicos — fallback do BFF enquanto o backend
// NestJS não expõe o contrato /editorial/.../themes. O gerador é determinístico
// (seed a partir do projectId) e simula a IA da Função 02: lê os dados da
// Função 01 (mapa editorial, pesos RETINA, nicho) e cruza com as técnicas de
// geração internas para produzir temas coerentes por pilar, RETINA, consciência,
// jornada, formato e plataforma.

import { mockCalendarById } from './calendar.mock';
import { mockMapa } from './editorial.mock';
import type {
  BalanceAlert,
  BalanceReport,
  BusinessMoment,
  CalendarThemeVersion,
  ConsciousnessLevel,
  GenerationRequest,
  GenerationResult,
  JourneyStage,
  MarketParams,
  ObjectiveParams,
  RebalanceRequest,
  RebalanceResult,
  RomaAvatarParams,
  SaveVersion,
  SimulateRequest,
  SlotSuggestion,
  Theme,
  ThemeObjective,
  ThemeStatus,
  ThemeUpdate,
} from '@/lib/dto/themes.schema';
import type {
  CalendarItem,
  CalendarObjective,
  ContentFormat,
  EditorialCalendar,
  Platform,
  RetinaType,
} from '@/lib/dto/editorial.schema';

// ===== RNG determinístico =====

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(...parts: (string | number)[]): () => number {
  return mulberry32(hashCode(parts.join(':')));
}

function generateObjectId(rand: () => number): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i += 1) {
    id += hex[Math.floor(rand() * 16)];
  }
  return id;
}

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// ===== Constantes internas do gerador =====

const RETINA_TYPES: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const CONSCIOUSNESS_TYPES: ConsciousnessLevel[] = ['sintoma', 'solucao', 'objecao'];

const JOURNEY_TYPES: JourneyStage[] = [
  'descoberta',
  'consideracao',
  'conversao',
  'experiencia',
  'compartilhamento',
];

const RETINA_LABEL_MAP: Record<string, RetinaType> = {
  Relacionamento: 'relacionamento',
  Engajamento: 'engajamento',
  Transformação: 'transformacao',
  Interação: 'interacao',
  'Níveis de Consciência': 'nivel_consciencia',
  Autoridade: 'autoridade',
};

const FORMATS_BY_RETINA: Record<RetinaType, ContentFormat[]> = {
  relacionamento: ['stories_sequence', 'static_post'],
  engajamento: ['reel', 'carousel'],
  transformacao: ['reel', 'long_video'],
  interacao: ['carousel', 'static_post', 'stories_sequence'],
  nivel_consciencia: ['carousel', 'long_video'],
  autoridade: ['long_video', 'live'],
};

const PLATFORM_POOL: Platform[] = ['instagram', 'tiktok', 'youtube', 'linkedin'];

const AVATAR_CONTEXT = {
  pains: [
    'perder tempo sem resultado',
    'se sentir estagnado mesmo postando todos os dias',
    'falta de reconhecimento no nicho',
    'medo de errar em público e perder credibilidade',
  ],
  desires: [
    'chegar à primeira venda',
    'construir autoridade de verdade',
    'viver de conteúdo com previsibilidade',
    'dominar a execução do próprio método',
  ],
  objections: [
    'não tenho tempo para produzir',
    'sou iniciante demais para isso',
    'não tenho estrutura nem equipe',
    'já tentei antes e não deu certo',
  ],
  myths: [
    'precisa de milhões de seguidores para vender',
    'só funciona com tráfego pago',
    'basta postar todo dia que o resultado vem',
    'conteúdo educativo não converte',
  ],
};

const MARKET_SOURCES = [
  'Comentário com 500 curtidas no vídeo mais visto do nicho',
  'Review de 1 estrela do livro mais vendido do segmento',
  'Review de 5 estrelas de quem viveu a virada de chave',
  'Pergunta repetida nas threads do nicho',
  'Termo periférico que o público busca em paralelo',
  'Clichê repetido por todos os criadores do mercado',
];

// Templates de títulos — placeholders {p} {pain} {desire} {objection} {myth} {source}
const ROMA_TEMPLATES = [
  'O erro que impede seu público de avançar em {p} mesmo tentando todos os dias',
  'A micro-decisão diária que separa quem chega em {p} de quem estagna',
  '{p}: por que mais informação não resolve — e o que resolve de verdade',
  'O hábito de {p} que parece pequeno, mas muda o jogo em 90 dias',
  'Vencendo a dor de {pain} — a lição que ninguém conta no seu nicho',
  'Como transformar o desejo de {desire} em um sistema simples de {p}',
  'A objeção de {objection} e o motivo real por trás dela',
  'O mito de que {myth} — e a verdade que seu público precisa ouvir',
  '{p} na prática: o caminho de quem já está lá dentro',
  'Por que seu público abandona {p} na metade do caminho',
  'A sequência de 3 passos para destravar {p} sem depender de motivação',
  'O que ninguém fala sobre {p} quando você está começando',
  'Como a rotina ideal de {p} se parece (e por que a sua não funciona)',
  'O atalho honesto para {desire} usando apenas {p}',
  'Sua estratégia de {p} está funcionando? 3 sinais de que está no piloto automático',
];

const MARKET_TEMPLATES = [
  'A parte que ninguém te explicou sobre {p}',
  'Quando a regra do mercado sobre {p} te sabota em vez de te ajudar',
  'Como aplicar {p} trabalhando em escala 12×36',
  'Como fazer {p} morando em apartamento de 40m²',
  'O erro de contrato que faliu a carreira de um grande artista — e o que ele ensina para o seu negócio',
  'O que responder no perfil de investidor para não travar seu dinheiro (e a lição de {p})',
  'Por que comer chocolate na terça-feira pode salvar sua dieta no fim de semana — a versão {p}',
  'O comentário de 500 curtidas que o mercado ignorou: {source}',
  'Onde clicar para excluir quem já comprou de você e não rasgar dinheiro — o botão escondido de {p}',
  'A cláusula que ninguém lê e que pode custar seu negócio — aprenda com a história de {p}',
  'Como organizar seu fluxo de {p} usando apenas a tela do celular (sem planilhas complexas)',
  'O gancho que faz o seguidor parar o dedo no seu conteúdo de {p} em 2 segundos',
  'A pergunta que 90% do seu público faz antes de comprar — e que você ignora em {p}',
  'Desmontando o clichê: por que {myth} não se aplica a quem faz {p}',
  'O tema que os criadores do nicho nunca tocam porque não viveu {pain}',
];

const OBJECTIVE_TEMPLATES = [
  'O tema de {p} que precisa entrar na rotina AGORA para você alcançar seu objetivo',
  '{p} com foco total: o recorte que seu público precisa ver neste momento',
  'A lacuna de {p} que está faltando no seu calendário para o objetivo deste ciclo',
  'Como priorizar {p} quando o objetivo do período é {goal}',
  'O conteúdo de {p} que converte sem parecer venda — alinhado a {goal}',
  'Reposicionando {p} para o momento de {moment}',
  'O único recorte de {p} que faz sentido publicar enquanto o objetivo é {goal}',
  'A prova social de {p} que sustenta a decisão de compra agora',
  '{p} sob o ângulo da objeção: respondendo ao que trava a conversão',
  'O checklist de {p} para quem quer {goal} sem perder consistência',
];

const OBJECTIVE_RETINA_WEIGHTS: Record<ThemeObjective, Record<RetinaType, number>> = {
  grow_audience: {
    relacionamento: 15,
    engajamento: 30,
    transformacao: 20,
    interacao: 10,
    nivel_consciencia: 15,
    autoridade: 10,
  },
  increase_engagement: {
    relacionamento: 10,
    engajamento: 35,
    transformacao: 15,
    interacao: 25,
    nivel_consciencia: 10,
    autoridade: 5,
  },
  increase_relationship: {
    relacionamento: 30,
    engajamento: 15,
    transformacao: 15,
    interacao: 20,
    nivel_consciencia: 10,
    autoridade: 10,
  },
  warm_up_sales: {
    relacionamento: 10,
    engajamento: 15,
    transformacao: 30,
    interacao: 5,
    nivel_consciencia: 25,
    autoridade: 15,
  },
  sell_launch: {
    relacionamento: 10,
    engajamento: 10,
    transformacao: 30,
    interacao: 5,
    nivel_consciencia: 25,
    autoridade: 20,
  },
  sell_evergreen: {
    relacionamento: 10,
    engajamento: 10,
    transformacao: 25,
    interacao: 10,
    nivel_consciencia: 25,
    autoridade: 20,
  },
  nurture_customers: {
    relacionamento: 25,
    engajamento: 10,
    transformacao: 20,
    interacao: 15,
    nivel_consciencia: 10,
    autoridade: 20,
  },
  strengthen_authority: {
    relacionamento: 10,
    engajamento: 10,
    transformacao: 25,
    interacao: 5,
    nivel_consciencia: 20,
    autoridade: 30,
  },
};

const OBJECTIVE_JOURNEY_WEIGHTS: Record<ThemeObjective, Record<JourneyStage, number>> = {
  grow_audience: { descoberta: 45, consideracao: 35, conversao: 10, experiencia: 5, compartilhamento: 5 },
  increase_engagement: { descoberta: 30, consideracao: 35, conversao: 10, experiencia: 10, compartilhamento: 15 },
  increase_relationship: { descoberta: 20, consideracao: 25, conversao: 10, experiencia: 25, compartilhamento: 20 },
  warm_up_sales: { descoberta: 20, consideracao: 40, conversao: 25, experiencia: 10, compartilhamento: 5 },
  sell_launch: { descoberta: 15, consideracao: 35, conversao: 35, experiencia: 10, compartilhamento: 5 },
  sell_evergreen: { descoberta: 20, consideracao: 35, conversao: 30, experiencia: 10, compartilhamento: 5 },
  nurture_customers: { descoberta: 10, consideracao: 15, conversao: 15, experiencia: 35, compartilhamento: 25 },
  strengthen_authority: { descoberta: 20, consideracao: 30, conversao: 20, experiencia: 15, compartilhamento: 15 },
};

const OBJECTIVE_LABEL: Record<ThemeObjective, string> = {
  grow_audience: 'crescer audiência',
  increase_engagement: 'aumentar engajamento',
  increase_relationship: 'aprofundar relacionamento',
  warm_up_sales: 'aquecer para vendas',
  sell_launch: 'vender no lançamento',
  sell_evergreen: 'vender de forma perpétua',
  nurture_customers: 'nutrir clientes',
  strengthen_authority: 'fortalecer autoridade',
};

const MOMENT_LABEL: Record<BusinessMoment, string> = {
  building_audience: 'construção de audiência',
  building_authority: 'geração de autoridade',
  pre_sale: 'pré-venda',
  cart_open: 'carrinho aberto',
  post_sale: 'pós-venda',
  organic_maintenance: 'manutenção orgânica',
};

const CALENDAR_OBJECTIVE_JOURNEY: Record<CalendarObjective, Record<JourneyStage, number>> = {
  increase_audience: { descoberta: 50, consideracao: 30, conversao: 10, experiencia: 5, compartilhamento: 5 },
  warmup_sales: { descoberta: 20, consideracao: 40, conversao: 30, experiencia: 5, compartilhamento: 5 },
  reinforce_authority: { descoberta: 20, consideracao: 30, conversao: 20, experiencia: 15, compartilhamento: 15 },
  increase_relationship: { descoberta: 20, consideracao: 20, conversao: 10, experiencia: 30, compartilhamento: 20 },
  improve_engagement: { descoberta: 30, consideracao: 35, conversao: 10, experiencia: 10, compartilhamento: 15 },
  support_launch: { descoberta: 15, consideracao: 35, conversao: 35, experiencia: 10, compartilhamento: 5 },
};

// ===== Helpers =====

function weightedPickIndex(weights: number[], rand: () => number): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rand() * total;
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

function weightedPick<T>(values: T[], weights: number[], rand: () => number): T {
  return values[weightedPickIndex(weights, rand)];
}

function fillTemplate(template: string, pillar: string, goal: string, moment: string): string {
  const ctx = AVATAR_CONTEXT;
  return template
    .replace(/{p}/g, pillar)
    .replace(/{pain}/g, ctx.pains[0])
    .replace(/{desire}/g, ctx.desires[0])
    .replace(/{objection}/g, ctx.objections[0])
    .replace(/{myth}/g, ctx.myths[0])
    .replace(/{goal}/g, goal)
    .replace(/{moment}/g, moment);
}

export function getRomaPillars(projectId: string): string[] {
  const pillars = mockMapa.pilares.map((p) => p.title).filter(Boolean);
  return pillars.length >= 3 ? pillars.slice(0, 3) : ['Resultado', 'Mecânica', 'Mentalidade'];
}

export function getRetinaBaseWeights(): Record<RetinaType, number> {
  const weights: Record<RetinaType, number> = {
    relacionamento: 15,
    engajamento: 20,
    transformacao: 30,
    interacao: 10,
    nivel_consciencia: 15,
    autoridade: 10,
  };
  for (const item of mockMapa.retina) {
    const type = RETINA_LABEL_MAP[item.label];
    if (type) weights[type] = item.weight;
  }
  return weights;
}

function applyPriority(
  base: Record<RetinaType, number>,
  priority: RomaAvatarParams['retinaPriority'],
): Record<RetinaType, number> {
  const next = { ...base };
  if (priority !== 'balanced') {
    for (const type of RETINA_TYPES) {
      next[type] = type === priority ? next[type] * 3 : next[type] * 0.6;
    }
  }
  return next;
}

function shiftWeights(
  base: Record<RetinaType, number>,
  increase?: RetinaType[],
  decrease?: RetinaType[],
): Record<RetinaType, number> {
  const next = { ...base };
  for (const type of increase || []) next[type] = next[type] * 2.2;
  for (const type of decrease || []) next[type] = next[type] * 0.35;
  return next;
}

function consciousnessWeightsFor(
  mode: Theme['origin'],
  objective?: ThemeObjective,
  moment?: BusinessMoment,
): Record<ConsciousnessLevel, number> {
  if (mode === 'objective') {
    const selling = objective === 'sell_launch' || objective === 'sell_evergreen' || objective === 'warm_up_sales';
    const nearSale = moment === 'cart_open' || moment === 'pre_sale';
    if (selling || nearSale) return { sintoma: 20, solucao: 35, objecao: 45 };
    return { sintoma: 30, solucao: 40, objecao: 30 };
  }
  if (mode === 'market') return { sintoma: 30, solucao: 40, objecao: 30 };
  return { sintoma: 40, solucao: 35, objecao: 25 };
}

function journeyWeightsFor(
  mode: Theme['origin'],
  objective?: ThemeObjective,
  moment?: BusinessMoment,
): Record<JourneyStage, number> {
  if (mode === 'objective' && objective) {
    const weights = { ...OBJECTIVE_JOURNEY_WEIGHTS[objective] };
    if (moment === 'cart_open') {
      weights.conversao += 20;
      weights.descoberta = Math.max(5, weights.descoberta - 15);
    }
    if (moment === 'post_sale') {
      weights.experiencia += 15;
      weights.compartilhamento += 10;
    }
    return weights;
  }
  if (mode === 'market') return { descoberta: 35, consideracao: 30, conversao: 15, experiencia: 10, compartilhamento: 10 };
  return { descoberta: 30, consideracao: 30, conversao: 15, experiencia: 15, compartilhamento: 10 };
}

interface BuildThemeOpts {
  rand: () => number;
  projectId: string;
  pillar: string;
  origin: Theme['origin'];
  template: string;
  retinaWeights: Record<RetinaType, number>;
  consciousnessWeights: Record<ConsciousnessLevel, number>;
  journeyWeights: Record<JourneyStage, number>;
  platforms: Platform[];
  batchId: string;
  index: number;
  sourceContext?: string;
  titleOverride?: string;
  goal?: string;
  moment?: string;
  status?: ThemeStatus;
}

function buildTheme(opts: BuildThemeOpts): Theme {
  const retinaType = weightedPick(RETINA_TYPES, RETINA_TYPES.map((t) => opts.retinaWeights[t]), opts.rand);
  const consciousness = weightedPick(CONSCIOUSNESS_TYPES, CONSCIOUSNESS_TYPES.map((c) => opts.consciousnessWeights[c]), opts.rand);
  const journey = weightedPick(JOURNEY_TYPES, JOURNEY_TYPES.map((j) => opts.journeyWeights[j]), opts.rand);
  const formats = FORMATS_BY_RETINA[retinaType];
  const format = formats[Math.floor(opts.rand() * formats.length)];
  const platform = opts.platforms[Math.floor(opts.rand() * opts.platforms.length)];
  const now = new Date();
  const title = opts.titleOverride || fillTemplate(opts.template, opts.pillar, opts.goal || '', opts.moment || '');
  return {
    id: generateObjectId(opts.rand),
    projectId: opts.projectId,
    origin: opts.origin,
    title,
    pillar: opts.pillar,
    retinaType,
    consciousnessLevel: consciousness,
    journeyStage: journey,
    format,
    platforms: [platform],
    status: opts.status || 'active',
    flags: [],
    sourceContext: opts.sourceContext,
    batchId: opts.batchId,
    createdAt: now,
    updatedAt: now,
  };
}

function dedupeThemes(themes: Theme[]): Theme[] {
  const seen = new Set<string>();
  const out: Theme[] = [];
  for (const theme of themes) {
    const key = theme.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(theme);
  }
  return out;
}

// ===== Geração por modo =====

function generateRomaAvatar(projectId: string, params: RomaAvatarParams): Theme[] {
  const rand = rngFor(projectId, 'roma', params.volume, params.retinaPriority, params.pillars.join(','));
  const pillars = getRomaPillars(projectId);
  const selected = params.pillars.includes('all') ? pillars : pillars.filter((p) => params.pillars.includes(p));
  const effective = selected.length > 0 ? selected : pillars;
  const retinaWeights = applyPriority(getRetinaBaseWeights(), params.retinaPriority);
  const consciousnessWeights = consciousnessWeightsFor('roma_avatar');
  const journeyWeights = journeyWeightsFor('roma_avatar');
  const volume = parseInt(params.volume, 10);
  const batchId = generateObjectId(rand);
  const themes: Theme[] = [];
  let index = 0;
  while (themes.length < volume) {
    const pillar = effective[index % effective.length];
    const template = ROMA_TEMPLATES[index % ROMA_TEMPLATES.length];
    themes.push(
      buildTheme({
        rand,
        projectId,
        pillar,
        origin: 'roma_avatar',
        template,
        retinaWeights,
        consciousnessWeights,
        journeyWeights,
        platforms: ['instagram'],
        batchId,
        index,
      }),
    );
    index += 1;
  }
  return dedupeThemes(themes).slice(0, volume);
}

function generateMarket(projectId: string, params: MarketParams): Theme[] {
  const rand = rngFor(projectId, 'market', params.volume || '20', params.videoLinks?.join(',') || '', params.comments?.length || 0, params.reviews?.length || 0);
  const pillars = getRomaPillars(projectId);
  const retinaWeights = { relacionamento: 10, engajamento: 30, transformacao: 25, interacao: 15, nivel_consciencia: 10, autoridade: 10 };
  const consciousnessWeights = consciousnessWeightsFor('market');
  const journeyWeights = journeyWeightsFor('market');
  const volume = parseInt(params.volume || '20', 10);
  const batchId = generateObjectId(rand);

  const userSources: string[] = [];
  for (const comment of params.comments || []) {
    if (comment.trim()) userSources.push(`Comentário do seu público: "${comment.trim().slice(0, 90)}"`);
  }
  for (const review of params.reviews || []) {
    if (review.trim()) userSources.push(`Feedback de cliente: "${review.trim().slice(0, 90)}"`);
  }
  for (const link of params.videoLinks || []) {
    if (link.trim()) userSources.push(`Video analisado pelo radar de mercado`);
  }

  const themes: Theme[] = [];
  let index = 0;
  while (themes.length < volume) {
    const pillar = pillars[index % pillars.length];
    const template = MARKET_TEMPLATES[index % MARKET_TEMPLATES.length];
    const source = userSources.length > 0 ? userSources[index % userSources.length] : MARKET_SOURCES[index % MARKET_SOURCES.length];
    themes.push(
      buildTheme({
        rand,
        projectId,
        pillar,
        origin: 'market',
        template,
        retinaWeights,
        consciousnessWeights,
        journeyWeights,
        platforms: ['instagram', 'tiktok', 'youtube'],
        batchId,
        index,
        sourceContext: source,
      }),
    );
    index += 1;
  }
  return dedupeThemes(themes).slice(0, volume);
}

function generateObjective(projectId: string, params: ObjectiveParams): Theme[] {
  const rand = rngFor(projectId, 'objective', params.objective, params.businessMoment, params.platforms.join(','));
  const pillars = getRomaPillars(projectId);
  const retinaWeights = OBJECTIVE_RETINA_WEIGHTS[params.objective];
  const consciousnessWeights = consciousnessWeightsFor('objective', params.objective, params.businessMoment);
  const journeyWeights = journeyWeightsFor('objective', params.objective, params.businessMoment);
  const volume = parseInt(params.volume || '20', 10);
  const batchId = generateObjectId(rand);
  const goal = OBJECTIVE_LABEL[params.objective];
  const moment = MOMENT_LABEL[params.businessMoment];
  const library = mockThemeLibrary(projectId);
  const themes: Theme[] = [];
  let index = 0;
  while (themes.length < volume) {
    const pillar = pillars[index % pillars.length];
    const template = OBJECTIVE_TEMPLATES[index % OBJECTIVE_TEMPLATES.length];
    themes.push(
      buildTheme({
        rand,
        projectId,
        pillar,
        origin: 'objective',
        template,
        retinaWeights,
        consciousnessWeights,
        journeyWeights,
        platforms: params.platforms,
        batchId,
        index,
        goal,
        moment,
      }),
    );
    index += 1;
  }
  const fromLibrary = library
    .filter((theme) => theme.retinaType !== undefined)
    .filter(() => rand() > 0.35)
    .map((theme) => ({ ...theme, origin: 'objective' as const, batchId }));
  return dedupeThemes([...themes, ...fromLibrary]).slice(0, volume);
}

export function mockGenerateThemes(projectId: string, request: GenerationRequest): GenerationResult {
  const rand = rngFor(projectId, 'batch');
  const batchId = generateObjectId(rand);
  let themes: Theme[] = [];
  if (request.mode === 'roma_avatar') themes = generateRomaAvatar(projectId, request.params);
  if (request.mode === 'market') themes = generateMarket(projectId, request.params);
  if (request.mode === 'objective') themes = generateObjective(projectId, request.params);
  return { batchId, mode: request.mode, themes };
}

// ===== Biblioteca =====

export function mockThemeLibrary(projectId: string): Theme[] {
  const rand = rngFor(projectId, 'library');
  const pillars = getRomaPillars(projectId);
  const baseWeights = getRetinaBaseWeights();
  const origins: Theme['origin'][] = ['roma_avatar', 'roma_avatar', 'market', 'market', 'objective'];
  const templates: Record<Theme['origin'], string[]> = {
    roma_avatar: ROMA_TEMPLATES,
    market: MARKET_TEMPLATES,
    objective: OBJECTIVE_TEMPLATES,
  };
  const batchId = generateObjectId(rand);
  const themes: Theme[] = [];
  for (let i = 0; i < 42; i += 1) {
    const origin = origins[i % origins.length];
    const pillar = pillars[i % pillars.length];
    const template = templates[origin][i % templates[origin].length];
    const retinaWeights =
      origin === 'objective'
        ? OBJECTIVE_RETINA_WEIGHTS[['grow_audience', 'warm_up_sales', 'strengthen_authority'][i % 3] as ThemeObjective]
        : origin === 'market'
          ? { relacionamento: 10, engajamento: 30, transformacao: 25, interacao: 15, nivel_consciencia: 10, autoridade: 10 }
          : baseWeights;
    themes.push(
      buildTheme({
        rand,
        projectId,
        pillar,
        origin,
        template,
        retinaWeights,
        consciousnessWeights: consciousnessWeightsFor(origin),
        journeyWeights: journeyWeightsFor(origin),
        platforms: ['instagram', 'tiktok', 'youtube'],
        batchId,
        index: i,
        sourceContext: origin === 'market' ? MARKET_SOURCES[i % MARKET_SOURCES.length] : undefined,
        status: i % 9 === 0 ? 'favorite' : 'active',
      }),
    );
  }
  return dedupeThemes(themes);
}

export function mockThemeById(projectId: string, themeId: string): Theme | undefined {
  if (!OBJECT_ID_REGEX.test(themeId)) return undefined;
  return mockThemeLibrary(projectId).find((theme) => theme.id === themeId);
}

export function mockPatchTheme(projectId: string, themeId: string, patch: ThemeUpdate): Theme {
  const found = mockThemeById(projectId, themeId);
  if (found) return { ...found, ...patch, updatedAt: new Date() };
  const rand = rngFor(projectId, 'patch', themeId);
  return {
    id: themeId,
    projectId,
    origin: 'roma_avatar',
    title: patch.title || 'Tema sem título',
    pillar: patch.pillar || getRomaPillars(projectId)[0],
    retinaType: patch.retinaType || 'engajamento',
    consciousnessLevel: patch.consciousnessLevel || 'solucao',
    journeyStage: patch.journeyStage || 'consideracao',
    format: patch.format || 'reel',
    platforms: patch.platforms || ['instagram'],
    status: patch.status || 'active',
    flags: patch.flags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mockDeleteTheme(projectId: string, themeId: string): boolean {
  if (!OBJECT_ID_REGEX.test(themeId)) return false;
  return true;
}

export function mockGenerateMore(projectId: string, themeId: string, count = 10): Theme[] {
  const source = mockThemeById(projectId, themeId);
  const rand = rngFor(projectId, 'more', themeId, String(count));
  const pillars = getRomaPillars(projectId);
  const batchId = generateObjectId(rand);
  const themes: Theme[] = [];
  const indexOffset = Math.floor(rand() * 5);
  for (let i = 0; i < count; i += 1) {
    const pillar = source?.pillar || pillars[i % pillars.length];
    const template = (source?.origin === 'market' ? MARKET_TEMPLATES : ROMA_TEMPLATES)[(i + indexOffset) % (source?.origin === 'market' ? MARKET_TEMPLATES.length : ROMA_TEMPLATES.length)];
    themes.push(
      buildTheme({
        rand,
        projectId,
        pillar,
        origin: source?.origin || 'roma_avatar',
        template,
        retinaWeights: source
          ? shiftWeights(getRetinaBaseWeights(), [source.retinaType])
          : getRetinaBaseWeights(),
        consciousnessWeights: source
          ? { ...consciousnessWeightsFor('roma_avatar'), [source.consciousnessLevel]: consciousnessWeightsFor('roma_avatar')[source.consciousnessLevel] * 2 }
          : consciousnessWeightsFor('roma_avatar'),
        journeyWeights: source
          ? { ...journeyWeightsFor('roma_avatar'), [source.journeyStage]: journeyWeightsFor('roma_avatar')[source.journeyStage] * 2 }
          : journeyWeightsFor('roma_avatar'),
        platforms: ['instagram'],
        batchId,
        index: i,
        sourceContext: source?.sourceContext,
      }),
    );
  }
  return dedupeThemes(themes).slice(0, count);
}

export function mockFilterLibrary(projectId: string, filters: {
  origin?: string;
  retinaType?: string;
  journey?: string;
  status?: string;
  pillar?: string;
  q?: string;
}): Theme[] {
  let themes = mockThemeLibrary(projectId);
  if (filters.origin) themes = themes.filter((t) => t.origin === filters.origin);
  if (filters.retinaType) themes = themes.filter((t) => t.retinaType === filters.retinaType);
  if (filters.journey) themes = themes.filter((t) => t.journeyStage === filters.journey);
  if (filters.status) themes = themes.filter((t) => t.status === filters.status);
  if (filters.pillar) themes = themes.filter((t) => t.pillar === filters.pillar);
  if (filters.q) themes = themes.filter((t) => t.title.toLowerCase().includes(filters.q!.toLowerCase()));
  return themes;
}

export function mockBulkStatus(projectId: string, themeIds: string[], status: ThemeStatus): Theme[] {
  return themeIds
    .map((id) => mockPatchTheme(projectId, id, { status }))
    .filter(Boolean);
}

// ===== Sugestões para o calendário =====

function fitScore(theme: Theme, item: CalendarItem, objective: CalendarObjective): number {
  let score = 0;
  if (theme.retinaType === item.retinaType) score += 4;
  if (theme.format === item.format) score += 2;
  if (item.platforms.includes(theme.platforms[0])) score += 1;
  const journeyWeights = CALENDAR_OBJECTIVE_JOURNEY[objective];
  const topJourneys = Object.entries(journeyWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([stage]) => stage as JourneyStage);
  if (topJourneys.includes(theme.journeyStage)) score += 2;
  return score;
}

export function mockSuggestions(projectId: string, calendarId: string): SlotSuggestion[] {
  const calendar = mockCalendarById(calendarId);
  if (!calendar) return [];
  const rand = rngFor(projectId, 'suggestions', calendarId);
  const library = mockThemeLibrary(projectId);
  const suggestions: SlotSuggestion[] = [];
  for (const day of calendar.days) {
    for (const item of day.items) {
      if (item.status === 'published') continue;
      const scored = library
        .map((theme) => ({ theme, score: fitScore(theme, item, calendar.objective) + rand() * 0.5 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      if (scored.length === 0) continue;
      suggestions.push({
        calendarItemId: item.id,
        suggestions: scored.map((s) => ({ ...s.theme })),
      });
    }
  }
  return suggestions;
}

export function mockAssignTheme(
  calendar: EditorialCalendar,
  itemId: string,
  theme?: Theme,
  title?: string,
): CalendarItem | null {
  for (const day of calendar.days) {
    const index = day.items.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      const item = day.items[index];
      day.items[index] = {
        ...item,
        theme: theme?.title || title || item.theme,
        pillar: theme?.pillar ?? item.pillar,
        retinaType: theme?.retinaType ?? item.retinaType,
        platforms: theme?.platforms ?? item.platforms,
      };
      return day.items[index];
    }
  }
  return null;
}

// ===== Equilíbrio, reequilíbrio e simulação =====

export function computeBalanceFromAssignments(
  calendar: EditorialCalendar,
  assignments: { calendarItemId: string; theme: Theme }[],
): BalanceReport {
  const byId = new Map(assignments.map((a) => [a.calendarItemId, a.theme]));
  const allItems = calendar.days.flatMap((day) => day.items);
  const filled = allItems.filter((item) => byId.has(item.id));
  const retinaCounts = new Map<RetinaType, number>(RETINA_TYPES.map((t) => [t, 0]));
  const journeyCounts = new Map<JourneyStage, number>(JOURNEY_TYPES.map((j) => [j, 0]));
  for (const item of filled) {
    const theme = byId.get(item.id)!;
    retinaCounts.set(theme.retinaType, (retinaCounts.get(theme.retinaType) || 0) + 1);
    journeyCounts.set(theme.journeyStage, (journeyCounts.get(theme.journeyStage) || 0) + 1);
  }
  const retina = RETINA_TYPES.map((type) => {
    const count = retinaCounts.get(type) || 0;
    return { retinaType: type, count, share: filled.length > 0 ? Math.round((count / filled.length) * 100) : 0 };
  });
  const journey = JOURNEY_TYPES.map((stage) => ({ journeyStage: stage, count: journeyCounts.get(stage) || 0 }));

  const alerts: BalanceAlert[] = [];
  const nearSales = calendar.objective === 'warmup_sales' || calendar.objective === 'support_launch';
  const conscienciaCount = retinaCounts.get('nivel_consciencia') || 0;
  if (filled.length > 0 && conscienciaCount === 0) {
    alerts.push({
      severity: 'high',
      message: 'Você está com poucos conteúdos de Níveis de Consciência nesta janela.',
    });
  } else if (nearSales && conscienciaCount < 2) {
    alerts.push({
      severity: 'medium',
      message: 'Período próximo a vendas: eleve conteúdos de Níveis de Consciência na semana que antecede a campanha.',
    });
  }
  const engajamentoShare = retina.find((r) => r.retinaType === 'engajamento')?.share || 0;
  if (engajamentoShare > 40) {
    alerts.push({
      severity: 'medium',
      message: 'Existe uma concentração muito alta de conteúdos de Engajamento nesta janela.',
    });
  }
  const conversaoCount = journeyCounts.get('conversao') || 0;
  if (nearSales && conversaoCount === 0) {
    alerts.push({
      severity: 'high',
      message: 'Nenhum conteúdo de Conversão/Compra no período de vendas. Considere incluir temas de Níveis de Consciência.',
    });
  }
  if (filled.length < allItems.length) {
    alerts.push({
      severity: 'low',
      message: `${allItems.length - filled.length} slot(s) do calendário ainda sem tema atribuído.`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      severity: 'low',
      message: 'Distribuição equilibrada para o objetivo do período.',
    });
  }

  return { retina, journey, totalSlots: allItems.length, filledSlots: filled.length, alerts };
}

export function mockBalance(projectId: string, calendarId: string): BalanceReport {
  const calendar = mockCalendarById(calendarId);
  if (!calendar) {
    return {
      retina: RETINA_TYPES.map((t) => ({ retinaType: t, count: 0, share: 0 })),
      journey: JOURNEY_TYPES.map((j) => ({ journeyStage: j, count: 0 })),
      totalSlots: 0,
      filledSlots: 0,
      alerts: [],
    };
  }
  const suggestions = mockSuggestions(projectId, calendarId);
  const assignments = suggestions.map((s) => ({ calendarItemId: s.calendarItemId, theme: s.suggestions[0] }));
  return computeBalanceFromAssignments(calendar, assignments);
}

function buildResultFromShift(
  projectId: string,
  calendar: EditorialCalendar,
  shift: { increase?: RetinaType[]; decrease?: RetinaType[] },
): RebalanceResult {
  const rand = rngFor(projectId, 'shift', calendar.id, shift.increase?.join(',') || '', shift.decrease?.join(',') || '');
  const library = mockThemeLibrary(projectId);
  const baseWeights = getRetinaBaseWeights();
  const slots: RebalanceResult['slots'] = [];
  for (const day of calendar.days) {
    for (const item of day.items) {
      if (item.status === 'published') continue;
      const candidatePool = library
        .map((theme) => ({ theme, score: fitScore(theme, item, calendar.objective) + rand() * 0.5 }))
        .sort((a, b) => b.score - a.score);
      const pick = candidatePool.find((c) => {
        const w = shiftWeights({ ...baseWeights, ...c.theme && {} }, shift.increase, shift.decrease);
        return w[c.theme.retinaType] > baseWeights[c.theme.retinaType] * 0.8;
      }) || candidatePool[0];
      if (pick) slots.push({ calendarItemId: item.id, theme: pick.theme });
    }
  }
  return { report: computeBalanceFromAssignments(calendar, slots), slots };
}

export function mockRebalance(projectId: string, calendarId: string, _request?: RebalanceRequest): RebalanceResult {
  const calendar = mockCalendarById(calendarId);
  if (!calendar) {
    return {
      report: { retina: RETINA_TYPES.map((t) => ({ retinaType: t, count: 0, share: 0 })), journey: JOURNEY_TYPES.map((j) => ({ journeyStage: j, count: 0 })), totalSlots: 0, filledSlots: 0, alerts: [] },
      slots: [],
    };
  }
  const current = mockBalance(projectId, calendarId);
  const lowest = [...current.retina].sort((a, b) => a.share - b.share)[0]?.retinaType;
  const highest = [...current.retina].sort((a, b) => b.share - a.share)[0]?.retinaType;
  return buildResultFromShift(projectId, calendar, {
    increase: lowest ? [lowest] : [],
    decrease: highest ? [highest] : [],
  });
}

export function mockSimulate(projectId: string, calendarId: string, request?: SimulateRequest): RebalanceResult {
  const calendar = mockCalendarById(calendarId);
  if (!calendar) {
    return {
      report: { retina: RETINA_TYPES.map((t) => ({ retinaType: t, count: 0, share: 0 })), journey: JOURNEY_TYPES.map((j) => ({ journeyStage: j, count: 0 })), totalSlots: 0, filledSlots: 0, alerts: [] },
      slots: [],
    };
  }
  return buildResultFromShift(projectId, calendar, {
    increase: request?.increase,
    decrease: request?.decrease,
  });
}

// ===== Versões do calendário =====

const versionStore = new Map<string, CalendarThemeVersion[]>();

export function mockSaveVersion(
  projectId: string,
  calendarId: string,
  data: SaveVersion,
): CalendarThemeVersion {
  const calendar = mockCalendarById(calendarId);
  const rand = rngFor(projectId, 'version', calendarId, data.name, Date.now().toString());
  const suggestions = mockSuggestions(projectId, calendarId);
  const slots = suggestions.map((s) => ({ calendarItemId: s.calendarItemId, theme: s.suggestions[0] }));
  const version: CalendarThemeVersion = {
    id: generateObjectId(rand),
    projectId,
    calendarId,
    name: data.name,
    period: {
      startDate: calendar?.period.startDate || new Date(),
      endDate: calendar?.period.endDate || new Date(),
    },
    configuration: { objective: data.objective, businessMoment: data.businessMoment },
    slots,
    createdAt: new Date(),
  };
  const list = versionStore.get(calendarId) || [];
  versionStore.set(calendarId, [version, ...list]);
  return version;
}

export function mockListVersions(calendarId: string): CalendarThemeVersion[] {
  return versionStore.get(calendarId) || [];
}