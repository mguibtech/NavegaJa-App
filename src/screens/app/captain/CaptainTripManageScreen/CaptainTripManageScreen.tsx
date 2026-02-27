import React from 'react';
import {ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Icon, Text, TouchableOpacityBox, ConfirmationModal} from '@components';
import {TripStatus, ShipmentStatus} from '@domain';
import {usePdfDownload} from '@hooks';
import {formatBRL} from '@utils';

import {
  useCaptainTripManage,
  STATUS_CONFIG,
  SHIPMENT_STATUS_LABELS,
} from './useCaptainTripManage';

export function CaptainTripManageScreen() {
  const {top} = useSafeAreaInsets();
  const {download, isDownloading} = usePdfDownload();
  const {
    trip,
    tripLoading,
    manageLoading,
    manageError,
    passengers,
    shipments,
    refreshing,
    completeLoading,
    isActionLoading,
    showCompleteModal,
    setShowCompleteModal,
    showCancelModal,
    setShowCancelModal,
    onRefresh,
    handleCompleteTrip,
    handleCancelTrip,
    formatDate,
    goBack,
    navigateToChecklist,
    navigateToShipmentCollect,
    navigateToTripLive,
    navigateToChat,
    navigateToScanQR,
  } = useCaptainTripManage();

  const canScanQR =
    trip?.status === TripStatus.SCHEDULED || trip?.status === TripStatus.IN_PROGRESS;

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
              onPress={goBack}
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
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                mb="s12">
                <Text preset="paragraphMedium" color="text" bold>
                  Passageiros ({passengers.length})
                </Text>
                {canScanQR && (
                  <TouchableOpacityBox
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="primaryBg"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s8"
                    onPress={navigateToScanQR}>
                    <Icon name="qr-code-scanner" size={16} color="primary" />
                    <Text preset="paragraphCaptionSmall" color="primary" bold ml="s6">
                      Escanear QR
                    </Text>
                  </TouchableOpacityBox>
                )}
              </Box>

              {manageLoading && passengers.length === 0 ? (
                <Box backgroundColor="surface" borderRadius="s12" padding="s20" alignItems="center">
                  <ActivityIndicator size="small" color="#0a6fbd" />
                </Box>
              ) : manageError ? (
                <Box backgroundColor="dangerBg" borderRadius="s12" padding="s16" flexDirection="row" alignItems="center">
                  <Icon name="error-outline" size={20} color="danger" />
                  <Text preset="paragraphSmall" color="danger" ml="s8" flex={1}>
                    Erro ao carregar dados. Puxe para atualizar.
                  </Text>
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
                  {passengers.map(p => {
                    const checkedIn = !!p.checkedInAt;
                    return (
                      <Box
                        key={p.bookingId}
                        backgroundColor="surface"
                        borderRadius="s12"
                        padding="s16"
                        mb="s8"
                        flexDirection="row"
                        alignItems="center"
                        style={{
                          borderLeftWidth: 3,
                          borderLeftColor: checkedIn ? '#22C55E' : '#64748B',
                        }}>
                        <Box
                          width={40}
                          height={40}
                          borderRadius="s20"
                          backgroundColor={checkedIn ? 'successBg' : 'secondaryBg'}
                          alignItems="center"
                          justifyContent="center"
                          mr="s12">
                          <Icon
                            name={checkedIn ? 'how-to-reg' : 'person'}
                            size={22}
                            color={checkedIn ? 'success' : 'secondary'}
                          />
                        </Box>
                        <Box flex={1}>
                          <Text preset="paragraphSmall" color="text" bold>
                            {p.passenger.name}
                          </Text>
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            {p.passenger.phone} · {p.seats}{' '}
                            {p.seats === 1 ? 'assento' : 'assentos'}
                          </Text>
                        </Box>
                        <Box flexDirection="row" alignItems="center" gap="s8">
                          {checkedIn ? (
                            <Box
                              backgroundColor="successBg"
                              paddingHorizontal="s8"
                              paddingVertical="s4"
                              style={{borderRadius: 6}}>
                              <Text preset="paragraphCaptionSmall" color="success" bold>
                                Embarcou
                              </Text>
                            </Box>
                          ) : (
                            <Box
                              backgroundColor="warningBg"
                              paddingHorizontal="s8"
                              paddingVertical="s4"
                              style={{borderRadius: 6}}>
                              <Text preset="paragraphCaptionSmall" color="warning" bold>
                                Pendente
                              </Text>
                            </Box>
                          )}
                          <TouchableOpacityBox
                            width={32}
                            height={32}
                            borderRadius="s16"
                            backgroundColor="primaryBg"
                            alignItems="center"
                            justifyContent="center"
                            onPress={() => navigateToChat(p.bookingId, p.passenger.name)}>
                            <Icon name="chat" size={16} color="primary" />
                          </TouchableOpacityBox>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Shipments */}
            <Box mb="s16">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                <Text preset="paragraphMedium" color="text" bold>
                  Encomendas ({shipments.length})
                </Text>
                {shipments.length > 0 && (
                  <TouchableOpacityBox
                    flexDirection="row"
                    alignItems="center"
                    onPress={() =>
                      download(
                        `/trips/${trip.id}/cargo-manifest`,
                        `manifesto-${trip.id.slice(0, 8)}.pdf`,
                      )
                    }
                    disabled={isDownloading}>
                    <Icon name="picture-as-pdf" size={16} color="secondary" />
                    <Text preset="paragraphCaptionSmall" color="secondary" ml="s4" bold>
                      {isDownloading ? 'Baixando...' : 'Manifesto'}
                    </Text>
                  </TouchableOpacityBox>
                )}
              </Box>
              {manageLoading && shipments.length === 0 ? (
                <Box
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s20"
                  alignItems="center">
                  <ActivityIndicator size="small" color="#0a6fbd" />
                </Box>
              ) : manageError ? null : shipments.length === 0 ? (
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
                  {shipments.map((shipment, index) => {
                    const canCollect = shipment.status === ShipmentStatus.PAID;
                    const canDeliver = shipment.status === ShipmentStatus.ARRIVED;
                    const isActionable = canCollect || canDeliver;
                    const key = shipment.id ?? shipment.trackingCode ?? String(index);
                    return (
                      <TouchableOpacityBox
                        key={key}
                        backgroundColor="surface"
                        borderRadius="s12"
                        padding="s16"
                        mb="s8"
                        flexDirection="row"
                        alignItems="center"
                        onPress={() => shipment.id && navigateToShipmentCollect(shipment.id, shipment.validationCode)}>
                        <Icon name="inventory-2" size={20} color="primary" />
                        <Box flex={1} mx="s12">
                          <Text preset="paragraphSmall" color="text" bold>
                            {shipment.trackingCode}
                          </Text>
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            {shipment.recipientName} ·{' '}
                            {SHIPMENT_STATUS_LABELS[shipment.status] || shipment.status}
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
              <>
                <Button
                  title="Iniciar Viagem"
                  onPress={navigateToChecklist}
                  disabled={isActionLoading}
                  mb="s12"
                />
                <Button
                  title="Cancelar Viagem"
                  onPress={() => setShowCancelModal(true)}
                  disabled={isActionLoading}
                  preset="outline"
                />
              </>
            )}
            {trip.status === TripStatus.IN_PROGRESS && (
              <>
                <Button
                  title="Ver no Mapa"
                  onPress={navigateToTripLive}
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
        cancelText="Voltar"
        onConfirm={handleCompleteTrip}
        onCancel={() => setShowCompleteModal(false)}
        isLoading={completeLoading}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancelar Viagem"
        message="Tem certeza que deseja cancelar esta viagem? Todas as reservas serão afetadas."
        icon="warning"
        iconColor="danger"
        confirmText="Sim, cancelar"
        cancelText="Voltar"
        onConfirm={handleCancelTrip}
        onCancel={() => setShowCancelModal(false)}
        isLoading={isActionLoading}
      />
    </>
  );
}
