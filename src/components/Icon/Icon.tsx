import React from 'react';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {useAppTheme} from '@hooks/useAppTheme';
import {ThemeColors} from '@theme';

export interface IconProps {
  name: string;
  size?: number;
  color?: ThemeColors;
  onPress?: () => void;
}

export function Icon({
  name,
  size = 24,
  color = 'text',
  onPress,
}: IconProps) {
  const {colors} = useAppTheme();
  const iconColor = colors[color];

  return (
    <MaterialIcon name={name} size={size} color={iconColor} onPress={onPress} />
  );
}
