import api from './api';

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    };
    accessToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { email, password, name });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },
};