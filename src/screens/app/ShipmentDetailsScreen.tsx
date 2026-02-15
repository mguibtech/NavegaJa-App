import React, {useEffect, useState} from 'react';
import {ScrollView, Share, ActivityIndicator, Image} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Button, Icon, Text, ConfirmationModal, InfoModal} from '@components';
import {
  Shipment,
  shipmentAPI,
  ShipmentStatus,
  ShipmentTimelineEvent,
  PaymentMethod,
  useConfirmPayment,
  useCollectShipment,
  useOutForDelivery,
} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'ShipmentDetails'>;

export function ShipmentDetailsScreen({navigation, route}: Props) {
  const {shipmentId} = route.params;
  const toast = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<ShipmentTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelErrorModal, setShowCancelErrorModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showCollectErrorModal, setShowCollectErrorModal] = useState(false);
  const [showOutForDeliveryModal, setShowOutForDeliveryModal] = useState(false);
  const [showOutForDeliveryErrorModal, setShowOutForDeliveryErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // v2.0 hooks
  const {confirm: confirmPayment, isLoading: isConfirmingPayment} = useConfirmPayment();
  const {collect: collectShipment, isLoading: isCollecting} = useCollectShipment();
  const {markOutForDelivery, isLoading: isMarkingOutForDelivery} = useOutForDelivery();

  useEffect(() => {
    loadShipmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  async function loadShipmentData() {
    setIsLoading(true);
    try {
      const shipmentData = await shipmentAPI.getById(shipmentId);
      setShipment(shipmentData);

      // Load timeline
      const timelineData = await shipmentAPI.getTimeline(shipmentId);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load shipment:', error);
      setShowLoadErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return {
          label: 'Aguardando Pagamento',
          color: 'warning' as const,
          bg: 'warningBg' as const,
          icon: 'schedule' as const,
        };
      case ShipmentStatus.PAID:
        return {
          label: 'Pagamento Confirmado',
          color: 'success' as const,
          bg: 'successBg' as const,
          icon: 'check-circle' as const,
        };
      case ShipmentStatus.COLLECTED:
        return {
          label: 'Coletada pelo Capitão',
          color: 'info' as const,
          bg: 'infoBg' as const,
          icon: 'inventory-2' as const,
        };
      case ShipmentStatus.IN_TRANSIT:
        return {
          label: 'Em Trânsito',
          color: 'info' as const,
          bg: 'infoBg' as const,
          icon: 'local-shipping' as const,
        };
      case ShipmentStatus.ARRIVED:
        return {
          label: 'Chegou ao Destino',
          color: 'info' as const,
          bg: 'infoBg' as const,
          icon: 'place' as const,
        };
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return {
          label: 'Saiu para Entrega',
          color: 'primary' as const,
          bg: 'primaryBg' as const,
          icon: 'delivery-dining' as const,
        };
      case ShipmentStatus.DELIVERED:
        return {
          label: 'Entregue',
          color: 'success' as const,
          bg: 'successBg' as const,
          icon: 'check-circle' as const,
        };
      case ShipmentStatus.CANCELLED:
        return {
          label: 'Cancelada',
          color: 'danger' as const,
          bg: 'dangerBg' as const,
          icon: 'cancel' as const,
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'textSecondary' as const,
          bg: 'background' as const,
          icon: 'help-outline' as const,
        };
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.PIX:
        return 'PIX';
      case PaymentMethod.CASH:
        return 'Dinheiro';
      case PaymentMethod.CREDIT_CARD:
        return 'Cartão de Crédito';
      case PaymentMethod.DEBIT_CARD:
        return 'Cartão de Débito';
      default:
        return method;
    }
  };

  async function handleShare() {
    if (!shipment) return;

    try {
      await Share.share({
        message: `Código de rastreamento da encomenda:\n${shipment.trackingCode}\n\nDestinatário: ${shipment.recipientName}\nPeso: ${shipment.weight}kg\nPreço: R$ ${shipment.price.toFixed(2)}`,
        title: 'Compartilhar Encomenda',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  async function handleCancel() {
    if (!shipment) return;
    setShowCancelModal(true);
  }

  async function confirmCancel() {
    if (!shipment) return;

    setShowCancelModal(false);

    try {
      await shipmentAPI.cancel(shipment.id);
      toast.showSuccess('Encomenda cancelada! Sua encomenda foi cancelada com sucesso');
      navigation.goBack();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível cancelar a encomenda');
      setShowCancelErrorModal(true);
    }
  }

  function handleReview() {
    if (!shipment) return;
    navigation.navigate('ShipmentReview', {shipmentId: shipment.id});
  }

  // v2.0 - Confirmar pagamento (PENDING → PAID)
  async function handleConfirmPayment() {
    if (!shipment) return;
    setShowConfirmPaymentModal(true);
  }

  async function confirmPaymentAction() {
    if (!shipment) return;

    setShowConfirmPaymentModal(false);

    try {
      const result = await confirmPayment(shipment.id);
      toast.showSuccess(result.message);
      loadShipmentData(); // Recarregar dados
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível confirmar o pagamento');
      setShowPaymentErrorModal(true);
    }
  }

  // v2.0 - Coletar encomenda (PAID → COLLECTED)
  async function handleCollect() {
    if (!shipment) return;
    setShowCollectModal(true);
  }

  async function confirmCollect() {
    if (!shipment) return;

    setShowCollectModal(false);

    try {
      // TODO: Implementar captura de foto (PhotoPicker)
      const result = await collectShipment(shipment.id);
      toast.showSuccess(result.message);
      loadShipmentData(); // Recarregar dados
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível coletar a encomenda');
      setShowCollectErrorModal(true);
    }
  }

  // v2.0 - Marcar como saiu para entrega (ARRIVED → OUT_FOR_DELIVERY)
  async function handleOutForDelivery() {
    if (!shipment) return;
    setShowOutForDeliveryModal(true);
  }

  async function confirmOutForDelivery() {
    if (!shipment) return;

    setShowOutForDeliveryModal(false);

    try {
      const result = await markOutForDelivery(shipment.id);
      toast.showSuccess(result.message);
      loadShipmentData(); // Recarregar dados
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível atualizar o status');
      setShowOutForDeliveryErrorModal(true);
    }
  }

  if (isLoading || !shipment) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#007BFF" />
        <Text preset="paragraphMedium" color="text" mt="s16">
          Carregando encomenda...
        </Text>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(shipment.status);

  // v2.0 - Permissões baseadas em status
  const canConfirmPayment = shipment.status === ShipmentStatus.PENDING;
  const canCollect = shipment.status === ShipmentStatus.PAID; // Capitão
  const canOutForDelivery = shipment.status === ShipmentStatus.ARRIVED; // Capitão
  const showValidationPIN = shipment.status === ShipmentStatus.OUT_FOR_DELIVERY;
  const canCancel =
    shipment.status === ShipmentStatus.PENDING ||
    shipment.status === ShipmentStatus.PAID;
  const canReview = shipment.status === ShipmentStatus.DELIVERED;

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
            {shipment.qrCode ? (
              <>
                <QRCode
                  value={shipment.qrCode}
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

          {/* v2.0 - PIN de Validação (OUT_FOR_DELIVERY) */}
          {showValidationPIN && shipment.validationCode && (
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
                  PIN de Validação
                </Text>
                <Text preset="paragraphSmall" color="textSecondary" textAlign="center" mb="s16">
                  Forneça este código ao destinatário para confirmar a entrega
                </Text>
                <Box
                  backgroundColor="surface"
                  paddingHorizontal="s24"
                  paddingVertical="s16"
                  borderRadius="s12">
                  <Text preset="headingLarge" color="primary" bold letterSpacing={8}>
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

            <Box flexDirection="row" justifyContent="space-between" mb="s12">
              <Text preset="paragraphSmall" color="textSecondary">
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
                {shipment.weight}kg
              </Text>
            </Box>

            {shipment.dimensions && (
              <Box flexDirection="row" justifyContent="space-between" mb="s12">
                <Text preset="paragraphSmall" color="textSecondary">
                  Dimensões
                </Text>
                <Text preset="paragraphSmall" color="text" bold>
                  {shipment.dimensions.length} × {shipment.dimensions.width} ×{' '}
                  {shipment.dimensions.height} cm
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
                R$ {shipment.price.toFixed(2)}
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

              <Box flexDirection="row" alignItems="center" mb="s12">
                <Icon name="directions-boat" size={20} color="primary" />
                <Text preset="paragraphMedium" color="text" ml="s12">
                  {shipment.trip.origin} → {shipment.trip.destination}
                </Text>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Icon name="schedule" size={20} color="primary" />
                <Text preset="paragraphMedium" color="text" ml="s12">
                  {format(new Date(shipment.trip.departureAt), "dd 'de' MMM, HH:mm", {
                    locale: ptBR,
                  })}
                </Text>
              </Box>
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
                {shipment.photos.map((photoUrl, index) => (
                  <Box
                    key={index}
                    width={100}
                    height={100}
                    borderRadius="s12"
                    backgroundColor="background">
                    <Image
                      source={{uri: photoUrl}}
                      style={{width: '100%', height: '100%', borderRadius: 12}}
                      resizeMode="cover"
                    />
                  </Box>
                ))}
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

      {/* Collect Confirmation Modal */}
      <ConfirmationModal
        visible={showCollectModal}
        title="Coletar Encomenda"
        message="Confirma a coleta desta encomenda? Tire uma foto opcional."
        icon="inventory"
        iconColor="success"
        confirmText="Coletar"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={confirmCollect}
        onCancel={() => setShowCollectModal(false)}
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
    </Box>
  );
}
