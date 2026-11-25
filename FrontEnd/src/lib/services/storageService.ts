import axios from "axios";
import imageCompression from 'browser-image-compression';

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

export async function uploadFileToR2(file: File, brandId?: string): Promise<string> {
  try {
    let fileToUpload = file;

    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      console.log(`Comprimindo imagem... Tamanho original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      fileToUpload = await imageCompression(file, options);
      console.log(`Imagem comprimida! Novo tamanho: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
    }

    const authResponse = await localClient.post('/storage/presigned-url', {
      fileName: fileToUpload.name,
      fileType: fileToUpload.type,
      sizeBytes: fileToUpload.size,
      ...(brandId ? { brandId } : {}),
    });

    const { uploadUrl, fileUrl } = authResponse.data.data;

    await axios.put(uploadUrl, fileToUpload, {
      headers: {
        'Content-Type': fileToUpload.type,
      },
    });

    await localClient.post('/storage/confirm-upload', {
      fileUrl: fileUrl,
      fileName: fileToUpload.name,
      mimeType: fileToUpload.type,
      sizeBytes: fileToUpload.size,
      ...(brandId ? { brandId } : {}),
    });

    return fileUrl;

  } catch (error: unknown) {
    console.error("Erro no serviço central de upload:", error);

    if (
      axios.isAxiosError<{ message?: string }>(error) &&
      error.response?.data?.message
    ) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Falha ao processar o upload do arquivo.");
  }
}