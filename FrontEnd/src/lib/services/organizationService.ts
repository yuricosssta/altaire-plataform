import axios from 'axios';

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

export const apiFetchMyOrganizations = async () => {
  try {
    const response = await localClient.get('/organizations/my-orgs');
    return response.data;
  } catch (err: any) {
    const apiError = err?.response?.data?.error;
    const msg =
      typeof apiError === 'string'
        ? apiError
        : apiError?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Erro ao conectar com o servidor';
    throw msg;
  }
};

export const apiCreateOrganization = async (name: string, acronym: string) => {
  try {
    const response = await localClient.post('/organizations', { name, acronym });
    return response.data;
  } catch (error: any) {
    const apiError = error?.response?.data?.error;
    const msg =
      typeof apiError === 'string'
        ? apiError
        : apiError?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Erro ao criar organização';
    throw msg;
  }
};

export const apiGetOrgMembers = async (orgId: string) => {
  const response = await localClient.get(`/organizations/${orgId}/members`);
  return response.data;
};

export const apiCreateOrgMember = async (orgId: string, memberData: any) => {
  const response = await localClient.post(`/organizations/${orgId}/members`, memberData);
  return response.data;
};

export const apiUpdateOrgMemberRole = async (
  orgId: string,
  memberId: string,
  role: string,
  extra?: {
    allowedProjects?: string[];
    permissions?: string[];
    functionId?: string | null;
  },
) => {
  const response = await localClient.patch(
    `/organizations/${orgId}/members/${memberId}/role`,
    {
      role,
      ...(extra?.allowedProjects !== undefined
        ? { allowedProjects: extra.allowedProjects }
        : {}),
      ...(extra?.permissions !== undefined
        ? { permissions: extra.permissions }
        : {}),
      ...(extra?.functionId !== undefined
        ? { functionId: extra.functionId }
        : {}),
    },
  );
  return response.data;
};

export const apiRemoveOrgMember = async (orgId: string, memberId: string) => {
  const response = await localClient.delete(`/organizations/${orgId}/members/${memberId}`);
  return response.data;
};

export const apiGetOrgFunctions = async (orgId: string) => {
  const response = await localClient.get(`/organizations/${orgId}/functions`);
  return response.data;
};

export const apiCreateOrgFunction = async (
  orgId: string,
  data: { name: string; description: string },
) => {
  const response = await localClient.post(`/organizations/${orgId}/functions`, data);
  return response.data;
};

export const apiUpdateOrgFunction = async (
  orgId: string,
  functionId: string,
  data: { name?: string; description?: string },
) => {
  const response = await localClient.patch(
    `/organizations/${orgId}/functions/${functionId}`,
    data,
  );
  return response.data;
};

export const apiDeleteOrgFunction = async (
  orgId: string,
  functionId: string,
) => {
  const response = await localClient.delete(
    `/organizations/${orgId}/functions/${functionId}`,
  );
  return response.data;
};