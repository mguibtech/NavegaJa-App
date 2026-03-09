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

import {PassengerModal} from './PassengerModal';
import {useBookingScreen} from './useBookingScreen';

export function BookingScreen() {
  const {
    trip,
    isLoadingTrip,
    passengers,
    totalPassengers,
    extraAdults,
    hasChildren,
    children,
    passengerModal,
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
    handleIncrement,
    handleDecrement,
    handleToggleChildren,
    handleAddChild,
    handleRemoveChild,
    openAdultModal,
    openChildModal,
    handleClosePassengerModal,
    handleConfirmPassengerModal,
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

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

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

          {/* ── Resumo da Viagem ────────────────────────────────────────── */}
          <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Resumo da Viagem
            </Text>

            <Box flexDirection="row" alignItems="center" mb="s12">
              <Box flex={1}>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">Origem</Text>
                <Text preset="paragraphMedium" color="text" bold>{trip.origin}</Text>
              </Box>
              <Icon name="arrow-forward" size={20} color="primary" />
              <Box flex={1} alignItems="flex-end">
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">Destino</Text>
                <Text preset="paragraphMedium" color="text" bold>{trip.destination}</Text>
              </Box>
            </Box>

            <Box paddingVertical="s12" paddingHorizontal="s16" backgroundColor="background" borderRadius="s12" mb="s12">
              <Box flexDirection="row" alignItems="center" mb="s8">
                <Icon name="event" size={18} color="primary" />
                <Text preset="paragraphSmall" color="text" ml="s8">{formatDate(trip.departureAt)}</Text>
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

          {/* ── Passageiros ─────────────────────────────────────────────── */}
          <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Passageiros
            </Text>

            {/* Contador adultos */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s16">
              <Text preset="paragraphMedium" color="text">
                {`Adultos (máx. ${trip.availableSeats - children.length})`}
              </Text>
              <Box flexDirection="row" alignItems="center" gap="s12">
                <TouchableOpacityBox
                  width={32} height={32} borderRadius="s16"
                  backgroundColor={passengers <= 1 ? 'disabled' : 'primary'}
                  alignItems="center" justifyContent="center"
                  disabled={passengers <= 1}
                  onPress={handleDecrement}>
                  <Icon name="remove" size={16} color={passengers <= 1 ? 'disabledText' : 'surface'} />
                </TouchableOpacityBox>
                <Text preset="paragraphMedium" color="text" bold minWidth={32} textAlign="center">
                  {passengers}
                </Text>
                <TouchableOpacityBox
                  width={32} height={32} borderRadius="s16"
                  backgroundColor={passengers >= trip.availableSeats - children.length ? 'disabled' : 'primary'}
                  alignItems="center" justifyContent="center"
                  disabled={passengers >= trip.availableSeats - children.length}
                  onPress={handleIncrement}>
                  <Icon name="add" size={16} color={passengers >= trip.availableSeats - children.length ? 'disabledText' : 'surface'} />
                </TouchableOpacityBox>
              </Box>
            </Box>

            {/* Toggle crianças */}
            <Box
              flexDirection="row" justifyContent="space-between" alignItems="center"
              pb="s16" borderBottomWidth={1} borderBottomColor="border">
              <Box flexDirection="row" alignItems="center" gap="s8">
                <Icon name="child-care" size={20} color="secondary" />
                <Text preset="paragraphMedium" color="text">Há crianças no grupo?</Text>
              </Box>
              <Switch
                value={hasChildren}
                onValueChange={handleToggleChildren}
                trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                thumbColor={hasChildren ? '#2563EB' : '#9CA3AF'}
              />
            </Box>

            {/* Info gratuidade crianças */}
            {hasChildren && (
              <Box
                mt="s12"
                backgroundColor="infoBg"
                borderRadius="s8"
                padding="s12"
                flexDirection="row"
                alignItems="center"
                gap="s8"
                mb="s4">
                <Icon name="info" size={16} color="info" />
                <Text preset="paragraphSmall" color="info" flex={1}>
                  Crianças até 9 anos viajam sem custo. Máximo 3 crianças grátis por reserva.
                </Text>
              </Box>
            )}

            {/* Total de assentos */}
            <Box
              mt="s16" pt="s16" borderTopWidth={1} borderTopColor="border"
              flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text preset="paragraphMedium" color="textSecondary">Total de assentos</Text>
              <Text preset="paragraphMedium" color="text" bold>
                {totalPassengers === 1 ? '1 assento' : `${totalPassengers} assentos`}
                {children.length > 0 &&
                  ` (${passengers} adulto${passengers > 1 ? 's' : ''} + ${children.length} criança${children.length > 1 ? 's' : ''})`}
              </Text>
            </Box>
          </Box>

          {/* ── Dados dos Passageiros ────────────────────────────────────── */}
          <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Dados dos Passageiros
            </Text>

            {/* Passageiro principal — inline */}
            <Box
              borderRadius="s12"
              borderWidth={1}
              borderColor="border"
              padding="s16"
              mb="s12">
              <Box flexDirection="row" alignItems="center" mb="s12">
                <Box
                  width={32} height={32} borderRadius="s16"
                  style={{backgroundColor: '#EFF6FF'}}
                  alignItems="center" justifyContent="center"
                  mr="s8">
                  <Icon name="person" size={18} color={'#2563EB' as any} />
                </Box>
                <Text preset="paragraphSmall" color="textSecondary" bold>
                  Passageiro principal
                </Text>
              </Box>

              <Box mb="s12">
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
            </Box>

            {/* Cards passageiros adultos extras */}
            {extraAdults.map((adult, index) => {
              const isFilled = adult.cpf.trim().length > 0;
              return (
                <TouchableOpacityBox
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor={isFilled ? 'border' : 'primary'}
                  padding="s16"
                  mb="s12"
                  onPress={() => openAdultModal(index)}
                  style={isFilled ? {} : {borderStyle: 'dashed'}}>
                  <Box
                    width={40} height={40} borderRadius="s20"
                    style={{backgroundColor: isFilled ? '#F0FDF4' : '#EFF6FF'}}
                    alignItems="center" justifyContent="center"
                    mr="s12">
                    <Icon
                      name={isFilled ? 'check-circle' : 'person-add'}
                      size={20}
                      color={isFilled ? '#16A34A' as any : '#2563EB' as any}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphSmall" color="textSecondary">
                      Passageiro {index + 2}
                    </Text>
                    {isFilled ? (
                      <Text preset="paragraphMedium" color="text" bold>
                        {`CPF: ${adult.cpf}`}
                      </Text>
                    ) : (
                      <Text preset="paragraphSmall" color="primary">
                        Toque para adicionar CPF
                      </Text>
                    )}
                  </Box>
                  <Icon name="chevron-right" size={20} color="textSecondary" />
                </TouchableOpacityBox>
              );
            })}

            {/* Cards crianças */}
            {hasChildren && children.map((child, index) => {
              const ageLabel = child.age === 0 ? 'Bebê' : `${child.age} anos`;
              const isFree = child.age <= 9;
              return (
                <TouchableOpacityBox
                  key={`child-${index}`}
                  flexDirection="row"
                  alignItems="center"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor="border"
                  padding="s16"
                  mb="s12"
                  onPress={() => openChildModal(index)}>
                  <Box
                    width={40} height={40} borderRadius="s20"
                    style={{backgroundColor: isFree ? '#ECFDF5' : '#FEF3C7'}}
                    alignItems="center" justifyContent="center"
                    mr="s12">
                    <Icon
                      name="child-care"
                      size={20}
                      color={isFree ? '#059669' as any : '#D97706' as any}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {`Criança ${index + 1} · ${ageLabel}`}
                      {isFree ? ' · Gratuita' : ' · Cobrada'}
                    </Text>
                    <Text preset="paragraphMedium" color="text" bold>
                      {isFree ? 'Gratuita' : 'Cobrada como adulto'}
                    </Text>
                  </Box>
                  <Icon name="chevron-right" size={20} color="textSecondary" />
                </TouchableOpacityBox>
              );
            })}

            {/* Botão adicionar criança */}
            {hasChildren && children.length < trip.availableSeats - passengers && (
              <TouchableOpacityBox
                flexDirection="row"
                alignItems="center"
                gap="s8"
                pt="s4"
                onPress={handleAddChild}>
                <Icon name="add-circle" size={22} color="primary" />
                <Text preset="paragraphMedium" color="primary">
                  Adicionar criança
                </Text>
              </TouchableOpacityBox>
            )}
          </Box>

          {/* ── Cupom ───────────────────────────────────────────────────── */}
          <CouponInputV2
            state={couponValidation.state}
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            onRetry={couponValidation.retry}
          />

          {/* ── Milhas Náuticas ─────────────────────────────────────────── */}
          {kmStats && kmStats.redeemableKm > 0 && (
            <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
              <Box flexDirection="row" alignItems="center" mb="s12">
                <Icon name="waves" size={20} color={'#0B5D8A' as any} />
                <Text preset="paragraphMedium" color="text" bold ml="s8">Milhas Náuticas</Text>
              </Box>

              <Box
                flexDirection="row" justifyContent="space-between" alignItems="center"
                paddingVertical="s12" paddingHorizontal="s16"
                backgroundColor="background" borderRadius="s12">
                <Box>
                  <Text preset="paragraphSmall" color="textSecondary">Saldo disponível</Text>
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
                <Box mt="s12" backgroundColor="infoBg" borderRadius="s8" padding="s12" flexDirection="row" alignItems="center">
                  <Icon name="info" size={16} color="info" />
                  <Text preset="paragraphSmall" color="info" ml="s8" flex={1}>
                    Desconto de milhas náuticas será aplicado no valor final
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* ── Forma de Pagamento ───────────────────────────────────────── */}
          <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
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
                backgroundColor={paymentMethod === method.value ? 'primaryBg' : 'background'}
                borderRadius="s12"
                borderWidth={2}
                borderColor={paymentMethod === method.value ? 'primary' : 'border'}
                mb="s12"
                onPress={() => setPaymentMethod(method.value)}>
                <Box
                  width={48} height={48} borderRadius="s24"
                  backgroundColor={paymentMethod === method.value ? 'primary' : 'surface'}
                  alignItems="center" justifyContent="center"
                  marginRight="s16">
                  <Icon
                    name={method.icon as any}
                    size={24}
                    color={paymentMethod === method.value ? 'surface' : 'primary'}
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

          {/* ── Preço ───────────────────────────────────────────────────── */}
          {priceBreakdown ? (
            <Box mb="s16">
              <PriceBreakdown data={priceBreakdown} />
            </Box>
          ) : (
            <Box backgroundColor="surface" borderRadius="s16" padding="s20" mb="s16" style={cardShadow}>
              <ActivityIndicator size="small" color="#007BFF" />
              <Text preset="paragraphSmall" color="textSecondary" mt="s8" textAlign="center">
                Calculando preço...
              </Text>
            </Box>
          )}

          {/* ── Termos ──────────────────────────────────────────────────── */}
          <Box
            flexDirection="row"
            paddingVertical="s16"
            paddingHorizontal="s16"
            backgroundColor="surface"
            borderRadius="s12"
            mb="s24">
            <Icon name="info" size={20} color="primary" />
            <Text preset="paragraphSmall" color="text" flex={1}>
              Ao confirmar, você concorda com nossos{' '}
              <Text preset="paragraphSmall" color="primary" bold>Termos de Uso</Text>
              {' '}e{' '}
              <Text preset="paragraphSmall" color="primary" bold>Política de Privacidade</Text>
            </Text>
          </Box>

          <Box height={100} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Footer fixo ─────────────────────────────────────────────────── */}
      <Box
        position="absolute" bottom={0} left={0} right={0}
        backgroundColor="surface"
        paddingHorizontal="s24" paddingVertical="s20"
        borderTopWidth={1} borderTopColor="border"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}>
        {hasFloodRisk && (
          <Box
            backgroundColor={floodSeverity === 'EXTREME' ? 'dangerBg' : 'warningBg'}
            borderRadius="s12" padding="s12"
            flexDirection="row" alignItems="flex-start"
            mb="s12">
            <Icon name="warning" size={18} color={floodSeverity === 'EXTREME' ? 'danger' : 'warning'} />
            <Text
              preset="paragraphCaptionSmall"
              color={floodSeverity === 'EXTREME' ? 'danger' : 'warning'}
              bold ml="s8" flex={1}>
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

      {/* ── Modais de erro ──────────────────────────────────────────────── */}
      <InfoModal
        visible={showLoadErrorModal}
        title="Erro"
        message="Não foi possível carregar os dados da viagem"
        icon="error" iconColor="danger"
        buttonText="Entendi"
        onClose={handleCloseLoadErrorModal}
      />
      <InfoModal
        visible={showCpfErrorModal}
        title="CPF Inválido"
        message={cpfErrorMessage}
        icon="warning" iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowCpfErrorModal(false)}
      />
      <InfoModal
        visible={showBookingErrorModal}
        title="Erro"
        message={bookingErrorMessage}
        icon="error" iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowBookingErrorModal(false)}
      />

      {/* ── Modal de passageiro ─────────────────────────────────────────── */}
      {passengerModal.visible && passengerModal.type === 'adult' && (
        <PassengerModal
          visible
          type="adult"
          index={passengerModal.index}
          name={passengerModal.name}
          cpf={passengerModal.cpf}
          mainCpf={passengerCPF.replace(/\D/g, '')}
          otherCpfs={extraAdults
            .filter((_, i) => i !== passengerModal.index)
            .map(a => a.cpf)
            .filter(Boolean)}
          onConfirm={data => handleConfirmPassengerModal(data)}
          onClose={handleClosePassengerModal}
        />
      )}
      {passengerModal.visible && passengerModal.type === 'child' && (
        <PassengerModal
          visible
          type="child"
          index={passengerModal.index}
          age={passengerModal.age}
          onConfirm={data => handleConfirmPassengerModal(data)}
          onRemove={() => {
            handleRemoveChild(passengerModal.index);
            handleClosePassengerModal();
          }}
          onClose={handleClosePassengerModal}
        />
      )}
    </Box>
  );
}
