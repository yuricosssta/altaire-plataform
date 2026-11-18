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

export const userService = {
  getProfile: async () => {
    const response = await localClient.get('/auth/profile');
    return response.data?.data ?? response.data;
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    displayRole?: string;
    editorialBio?: string;
    twoFactorEnabled?: boolean;
    preferences?: Record<string, unknown>;
    avatarUrl?: string;
  }) => {
    const response = await localClient.patch('/auth/profile', data);
    return response.data?.data ?? response.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await localClient.post('/auth/change-password', passwords);
    return response.data?.data ?? response.data;
  },
};

export const apiUpdateProfile = async (_userId: string, name: string) => {
  try {
    return await userService.updateProfile({ name });
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: Record<string, unknown> } };
    throw axiosError.response?.data || { message: 'Erro ao atualizar perfil' };
  }
};

export const apiChangePassword = async (passwords: Record<string, unknown>) => {
  try {
    return await userService.changePassword({
      currentPassword: String(passwords.currentPassword || ''),
      newPassword: String(passwords.newPassword || ''),
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: Record<string, unknown> } };
    throw axiosError.response?.data || { message: 'Erro ao alterar a senha' };
  }
};
