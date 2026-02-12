import React, {useEffect, useState} from 'react';
import {ScrollView, Alert, ActivityIndicator} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {Trip, tripAPI, PaymentMethod, useCreateBooking} from '@domain';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'Booking'>;

export function BookingScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {create: createBooking, isLoading: isCreatingBooking} = useCreateBooking();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [passengers, setPassengers] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerCPF, setPassengerCPF] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);

  // Load trip data
  useEffect(() => {
    loadTrip();
  }, [tripId]);

  async function loadTrip() {
    setIsLoadingTrip(true);
    try {
      const tripData = await tripAPI.getById(tripId);
      setTrip(tripData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da viagem');
      console.error('Failed to load trip:', error);
      navigation.goBack();
    } finally {
      setIsLoadingTrip(false);
    }
  }

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

  const subtotal = trip.price * passengers;
  const serviceFee = subtotal * 0.05; // 5% taxa de serviço
  const total = subtotal + serviceFee;

  const handleIncrement = () => {
    if (passengers < trip.availableSeats) {
      setPassengers(passengers + 1);
    }
  };

  const handleDecrement = () => {
    if (passengers > 1) setPassengers(passengers - 1);
  };

  const handleConfirmBooking = async () => {
    // Validações
    if (!passengerName.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome do passageiro');
      return;
    }

    if (!passengerCPF.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o CPF do passageiro');
      return;
    }

    try {
      const booking = await createBooking({
        tripId: trip.id,
        quantity: passengers,
        paymentMethod,
      });

      // Navegar para tela de ticket com o ID real
      navigation.replace('Ticket', {
        bookingId: booking.id,
      });
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível processar sua reserva. Tente novamente.'
      );
    }
  };

  const paymentMethods = [
    {
      value: PaymentMethod.CREDIT_CARD,
      label: 'Cartão de Crédito',
      icon: 'credit-card',
    },
    {
      value: PaymentMethod.DEBIT_CARD,
      label: 'Cartão de Débito',
      icon: 'credit-card',
    },
    {value: PaymentMethod.PIX, label: 'PIX', icon: 'qr-code'},
    {value: PaymentMethod.CASH, label: 'Dinheiro', icon: 'payments'},
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s56"
        paddingBottom="s20"
        backgroundColor="primary">
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center"
            marginRight="s16"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="primary" />
          </TouchableOpacityBox>

          <Box flex={1}>
            <Text preset="headingMedium" color="surface" bold>
              Confirmar Reserva
            </Text>
          </Box>
        </Box>
      </Box>

      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
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
                {formatDate(trip.departureTime)}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center">
              <Icon name="schedule" size={18} color="primary" />
              <Text preset="paragraphSmall" color="text" ml="s8">
                Saída às {formatTime(trip.departureTime)} • Chegada às {formatTime(trip.arrivalTime)}
              </Text>
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center">
            <Icon name="directions-boat" size={18} color="secondary" />
            <Text preset="paragraphSmall" color="text" ml="s8">
              Barco {trip.boatId.slice(0, 8)} • Cap. {trip.captainId.slice(0, 8)}
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
              Adultos (máx. {trip.availableSeats})
            </Text>

            <Box flexDirection="row" alignItems="center" gap="s16">
              <TouchableOpacityBox
                width={40}
                height={40}
                borderRadius="s20"
                backgroundColor={passengers <= 1 ? 'disabled' : 'primary'}
                alignItems="center"
                justifyContent="center"
                onPress={handleDecrement}
                disabled={passengers <= 1}>
                <Icon
                  name="remove"
                  size={20}
                  color={passengers <= 1 ? 'disabledText' : 'surface'}
                />
              </TouchableOpacityBox>

              <Text preset="headingMedium" color="text" bold minWidth={40} textAlign="center">
                {passengers}
              </Text>

              <TouchableOpacityBox
                width={40}
                height={40}
                borderRadius="s20"
                backgroundColor={passengers >= trip.availableSeats ? 'disabled' : 'primary'}
                alignItems="center"
                justifyContent="center"
                onPress={handleIncrement}
                disabled={passengers >= trip.availableSeats}>
                <Icon
                  name="add"
                  size={20}
                  color={passengers >= trip.availableSeats ? 'disabledText' : 'surface'}
                />
              </TouchableOpacityBox>
            </Box>
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
              onChangeText={setPassengerName}
              leftIcon="person"
            />
          </Box>

          <TextInput
            label="CPF"
            placeholder="000.000.000-00"
            value={passengerCPF}
            onChangeText={setPassengerCPF}
            keyboardType="numeric"
            leftIcon="badge"
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
            Detalhes do Pagamento
          </Text>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            mb="s12">
            <Text preset="paragraphMedium" color="text">
              Subtotal ({passengers} {passengers === 1 ? 'passagem' : 'passagens'})
            </Text>
            <Text preset="paragraphMedium" color="text">
              R$ {subtotal.toFixed(2)}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            mb="s16"
            paddingBottom="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Text preset="paragraphMedium" color="textSecondary">
              Taxa de serviço (5%)
            </Text>
            <Text preset="paragraphMedium" color="textSecondary">
              R$ {serviceFee.toFixed(2)}
            </Text>
          </Box>

          <Box flexDirection="row" justifyContent="space-between">
            <Text preset="headingSmall" color="text" bold>
              Total
            </Text>
            <Text preset="headingSmall" color="primary" bold>
              R$ {total.toFixed(2)}
            </Text>
          </Box>
        </Box>

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
            style={{marginRight: 12}}
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
        <Button
          title={
            isCreatingBooking ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`
          }
          onPress={handleConfirmBooking}
          disabled={isCreatingBooking}
          rightIcon={isCreatingBooking ? undefined : 'check'}
        />
      </Box>
    </Box>
  );
}
