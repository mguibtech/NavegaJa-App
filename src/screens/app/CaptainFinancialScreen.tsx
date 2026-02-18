import React, {useEffect} from 'react';
import {ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text} from '@components';
import {useCaptainTrips, TripStatus} from '@domain';
import {useAuthStore} from '@store';
import {formatBRL} from '@utils';

import {AppStackParamList, CaptainTabsParamList} from '@routes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CaptainTabsParamList, 'Financial'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function CaptainFinancialScreen(_: Props) {
  const {top} = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();

  useEffect(() => {
    fetchMyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedTrips = trips.filter(t => t.status === TripStatus.COMPLETED);

  const now = new Date();

  const monthTrips = completedTrips.filter(t => {
    try {
      const d = new Date(t.departureAt);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  });

  // Earnings = price × seats used (totalSeats - availableSeats)
  function tripEarnings(t: (typeof trips)[number]): number {
    const seatsUsed = (t.totalSeats ?? 0) - (t.availableSeats ?? 0);
    return Number(t.price) * Math.max(0, seatsUsed);
  }

  const totalEarnings = completedTrips.reduce((sum, t) => sum + tripEarnings(t), 0);
  const monthEarnings = monthTrips.reduce((sum, t) => sum + tripEarnings(t), 0);
  const totalPassengers = completedTrips.reduce(
    (sum, t) => sum + Math.max(0, (t.totalSeats ?? 0) - (t.availableSeats ?? 0)),
    0,
  );

  function formatDeparture(dateStr: string) {
    try {
      return format(new Date(dateStr), 'dd/MM/yy', {locale: ptBR});
    } catch {
      return '';
    }
  }

  function formatMonthYear(date: Date) {
    return format(date, "MMMM 'de' yyyy", {locale: ptBR});
  }

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
