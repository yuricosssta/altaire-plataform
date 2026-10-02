// src/lib/services/userService.ts
import http from '@/lib/http';

export const apiUpdateProfile = async (userId: string, name: string) => {
  try {
    const response = await http.put(`/users/${userId}`, { name });
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: Record<string, unknown> } };
    throw axiosError.response?.data || { message: 'Erro ao atualizar perfil' };
  }
};

export const apiChangePassword = async (passwords: Record<string, unknown>) => {
  try {
    const response = await http.post(`/users/change-password`, passwords);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: Record<string, unknown> } };
    throw axiosError.response?.data || { message: 'Erro ao alterar a senha' };
  }
};