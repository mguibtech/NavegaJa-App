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
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
