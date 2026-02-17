import React, {useState} from 'react';
import {Keyboard, ScrollView, TouchableWithoutFeedback, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';

import {AppStackParamList, TabsParamList} from '@routes';

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

export function SearchScreen({navigation, route}: Props) {
  const {top} = useSafeAreaInsets();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pegar contexto (se veio de Shipments, context='shipment')
  const context = route.params?.context;

  function handleSearch() {
    if (!origin.trim() || !destination.trim()) {
      // TODO: Show toast warning
      return;
    }

    // Formata a data para API (yyyy-MM-dd) se selecionada
    const dateForApi = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;

    navigation.navigate('SearchResults', {
      origin: origin.trim(),
      destination: destination.trim(),
      date: dateForApi,
      context, // Repassa o contexto
    });
  }

  function handlePopularRoute(route: typeof POPULAR_ROUTES[0]) {
    setOrigin(route.origin);
    setDestination(route.destination);
  }

  function handleDateChange(event: any, selected?: Date) {
    // Android: fecha o picker automaticamente
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selected) {
      setSelectedDate(selected);
      // Formata a data para exibição (ex: "15 de Fevereiro")
      const formatted = selected.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
      });
      setDate(formatted);
    }
  }

  function handleOpenDatePicker() {
    setShowDatePicker(true);
  }

  function formatDateForDisplay() {
    if (selectedDate) {
      return selectedDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
      });
    }
    return '';
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          paddingHorizontal="s24"
          paddingBottom="s12"
          backgroundColor="surface"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Text preset="headingSmall" color="text" bold textAlign="center">
            Buscar Viagem
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
              <Text preset="paragraphSmall" color="text" bold mb="s8">
                Data (opcional)
              </Text>
              <TouchableOpacityBox
                backgroundColor="background"
                borderRadius="s12"
                padding="s16"
                borderWidth={1}
                borderColor="border"
                flexDirection="row"
                alignItems="center"
                onPress={handleOpenDatePicker}>
                <Icon name="event" size={20} color="textSecondary" />
                <Text
                  preset="paragraphMedium"
                  color={date ? 'text' : 'textSecondary'}
                  ml="s12">
                  {date || 'Quando você quer viajar?'}
                </Text>
              </TouchableOpacityBox>
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

        {/* Date Picker */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Box
            backgroundColor="surface"
            paddingBottom="s24"
            borderTopLeftRadius="s20"
            borderTopRightRadius="s20"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="s24"
              paddingTop="s16"
              paddingBottom="s12">
              <TouchableOpacityBox onPress={() => setShowDatePicker(false)}>
                <Text preset="paragraphMedium" color="textSecondary">
                  Cancelar
                </Text>
              </TouchableOpacityBox>
              <Text preset="paragraphMedium" color="text" bold>
                Selecione a Data
              </Text>
              <TouchableOpacityBox onPress={() => setShowDatePicker(false)}>
                <Text preset="paragraphMedium" color="primary" bold>
                  Concluído
                </Text>
              </TouchableOpacityBox>
            </Box>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={new Date()}
              locale="pt-BR"
              style={{backgroundColor: 'transparent'}}
            />
          </Box>
        )}

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </Box>
    </TouchableWithoutFeedback>
  );
}
