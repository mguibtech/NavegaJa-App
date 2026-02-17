import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';

import {Box, Icon, Text} from '@components';
import {SafetyLevel, getSafetyLevelConfig} from '@domain';

interface SafetyOverlayProps {
  level: SafetyLevel;
  score?: number;
  nearbyAlerts?: number;
  isLoading?: boolean;
  onPress?: () => void;
}

export function SafetyOverlay({
  level,
  score,
  nearbyAlerts = 0,
  isLoading = false,
  onPress,
}: SafetyOverlayProps) {
  const config = getSafetyLevelConfig(level);

  const content = isLoading ? (
    <Box
      backgroundColor="surface"
      borderRadius="s12"
      padding="s12"
      flexDirection="row"
      alignItems="center"
      style={styles.shadow}>
      <ActivityIndicator size="small" color="#3B82F6" />
      <Text preset="paragraphSmall" color="textSecondary" ml="s12">
        Verificando segurança...
      </Text>
    </Box>
  ) : (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      style={styles.shadowLarge}>
      <Box flexDirection="row" alignItems="center">
        {/* Safety Icon */}
        <Box
          width={48}
          height={48}
          borderRadius="s12"
          backgroundColor={config.bgColor as any}
          alignItems="center"
          justifyContent="center">
          <Icon name={config.icon as any} size={24} color={config.color as any} />
        </Box>

        {/* Info */}
        <Box ml="s12" flex={1}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text preset="paragraphMedium" color={config.color as any} bold>
              {config.label}
            </Text>
            {score !== undefined && (
              <Text preset="paragraphSmall" color="textSecondary">
                Score: {score}/100
              </Text>
            )}
          </Box>

          <Box flexDirection="row" alignItems="center" mt="s4">
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              {config.description}
            </Text>
          </Box>

          {/* Nearby Alerts Badge */}
          {nearbyAlerts > 0 && (
            <Box
              mt="s8"
              flexDirection="row"
              alignItems="center"
              backgroundColor="warningBg"
              paddingHorizontal="s8"
              paddingVertical="s4"
              borderRadius="s8"
              alignSelf="flex-start">
              <Icon name="warning" size={14} color="warning" />
              <Text preset="paragraphCaptionSmall" color="warning" bold ml="s4">
                {nearbyAlerts} alerta{nearbyAlerts > 1 ? 's' : ''} próximo
                {nearbyAlerts > 1 ? 's' : ''}
              </Text>
            </Box>
          )}
        </Box>

        {/* Arrow if pressable */}
        {onPress && (
          <Box ml="s8">
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </Box>
        )}
      </Box>
    </Box>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <Box style={styles.container}>{content}</Box>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
