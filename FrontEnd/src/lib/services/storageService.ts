import axios from 'axios';
import imageCompression from 'browser-image-compression';

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

export async function uploadAssetToR2(
  file: File,
  metadata?: Record<string, unknown>,
): Promise<{ fileUrl: string; asset?: any }> {
  try {
    let fileToUpload = file;

    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    }

    const authResponse = await localClient.post('/storage/presigned-url', {
      fileName: fileToUpload.name,
      fileType: fileToUpload.type || 'application/octet-stream',
      sizeBytes: fileToUpload.size,
    });

    const { uploadUrl, fileUrl } = authResponse.data.data;

    await axios.put(uploadUrl, fileToUpload, {
      headers: {
        'Content-Type': fileToUpload.type || 'application/octet-stream',
      },
    });

    const confirmRes = await localClient.post('/storage/confirm-upload', {
      fileUrl,
      fileName: fileToUpload.name,
      mimeType: fileToUpload.type || 'application/octet-stream',
      sizeBytes: fileToUpload.size,
      ...metadata,
    });

    return {
      fileUrl,
      asset: confirmRes.data?.data ?? confirmRes.data,
    };
  } catch (error: unknown) {
    console.error('Erro no serviço central de upload:', error);

    if (
      axios.isAxiosError<{ message?: string }>(error) &&
      error.response?.data?.message
    ) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Falha ao processar o upload do arquivo.');
  }
}

export async function uploadFileToR2(
  file: File,
  metadata?: Record<string, unknown>,
): Promise<string> {
  const { fileUrl } = await uploadAssetToR2(file, metadata);
  return fileUrl;
}

export const storageService = {
  getAssets: async (): Promise<{ storageUsed: number; assets: any[] }> => {
    const response = await localClient.get('/storage/assets');
    return response.data?.data ?? response.data ?? { storageUsed: 0, assets: [] };
  },

  createAsset: async (data: Record<string, unknown>) => {
    const response = await localClient.post('/storage/assets', data);
    return response.data?.data ?? response.data;
  },

  updateAsset: async (id: string, data: Record<string, unknown>) => {
    const response = await localClient.patch(`/storage/assets/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteAsset: async (id: string) => {
    const response = await localClient.delete(`/storage/assets/${id}`);
    return response.data?.data ?? response.data;
  },

  uploadAssetWithFile: uploadAssetToR2,
};
