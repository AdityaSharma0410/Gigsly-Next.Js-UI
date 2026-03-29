import apiClient from './client';
import type { Task, CreateTaskRequest, PaginatedResponse } from './types';
import type { SpringPage } from './types';

function normalizePage<T>(data: SpringPage<T> & { page?: number }): PaginatedResponse<T> {
  return {
    content: data.content ?? [],
    page: data.number ?? data.page ?? 0,
    size: data.size ?? 0,
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    last: data.last ?? true,
  };
}

export const taskApi = {
  browse: async (params: {
    categoryId?: number;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    isRemote?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Task>> => {
    const { sortDirection, ...rest } = params;
    const response = await apiClient.get<SpringPage<Task>>('/api/tasks/browse', {
      params: {
        ...rest,
        sortDir: sortDirection ?? 'DESC',
      },
    });
    return normalizePage(response.data);
  },

  search: async (params: {
    keyword: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Task>> => {
    const response = await apiClient.get<SpringPage<Task>>('/api/tasks/search', { params });
    return normalizePage(response.data);
  },

  getFeatured: async (params: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Task>> => {
    const response = await apiClient.get<SpringPage<Task>>('/api/tasks/featured', { params });
    return normalizePage(response.data);
  },

  getTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/api/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>('/api/tasks', data);
    return response.data;
  },

  /** Current user's gigs (client) or assigned work (professional) */
  getMine: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/api/tasks/mine');
    return response.data;
  },

  assignProfessional: async (taskId: number, professionalId: number): Promise<Task> => {
    const response = await apiClient.post<Task>(`/api/tasks/${taskId}/assign`, {
      professionalId,
    });
    return response.data;
  },
};
