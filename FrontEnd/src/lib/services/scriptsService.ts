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
  listScripts: async (projectId: string, format?: ScriptFormat): Promise<Script[]> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts`, {
      params: format ? { format } : {},
    });
    return response.data;
  },

  getScript: async (projectId: string, scriptId: string): Promise<Script | null> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}`);
    return response.data;
  },

  createScript: async (
    projectId: string,
    data: { format: ScriptFormat; mode: ScriptMode; calendarSlotId?: string; themeId?: string; title?: string },
  ): Promise<Script> => {
    const response = await localClient.post(`${BASE}/${projectId}/scripts`, data);
    return response.data;
  },

  generateScript: async (
    projectId: string,
    scriptId: string,
    briefing: ScriptBriefing,
  ): Promise<GenerationResult> => {
    const response = await localClient.post(
      `${BASE}/${projectId}/scripts/${scriptId}/generate`,
      { briefing },
    );
    return response.data;
  },

  updateScript: async (projectId: string, scriptId: string, data: Partial<Script>): Promise<Script> => {
    const response = await localClient.patch(`${BASE}/${projectId}/scripts/${scriptId}`, data);
    return response.data;
  },

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

  duplicateScript: async (projectId: string, scriptId: string): Promise<Script> => {
    const response = await localClient.post(`${BASE}/${projectId}/scripts/${scriptId}/duplicate`);
    return response.data;
  },

  archiveScript: async (projectId: string, scriptId: string): Promise<void> => {
    await localClient.delete(`${BASE}/${projectId}/scripts/${scriptId}`);
  },

  exportScript: async (projectId: string, scriptId: string): Promise<string> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/export`);
    return response.data;
  },

  listVersions: async (projectId: string, scriptId: string): Promise<ScriptVersion[]> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/versions`);
    return response.data;
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

  listAttachments: async (projectId: string, scriptId: string): Promise<ScriptAttachment[]> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/${scriptId}/attachments`);
    return response.data;
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

  listSlotsByFormat: async (projectId: string, format: ScriptFormat): Promise<CalendarSlotForScript[]> => {
    const response = await localClient.get(
      `${BASE}/${projectId}/scripts/slots/${format}`,
    );
    return response.data;
  },

  listThemesByFormat: async (projectId: string, format: ScriptFormat): Promise<ThemeForScript[]> => {
    const response = await localClient.get(
      `${BASE}/${projectId}/scripts/themes/${format}`,
    );
    return response.data;
  },

  getBrandStory: async (projectId: string): Promise<any> => {
    const response = await localClient.get(`${BASE}/${projectId}/scripts/brand-story`);
    return response.data;
  },
};