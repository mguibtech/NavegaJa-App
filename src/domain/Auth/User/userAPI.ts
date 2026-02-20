import {api} from '@api';

import {UpdatePasswordData, UpdateProfileData, User} from './userTypes';

class UserAPI {
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response;
  }

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.patch<User>('/users/profile', data);
    return response;
  }

  async updateAvatar(avatarUrl: string): Promise<User> {
    const response = await api.patch<User>('/users/profile', {avatarUrl});
    return response;
  }

  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.patch('/users/password', data);
  }
}

export const userAPI = new UserAPI();
