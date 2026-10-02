import { BrandStory } from "../dto/editorial.schema";

export const FORMAT_LABELS: Record<string, string> = {
  video_curto: 'Vídeo Curto',
  video_medio: 'Vídeo Médio',
  video_longo: 'Vídeo Longo',
  podcast: 'Podcast',
  artigo: 'Artigo',
  post_blog: 'Post Blog',
  news: 'Newsletter',
  social: 'Social Media',
};

export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  video_curto: '30-60 segundos',
  video_medio: '2-5 minutos',
  video_longo: '8-15 minutos',
  podcast: 'Áudio',
  artigo: 'Texto longo',
  post_blog: 'Texto médio',
  news: 'E-mail',
  social: 'Redes sociais',
};

export const FORMAT_ICONS: Record<string, string> = {
  video_curto: 'Video',
  video_medio: 'Video',
  video_longo: 'Video',
  podcast: 'Podcast',
  artigo: 'FileText',
  post_blog: 'FileText',
  news: 'Mail',
  social: 'MessageCircle',
};

export const FORMAT_ROUTE: Record<string, string> = {
  video_curto: 'video-curto',
  video_medio: 'video-medio',
  video_longo: 'video-longo',
  podcast: 'podcast',
  artigo: 'artigo',
  post_blog: 'post-blog',
  news: 'newsletter',
  social: 'social',
};

export const mockScripts: Record<string, any[]> = {};
export const mockCalendarSlots: Record<string, any[]> = {};
export const mockThemesForScript: Record<string, any[]> = {};
export const mockBrandStory: BrandStory | null = null;
export const mockVersionsForScript = (_scriptId: string): any[] => [];
export const mockAttachmentsForScript = (_scriptId: string): any[] => [];
export const mockGenerationResult = (..._args: any[]): any => ({});