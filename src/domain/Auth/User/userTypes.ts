export interface CaptainCapabilities {
  isVerified: boolean;
  pendingVerification: boolean;
  canOperate: boolean;
  canCreateTrips: boolean;
  canConfirmPayments: boolean;
  canManageShipments: boolean;
}

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
  isActive: boolean;
  isVerified?: boolean;
  cpf?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
  state?: string | null;
  licensePhotoUrl?: string | null;
  certificatePhotoUrl?: string | null;
  capabilities?: CaptainCapabilities | null;
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
  city?: string;
  state?: string;
  licensePhotoUrl?: string;
  certificatePhotoUrl?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}
