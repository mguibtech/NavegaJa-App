import {authStorage} from '@services';

import {logoutAPI} from './logoutAPI';

async function execute(): Promise<void> {
  try {
    await logoutAPI.execute();
  } catch {
    // Ignore API error — logout locally even if server fails
  }
  await authStorage.clear();
}

export const logoutService = {
  execute,
};
