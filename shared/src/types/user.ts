export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'local';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  name: string;
  password?: string;
  provider?: 'local';
  avatar?: string;
}