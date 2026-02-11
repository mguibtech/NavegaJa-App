import {RegisterResponse} from './registerTypes';
import {User} from '../User/userTypes';

export const registerAdapter = {
  toUser(response: RegisterResponse): User {
    return {
      id: response.user.id,
      name: response.user.name,
      phone: response.user.phone,
      email: response.user.email,
      role: response.user.role as User['role'],
      cpf: response.user.cpf,
      isVerified: response.user.isVerified,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
    };
  },

  toTokens(response: RegisterResponse) {
    return {
      token: response.accessToken,
      refreshToken: response.refreshToken,
    };
  },
};
