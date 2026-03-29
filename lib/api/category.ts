import apiClient from './client';
import type { Category } from './types';

export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/api/categories', { timeout: 3000 });
      return response.data;
    } catch (error) {
      // Return empty array if API is unavailable
      console.warn('Category API unavailable, using empty data');
      return [];
    }
  },

  // Get category by ID
  getById: async (categoryId: number): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/${categoryId}`);
    return response.data;
  },

  // Create category (admin)
  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  // Update category (admin)
  update: async (categoryId: number, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/api/categories/${categoryId}`, data);
    return response.data;
  },

  // Delete category (admin)
  delete: async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${categoryId}`);
  },
};
