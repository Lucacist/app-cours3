export type UserRole = 'admin' | 'user';

export type User = {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  created_at?: string;
};

export type Container = {
  id: number;
  title: string;
  created_at: string;
};

export type Course = {
  id: number;
  container_id: number;
  title: string;
  link: string;
  is_locked: boolean;
};
