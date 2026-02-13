import React from 'react';
import {ActivityIndicator} from 'react-native';

import {ThemeColors} from '@theme';

import {Icon} from '@components';
import {Text} from '@components';
import {Box, TouchableOpacityBox, TouchableOpacityBoxProps} from '@components';

import {buttonPresets} from './buttonPresets';

export type ButtonPreset = 'primary' | 'outline' | 'outlineWhite';

interface ButtonProps extends TouchableOpacityBoxProps {
  title: string;
  loading?: boolean;
  preset?: ButtonPreset;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
  iconColor?: ThemeColors;
}

export function Button({
  title,
  loading,
  preset = 'primary',
  disabled,
  rightComponent,
  leftIcon,
  rightIcon,
  iconColor,
  ...touchableOpacityBoxProps
}: ButtonProps) {
  const buttonPreset =
    buttonPresets[preset][disabled ? 'disabled' : 'default'];

  const finalIconColor = iconColor || buttonPreset.content;

  return (
    <TouchableOpacityBox
      disabled={disabled || loading}
      paddingHorizontal="s20"
      height={56}
      alignItems="center"
      justifyContent="center"
      borderRadius="s12"
      {...buttonPreset.container}
      {...touchableOpacityBoxProps}>
      {loading ? (
        <ActivityIndicator color={buttonPreset.content} />
      ) : (
        <Box flexDirection="row" alignItems="center" justifyContent="center">
          {leftIcon && (
            <Box mr="s10">
              <Icon name={leftIcon} size={20} color={finalIconColor} />
            </Box>
          )}
          <Text preset="paragraphMedium" color={buttonPreset.content} semibold>
            {title}
          </Text>
          {rightIcon && (
            <Box ml="s10">
              <Icon name={rightIcon} size={20} color={finalIconColor} />
            </Box>
          )}
          {rightComponent && <Box ml="s10">{rightComponent}</Box>}
        </Box>
      )}
    </TouchableOpacityBox>
  );
}
