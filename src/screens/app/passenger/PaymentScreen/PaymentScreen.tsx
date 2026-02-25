import React from 'react';
import {ScrollView, ActivityIndicator, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Text, Icon, TouchableOpacityBox, InfoModal} from '@components';
import {PaymentMethod} from '@domain';
import {formatBRL} from '@utils';

import {usePaymentScreen} from './usePaymentScreen';

export function PaymentScreen() {
  const {top} = useSafeAreaInsets();
  const {
    amount,
    paymentMethod,
    isLoading,
    booking,
    timeLeft,
    isCheckingPayment,
    showExpiredModal,
    showSuccessModal,
    handleCopyPixCode,
    handleSharePixCode,
    handlePaymentConfirmed,
    handleExpired,
    formatTime,
    goBack,
  } = usePaymentScreen();

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
            onPress={goBack}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Text preset="headingSmall" color="text" bold ml="s12" flex={1}>
            Pagamento
          </Text>

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
        {paymentMethod === PaymentMethod.PIX && booking && (
          <>
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

            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              mb="s24"
              alignItems="center"
              style={{elevation: 2}}>
              <Text preset="paragraphMedium" color="textSecondary" mb="s8">
                Valor a pagar
              </Text>
              <Text preset="headingLarge" color="primary" bold>
                {formatBRL(amount)}
              </Text>
            </Box>

            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              mb="s24"
              alignItems="center"
              style={{elevation: 2}}>
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

            {booking.pixQrCode && (
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                padding="s20"
                mb="s24"
                style={{elevation: 2}}>
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

                <Box flexDirection="row" gap="s12">
                  <Box flex={1}>
                    <Button title="Copiar" preset="outline" leftIcon="content-copy" onPress={handleCopyPixCode} />
                  </Box>
                  <Box flex={1}>
                    <Button title="Compartilhar" preset="primary" leftIcon="share" onPress={handleSharePixCode} />
                  </Box>
                </Box>
              </Box>
            )}

            <Box
              backgroundColor="successBg"
              borderRadius="s12"
              padding="s16"
              mb="s24"
              style={{borderLeftWidth: 4, borderLeftColor: '#10B981'}}>
              <Text preset="paragraphMedium" color="success" bold mb="s8">
                Como pagar com PIX:
              </Text>
              <Text preset="paragraphSmall" color="success" mb="s4">1. Abra o app do seu banco</Text>
              <Text preset="paragraphSmall" color="success" mb="s4">2. Escolha pagar com PIX QR Code</Text>
              <Text preset="paragraphSmall" color="success" mb="s4">3. Escaneie o código acima ou cole o código</Text>
              <Text preset="paragraphSmall" color="success">4. Confirme o pagamento</Text>
            </Box>

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

        {paymentMethod === PaymentMethod.CREDIT_CARD && (
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s32"
            alignItems="center"
            style={{elevation: 2}}>
            <Icon name="credit-card" size={64} color="primary" />
            <Text preset="headingMedium" color="text" bold mt="s16" mb="s8" textAlign="center">
              Pagamento com Cartão
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mb="s24">
              Funcionalidade em desenvolvimento. Por enquanto, use o PIX para realizar o pagamento.
            </Text>
            <Button title="Voltar" preset="outline" onPress={goBack} />
          </Box>
        )}
      </ScrollView>

      <InfoModal
        visible={showExpiredModal}
        title="Pagamento Expirado"
        message="O tempo para pagamento expirou. Por favor, faça uma nova reserva."
        icon="schedule"
        iconColor="danger"
        buttonText="Entendi"
        onClose={handleExpired}
      />

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
