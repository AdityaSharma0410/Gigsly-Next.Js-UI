import apiClient from './client';
import type { ChatThread, Message, SendMessageRequest } from './types';

export const chatApi = {
  getThreads: async (): Promise<ChatThread[]> => {
    const response = await apiClient.get<ChatThread[]>('/api/chat/threads');
    return response.data;
  },

  /** Create thread with another user (matches CreateThreadRequest) */
  createThread: async (otherUserId: number, taskId?: number, initialMessage?: string): Promise<ChatThread> => {
    const response = await apiClient.post<ChatThread>('/api/chat/threads', {
      otherUserId,
      taskId,
      initialMessage,
    });
    return response.data;
  },

  getOrCreateThread: async (otherUserId: number, taskId?: number): Promise<ChatThread> => {
    const response = await apiClient.post<ChatThread>(
      '/api/chat/threads/get-or-create',
      {},
      { params: { otherUserId, taskId } }
    );
    return response.data;
  },

  getMessages: async (threadId: number): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(`/api/chat/threads/${threadId}/messages`);
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>('/api/chat/messages', data);
    return response.data;
  },

  markThreadRead: async (threadId: number): Promise<void> => {
    await apiClient.post('/api/chat/messages/mark-read', { threadId });
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/api/chat/unread-count');
    return response.data;
  },
};
