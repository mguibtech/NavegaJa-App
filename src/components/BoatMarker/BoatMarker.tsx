import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Marker} from 'react-native-maps';

import {Icon} from '../Icon/Icon';
import {theme} from '@theme';

interface BoatMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  rotation?: number;
  onPress?: () => void;
}

export function BoatMarker({
  coordinate,
  title,
  description,
  rotation = 0,
  onPress,
}: BoatMarkerProps) {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      onPress={onPress}
      anchor={{x: 0.5, y: 0.5}}
      rotation={rotation}>
      <View style={styles.container}>
        {/* Ping effect */}
        <View style={styles.ping} />

        {/* Boat icon */}
        <View style={styles.iconContainer}>
          <Icon name="directions-boat" size={24} color="surface" />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ping: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
});
