import apiClient from './client';

export type ContactQueryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ContactQuery {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  queryType?: string;
  message: string;
  status: ContactQueryStatus;
  adminResponse?: string;
  respondedById?: number;
  respondedByName?: string;
  respondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const contactApi = {
  list: async (status?: ContactQueryStatus): Promise<ContactQuery[]> => {
    const response = await apiClient.get<ContactQuery[]>('/api/contact-queries', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  get: async (id: number): Promise<ContactQuery> => {
    const response = await apiClient.get<ContactQuery>(`/api/contact-queries/${id}`);
    return response.data;
  },
};
