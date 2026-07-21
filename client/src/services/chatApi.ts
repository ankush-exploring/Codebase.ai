import api from './api';

export interface Chat {
  id: string;
  userId: string;
  repositoryId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: string;
  content: string;
  citations: unknown[];
  createdAt: string;
}

export const chatApi = {
  list: async () => {
    const res = await api.get('/chats');
    return res.data.data as Chat[];
  },

  create: async (repositoryId?: string, title?: string) => {
    const res = await api.post('/chats', { repositoryId, title });
    return res.data.data as Chat;
  },

  getMessages: async (chatId: string) => {
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data.data as ChatMessage[];
  },

  sendMessage: async function* (chatId: string, content: string) {
    const token = localStorage.getItem('accessToken');
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${API_BASE}/api/v1/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error('Failed to send message');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch { /* skip invalid JSON */ }
        }
      }
    }
  },

  delete: async (chatId: string) => {
    const res = await api.delete(`/chats/${chatId}`);
    return res.data;
  },
};