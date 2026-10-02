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
    throw err.response?.data || 'Erro ao conectar com o servidor';
  }
};

export const apiCreateOrganization = async (name: string, acronym: string) => {
  try {
    const response = await localClient.post('/organizations', { name, acronym });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || 'Erro ao criar organização';
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

export const apiUpdateOrgMemberRole = async (orgId: string, memberId: string, role: string) => {
  const response = await localClient.patch(`/organizations/${orgId}/members/${memberId}/role`, { role });
  return response.data;
};

export const apiRemoveOrgMember = async (orgId: string, memberId: string) => {
  const response = await localClient.delete(`/organizations/${orgId}/members/${memberId}`);
  return response.data;
};