// src/lib/constants/themes.ts
// Metadados visuais do Motor de Temas Estratégicos: origem, nível de consciência,
// etapa da jornada, status, objetivos do período, momento do negócio. Segue a
// regra 60-30-10 (fundo escuro dominante, acentos sutis e dourado só para
// conversão/autoridade).

import {
  Rocket,
  Target,
  Handshake,
  Flame,
  Megaphone,
  ShoppingBag,
  Users,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  HeartHandshake,
  Sprout,
  Timer,
  Store,
  PackageCheck,
  RefreshCw,
  Crown,
  Waves,
  Compass,
  Scale,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import type {
  BusinessMoment,
  ConsciousnessLevel,
  JourneyStage,
  ThemeFlag,
  ThemeObjective,
  ThemeOrigin,
  ThemeStatus,
} from '@/lib/dto/themes.schema';

export const ORIGIN_META: Record<ThemeOrigin, { label: string; badgeClass: string; icon: LucideIcon }> = {
  roma_avatar: {
    label: 'ROMA & Avatar',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    icon: Target,
  },
  market: {
    label: 'Mercado & Internet',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    icon: Waves,
  },
  objective: {
    label: 'Objetivo & Momento',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    icon: Compass,
  },
};

export const CONSCIOUSNESS_META: Record<
  ConsciousnessLevel,
  { label: string; badgeClass: string; dotClass: string }
> = {
  sintoma: {
    label: 'Sintoma',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    dotClass: 'bg-amber-400',
  },
  solucao: {
    label: 'Solução',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dotClass: 'bg-emerald-400',
  },
  objecao: {
    label: 'Objeção',
    badgeClass: 'border-red-500/30 bg-red-500/10 text-red-400',
    dotClass: 'bg-red-400',
  },
};

export const JOURNEY_META: Record<
  JourneyStage,
  { label: string; badgeClass: string; shortLabel: string }
> = {
  descoberta: {
    label: 'Descoberta',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    shortLabel: 'Descoberta',
  },
  consideracao: {
    label: 'Consideração',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    shortLabel: 'Consideração',
  },
  conversao: {
    label: 'Conversão / Compra',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    shortLabel: 'Conversão',
  },
  experiencia: {
    label: 'Experiência do comprador',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    shortLabel: 'Experiência',
  },
  compartilhamento: {
    label: 'Experiência compartilhada',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    shortLabel: 'Compartilhada',
  },
};

export const THEME_STATUS_META: Record<ThemeStatus, { label: string; badgeClass: string }> = {
  active: {
    label: 'Ativo',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  archived: {
    label: 'Arquivado',
    badgeClass: 'border-border bg-card text-muted-foreground',
  },
  favorite: {
    label: 'Favorito',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
  },
  test: {
    label: 'Teste de mercado',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  },
};

export const THEME_FLAG_META: Record<ThemeFlag, { label: string; badgeClass: string }> = {
  prioritario_proximo_ciclo: {
    label: 'Prioritário p/ próximo ciclo',
    badgeClass: 'border-primary/40 bg-primary/15 text-primary',
  },
  guardado_para_vendas: {
    label: 'Guardado p/ vendas',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
};

export const VOLUME_OPTIONS = [
  { value: '20', label: 'Gerar 20 temas iniciais' },
  { value: '50', label: 'Gerar 50 temas iniciais' },
  { value: '100', label: 'Gerar 100 temas iniciais' },
];

export const RETINA_PRIORITY_META: Record<
  string,
  { label: string; description: string }
> = {
  balanced: {
    label: 'Equilíbrio padrão (todos os tipos) (Recomendado)',
    description: 'Distribuição uniforme respeitando o peso da linha editorial.',
  },
  relacionamento: {
    label: 'Focar mais em Relacionamento',
    description: 'Relacionamento com os seguidores e a base.',
  },
  engajamento: {
    label: 'Focar mais em Engajamento',
    description: 'Topo de funil, alcance e comentários.',
  },
  transformacao: {
    label: 'Focar mais em Transformação',
    description: 'Educativo, salvamentos e desejo.',
  },
  interacao: {
    label: 'Focar mais em Interação',
    description: 'Participação ativa da audiência.',
  },
  nivel_consciencia: {
    label: 'Focar mais em Níveis de Consciência',
    description: 'Conteúdo de venda e elevação do entendimento.',
  },
  autoridade: {
    label: 'Focar mais em Autoridade',
    description: 'Resultados, conquistas e prova social.',
  },
};

export const THEME_OBJECTIVE_META: Record<
  ThemeObjective,
  { label: string; description: string; icon: LucideIcon }
> = {
  grow_audience: {
    label: 'Crescer audiência (atrair novos seguidores)',
    description: 'Foco em alcance, descoberta e expansão da base.',
    icon: TrendingUp,
  },
  increase_engagement: {
    label: 'Aumentar engajamento',
    description: 'Comentários, salvamentos e compartilhamentos.',
    icon: MessageCircle,
  },
  increase_relationship: {
    label: 'Aumentar Relacionamento e Interação',
    description: 'Aprofundar o vínculo com quem já acompanha a marca.',
    icon: HeartHandshake,
  },
  warm_up_sales: {
    label: 'Aquecer público para vendas',
    description: 'Preparar a audiência para uma campanha de vendas.',
    icon: Flame,
  },
  sell_launch: {
    label: 'Vender produto principal (lançamento)',
    description: 'Orquestrar narrativa e ritmo do lançamento.',
    icon: Rocket,
  },
  sell_evergreen: {
    label: 'Vender produto principal (perpétuo)',
    description: 'Conversão contínua com oferta sempre ativa.',
    icon: ShoppingBag,
  },
  nurture_customers: {
    label: 'Nutrir base de clientes atuais (pós-venda)',
    description: 'Experiência do comprador e retenção.',
    icon: Users,
  },
  strengthen_authority: {
    label: 'Fortalecer autoridade e prova social',
    description: 'Consolidar posicionamento e resultados.',
    icon: ShieldCheck,
  },
};

export const BUSINESS_MOMENT_META: Record<
  BusinessMoment,
  { label: string; description: string; icon: LucideIcon }
> = {
  building_audience: {
    label: 'Construindo audiência (pré-campanhas)',
    description: 'Sem pressão de venda; foco em alcance.',
    icon: Sprout,
  },
  building_authority: {
    label: 'Gerando autoridade e relacionamento',
    description: 'Consolidar posicionamento e vínculo.',
    icon: Crown,
  },
  pre_sale: {
    label: 'Pré-venda (aquecimento)',
    description: 'Elevar desejo e criar expectativa.',
    icon: Timer,
  },
  cart_open: {
    label: 'Carrinho aberto (campanha de vendas)',
    description: 'Prioridade para conversão direta.',
    icon: Store,
  },
  post_sale: {
    label: 'Pós-vendas (nutrição de compradores)',
    description: 'Cuidar da experiência e extrair prova social.',
    icon: PackageCheck,
  },
  organic_maintenance: {
    label: 'Manutenção orgânica (sem campanha específica)',
    description: 'Ritmo saudável sem objetivo comercial agressivo.',
    icon: RefreshCw,
  },
};

export const SIMULATE_PRESETS = [
  {
    id: 'more_transformacao',
    label: 'Mais Transformação, menos Engajamento',
    increase: ['transformacao' as const],
    decrease: ['engajamento' as const],
  },
  {
    id: 'more_conversao',
    label: 'Mais Níveis de Consciência e Autoridade',
    increase: ['nivel_consciencia' as const, 'autoridade' as const],
    decrease: ['relacionamento' as const],
  },
  {
    id: 'more_relacionamento',
    label: 'Mais Relacionamento e Interação',
    increase: ['relacionamento' as const, 'interacao' as const],
    decrease: ['nivel_consciencia' as const],
  },
];

export const ICON_PILLAR = Scale;
export const ICON_CONSCIOUSNESS = Lightbulb;