import React, {useState, useEffect, useRef} from 'react';
import {ScrollView, Linking, Alert, StyleSheet} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox, BoatMarker} from '@components';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Tracking'>;

type TripStatus =
  | 'boarding'
  | 'departed'
  | 'in_transit'
  | 'approaching'
  | 'arrived';

// Mock data
const MOCK_TRACKING = {
  bookingId: 'BK123456',
  currentStatus: 'in_transit' as TripStatus,
  progress: 65,
  trip: {
    origin: 'Manaus',
    destination: 'Parintins',
    departureTime: '08:00',
    arrivalTime: '14:00',
    actualDepartureTime: '08:05',
    estimatedArrival: '13:55',
  },
  boat: {
    name: 'Expresso Amazonas',
    currentSpeed: 45,
    averageSpeed: 42,
  },
  captain: {
    name: 'João Silva',
    phone: '(92) 98765-4321',
  },
  currentLocation: {
    latitude: -3.1,
    longitude: -60.0,
    lastUpdate: new Date(),
  },
  timeline: [
    {
      id: '1',
      label: 'Embarque Iniciado',
      time: '07:45',
      status: 'completed',
      icon: 'assignment',
    },
    {
      id: '2',
      label: 'Partida',
      time: '08:05',
      status: 'completed',
      icon: 'sailing',
    },
    {
      id: '3',
      label: 'Ponto de Parada - Itacoatiara',
      time: '10:30',
      status: 'completed',
      icon: 'place',
    },
    {
      id: '4',
      label: 'Em Trânsito',
      time: 'Agora',
      status: 'current',
      icon: 'navigation',
    },
    {
      id: '5',
      label: 'Chegada Prevista',
      time: '13:55',
      status: 'upcoming',
      icon: 'check-circle',
    },
  ],
  weather: {
    condition: 'Ensolarado',
    temperature: 32,
    icon: 'wb-sunny',
  },
};

export function TrackingScreen({navigation, route}: Props) {
  const {bookingId: _bookingId} = route.params;
  const [_isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef<MapView>(null);

  // TODO: Buscar dados de rastreamento da API em tempo real
  const tracking = MOCK_TRACKING;

  // Coordenadas reais da Amazônia
  const originCoords = {latitude: -3.1190, longitude: -60.0217}; // Manaus
  const destinationCoords = {latitude: -2.6283, longitude: -56.7358}; // Parintins

  // Calcula posição atual do barco baseado no progresso
  const calculateCurrentPosition = () => {
    const progress = tracking.progress / 100;
    return {
      latitude:
        originCoords.latitude +
        (destinationCoords.latitude - originCoords.latitude) * progress,
      longitude:
        originCoords.longitude +
        (destinationCoords.longitude - originCoords.longitude) * progress,
    };
  };

  const currentPosition = calculateCurrentPosition();

  // Coordenadas da rota (simplificado - idealmente viria da API)
  const routeCoordinates = [originCoords, currentPosition, destinationCoords];

  // Simula atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Atualizar localização em tempo real
      console.log('Atualizando localização...');
    }, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO: Buscar dados atualizados da API
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleCallCaptain = () => {
    Alert.alert(
      'Ligar para o Capitão',
      `Deseja ligar para ${tracking.captain.name}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Ligar',
          onPress: () => Linking.openURL(`tel:${tracking.captain.phone}`),
        },
      ],
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergência',
      'Você será conectado com os serviços de emergência.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Chamar Emergência',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:190'),
        },
      ],
    );
  };

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case 'boarding':
        return 'Embarque em Andamento';
      case 'departed':
        return 'Partiu do Porto';
      case 'in_transit':
        return 'Em Trânsito';
      case 'approaching':
        return 'Chegando ao Destino';
      case 'arrived':
        return 'Chegou ao Destino';
    }
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingVertical="s16"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" mb="s12">
          <Button
            title=""
            preset="outline"
            leftIcon="arrow-back"
            onPress={() => navigation.goBack()}
          />

          <Box flex={1} ml="s12">
            <Text preset="headingSmall" color="text" bold>
              Rastreamento
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              {tracking.trip.origin} → {tracking.trip.destination}
            </Text>
          </Box>

          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            onPress={handleRefresh}
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
            }}>
            <Icon name="refresh" size={24} color="text" />
          </TouchableOpacityBox>
        </Box>

        {/* Status Badge */}
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="successBg"
          paddingHorizontal="s16"
          paddingVertical="s10"
          borderRadius="s12"
          alignSelf="flex-start">
          <Box
            width={8}
            height={8}
            borderRadius="s8"
            backgroundColor="success"
            marginRight="s8"
          />
          <Text preset="paragraphMedium" color="success" bold>
            {getStatusLabel(tracking.currentStatus)}
          </Text>
        </Box>
      </Box>

      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* Google Maps */}
        <Box
          height={320}
          backgroundColor="surface"
          borderRadius="s20"
          mb="s16"
          overflow="hidden"
          style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
              latitudeDelta: 1.5,
              longitudeDelta: 1.5,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}>
            {/* Rota (linha entre origem e destino) */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0B5D8A"
              strokeWidth={3}
            />

            {/* Marcador de Origem */}
            <Marker
              coordinate={originCoords}
              title={tracking.trip.origin}
              description="Porto de Origem"
              pinColor="green"
            />

            {/* Marcador do Barco (posição atual) */}
            <BoatMarker
              coordinate={currentPosition}
              title={tracking.boat.name}
              description={`Velocidade: ${tracking.boat.currentSpeed} km/h`}
            />

            {/* Marcador de Destino */}
            <Marker
              coordinate={destinationCoords}
              title={tracking.trip.destination}
              description="Porto de Destino"
              pinColor="red"
            />
          </MapView>

          {/* Info Overlay sobre o mapa */}
          <Box
            position="absolute"
            bottom={16}
            left={16}
            right={16}
            backgroundColor="surface"
            borderRadius="s16"
            padding="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              mb="s8">
              <Text preset="paragraphSmall" color="textSecondary">
                Progresso da Viagem
              </Text>
              <Text preset="paragraphMedium" color="primary" bold>
                {tracking.progress}%
              </Text>
            </Box>

            {/* Progress Bar */}
            <Box
              height={8}
              backgroundColor="border"
              borderRadius="s8"
              overflow="hidden">
              <Box
                width={`${tracking.progress}%`}
                height="100%"
                backgroundColor="primary"
              />
            </Box>
          </Box>
        </Box>

        {/* Trip Status */}
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
          <Box flexDirection="row" gap="s16" mb="s16">
            <Box
              flex={1}
              backgroundColor="primaryBg"
              paddingVertical="s12"
              paddingHorizontal="s12"
              borderRadius="s12">
              <Icon
                name="schedule"
                size={20}
                color="primary"
              />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                Chegada Prevista
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {tracking.trip.estimatedArrival}
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="secondaryBg"
              paddingVertical="s12"
              paddingHorizontal="s12"
              borderRadius="s12">
              <Icon
                name="speed"
                size={20}
                color="secondary"
              />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                Velocidade Atual
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {tracking.boat.currentSpeed} km/h
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="accentBg"
              paddingVertical="s12"
              paddingHorizontal="s12"
              borderRadius="s12">
              <Icon
                name={tracking.weather.icon as any}
                size={20}
                color="accent"
              />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                Clima
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {tracking.weather.temperature}°C
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Timeline */}
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
          <Text preset="paragraphMedium" color="text" bold mb="s20">
            Linha do Tempo
          </Text>

          {tracking.timeline.map((item, index) => (
            <Box key={item.id} flexDirection="row" alignItems="flex-start">
              {/* Icon & Line */}
              <Box alignItems="center" marginRight="s16">
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor={
                    item.status === 'completed'
                      ? 'success'
                      : item.status === 'current'
                      ? 'primary'
                      : 'border'
                  }
                  alignItems="center"
                  justifyContent="center">
                  <Icon
                    name={item.icon as any}
                    size={20}
                    color={
                      item.status === 'upcoming' ? 'textSecondary' : 'surface'
                    }
                  />
                </Box>

                {index < tracking.timeline.length - 1 && (
                  <Box
                    width={2}
                    height={40}
                    backgroundColor={
                      item.status === 'completed' ? 'success' : 'border'
                    }
                    marginVertical="s4"
                  />
                )}
              </Box>

              {/* Content */}
              <Box flex={1} paddingBottom="s20">
                <Text
                  preset="paragraphMedium"
                  color={item.status === 'upcoming' ? 'textSecondary' : 'text'}
                  bold={item.status === 'current'}
                  mb="s4">
                  {item.label}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {item.time}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Captain Contact */}
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
            Contato do Barqueiro
          </Text>

          <Box flexDirection="row" alignItems="center" mb="s16">
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

            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold mb="s4">
                {tracking.captain.name}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                {tracking.captain.phone}
              </Text>
            </Box>
          </Box>

          <Button
            title="Ligar para o Capitão"
            onPress={handleCallCaptain}
            rightIcon="phone"
          />
        </Box>

        {/* Emergency Button */}
        <TouchableOpacityBox
          backgroundColor="dangerBg"
          borderRadius="s16"
          padding="s20"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          mb="s24"
          onPress={handleEmergency}>
          <Icon
            name="warning"
            size={24}
            color="danger"
          />
          <Text preset="paragraphLarge" color="danger" bold>
            Emergência
          </Text>
        </TouchableOpacityBox>

        {/* Info */}
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
          <Text preset="paragraphSmall" color="textSecondary" flex={1}>
            A localização é atualizada automaticamente a cada 30 segundos
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
