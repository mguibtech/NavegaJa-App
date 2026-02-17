import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Marker, Callout} from 'react-native-maps';

import {Icon, Text, Box} from '@components';
import {SosAlert, SOS_TYPE_CONFIGS} from '@domain';
import {theme} from '@theme';

interface SosMarkerProps {
  alert: SosAlert;
  onPress?: () => void;
  onCalloutPress?: () => void;
}

export function SosMarker({alert, onPress, onCalloutPress}: SosMarkerProps) {
  const config = SOS_TYPE_CONFIGS[alert.type];

  return (
    <Marker
      coordinate={{
        latitude: alert.location.latitude,
        longitude: alert.location.longitude,
      }}
      onPress={onPress}
      anchor={{x: 0.5, y: 0.5}}
      tracksViewChanges={false}>
      <View style={styles.container}>
        {/* Pulsing ring effect */}
        <View
          style={[
            styles.pulseRing,
            {backgroundColor: config.color, opacity: 0.3},
          ]}
        />

        {/* SOS Icon Container */}
        <View
          style={[styles.iconContainer, {backgroundColor: config.color}]}>
          <Icon name={config.icon as any} size={24} color="surface" />

          {/* Priority badge */}
          {config.priority === 'critical' && (
            <View style={styles.criticalBadge}>
              <Icon name="emergency" size={12} color="surface" />
            </View>
          )}
        </View>
      </View>

      {/* Callout Popup */}
      <Callout onPress={onCalloutPress} tooltip={false}>
        <Box width={240} padding="s12" backgroundColor="surface">
          {/* Header */}
          <Box flexDirection="row" alignItems="center" mb="s8">
            <View
              style={[
                styles.calloutIcon,
                {backgroundColor: config.bgColor as any},
              ]}>
              <Icon name={config.icon as any} size={20} color={config.color as any} />
            </View>
            <Box ml="s12" flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                {config.label}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                Prioridade: {config.priority.toUpperCase()}
              </Text>
            </Box>
          </Box>

          {/* User Info */}
          {alert.user && (
            <Box mb="s8">
              <Text preset="paragraphSmall" color="textSecondary">
                Usuário: <Text color="text">{alert.user.name}</Text>
              </Text>
            </Box>
          )}

          {/* Trip Info */}
          {alert.trip && (
            <Box mb="s8">
              <Text preset="paragraphSmall" color="textSecondary">
                Rota:{' '}
                <Text color="text">
                  {alert.trip.origin} → {alert.trip.destination}
                </Text>
              </Text>
              {alert.trip.boatName && (
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  Barco: {alert.trip.boatName}
                </Text>
              )}
            </Box>
          )}

          {/* Description */}
          {alert.description && (
            <Box mb="s8">
              <Text preset="paragraphSmall" color="text">
                {alert.description}
              </Text>
            </Box>
          )}

          {/* Contact */}
          {alert.contactNumber && (
            <Box
              backgroundColor="primaryBg"
              padding="s8"
              borderRadius="s8"
              flexDirection="row"
              alignItems="center">
              <Icon name="phone" size={16} color="primary" />
              <Text preset="paragraphSmall" color="primary" ml="s8" bold>
                {alert.contactNumber}
              </Text>
            </Box>
          )}

          {/* Tap to view details */}
          <Box mt="s12" paddingTop="s8" borderTopWidth={1} borderColor="border">
            <Text preset="paragraphCaptionSmall" color="primary" textAlign="center">
              Toque para ver detalhes
            </Text>
          </Box>
        </Box>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  pulseRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  criticalBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  calloutIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
