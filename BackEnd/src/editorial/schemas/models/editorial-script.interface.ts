import {
  ContentFormat,
  Platform,
  RetinaType,
} from './editorial-calendar.interface';

export type ScriptMode = 'seguranca' | 'conexao';

export type ScriptStatus = 'rascunho' | 'pronto' | 'publicado' | 'teste_ab';

export type ScriptBlockType =
  | 'gancho'
  | 'agitacao'
  | 'miolo'
  | 'retencao'
  | 'cta'
  | 'introducao'
  | 'contextualizacao'
  | 'bloco_ensino'
  | 'recompensa'
  | 'cta_final'
  | 'acolhimento'
  | 'ancoragem'
  | 'onda'
  | 'pico'
  | 'qa_encerramento'
  | 'slide_capa'
  | 'slide_contextualizacao'
  | 'slide_miolo'
  | 'slide_recompensa'
  | 'slide_cta'
  | 'outdoor'
  | 'bloco_1_gancho'
  | 'bloco_2_contextualizacao'
  | 'bloco_3_desenvolvimento'
  | 'bloco_4_objecao'
  | 'bloco_5_cta'
  | 'manha'
  | 'almoco'
  | 'tarde'
  | 'noite';

export type HookType =
  | 'erro'
  | 'metodo'
  | 'estatistica'
  | 'mito'
  | 'bastidor'
  | 'pergunta'
  | 'promessa'
  | 'outro';

export type MaterialStatus = 'gerando' | 'pronto' | 'erro';

export type ComplementaryMaterialType =
  | 'pdf_checklist'
  | 'pdf_guia'
  | 'pdf_workbook'
  | 'planilha_xlsx'
  | 'video_extra';

export type ExplanationMaterialType =
  'mapa_mental' | 'pdf_explicativo' | 'planilha_apoio';

export type AttachmentType =
  'brand_story' | 'referencia_validada' | 'estudo_tema' | 'material_existente';

export interface IScriptBlock {
  _id?: string;
  id?: string;
  order: number;
  type: ScriptBlockType;
  title?: string;
  content: string;
  visualDirection?: string;
  modeSpecificData?: Record<string, unknown>;
  timeRange?: string;
}

export interface ITitleSuggestion {
  _id?: string;
  title: string;
  hookType?: HookType;
}

export interface IThumbnailPrompt {
  _id?: string;
  promptEn: string;
  description?: string;
  format?: '9:16' | '16:9' | '4:5';
}

export interface IComplementaryMaterial {
  _id?: string;
  type: ComplementaryMaterialType;
  title: string;
  promise: string;
  structure: string[];
  fileId?: string;
  downloadUrl?: string;
  status: MaterialStatus;
}

export interface IExplanationMaterial {
  _id?: string;
  type: ExplanationMaterialType;
  title: string;
  content: string;
  fileId?: string;
  downloadUrl?: string;
  status: MaterialStatus;
}

export interface IScriptAttachment {
  _id?: string;
  id?: string;
  scriptId?: string;
  type: AttachmentType;
  title: string;
  description?: string;
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  parsedContent?: string;
  source?: 'platform' | 'project' | 'roteiro';
  formatTag?: ContentFormat;
  createdAt?: Date;
}

/** Briefing é validado no controller (Zod) e persistido como documento livre. */
export type IScriptBriefing = Record<string, any>;

/** Conteúdo gerado/editável de um roteiro — compartilhado com ScriptVersion. */
export interface IScriptContent {
  blocks: IScriptBlock[];
  caption?: string;
  titles?: ITitleSuggestion[];
  thumbnailPrompts?: IThumbnailPrompt[];
  complementaryMaterials?: IComplementaryMaterial[];
  explanationMaterials?: IExplanationMaterial[];
}

export interface IEditorialScript extends IScriptContent {
  _id?: string;
  id?: string;
  projectId: string;
  calendarSlotId?: string;
  themeId?: string;
  format: ContentFormat;
  version: number;
  mode: ScriptMode;
  status: ScriptStatus;
  title?: string;
  provisionalName?: string;
  briefing?: IScriptBriefing;
  attachments?: IScriptAttachment[];
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialScript extends Partial<IScriptContent> {
  projectId: string;
  calendarSlotId?: string;
  themeId?: string;
  format: ContentFormat;
  mode: ScriptMode;
  status?: ScriptStatus;
  version?: number;
  title?: string;
  provisionalName?: string;
  briefing?: IScriptBriefing;
  attachments?: IScriptAttachment[];
  createdBy: string;
}

export interface IUpdateEditorialScript extends Partial<IScriptContent> {
  status?: ScriptStatus;
  mode?: ScriptMode;
  version?: number;
  title?: string;
  provisionalName?: string;
  briefing?: IScriptBriefing;
}

export interface IScriptFilters {
  format?: ContentFormat;
}

export interface IEditorialScriptVersion extends IScriptContent {
  _id?: string;
  id?: string;
  scriptId: string;
  versionNumber: number;
  comment?: string;
  createdBy: string;
  createdAt?: Date;
}

export type ICreateEditorialScriptVersion = Omit<
  IEditorialScriptVersion,
  '_id' | 'id' | 'createdAt'
>;

/** Item de calendário achatado para a tela de criação de roteiro. */
export interface ICalendarSlotForScript {
  id: string;
  calendarId: string;
  date: Date;
  format: ContentFormat;
  retinaType: RetinaType;
  platforms: Platform[];
  objective: string;
  suggestedTime: string;
  theme?: string;
  themeId?: string;
  provisionalName?: string;
  strategicObjective?: string;
  pillar?: string;
  painDesireObjection?: string;
  materialQualified: boolean;
  status: string;
}

export interface IThemeForScript {
  id: string;
  title: string;
  angle: string;
  approach: string;
  pillar?: string;
  references?: string[];
  formatCompatibility: ContentFormat[];
  createdAt?: Date;
}
