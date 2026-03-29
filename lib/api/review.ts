import apiClient from './client';
import type { Review, AverageRatingResponse, CreateReviewRequest, PaginatedResponse } from './types';
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

export const reviewApi = {
  getAll: async (): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>('/api/reviews');
    return response.data;
  },

  getByUser: async (
    userId: number,
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<SpringPage<Review>>(`/api/reviews/user/${userId}`, {
      params: {
        ...params,
        sortDirection: params.sortDirection,
      },
    });
    return normalizePage(response.data);
  },

  getByTask: async (taskId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/api/reviews/task/${taskId}`);
    return response.data;
  },

  getAverageRating: async (userId: number): Promise<AverageRatingResponse> => {
    const response = await apiClient.get<AverageRatingResponse>(`/api/reviews/user/${userId}/average`);
    return response.data;
  },

  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<Review>('/api/reviews', data);
    return response.data;
  },

  delete: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  },
};
