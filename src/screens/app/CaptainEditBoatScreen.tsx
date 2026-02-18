import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {useUpdateBoat, getBoatByIdUseCase} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainEditBoat'>;

const BOAT_TYPES = [
  'Lancha',
  'Barco regional',
  'Barco de linha',
  'Canoa motorizada',
  'Ferry',
  'Outro',
];

export function CaptainEditBoatScreen({navigation, route}: Props) {
  const {boatId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();
  const {updateBoat, isLoading: isSaving} = useUpdateBoat();

  const [isLoadingBoat, setIsLoadingBoat] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    loadBoat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boatId]);

  async function loadBoat() {
    setIsLoadingBoat(true);
    try {
      const boat = await getBoatByIdUseCase(boatId);
      setName(boat.name);
      setType(boat.type);
      setCapacity(String(boat.capacity));
      setRegistrationNum(boat.registrationNum ?? '');
    } catch {
      toast.showError('Não foi possível carregar os dados da embarcação');
      navigation.goBack();
    } finally {
      setIsLoadingBoat(false);
    }
  }

  function validate(): string | null {
    if (!name.trim()) return 'Informe o nome da embarcação';
    if (!type.trim()) return 'Selecione o tipo de embarcação';
    if (!capacity.trim() || isNaN(Number(capacity)) || Number(capacity) < 1)
      return 'Informe a capacidade de passageiros';
    if (!registrationNum.trim()) return 'Informe o número de registro';
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      await updateBoat(boatId, {
        name: name.trim(),
        type: type.trim(),
        capacity: Number(capacity),
        registrationNum: registrationNum.trim().toUpperCase(),
      });
      toast.showSuccess('Embarcação atualizada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao atualizar embarcação');
    }
  }

  if (isLoadingBoat) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold>
              Editar Embarcação
            </Text>
          </Box>
        </Box>

        <ScrollView
          contentContainerStyle={{padding: 20, paddingBottom: 120}}
          keyboardShouldPersistTaps="handled">
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Informações básicas
          </Text>
          <Box mb="s12">
            <TextInput
              placeholder="Nome da embarcação"
              value={name}
              onChangeText={setName}
              leftIcon="sailing"
            />
          </Box>

          {/* Tipo */}
          <TouchableOpacityBox
            backgroundColor="surface"
            borderRadius="s12"
            borderWidth={1}
            borderColor={type ? 'secondary' : 'border'}
            padding="s16"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mb="s4"
            onPress={() => setShowTypePicker(!showTypePicker)}>
            <Box flexDirection="row" alignItems="center" flex={1}>
              <Icon name="category" size={20} color="textSecondary" />
              <Text
                preset="paragraphMedium"
                color={type ? 'text' : 'textSecondary'}
                ml="s12">
                {type || 'Tipo de embarcação'}
              </Text>
            </Box>
            <Icon
              name={showTypePicker ? 'expand-less' : 'expand-more'}
              size={24}
              color="textSecondary"
            />
          </TouchableOpacityBox>

          {showTypePicker && (
            <Box
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor="border"
              mb="s12"
              overflow="hidden">
              {BOAT_TYPES.map((t, idx) => (
                <TouchableOpacityBox
                  key={t}
                  padding="s14"
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor={type === t ? 'secondaryBg' : 'surface'}
                  borderTopWidth={idx > 0 ? 1 : 0}
                  borderTopColor="border"
                  onPress={() => {
                    setType(t);
                    setShowTypePicker(false);
                  }}>
                  <Icon
                    name={type === t ? 'check-circle' : 'radio-button-unchecked'}
                    size={20}
                    color={type === t ? 'secondary' : 'textSecondary'}
                  />
                  <Text preset="paragraphMedium" color="text" ml="s12">
                    {t}
                  </Text>
                </TouchableOpacityBox>
              ))}
            </Box>
          )}

          <Box mb="s12">
            <TextInput
              placeholder="Capacidade de passageiros"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              leftIcon="event-seat"
            />
          </Box>

          <Box mb="s12">
            <TextInput
              placeholder="Número de registro"
              value={registrationNum}
              onChangeText={setRegistrationNum}
              autoCapitalize="characters"
              leftIcon="tag"
            />
          </Box>

          <Button
            title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSubmit}
            disabled={isSaving}
          />
          {isSaving && (
            <Box alignItems="center" mt="s16">
              <ActivityIndicator size="small" color="#0a6fbd" />
            </Box>
          )}
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
