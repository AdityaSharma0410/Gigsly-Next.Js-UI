import apiClient from './client';
import type { Task, CreateTaskRequest, PaginatedResponse } from './types';

export const taskApi = {
  // Browse gigs with filters
  browse: async (params: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Task>> => {
    try {
      const response = await apiClient.get('/api/tasks/browse', { 
        params,
        timeout: 5000 
      });
      return response.data;
    } catch (error) {
      console.warn('Browse tasks API unavailable, using empty data', error);
      return {
        content: [],
        page: params.page || 0,
        size: params.size || 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  // Search gigs by keyword
  search: async (params: {
    keyword: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Task>> => {
    try {
      const response = await apiClient.get('/api/tasks/search', { 
        params,
        timeout: 5000 
      });
      return response.data;
    } catch (error) {
      console.warn('Search tasks API unavailable, using empty data', error);
      return {
        content: [],
        page: params.page || 0,
        size: params.size || 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  // Get featured gigs
  getFeatured: async (params: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Task>> => {
    try {
      const response = await apiClient.get('/api/tasks/featured', { 
        params,
        timeout: 3000 
      });
      return response.data;
    } catch (error) {
      // Return empty paginated response if API is unavailable
      console.warn('Featured tasks API unavailable, using empty data');
      return {
        content: [],
        page: 0,
        size: params.size || 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  // Get single task
  getTask: async (taskId: number): Promise<Task> => {
    try {
      const response = await apiClient.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch task:', error);
      throw error; // Re-throw for detail pages to show error
    }
  },

  // Create task
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post('/api/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: number, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${taskId}`);
  },

  // Get tasks by client
  getClientTasks: async (clientId: number): Promise<Task[]> => {
    const response = await apiClient.get(`/api/tasks/client/${clientId}`);
    return response.data;
  },

  // Assign professional to task
  assignProfessional: async (taskId: number, professionalId: number): Promise<Task> => {
    const response = await apiClient.post(`/api/tasks/${taskId}/assign/${professionalId}`);
    return response.data;
  },
};
