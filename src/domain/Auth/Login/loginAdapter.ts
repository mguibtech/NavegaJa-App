import {LoginResponse} from './loginTypes';
import {User} from '../User/userTypes';

/**
 * Adapta a resposta da API para o formato da aplicação
 */
export const loginAdapter = {
  toUser(response: LoginResponse): User {
    return {
      id: response.user.id,
      name: response.user.name,
      phone: response.user.phone,
      email: response.user.email,
      role: response.user.role as User['role'],
      cpf: response.user.cpf,
      avatarUrl: response.user.avatarUrl,
      isVerified: response.user.isVerified,
      city: response.user.city,
      state: response.user.state,
      licensePhotoUrl: response.user.licensePhotoUrl,
      certificatePhotoUrl: response.user.certificatePhotoUrl,
      capabilities: response.user.capabilities ?? null,
      rating: response.user.rating,
      totalTrips: response.user.totalTrips,
      totalPoints: response.user.totalPoints,
      level: response.user.level,
      referralCode: response.user.referralCode,
      isActive: response.user.isActive ?? true,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
    };
  },

  toTokens(response: LoginResponse) {
    return {
      token: response.accessToken,
      refreshToken: response.refreshToken,
    };
  },
};
