import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@navegaja:themeMode';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>(set => ({
  themeMode: 'system',

  setThemeMode: async (mode: ThemeMode) => {
    await AsyncStorage.setItem(THEME_KEY, mode);
    set({themeMode: mode});
  },

  loadTheme: async () => {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      set({themeMode: stored});
    }
  },
}));
