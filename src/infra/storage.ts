import {mmkvStorage} from './mmkvStorage';

type KeyValuePair = [string, string | null];

const storage = {
  async getItem(key: string): Promise<string | null> {
    return mmkvStorage.getString(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    mmkvStorage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    mmkvStorage.remove(key);
  },

  async getAllKeys(): Promise<string[]> {
    return mmkvStorage.getAllKeys();
  },

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => {
      mmkvStorage.remove(key);
    });
  },

  async clear(): Promise<void> {
    mmkvStorage.clearAll();
  },

  async multiGet(keys: string[]): Promise<KeyValuePair[]> {
    return keys.map(key => [key, mmkvStorage.getString(key) ?? null]);
  },

  async multiSet(entries: Array<[string, string]>): Promise<void> {
    entries.forEach(([key, value]) => {
      mmkvStorage.set(key, value);
    });
  },
};

export default storage;
