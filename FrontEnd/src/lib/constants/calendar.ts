// src/lib/constants/calendar.ts
// Metadados visuais do Calendário Editorial: cores por tipo RETINA, ícones por
// formato, labels de status/objetivo/período. Segue a regra 60-30-10 (fundo
// escuro dominante, acentos sutis e dourado só para conversão/autoridade).

import {
  Clapperboard,
  MonitorPlay,
  Images,
  Image,
  Radio,
  StickyNote,
  TrendingUp,
  Flame,
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type {
  CalendarObjective,
  CalendarStatus,
  ContentFormat,
  PeriodType,
  Platform,
  RetinaType,
} from '@/lib/dto/editorial.schema';

export const RETINA_META: Record<
  RetinaType,
  { label: string; badgeClass: string; dotClass: string; barClass: string }
> = {
  relacionamento: {
    label: 'Relacionamento',
    badgeClass: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    dotClass: 'bg-pink-400',
    barClass: 'bg-pink-400',
  },
  engajamento: {
    label: 'Engajamento',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    dotClass: 'bg-amber-400',
    barClass: 'bg-amber-400',
  },
  transformacao: {
    label: 'Transformação',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dotClass: 'bg-emerald-400',
    barClass: 'bg-emerald-400',
  },
  interacao: {
    label: 'Interação',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    dotClass: 'bg-sky-400',
    barClass: 'bg-sky-400',
  },
  nivel_consciencia: {
    label: 'Níveis de Consciência',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    dotClass: 'bg-violet-400',
    barClass: 'bg-violet-400',
  },
  autoridade: {
    label: 'Autoridade',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    barClass: 'bg-primary',
  },
};

export const FORMAT_META: Record<
  ContentFormat,
  { label: string; icon: LucideIcon; time: string }
> = {
  reel: { label: 'Reel', icon: Clapperboard, time: '19:00' },
  long_video: { label: 'Vídeo Longo', icon: MonitorPlay, time: '18:00' },
  carousel: { label: 'Carrossel', icon: Images, time: '10:00' },
  static_post: { label: 'Post Estático', icon: Image, time: '14:00' },
  live: { label: 'Live', icon: Radio, time: '20:00' },
  stories_sequence: { label: 'Stories', icon: StickyNote, time: '09:00' },
};

export const OBJECTIVE_META: Record<
  CalendarObjective,
  { label: string; description: string; icon: LucideIcon }
> = {
  increase_audience: {
    label: 'Aumentar audiência',
    description: 'Foco em alcance, descoberta e crescimento da base.',
    icon: TrendingUp,
  },
  warmup_sales: {
    label: 'Aquecer para vendas',
    description: 'Preparar a audiência para uma campanha de vendas.',
    icon: Flame,
  },
  reinforce_authority: {
    label: 'Reforçar autoridade',
    description: 'Consolidar posicionamento e prova para o mercado.',
    icon: ShieldCheck,
  },
  increase_relationship: {
    label: 'Relacionamento com a base',
    description: 'Aprofundar o vínculo com quem já acompanha a marca.',
    icon: HeartHandshake,
  },
  improve_engagement: {
    label: 'Melhorar engajamento',
    description: 'Estimular interação e participação ativa da audiência.',
    icon: MessageCircle,
  },
  support_launch: {
    label: 'Apoiar um lançamento',
    description: 'Orquestrar narrativa e ritmo para o momento do lançamento.',
    icon: Rocket,
  },
};

export const PERIOD_META: Record<PeriodType, { label: string; days: number; description: string }> = {
  two_weeks: { label: '2 semanas', days: 14, description: 'Período curto, alta densidade.' },
  one_month: { label: '1 mês', days: 30, description: 'Ciclo mensal completo.' },
  four_weeks_warmup: { label: '4 semanas de aquecimento', days: 28, description: 'Aquecimento para campanha.' },
  pre_launch: { label: 'Fase de pré-lançamento', days: 28, description: 'Ritmo de contagem regressiva.' },
  custom: { label: 'Período personalizado', days: 0, description: 'Defina as datas exatas.' },
};

export const PLATFORM_META: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

export const STATUS_META: Record<CalendarStatus, { label: string; badgeClass: string }> = {
  planned: {
    label: 'Planejado',
    badgeClass: 'border-border bg-card text-muted-foreground',
  },
  in_production: {
    label: 'Em Produção',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  },
  recorded: {
    label: 'Gravado',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  },
  published: {
    label: 'Publicado',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
};

export const RETINA_OBJECTIVE_TEXT: Record<RetinaType, string> = {
  relacionamento: 'Criar conexão e vínculo com a audiência',
  engajamento: 'Aumentar alcance e comentários',
  transformacao: 'Gerar desejo e mostrar transformação',
  interacao: 'Estimular participação ativa da audiência',
  nivel_consciencia: 'Elevar o nível de consciência do público',
  autoridade: 'Reforçar autoridade e prova',
};

export const STORY_SEQUENCE_FOCUS = [
  'Rotina e bastidores',
  'Conexão e interação',
  'Aquecimento e reforço narrativo',
  'Antecipação da semana',
];

export const STORY_SEQUENCE_TIME = ['09:00', '12:00', '18:00', '20:00'];