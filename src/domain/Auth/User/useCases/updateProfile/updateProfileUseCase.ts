import {api} from '@api';

import {UpdateProfileData, User} from '../../userTypes';

export async function updateProfileUseCase(
  data: UpdateProfileData,
): Promise<User> {
  const response = await api.patch<User>('/users/profile', data);
  return response;
}
