import React from 'react';

import {Box, Text} from '@components';
import {getWeatherIcon} from '@domain';

interface WeatherIconProps {
  iconCode: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function WeatherIcon({
  iconCode,
  size = 'medium',
  showLabel = false,
}: WeatherIconProps) {
  const {emoji, name} = getWeatherIcon(iconCode);

  const fontSize = {
    small: 24,
    medium: 32,
    large: 48,
  }[size];

  return (
    <Box alignItems="center">
      <Text style={{fontSize}}>{emoji}</Text>
      {showLabel && (
        <Text
          preset="paragraphCaptionSmall"
          color="textSecondary"
          mt="s4"
          textAlign="center">
          {name}
        </Text>
      )}
    </Box>
  );
}
