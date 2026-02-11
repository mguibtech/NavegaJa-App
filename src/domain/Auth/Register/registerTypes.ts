export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  role: 'passenger' | 'captain';
  email?: string;
  cpf?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    cpf?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}
