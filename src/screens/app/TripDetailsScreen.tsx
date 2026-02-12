import React, {useState} from 'react';
import {ScrollView, Dimensions} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'TripDetails'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Mock data - será substituído por dados reais da API
const MOCK_TRIP_DETAILS = {
  id: '1',
  origin: 'Manaus',
  destination: 'Parintins',
  departureTime: '08:00',
  arrivalTime: '14:00',
  duration: '6h',
  date: '2026-02-15',
  price: 85.0,
  availableSeats: 12,
  totalSeats: 20,
  boatName: 'Expresso Amazonas',
  boatModel: 'Lancha Regional',
  boatYear: 2022,
  captain: {
    id: 'c1',
    name: 'João Silva',
    photo: null,
    rating: 4.8,
    totalTrips: 156,
    yearsExperience: 12,
    bio: 'Navegador experiente da Amazônia com mais de 12 anos de experiência. Conheço todos os rios da região como a palma da minha mão.',
  },
  amenities: [
    {icon: 'air', label: 'Ar Condicionado'},
    {icon: 'wifi', label: 'Wi-Fi'},
    {icon: 'restaurant', label: 'Lanche'},
    {icon: 'wc', label: 'Banheiro'},
    {icon: 'luggage', label: 'Bagagem'},
    {icon: 'accessible', label: 'Acessível'},
  ],
  photos: [
    'https://placeholder.com/boat1.jpg',
    'https://placeholder.com/boat2.jpg',
    'https://placeholder.com/boat3.jpg',
  ],
  reviews: [
    {
      id: 'r1',
      passengerName: 'Maria Costa',
      rating: 5,
      date: '2026-01-20',
      comment: 'Viagem excelente! Barco limpo e confortável, capitão muito atencioso.',
    },
    {
      id: 'r2',
      passengerName: 'Pedro Santos',
      rating: 4,
      date: '2026-01-15',
      comment: 'Boa viagem, chegamos no horário. Recomendo!',
    },
    {
      id: 'r3',
      passengerName: 'Ana Lima',
      rating: 5,
      date: '2026-01-10',
      comment: 'Melhor experiência que tive em viagens de barco. Muito seguro e pontual.',
    },
  ],
  policies: [
    'Cancelamento gratuito até 24h antes da viagem',
    'Crianças até 5 anos não pagam',
    'Bagagem máxima: 20kg por pessoa',
    'É obrigatório o uso de colete salva-vidas',
  ],
};

export function TripDetailsScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // TODO: Buscar detalhes da viagem da API usando tripId
  const trip = MOCK_TRIP_DETAILS;

  const handleBooking = () => {
    navigation.navigate('Booking', {tripId: trip.id});
  };

  const renderStars = (rating: number) => {
    return (
      <Box flexDirection="row" gap="s4">
        {[1, 2, 3, 4, 5].map(star => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color={star <= rating ? 'warning' : 'border'}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <Box
          paddingHorizontal="s24"
          paddingTop="s56"
          paddingBottom="s20"
          backgroundColor="primary">
          <Box flexDirection="row" alignItems="center" mb="s12">
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
                {trip.origin} → {trip.destination}
              </Text>
            </Box>

            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center">
              <Icon name="favorite-border" size={24} color="primary" />
            </TouchableOpacityBox>
          </Box>

          {/* Quick Info */}
          <Box flexDirection="row" gap="s16">
            <Box
              flex={1}
              backgroundColor="primaryMid"
              paddingVertical="s12"
              paddingHorizontal="s16"
              borderRadius="s12">
              <Text preset="paragraphCaptionSmall" color="surface" mb="s4">
                Data
              </Text>
              <Text preset="paragraphSmall" color="surface" bold>
                {new Date(trip.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="primaryMid"
              paddingVertical="s12"
              paddingHorizontal="s16"
              borderRadius="s12">
              <Text preset="paragraphCaptionSmall" color="surface" mb="s4">
                Horário
              </Text>
              <Text preset="paragraphSmall" color="surface" bold>
                {trip.departureTime}
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="primaryMid"
              paddingVertical="s12"
              paddingHorizontal="s16"
              borderRadius="s12">
              <Text preset="paragraphCaptionSmall" color="surface" mb="s4">
                Duração
              </Text>
              <Text preset="paragraphSmall" color="surface" bold>
                {trip.duration}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box padding="s24">
          {/* Boat Info */}
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

              <Box flex={1}>
                <Text preset="headingSmall" color="text" bold mb="s4">
                  {trip.boatName}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {trip.boatModel} • {trip.boatYear}
                </Text>
              </Box>
            </Box>

            {/* Amenities */}
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Comodidades
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="s8">
              {trip.amenities.map((amenity, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor="background"
                  paddingHorizontal="s12"
                  paddingVertical="s8"
                  borderRadius="s8">
                  <Icon name={amenity.icon as any} size={16} color="primary" />
                  <Text
                    preset="paragraphSmall"
                    color="text"
                    ml="s8">
                    {amenity.label}
                  </Text>
                </Box>
              ))}
            </Box>
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
              Sobre o Barqueiro
            </Text>

            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={64}
                height={64}
                borderRadius="s48"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="person" size={32} color="primary" />
              </Box>

              <Box flex={1}>
                <Text preset="headingSmall" color="text" bold mb="s4">
                  {trip.captain.name}
                </Text>
                <Box flexDirection="row" alignItems="center" mb="s4">
                  <Icon name="star" size={16} color="warning" />
                  <Text preset="paragraphSmall" color="text" bold ml="s4">
                    {trip.captain.rating.toFixed(1)}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                    {trip.captain.totalTrips} viagens
                  </Text>
                </Box>
                <Text preset="paragraphSmall" color="textSecondary">
                  {trip.captain.yearsExperience} anos de experiência
                </Text>
              </Box>
            </Box>

            <Text preset="paragraphSmall" color="text" lineHeight={20}>
              {trip.captain.bio}
            </Text>
          </Box>

          {/* Reviews */}
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
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              mb="s16">
              <Text preset="paragraphMedium" color="text" bold>
                Avaliações ({trip.reviews.length})
              </Text>
              <TouchableOpacityBox>
                <Text preset="paragraphSmall" color="primary" bold>
                  Ver todas
                </Text>
              </TouchableOpacityBox>
            </Box>

            {trip.reviews.slice(0, 2).map(review => (
              <Box
                key={review.id}
                paddingVertical="s16"
                borderBottomWidth={1}
                borderBottomColor="border">
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb="s8">
                  <Text preset="paragraphSmall" color="text" bold>
                    {review.passengerName}
                  </Text>
                  {renderStars(review.rating)}
                </Box>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                  {new Date(review.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text preset="paragraphSmall" color="text" lineHeight={20}>
                  {review.comment}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Policies */}
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
              Políticas da Viagem
            </Text>

            {trip.policies.map((policy, index) => (
              <Box key={index} flexDirection="row" mb="s12">
                <Icon
                  name="check-circle"
                  size={20}
                  color="success"
                  style={{marginRight: 12}}
                />
                <Text preset="paragraphSmall" color="text" flex={1}>
                  {policy}
                </Text>
              </Box>
            ))}
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
              Preço por pessoa
            </Text>
            <Box flexDirection="row" alignItems="baseline">
              <Text preset="headingLarge" color="primary" bold>
                R$ {trip.price.toFixed(2)}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                {trip.availableSeats} assentos disponíveis
              </Text>
            </Box>
          </Box>
        </Box>

        <Button
          title="Reservar Agora"
          onPress={handleBooking}
          rightIcon="arrow-forward"
        />
      </Box>
    </Box>
  );
}
