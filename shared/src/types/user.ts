export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  name: string;
  password?: string;
  provider?: 'local' | 'google';
  providerId?: string;
  avatar?: string;
}