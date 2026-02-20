import React, {useEffect} from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useCaptainTrips, Trip, TripStatus} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList, CaptainTabsParamList} from '@routes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CaptainTabsParamList, 'Dashboard'>,
  NativeStackScreenProps<AppStackParamList>
>;

const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export function CaptainDashboardScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();

  useEffect(() => {
    fetchMyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTrip = trips.find(
    t => t.status === TripStatus.IN_PROGRESS || t.status === TripStatus.SCHEDULED,
  );

  const completedToday = trips.filter(t => {
    if (t.status !== TripStatus.COMPLETED) return false;
    const today = new Date().toDateString();
    return new Date(t.updatedAt).toDateString() === today;
  }).length;

  function formatDeparture(trip: Trip) {
    try {
      return format(new Date(trip.departureAt), "dd/MM 'às' HH:mm", {locale: ptBR});
    } catch {
      return trip.departureAt;
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        style={{paddingTop: top + 16}}>
        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)'}}>
          Bem-vindo, Capitão
        </Text>
        <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
          {user?.name || 'Capitão'}
        </Text>
      </Box>

      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMyTrips} />
        }>

        {/* Banner: conta não pode operar (capabilities presentes e canOperate=false) */}
        {user?.capabilities && !user.capabilities.canOperate && (
          <>
            {/* Sem documentos — solicita envio */}
            {!user.capabilities.pendingVerification && (
              <TouchableOpacityBox
                margin="s16"
                marginBottom="s4"
                backgroundColor="warningBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="warning"
                onPress={() => navigation.navigate('EditProfile')}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="warning"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={{flexShrink: 0}}>
                  <Icon name="upload-file" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    Envie sua habilitação náutica
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    Envie sua licença de arrais e certificado para começar a operar.
                  </Text>
                </Box>
                <Icon name="chevron-right" size={20} color="textSecondary" />
              </TouchableOpacityBox>
            )}

            {/* Documentos enviados — aguardando aprovação */}
            {user.capabilities.pendingVerification && (
              <Box
                margin="s16"
                marginBottom="s4"
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="info">
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="info"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={{flexShrink: 0}}>
                  <Icon name="hourglass-top" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    Documentos enviados. Aguardando aprovação
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    Seus documentos estão sendo analisados pelo NavegaJá. Em breve você poderá criar viagens.
                  </Text>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Stats Row */}
        <Box flexDirection="row" padding="s20" gap="s12">
          <Box
            flex={1}
            backgroundColor="surface"
            padding="s16"
            borderRadius="s16"
            alignItems="center"
            style={{elevation: 2}}>
            <Text preset="headingMedium" color="secondary" bold>
              {trips.length}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary" textAlign="center">
              Total de viagens
            </Text>
          </Box>
          <Box
            flex={1}
            backgroundColor="surface"
            padding="s16"
            borderRadius="s16"
            alignItems="center"
            style={{elevation: 2}}>
            <Text preset="headingMedium" color="success" bold>
              {completedToday}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary" textAlign="center">
              Concluídas hoje
            </Text>
          </Box>
        </Box>

        {/* Active Trip Card */}
        {activeTrip ? (
          <Box paddingHorizontal="s20" mb="s20">
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Viagem atual
            </Text>
            <TouchableOpacityBox
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              borderLeftWidth={4}
              borderLeftColor="secondary"
              onPress={() =>
                navigation.navigate('CaptainTripManage', {tripId: activeTrip.id})
              }
              style={{elevation: 3}}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="s12">
                <Box
                  backgroundColor={STATUS_CONFIG[activeTrip.status].bg}
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s8">
                  <Text
                    preset="paragraphCaptionSmall"
                    color={STATUS_CONFIG[activeTrip.status].color}
                    bold>
                    {STATUS_CONFIG[activeTrip.status].label}
                  </Text>
                </Box>
                <Icon name="chevron-right" size={20} color="textSecondary" />
              </Box>

              <Box flexDirection="row" alignItems="center" mb="s8">
                <Icon name="directions-boat" size={20} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  {activeTrip.origin} → {activeTrip.destination}
                </Text>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Icon name="schedule" size={16} color="textSecondary" />
                <Text preset="paragraphSmall" color="textSecondary" ml="s6">
                  {formatDeparture(activeTrip)}
                </Text>
              </Box>
            </TouchableOpacityBox>
          </Box>
        ) : (
          <Box paddingHorizontal="s20" mb="s20">
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              style={{elevation: 2}}>
              <Icon name="directions-boat" size={48} color="textSecondary" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
                Nenhuma viagem em andamento
              </Text>
            </Box>
          </Box>
        )}

        {/* Quick Actions */}
        <Box paddingHorizontal="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Ações rápidas
          </Text>
          <Box flexDirection="row" gap="s12">
            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('CaptainCreateTrip')}
              style={{elevation: 2}}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="add" size={28} color="secondary" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                Criar Viagem
              </Text>
            </TouchableOpacityBox>

            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('CaptainMyTrips')}
              style={{elevation: 2}}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="list" size={28} color="secondary" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                Minhas Viagens
              </Text>
            </TouchableOpacityBox>
          </Box>

          <Box flexDirection="row" gap="s12" mt="s12">
            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('CaptainMyBoats')}
              style={{elevation: 2}}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="sailing" size={28} color="secondary" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                Embarcações
              </Text>
            </TouchableOpacityBox>

            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('SosAlert', {})}
              style={{elevation: 2}}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="dangerBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="sos" size={28} color="danger" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                SOS
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
