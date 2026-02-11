export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
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
