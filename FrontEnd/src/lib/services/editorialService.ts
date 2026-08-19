// src/lib/services/editorialService.ts
import axios from 'axios';
import {
  EditorialMapaDTO,
  EditorialVersionDTO,
  EditorialVersionUpdateDTO,
  OnboardingFormDTO,
  ProjectCardDTO,
  ProjectCreateDTO,
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
};