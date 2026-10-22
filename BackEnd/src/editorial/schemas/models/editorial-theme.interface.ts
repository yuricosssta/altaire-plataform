import {
  ContentFormat,
  Platform,
  RetinaType,
} from './editorial-calendar.interface';

export type ThemeOrigin = 'roma_avatar' | 'market' | 'objective';

export type ConsciousnessLevel = 'sintoma' | 'solucao' | 'objecao';

export type JourneyStage =
  | 'descoberta'
  | 'consideracao'
  | 'conversao'
  | 'experiencia'
  | 'compartilhamento';

export type ThemeStatus = 'active' | 'archived' | 'favorite' | 'test';

export type ThemeFlag = 'prioritario_proximo_ciclo' | 'guardado_para_vendas';

export type ThemeApproach =
  'erro' | 'metodo' | 'historia' | 'bastidor' | 'estudo_caso' | 'outro';

export type ThemeObjective =
  | 'grow_audience'
  | 'increase_engagement'
  | 'increase_relationship'
  | 'warm_up_sales'
  | 'sell_launch'
  | 'sell_evergreen'
  | 'nurture_customers'
  | 'strengthen_authority';

export type BusinessMoment =
  | 'building_audience'
  | 'building_authority'
  | 'pre_sale'
  | 'cart_open'
  | 'post_sale'
  | 'organic_maintenance';

export type RetinaPriority = 'balanced' | RetinaType;

export interface IEditorialTheme {
  _id?: string;
  id?: string;
  projectId: string;
  origin: ThemeOrigin;
  title: string;
  pillar: string;
  retinaType: RetinaType;
  consciousnessLevel: ConsciousnessLevel;
  journeyStage: JourneyStage;
  format: ContentFormat;
  platforms: Platform[];
  status: ThemeStatus;
  flags?: ThemeFlag[];
  sourceContext?: string;
  batchId?: string;
  angle?: string;
  approach?: ThemeApproach;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICreateEditorialTheme = Omit<
  IEditorialTheme,
  '_id' | 'id' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export interface IUpdateEditorialTheme {
  title?: string;
  pillar?: string;
  retinaType?: RetinaType;
  consciousnessLevel?: ConsciousnessLevel;
  journeyStage?: JourneyStage;
  format?: ContentFormat;
  platforms?: Platform[];
  status?: ThemeStatus;
  flags?: ThemeFlag[];
  angle?: string;
  approach?: ThemeApproach;
}

export interface IThemeFilters {
  status?: ThemeStatus[];
  format?: ContentFormat;
  batchId?: string;
}

// ===== Parâmetros de geração =====

export type ThemeVolume = '20' | '50' | '100';

export interface IRomaAvatarParams {
  volume: ThemeVolume;
  pillars: string[];
  retinaPriority: RetinaPriority;
}

export interface IMarketParams {
  volume?: ThemeVolume;
  videoLinks?: string[];
  comments?: string[];
  reviews?: string[];
}

export interface IObjectiveParams {
  objective: ThemeObjective;
  businessMoment: BusinessMoment;
  platforms: Platform[];
  volume?: ThemeVolume;
}

export type IThemeGenerationRequest =
  | { mode: 'roma_avatar'; params: IRomaAvatarParams }
  | { mode: 'market'; params: IMarketParams }
  | { mode: 'objective'; params: IObjectiveParams };

export interface IThemeGenerationResult {
  batchId: string;
  mode: ThemeOrigin;
  themes: IEditorialTheme[];
}

// ===== Equilíbrio / calendário =====

export interface IBalanceAlert {
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface IBalanceReport {
  retina: { retinaType: RetinaType; count: number; share: number }[];
  journey: { journeyStage: JourneyStage; count: number }[];
  totalSlots: number;
  filledSlots: number;
  alerts: IBalanceAlert[];
}

export interface IThemeSlot {
  calendarItemId: string;
  theme: IEditorialTheme;
}

export interface IRebalanceResult {
  report: IBalanceReport;
  slots: IThemeSlot[];
}

export interface ISlotSuggestion {
  calendarItemId: string;
  suggestions: IEditorialTheme[];
}
