import React from 'react';
import {ScrollView, Image, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {ShipmentShareCard} from './ShipmentShareCard';

import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Button, Icon, Text, TextInput, ConfirmationModal, InfoModal, TouchableOpacityBox, PhotoViewerModal, usePhotoViewer} from '@components';
import {ShipmentStatus} from '@domain';

import {useShipmentDetailsScreen} from './useShipmentDetailsScreen';

const ss = StyleSheet.create({
  offScreen: {
    position: 'absolute',
    top: -5000,
    left: 0,
  },
});

export function ShipmentDetailsScreen() {
  const {openViewer, viewerProps} = usePhotoViewer();
  const {
    navigation,
    shipment,
    timeline,
    isLoading,
    showLoadErrorModal, setShowLoadErrorModal,
    showCancelModal, setShowCancelModal,
    showCancelErrorModal, setShowCancelErrorModal,
    showConfirmPaymentModal, setShowConfirmPaymentModal,
    showPaymentErrorModal, setShowPaymentErrorModal,
    showCollectPinModal, setShowCollectPinModal,
    collectPin, setCollectPin,
    showCollectModal, setShowCollectModal,
    showCollectErrorModal, setShowCollectErrorModal,
    showOutForDeliveryModal, setShowOutForDeliveryModal,
    showOutForDeliveryErrorModal, setShowOutForDeliveryErrorModal,
    errorMessage, setErrorMessage,
    isConfirmingPayment,
    isCollecting,
    isMarkingOutForDelivery,
    statusConfig,
    isFreteACobrar,
    canConfirmPayment,
    canCollect,
    canOutForDelivery,
    showValidationPIN,
    pinIsForDelivery,
    canCancel,
    lockedCancellationLabel,
    canReview,
    getPaymentMethodLabel,
    resolvePhotoUri,
    shareCardRef,
    handleShare,
    handleCancel,
    confirmCancel,
    handleReview,
    handleConfirmPayment,
    confirmPaymentAction,
    handleCollect,
    confirmCollect,
    executeCollect,
    handleOutForDelivery,
    confirmOutForDelivery,
  } = useShipmentDetailsScreen();

  if (isLoading || !shipment || !statusConfig) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#007BFF" />
        <Text preset="paragraphMedium" color="text" mt="s16">
          Carregando encomenda...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box padding="s20">
          {/* Status Badge */}
          <Box
            backgroundColor={statusConfig.bg}
            paddingHorizontal="s16"
            paddingVertical="s12"
            borderRadius="s12"
            flexDirection="row"
            alignItems="center"
            alignSelf="flex-start"
            mb="s24">
            <Icon name={statusConfig.icon} size={20} color={statusConfig.color} />
            <Text preset="paragraphMedium" color={statusConfig.color} bold ml="s8">
              {statusConfig.label}
            </Text>
          </Box>

          {/* QR Code */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s24"
            alignItems="center"
            mb="s24"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            {shipment.trackingCode ? (
              <>
                <QRCode
                  value={shipment.trackingCode}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
                <Text preset="paragraphSmall" color="textSecondary" mt="s16">
                  Código de Rastreamento
                </Text>
                <Text preset="headingSmall" color="primary" bold mt="s4">
                  {shipment.trackingCode}
                </Text>
              </>
            ) : (
              <Box alignItems="center">
                <Icon name="qr-code" size={100} color="textSecondary" />
                <Text preset="paragraphMedium" color="textSecondary" mt="s12">
                  QR Code não disponível
                </Text>
              </Box>
            )}
          </Box>

          {/* v2.0 - PIN de Validação */}
          {showValidationPIN && (
            <Box
              backgroundColor="primaryBg"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{
                shadowColor: '#007BFF',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 2,
                borderColor: '#007BFF',
              }}>
              <Box alignItems="center">
                <Box mb="s12">
                  <Icon name="lock" size={40} color="primary" />
                </Box>
                <Text preset="paragraphMedium" color="primary" bold mb="s8">
                  {pinIsForDelivery ? 'PIN de Entrega' : 'PIN de Coleta'}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary" textAlign="center" mb="s16">
                  {pinIsForDelivery
                    ? 'Forneça este código ao destinatário para confirmar a entrega'
                    : 'Compartilhe este PIN com o capitão para coleta manual'}
                </Text>
                <Box
                  backgroundColor="surface"
                  paddingHorizontal="s24"
                  paddingVertical="s16"
                  borderRadius="s12">
                  <Text preset="headingLarge" color="primary" bold style={{letterSpacing: 8}}>
                    {shipment.validationCode}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          {/* v2.0 - NavegaCoins Ganhas (DELIVERED) */}
          {shipment.status === ShipmentStatus.DELIVERED &&
            shipment.navegaCoinsEarned !== undefined &&
            shipment.navegaCoinsEarned > 0 && (
              <Box
                backgroundColor="successBg"
                borderRadius="s16"
                padding="s20"
                mb="s16"
                style={{
                  shadowColor: '#28A745',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 2,
                  borderColor: '#28A745',
                }}>
                <Box alignItems="center" flexDirection="row" justifyContent="center">
                  <Box mr="s12">
                    <Icon name="stars" size={32} color="success" />
                  </Box>
                  <Box>
                    <Text preset="paragraphSmall" color="success" mb="s4">
                      Você ganhou
                    </Text>
                    <Text preset="headingMedium" color="success" bold>
                      {shipment.navegaCoinsEarned} NavegaCoins! 🎉
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

          {/* Destinatário */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Destinatário
            </Text>

            <Box flexDirection="row" alignItems="center" mb="s12">
              <Icon name="person" size={20} color="primary" />
              <Text preset="paragraphMedium" color="text" ml="s12">
                {shipment.recipientName}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" mb="s12">
              <Icon name="phone" size={20} color="primary" />
              <Text preset="paragraphMedium" color="text" ml="s12">
                {shipment.recipientPhone}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="flex-start">
              <Icon name="location-on" size={20} color="primary" />
              <Text preset="paragraphMedium" color="text" ml="s12" flex={1}>
                {shipment.recipientAddress}
              </Text>
            </Box>
          </Box>

          {/* Detalhes da Encomenda */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Detalhes
            </Text>

            <Box mb="s12">
              <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                Descrição
              </Text>
              <Text preset="paragraphSmall" color="text" bold>
                {shipment.description}
              </Text>
            </Box>

            <Box flexDirection="row" justifyContent="space-between" mb="s12">
              <Text preset="paragraphSmall" color="textSecondary">
                Peso
              </Text>
              <Text preset="paragraphSmall" color="text" bold>
                {shipment.weight != null ? `${shipment.weight} kg` : '—'}
              </Text>
            </Box>

            {shipment.dimensions && (
              <Box flexDirection="row" justifyContent="space-between" mb="s12">
                <Text preset="paragraphSmall" color="textSecondary">
                  Dimensões
                </Text>
                <Text preset="paragraphSmall" color="text" bold>
                  {shipment.dimensions.length ?? '—'} × {shipment.dimensions.width ?? '—'} ×{' '}
                  {shipment.dimensions.height ?? '—'} cm
                </Text>
              </Box>
            )}

            <Box flexDirection="row" justifyContent="space-between" mb="s12">
              <Text preset="paragraphSmall" color="textSecondary">
                Pagamento
              </Text>
              <Text preset="paragraphSmall" color="text" bold>
                {getPaymentMethodLabel(shipment.paymentMethod)}
              </Text>
            </Box>

            <Box flexDirection="row" justifyContent="space-between" mb="s12">
              <Text preset="paragraphSmall" color="textSecondary">
                Pago por
              </Text>
              <Text preset="paragraphSmall" color={isFreteACobrar ? 'warning' : 'text'} bold>
                {isFreteACobrar ? 'Destinatário (frete a cobrar)' : 'Remetente'}
              </Text>
            </Box>

            <Box
              borderTopWidth={1}
              borderTopColor="border"
              paddingTop="s12"
              marginTop="s4"
              flexDirection="row"
              justifyContent="space-between">
              <Text preset="paragraphMedium" color="text" bold>
                Total
              </Text>
              <Text preset="headingSmall" color="primary" bold>
                {shipment.price}
              </Text>
            </Box>
          </Box>

          {/* Viagem (se populada) */}
          {shipment.trip && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Viagem
              </Text>

              {(shipment.trip.origin || shipment.trip.destination) ? (
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Icon name="directions-boat" size={20} color="primary" />
                  <Text preset="paragraphMedium" color="text" ml="s12" flex={1}>
                    {shipment.trip.origin || '—'} → {shipment.trip.destination || '—'}
                  </Text>
                </Box>
              ) : shipment.trip.route ? (
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Icon name="directions-boat" size={20} color="primary" />
                  <Text preset="paragraphMedium" color="text" ml="s12" flex={1}>
                    {shipment.trip.route.origin || shipment.trip.route.originCity || '—'}
                    {' → '}
                    {shipment.trip.route.destination || shipment.trip.route.destinationCity || '—'}
                  </Text>
                </Box>
              ) : null}

              {shipment.trip.departureAt && (
                <Box flexDirection="row" alignItems="center">
                  <Icon name="schedule" size={20} color="primary" />
                  <Text preset="paragraphMedium" color="text" ml="s12">
                    {format(new Date(shipment.trip.departureAt), "dd 'de' MMM, HH:mm", {
                      locale: ptBR,
                    })}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s24"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Histórico
              </Text>

              {timeline.map((event, index) => (
                <Box key={event.id} flexDirection="row" mb={index < timeline.length - 1 ? 's16' : undefined}>
                  <Box alignItems="center" mr="s12">
                    <Box
                      width={32}
                      height={32}
                      borderRadius="s16"
                      backgroundColor="primaryBg"
                      alignItems="center"
                      justifyContent="center">
                      <Icon name="check" size={16} color="primary" />
                    </Box>
                    {index < timeline.length - 1 && (
                      <Box width={2} flex={1} backgroundColor="border" mt="s4" />
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text preset="paragraphMedium" color="text" bold mb="s4">
                      {event.description}
                    </Text>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </Text>
                    {event.location && (
                      <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                        📍 {event.location}
                      </Text>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Fotos */}
          {shipment.photos && shipment.photos.length > 0 && (
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Fotos da Encomenda
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="s12">
                {shipment.photos.map((photoUrl, index) => {
                  const uri = resolvePhotoUri(photoUrl);
                  return (
                    <Box
                      key={index}
                      width={100}
                      height={100}
                      borderRadius="s12"
                      backgroundColor="background">
                      <TouchableOpacityBox
                        onPress={() =>
                          openViewer(
                            shipment.photos!.map((item, photoIndex) => ({
                              id: `shipment-photo-${photoIndex}`,
                              uri: resolvePhotoUri(item),
                              title: shipment.description || 'Foto da encomenda',
                            })),
                            index,
                            'Fotos da encomenda',
                          )
                        }>
                        <Image
                          source={{uri}}
                          style={{width: '100%', height: '100%', borderRadius: 12}}
                          resizeMode="cover"
                        />
                      </TouchableOpacityBox>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Frete a cobrar — banner informativo */}
          {isFreteACobrar && shipment.status === ShipmentStatus.PENDING && (
            <Box
              backgroundColor="warningBg"
              borderRadius="s12"
              padding="s16"
              mb="s16"
              flexDirection="row"
              alignItems="flex-start"
              gap="s12">
              <Icon name="info" size={20} color="warning" />
              <Box flex={1}>
                <Text preset="paragraphSmall" color="warning" bold mb="s4">
                  Frete a cobrar
                </Text>
                <Text preset="paragraphCaptionSmall" color="warning">
                  O destinatário pagará em dinheiro ao capitão na entrega. Não é necessário confirmar pagamento agora.
                </Text>
              </Box>
            </Box>
          )}

          {/* Botões de ação */}
          <Box gap="s12" mb="s40">
            {/* v2.0 - Confirmar Pagamento (PENDING → PAID) */}
            {canConfirmPayment && (
              <Button
                title="Confirmar Pagamento"
                preset="primary"
                leftIcon="check-circle"
                onPress={handleConfirmPayment}
                loading={isConfirmingPayment}
              />
            )}

            {/* v2.0 - Coletar Encomenda (PAID → COLLECTED) - Capitão */}
            {canCollect && (
              <>
                <Button
                  title="Escanear QR Code"
                  preset="primary"
                  leftIcon="qr-code-scanner"
                  onPress={() => navigation.navigate('ScanShipmentQR')}
                />
                <Button
                  title="Coletar Manualmente"
                  preset="outline"
                  leftIcon="inventory-2"
                  onPress={handleCollect}
                  loading={isCollecting}
                />
              </>
            )}

            {/* v2.0 - Saiu para Entrega (ARRIVED → OUT_FOR_DELIVERY) - Capitão */}
            {canOutForDelivery && (
              <Button
                title="Marcar como Saiu para Entrega"
                preset="primary"
                leftIcon="delivery-dining"
                onPress={handleOutForDelivery}
                loading={isMarkingOutForDelivery}
              />
            )}

            <Button
              title="Compartilhar"
              preset="outline"
              leftIcon="share"
              onPress={handleShare}
            />

            {canCancel && (
              <Button
                title="Cancelar Encomenda"
                preset="outline"
                leftIcon="cancel"
                onPress={handleCancel}
              />
            )}

            {!canCancel && lockedCancellationLabel && (
              <Box
                paddingVertical="s16"
                paddingHorizontal="s16"
                backgroundColor={
                  shipment.status === ShipmentStatus.DELIVERED
                    ? 'successBg'
                    : 'infoBg'
                }
                borderRadius="s12"
                alignItems="center">
                <Text
                  preset="paragraphMedium"
                  color={
                    shipment.status === ShipmentStatus.DELIVERED
                      ? 'success'
                      : 'info'
                  }
                  bold
                  textAlign="center">
                  {lockedCancellationLabel}
                </Text>
              </Box>
            )}

            {canReview && (
              <Button
                title="Avaliar Entrega"
                preset="primary"
                leftIcon="star"
                onPress={handleReview}
              />
            )}
          </Box>
        </Box>
      </ScrollView>

      <PhotoViewerModal {...viewerProps} />

      {/* Load Error Modal */}
      <InfoModal
        visible={showLoadErrorModal}
        title="Erro ao Carregar"
        message="Não foi possível carregar os dados da encomenda"
        icon="error-outline"
        iconColor="danger"
        buttonText="Voltar"
        onClose={() => {
          setShowLoadErrorModal(false);
          navigation.goBack();
        }}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancelar Encomenda"
        message="Tem certeza que deseja cancelar esta encomenda?"
        icon="cancel"
        iconColor="danger"
        confirmText="Sim, cancelar"
        cancelText="Não"
        confirmPreset="outline"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Cancel Error Modal */}
      <InfoModal
        visible={showCancelErrorModal}
        title="Erro ao Cancelar"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowCancelErrorModal(false);
          setErrorMessage('');
        }}
      />

      {/* Confirm Payment Modal */}
      <ConfirmationModal
        visible={showConfirmPaymentModal}
        title="Confirmar Pagamento"
        message="Deseja confirmar o pagamento desta encomenda?"
        icon="payment"
        iconColor="success"
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={confirmPaymentAction}
        onCancel={() => setShowConfirmPaymentModal(false)}
        isLoading={isConfirmingPayment}
      />

      {/* Payment Error Modal */}
      <InfoModal
        visible={showPaymentErrorModal}
        title="Erro ao Confirmar Pagamento"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowPaymentErrorModal(false);
          setErrorMessage('');
        }}
      />

      {/* Collect PIN Input Modal */}
      <Modal
        visible={showCollectPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCollectPinModal(false)}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              width="85%"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 8},
                shadowOpacity: 0.2,
                shadowRadius: 24,
                elevation: 10,
              }}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="inventory-2" size={24} color="primary" />
                <Text preset="headingSmall" color="text" bold ml="s12">
                  Coletar Encomenda
                </Text>
              </Box>

              <Text preset="paragraphMedium" color="textSecondary" mb="s20">
                Digite o PIN de 6 dígitos do destinatário para confirmar a coleta. Deixe em branco se não disponível.
              </Text>

              <TextInput
                placeholder="PIN de validação (6 dígitos)"
                value={collectPin}
                onChangeText={setCollectPin}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <Box flexDirection="row" gap="s12" mt="s20">
                <TouchableOpacityBox
                  flex={1}
                  paddingVertical="s16"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor="border"
                  alignItems="center"
                  onPress={() => setShowCollectPinModal(false)}>
                  <Text preset="paragraphMedium" color="text">
                    Cancelar
                  </Text>
                </TouchableOpacityBox>
                <TouchableOpacityBox
                  flex={1}
                  paddingVertical="s16"
                  borderRadius="s12"
                  backgroundColor="primary"
                  alignItems="center"
                  onPress={confirmCollect}>
                  <Text preset="paragraphMedium" color="surface" bold>
                    Continuar
                  </Text>
                </TouchableOpacityBox>
              </Box>
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </Modal>

      {/* Collect Confirmation Modal */}
      <ConfirmationModal
        visible={showCollectModal}
        title="Confirmar Coleta"
        message={`PIN: ${collectPin || '(não informado)'}\n\nDeseja confirmar a coleta desta encomenda?`}
        icon="inventory"
        iconColor="success"
        confirmText="Coletar"
        cancelText="Voltar"
        confirmPreset="primary"
        onConfirm={executeCollect}
        onCancel={() => {
          setShowCollectModal(false);
          setShowCollectPinModal(true);
        }}
        isLoading={isCollecting}
      />

      {/* Collect Error Modal */}
      <InfoModal
        visible={showCollectErrorModal}
        title="Erro ao Coletar"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowCollectErrorModal(false);
          setErrorMessage('');
        }}
      />

      {/* Out for Delivery Confirmation Modal */}
      <ConfirmationModal
        visible={showOutForDeliveryModal}
        title="Saiu para Entrega"
        message='Marcar esta encomenda como "Saiu para Entrega"?'
        icon="local-shipping"
        iconColor="primary"
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={confirmOutForDelivery}
        onCancel={() => setShowOutForDeliveryModal(false)}
        isLoading={isMarkingOutForDelivery}
      />

      {/* Out for Delivery Error Modal */}
      <InfoModal
        visible={showOutForDeliveryErrorModal}
        title="Erro ao Atualizar Status"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowOutForDeliveryErrorModal(false);
          setErrorMessage('');
        }}
      />

      {/* Share card — renderizado off-screen para captura de imagem */}
      {shipment && (
        <View style={ss.offScreen} pointerEvents="none">
          <ShipmentShareCard ref={shareCardRef} shipment={shipment} />
        </View>
      )}
    </Box>
  );
}
