import {Box, Text} from '@components';
import React from 'react';

export interface PromoBadgeProps {
  discount: number;
  size?: 'small' | 'medium' | 'large';
}

export function PromoBadge({discount, size = 'medium'}: PromoBadgeProps) {
  const fontSize = size === 'small' ? 10 : size === 'large' ? 14 : 12;
  const padding = size === 'small' ? 's4' : size === 'large' ? 's12' : 's8';

  return (
    <Box
      backgroundColor="danger"
      paddingHorizontal={padding}
      paddingVertical={padding}
      borderRadius="s8"
      alignSelf="flex-start">
      <Text
        style={{fontSize, fontWeight: 'bold', color: '#FFFFFF'}}>
        {`-${discount}% 🔥`}
      </Text>
    </Box>
  );
}
