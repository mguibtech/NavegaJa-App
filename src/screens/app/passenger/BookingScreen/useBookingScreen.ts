import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@infra/storage';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useQuery} from '@tanstack/react-query';

import {
  ChildPassenger,
  ExtraPassenger,
  FLOOD_SEVERITY_ORDER,
  FloodSeverity,
  PaymentMethod,
  PriceBreakdown as PriceBreakdownType,
  floodHubAPI,
  useCalculatePrice,
  useCouponValidation,
  useCreateBooking,
  useKmStats,
  useTripDetails,
} from '@domain';
import {isOfflineQueuedError} from '@infra';
import {AppStackParamList} from '@routes';
import {logBookingStarted} from '@services';
import {
  BOOKING_PAYMENT_METHODS,
  PAYMENT_PREF_KEY,
  buildPriceFallback,
  formatCPFInput,
  getCpfValidationError,
  getDuplicateCpfError,
  getErrorMessage,
  getFilledExtraAdults,
  getFreeChildrenCount,
  syncExtraAdults,
} from './bookingFormUtils';

export type PassengerModalState =
  | {visible: false}
  | {visible: true; type: 'adult'; index: number; name: string; cpf: string}
  | {visible: true; type: 'child'; index: number; age: number};

const FLOOD_ALERT_LABELS: Record<string, string> = {
  ABOVE_NORMAL: 'Atencao',
  SEVERE: 'Alerta de Cheia',
  EXTREME: 'Emergencia',
};

const DEFAULT_CPF_ERROR_MESSAGE = 'Por favor, informe um CPF valido';
const DEFAULT_BOOKING_ERROR_MESSAGE =
  'Nao foi possivel processar sua reserva. Tente novamente.';

export function useBookingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Booking'>>();
  const {tripId} = route.params;

  const {create: createBooking, isLoading: isCreatingBooking} =
    useCreateBooking();
  const {trip, isLoading: isLoadingTrip, error: tripError} = useTripDetails(tripId);
  const {calculate, isLoading: isCalculatingPrice} = useCalculatePrice();
  const couponValidation = useCouponValidation();
  const {kmStats} = useKmStats();

  const {data: floodData} = useQuery({
    queryKey: ['flood-booking', tripId],
    queryFn: () => floodHubAPI.getFloodStatus(-3.119, -60.0217, 200),
    staleTime: 15 * 60 * 1000,
    enabled: Boolean(trip),
  });

  const floodSeverity: FloodSeverity | null =
    (floodData?.statuses ?? []).sort(
      (a, b) => FLOOD_SEVERITY_ORDER[a.severity] - FLOOD_SEVERITY_ORDER[b.severity],
    )[0]?.severity ?? null;

  const hasFloodRisk =
    floodSeverity === 'SEVERE' || floodSeverity === 'EXTREME';

  const [passengerName, setPassengerName] = useState('');
  const [passengerCPF, setPassengerCPF] = useState('');
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState(1);
  const [extraAdults, setExtraAdults] = useState<ExtraPassenger[]>([]);

  const [hasChildren, setHasChildren] = useState(false);
  const [children, setChildren] = useState<ChildPassenger[]>([]);
  const [passengerModal, setPassengerModal] = useState<PassengerModalState>({
    visible: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CREDIT_CARD,
  );
  const [redeemKm, setRedeemKm] = useState(false);
  const [priceBreakdown, setPriceBreakdown] =
    useState<PriceBreakdownType | null>(null);

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showCpfErrorModal, setShowCpfErrorModal] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');

  const totalPassengers = passengers + children.length;

  useEffect(() => {
    AsyncStorage.getItem(PAYMENT_PREF_KEY)
      .then(saved => {
        if (saved && Object.values(PaymentMethod).includes(saved as PaymentMethod)) {
          setPaymentMethod(saved as PaymentMethod);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tripError) {
      setShowLoadErrorModal(true);
    }
  }, [tripError]);

  useEffect(() => {
    setExtraAdults(previousAdults => syncExtraAdults(passengers, previousAdults));
  }, [passengers]);

  useEffect(() => {
    if (trip) {
      calculatePrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, passengers, children, couponValidation.state, redeemKm]);

  const handleSetPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    AsyncStorage.setItem(PAYMENT_PREF_KEY, method).catch(() => {});
  };

  async function calculatePrice() {
    if (!trip) return;

    try {
      const couponCode =
        couponValidation.state.status === 'VALID'
          ? couponValidation.state.data.code
          : undefined;

      const breakdown = await calculate({
        tripId: trip.id,
        quantity: totalPassengers,
        couponCode,
        ...(redeemKm ? {redeemKm: true} : {}),
        ...(hasChildren && children.length > 0 ? {children} : {}),
      });

      setPriceBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to calculate price:', error);
      setPriceBreakdown(buildPriceFallback(Number(trip.price), totalPassengers));
    }
  }

  async function handleApplyCoupon(code: string) {
    if (!trip) return;

    await couponValidation.validate({
      code,
      tripId: trip.id,
      quantity: passengers,
    });
  }

  function handleRemoveCoupon() {
    couponValidation.remove();
  }

  const handleIncrement = () => {
    if (trip && passengers < trip.availableSeats - children.length) {
      setPassengers(currentPassengers => currentPassengers + 1);
    }
  };

  const handleDecrement = () => {
    if (passengers > 1) {
      setPassengers(currentPassengers => currentPassengers - 1);
    }
  };

  const handleToggleChildren = () => {
    setHasChildren(previousValue => {
      if (previousValue) {
        setChildren([]);
      }

      return !previousValue;
    });
  };

  const handleAddChild = () => {
    if (!trip) return;

    if (children.length < trip.availableSeats - passengers) {
      setChildren(previousChildren => [...previousChildren, {age: 0}]);
    }
  };

  const handleRemoveChild = (index: number) => {
    setChildren(previousChildren =>
      previousChildren.filter((_, childIndex) => childIndex !== index),
    );
  };

  function openAdultModal(index: number) {
    const adult = extraAdults[index] ?? {name: '', cpf: ''};

    setPassengerModal({
      visible: true,
      type: 'adult',
      index,
      name: adult.name,
      cpf: adult.cpf,
    });
  }

  function openChildModal(index: number) {
    const child = children[index] ?? {age: 0};

    setPassengerModal({
      visible: true,
      type: 'child',
      index,
      age: child.age,
    });
  }

  function handleClosePassengerModal() {
    setPassengerModal({visible: false});
  }

  function handleConfirmPassengerModal(data: {
    name?: string;
    cpf?: string;
    age?: number;
  }) {
    if (!passengerModal.visible) return;

    if (passengerModal.type === 'adult') {
      setExtraAdults(previousAdults => {
        const updatedAdults = [...previousAdults];
        updatedAdults[passengerModal.index] = {
          name: data.name ?? '',
          cpf: data.cpf ?? '',
        };
        return updatedAdults;
      });
    } else {
      setChildren(previousChildren => {
        const updatedChildren = [...previousChildren];
        updatedChildren[passengerModal.index] = {
          age: data.age ?? 0,
        };
        return updatedChildren;
      });
    }

    setPassengerModal({visible: false});
  }

  const handleCPFChange = (value: string) => {
    const formattedCpf = formatCPFInput(value);
    setPassengerCPF(formattedCpf);

    if (cpfError) {
      setCpfError(null);
    }

    const validationError = getCpfValidationError(formattedCpf);
    if (!validationError || validationError === 'CPF incompleto') {
      return;
    }

    setCpfError(validationError);
  };

  const validateCPF = (): boolean => {
    const validationError = getCpfValidationError(passengerCPF);

    if (validationError) {
      setCpfError(validationError);
      return false;
    }

    setCpfError(null);
    return true;
  };

  const handleNameChange = (text: string) => {
    setPassengerName(text);

    if (nameError) {
      setNameError(null);
    }
  };

  const handleConfirmBooking = async () => {
    if (!trip) return;

    if (!passengerName.trim()) {
      setNameError('Por favor, informe o nome do passageiro');
      return;
    }

    if (hasChildren && getFreeChildrenCount(children) > 3) {
      setBookingErrorMessage(
        'Maximo de 3 criancas gratis por reserva. Para grupos maiores, contate o capitao.',
      );
      setShowBookingErrorModal(true);
      return;
    }

    if (!validateCPF()) {
      setCpfErrorMessage(cpfError ?? DEFAULT_CPF_ERROR_MESSAGE);
      setShowCpfErrorModal(true);
      return;
    }

    try {
      const couponCode =
        couponValidation.state.status === 'VALID'
          ? couponValidation.state.data.code
          : undefined;

      const filledExtraAdults = getFilledExtraAdults(extraAdults);
      const duplicateCpfError = getDuplicateCpfError(
        passengerCPF,
        filledExtraAdults,
      );

      if (duplicateCpfError) {
        setBookingErrorMessage(duplicateCpfError);
        setShowBookingErrorModal(true);
        return;
      }

      const booking = await createBooking({
        tripId: trip.id,
        quantity: totalPassengers,
        paymentMethod,
        couponCode,
        ...(redeemKm ? {redeemKm: true} : {}),
        ...(hasChildren && children.length > 0 ? {children} : {}),
        ...(filledExtraAdults.length > 0 ? {passengers: filledExtraAdults} : {}),
      });

      if (booking.floodWarning) {
        const label =
          FLOOD_ALERT_LABELS[booking.floodSeverity ?? 'ABOVE_NORMAL'] ?? 'Atencao';

        await new Promise<void>(resolve => {
          Alert.alert(
            `Risco de Cheia - ${label}`,
            'Ha risco de cheia na rota desta viagem. Sua reserva foi confirmada. Verifique as condicoes com o capitao antes de embarcar.',
            [{text: 'Entendi', onPress: () => resolve()}],
          );
        });
      }

      logBookingStarted(trip.id, priceBreakdown?.finalPrice || 0);
      navigation.replace('Payment', {
        bookingId: booking.id,
        amount: priceBreakdown?.finalPrice || 0,
        paymentMethod,
      });
    } catch (error) {
      if (isOfflineQueuedError(error)) {
        Alert.alert('Reserva salva offline', error.message, [
          {text: 'OK', onPress: () => navigation.navigate('HomeTabs')},
        ]);
        return;
      }

      setBookingErrorMessage(
        getErrorMessage(error, DEFAULT_BOOKING_ERROR_MESSAGE),
      );
      setShowBookingErrorModal(true);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleGoBack = () => navigation.goBack();

  const handleCloseLoadErrorModal = () => {
    setShowLoadErrorModal(false);
    navigation.goBack();
  };

  return {
    trip,
    isLoadingTrip,
    passengers,
    totalPassengers,
    extraAdults,
    hasChildren,
    children,
    passengerModal,
    passengerName,
    nameError,
    handleNameChange,
    passengerCPF,
    cpfError,
    paymentMethod,
    setPaymentMethod: handleSetPaymentMethod,
    priceBreakdown,
    isCreatingBooking,
    isCalculatingPrice,
    couponValidation,
    kmStats,
    redeemKm,
    setRedeemKm,
    showLoadErrorModal,
    showCpfErrorModal,
    cpfErrorMessage,
    showBookingErrorModal,
    bookingErrorMessage,
    paymentMethods: BOOKING_PAYMENT_METHODS,
    handleIncrement,
    handleDecrement,
    handleToggleChildren,
    handleAddChild,
    handleRemoveChild,
    openAdultModal,
    openChildModal,
    handleClosePassengerModal,
    handleConfirmPassengerModal,
    handleCPFChange,
    handleConfirmBooking,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleGoBack,
    handleCloseLoadErrorModal,
    setShowCpfErrorModal,
    setShowBookingErrorModal,
    formatTime,
    formatDate,
    hasFloodRisk,
    floodSeverity,
  };
}
