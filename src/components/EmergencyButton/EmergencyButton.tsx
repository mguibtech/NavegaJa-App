import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';

import {Box, Icon, Text} from '@components';
import {useAppTheme} from '@hooks';

interface EmergencyButtonProps {
  onPress: () => void;
  hasActiveAlert?: boolean;
}

export function EmergencyButton({
  onPress,
  hasActiveAlert = false,
}: EmergencyButtonProps) {
  const {colors} = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: hasActiveAlert ? colors.warning : colors.danger,
          shadowColor: colors.danger,
        },
      ]}
      activeOpacity={0.8}>
      <Box alignItems="center" justifyContent="center">
        <Icon
          name={hasActiveAlert ? 'notification-important' : 'sos'}
          size={28}
          color="surface"
        />
        <Text preset="paragraphCaptionSmall" color="surface" bold mt="s4">
          {hasActiveAlert ? 'ATIVO' : 'SOS'}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
});
