import axios from 'axios';
import type {
  CalendarSlotForScript,
  GenerationResult,
  Script,
  ScriptAttachment,
  ScriptBriefing,
  ScriptFormat,
  ScriptMode,
  ScriptVersion,
  ThemeForScript,
} from '@/lib/dto/editorial.schema';
import {
  mockScripts,
  mockCalendarSlots,
  mockThemesForScript,
  mockBrandStory,
  mockVersionsForScript,
  mockAttachmentsForScript,
  mockGenerationResult,
} from '@/lib/mocks/scripts.mock';

const localClient = axios.create({ baseURL: '/api' });

localClient.interceptors.request.use(
  async (config) => {
    const { store } = await import('@/lib/redux/store');
    const state = store.getState();
    const token = state.auth?.token;
    const currentOrg = state.organizations?.currentOrganization;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (currentOrg && currentOrg.organizationId) {
      const orgId =
        typeof currentOrg.organizationId === 'string'
          ? currentOrg.organizationId
          : currentOrg.organizationId._id || currentOrg.organizationId.id;

      config.headers['x-org-id'] = orgId;
      config.headers['x-org-role'] = currentOrg.role;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const BASE = '/editorial/projects';

export const scriptsService = {
  // Lista scripts de um projeto, opcionalmente filtrados por formato
  listScripts: async (projectId: string, format?: ScriptFormat): Promise<Script[]> => {
    try {
      const response = await localClient.get(`${BASE}/${projectId}/scripts`, {
        params: format ? { format } : {},
      });
      return response.data;
    } catch {
      if (format) return mockScripts[format] || [];
      return Object.values(mockScripts).flat();
    }
  },

  // Busca um script específico
  getScript: async (projectId: string, scriptId: string): Promise<Script | null> => {
    try {
      const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}`);
      return response.data;
    } catch {
      const all = Object.values(mockScripts).flat();
      return all.find((s) => s.id === scriptId) || null;
    }
  },

  // Cria um script (rascunho inicial)
  createScript: async (
    projectId: string,
    data: { format: ScriptFormat; mode: ScriptMode; calendarSlotId?: string; themeId?: string; title?: string },
  ): Promise<Script> => {
    try {
      const response = await localClient.post(`${BASE}/${projectId}/scripts`, data);
      return response.data;
    } catch {
      const mock = mockScripts[data.format]?.[0];
      if (!mock) throw new Error('Formato inválido');
      return { ...mock, id: crypto.randomUUID?.() || Math.random().toString(36) };
    }
  },

  // Gera o pacote completo de conteúdo
  generateScript: async (
    projectId: string,
    scriptId: string,
    briefing: ScriptBriefing,
  ): Promise<GenerationResult> => {
    try {
      const response = await localClient.post(
        `${BASE}/${projectId}/scripts/${scriptId}/generate`,
        { briefing },
      );
      return response.data;
    } catch {
      // Simula delay de geração
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return mockGenerationResult(
        briefing.bloco1.format,
        briefing.bloco2.scriptMode || 'conexao',
        briefing.bloco1.theme || 'crescimento digital',
      );
    }
  },

  // Atualiza blocos ou campos do script
  updateScript: async (projectId: string, scriptId: string, data: Partial<Script>): Promise<Script> => {
    const response = await localClient.patch(`${BASE}/${projectId}/scripts/${scriptId}`, data);
    return response.data;
  },

  // Regera um bloco específico
  regenerateBlock: async (
    projectId: string,
    scriptId: string,
    blockId: string,
    context?: string,
  ): Promise<Script> => {
    const response = await localClient.post(
      `${BASE}/${projectId}/scripts/${scriptId}/blocks/${blockId}/regenerate`,
      { context },
    );
    return response.data;
  },

  // Duplica um script
  duplicateScript: async (projectId: string, scriptId: string): Promise<Script> => {
    const response = await localClient.post(`${BASE}/${projectId}/scripts/${scriptId}/duplicate`);
    return response.data;
  },

  // Arquivar (soft delete)
  archiveScript: async (projectId: string, scriptId: string): Promise<void> => {
    await localClient.delete(`${BASE}/${projectId}/scripts/${scriptId}`);
  },

  // Exporta dados do script (copia legenda, prompts)
  exportScript: async (projectId: string, scriptId: string): Promise<string> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/export`);
    return response.data;
  },

  // Versões
  listVersions: async (projectId: string, scriptId: string): Promise<ScriptVersion[]> => {
    try {
      const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/versions`);
      return response.data;
    } catch {
      return mockVersionsForScript(scriptId);
    }
  },

  createVersion: async (
    projectId: string,
    scriptId: string,
    comment?: string,
  ): Promise<ScriptVersion> => {
    const response = await localClient.post(
      `${BASE}/${projectId}/scripts/${scriptId}/versions`,
      { comment },
    );
    return response.data;
  },

  // Anexos
  listAttachments: async (projectId: string, scriptId: string): Promise<ScriptAttachment[]> => {
    try {
      const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/attachments`);
      return response.data;
    } catch {
      return mockAttachmentsForScript(scriptId);
    }
  },

  addAttachment: async (
    projectId: string,
    scriptId: string,
    data: Partial<ScriptAttachment>,
    file?: File,
  ): Promise<ScriptAttachment> => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('data', JSON.stringify(data));
    const response = await localClient.post(
      `${BASE}/${projectId}/scripts/${scriptId}/attachments`,
      formData,
    );
    return response.data;
  },

  removeAttachment: async (projectId: string, scriptId: string, attachmentId: string): Promise<void> => {
    await localClient.delete(`${BASE}/${projectId}/scripts/${scriptId}/attachments/${attachmentId}`);
  },

  // Slots do calendário (Fn 01) por formato
  listSlotsByFormat: async (projectId: string, format: ScriptFormat): Promise<CalendarSlotForScript[]> => {
    try {
      const response = await localClient.get(
        `${BASE}/${projectId}/scripts/slots/${format}`,
      );
      return response.data;
    } catch {
      return mockCalendarSlots[format] || [];
    }
  },

  // Temas da Biblioteca (Fn 02) por formato
  listThemesByFormat: async (projectId: string, format: ScriptFormat): Promise<ThemeForScript[]> => {
    try {
      const response = await localClient.get(
        `${BASE}/${projectId}/scripts/themes/${format}`,
      );
      return response.data;
    } catch {
      return mockThemesForScript[format] || [];
    }
  },

  // Brand Story
  getBrandStory: async (projectId: string): Promise<any> => {
    try {
      const response = await localClient.get(`${BASE}/${projectId}/scripts/brand-story`);
      return response.data;
    } catch {
      return mockBrandStory;
    }
  },
};