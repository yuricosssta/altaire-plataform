import axios from 'axios';
import {
  ICompany,
  ICompanyFunction,
  ICompanyMember,
  ICompanySettings,
  ICompanyWithAccess,
} from '@/types/company';
import { RoleType } from '@/types/organization';

const localClient = axios.create({ baseURL: '/api' });

localClient.interceptors.request.use(
  async (config) => {
    const { store } = await import('@/lib/redux/store');
    const state = store.getState();
    const token = state.auth?.token;
    const currentOrg = state.organizations?.currentOrganization;
    const currentCompany = state.companies?.currentCompany;

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

    if (currentCompany?._id) {
      config.headers['x-company-id'] = currentCompany._id;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

function extractErrorMessage(err: any, fallback: string): string {
  const apiError = err?.response?.data?.error;
  if (typeof apiError === 'string') return apiError;
  return (
    apiError?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export const apiFetchMyCompanies = async (): Promise<ICompanyWithAccess[]> => {
  try {
    const response = await localClient.get('/companies/my');
    return response.data;
  } catch (err: any) {
    throw extractErrorMessage(err, 'Erro ao carregar empresas.');
  }
};

export const apiCreateCompany = async (data: {
  name: string;
  acronym: string;
  slug?: string;
  cnpj?: string;
}): Promise<ICompany> => {
  try {
    const response = await localClient.post('/companies', data);
    return response.data;
  } catch (err: any) {
    throw extractErrorMessage(err, 'Erro ao criar empresa.');
  }
};

export const apiGetCompany = async (
  companyId: string,
): Promise<ICompanyWithAccess> => {
  const response = await localClient.get(`/companies/${companyId}`);
  return response.data;
};

export const apiUpdateCompany = async (
  companyId: string,
  data: { name?: string; acronym?: string; cnpj?: string; status?: string },
): Promise<ICompany> => {
  const response = await localClient.patch(`/companies/${companyId}`, data);
  return response.data;
};

export const apiUpdateCompanySettings = async (
  companyId: string,
  settings: ICompanySettings,
) => {
  const response = await localClient.patch(
    `/companies/${companyId}/settings`,
    settings,
  );
  return response.data;
};

export const apiDeleteCompany = async (companyId: string) => {
  const response = await localClient.delete(`/companies/${companyId}`);
  return response.data;
};

export const apiGetCompanyMembers = async (
  companyId: string,
): Promise<ICompanyMember[]> => {
  const response = await localClient.get(`/companies/${companyId}/members`);
  return response.data;
};

export const apiAddCompanyMember = async (
  companyId: string,
  memberData: {
    name?: string;
    email: string;
    password?: string;
    role?: Extract<RoleType, 'MEMBER' | 'CLIENT' | 'EXTERNAL'>;
    functionId?: string | null;
    brandIds?: string[];
    allowedProjects?: string[];
    permissions?: string[];
    additionalCompanyIds?: string[];
  },
) => {
  const response = await localClient.post(
    `/companies/${companyId}/members`,
    memberData,
  );
  return response.data;
};

export const apiUpdateCompanyMember = async (
  companyId: string,
  userId: string,
  data: {
    role?: Extract<RoleType, 'MEMBER' | 'CLIENT' | 'EXTERNAL'>;
    functionId?: string | null;
    brandIds?: string[];
    allowedProjects?: string[];
    permissions?: string[];
    additionalCompanyIds?: string[];
  },
) => {
  const response = await localClient.patch(
    `/companies/${companyId}/members/${userId}`,
    data,
  );
  return response.data;
};

export const apiRemoveCompanyMember = async (
  companyId: string,
  userId: string,
) => {
  const response = await localClient.delete(
    `/companies/${companyId}/members/${userId}`,
  );
  return response.data;
};

export const apiGetCompanyFunctions = async (
  companyId: string,
): Promise<ICompanyFunction[]> => {
  const response = await localClient.get(`/companies/${companyId}/functions`);
  return response.data;
};

export const apiCreateCompanyFunction = async (
  companyId: string,
  data: { name: string; description: string },
): Promise<ICompanyFunction> => {
  const response = await localClient.post(
    `/companies/${companyId}/functions`,
    data,
  );
  return response.data;
};

export const apiUpdateCompanyFunction = async (
  companyId: string,
  functionId: string,
  data: { name?: string; description?: string },
): Promise<ICompanyFunction> => {
  const response = await localClient.patch(
    `/companies/${companyId}/functions/${functionId}`,
    data,
  );
  return response.data;
};

export const apiDeleteCompanyFunction = async (
  companyId: string,
  functionId: string,
) => {
  const response = await localClient.delete(
    `/companies/${companyId}/functions/${functionId}`,
  );
  return response.data;
};
