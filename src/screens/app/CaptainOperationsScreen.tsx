import React, {useEffect} from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useCaptainTrips, useMyBoats, TripStatus} from '@domain';

import {AppStackParamList, CaptainTabsParamList} from '@routes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CaptainTabsParamList, 'Operations'>,
  NativeStackScreenProps<AppStackParamList>
>;

const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export function CaptainOperationsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const {trips, isLoading: tripsLoading, fetchMyTrips} = useCaptainTrips();
  const {boats, isLoading: boatsLoading, fetchBoats} = useMyBoats();

  const isLoading = tripsLoading || boatsLoading;

  useEffect(() => {
    fetchMyTrips();
    fetchBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRefresh() {
    fetchMyTrips();
    fetchBoats();
  }

  const recentTrips = trips.slice(0, 3);

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
              let departureStr = '';
              try {
                departureStr = format(
                  new Date(trip.departureAt),
                  "dd/MM/yy 'às' HH:mm",
                  {locale: ptBR},
                );
              } catch {
                departureStr = trip.departureAt;
              }
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
                    <Text preset="paragraphMedium" color="text" bold flex={1} mr="s8">
                      {trip.origin} → {trip.destination}
                    </Text>
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
          <TouchableOpacityBox onPress={() => navigation.navigate('CaptainMyBoats')}>
            <Text preset="paragraphSmall" color="secondary">
              Ver todas
            </Text>
          </TouchableOpacityBox>
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
