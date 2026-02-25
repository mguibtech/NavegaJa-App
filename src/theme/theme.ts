import {ViewStyle} from 'react-native';

import {createTheme} from '@shopify/restyle';

export const theme = createTheme({
  colors: {
    // Primárias — Encontro das Águas (Rio Negro + Rio Solimões)
    primary: '#0B5D8A',
    primaryMid: '#1B7BA8',
    primaryLight: '#3DA5D9',
    primaryBg: '#EDF6FB',

    // Verde — Floresta Amazônica
    secondary: '#22874A',
    secondaryDark: '#1A6B3C',
    secondaryLight: '#A8E4BC',
    secondaryBg: '#E3F5E8',

    // Dourado — Pôr do Sol no Rio
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
    info: '#0B5D8A',
    infoBg: '#EDF6FB',

    // Neutros
    text: '#0D1B2A',
    textSecondary: '#3D5468',
    textLight: '#7A8D9C',
    border: '#E2E8ED',
    background: '#F5F7F8',
    surface: '#FFFFFF',

    // Utilitários (para componentes)
    disabled: '#E2E8ED',
    disabledText: '#7A8D9C',
  },
  spacing: {
    s4: 4,
    s6: 6,
    s8: 8,
    s10: 10,
    s12: 12,
    s14: 14,
    s16: 16,
    s20: 20,
    s24: 24,
    s28: 28,
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
    defaults: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: 'text',
    },
    headingLarge: {
      fontFamily: 'Inter-Bold',
      fontSize: 32,
      lineHeight: 40,
      color: 'text',
    },
    headingMedium: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      lineHeight: 32,
      color: 'text',
    },
    headingSmall: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 20,
      lineHeight: 28,
      color: 'text',
    },
    paragraphLarge: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      lineHeight: 28,
      color: 'text',
    },
    paragraphMedium: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: 'text',
    },
    paragraphSmall: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: 'text',
    },
    paragraphCaption: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      lineHeight: 16,
      color: 'textSecondary',
    },
    paragraphCaptionSmall: {
      fontFamily: 'Inter-Regular',
      fontSize: 10,
      lineHeight: 14,
      color: 'textSecondary',
    },
  },
});

export const $shadowProps: ViewStyle = {
  elevation: 10,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: {width: 0, height: -3},
};

// Tema escuro — "Rio Negro de Noite"
export const darkTheme = {
  ...theme,
  colors: {
    // Primárias — mais luminosas no fundo escuro
    primary: '#3DA5D9',
    primaryMid: '#5BBDE8',
    primaryLight: '#A8D8F0',
    primaryBg: '#0A2030',

    // Verde — Floresta à noite
    secondary: '#3CB56A',
    secondaryDark: '#22874A',
    secondaryLight: '#A8E4BC',
    secondaryBg: '#0A1F12',

    // Dourado — Pôr do Sol
    accent: '#F0A42C',
    accentLight: '#FACC5F',
    accentBg: '#231602',

    // Status
    success: '#3CB56A',
    successBg: '#0A1F12',
    warning: '#F0A42C',
    warningBg: '#231602',
    danger: '#E05252',
    dangerBg: '#230A0A',
    info: '#3DA5D9',
    infoBg: '#0A2030',

    // Neutros — "Rio Negro de Noite"
    text: '#E0EAF2',
    textSecondary: '#8AA4B8',
    textLight: '#5C7A8E',
    border: '#1C3040',
    background: '#090F18',
    surface: '#0D1A28',

    // Utilitários
    disabled: '#1C3040',
    disabledText: '#5C7A8E',
  } as typeof theme.colors,
};

export type Theme = typeof theme;
export type ThemeColors = keyof Theme['colors'];
