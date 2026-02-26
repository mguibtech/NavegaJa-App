import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({title, subtitle, onBack, rightElement}: ScreenHeaderProps) {
  const {top} = useSafeAreaInsets();

  return (
    <Box
      paddingHorizontal="s20"
      paddingBottom="s16"
      backgroundColor="surface"
      style={{
        paddingTop: top + 16,
        elevation: 10,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}>
      <Box flexDirection="row" alignItems="center" justifyContent="center">
        {onBack && (
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            onPress={onBack}
            style={{position: 'absolute', left: 0}}>
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
        )}
        <Text preset="headingSmall" color="text" bold>
          {title}
        </Text>
        {rightElement && (
          <Box style={{position: 'absolute', right: 0}}>
            {rightElement}
          </Box>
        )}
      </Box>
      {subtitle && (
        <Text preset="paragraphSmall" color="textSecondary" textAlign="center" mt="s4">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
