import React from 'react';
import {ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Switch} from 'react-native';

import {
  Box,
  Button,
  Icon,
  InfoModal,
  ScreenHeader,
  Text,
  TextInput,
  TouchableOpacityBox,
  CouponInputV2,
  PriceBreakdown,
} from '@components';

import {formatBRL} from '@utils';

import {useBookingScreen} from './useBookingScreen';

export function BookingScreen() {
  const {
    trip,
    isLoadingTrip,
    passengers,
    totalPassengers,
    passengerName,
    nameError,
    handleNameChange,
    passengerCPF,
    cpfError,
    paymentMethod,
    setPaymentMethod,
    priceBreakdown,
    isCreatingBooking,
    couponValidation,
    kmStats,
    redeemKm,
    setRedeemKm,
    showLoadErrorModal,
    showCpfErrorModal,
    cpfErrorMessage,
    showBookingErrorModal,
    bookingErrorMessage,
    paymentMethods,
    hasChildren,
    childrenAges,
    handleIncrement,
    handleDecrement,
    handleToggleChildren,
    handleAddChild,
    handleRemoveChild,
    handleChildAgeChange,
    handleCPFChange,
    handleConfirmBooking,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleGoBack,
    handleCloseLoadErrorModal,
    setShowCpfErrorModal,
    setShowBookingErrorModal,
    formatTime,
    formatDate,
    hasFloodRisk,
    floodSeverity,
  } = useBookingScreen();

  // Show loading state while fetching trip
  if (isLoadingTrip || !trip) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#007BFF" />
        <Text preset="paragraphMedium" color="text" mt="s16">
          Carregando...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Confirmar Reserva" onBack={handleGoBack} />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Trip Summary */}
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
            Resumo da Viagem
          </Text>

          <Box flexDirection="row" alignItems="center" mb="s12">
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                Origem
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {trip.origin}
              </Text>
            </Box>

            <Icon name="arrow-forward" size={20} color="primary" />

            <Box flex={1} alignItems="flex-end">
              <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                Destino
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {trip.destination}
              </Text>
            </Box>
          </Box>

          <Box
            paddingVertical="s12"
            paddingHorizontal="s16"
            backgroundColor="background"
            borderRadius="s12"
            mb="s12">
            <Box flexDirection="row" alignItems="center" mb="s8">
              <Icon name="event" size={18} color="primary" />
              <Text preset="paragraphSmall" color="text" ml="s8">
                {formatDate(trip.departureAt)}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center">
              <Icon name="schedule" size={18} color="primary" />
              <Text preset="paragraphSmall" color="text" ml="s8">
                {`Saída às ${formatTime(trip.departureAt)} • Chegada às ${formatTime(trip.estimatedArrivalAt)}`}
              </Text>
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center">
            <Icon name="directions-boat" size={18} color="secondary" />
            <Text preset="paragraphSmall" color="text" ml="s8">
              {`${(trip as any).boat?.name || `Barco ${trip.boatId.slice(0, 8)}`} • ${(trip as any).captain?.name || `Cap. ${trip.captainId.slice(0, 8)}`}`}
            </Text>
          </Box>
        </Box>

        {/* Passenger Count */}
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
            Número de Passageiros
          </Text>

          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Text preset="paragraphMedium" color="text">
              {`Adultos (máx. ${trip.availableSeats - childrenAges.length})`}
            </Text>

            <Box flexDirection="row" alignItems="center" gap="s12">
              <TouchableOpacityBox
                width={32}
                height={32}
                borderRadius="s16"
                backgroundColor={passengers <= 1 ? 'disabled' : 'primary'}
                alignItems="center"
                justifyContent="center"
                accessibilityLabel="Diminuir número de passageiros"
                accessibilityRole="button"
                accessibilityState={{disabled: passengers <= 1}}
                onPress={handleDecrement}
                disabled={passengers <= 1}>
                <Icon
                  name="remove"
                  size={16}
                  color={passengers <= 1 ? 'disabledText' : 'surface'}
                />
              </TouchableOpacityBox>

              <Text
                preset="paragraphMedium"
                color="text"
                bold
                minWidth={32}
                textAlign="center"
                accessibilityLabel={`${passengers} passageiro${passengers > 1 ? 's' : ''}`}>
                {passengers}
              </Text>

              <TouchableOpacityBox
                width={32}
                height={32}
                borderRadius="s16"
                backgroundColor={passengers >= trip.availableSeats - childrenAges.length ? 'disabled' : 'primary'}
                alignItems="center"
                justifyContent="center"
                accessibilityLabel="Aumentar número de passageiros"
                accessibilityRole="button"
                accessibilityState={{disabled: passengers >= trip.availableSeats - childrenAges.length}}
                onPress={handleIncrement}
                disabled={passengers >= trip.availableSeats - childrenAges.length}>
                <Icon
                  name="add"
                  size={16}
                  color={passengers >= trip.availableSeats - childrenAges.length ? 'disabledText' : 'surface'}
                />
              </TouchableOpacityBox>
            </Box>
          </Box>

          {/* Há crianças no grupo? */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt="s16"
            pt="s16"
            borderTopWidth={1}
            borderTopColor="border">
            <Box flexDirection="row" alignItems="center" gap="s8">
              <Icon name="child-care" size={20} color="secondary" />
              <Text preset="paragraphMedium" color="text">
                Há crianças no grupo?
              </Text>
            </Box>
            <Switch
              value={hasChildren}
              onValueChange={handleToggleChildren}
              trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
              thumbColor={hasChildren ? '#2563EB' : '#9CA3AF'}
            />
          </Box>

          {/* Lista de crianças */}
          {hasChildren && (
            <Box mt="s16">
              {/* Info banner */}
              <Box
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s12"
                mb="s12"
                flexDirection="row"
                alignItems="center"
                gap="s8">
                <Icon name="info" size={16} color="info" />
                <Text preset="paragraphSmall" color="info" flex={1}>
                  Crianças até 9 anos viajam sem custo adicional. Máximo 3 crianças grátis por reserva.
                </Text>
              </Box>

              {childrenAges.map((age, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb="s12"
                  gap="s12">
                  <Text preset="paragraphMedium" color="text">
                    {`Criança ${index + 1}`}
                  </Text>
                  <Box flexDirection="row" alignItems="center" gap="s8" flex={1} justifyContent="flex-end">
                    <TouchableOpacityBox
                      width={32}
                      height={32}
                      borderRadius="s16"
                      backgroundColor={age <= 0 ? 'disabled' : 'primary'}
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => handleChildAgeChange(index, Math.max(0, age - 1))}
                      disabled={age <= 0}>
                      <Icon name="remove" size={14} color={age <= 0 ? 'disabledText' : 'surface'} />
                    </TouchableOpacityBox>
                    <Text preset="paragraphMedium" color="text" bold minWidth={48} textAlign="center">
                      {age === 0 ? 'Bebê' : `${age} anos`}
                    </Text>
                    <TouchableOpacityBox
                      width={32}
                      height={32}
                      borderRadius="s16"
                      backgroundColor={age >= 17 ? 'disabled' : 'primary'}
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => handleChildAgeChange(index, Math.min(17, age + 1))}
                      disabled={age >= 17}>
                      <Icon name="add" size={14} color={age >= 17 ? 'disabledText' : 'surface'} />
                    </TouchableOpacityBox>
                    <TouchableOpacityBox
                      width={32}
                      height={32}
                      borderRadius="s16"
                      style={{backgroundColor: '#FEE2E2'}}
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => handleRemoveChild(index)}>
                      <Icon name="close" size={14} color="danger" />
                    </TouchableOpacityBox>
                  </Box>
                </Box>
              ))}

              {childrenAges.length < trip.availableSeats - passengers && (
                <TouchableOpacityBox
                  flexDirection="row"
                  alignItems="center"
                  gap="s8"
                  onPress={handleAddChild}>
                  <Icon name="add-circle" size={20} color="primary" />
                  <Text preset="paragraphMedium" color="primary">
                    Adicionar criança
                  </Text>
                </TouchableOpacityBox>
              )}
            </Box>
          )}

          {/* Total de assentos */}
          <Box
            mt="s16"
            pt="s16"
            borderTopWidth={1}
            borderTopColor="border"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary">
              Total de assentos
            </Text>
            <Text preset="paragraphMedium" color="text" bold>
              {totalPassengers === 1
                ? '1 assento'
                : `${totalPassengers} assentos`}
              {childrenAges.length > 0 &&
                ` (${passengers} adulto${passengers > 1 ? 's' : ''} + ${childrenAges.length} criança${childrenAges.length > 1 ? 's' : ''})`}
            </Text>
          </Box>
        </Box>

        {/* Passenger Info */}
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
            Dados do Passageiro Principal
          </Text>

          <Box mb="s16">
            <TextInput
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              value={passengerName}
              onChangeText={handleNameChange}
              leftIcon="person"
              errorMessage={nameError || undefined}
            />
          </Box>

          <TextInput
            label="CPF"
            placeholder="000.000.000-00"
            value={passengerCPF}
            onChangeText={handleCPFChange}
            keyboardType="numeric"
            leftIcon="badge"
            maxLength={14}
            errorMessage={cpfError || undefined}
          />

          {passengers > 1 && (
            <Box
              mt="s16"
              paddingVertical="s12"
              paddingHorizontal="s16"
              backgroundColor="infoBg"
              borderRadius="s12">
              <Text preset="paragraphSmall" color="info">
                Os dados dos demais passageiros podem ser adicionados após a
                confirmação da reserva
              </Text>
            </Box>
          )}
        </Box>

        {/* Coupon Input V2 - Com máquina de estados */}
        <CouponInputV2
          state={couponValidation.state}
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
          onRetry={couponValidation.retry}
        />

        {/* Milhas Náuticas — só exibe se usuário tem saldo */}
        {kmStats && kmStats.redeemableKm > 0 && (
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
            <Box flexDirection="row" alignItems="center" mb="s12">
              <Icon name="waves" size={20} color={'#0B5D8A' as any} />
              <Text preset="paragraphMedium" color="text" bold ml="s8">
                Milhas Náuticas
              </Text>
            </Box>

            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="s12"
              paddingHorizontal="s16"
              backgroundColor="background"
              borderRadius="s12">
              <Box>
                <Text preset="paragraphSmall" color="textSecondary">
                  Saldo disponível
                </Text>
                <Text preset="paragraphMedium" color="text" bold>
                  {kmStats.redeemableKm} milhas náuticas
                </Text>
              </Box>
              <Switch
                value={redeemKm}
                onValueChange={setRedeemKm}
                trackColor={{false: '#D1D5DB', true: '#0B5D8A'}}
                thumbColor={redeemKm ? '#FFFFFF' : '#9CA3AF'}
              />
            </Box>

            {redeemKm && (
              <Box
                mt="s12"
                backgroundColor="infoBg"
                borderRadius="s8"
                padding="s12"
                flexDirection="row"
                alignItems="center">
                <Icon name="info" size={16} color="info" />
                <Text preset="paragraphSmall" color="info" ml="s8" flex={1}>
                  Desconto de milhas náuticas será aplicado no valor final
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Payment Method */}
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
            Forma de Pagamento
          </Text>

          {paymentMethods.map(method => (
            <TouchableOpacityBox
              key={method.value}
              flexDirection="row"
              alignItems="center"
              paddingVertical="s16"
              paddingHorizontal="s16"
              backgroundColor={
                paymentMethod === method.value ? 'primaryBg' : 'background'
              }
              borderRadius="s12"
              borderWidth={2}
              borderColor={
                paymentMethod === method.value ? 'primary' : 'border'
              }
              mb="s12"
              accessibilityLabel={method.label}
              accessibilityRole="radio"
              accessibilityState={{checked: paymentMethod === method.value}}
              onPress={() => setPaymentMethod(method.value)}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor={
                  paymentMethod === method.value ? 'primary' : 'surface'
                }
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon
                  name={method.icon as any}
                  size={24}
                  color={
                    paymentMethod === method.value ? 'surface' : 'primary'
                  }
                />
              </Box>

              <Text
                preset="paragraphMedium"
                color={paymentMethod === method.value ? 'primary' : 'text'}
                bold>
                {method.label}
              </Text>

              <Box flex={1} />

              {paymentMethod === method.value && (
                <Icon name="check-circle" size={24} color="primary" />
              )}
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Price Breakdown */}
        {priceBreakdown ? (
          <Box mb="s16">
            <PriceBreakdown data={priceBreakdown} />
          </Box>
        ) : (
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
            <ActivityIndicator size="small" color="#007BFF" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s8" textAlign="center">
              Calculando preço...
            </Text>
          </Box>
        )}

        {/* Terms */}
        <Box
          flexDirection="row"
          paddingVertical="s16"
          paddingHorizontal="s16"
          backgroundColor="surface"
          borderRadius="s12"
          mb="s24">
          <Icon
            name="info"
            size={20}
            color="primary"
          />
          <Text preset="paragraphSmall" color="text" flex={1}>
            Ao confirmar, você concorda com nossos{' '}
            <Text preset="paragraphSmall" color="primary" bold>
              Termos de Uso
            </Text>{' '}
            e{' '}
            <Text preset="paragraphSmall" color="primary" bold>
              Política de Privacidade
            </Text>
          </Text>
        </Box>

        {/* Spacer */}
        <Box height={100} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Footer */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="surface"
        paddingHorizontal="s24"
        paddingVertical="s20"
        borderTopWidth={1}
        borderTopColor="border"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}>
        {/* Banner de risco de cheia */}
        {hasFloodRisk && (
          <Box
            backgroundColor={floodSeverity === 'EXTREME' ? 'dangerBg' : 'warningBg'}
            borderRadius="s12"
            padding="s12"
            flexDirection="row"
            alignItems="flex-start"
            mb="s12">
            <Icon
              name="warning"
              size={18}
              color={floodSeverity === 'EXTREME' ? 'danger' : 'warning'}
            />
            <Text
              preset="paragraphCaptionSmall"
              color={floodSeverity === 'EXTREME' ? 'danger' : 'warning'}
              bold
              ml="s8"
              flex={1}>
              {floodSeverity === 'EXTREME'
                ? 'Cheia extrema detectada no trecho. Confirme as condições com o capitão antes de embarcar.'
                : 'Cheia severa na área. Verifique as condições com o capitão.'}
            </Text>
          </Box>
        )}
        <Button
          title={
            isCreatingBooking
              ? 'Processando...'
              : priceBreakdown
              ? `Pagar ${formatBRL(priceBreakdown.finalPrice)}`
              : 'Calculando...'
          }
          onPress={handleConfirmBooking}
          disabled={isCreatingBooking || !priceBreakdown}
          rightIcon={isCreatingBooking ? undefined : 'check'}
        />
      </Box>

      <InfoModal
        visible={showLoadErrorModal}
        title="Erro"
        message="Não foi possível carregar os dados da viagem"
        icon="error"
        iconColor="danger"
        buttonText="Entendi"
        onClose={handleCloseLoadErrorModal}
      />

      <InfoModal
        visible={showCpfErrorModal}
        title="CPF Inválido"
        message={cpfErrorMessage}
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowCpfErrorModal(false)}
      />

      <InfoModal
        visible={showBookingErrorModal}
        title="Erro"
        message={bookingErrorMessage}
        icon="error"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowBookingErrorModal(false)}
      />
    </Box>
  );
}
