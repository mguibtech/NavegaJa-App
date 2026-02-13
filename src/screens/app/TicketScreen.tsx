import React, {useEffect, useState} from 'react';
import {ScrollView, Share, Alert, ActivityIndicator} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {Booking, bookingAPI, BookingStatus, Trip, tripAPI, PaymentMethod} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Ticket'>;

type TicketStatus = 'confirmed' | 'active' | 'completed' | 'cancelled' | 'pending';

export function TicketScreen({navigation, route}: Props) {
  const {bookingId} = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  async function loadBookingData() {
    setIsLoading(true);
    try {
      const bookingData = await bookingAPI.getById(bookingId);
      setBooking(bookingData);

      // Load trip data
      const tripData = await tripAPI.getById(bookingData.tripId);
      setTrip(tripData);
    } catch (_error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do bilhete');
      console.error('Failed to load booking:', _error);
      navigation.navigate('HomeTabs');
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state
  if (isLoading || !booking || !trip) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#007BFF" />
        <Text preset="paragraphMedium" color="text" mt="s16">
          Carregando bilhete...
        </Text>
      </Box>
    );
  }

  const mapBookingStatusToTicketStatus = (status: BookingStatus): TicketStatus => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'pending';
      case BookingStatus.CONFIRMED:
        return 'confirmed';
      case BookingStatus.CHECKED_IN:
        return 'active';
      case BookingStatus.COMPLETED:
        return 'completed';
      case BookingStatus.CANCELLED:
        return 'cancelled';
      default:
        return 'confirmed';
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

  const ticketStatus = mapBookingStatusToTicketStatus(booking.status);

  const handleShare = async () => {
    try {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
      };

      const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      };

      await Share.share({
        message: `Meu bilhete NavegaJá\n\nCódigo: ${booking.id}\n${trip.origin} → ${trip.destination}\nData: ${formatDate(trip.departureAt)}\nHorário: ${formatTime(trip.departureAt)}`,
      });
    } catch (_error) {
      console.error('Error sharing:', _error);
    }
  };

  const handleStartTracking = () => {
    navigation.navigate('Tracking', {bookingId: booking.id});
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancelar Reserva',
      'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.',
      [
        {text: 'Não', style: 'cancel'},
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingAPI.cancel(booking.id);
              Alert.alert('Sucesso', 'Reserva cancelada com sucesso');
              navigation.navigate('HomeTabs');
            } catch (_error) {
              Alert.alert('Erro', 'Não foi possível cancelar a reserva');
            }
          },
        },
      ],
    );
  };

  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          color: 'warning' as const,
          bg: 'warningBg' as const,
          icon: 'schedule',
        };
      case 'confirmed':
        return {
          label: 'Confirmada',
          color: 'success' as const,
          bg: 'successBg' as const,
          icon: 'check-circle',
        };
      case 'active':
        return {
          label: 'Em Viagem',
          color: 'info' as const,
          bg: 'infoBg' as const,
          icon: 'sailing',
        };
      case 'completed':
        return {
          label: 'Concluída',
          color: 'textSecondary' as const,
          bg: 'border' as const,
          icon: 'check',
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: 'danger' as const,
          bg: 'dangerBg' as const,
          icon: 'cancel',
        };
    }
  };

  const statusConfig = getStatusConfig(ticketStatus);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s40"
        paddingBottom="s12"
        backgroundColor="surface"
        borderBottomWidth={1}
        borderBottomColor="border">
        <Box flexDirection="row" alignItems="center" mb="s12">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            marginRight="s16"
            onPress={() => navigation.navigate('HomeTabs')}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Box flex={1}>
            <Text preset="headingSmall" color="text" bold>
              Bilhete Digital
            </Text>
          </Box>

          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            onPress={handleShare}>
            <Icon name="share" size={22} color="text" />
          </TouchableOpacityBox>
        </Box>

        {/* Status Badge */}
        <Box
          alignSelf="flex-start"
          flexDirection="row"
          alignItems="center"
          backgroundColor={statusConfig.bg}
          paddingHorizontal="s16"
          paddingVertical="s10"
          borderRadius="s12">
          <Icon
            name={statusConfig.icon as any}
            size={20}
            color={statusConfig.color}
          />
          <Text
            preset="paragraphMedium"
            color={statusConfig.color}
            bold
            ml="s8">
            {statusConfig.label}
          </Text>
        </Box>
      </Box>

      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* QR Code Card */}
        <Box
          backgroundColor="surface"
          borderRadius="s20"
          padding="s24"
          mb="s16"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Text preset="paragraphSmall" color="textSecondary" mb="s16">
            Apresente este QR Code no embarque
          </Text>

          {/* Real QR Code */}
          {(booking.qrCode && booking.qrCode.length <= 1000) || booking.id ? (
            <Box
              padding="s16"
              borderRadius="s16"
              mb="s20"
              style={{backgroundColor: 'white'}}>
              <QRCode
                value={booking.qrCode && booking.qrCode.length <= 1000 ? booking.qrCode : booking.id}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </Box>
          ) : (
            <Box
              width={240}
              height={240}
              backgroundColor="background"
              borderRadius="s16"
              borderWidth={8}
              borderColor="primary"
              alignItems="center"
              justifyContent="center"
              mb="s20">
              <Icon name="qr-code" size={180} color="text" />
              <Text preset="paragraphSmall" color="textSecondary" mt="s8">
                QR Code indisponível
              </Text>
            </Box>
          )}

          {/* Booking Code */}
          <Box
            paddingVertical="s12"
            paddingHorizontal="s24"
            backgroundColor="primaryBg"
            borderRadius="s12"
            mb="s8">
            <Text preset="paragraphCaptionSmall" color="primary" mb="s4" textAlign="center">
              Código da Reserva
            </Text>
            <Text preset="headingSmall" color="primary" bold textAlign="center">
              {booking.id?.slice(0, 8).toUpperCase() || 'N/A'}
            </Text>
          </Box>

          <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
            Mantenha o brilho da tela no máximo para facilitar a leitura
          </Text>
        </Box>

        {/* Trip Details */}
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
            Detalhes da Viagem
          </Text>

          {/* Route */}
          <Box mb="s16">
            <Box flexDirection="row" alignItems="flex-start" mb="s12">
              <Box
                width={32}
                height={32}
                borderRadius="s16"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="place" size={20} color="primary" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                  Origem
                </Text>
                <Text preset="paragraphMedium" color="text" bold>
                  {trip.origin}
                </Text>
              </Box>
            </Box>

            <Box
              width={2}
              height={20}
              backgroundColor="border"
              marginLeft="s16"
              mb="s12"
            />

            <Box flexDirection="row" alignItems="flex-start">
              <Box
                width={32}
                height={32}
                borderRadius="s16"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="place" size={20} color="secondary" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                  Destino
                </Text>
                <Text preset="paragraphMedium" color="text" bold>
                  {trip.destination}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Date & Time */}
          <Box
            paddingVertical="s12"
            paddingHorizontal="s16"
            backgroundColor="background"
            borderRadius="s12"
            mb="s16">
            <Box flexDirection="row" alignItems="center" mb="s8">
              <Icon name="event" size={18} color="primary" />
              <Text preset="paragraphSmall" color="text" ml="s8" bold>
                {formatDate(trip.departureAt)}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center">
              <Icon name="schedule" size={18} color="primary" />
              <Text preset="paragraphSmall" color="text" ml="s8">
                {`Embarque: ${formatTime(trip.departureAt)} • Chegada prevista: ${formatTime(trip.estimatedArrivalAt)}`}
              </Text>
            </Box>
          </Box>

          {/* Boat & Captain */}
          <Box flexDirection="row" alignItems="center" mb="s8">
            <Icon name="directions-boat" size={20} color="secondary" />
            <Text preset="paragraphMedium" color="text" bold ml="s8">
              {`Barco ${trip.boatId?.slice(0, 8) || 'N/A'}`}
            </Text>
          </Box>

          <Box flexDirection="row" alignItems="center">
            <Icon name="person" size={20} color="primary" />
            <Text preset="paragraphSmall" color="text" ml="s8">
              Cap. {trip.captainId?.slice(0, 8) || 'N/A'}
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
            Passageiro
          </Text>

          <Box flexDirection="row" alignItems="center" mb="s12">
            <Box
              width={48}
              height={48}
              borderRadius="s24"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              marginRight="s16">
              <Icon name="person" size={24} color="primary" />
            </Box>

            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold mb="s4">
                Reserva #{booking.id?.slice(0, 8).toUpperCase() || 'N/A'}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                User ID: {booking.userId?.slice(0, 8) || 'N/A'}
              </Text>
            </Box>

            <Box
              backgroundColor="primaryBg"
              paddingHorizontal="s12"
              paddingVertical="s8"
              borderRadius="s8">
              <Text preset="paragraphSmall" color="primary" bold>
                {booking.quantity}{' '}
                {booking.quantity === 1 ? 'assento' : 'assentos'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Payment Info */}
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
            Pagamento
          </Text>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            mb="s12">
            <Text preset="paragraphSmall" color="textSecondary">
              Forma de pagamento
            </Text>
            <Text preset="paragraphSmall" color="text" bold>
              {getPaymentMethodLabel(booking.paymentMethod)}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            mb="s12">
            <Text preset="paragraphSmall" color="textSecondary">
              Data da reserva
            </Text>
            <Text preset="paragraphSmall" color="text" bold>
              {formatShortDate(booking.createdAt)}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            paddingTop="s12"
            borderTopWidth={1}
            borderTopColor="border">
            <Text preset="paragraphMedium" color="text" bold>
              Total pago
            </Text>
            <Text preset="headingSmall" color="primary" bold>
              R$ {(typeof booking.totalPrice === 'number' ? booking.totalPrice : parseFloat(String(booking.totalPrice)) || 0).toFixed(2)}
            </Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        {(ticketStatus === 'confirmed' || ticketStatus === 'pending') && (
          <Box gap="s12" mb="s24">
            <Button
              title="Rastrear Viagem"
              onPress={handleStartTracking}
              rightIcon="near-me"
            />

            <TouchableOpacityBox
              paddingVertical="s16"
              borderRadius="s12"
              backgroundColor="dangerBg"
              alignItems="center"
              onPress={handleCancelBooking}>
              <Text preset="paragraphMedium" color="danger" bold>
                Cancelar Reserva
              </Text>
            </TouchableOpacityBox>
          </Box>
        )}

        {ticketStatus === 'active' && (
          <Button
            title="Ver Rastreamento em Tempo Real"
            onPress={handleStartTracking}
            rightIcon="near-me"
            mb="s24"
          />
        )}

        {/* Help */}
        <Box
          flexDirection="row"
          paddingVertical="s16"
          paddingHorizontal="s16"
          backgroundColor="surface"
          borderRadius="s12"
          mb="s24">
          <Icon
            name="help"
            size={20}
            color="primary"
          />
          <Box flex={1}>
            <Text preset="paragraphSmall" color="text" bold mb="s4">
              Precisa de ajuda?
            </Text>
            <Text preset="paragraphSmall" color="textSecondary">
              Entre em contato com o suporte através do menu Perfil
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
