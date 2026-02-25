import React, {useCallback, useState} from 'react';
import {ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox, ConfirmationModal} from '@components';
import {
  useTripDetails,
  useCompleteTrip,
  TripStatus,
  TripPassenger,
  Shipment,
  ShipmentStatus,
  captainAPI,
} from '@domain';
import {useToast} from '@hooks';
import {formatBRL} from '@utils';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainTripManage'>;

const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  [ShipmentStatus.PENDING]: 'Pendente',
  [ShipmentStatus.PAID]: 'Pago',
  [ShipmentStatus.COLLECTED]: 'Coletado',
  [ShipmentStatus.IN_TRANSIT]: 'Em trânsito',
  [ShipmentStatus.ARRIVED]: 'Chegou',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'Saiu p/ entrega',
  [ShipmentStatus.DELIVERED]: 'Entregue',
  [ShipmentStatus.CANCELLED]: 'Cancelado',
};

export function CaptainTripManageScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const {trip, isLoading: tripLoading, getTripById: fetchTrip} = useTripDetails();
  const {completeTrip, isLoading: completeLoading} = useCompleteTrip();

  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [passengersLoading, setPassengersLoading] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]),
  );

  async function loadAll() {
    fetchTrip(tripId);

    setPassengersLoading(true);
    captainAPI.getPassengers(tripId)
      .then(r => setPassengers(r))
      .catch(() => {})
      .finally(() => setPassengersLoading(false));

    setShipmentsLoading(true);
    captainAPI.getTripShipments(tripId)
      .then(r => setShipments(r))
      .catch(() => {})
      .finally(() => setShipmentsLoading(false));
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCompleteTrip() {
    setShowCompleteModal(false);
    try {
      await completeTrip(tripId);
      toast.showSuccess('Viagem concluída!');
      fetchTrip(tripId);
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao concluir viagem');
    }
  }

  const isActionLoading = completeLoading;

  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "dd 'de' MMM 'às' HH:mm", {locale: ptBR});
    } catch {
      return dateStr;
    }
  }

  return (
    <>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold>
              Gerenciar Viagem
            </Text>
          </Box>
        </Box>

        {tripLoading && !trip ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color="#0a6fbd" />
          </Box>
        ) : !trip ? (
          <Box flex={1} alignItems="center" justifyContent="center" padding="s32">
            <Icon name="error-outline" size={64} color="danger" />
            <Text preset="headingSmall" color="text" bold mt="s20" textAlign="center">
              Viagem não encontrada
            </Text>
          </Box>
        ) : (
          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 120}}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {/* Trip Info Card */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{elevation: 3}}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="s16">
                <Text preset="headingSmall" color="text" bold flex={1} mr="s8">
                  {trip.origin} → {trip.destination}
                </Text>
                <Box
                  backgroundColor={STATUS_CONFIG[trip.status].bg}
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s8">
                  <Text
                    preset="paragraphCaptionSmall"
                    color={STATUS_CONFIG[trip.status].color}
                    bold>
                    {STATUS_CONFIG[trip.status].label}
                  </Text>
                </Box>
              </Box>

              <Box flexDirection="row" mb="s8">
                <Box flex={1}>
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                    Partida
                  </Text>
                  <Text preset="paragraphSmall" color="text">
                    {formatDate(trip.departureAt)}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                    Chegada prevista
                  </Text>
                  <Text preset="paragraphSmall" color="text">
                    {formatDate(trip.estimatedArrivalAt)}
                  </Text>
                </Box>
              </Box>

              <Box
                flexDirection="row"
                justifyContent="space-between"
                paddingTop="s12"
                borderTopWidth={1}
                borderTopColor="border">
                <Box flexDirection="row" alignItems="center">
                  <Icon name="event-seat" size={16} color="textSecondary" />
                  <Text preset="paragraphSmall" color="text" ml="s6">
                    {trip.availableSeats}/{trip.totalSeats} assentos
                  </Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <Icon name="attach-money" size={16} color="textSecondary" />
                  <Text preset="paragraphSmall" color="text" ml="s6">
                    {formatBRL(trip.price)}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Passengers */}
            <Box mb="s16">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Passageiros ({passengers.length})
              </Text>
              {passengersLoading ? (
                <Box backgroundColor="surface" borderRadius="s12" padding="s20" alignItems="center">
                  <ActivityIndicator size="small" color="#0a6fbd" />
                </Box>
              ) : passengers.length === 0 ? (
                <Box backgroundColor="surface" borderRadius="s12" padding="s20" alignItems="center">
                  <Icon name="people" size={32} color="textSecondary" />
                  <Text preset="paragraphSmall" color="textSecondary" mt="s8">
                    Sem passageiros confirmados
                  </Text>
                </Box>
              ) : (
                <Box>
                  {passengers.map(p => (
                    <Box
                      key={p.id}
                      backgroundColor="surface"
                      borderRadius="s12"
                      padding="s16"
                      mb="s8"
                      flexDirection="row"
                      alignItems="center">
                      <Box
                        width={40}
                        height={40}
                        borderRadius="s20"
                        backgroundColor="secondaryBg"
                        alignItems="center"
                        justifyContent="center"
                        mr="s12">
                        <Icon name="person" size={22} color="secondary" />
                      </Box>
                      <Box flex={1}>
                        <Text preset="paragraphSmall" color="text" bold>
                          {p.name}
                        </Text>
                        <Text preset="paragraphCaptionSmall" color="textSecondary">
                          {p.phone} · {p.quantity} {p.quantity === 1 ? 'assento' : 'assentos'}
                        </Text>
                      </Box>
                      {p.checkedInAt ? (
                        <Box
                          backgroundColor="successBg"
                          paddingHorizontal="s8"
                          paddingVertical="s4"
                          style={{borderRadius: 6}}>
                          <Text preset="paragraphCaptionSmall" color="success" bold>
                            Check-in
                          </Text>
                        </Box>
                      ) : null}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Shipments */}
            <Box mb="s16">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Encomendas ({shipments.length})
              </Text>
              {shipmentsLoading ? (
                <Box
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s20"
                  alignItems="center">
                  <ActivityIndicator size="small" color="#0a6fbd" />
                </Box>
              ) : shipments.length === 0 ? (
                <Box
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s20"
                  alignItems="center">
                  <Icon name="inventory" size={32} color="textSecondary" />
                  <Text preset="paragraphSmall" color="textSecondary" mt="s8">
                    Sem encomendas nesta viagem
                  </Text>
                </Box>
              ) : (
                <Box>
                  {shipments.map(shipment => {
                    const canCollect = shipment.status === ShipmentStatus.PAID;
                    const canDeliver = shipment.status === ShipmentStatus.ARRIVED;
                    const isActionable = canCollect || canDeliver;
                    return (
                      <TouchableOpacityBox
                        key={shipment.id}
                        backgroundColor="surface"
                        borderRadius="s12"
                        padding="s16"
                        mb="s8"
                        flexDirection="row"
                        alignItems="center"
                        onPress={() =>
                          navigation.navigate('CaptainShipmentCollect', {shipmentId: shipment.id})
                        }>
                        <Icon name="inventory-2" size={20} color="primary" />
                        <Box flex={1} mx="s12">
                          <Text preset="paragraphSmall" color="text" bold>
                            {shipment.trackingCode}
                          </Text>
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            {shipment.recipientName} · {SHIPMENT_STATUS_LABELS[shipment.status] || shipment.status}
                          </Text>
                        </Box>
                        {isActionable ? (
                          <Box
                            backgroundColor={canCollect ? 'secondary' : 'info'}
                            paddingHorizontal="s10"
                            paddingVertical="s6"
                            style={{borderRadius: 8}}>
                            <Text preset="paragraphCaptionSmall" color="surface" bold>
                              {canCollect ? 'Coletar' : 'Entregar'}
                            </Text>
                          </Box>
                        ) : (
                          <Icon name="chevron-right" size={18} color="textSecondary" />
                        )}
                      </TouchableOpacityBox>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            {trip.status === TripStatus.SCHEDULED && (
              <Button
                title="Iniciar Viagem"
                onPress={() => navigation.navigate('CaptainChecklist', {tripId})}
                disabled={isActionLoading}
              />
            )}
            {trip.status === TripStatus.IN_PROGRESS && (
              <>
                <Button
                  title="Ver no Mapa"
                  onPress={() =>
                    navigation.navigate('CaptainTripLive', {
                      tripId: trip.id,
                      origin: trip.origin,
                      destination: trip.destination,
                    })
                  }
                  disabled={isActionLoading}
                  mb="s12"
                />
                <Button
                  title={completeLoading ? 'Concluindo...' : 'Concluir Viagem'}
                  onPress={() => setShowCompleteModal(true)}
                  disabled={isActionLoading}
                  preset="outline"
                />
              </>
            )}
          </ScrollView>
        )}
      </Box>

      {/* Complete Confirmation Modal */}
      <ConfirmationModal
        visible={showCompleteModal}
        title="Concluir Viagem"
        message="Confirma a conclusão desta viagem? Esta ação não pode ser desfeita."
        icon="check-circle"
        iconColor="success"
        confirmText="Concluir"
        cancelText="Cancelar"
        onConfirm={handleCompleteTrip}
        onCancel={() => setShowCompleteModal(false)}
        isLoading={completeLoading}
      />
    </>
  );
}
