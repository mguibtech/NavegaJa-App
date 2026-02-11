import {api} from '@api';

import {User} from './userTypes';

class UserAPI {
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
}

export const userAPI = new UserAPI();
