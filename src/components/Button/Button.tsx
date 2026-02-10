import React from 'react';
import {ActivityIndicator} from 'react-native';

import {Text} from '../Text/Text';
import {Box, TouchableOpacityBox, TouchableOpacityBoxProps} from '../Box/Box';

import {buttonPresets} from './buttonPresets';

export type ButtonPreset = 'primary' | 'outline' | 'outlineWhite';

interface ButtonProps extends TouchableOpacityBoxProps {
  title: string;
  loading?: boolean;
  preset?: ButtonPreset;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
}

export function Button({
  title,
  loading,
  preset = 'primary',
  disabled,
  rightComponent,
  ...touchableOpacityBoxProps
}: ButtonProps) {
  const buttonPreset =
    buttonPresets[preset][disabled ? 'disabled' : 'default'];

  return (
    <TouchableOpacityBox
      disabled={disabled || loading}
      paddingHorizontal="s20"
      height={50}
      alignItems="center"
      justifyContent="center"
      borderRadius="s8"
      {...buttonPreset.container}
      {...touchableOpacityBoxProps}>
      {loading ? (
        <ActivityIndicator color={buttonPreset.content} />
      ) : (
        <Box flexDirection="row" alignItems="center" justifyContent="center">
          <Text preset="paragraphMedium" color={buttonPreset.content}>
            {title}
          </Text>
          {rightComponent && <Box ml="s10">{rightComponent}</Box>}
        </Box>
      )}
    </TouchableOpacityBox>
  );
}
