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

  const chip = isLoading ? (
    <Box
      backgroundColor="surface"
      borderRadius="s20"
      paddingHorizontal="s12"
      paddingVertical="s8"
      flexDirection="row"
      alignItems="center"
      style={styles.shadow}>
      <ActivityIndicator size="small" color="#3B82F6" />
      <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
        Verificando...
      </Text>
    </Box>
  ) : (
    <Box
      backgroundColor="surface"
      borderRadius="s20"
      paddingHorizontal="s12"
      paddingVertical="s8"
      flexDirection="row"
      alignItems="center"
      style={styles.shadow}>
      {/* Colored dot */}
      <Box
        width={8}
        height={8}
        borderRadius="s8"
        style={{backgroundColor: config.color}}
        marginRight="s8"
      />

      {/* Icon */}
      <Icon name={config.icon as any} size={14} color={config.color} />

      {/* Label */}
      <Text
        preset="paragraphCaptionSmall"
        style={{color: config.color}}
        bold
        ml="s6">
        {config.label}
      </Text>

      {/* Score */}
      {score !== undefined && (
        <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s6">
          {score}/100
        </Text>
      )}

      {/* Alert badge */}
      {nearbyAlerts > 0 && (
        <Box
          backgroundColor="warning"
          borderRadius="s8"
          width={16}
          height={16}
          alignItems="center"
          justifyContent="center"
          ml="s8">
          <Text preset="paragraphCaptionSmall" color="surface" bold>
            {nearbyAlerts > 9 ? '9+' : nearbyAlerts}
          </Text>
        </Box>
      )}

      {/* Tap hint */}
      {onPress && (
        <Icon name="chevron-right" size={14} color="textSecondary" />
      )}
    </Box>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.75}>
        {chip}
      </TouchableOpacity>
    );
  }

  return <Box style={styles.container}>{chip}</Box>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
