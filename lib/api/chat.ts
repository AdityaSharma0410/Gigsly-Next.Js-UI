import apiClient from './client';
import type { ChatThread, Message, SendMessageRequest, PaginatedResponse } from './types';

export const chatApi = {
  // Get all threads for current user
  getThreads: async (): Promise<ChatThread[]> => {
    const response = await apiClient.get('/api/chat/threads');
    return response.data;
  },

  // Get or create thread with another user
  getOrCreateThread: async (otherUserId: number): Promise<ChatThread> => {
    const response = await apiClient.post('/api/chat/threads', { otherUserId });
    return response.data;
  },

  // Get messages in a thread (paginated)
  getMessages: async (threadId: number, params: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get(`/api/chat/threads/${threadId}/messages`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post('/api/chat/messages', data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (messageIds: number[]): Promise<void> => {
    await apiClient.post('/api/chat/messages/read', { messageIds });
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/api/chat/unread/count');
    return response.data;
  },
};
