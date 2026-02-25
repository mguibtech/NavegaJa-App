import React, {useState, useEffect, useRef} from 'react';
import {ScrollView, Clipboard, ActivityIndicator, Image, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Text, Icon, TouchableOpacityBox, InfoModal} from '@components';
import {useToast} from '@hooks';
import {PaymentMethod, PaymentStatus, bookingAPI, Booking} from '@domain';

import {AppStackParamList} from '@routes';
import {formatBRL} from '@utils';

type Props = NativeStackScreenProps<AppStackParamList, 'Payment'>;

export function PaymentScreen({navigation, route}: Props) {
  const {bookingId, amount, paymentMethod} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadBookingData();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!booking?.pixExpiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(booking.pixExpiresAt!).getTime();
      const diff = expiry - now;
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);

      if (left <= 0) {
        clearInterval(timer);
        setShowExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking?.pixExpiresAt]);

  // Polling para verificar pagamento (a cada 5 segundos)
  useEffect(() => {
    if (paymentMethod !== PaymentMethod.PIX) return;
    if (!booking) return;

    const pollingInterval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(pollingInterval);
  }, [booking, paymentMethod]);

  async function loadBookingData() {
    try {
      const bookingData = await bookingAPI.getById(bookingId);
      setBooking(bookingData);

      if (paymentMethod !== PaymentMethod.PIX) {
        if (bookingData.status === 'confirmed') {
          navigation.replace('Ticket', {bookingId});
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.showError('Erro ao carregar dados de pagamento');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }

  async function checkPaymentStatus() {
    if (isCheckingPayment || !isMounted.current) return;

    try {
      setIsCheckingPayment(true);
      const status = await bookingAPI.getPaymentStatus(bookingId);

      if (!isMounted.current) return;

      if (status.paymentStatus === PaymentStatus.PAID) {
        setShowSuccessModal(true);
      } else if (status.isExpired) {
        setShowExpiredModal(true);
      }
    } catch {
      // Silent failure — polling errors are expected when transitioning screens
    } finally {
      if (isMounted.current) {
        setIsCheckingPayment(false);
      }
    }
  }

  function handleCopyPixCode() {
    if (booking?.pixQrCode) {
      Clipboard.setString(booking.pixQrCode);
      toast.showSuccess('Código PIX copiado!');
    }
  }

  async function handleSharePixCode() {
    if (!booking?.pixQrCode) return;

    try {
      await Share.share({
        title: 'Pagamento NavegaJá',
        message:
          `🛥️ NavegaJá — Pagamento PIX\n\n` +
          `Valor: ${formatBRL(amount)}\n` +
          `Reserva: #${bookingId.slice(0, 8).toUpperCase()}\n\n` +
          `Código PIX (Copia e Cola):\n${booking.pixQrCode}\n\n` +
          `Abra seu banco e use o código acima para pagar.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  function handlePaymentConfirmed() {
    setShowSuccessModal(false);
    navigation.replace('Ticket', {bookingId});
  }

  function handleExpired() {
    setShowExpiredModal(false);
    navigation.goBack();
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (isLoading) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#0E7AFE" />
        <Text preset="paragraphMedium" color="textSecondary" mt="s16">
          Gerando dados de pagamento...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header — padronizado */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s12"
            backgroundColor="background"
            borderWidth={1}
            borderColor="border"
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Text preset="headingSmall" color="text" bold ml="s12" flex={1}>
            Pagamento
          </Text>

          {/* Botão compartilhar no header (apenas PIX) */}
          {paymentMethod === PaymentMethod.PIX && booking?.pixQrCode && (
            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              onPress={handleSharePixCode}>
              <Icon name="share" size={20} color="primary" />
            </TouchableOpacityBox>
          )}
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{padding: 24}} showsVerticalScrollIndicator={false}>
        {/* Payment Method PIX */}
        {paymentMethod === PaymentMethod.PIX && booking && (
          <>
            {/* Timer */}
            <Box
              backgroundColor={timeLeft < 300 ? 'dangerBg' : 'infoBg'}
              borderRadius="s12"
              padding="s16"
              mb="s24"
              flexDirection="row"
              alignItems="center"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: timeLeft < 300 ? '#EF4444' : '#2196F3',
              }}>
              <Icon name="schedule" size={24} color={timeLeft < 300 ? 'danger' : 'info'} />
              <Box flex={1} ml="s12">
                <Text preset="paragraphMedium" color={timeLeft < 300 ? 'danger' : 'info'} bold>
                  Tempo restante: {formatTime(timeLeft)}
                </Text>
                <Text preset="paragraphSmall" color={timeLeft < 300 ? 'danger' : 'info'}>
                  {timeLeft < 300 ? 'Pague logo para não perder!' : 'Pague dentro deste prazo'}
                </Text>
              </Box>
            </Box>

            {/* Amount */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              mb="s24"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Text preset="paragraphMedium" color="textSecondary" mb="s8">
                Valor a pagar
              </Text>
              <Text preset="headingLarge" color="primary" bold>
                {formatBRL(amount)}
              </Text>
            </Box>

            {/* QR Code */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              mb="s24"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Text preset="paragraphLarge" color="text" bold mb="s16">
                Escaneie o QR Code
              </Text>

              {booking.pixQrCodeImage ? (
                <Box
                  backgroundColor="background"
                  borderRadius="s16"
                  padding="s16"
                  mb="s16"
                  style={{borderWidth: 2, borderColor: '#E0E0E0'}}>
                  <Image
                    source={{uri: booking.pixQrCodeImage}}
                    style={{width: 220, height: 220}}
                    resizeMode="contain"
                  />
                </Box>
              ) : (
                <Box
                  width={220}
                  height={220}
                  backgroundColor="border"
                  borderRadius="s12"
                  alignItems="center"
                  justifyContent="center"
                  mb="s16">
                  <ActivityIndicator size="large" color="#0E7AFE" />
                </Box>
              )}

              <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mb="s8">
                Abra o app do seu banco e escaneie o código
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
                Ou use o PIX copia e cola abaixo
              </Text>
            </Box>

            {/* PIX Copy Paste + Compartilhar */}
            {booking.pixQrCode && (
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                padding="s20"
                mb="s24"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  PIX Copia e Cola
                </Text>

                <Box
                  backgroundColor="background"
                  borderRadius="s12"
                  padding="s12"
                  mb="s16"
                  style={{borderWidth: 1, borderColor: '#E0E0E0'}}>
                  <Text preset="paragraphSmall" color="textSecondary" numberOfLines={3}>
                    {booking.pixQrCode}
                  </Text>
                </Box>

                {/* Botões Copiar + Compartilhar */}
                <Box flexDirection="row" gap="s12">
                  <Box flex={1}>
                    <Button
                      title="Copiar"
                      preset="outline"
                      leftIcon="content-copy"
                      onPress={handleCopyPixCode}
                    />
                  </Box>
                  <Box flex={1}>
                    <Button
                      title="Compartilhar"
                      preset="primary"
                      leftIcon="share"
                      onPress={handleSharePixCode}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Instructions */}
            <Box
              backgroundColor="successBg"
              borderRadius="s12"
              padding="s16"
              mb="s24"
              style={{borderLeftWidth: 4, borderLeftColor: '#10B981'}}>
              <Text preset="paragraphMedium" color="success" bold mb="s8">
                Como pagar com PIX:
              </Text>
              <Text preset="paragraphSmall" color="success" mb="s4">
                1. Abra o app do seu banco
              </Text>
              <Text preset="paragraphSmall" color="success" mb="s4">
                2. Escolha pagar com PIX QR Code
              </Text>
              <Text preset="paragraphSmall" color="success" mb="s4">
                3. Escaneie o código acima ou cole o código
              </Text>
              <Text preset="paragraphSmall" color="success">
                4. Confirme o pagamento
              </Text>
            </Box>

            {/* Checking Payment */}
            {isCheckingPayment && (
              <Box
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s16"
                mb="s24"
                flexDirection="row"
                alignItems="center">
                <ActivityIndicator size="small" color="#2196F3" />
                <Text preset="paragraphMedium" color="info" ml="s12">
                  Verificando pagamento...
                </Text>
              </Box>
            )}
          </>
        )}

        {/* Payment Method CREDIT_CARD */}
        {paymentMethod === PaymentMethod.CREDIT_CARD && (
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s32"
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Icon name="credit-card" size={64} color="primary" />
            <Text preset="headingMedium" color="text" bold mt="s16" mb="s8" textAlign="center">
              Pagamento com Cartão
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mb="s24">
              Funcionalidade em desenvolvimento. Por enquanto, use o PIX para realizar o pagamento.
            </Text>
            <Button title="Voltar" preset="outline" onPress={() => navigation.goBack()} />
          </Box>
        )}
      </ScrollView>

      {/* Expired Modal */}
      <InfoModal
        visible={showExpiredModal}
        title="Pagamento Expirado"
        message="O tempo para pagamento expirou. Por favor, faça uma nova reserva."
        icon="schedule"
        iconColor="danger"
        buttonText="Entendi"
        onClose={handleExpired}
      />

      {/* Success Modal */}
      <InfoModal
        visible={showSuccessModal}
        title="Pagamento Confirmado!"
        message="Seu pagamento foi confirmado com sucesso. Sua passagem já está disponível!"
        icon="check-circle"
        iconColor="success"
        buttonText="Ver Passagem"
        onClose={handlePaymentConfirmed}
      />
    </Box>
  );
}
