import {useAuthStore} from '@store';

import {userAPI} from './userAPI';
import {UpdatePasswordData, UpdateProfileData, User} from './userTypes';

async function updateProfile(data: UpdateProfileData): Promise<User> {
  const response = await userAPI.updateProfile(data);
  // PATCH /users/profile doesn't return capabilities/rejectionReason — preserve from store
  const currentUser = useAuthStore.getState().user;
  return {
    ...response,
    capabilities:
      response.capabilities !== undefined
        ? response.capabilities
        : (currentUser?.capabilities ?? null),
    rejectionReason:
      response.rejectionReason !== undefined
        ? response.rejectionReason
        : (currentUser?.rejectionReason ?? null),
  };
}

async function updateAvatar(avatarUrl: string): Promise<User> {
  return userAPI.updateAvatar(avatarUrl);
}

async function updatePassword(data: UpdatePasswordData): Promise<void> {
  return userAPI.updatePassword(data);
}

async function getMe(): Promise<User> {
  return userAPI.getMe();
}

export const userService = {
  updateProfile,
  updateAvatar,
  updatePassword,
  getMe,
};
