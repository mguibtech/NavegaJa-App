import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {useMyBoats, useCreateTrip, Boat} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainCreateTrip'>;
type PickerTarget = 'departure' | 'arrival';
type CityPickerTarget = 'origin' | 'destination';

const AM_CITIES = [
  'Manaus', 'Parintins', 'Itacoatiara', 'Tefé', 'Barreirinha', 'Coari',
  'Maués', 'Tabatinga', 'Lábrea', 'Humaitá', 'Benjamin Constant',
  'São Gabriel da Cachoeira', 'Borba', 'Autazes', 'Nova Olinda do Norte',
  'Presidente Figueiredo', 'Iranduba', 'Manacapuru', 'Careiro', 'Anori',
];

// Máscara monetária: armazena apenas dígitos (centavos), exibe formatado
function digitsToFloat(digits: string): number {
  return parseInt(digits || '0', 10) / 100;
}

function formatMoney(digits: string): string {
  if (!digits) {return '';}
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
  const user = useAuthStore(s => s.user);

  const {boats, fetchBoats} = useMyBoats();
  const {createTrip, isLoading} = useCreateTrip();

  // Todos os hooks ANTES de qualquer return condicional (Rules of Hooks)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [price, setPrice] = useState('');
  const [cargoPriceKg, setCargoPriceKg] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);
  const [showBoatPicker, setShowBoatPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cityPickerTarget, setCityPickerTarget] = useState<CityPickerTarget>('origin');

  // Date/time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('departure');
  const [tempDate, setTempDate] = useState(new Date());

  const canCreateTrips = !user?.capabilities || user.capabilities.canCreateTrips;

  useEffect(() => {
    fetchBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: bloqueia se capabilities existem e canCreateTrips=false
  if (!canCreateTrips) {
    const isPending = user?.capabilities?.pendingVerification ?? false;
    return (
      <Box flex={1} backgroundColor="background">
        <Box
          paddingHorizontal="s20"
          paddingBottom="s16"
          backgroundColor="surface"
          style={{paddingTop: top + 12, elevation: 3}}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40} height={40} borderRadius="s20"
              alignItems="center" justifyContent="center"
              onPress={() => navigation.goBack()} mr="s12">
              <Icon name="arrow-back" size={24} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold>Nova Viagem</Text>
          </Box>
        </Box>
        <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s32">
          <Box
            width={80} height={80} borderRadius="s48"
            backgroundColor={isPending ? 'infoBg' : 'warningBg'}
            alignItems="center" justifyContent="center" mb="s24">
            <Icon name={isPending ? 'hourglass-top' : 'lock'} size={40} color={isPending ? 'info' : 'warning'} />
          </Box>
          <Text preset="headingSmall" color="text" bold mb="s12" style={{textAlign: 'center'}}>
            {isPending ? 'Conta em análise' : 'Conta pendente de verificação'}
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" style={{textAlign: 'center'}}>
            {isPending
              ? 'Seus documentos estão sendo analisados. Em breve você poderá criar viagens.'
              : 'Envie sua habilitação náutica para começar a criar viagens.'}
          </Text>
          {!isPending && (
            <Button
              title="Enviar documentos"
              onPress={() => navigation.navigate('EditProfile')}
              style={{marginTop: 32}}
            />
          )}
        </Box>
      </Box>
    );
  }

  const selectedBoat = boats.find(b => b.id === selectedBoatId);

  function formatDateTime(date: Date | null): string {
    if (!date) {return '';}
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
    if (!selected) {return;}
    setTempDate(selected);
    setShowTimePicker(true);
  }

  function onTimeChange(_: any, selected?: Date) {
    setShowTimePicker(false);
    if (!selected) {return;}
    const final = new Date(tempDate);
    final.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    if (pickerTarget === 'departure') {
      setDepartureDate(final);
    } else {
      setArrivalDate(final);
    }
  }

  function openCityPicker(target: CityPickerTarget) {
    setCityPickerTarget(target);
    setShowCityPicker(true);
  }

  function selectCity(city: string) {
    if (cityPickerTarget === 'origin') {
      setOrigin(city);
      if (destination === city) {setDestination('');}
    } else {
      setDestination(city);
      if (origin === city) {setOrigin('');}
    }
    setShowCityPicker(false);
  }

  function validate(): string | null {
    if (!origin.trim()) {return 'Informe a origem';}
    if (!destination.trim()) {return 'Informe o destino';}
    if (origin === destination) {return 'Origem e destino não podem ser iguais';}
    if (!departureDate) {return 'Selecione a data/hora de partida';}
    if (!arrivalDate) {return 'Selecione a data/hora de chegada prevista';}
    if (arrivalDate <= departureDate) {return 'A chegada deve ser após a partida';}
    if (!price || digitsToFloat(price) <= 0) {return 'Informe um preço válido';}
    const seats = Number(totalSeats.trim());
    if (!totalSeats.trim() || isNaN(seats) || seats < 1) {
      return 'Informe o número de assentos';
    }
    if (!selectedBoatId) {return 'Selecione uma embarcação';}
    const boat = boats.find(b => b.id === selectedBoatId);
    if (boat && !boat.isVerified) {return 'Esta embarcação ainda não foi verificada';}
    if (boat && seats > boat.capacity) {
      return `Assentos não pode exceder a capacidade da embarcação (${boat.capacity} lugares)`;
    }
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

  const currentCityValue = cityPickerTarget === 'origin' ? origin : destination;

  return (
    <>
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

            {/* Origem */}
            <TouchableOpacityBox
              onPress={() => openCityPicker('origin')}
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor={origin ? 'secondary' : 'border'}
              paddingHorizontal="s16"
              paddingVertical="s16"
              flexDirection="row"
              alignItems="center"
              mb="s12"
              style={{elevation: 1}}>
              <Icon name="place" size={20} color={origin ? 'secondary' : 'textSecondary'} />
              <Text
                preset="paragraphMedium"
                color={origin ? 'text' : 'textSecondary'}
                ml="s12"
                flex={1}>
                {origin || 'Selecionar origem'}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color="textSecondary" />
            </TouchableOpacityBox>

            {/* Destino */}
            <TouchableOpacityBox
              onPress={() => openCityPicker('destination')}
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor={destination ? 'secondary' : 'border'}
              paddingHorizontal="s16"
              paddingVertical="s16"
              flexDirection="row"
              alignItems="center"
              mb="s24"
              style={{elevation: 1}}>
              <Icon name="flag" size={20} color={destination ? 'secondary' : 'textSecondary'} />
              <Text
                preset="paragraphMedium"
                color={destination ? 'text' : 'textSecondary'}
                ml="s12"
                flex={1}>
                {destination || 'Selecionar destino'}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color="textSecondary" />
            </TouchableOpacityBox>

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
                    {boats.map((boat: Boat, idx: number) => {
                      const isUnverified = !boat.isVerified;
                      const isSelected = selectedBoatId === boat.id;
                      return (
                        <TouchableOpacityBox
                          key={boat.id}
                          padding="s16"
                          flexDirection="row"
                          alignItems="center"
                          backgroundColor={isSelected ? 'secondaryBg' : 'surface'}
                          borderTopWidth={idx > 0 ? 1 : 0}
                          borderTopColor="border"
                          style={{opacity: isUnverified ? 0.5 : 1}}
                          onPress={() => {
                            if (isUnverified) {return;}
                            setSelectedBoatId(boat.id);
                            setShowBoatPicker(false);
                          }}>
                          <Icon
                            name={isSelected ? 'check-circle' : 'sailing'}
                            size={20}
                            color={isSelected ? 'secondary' : 'textSecondary'}
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
                          {isUnverified && (
                            <Box
                              paddingHorizontal="s8"
                              paddingVertical="s4"
                              borderRadius="s8"
                              style={{backgroundColor: '#FEF3C7'}}>
                              <Text
                                preset="paragraphCaptionSmall"
                                bold
                                style={{color: '#92400E'}}>
                                Em análise
                              </Text>
                            </Box>
                          )}
                        </TouchableOpacityBox>
                      );
                    })}
                  </Box>
                )}

                {/* Aviso quando nenhuma embarcação está verificada */}
                {boats.every(b => !b.isVerified) && (
                  <Box
                    backgroundColor="warningBg"
                    padding="s12"
                    borderRadius="s8"
                    mt="s8"
                    flexDirection="row"
                    alignItems="center">
                    <Icon name="hourglass-top" size={16} color="warning" />
                    <Text preset="paragraphSmall" color="warning" ml="s8" flex={1}>
                      Suas embarcações estão em análise. Aguarde a verificação para criar viagens.
                    </Text>
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

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacityBox
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}
          onPress={() => setShowCityPicker(false)}
        />
        <Box
          backgroundColor="surface"
          borderTopLeftRadius="s20"
          borderTopRightRadius="s20"
          paddingTop="s16"
          style={{maxHeight: '60%'}}>
          <Box
            flexDirection="row"
            alignItems="center"
            paddingHorizontal="s20"
            paddingBottom="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Text preset="paragraphMedium" color="text" bold flex={1}>
              {cityPickerTarget === 'origin' ? 'Selecionar origem' : 'Selecionar destino'}
            </Text>
            <TouchableOpacityBox
              onPress={() => setShowCityPicker(false)}
              padding="s4">
              <Icon name="close" size={24} color="textSecondary" />
            </TouchableOpacityBox>
          </Box>
          <FlatList
            data={AM_CITIES}
            keyExtractor={item => item}
            renderItem={({item}) => {
              const isSelected = item === currentCityValue;
              const isDisabled =
                cityPickerTarget === 'destination'
                  ? item === origin
                  : item === destination;
              return (
                <TouchableOpacityBox
                  onPress={() => !isDisabled && selectCity(item)}
                  paddingHorizontal="s20"
                  paddingVertical="s16"
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor={isSelected ? 'secondaryBg' : 'surface'}
                  borderBottomWidth={1}
                  borderBottomColor="border"
                  style={{opacity: isDisabled ? 0.35 : 1}}>
                  <Text
                    preset="paragraphMedium"
                    color={isSelected ? 'secondary' : 'text'}
                    bold={isSelected}
                    flex={1}>
                    {item}
                  </Text>
                  {isSelected && (
                    <Icon name="check" size={20} color="secondary" />
                  )}
                  {isDisabled && (
                    <Text preset="paragraphCaptionSmall" color="textSecondary">
                      já selecionada
                    </Text>
                  )}
                </TouchableOpacityBox>
              );
            }}
          />
        </Box>
      </Modal>
    </>
  );
}
