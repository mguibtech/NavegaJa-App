import {UserRole} from './User/userTypes';

/**
 * DTO para registro de novo usuário
 */
export interface RegisterDto {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: UserRole;
  cpf?: string;
  referralCode?: string;
}

/**
 * DTO para login
 */
export interface LoginDto {
  phone: string;
  password: string;
}

/**
 * DTO para refresh token
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * DTO para esqueci minha senha
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * DTO para resetar senha
 */
export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Response de autenticação (login/register)
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole | 'passenger' | 'captain' | 'admin';
    cpf?: string;
    avatarUrl?: string;
    rating: number;
    totalTrips: number;
    totalPoints: number;
    level: string;
    referralCode?: string;
    createdAt: string;
    updatedAt: string;
  };
}
