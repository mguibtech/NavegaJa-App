import {ViewStyle} from 'react-native';

import {createTheme} from '@shopify/restyle';

export const theme = createTheme({
  colors: {
    // Primárias — Encontro das Águas
    primary: '#0a6fbd',
    primaryMid: '#1B8EC2',
    primaryLight: '#3DA5D9',
    primaryBg: '#EDF6FB',

    // Verde — Floresta
    secondary: '#22874A',
    secondaryDark: '#1A6B3C',
    secondaryLight: '#A8E4BC',
    secondaryBg: '#E3F5E8',

    // Dourado — Pôr do Sol
    accent: '#E8960C',
    accentLight: '#FACC5F',
    accentBg: '#FFEAB5',

    // Status
    success: '#22874A',
    successBg: '#E3F5E8',
    warning: '#E8960C',
    warningBg: '#FFF4E5',
    danger: '#D63031',
    dangerBg: '#FDEAEA',
    info: '#1B8EC2',
    infoBg: '#EDF6FB',

    // Neutros
    text: '#0D1B2A',
    textSecondary: '#3D5468',
    textLight: '#7A8D9C',
    border: '#E2E8ED',
    background: '#f5f7f8',
    surface: '#FFFFFF',

    // Utilitários (para componentes)
    disabled: '#E2E8ED',
    disabledText: '#7A8D9C',
  },
  spacing: {
    s4: 4,
    s8: 8,
    s10: 10,
    s12: 12,
    s14: 14,
    s16: 16,
    s20: 20,
    s24: 24,
    s32: 32,
    s36: 36,
    s40: 40,
    s44: 44,
    s48: 48,
    s52: 52,
    s56: 56,
  },
  borderRadii: {
    s8: 8,
    s12: 12,
    s16: 16,
    s20: 20,
    s24: 24,
    s48: 48,
  },
  textVariants: {
    defaults: {},
  },
});

export const $shadowProps: ViewStyle = {
  elevation: 10,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: {width: 0, height: -3},
};

export type Theme = typeof theme;
export type ThemeColors = keyof Theme['colors'];
