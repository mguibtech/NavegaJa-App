import {useState, useEffect, useMemo} from 'react';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useMyBoats, useBoatStaff, useCreateTrip, Boat, useCities} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

export type PickerTarget = 'departure' | 'arrival';
export type CityPickerTarget = 'origin' | 'destination';

export const AM_CITIES = [
  'Manaus', 'Parintins', 'Itacoatiara', 'Tefé', 'Barreirinha', 'Coari',
  'Maués', 'Tabatinga', 'Lábrea', 'Humaitá', 'Benjamin Constant',
  'São Gabriel da Cachoeira', 'Borba', 'Autazes', 'Nova Olinda do Norte',
  'Presidente Figueiredo', 'Iranduba', 'Manacapuru', 'Careiro', 'Anori',
];

export function digitsToFloat(digits: string): number {
  return parseInt(digits || '0', 10) / 100;
}

export function formatMoney(digits: string): string {
  if (!digits) {return '';}
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

export function onMoneyChange(text: string, setter: (v: string) => void) {
  const digits = text.replace(/\D/g, '');
  setter(digits);
}

export function useCaptainCreateTrip() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();
  const user = useAuthStore(s => s.user);

  const isBoatManager = user?.role === 'boat_manager';

  const {boats: ownedBoats, fetchBoats} = useMyBoats();
  const {staff} = useBoatStaff();
  const {cityNames} = useCities();
  const cityList = cityNames.length > 0 ? cityNames : AM_CITIES;
  const {createTrip, isLoading} = useCreateTrip();

  // boat_manager: barcos atribuídos activos; captain: barcos próprios
  const boats = useMemo<Boat[]>(() => {
    if (isBoatManager) {
      return staff.filter(s => s.isActive).map(s => s.boat as unknown as Boat);
    }
    return ownedBoats;
  }, [isBoatManager, staff, ownedBoats]);

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('departure');
  const [tempDate, setTempDate] = useState(new Date());

  const canCreateTrips = !user?.capabilities || user.capabilities.canCreateTrips;
  const isPending = user?.capabilities?.pendingVerification ?? false;

  useEffect(() => {
    if (!isBoatManager) {
      fetchBoats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-seleccionar se apenas um barco disponível
  useEffect(() => {
    if (boats.length === 1 && !selectedBoatId) {
      setSelectedBoatId(boats[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boats]);

  const selectedBoat = boats.find((b: Boat) => b.id === selectedBoatId);
  const currentCityValue = cityPickerTarget === 'origin' ? origin : destination;

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
    const boat = boats.find((b: Boat) => b.id === selectedBoatId);
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
      const isFloodBlock =
        err?.statusCode === 403 &&
        (err?.message?.toLowerCase().includes('cheia') ||
          err?.message?.toLowerCase().includes('flood'));

      if (isFloodBlock) {
        toast.showError(
          'Criação bloqueada: cheia extrema detectada no trecho. Aguarde normalização das condições fluviais.',
        );
      } else {
        toast.showError(err?.message || 'Erro ao criar viagem');
      }
    }
  }

  function goBack() {
    navigation.goBack();
  }

  function navigateToCreateBoat() {
    navigation.navigate('CaptainCreateBoat');
  }

  function navigateToEditProfile() {
    navigation.navigate('EditProfile');
  }

  return {
    // auth / guard
    canCreateTrips,
    isPending,
    // data
    boats,
    isLoading,
    selectedBoat,
    selectedBoatId,
    // route form
    origin,
    destination,
    currentCityValue,
    cityPickerTarget,
    showCityPicker,
    setShowCityPicker,
    // datetime form
    departureDate,
    arrivalDate,
    showDatePicker,
    showTimePicker,
    tempDate,
    // price/seats form
    price,
    setPrice,
    cargoPriceKg,
    setCargoPriceKg,
    totalSeats,
    setTotalSeats,
    // boat picker
    showBoatPicker,
    setShowBoatPicker,
    setSelectedBoatId,
    // handlers
    formatDateTime,
    openDatePicker,
    onDateChange,
    onTimeChange,
    openCityPicker,
    selectCity,
    handleSubmit,
    goBack,
    cityList,
    navigateToCreateBoat,
    navigateToEditProfile,
    onMoneyChange,
    formatMoney,
  };
}
