import React from 'react';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {useAppTheme} from '@hooks';
import {ThemeColors} from '@theme';

export interface IconProps {
  name: string;
  size?: number;
  color?: ThemeColors | string;
  onPress?: () => void;
}

export function Icon({
  name,
  size = 24,
  color = 'text',
  onPress,
}: IconProps) {
  const {colors} = useAppTheme();
  // Se color é uma string hex/rgb, usa diretamente, senão pega do tema
  const iconColor = color.startsWith('#') || color.startsWith('rgb')
    ? color
    : colors[color as ThemeColors];

  return (
    <MaterialIcon name={name} size={size} color={iconColor} onPress={onPress} />
  );
}
