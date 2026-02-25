import {api} from '@api';

import {UpdatePasswordData, UpdateProfileData, User} from './userTypes';

async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response;
}

async function getProfile(): Promise<User> {
  const response = await api.get<User>('/users/profile');
  return response;
}

async function getById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response;
}

async function updateProfile(data: UpdateProfileData): Promise<User> {
  const response = await api.patch<User>('/users/profile', data);
  return response;
}

async function updateAvatar(avatarUrl: string): Promise<User> {
  const response = await api.patch<User>('/users/profile', {avatarUrl});
  return response;
}

async function updatePassword(data: UpdatePasswordData): Promise<void> {
  await api.patch('/users/password', data);
}

export const userAPI = {
  getMe,
  getProfile,
  getById,
  updateProfile,
  updateAvatar,
  updatePassword,
};
