export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatarUrl?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  authProvider: 'LOCAL' | 'GOOGLE';
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn?: number;
  rememberMe?: boolean;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
