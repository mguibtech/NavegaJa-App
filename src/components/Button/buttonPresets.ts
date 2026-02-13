import {ThemeColors} from '@theme';
import {TouchableOpacityBoxProps} from '@components';

import {ButtonPreset} from './Button';

interface ButtonUi {
  container: TouchableOpacityBoxProps;
  content: ThemeColors;
}

export const buttonPresets: Record<
  ButtonPreset,
  {
    default: ButtonUi;
    disabled: ButtonUi;
  }
> = {
  primary: {
    default: {
      container: {
        backgroundColor: 'primary',
      },
      content: 'surface',
    },
    disabled: {
      container: {
        backgroundColor: 'disabled',
      },
      content: 'disabledText',
    },
  },

  outline: {
    default: {
      container: {
        borderWidth: 1,
        borderColor: 'primary',
      },
      content: 'primary',
    },
    disabled: {
      container: {
        borderWidth: 1,
        borderColor: 'disabled',
      },
      content: 'disabledText',
    },
  },

  outlineWhite: {
    default: {
      container: {
        borderWidth: 1,
        borderColor: 'surface',
      },
      content: 'surface',
    },
    disabled: {
      container: {
        borderWidth: 1,
        borderColor: 'disabled',
      },
      content: 'disabledText',
    },
  },
};
