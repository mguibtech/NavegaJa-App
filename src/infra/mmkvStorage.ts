import {createMMKV} from 'react-native-mmkv';

const STORAGE_ID = 'navegaja-storage';

export const mmkvStorage = createMMKV({
  id: STORAGE_ID,
});

export const mmkvSyncStorage = {
  getItem: (key: string): string | null => mmkvStorage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    mmkvStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkvStorage.remove(key);
  },
};

export const mmkvAsyncStorage = {
  getItem: async (key: string): Promise<string | null> =>
    mmkvStorage.getString(key) ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    mmkvStorage.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    mmkvStorage.remove(key);
  },
  getAllKeys: async (): Promise<string[]> => mmkvStorage.getAllKeys(),
  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach(key => {
      mmkvStorage.remove(key);
    });
  },
};
