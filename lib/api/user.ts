import apiClient from './client';
import type { User, UserStats, AuthResponse, LoginRequest, RegisterRequest, ProfessionalProfileRequest } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/users/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/users/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/users/me');
    return response.data;
  },

  getProfile: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  updateProfessionalProfile: async (data: ProfessionalProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/api/users/me/profile', data);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>(`/api/users/${userId}/stats`);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users');
    return response.data;
  },

  getProfessionals: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users', {
      params: { role: 'PROFESSIONAL' },
    });
    return response.data;
  },

  updateUserStatus: async (
    userId: number,
    body: { isVerified: boolean; isActive: boolean }
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/api/users/${userId}/status`, body);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },
};
