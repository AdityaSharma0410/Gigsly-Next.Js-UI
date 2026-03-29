import apiClient from './client';
import type { Proposal, CreateProposalRequest } from './types';

export const proposalApi = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/api/proposals');
    return response.data;
  },

  getMine: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/api/proposals/mine');
    return response.data;
  },

  getByTask: async (taskId: number): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>(`/api/proposals/task/${taskId}`);
    return response.data;
  },

  getByProfessional: async (professionalId: number): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/api/proposals', {
      params: { professionalId },
    });
    return response.data;
  },

  create: async (data: CreateProposalRequest): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>('/api/proposals', data);
    return response.data;
  },

  updateStatus: async (
    proposalId: number,
    status: 'ACCEPTED' | 'REJECTED' | 'PENDING'
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(`/api/proposals/${proposalId}/status`, {
      status,
    });
    return response.data;
  },

  accept: async (proposalId: number): Promise<Proposal> => {
    return proposalApi.updateStatus(proposalId, 'ACCEPTED');
  },

  reject: async (proposalId: number): Promise<Proposal> => {
    return proposalApi.updateStatus(proposalId, 'REJECTED');
  },
};
