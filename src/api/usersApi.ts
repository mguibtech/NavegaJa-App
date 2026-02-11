import {UpdateProfileRequest, User} from '@types';

import {api} from './apiClient';

export const usersApi = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>('/users/profile', data);
    return response.data;
  },

  async updateAvatar(avatarUrl: string): Promise<User> {
    const response = await api.patch<User>('/users/avatar', {avatarUrl});
    return response.data;
  },

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.patch('/users/password', {currentPassword, newPassword});
  },
};
