// src/lib/services/themesService.ts
// Serviço do Motor de Temas Estratégicos (Função 02). Chama o BFF /api/editorial,
// que por sua vez repassa ao backend NestJS quando disponível ou cai no mock.
import axios from 'axios';
import type { CalendarItem } from '@/lib/dto/editorial.schema';
import type {
  AssignTheme,
  BalanceReport,
  BulkStatus,
  CalendarSuggestionsRequest,
  CalendarThemeVersion,
  GenerationRequest,
  GenerationResult,
  RebalanceRequest,
  RebalanceResult,
  SaveVersion,
  SimulateRequest,
  SlotSuggestion,
  Theme,
  ThemeUpdate,
} from '@/lib/dto/themes.schema';

const localClient = axios.create({ baseURL: '/api' });

// Interceptor para plugar os cabeçalhos da organização nas chamadas ao BFF
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

function toTheme(theme: any): Theme {
  return {
    ...theme,
    createdAt: theme.createdAt ? new Date(theme.createdAt) : undefined,
    updatedAt: theme.updatedAt ? new Date(theme.updatedAt) : undefined,
  };
}

export const themesService = {
  listLibrary: async (
    projectId: string,
    filters?: {
      origin?: string;
      retinaType?: string;
      journey?: string;
      status?: string;
      pillar?: string;
      q?: string;
    },
  ): Promise<Theme[]> => {
    const response = await localClient.get(`/editorial/projects/${projectId}/themes`, {
      params: filters,
    });
    return response.data.map(toTheme);
  },

  generate: async (projectId: string, request: GenerationRequest): Promise<GenerationResult> => {
    const response = await localClient.post(`/editorial/projects/${projectId}/themes`, request);
    return {
      batchId: response.data.batchId,
      mode: response.data.mode,
      themes: response.data.themes.map(toTheme),
    };
  },

  detectPillars: async (projectId: string): Promise<string[]> => {
    const response = await localClient.get(`/editorial/projects/${projectId}/themes/pillars`);
    return response.data.pillars || [];
  },

  updateTheme: async (projectId: string, themeId: string, patch: ThemeUpdate): Promise<Theme> => {
    const response = await localClient.patch(
      `/editorial/projects/${projectId}/themes/${themeId}`,
      patch,
    );
    return toTheme(response.data);
  },

  deleteTheme: async (projectId: string, themeId: string): Promise<{ ok: boolean }> => {
    const response = await localClient.delete(`/editorial/projects/${projectId}/themes/${themeId}`);
    return response.data;
  },

  generateMore: async (
    projectId: string,
    themeId: string,
    count?: number,
  ): Promise<Theme[]> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/${themeId}/generate-more`,
      { count },
    );
    return response.data.map(toTheme);
  },

  bulkStatus: async (projectId: string, data: BulkStatus): Promise<Theme[]> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/bulk-status`,
      data,
    );
    return response.data.map(toTheme);
  },

  getCalendarSuggestions: async (
    projectId: string,
    data: CalendarSuggestionsRequest,
  ): Promise<SlotSuggestion[]> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/calendar-suggestions`,
      data,
    );
    return response.data.map((s: any) => ({
      ...s,
      suggestions: s.suggestions.map(toTheme),
    }));
  },

  assignTheme: async (
    projectId: string,
    calendarId: string,
    data: AssignTheme,
  ): Promise<CalendarItem> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/assign`,
      data,
    );
    return {
      ...response.data,
      date: response.data.date ? new Date(response.data.date) : undefined,
    };
  },

  getBalance: async (projectId: string, calendarId: string): Promise<BalanceReport> => {
    const response = await localClient.get(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/balance`,
    );
    return response.data;
  },

  rebalance: async (
    projectId: string,
    calendarId: string,
    data?: RebalanceRequest,
  ): Promise<RebalanceResult> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/rebalance`,
      data || {},
    );
    return response.data;
  },

  simulate: async (
    projectId: string,
    calendarId: string,
    data?: SimulateRequest,
  ): Promise<RebalanceResult> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/simulate`,
      data || {},
    );
    return response.data;
  },

  listVersions: async (
    projectId: string,
    calendarId: string,
  ): Promise<CalendarThemeVersion[]> => {
    const response = await localClient.get(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/versions`,
    );
    return response.data;
  },

  saveVersion: async (
    projectId: string,
    calendarId: string,
    data: SaveVersion,
  ): Promise<CalendarThemeVersion> => {
    const response = await localClient.post(
      `/editorial/projects/${projectId}/themes/calendars/${calendarId}/versions`,
      data,
    );
    return {
      ...response.data,
      period: {
        ...response.data.period,
        startDate: new Date(response.data.period.startDate),
        endDate: new Date(response.data.period.endDate),
      },
      createdAt: new Date(response.data.createdAt),
    };
  },
};