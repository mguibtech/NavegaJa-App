import {api} from '@api';

class LogoutAPI {
  async execute(): Promise<void> {
    await api.post('/auth/logout');
  }
}

export const logoutAPI = new LogoutAPI();
