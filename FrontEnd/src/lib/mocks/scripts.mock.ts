import { BrandStory } from "../dto/editorial.schema";

export const FORMAT_LABELS: Record<string, string> = {
  reel: 'Reels / Vídeo Curto',
  long_video: 'Vídeo Longo',
  carousel: 'Carrossel',
  static_post: 'Post Estático',
  live: 'Live',
  stories_sequence: 'Sequência de Stories',
  video_curto: 'Vídeo Curto',
  video_longo: 'Vídeo Longo',
  carrossel: 'Carrossel',
  post_estatico: 'Post Estático',
};

export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  reel: '30-60 segundos',
  long_video: '8-15 minutos',
  carousel: 'Carrossel informativo',
  static_post: 'Imagem única ou texto',
  live: 'Transmissão ao vivo',
  stories_sequence: 'Sequência de 4 etapas',
  video_curto: '30-60 segundos',
  video_longo: '8-15 minutos',
  carrossel: 'Carrossel informativo',
  post_estatico: 'Imagem única ou texto',
};

export const FORMAT_ICONS: Record<string, string> = {
  reel: 'Video',
  long_video: 'Video',
  carousel: 'FileText',
  static_post: 'FileText',
  live: 'Radio',
  stories_sequence: 'Layers',
  video_curto: 'Video',
  video_longo: 'Video',
  carrossel: 'FileText',
  post_estatico: 'FileText',
};

export const FORMAT_ROUTE: Record<string, string> = {
  reel: 'reel',
  long_video: 'long_video',
  carousel: 'carousel',
  static_post: 'static_post',
  live: 'live',
  stories_sequence: 'stories_sequence',
  video_curto: 'reel',
  video_longo: 'long_video',
  carrossel: 'carousel',
  post_estatico: 'static_post',
};

export const mockScripts: Record<string, any[]> = {};
export const mockCalendarSlots: Record<string, any[]> = {};
export const mockThemesForScript: Record<string, any[]> = {};
export const mockBrandStory: BrandStory | null = null;
export const mockVersionsForScript = (_scriptId: string): any[] => [];
export const mockAttachmentsForScript = (_scriptId: string): any[] => [];
export const mockGenerationResult = (..._args: any[]): any => ({});