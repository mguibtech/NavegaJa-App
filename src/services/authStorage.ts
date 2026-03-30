import AsyncStorage from '@infra/storage';
import * as Keychain from 'react-native-keychain';

const USER_KEY = '@navegaja:user';

const KEYCHAIN_SERVICE_TOKEN = 'navegaja.token';
const KEYCHAIN_SERVICE_REFRESH = 'navegaja.refreshToken';

export const authStorage = {
  // ─── Token (JWT) — armazenado de forma segura no Keychain ─────────────────

  async saveToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('token', token, {
      service: KEYCHAIN_SERVICE_TOKEN,
    });
  },

  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE_TOKEN,
    });
    return credentials ? credentials.password : null;
  },

  async removeToken(): Promise<void> {
    await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE_TOKEN});
  },

  // ─── Refresh Token — armazenado de forma segura no Keychain ───────────────

  async saveRefreshToken(refreshToken: string): Promise<void> {
    await Keychain.setGenericPassword('refreshToken', refreshToken, {
      service: KEYCHAIN_SERVICE_REFRESH,
    });
  },

  async getRefreshToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE_REFRESH,
    });
    return credentials ? credentials.password : null;
  },

  async removeRefreshToken(): Promise<void> {
    await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE_REFRESH});
  },

  // ─── User (dados não-sensíveis) — AsyncStorage ────────────────────────────

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

  // ─── Clear all ─────────────────────────────────────────────────────────────

  async clear(): Promise<void> {
    await Promise.all([
      Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE_TOKEN}),
      Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE_REFRESH}),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },
};
