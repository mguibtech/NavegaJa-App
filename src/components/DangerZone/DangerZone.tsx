import React from 'react';
import {Polygon, Circle} from 'react-native-maps';

export interface DangerZoneData {
  id: string;
  type: 'polygon' | 'circle';
  name: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  // For polygon
  coordinates?: Array<{latitude: number; longitude: number}>;
  // For circle
  center?: {latitude: number; longitude: number};
  radius?: number; // in meters
}

interface DangerZoneProps {
  zone: DangerZoneData;
  onPress?: () => void;
}

const DANGER_COLORS = {
  low: {
    fillColor: 'rgba(251, 191, 36, 0.2)', // amber
    strokeColor: '#F59E0B',
  },
  medium: {
    fillColor: 'rgba(249, 115, 22, 0.25)', // orange
    strokeColor: '#EA580C',
  },
  high: {
    fillColor: 'rgba(239, 68, 68, 0.3)', // red
    strokeColor: '#DC2626',
  },
  critical: {
    fillColor: 'rgba(220, 38, 38, 0.4)', // dark red
    strokeColor: '#991B1B',
  },
};

export function DangerZone({zone}: DangerZoneProps) {
  const colors = DANGER_COLORS[zone.level];

  if (zone.type === 'circle' && zone.center && zone.radius) {
    return (
      <Circle
        center={zone.center}
        radius={zone.radius}
        fillColor={colors.fillColor}
        strokeColor={colors.strokeColor}
        strokeWidth={2}
      />
    );
  }

  if (zone.type === 'polygon' && zone.coordinates && zone.coordinates.length >= 3) {
    return (
      <Polygon
        coordinates={zone.coordinates}
        fillColor={colors.fillColor}
        strokeColor={colors.strokeColor}
        strokeWidth={2}
      />
    );
  }

  return null;
}
