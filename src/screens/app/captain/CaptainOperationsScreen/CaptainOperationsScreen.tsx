import React from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';

import {useCaptainOperations} from './useCaptainOperations';

export function CaptainOperationsScreen() {
  const {top} = useSafeAreaInsets();
  const {
    navigation,
    isBoatManager,
    boats,
    isLoading,
    recentTrips,
    onRefresh,
    formatDepartureStr,
    getTripBoatSummary,
    STATUS_CONFIG,
  } = useCaptainOperations();

  return (
    <Box flex={1} backgroundColor="background">
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Text preset="headingMedium" color="text" bold>
          Operações
        </Text>
      </Box>

      <ScrollView
        contentContainerStyle={{padding: 20, paddingBottom: 100}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        {/* Section: Viagens */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb="s12">
          <Text preset="paragraphMedium" color="text" bold>
            Viagens
          </Text>
          <TouchableOpacityBox onPress={() => navigation.navigate('CaptainMyTrips')}>
            <Text preset="paragraphSmall" color="secondary">
              Ver todas
            </Text>
          </TouchableOpacityBox>
        </Box>

        {recentTrips.length === 0 ? (
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            alignItems="center"
            mb="s24">
            <Icon name="directions-boat" size={40} color="textSecondary" />
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s12"
              textAlign="center">
              Nenhuma viagem cadastrada
            </Text>
          </Box>
        ) : (
          <Box mb="s24">
            {recentTrips.map(trip => {
              const cfg = STATUS_CONFIG[trip.status];
              const departureStr = formatDepartureStr(trip.departureAt);
              const boatSummary = getTripBoatSummary(trip);
              return (
                <TouchableOpacityBox
                  key={trip.id}
                  backgroundColor="surface"
                  borderRadius="s16"
                  padding="s16"
                  mb="s12"
                  onPress={() =>
                    navigation.navigate('CaptainTripManage', {tripId: trip.id})
                  }
                  style={{elevation: 2}}>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb="s8">
                    <Box flex={1} mr="s8">
                      <Text preset="paragraphMedium" color="text" bold>
                        {trip.origin} → {trip.destination}
                      </Text>
                      {boatSummary && (
                        <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                          {boatSummary}
                        </Text>
                      )}
                    </Box>
                    <Box
                      backgroundColor={cfg.bg}
                      paddingHorizontal="s10"
                      paddingVertical="s4"
                      borderRadius="s8">
                      <Text preset="paragraphCaptionSmall" color={cfg.color} bold>
                        {cfg.label}
                      </Text>
                    </Box>
                  </Box>
                  <Box flexDirection="row" alignItems="center">
                    <Icon name="schedule" size={14} color="textSecondary" />
                    <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                      {departureStr}
                    </Text>
                  </Box>
                </TouchableOpacityBox>
              );
            })}
          </Box>
        )}

        {/* CTA: Nova Viagem */}
        <TouchableOpacityBox
          backgroundColor="secondary"
          borderRadius="s16"
          padding="s16"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          mb="s32"
          onPress={() => navigation.navigate('CaptainCreateTrip')}
          style={{elevation: 3}}>
          <Icon name="add-circle" size={24} color="surface" />
          <Text preset="paragraphMedium" color="surface" bold ml="s8">
            Criar Nova Viagem
          </Text>
        </TouchableOpacityBox>

        {/* Section: Embarcações */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb="s12">
          <Text preset="paragraphMedium" color="text" bold>
            Embarcações
          </Text>
          {!isBoatManager && (
            <TouchableOpacityBox onPress={() => navigation.navigate('CaptainMyBoats')}>
              <Text preset="paragraphSmall" color="secondary">
                Ver todas
              </Text>
            </TouchableOpacityBox>
          )}
        </Box>

        {boats.length === 0 ? (
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            alignItems="center">
            <Icon name="sailing" size={40} color="textSecondary" />
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s12"
              textAlign="center">
              Nenhuma embarcação cadastrada
            </Text>
          </Box>
        ) : (
          <Box>
            {boats.slice(0, 2).map(boat => (
              <TouchableOpacityBox
                key={boat.id}
                backgroundColor="surface"
                borderRadius="s16"
                padding="s16"
                mb="s12"
                onPress={() => navigation.navigate('CaptainMyBoats')}
                style={{elevation: 2}}>
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={44}
                    height={44}
                    borderRadius="s12"
                    backgroundColor="secondaryBg"
                    alignItems="center"
                    justifyContent="center"
                    mr="s12">
                    <Icon name="sailing" size={24} color="secondary" />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphMedium" color="text" bold>
                      {boat.name}
                    </Text>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {boat.type} · {boat.capacity} lugares
                    </Text>
                  </Box>
                  <Icon name="chevron-right" size={20} color="textSecondary" />
                </Box>
              </TouchableOpacityBox>
            ))}
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}
