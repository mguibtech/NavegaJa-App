import React, {useState} from 'react';
import {FlatList, RefreshControl, ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useAuthStore} from '../../store/auth.store';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'HomeTabs'>;

// Mock data - será substituído por dados reais da API
const MOCK_TRIPS = [
  {
    id: '1',
    origin: 'Manaus',
    destination: 'Parintins',
    departureTime: '08:00',
    arrivalTime: '14:00',
    date: '2026-02-15',
    price: 85.0,
    availableSeats: 12,
    boatName: 'Expresso Amazonas',
    captainName: 'João Silva',
  },
  {
    id: '2',
    origin: 'Manaus',
    destination: 'Itacoatiara',
    departureTime: '09:30',
    arrivalTime: '12:00',
    date: '2026-02-15',
    price: 45.0,
    availableSeats: 8,
    boatName: 'Rio Negro Express',
    captainName: 'Maria Santos',
  },
  {
    id: '3',
    origin: 'Parintins',
    destination: 'Manaus',
    departureTime: '15:00',
    arrivalTime: '21:00',
    date: '2026-02-16',
    price: 85.0,
    availableSeats: 15,
    boatName: 'Boto Cor de Rosa',
    captainName: 'Carlos Mendes',
  },
];

export function HomeScreen({navigation}: Props) {
  const {user} = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Buscar viagens da API
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s56"
        paddingBottom="s24"
        backgroundColor="primary">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Text preset="paragraphMedium" color="surface" mb="s4">
              {getGreeting()},
            </Text>
            <Text preset="headingMedium" color="surface" bold>
              {user?.name?.split(' ')[0]}
            </Text>
          </Box>
          <TouchableOpacityBox
            width={48}
            height={48}
            borderRadius="s24"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center">
            <Icon name="notifications" size={24} color="primary" />
          </TouchableOpacityBox>
        </Box>
      </Box>

      {/* Content */}
      <FlatList
        data={MOCK_TRIPS}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Box mb="s24">
            <Text preset="headingSmall" color="text" bold mb="s8">
              Viagens Disponíveis
            </Text>
            <Text preset="paragraphMedium" color="textSecondary">
              Encontre a melhor opção para sua jornada
            </Text>
          </Box>
        }
        renderItem={({item}) => (
          <TouchableOpacityBox
            mb="s16"
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            {/* Route Info */}
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box flex={1}>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                  Origem
                </Text>
                <Text preset="paragraphMedium" color="text" bold>
                  {item.origin}
                </Text>
              </Box>

              <Box
                width={40}
                height={40}
                borderRadius="s20"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                mx="s12">
                <Icon name="arrow-forward" size={20} color="primary" />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                  Destino
                </Text>
                <Text preset="paragraphMedium" color="text" bold>
                  {item.destination}
                </Text>
              </Box>
            </Box>

            {/* Time Info */}
            <Box
              flexDirection="row"
              alignItems="center"
              mb="s12"
              paddingVertical="s12"
              paddingHorizontal="s16"
              backgroundColor="background"
              borderRadius="s12">
              <Icon name="schedule" size={20} color="primary" />
              <Text preset="paragraphMedium" color="text" ml="s8">
                {item.departureTime} - {item.arrivalTime}
              </Text>
              <Box flex={1} />
              <Icon name="event" size={20} color="textSecondary" />
              <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                {new Date(item.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </Text>
            </Box>

            {/* Boat & Captain */}
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Icon name="directions-boat" size={18} color="secondary" />
              <Text preset="paragraphSmall" color="text" ml="s8">
                {item.boatName}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" ml="s4">
                • {item.captainName}
              </Text>
            </Box>

            {/* Price & Seats */}
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between">
              <Box flexDirection="row" alignItems="baseline">
                <Text preset="headingSmall" color="primary" bold>
                  R$ {item.price.toFixed(2)}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary" ml="s4">
                  /pessoa
                </Text>
              </Box>

              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="successBg"
                paddingHorizontal="s12"
                paddingVertical="s8"
                borderRadius="s8">
                <Icon name="event-seat" size={16} color="success" />
                <Text preset="paragraphSmall" color="success" bold ml="s4">
                  {item.availableSeats} disponíveis
                </Text>
              </Box>
            </Box>
          </TouchableOpacityBox>
        )}
        ListEmptyComponent={
          <Box alignItems="center" paddingVertical="s48">
            <Icon name="directions-boat" size={64} color="border" />
            <Text preset="headingSmall" color="textSecondary" mt="s16">
              Nenhuma viagem disponível
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" mt="s8" textAlign="center">
              Verifique novamente mais tarde ou ajuste seus filtros
            </Text>
          </Box>
        }
      />
    </Box>
  );
}
