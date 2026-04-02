import React from 'react';
import {Image, StyleSheet} from 'react-native';
import { Box, Icon, Text, TouchableOpacityBox } from '@components';
import {apiImageSource} from '@api/config';

import { Trip, TripStatus, getTripBoatImageUrl } from '@domain';
import { STATUS_CONFIG, formatDeparture } from './useCaptainDashboard';

type TripCardProps = {
  trip: Trip;
  index: number;
  isMultiple: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  card: {
    elevation: 3,
    minWidth: 280,
    marginRight: 12,
    borderWidth: 1,
  },
  boatImage: {
    width: '100%',
    height: '100%',
  },
});

function getCardStyle(borderColor: string) {
  return {
    borderColor,
  };
}

function getDepartureStatus(trip: Trip): string {
  if (trip.status === TripStatus.IN_PROGRESS) {
    return 'Em andamento';
  }

  const departure = new Date(trip.departureAt).getTime();
  const now = Date.now();
  const diffMs = departure - now;
  if (diffMs <= 0) {
    return 'Sai em instantes';
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `Sai em ${days} dia${days > 1 ? 's' : ''}`;
  }

  return `Sai em ${diffHours || 1}h`;
}

export function TripCard({ trip, index, isMultiple, onPress }: TripCardProps) {
  const status = STATUS_CONFIG[trip.status];
  const passengersOnboard = Math.max(0, trip.totalSeats - trip.availableSeats);
  const boatName = trip.boat?.name ?? 'Sem embarcação';
  const departureLabel = formatDeparture(trip);
  const departureRelative = getDepartureStatus(trip);
  const boatImageUrl = getTripBoatImageUrl(trip);
  
  return (
    <TouchableOpacityBox
      onPress={onPress}
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      flexDirection="row"
      alignItems="center"
      style={[styles.card, getCardStyle(status.bg)]}>
      <Box flex={1} mr="s12">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
          <Box
            backgroundColor={status.bg}
            paddingHorizontal="s12"
            paddingVertical="s6"
            borderRadius="s8">
            <Text preset="paragraphCaptionSmall" color={status.color} bold>
              {status.label}
            </Text>
          </Box>
          {isMultiple && (
            <Text preset="paragraphCaptionSmall" color="textSecondary" bold>
              #{index + 1}
            </Text>
          )}
        </Box>


        <Box flexDirection="row" alignItems="center" mt="s6" mb="s6">
          <Icon name="directions-boat" size={18} color="secondary" />
          <Text preset="paragraphMedium" color="text" ml="s6">
            {trip.origin} → {trip.destination}
          </Text>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="s8" mb="s6">
          <Box flexDirection="row" alignItems="center">
            <Icon name="schedule" size={14} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
              {departureLabel}
            </Text>
          </Box>
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            •
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            {departureRelative}
          </Text>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="s8" mb="s6">
          <Icon name="people" size={14} color="textSecondary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            {passengersOnboard}/{trip.totalSeats} passageiros
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            •
          </Text>
          <Icon name="sailing" size={14} color="textSecondary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            {boatName}
          </Text>
        </Box>

        {trip.acceptsShipments && (
          <Box flexDirection="row" alignItems="center" gap="s4">
            <Icon name="inventory" size={14} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Transporte de encomendas liberado
            </Text>
          </Box>
        )}
      </Box>

      {boatImageUrl ? (
        <Box
          width={44}
          height={44}
          borderRadius="s12"
          overflow="hidden"
          borderWidth={1}
          borderColor="border">
          <Image
            source={apiImageSource(boatImageUrl)}
            style={styles.boatImage}
            resizeMode="cover"
          />
        </Box>
      ) : (
        <Icon name="chevron-right" size={30} color="textSecondary" />
      )}
    </TouchableOpacityBox>
  );
}
