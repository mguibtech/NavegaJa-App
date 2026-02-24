import {api} from '@api';
import {useAuthStore} from '@store';

import {UpdateProfileData, User} from '../../userTypes';

export async function updateProfileUseCase(
  data: UpdateProfileData,
): Promise<User> {
  const response = await api.patch<User>('/users/profile', data);

  // PATCH /users/profile não retorna capabilities nem rejectionReason.
  // Preservar os valores atuais do store para esses campos.
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
