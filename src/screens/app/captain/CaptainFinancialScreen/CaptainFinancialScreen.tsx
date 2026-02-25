import React from 'react';
import {ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text} from '@components';

import {useCaptainFinancial} from './useCaptainFinancial';

export function CaptainFinancialScreen() {
  const {top} = useSafeAreaInsets();
  const {
    user,
    trips,
    isLoading,
    completedTrips,
    monthTrips,
    now,
    totalEarnings,
    monthEarnings,
    totalPassengers,
    tripEarnings,
    formatDeparture,
    formatMonthYear,
    formatBRL,
    fetchMyTrips,
  } = useCaptainFinancial();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="secondary"
        paddingHorizontal="s20"
        paddingBottom="s20"
        style={{paddingTop: top + 16}}>
        <Text preset="headingMedium" bold style={{color: '#fff'}}>
          Financeiro
        </Text>
        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}}>
          {user?.name} · {formatMonthYear(now)}
        </Text>
      </Box>

      {isLoading && trips.length === 0 ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#0a6fbd" />
        </Box>
      ) : (
        <ScrollView
          contentContainerStyle={{padding: 20, paddingBottom: 120}}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchMyTrips}
            />
          }>
          {/* Earnings Summary Cards */}
          <Box flexDirection="row" gap="s12" mb="s16">
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              style={{elevation: 3}}>
              <Icon name="attach-money" size={24} color="secondary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s8">
                Este mês
              </Text>
              <Text preset="headingSmall" color="text" bold mt="s4">
                {formatBRL(monthEarnings)}
              </Text>
            </Box>
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              style={{elevation: 3}}>
              <Icon name="savings" size={24} color="success" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s8">
                Total acumulado
              </Text>
              <Text preset="headingSmall" color="text" bold mt="s4">
                {formatBRL(totalEarnings)}
              </Text>
            </Box>
          </Box>

          {/* Stats Row */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s20"
            style={{elevation: 3}}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Resumo geral
            </Text>
            <Box flexDirection="row" justifyContent="space-around">
              <Box alignItems="center">
                <Text preset="headingSmall" color="secondary" bold>
                  {completedTrips.length}
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                  Total viagens
                </Text>
              </Box>
              <Box alignItems="center">
                <Text preset="headingSmall" color="secondary" bold>
                  {monthTrips.length}
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                  Este mês
                </Text>
              </Box>
              <Box alignItems="center">
                <Text preset="headingSmall" color="secondary" bold>
                  {totalPassengers}
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                  Passageiros
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Completed Trips List */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Viagens concluídas
          </Text>

          {completedTrips.length === 0 ? (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s32"
              alignItems="center">
              <Icon name="savings" size={48} color="textSecondary" />
              <Text
                preset="paragraphMedium"
                color="text"
                bold
                mt="s16"
                textAlign="center">
                Nenhuma viagem concluída ainda
              </Text>
              <Text
                preset="paragraphSmall"
                color="textSecondary"
                mt="s8"
                textAlign="center">
                Seus ganhos aparecerão aqui após concluir viagens
              </Text>
            </Box>
          ) : (
            completedTrips.slice(0, 30).map(trip => {
              const seatsUsed = Math.max(
                0,
                (trip.totalSeats ?? 0) - (trip.availableSeats ?? 0),
              );
              const earnings = tripEarnings(trip);
              return (
                <Box
                  key={trip.id}
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s16"
                  mb="s8"
                  flexDirection="row"
                  alignItems="center"
                  style={{elevation: 2}}>
                  <Box
                    width={40}
                    height={40}
                    borderRadius="s20"
                    backgroundColor="successBg"
                    alignItems="center"
                    justifyContent="center"
                    mr="s12">
                    <Icon name="check-circle" size={22} color="success" />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphSmall" color="text" bold>
                      {trip.origin} → {trip.destination}
                    </Text>
                    <Text preset="paragraphCaptionSmall" color="textSecondary">
                      {seatsUsed} passageiro{seatsUsed !== 1 ? 's' : ''} ·{' '}
                      {formatDeparture(trip.departureAt)}
                    </Text>
                  </Box>
                  <Text preset="paragraphSmall" color="success" bold>
                    {formatBRL(earnings)}
                  </Text>
                </Box>
              );
            })
          )}
        </ScrollView>
      )}
    </Box>
  );
}
