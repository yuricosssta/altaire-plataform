import axios from 'axios';
import { IBrand, IBrandStory, IUsableStory } from '@/types/company';

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

export const apiListCompanyBrands = async (
  companyId: string,
): Promise<IBrand[]> => {
  const response = await localClient.get(`/companies/${companyId}/brands`);
  return response.data;
};

export const apiCreateCompanyBrand = async (
  companyId: string,
  data: {
    name: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    niche?: string;
  },
): Promise<IBrand> => {
  const response = await localClient.post(`/companies/${companyId}/brands`, data);
  return response.data;
};

export const apiGetBrand = async (brandId: string): Promise<IBrand> => {
  const response = await localClient.get(`/brands/${brandId}`);
  return response.data;
};

export const apiUpdateBrand = async (
  brandId: string,
  data: {
    name?: string;
    description?: string;
    logoUrl?: string;
    niche?: string;
  },
): Promise<IBrand> => {
  const response = await localClient.patch(`/brands/${brandId}`, data);
  return response.data;
};

export const apiDeleteBrand = async (brandId: string) => {
  const response = await localClient.delete(`/brands/${brandId}`);
  return response.data;
};

export const apiGetBrandStory = async (brandId: string): Promise<IBrandStory> => {
  const response = await localClient.get(`/brands/${brandId}/brand-story`);
  return response.data;
};

export const apiUpsertBrandStory = async (
  brandId: string,
  data: {
    originStory?: string;
    keyTurnarounds?: string[];
    failures?: string[];
    achievements?: string[];
    values?: string[];
    lifestyle?: string;
    usableStories?: IUsableStory[];
  },
): Promise<IBrandStory> => {
  const response = await localClient.put(`/brands/${brandId}/brand-story`, data);
  return response.data;
};
