import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {Trip, TripStatus} from '@domain';

import {useCaptainMyTrips, FilterTab} from './useCaptainMyTrips';

const PIPELINE_STEPS: {key: TripStatus; label: string}[] = [
  {key: TripStatus.SCHEDULED,   label: 'Agendada'},
  {key: TripStatus.IN_PROGRESS, label: 'Andamento'},
  {key: TripStatus.COMPLETED,   label: 'Concluída'},
];

function TripStatusPipeline({status}: {status: TripStatus}) {
  if (status === TripStatus.CANCELLED) {return null;}

  const currentIndex = PIPELINE_STEPS.findIndex(s => s.key === status);

  return (
    <Box flexDirection="row" alignItems="flex-start" mt="s12">
      {PIPELINE_STEPS.map((step, idx) => {
        const isPast   = idx < currentIndex;
        const isActive = idx === currentIndex;
        const nodeBg   = isActive ? '#0B5D8A' : isPast ? '#22C55E' : '#E5E7EB';

        return (
          <React.Fragment key={step.key}>
            <Box alignItems="center" style={{minWidth: 60}}>
              <Box
                width={20}
                height={20}
                borderRadius="s12"
                alignItems="center"
                justifyContent="center"
                style={{backgroundColor: nodeBg, borderWidth: isActive || isPast ? 0 : 1.5, borderColor: '#D1D5DB'}}>
                {isPast && <Icon name="check" size={12} color={'white' as any} />}
                {isActive && (
                  <Box width={8} height={8} borderRadius="s8" style={{backgroundColor: 'white'}} />
                )}
              </Box>
              <Text
                preset="paragraphCaptionSmall"
                color={idx <= currentIndex ? 'text' : 'textSecondary'}
                mt="s4"
                textAlign="center">
                {step.label}
              </Text>
            </Box>

            {idx < PIPELINE_STEPS.length - 1 && (
              <Box
                flex={1}
                height={2}
                style={{backgroundColor: isPast ? '#22C55E' : '#E5E7EB', marginTop: 9}}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export function CaptainMyTripsScreen() {
  const {top} = useSafeAreaInsets();
  const {
    navigation,
    filterTab,
    setFilterTab,
    refreshing,
    isLoading,
    filteredTrips,
    onRefresh,
    formatDepartureStr,
    STATUS_CONFIG,
  } = useCaptainMyTrips();

  function renderTrip({item: trip}: {item: Trip}) {
    const cfg = STATUS_CONFIG[trip.status];
    const departureStr = formatDepartureStr(trip);

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

        {/* Status pipeline (não exibido para viagens canceladas) */}
        <TripStatusPipeline status={trip.status} />
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
