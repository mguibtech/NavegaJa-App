import {authStorage} from '@services';

import {loginAPI} from './loginAPI';
import {loginAdapter} from './loginAdapter';
import {LoginRequest} from './loginTypes';
import {User} from '../User/userTypes';

async function execute(credentials: LoginRequest): Promise<User> {
  const response = await loginAPI.execute(credentials);
  const user = loginAdapter.toUser(response);
  const {token, refreshToken} = loginAdapter.toTokens(response);
  await authStorage.saveToken(token);
  await authStorage.saveRefreshToken(refreshToken);
  await authStorage.saveUser(user);
  return user;
}

export const loginService = {
  execute,
};
