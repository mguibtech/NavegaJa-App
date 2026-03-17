export interface CaptainCapabilities {
  isBoatManager?: boolean;
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
  BOAT_MANAGER = 'boat_manager',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole | 'passenger' | 'captain' | 'admin' | 'boat_manager';
  isActive: boolean;
  isVerified?: boolean;
  cpf?: string | null;
  avatarUrl?: string | null;
  gender?: 'M' | 'F' | 'other' | null;
  city?: string | null;
  state?: string | null;
  licensePhotoUrl?: string | null;
  certificatePhotoUrl?: string | null;
  capabilities?: CaptainCapabilities | null;
  rejectionReason?: string | null;
  // Location community
  homeCommunity?: string | null;
  homeMunicipio?: string | null;
  homeLat?: number | string | null;
  homeLng?: number | string | null;
  locationUpdatedAt?: string | null;
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
  gender?: 'M' | 'F' | 'other' | null;
  licensePhotoUrl?: string;
  certificatePhotoUrl?: string;
  homeCommunity?: string | null;
  homeMunicipio?: string | null;
  homeLat?: number | null;
  homeLng?: number | null;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}
