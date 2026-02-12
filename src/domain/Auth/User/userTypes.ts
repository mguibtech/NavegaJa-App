export enum UserRole {
  PASSENGER = 'passenger',
  CAPTAIN = 'captain',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole | 'passenger' | 'captain' | 'admin';
  cpf?: string | null;
  avatarUrl?: string | null;
  rating: string | number; // Backend retorna como string
  totalTrips: number;
  totalPoints: number;
  level: string;
  referralCode?: string | null;
  resetCode?: string | null;
  resetCodeExpires?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}
