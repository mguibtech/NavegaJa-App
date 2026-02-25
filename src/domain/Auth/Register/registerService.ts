import {authStorage} from '@services';

import {registerAPI} from './registerAPI';
import {registerAdapter} from './registerAdapter';
import {RegisterRequest} from './registerTypes';
import {User} from '../User/userTypes';

async function execute(data: RegisterRequest): Promise<User> {
  const response = await registerAPI.execute(data);
  const user = registerAdapter.toUser(response);
  const {token, refreshToken} = registerAdapter.toTokens(response);
  await authStorage.saveToken(token);
  await authStorage.saveRefreshToken(refreshToken);
  await authStorage.saveUser(user);
  return user;
}

export const registerService = {
  execute,
};
