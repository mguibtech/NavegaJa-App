import {api} from '@api';

async function execute(): Promise<void> {
  await api.post('/auth/logout');
}

export const logoutAPI = {
  execute,
};
