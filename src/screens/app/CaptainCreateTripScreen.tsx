import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {useMyBoats, useCreateTrip, Boat} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainCreateTrip'>;

type PickerTarget = 'departure' | 'arrival';

// Máscara monetária: armazena apenas dígitos (centavos), exibe formatado
function digitsToFloat(digits: string): number {
  return parseInt(digits || '0', 10) / 100;
}

function formatMoney(digits: string): string {
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function onMoneyChange(text: string, setter: (v: string) => void) {
  const digits = text.replace(/\D/g, '');
  setter(digits);
}

export function CaptainCreateTripScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const {boats, fetchBoats} = useMyBoats();
  const {createTrip, isLoading} = useCreateTrip();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [price, setPrice] = useState('');
  const [cargoPriceKg, setCargoPriceKg] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);
  const [showBoatPicker, setShowBoatPicker] = useState(false);

  // Date/time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('departure');
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBoat = boats.find(b => b.id === selectedBoatId);

  function formatDateTime(date: Date | null): string {
    if (!date) return '';
    return format(date, "dd/MM/yyyy 'às' HH:mm", {locale: ptBR});
  }

  function openDatePicker(target: PickerTarget) {
    const current =
      target === 'departure'
        ? departureDate ?? new Date()
        : arrivalDate ?? new Date();
    setPickerTarget(target);
    setTempDate(current);
    setShowDatePicker(true);
  }

  function onDateChange(_: any, selected?: Date) {
    setShowDatePicker(false);
    if (!selected) return;
    setTempDate(selected);
    setShowTimePicker(true);
  }

  function onTimeChange(_: any, selected?: Date) {
    setShowTimePicker(false);
    if (!selected) return;
    const final = new Date(tempDate);
    final.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    if (pickerTarget === 'departure') {
      setDepartureDate(final);
    } else {
      setArrivalDate(final);
    }
  }

  function validate(): string | null {
    if (!origin.trim()) return 'Informe a origem';
    if (!destination.trim()) return 'Informe o destino';
    if (!departureDate) return 'Selecione a data/hora de partida';
    if (!arrivalDate) return 'Selecione a data/hora de chegada prevista';
    if (arrivalDate <= departureDate) return 'A chegada deve ser após a partida';
    if (!price || digitsToFloat(price) <= 0) return 'Informe um preço válido';
    const seats = Number(totalSeats.trim());
    if (!totalSeats.trim() || isNaN(seats) || seats < 1)
      return 'Informe o número de assentos';
    if (!selectedBoatId) return 'Selecione uma embarcação';
    const boat = boats.find(b => b.id === selectedBoatId);
    if (boat && seats > boat.capacity)
      return `Assentos não pode exceder a capacidade da embarcação (${boat.capacity} lugares)`;
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      await createTrip({
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime: departureDate!.toISOString(),
        arrivalTime: arrivalDate!.toISOString(),
        price: digitsToFloat(price),
        cargoPriceKg: cargoPriceKg ? digitsToFloat(cargoPriceKg) : undefined,
        totalSeats: Number(totalSeats),
        boatId: selectedBoatId!,
      });
      toast.showSuccess('Viagem criada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao criar viagem');
    }
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
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              mr="s8"
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box flex={1}>
              <Text preset="headingSmall" color="text" bold>
                Nova Viagem
              </Text>
            </Box>
          </Box>
        </Box>

        <ScrollView
          contentContainerStyle={{padding: 20, paddingBottom: 120}}
          keyboardShouldPersistTaps="handled">
          {/* Rota */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Rota
          </Text>
          <Box mb="s12">
            <TextInput
              placeholder="Origem (ex: Manaus)"
              value={origin}
              onChangeText={setOrigin}
              leftIcon="place"
            />
          </Box>
          <Box mb="s24">
            <TextInput
              placeholder="Destino (ex: Parintins)"
              value={destination}
              onChangeText={setDestination}
              leftIcon="flag"
            />
          </Box>

          {/* Data e Hora */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Data e Horário
          </Text>

          <TouchableOpacityBox
            backgroundColor="surface"
            borderRadius="s12"
            borderWidth={1}
            borderColor={departureDate ? 'secondary' : 'border'}
            padding="s16"
            flexDirection="row"
            alignItems="center"
            mb="s12"
            onPress={() => openDatePicker('departure')}>
            <Icon name="flight-takeoff" size={20} color="textSecondary" />
            <Text
              preset="paragraphMedium"
              color={departureDate ? 'text' : 'textSecondary'}
              ml="s12"
              flex={1}>
              {departureDate
                ? formatDateTime(departureDate)
                : 'Selecionar data/hora de partida'}
            </Text>
            <Icon name="event" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          <TouchableOpacityBox
            backgroundColor="surface"
            borderRadius="s12"
            borderWidth={1}
            borderColor={arrivalDate ? 'secondary' : 'border'}
            padding="s16"
            flexDirection="row"
            alignItems="center"
            mb="s24"
            onPress={() => openDatePicker('arrival')}>
            <Icon name="flight-land" size={20} color="textSecondary" />
            <Text
              preset="paragraphMedium"
              color={arrivalDate ? 'text' : 'textSecondary'}
              ml="s12"
              flex={1}>
              {arrivalDate
                ? formatDateTime(arrivalDate)
                : 'Selecionar chegada prevista'}
            </Text>
            <Icon name="event" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          {/* Preço e Assentos */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Preço e Capacidade
          </Text>
          <Box mb="s12">
            <TextInput
              placeholder="Preço por passageiro (ex: 85,00)"
              value={formatMoney(price)}
              onChangeText={t => onMoneyChange(t, setPrice)}
              keyboardType="numeric"
              leftIcon="attach-money"
            />
          </Box>
          <Box mb="s12">
            <TextInput
              placeholder="Número de assentos"
              value={totalSeats}
              onChangeText={v => setTotalSeats(v.replace(/\D/g, ''))}
              keyboardType="numeric"
              leftIcon="event-seat"
            />
          </Box>
          <Box mb="s24">
            <TextInput
              placeholder="Frete por kg (ex: 2,50) — opcional"
              value={formatMoney(cargoPriceKg)}
              onChangeText={t => onMoneyChange(t, setCargoPriceKg)}
              keyboardType="numeric"
              leftIcon="inventory"
            />
          </Box>

          {/* Embarcação */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Embarcação
          </Text>

          {boats.length === 0 ? (
            <Box
              backgroundColor="warningBg"
              padding="s16"
              borderRadius="s12"
              mb="s24"
              flexDirection="row"
              alignItems="center">
              <Icon name="warning" size={20} color="warning" />
              <Box flex={1} ml="s12">
                <Text preset="paragraphSmall" color="warning">
                  Nenhuma embarcação cadastrada.
                </Text>
                <TouchableOpacityBox
                  mt="s8"
                  onPress={() => navigation.navigate('CaptainCreateBoat')}>
                  <Text preset="paragraphSmall" color="secondary" bold>
                    Cadastrar embarcação →
                  </Text>
                </TouchableOpacityBox>
              </Box>
            </Box>
          ) : (
            <Box mb="s24">
              <TouchableOpacityBox
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                borderWidth={1}
                borderColor={selectedBoatId ? 'secondary' : 'border'}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                onPress={() => setShowBoatPicker(!showBoatPicker)}>
                <Box flexDirection="row" alignItems="center" flex={1}>
                  <Icon name="sailing" size={20} color="secondary" />
                  <Text
                    preset="paragraphMedium"
                    color={selectedBoatId ? 'text' : 'textSecondary'}
                    ml="s12">
                    {selectedBoat
                      ? selectedBoat.name
                      : 'Selecione uma embarcação'}
                  </Text>
                </Box>
                <Icon
                  name={showBoatPicker ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="textSecondary"
                />
              </TouchableOpacityBox>

              {showBoatPicker && (
                <Box
                  backgroundColor="surface"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor="border"
                  mt="s8"
                  overflow="hidden">
                  {boats.map((boat: Boat, idx: number) => (
                    <TouchableOpacityBox
                      key={boat.id}
                      padding="s16"
                      flexDirection="row"
                      alignItems="center"
                      backgroundColor={
                        selectedBoatId === boat.id ? 'secondaryBg' : 'surface'
                      }
                      borderTopWidth={idx > 0 ? 1 : 0}
                      borderTopColor="border"
                      onPress={() => {
                        setSelectedBoatId(boat.id);
                        setShowBoatPicker(false);
                      }}>
                      <Icon
                        name={
                          selectedBoatId === boat.id
                            ? 'check-circle'
                            : 'sailing'
                        }
                        size={20}
                        color={
                          selectedBoatId === boat.id
                            ? 'secondary'
                            : 'textSecondary'
                        }
                      />
                      <Box flex={1} ml="s12">
                        <Text preset="paragraphMedium" color="text" bold>
                          {boat.name}
                        </Text>
                        <Text preset="paragraphSmall" color="textSecondary">
                          {boat.type} · {boat.capacity} lugares ·{' '}
                          {boat.registrationNum}
                        </Text>
                      </Box>
                    </TouchableOpacityBox>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Button
            title={isLoading ? 'Criando...' : 'Criar Viagem'}
            onPress={handleSubmit}
            disabled={isLoading}
          />
          {isLoading && (
            <Box alignItems="center" mt="s16">
              <ActivityIndicator size="small" color="#0a6fbd" />
            </Box>
          )}
        </ScrollView>
      </Box>

      {/* Date Picker Dialog */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Time Picker Dialog (sequential after date) */}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          is24Hour
          onChange={onTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}
