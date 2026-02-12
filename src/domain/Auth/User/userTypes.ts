export enum UserRole {
  PASSENGER = 'passenger',
  CAPTAIN = 'captain',
  ADMIN = 'admin',
}

export interface User {
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
