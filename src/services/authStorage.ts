import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@navegaja:token';
const REFRESH_TOKEN_KEY = '@navegaja:refreshToken';
const USER_KEY = '@navegaja:user';

export const authStorage = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async saveRefreshToken(refreshToken: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async removeRefreshToken(): Promise<void> {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async saveUser(user: object): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser<T = object>(): Promise<T | null> {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },
};
