export const APP_NAME = 'codebase.ai';
export const APP_VERSION = '0.1.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  REPOSITORIES: '/dashboard/repos',
  CHAT: '/dashboard/chat',
  SETTINGS: '/dashboard/settings',
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  ACCESS_TOKEN: 'accessToken',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  REPOS: '/repos',
  CHATS: '/chats',
  MESSAGES: '/messages',
} as const;