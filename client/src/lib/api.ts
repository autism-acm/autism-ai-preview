import { apiRequest } from './queryClient';

export interface SessionInfo {
  tier: string;
  tokenBalance: number;
  walletAddress?: string | null;
  messageLimit: {
    remaining: number;
    limit: number;
    resetTime: Date;
  };
  voiceLimit: {
    remaining: number;
    limit: number;
    resetTime: Date;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  isImage: boolean;
  imageUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  conversation: Conversation;
  userMessage: Message;
  aiMessage: Message;
  rateLimit: {
    remaining: number;
    limit: number;
    resetTime: Date;
  };
}

export interface VoiceGenerationResponse {
  audioUrl: string;
  secureToken: string;
  duration?: number;
  voiceLimit: {
    remaining: number;
    limit: number;
    resetTime: Date;
  };
}

export const api = {
  session: {
    get: async (): Promise<SessionInfo> => {
      const response = await fetch('/api/session', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to get session');
      return response.json();
    },
  },

  wallet: {
    connect: async (walletAddress: string) => {
      return apiRequest('/api/wallet/connect', {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      });
    },

    disconnect: async () => {
      return apiRequest('/api/wallet/disconnect', {
        method: 'POST',
      });
    },
  },

  conversations: {
    list: async (): Promise<Conversation[]> => {
      const response = await fetch('/api/conversations', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to get conversations');
      return response.json();
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get messages');
      return response.json();
    },
  },

  messages: {
    send: async (
      content: string,
      conversationId?: string,
      requestImage = false
    ): Promise<SendMessageResponse> => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content, conversationId, requestImage }),
      });
    },
  },

  voice: {
    generate: async (
      text: string,
      conversationId?: string,
      messageId?: string
    ): Promise<VoiceGenerationResponse> => {
      return apiRequest('/api/voice/generate', {
        method: 'POST',
        body: JSON.stringify({ text, conversationId, messageId }),
      });
    },
  },

  admin: {
    login: async (username: string, password: string) => {
      return apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },

    getAudio: async (sessionId?: string, conversationId?: string) => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (conversationId) params.append('conversationId', conversationId);
      
      const response = await fetch(`/api/admin/audio?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get audio');
      return response.json();
    },

    getWebhooks: async (limit = 100) => {
      const response = await fetch(`/api/admin/webhooks?limit=${limit}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get webhooks');
      return response.json();
    },
  },
};
