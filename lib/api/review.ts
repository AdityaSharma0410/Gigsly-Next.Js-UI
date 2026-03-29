import apiClient from './client';
import type { Review, AverageRatingResponse, CreateReviewRequest, PaginatedResponse } from './types';

export const reviewApi = {
  // Get all reviews (admin)
  getAll: async (): Promise<Review[]> => {
    const response = await apiClient.get('/api/reviews');
    return response.data;
  },

  // Get reviews for user (paginated)
  getByUser: async (userId: number, params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get(`/api/reviews/user/${userId}`, { params });
    return response.data;
  },

  // Get reviews for task
  getByTask: async (taskId: number): Promise<Review[]> => {
    const response = await apiClient.get(`/api/reviews/task/${taskId}`);
    return response.data;
  },

  // Get average rating for user
  getAverageRating: async (userId: number): Promise<AverageRatingResponse> => {
    const response = await apiClient.get(`/api/reviews/user/${userId}/average`);
    return response.data;
  },

  // Create review
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post('/api/reviews', data);
    return response.data;
  },

  // Delete review (admin)
  delete: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  },
};
