import apiClient from './client';

export interface AdminProfile {
  id: number;
  userId: number;
  userEmail?: string;
  fullName?: string;
  displayName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdminRequest {
  fullName: string;
  email: string;
  password: string;
  displayName?: string;
}

export const adminApi = {
  getMe: async (): Promise<AdminProfile> => {
    const response = await apiClient.get<AdminProfile>('/api/admin/me');
    return response.data;
  },

  createAdminUser: async (data: CreateAdminRequest): Promise<AdminProfile> => {
    const response = await apiClient.post<AdminProfile>('/api/admin/admins', data);
    return response.data;
  },

  promoteExistingUser: async (userId: number): Promise<AdminProfile> => {
    const response = await apiClient.post<AdminProfile>(`/api/admin/users/${userId}/promote`);
    return response.data;
  },
};
