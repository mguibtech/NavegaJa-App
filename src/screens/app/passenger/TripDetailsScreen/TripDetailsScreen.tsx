import React from 'react';
import {ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, ConfirmationModal, Icon, Text, TouchableOpacityBox, PromoBadge, TripDetailsSkeleton, TripWeatherWidget} from '@components';

import {formatBRL} from '@utils';

import {useTripDetailsScreen} from './useTripDetailsScreen';

export function TripDetailsScreen() {
  const {top} = useSafeAreaInsets();
  const {
    trip,
    isLoading,
    error,
    promotion,
    context,
    isFav,
    isBoatFav,
    isCaptainFav,
    isTogglingFavorite,
    showLoadErrorModal,
    basePrice,
    displayPrice,
    finalHasDiscount,
    discountPercent,
    boatName,
    captainName,
    cargoPrice,
    hasCargoPrice,
    handleBooking,
    handleCreateShipment,
    handleToggleFavorite,
    handleToggleFavoriteBoat,
    handleToggleFavoriteCaptain,
    handleNavigateToBoatDetail,
    handleNavigateToCaptainProfile,
    handleGoBack,
    handleConfirmLoadError,
    handleCancelLoadError,
    loadTripDetails,
  } = useTripDetailsScreen();

  // Loading state
  if (isLoading) {
    return (
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          paddingHorizontal="s24"
          paddingBottom="s12"
          backgroundColor="surface"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={handleGoBack}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>

            <Text preset="headingSmall" color="text" bold>
              {'Detalhes da Viagem'}
            </Text>
          </Box>
        </Box>

        <TripDetailsSkeleton />
      </Box>
    );
  }

  // Error state (fallback if dialog was dismissed)
  if (error || !trip) {
    return (
      <Box flex={1} backgroundColor="background">
        <Box
          paddingHorizontal="s24"
          paddingBottom="s16"
          backgroundColor="surface"
          style={{
            paddingTop: top + 16,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center"
            onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color="primary" />
          </TouchableOpacityBox>
        </Box>
        <Box flex={1} justifyContent="center" alignItems="center" padding="s24">
          <Icon name="error-outline" size={64} color="danger" />
          <Text preset="headingSmall" color="text" mt="s16" textAlign="center">
            {'Erro ao carregar viagem'}
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s8" textAlign="center">
            {'Não foi possível carregar os detalhes desta viagem'}
          </Text>
          <Box mt="s24" width="100%">
            <Button
              title="Tentar Novamente"
              onPress={loadTripDetails}
              leftIcon="refresh"
            />
            <Box mt="s12">
              <Button
                title="Voltar"
                onPress={handleGoBack}
                preset="outline"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <Box
          paddingHorizontal="s24"
          paddingBottom="s12"
          backgroundColor="surface"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={handleGoBack}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>

            <Box alignItems="center">
              <Text preset="headingSmall" color="text" bold>
                {'Detalhes da Viagem'}
              </Text>
              {promotion && (
                <Box
                  backgroundColor="dangerBg"
                  paddingHorizontal="s12"
                  paddingVertical="s4"
                  borderRadius="s12"
                  marginTop="s6"
                  flexDirection="row"
                  alignItems="center">
                  <Icon name="local-offer" size={12} color="danger" />
                  <Text preset="paragraphCaptionSmall" color="danger" bold ml="s4">
                    {'🎉 PROMOÇÃO ATIVA'}
                  </Text>
                </Box>
              )}
            </Box>

            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={handleToggleFavorite}
              disabled={isTogglingFavorite}
              style={{position: 'absolute', right: 0}}>
              <Icon
                name={isFav ? 'favorite' : 'favorite-border'}
                size={22}
                color={isFav ? 'danger' : 'text'}
              />
            </TouchableOpacityBox>
          </Box>
        </Box>

        {/* Content */}
        <Box padding="s24">
          {/* Trip Info Card */}
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
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={56}
                height={56}
                borderRadius="s12"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="directions-boat" size={32} color="secondary" />
              </Box>

              <Box flex={1} mr="s12">
                <Text preset="headingSmall" color="text" bold mb="s4">
                  {boatName}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {trip.boat?.type || 'Embarcação'} {trip.boat?.capacity ? `• ${trip.boat.capacity} lugares` : ''}
                </Text>
              </Box>

              {/* Botão de favoritar barco */}
              {trip.boatId && (
                <TouchableOpacityBox
                  width={36}
                  height={36}
                  borderRadius="s20"
                  backgroundColor="secondaryBg"
                  alignItems="center"
                  justifyContent="center"
                  onPress={handleToggleFavoriteBoat}
                  disabled={isTogglingFavorite}>
                  <Icon
                    name={isBoatFav ? 'favorite' : 'favorite-border'}
                    size={18}
                    color="secondary"
                  />
                </TouchableOpacityBox>
              )}
            </Box>

            {/* Seats Info */}
            <Box
              backgroundColor="background"
              padding="s16"
              borderRadius="s12"
              mb="s12">
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s8">
                <Text preset="paragraphMedium" color="text" bold>
                  {'Assentos Disponíveis'}
                </Text>
                <Text preset="headingSmall" color="primary" bold>
                  {trip.availableSeats}
                </Text>
              </Box>
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text preset="paragraphSmall" color="textSecondary">
                  {'Total de assentos'}
                </Text>
                <Text preset="paragraphSmall" color="text" bold>
                  {trip.totalSeats}
                </Text>
              </Box>
            </Box>

            {/* Status Badge */}
            <Box
              backgroundColor={
                trip.status === 'scheduled' ? 'successBg' :
                trip.status === 'in_progress' ? 'warningBg' :
                trip.status === 'completed' ? 'primaryBg' : 'dangerBg'
              }
              paddingHorizontal="s16"
              paddingVertical="s10"
              borderRadius="s12"
              alignSelf="flex-start">
              <Text
                preset="paragraphSmall"
                color={
                  trip.status === 'scheduled' ? 'success' :
                  trip.status === 'in_progress' ? 'warning' :
                  trip.status === 'completed' ? 'primary' : 'danger'
                }
                bold>
                {trip.status === 'scheduled' ? '✓ Agendada' :
                 trip.status === 'in_progress' ? '⚡ Em andamento' :
                 trip.status === 'completed' ? '✓ Concluída' : '✗ Cancelada'}
              </Text>
            </Box>

            {/* Link to boat detail screen */}
            <TouchableOpacityBox
              mt="s16"
              pt="s12"
              borderTopWidth={1}
              borderTopColor="border"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              onPress={handleNavigateToBoatDetail}>
              <Text preset="paragraphSmall" color="secondary" bold>
                Ver embarcação completa
              </Text>
              <Icon name="chevron-right" size={16} color="secondary" />
            </TouchableOpacityBox>
          </Box>

          {/* Weather da viagem */}
          <Box mb="s16">
            <TripWeatherWidget tripId={trip.id} />
          </Box>

          {/* Captain Info */}
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
              {'Capitão'}
            </Text>

            <Box flexDirection="row" alignItems="center">
              <Box
                width={56}
                height={56}
                borderRadius="s48"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="person" size={28} color="primary" />
              </Box>

              <Box flex={1} mr="s12">
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  {captainName}
                </Text>
                {trip.captain && (
                  <Box flexDirection="row" alignItems="center" gap="s8">
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="star" size={14} color="warning" />
                      <Text preset="paragraphSmall" color="text" ml="s4">
                        {typeof trip.captain.rating === 'number'
                          ? trip.captain.rating.toFixed(1)
                          : typeof trip.captain.rating === 'string'
                          ? parseFloat(trip.captain.rating).toFixed(1)
                          : '5.0'}
                      </Text>
                    </Box>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {'• '}{trip.captain.totalTrips}{' '}{trip.captain.totalTrips === 1 ? 'viagem' : 'viagens'}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Botão de favoritar capitão */}
              {trip.captainId && (
                <TouchableOpacityBox
                  width={36}
                  height={36}
                  borderRadius="s20"
                  backgroundColor="warningBg"
                  alignItems="center"
                  justifyContent="center"
                  onPress={handleToggleFavoriteCaptain}
                  disabled={isTogglingFavorite}>
                  <Icon
                    name={isCaptainFav ? 'favorite' : 'favorite-border'}
                    size={18}
                    color="warning"
                  />
                </TouchableOpacityBox>
              )}
            </Box>

            {/* Link to captain profile screen */}
            <TouchableOpacityBox
              mt="s16"
              pt="s12"
              borderTopWidth={1}
              borderTopColor="border"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              onPress={handleNavigateToCaptainProfile}>
              <Text preset="paragraphSmall" color="primary" bold>
                Ver perfil completo
              </Text>
              <Icon name="chevron-right" size={16} color="primary" />
            </TouchableOpacityBox>
          </Box>

          {/* Spacer for fixed footer */}
          <Box height={100} />
        </Box>
      </ScrollView>

      {/* Fixed Footer with Price and Book Button */}
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
        <Box flexDirection="row" alignItems="center" mb="s12">
          <Box flex={1}>
            <Text preset="paragraphSmall" color="textSecondary" mb="s4">
              {context === 'shipment' ? 'Preço por quilo de carga' : 'Preço por pessoa'}
            </Text>
            {finalHasDiscount && context !== 'shipment' && (
              <Box flexDirection="row" alignItems="center" mb="s8">
                <PromoBadge discount={discountPercent} size="medium" />
                <Text
                  preset="paragraphMedium"
                  color="textSecondary"
                  ml="s12"
                  style={{textDecorationLine: 'line-through'}}>
                  {formatBRL(basePrice)}
                </Text>
              </Box>
            )}
            <Box flexDirection="row" alignItems="baseline" gap="s8">
              {context === 'shipment' ? (
                hasCargoPrice ? (
                  <Text preset="headingLarge" color="primary" bold>
                    {formatBRL(cargoPrice)}{'/kg'}
                  </Text>
                ) : (
                  <Text preset="headingLarge" color="textSecondary" bold>
                    A combinar
                  </Text>
                )
              ) : (
                <Text preset="headingLarge" color="primary" bold>
                  {formatBRL(displayPrice)}
                </Text>
              )}
              {context === 'shipment' ? (
                <Box flexDirection="row" alignItems="center" backgroundColor="successBg" paddingHorizontal="s12" paddingVertical="s6" borderRadius="s8">
                  <Icon name="inventory" size={16} color="success" />
                  <Text preset="paragraphSmall" color="success" bold ml="s4">
                    Aceita cargas
                  </Text>
                </Box>
              ) : (
                <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                  {trip.availableSeats}{' assentos disponíveis'}
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        {context === 'shipment' ? (
          <Button
            title="Enviar Encomenda"
            onPress={handleCreateShipment}
            rightIcon="local-shipping"
          />
        ) : (
          <Button
            title="Reservar Agora"
            onPress={handleBooking}
            rightIcon="arrow-forward"
          />
        )}
      </Box>

      <ConfirmationModal
        visible={showLoadErrorModal}
        title="Erro"
        message="Não foi possível carregar os dados da viagem"
        icon="error"
        iconColor="danger"
        confirmText="Tentar novamente"
        cancelText="Voltar"
        onConfirm={handleConfirmLoadError}
        onCancel={handleCancelLoadError}
      />
    </Box>
  );
}
