export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'passenger' | 'captain';
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
