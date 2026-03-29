import apiClient from './client';
import type { Proposal, CreateProposalRequest } from './types';

export const proposalApi = {
  // Get all proposals (admin)
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get('/api/proposals');
    return response.data;
  },

  // Get proposals for a task
  getByTask: async (taskId: number): Promise<Proposal[]> => {
    const response = await apiClient.get(`/api/proposals/task/${taskId}`);
    return response.data;
  },

  // Get proposals by professional
  getByProfessional: async (professionalId: number): Promise<Proposal[]> => {
    const response = await apiClient.get(`/api/proposals/professional/${professionalId}`);
    return response.data;
  },

  // Create proposal
  create: async (data: CreateProposalRequest): Promise<Proposal> => {
    const response = await apiClient.post('/api/proposals', data);
    return response.data;
  },

  // Accept proposal
  accept: async (proposalId: number): Promise<Proposal> => {
    const response = await apiClient.put(`/api/proposals/${proposalId}/accept`);
    return response.data;
  },

  // Reject proposal
  reject: async (proposalId: number): Promise<Proposal> => {
    const response = await apiClient.put(`/api/proposals/${proposalId}/reject`);
    return response.data;
  },

  // Delete proposal
  delete: async (proposalId: number): Promise<void> => {
    await apiClient.delete(`/api/proposals/${proposalId}`);
  },
};
