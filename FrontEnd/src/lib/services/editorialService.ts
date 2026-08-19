// src/lib/services/editorialService.ts
import axios from 'axios';
import {
  CalendarDuplicate,
  EditorialCalendar,
  EditorialMapaDTO,
  EditorialVersionDTO,
  EditorialVersionUpdateDTO,
  CalendarItem,
  CalendarItemUpdate,
  CalendarPatch,
  CalendarSetup,
  OnboardingFormDTO,
  ProjectCardDTO,
  ProjectCreateDTO,
  ReviewSuggestion,
} from '@/lib/dto/editorial.schema';

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

function toVersion(version: any): EditorialVersionDTO {
  return {
    ...version,
    createdAt: version.createdAt ? new Date(version.createdAt) : undefined,
    updatedAt: version.updatedAt ? new Date(version.updatedAt) : undefined,
  };
}

function toCalendarItem(item: any): CalendarItem {
  return {
    ...item,
    date: item.date ? new Date(item.date) : undefined,
  };
}

function toCalendar(calendar: any): EditorialCalendar {
  return {
    ...calendar,
    createdAt: calendar.createdAt ? new Date(calendar.createdAt) : undefined,
    updatedAt: calendar.updatedAt ? new Date(calendar.updatedAt) : undefined,
    period: calendar.period
      ? {
          ...calendar.period,
          startDate: calendar.period.startDate
            ? new Date(calendar.period.startDate)
            : undefined,
          endDate: calendar.period.endDate ? new Date(calendar.period.endDate) : undefined,
        }
      : calendar.period,
    days: (calendar.days || []).map((day: any) => ({
      ...day,
      date: day.date ? new Date(day.date) : undefined,
      items: (day.items || []).map(toCalendarItem),
      storySequences: (day.storySequences || []).map((sequence: any) => ({
        ...sequence,
        date: sequence.date ? new Date(sequence.date) : undefined,
      })),
    })),
  };
}

export const editorialService = {
  listProjects: async (): Promise<ProjectCardDTO[]> => {
    const response = await localClient.get('/editorial/projects');
    return response.data.map((project: any) => ({
      ...project,
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined,
    }));
  },

  createProject: async (data: ProjectCreateDTO): Promise<ProjectCardDTO> => {
    const response = await localClient.post('/editorial/projects', data);
    return {
      ...response.data,
      updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined,
    };
  },

  listVersions: async (projectId: string): Promise<EditorialVersionDTO[]> => {
    const response = await localClient.get(`/editorial/projects/${projectId}/versions`);
    return response.data.map(toVersion);
  },

  submitOnboarding: async (
    projectId: string,
    data: OnboardingFormDTO,
  ): Promise<{ version: EditorialVersionDTO; mapa: EditorialMapaDTO }> => {
    const response = await localClient.post(`/editorial/projects/${projectId}/onboarding`, data);
    return {
      version: toVersion(response.data.version),
      mapa: response.data.mapa,
    };
  },

  getMapa: async (versionId: string): Promise<EditorialMapaDTO> => {
    const response = await localClient.get(`/editorial/versions/${versionId}/mapa`);
    return response.data;
  },

  duplicateVersion: async (versionId: string): Promise<EditorialVersionDTO> => {
    const response = await localClient.post(`/editorial/versions/${versionId}/duplicate`);
    return toVersion(response.data);
  },

  updateVersion: async (
    versionId: string,
    patch: EditorialVersionUpdateDTO,
  ): Promise<EditorialVersionDTO> => {
    const response = await localClient.patch(`/editorial/versions/${versionId}`, patch);
    return toVersion(response.data);
  },

  listCalendars: async (projectId: string): Promise<EditorialCalendar[]> => {
    const response = await localClient.get(`/editorial/projects/${projectId}/calendars`);
    return response.data.map(toCalendar);
  },

  createCalendar: async (projectId: string, data: CalendarSetup): Promise<EditorialCalendar> => {
    const response = await localClient.post(`/editorial/projects/${projectId}/calendars`, data);
    return toCalendar(response.data);
  },

  getCalendar: async (calendarId: string): Promise<EditorialCalendar> => {
    const response = await localClient.get(`/editorial/calendars/${calendarId}`);
    return toCalendar(response.data);
  },

  updateCalendar: async (
    calendarId: string,
    patch: CalendarPatch,
  ): Promise<EditorialCalendar> => {
    const response = await localClient.patch(`/editorial/calendars/${calendarId}`, patch);
    return toCalendar(response.data);
  },

  duplicateCalendar: async (
    calendarId: string,
    period?: CalendarDuplicate,
  ): Promise<EditorialCalendar> => {
    const response = await localClient.post(
      `/editorial/calendars/${calendarId}/duplicate`,
      period || {},
    );
    return toCalendar(response.data);
  },

  updateCalendarItem: async (
    calendarId: string,
    itemId: string,
    patch: CalendarItemUpdate,
  ): Promise<CalendarItem> => {
    const response = await localClient.patch(
      `/editorial/calendars/${calendarId}/items/${itemId}`,
      patch,
    );
    return toCalendarItem(response.data);
  },

  getCalendarReview: async (calendarId: string): Promise<ReviewSuggestion[]> => {
    const response = await localClient.get(`/editorial/calendars/${calendarId}/review`);
    return response.data;
  },
};