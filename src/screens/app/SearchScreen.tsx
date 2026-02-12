import React, {useState} from 'react';
import {Keyboard, ScrollView, TouchableWithoutFeedback} from 'react-native';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';

import {AppStackParamList, TabsParamList} from '../../routes/AppStack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Search'>,
  NativeStackScreenProps<AppStackParamList>
>;

const POPULAR_ROUTES = [
  {origin: 'Manaus', destination: 'Parintins', icon: 'directions-boat'},
  {origin: 'Manaus', destination: 'Itacoatiara', icon: 'directions-boat'},
  {origin: 'Manaus', destination: 'Coari', icon: 'directions-boat'},
  {origin: 'Parintins', destination: 'Manaus', icon: 'directions-boat'},
];

export function SearchScreen({navigation}: Props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  function handleSearch() {
    if (!origin.trim() || !destination.trim()) {
      // TODO: Show toast warning
      return;
    }

    navigation.navigate('SearchResults', {
      origin: origin.trim(),
      destination: destination.trim(),
      date: date.trim() || undefined,
    });
  }

  function handlePopularRoute(route: typeof POPULAR_ROUTES[0]) {
    setOrigin(route.origin);
    setDestination(route.destination);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          paddingHorizontal="s24"
          paddingTop="s56"
          paddingBottom="s24"
          backgroundColor="primary">
          <Text preset="headingLarge" color="surface" bold>
            Buscar Viagem
          </Text>
          <Text preset="paragraphMedium" color="surface" mt="s8">
            Encontre a melhor rota para você
          </Text>
        </Box>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{padding: 24}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Search Form */}
          <Box
            backgroundColor="surface"
            borderRadius="s20"
            padding="s24"
            mb="s24"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Text preset="paragraphMedium" color="text" bold mb="s20">
              Para onde você vai?
            </Text>

            {/* Origin */}
            <Box mb="s16">
              <TextInput
                label="Origem"
                placeholder="De onde você parte?"
                value={origin}
                onChangeText={setOrigin}
                leftIcon="my-location"
              />
            </Box>

            {/* Swap Button */}
            <Box alignItems="center" mb="s16">
              <TouchableOpacityBox
                width={40}
                height={40}
                borderRadius="s20"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                onPress={() => {
                  const temp = origin;
                  setOrigin(destination);
                  setDestination(temp);
                }}>
                <Icon name="swap-vert" size={24} color="primary" />
              </TouchableOpacityBox>
            </Box>

            {/* Destination */}
            <Box mb="s16">
              <TextInput
                label="Destino"
                placeholder="Para onde você vai?"
                value={destination}
                onChangeText={setDestination}
                leftIcon="place"
              />
            </Box>

            {/* Date */}
            <Box mb="s24">
              <TextInput
                label="Data (opcional)"
                placeholder="Quando você quer viajar?"
                value={date}
                onChangeText={setDate}
                leftIcon="event"
              />
            </Box>

            {/* Search Button */}
            <Button
              title="Buscar Viagens"
              onPress={handleSearch}
              rightIcon="search"
            />
          </Box>

          {/* Popular Routes */}
          <Box>
            <Text preset="paragraphMedium" color="text" bold mb="s16">
              Rotas Populares
            </Text>

            {POPULAR_ROUTES.map((route, index) => (
              <TouchableOpacityBox
                key={index}
                flexDirection="row"
                alignItems="center"
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                mb="s12"
                onPress={() => handlePopularRoute(route)}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Box
                  width={48}
                  height={48}
                  borderRadius="s24"
                  backgroundColor="primaryBg"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s16">
                  <Icon name={route.icon as any} size={24} color="primary" />
                </Box>

                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold mb="s4">
                    {route.origin} → {route.destination}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    Toque para selecionar esta rota
                  </Text>
                </Box>

                <Icon name="chevron-right" size={24} color="border" />
              </TouchableOpacityBox>
            ))}
          </Box>

          {/* Recent Searches */}
          <Box mt="s24">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s16">
              <Text preset="paragraphMedium" color="text" bold>
                Buscas Recentes
              </Text>
              <Text preset="paragraphSmall" color="primary" bold>
                Limpar
              </Text>
            </Box>

            <Box
              backgroundColor="surface"
              borderRadius="s12"
              padding="s20"
              alignItems="center">
              <Icon name="history" size={48} color="border" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s12">
                Nenhuma busca recente
              </Text>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </TouchableWithoutFeedback>
  );
}
