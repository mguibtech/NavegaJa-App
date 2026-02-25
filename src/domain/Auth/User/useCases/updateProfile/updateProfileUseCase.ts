import {userService} from '../../userService';
import {UpdateProfileData, User} from '../../userTypes';

export async function updateProfileUseCase(
  data: UpdateProfileData,
): Promise<User> {
  return userService.updateProfile(data);
}
