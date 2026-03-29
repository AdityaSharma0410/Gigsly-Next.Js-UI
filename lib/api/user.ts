import apiClient from './client';
import type { User, UserStats, AuthResponse, LoginRequest, RegisterRequest } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/users/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/users/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Backend doesn't have logout endpoint, just clear cookies
    return Promise.resolve();
  },
};

export const userApi = {
  getProfile: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/users/${userId}`, data);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<UserStats> => {
    const response = await apiClient.get(`/api/users/${userId}/stats`);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },
};
