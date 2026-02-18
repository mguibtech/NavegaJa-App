import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useCaptainTrips, Trip, TripStatus} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainMyTrips'>;

const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const, icon: 'schedule' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const, icon: 'directions-boat' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const, icon: 'check-circle' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const, icon: 'cancel' as const},
};

type FilterTab = 'all' | 'active' | 'completed';

export function CaptainMyTripsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();

  useEffect(() => {
    fetchMyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetchMyTrips();
    } finally {
      setRefreshing(false);
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (filterTab === 'active') {
      return trip.status === TripStatus.SCHEDULED || trip.status === TripStatus.IN_PROGRESS;
    }
    if (filterTab === 'completed') {
      return trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED;
    }
    return true;
  });

  function renderTrip({item: trip}: {item: Trip}) {
    const cfg = STATUS_CONFIG[trip.status];
    let departureStr = '';
    try {
      departureStr = format(new Date(trip.departureAt), "dd 'de' MMM, HH:mm", {locale: ptBR});
    } catch {
      departureStr = trip.departureAt;
    }

    return (
      <TouchableOpacityBox
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s12"
        onPress={() => navigation.navigate('CaptainTripManage', {tripId: trip.id})}
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        {/* Status + Route */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb="s12">
          <Box flex={1} mr="s8">
            <Text preset="paragraphMedium" color="text" bold>
              {trip.origin} → {trip.destination}
            </Text>
          </Box>
          <Box
            backgroundColor={cfg.bg}
            paddingHorizontal="s10"
            paddingVertical="s4"
            borderRadius="s8"
            flexDirection="row"
            alignItems="center">
            <Icon name={cfg.icon} size={12} color={cfg.color} />
            <Text preset="paragraphCaptionSmall" color={cfg.color} bold ml="s4">
              {cfg.label}
            </Text>
          </Box>
        </Box>

        {/* Details */}
        <Box flexDirection="row" gap="s16">
          <Box flexDirection="row" alignItems="center">
            <Icon name="schedule" size={14} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
              {departureStr}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <Icon name="event-seat" size={14} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
              {trip.availableSeats}/{trip.totalSeats} lugares
            </Text>
          </Box>
        </Box>
      </TouchableOpacityBox>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s24"
        paddingBottom="s12"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{paddingTop: top + 12}}>
        <Box flexDirection="row" alignItems="center" mb="s12">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            mr="s8"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>
          <Box flex={1}>
            <Text preset="headingSmall" color="text" bold>
              Minhas Viagens
            </Text>
          </Box>
          <TouchableOpacityBox
            backgroundColor="secondary"
            paddingHorizontal="s16"
            paddingVertical="s8"
            borderRadius="s12"
            flexDirection="row"
            alignItems="center"
            onPress={() => navigation.navigate('CaptainCreateTrip')}>
            <Icon name="add" size={18} color="surface" />
            <Text preset="paragraphSmall" color="surface" bold ml="s4">
              Nova
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* Filter tabs */}
        <Box flexDirection="row" gap="s8">
          {(['all', 'active', 'completed'] as FilterTab[]).map(tab => {
            const labels = {all: 'Todas', active: 'Ativas', completed: 'Concluídas'};
            const isActive = filterTab === tab;
            return (
              <TouchableOpacityBox
                key={tab}
                flex={1}
                paddingVertical="s10"
                backgroundColor={isActive ? 'secondary' : 'background'}
                alignItems="center"
                onPress={() => setFilterTab(tab)}
                style={{borderRadius: 10}}>
                <Text
                  preset="paragraphSmall"
                  color={isActive ? 'surface' : 'text'}
                  bold>
                  {labels[tab]}
                </Text>
              </TouchableOpacityBox>
            );
          })}
        </Box>
      </Box>

      <FlatList
        data={filteredTrips}
        keyExtractor={item => item.id}
        renderItem={renderTrip}
        contentContainerStyle={{padding: 20, paddingBottom: 100}}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Box flex={1} alignItems="center" justifyContent="center" padding="s32">
            <Icon name="directions-boat" size={64} color="textSecondary" />
            <Text
              preset="headingSmall"
              color="text"
              bold
              textAlign="center"
              mt="s20"
              mb="s12">
              Nenhuma viagem encontrada
            </Text>
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              textAlign="center"
              mb="s24">
              Crie sua primeira viagem para começar
            </Text>
            <TouchableOpacityBox
              flexDirection="row"
              alignItems="center"
              paddingHorizontal="s24"
              paddingVertical="s16"
              backgroundColor="secondary"
              borderRadius="s12"
              onPress={() => navigation.navigate('CaptainCreateTrip')}>
              <Icon name="add-circle" size={24} color="surface" />
              <Text preset="paragraphMedium" color="surface" bold ml="s12">
                Criar Viagem
              </Text>
            </TouchableOpacityBox>
          </Box>
        }
      />
    </Box>
  );
}
