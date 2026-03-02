import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useQuery} from '@tanstack/react-query';

import {
  useTripDetails,
  PaymentMethod,
  useCreateBooking,
  useCalculatePrice,
  PriceBreakdown as PriceBreakdownType,
  useCouponValidation,
  useKmStats,
  floodHubAPI,
  FloodSeverity,
  FLOOD_SEVERITY_ORDER,
} from '@domain';
import {AppStackParamList} from '@routes';
import {logBookingStarted} from '@services';

const PAYMENT_PREF_KEY = '@navegaja:last-payment-method';

// CPF utilities — kept here since they are pure business logic
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  if (parseInt(cleanCPF.charAt(10)) !== digit2) return false;

  return true;
}

function formatCPFUtil(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length > 6) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  if (numbers.length > 9) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return formatted;
}

function isCPFComplete(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11;
}

export function useBookingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Booking'>>();
  const {tripId} = route.params;

  const {create: createBooking, isLoading: isCreatingBooking} =
    useCreateBooking();

  const {trip, isLoading: isLoadingTrip, error: tripError} = useTripDetails(tripId);

  // Flood status — Manaus region (covers all routes in Amazônia)
  const {data: floodData} = useQuery({
    queryKey: ['flood-booking', tripId],
    queryFn: () => floodHubAPI.getFloodStatus(-3.119, -60.0217, 200),
    staleTime: 15 * 60 * 1000,
    enabled: !!trip,
  });

  const floodSeverity: FloodSeverity | null =
    (floodData?.statuses ?? []).sort(
      (a, b) => FLOOD_SEVERITY_ORDER[a.severity] - FLOOD_SEVERITY_ORDER[b.severity],
    )[0]?.severity ?? null;

  const hasFloodRisk =
    floodSeverity === 'SEVERE' || floodSeverity === 'EXTREME';

  const [passengers, setPassengers] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerCPF, setPassengerCPF] = useState('');
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CREDIT_CARD,
  );

  // Restaura a última forma de pagamento usada
  useEffect(() => {
    AsyncStorage.getItem(PAYMENT_PREF_KEY).then(saved => {
      if (saved && Object.values(PaymentMethod).includes(saved as PaymentMethod)) {
        setPaymentMethod(saved as PaymentMethod);
      }
    }).catch(() => {});
  }, []);

  const handleSetPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    AsyncStorage.setItem(PAYMENT_PREF_KEY, method).catch(() => {});
  };
  const [redeemKm, setRedeemKm] = useState(false);
  const {kmStats} = useKmStats();

  const [priceBreakdown, setPriceBreakdown] =
    useState<PriceBreakdownType | null>(null);

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showCpfErrorModal, setShowCpfErrorModal] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const {calculate, isLoading: isCalculatingPrice} = useCalculatePrice();
  const couponValidation = useCouponValidation();

  // Error handling for trip load
  useEffect(() => {
    if (tripError) { setShowLoadErrorModal(true); }
  }, [tripError]);

  const totalPassengers = passengers + childrenAges.length;

  // Calculate price whenever trip, passengers, children, coupon or km toggle changes
  useEffect(() => {
    if (trip) {
      calculatePrice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, passengers, childrenAges, couponValidation.state, redeemKm]);

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
        ...(hasChildren && childrenAges.length > 0 ? {children: childrenAges} : {}),
      });
      setPriceBreakdown(breakdown);
    } catch (_error) {
      console.error('Failed to calculate price:', _error);
      const basePrice = Number(trip.price) * totalPassengers;
      setPriceBreakdown({
        basePrice,
        totalDiscount: 0,
        finalPrice: basePrice,
        discountsApplied: [],
        quantity: totalPassengers,
      });
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
    if (trip && passengers < trip.availableSeats - childrenAges.length) {
      setPassengers(passengers + 1);
    }
  };

  const handleToggleChildren = () => {
    setHasChildren(prev => {
      if (prev) { setChildrenAges([]); }
      return !prev;
    });
  };

  const handleAddChild = () => {
    if (!trip) return;
    if (childrenAges.length < trip.availableSeats - passengers) {
      setChildrenAges(prev => [...prev, 0]);
    }
  };

  const handleRemoveChild = (index: number) => {
    setChildrenAges(prev => prev.filter((_, i) => i !== index));
  };

  const handleChildAgeChange = (index: number, age: number) => {
    if (age < 0 || age > 17) return;
    setChildrenAges(prev => prev.map((a, i) => (i === index ? age : a)));
  };

  const handleDecrement = () => {
    if (passengers > 1) setPassengers(passengers - 1);
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPFUtil(value);
    setPassengerCPF(formatted);

    if (cpfError) {
      setCpfError(null);
    }

    if (isCPFComplete(formatted)) {
      if (!isValidCPF(formatted)) {
        setCpfError('CPF inválido');
      }
    }
  };

  const validateCPF = (): boolean => {
    if (!passengerCPF.trim()) {
      setCpfError('CPF é obrigatório');
      return false;
    }

    if (!isCPFComplete(passengerCPF)) {
      setCpfError('CPF incompleto');
      return false;
    }

    if (!isValidCPF(passengerCPF)) {
      setCpfError('CPF inválido');
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
    if (!passengerName.trim()) {
      setNameError('Por favor, informe o nome do passageiro');
      return;
    }

    if (!validateCPF()) {
      setCpfErrorMessage(cpfError || 'Por favor, informe um CPF válido');
      setShowCpfErrorModal(true);
      return;
    }

    try {
      const couponCode =
        couponValidation.state.status === 'VALID'
          ? couponValidation.state.data.code
          : undefined;

      const booking = await createBooking({
        tripId: trip!.id,
        quantity: totalPassengers,
        paymentMethod,
        couponCode,
        ...(redeemKm ? {redeemKm: true} : {}),
        ...(hasChildren && childrenAges.length > 0 ? {children: childrenAges} : {}),
      });

      // Aviso de cheia — reserva já confirmada, só informa
      if (booking.floodWarning) {
        const severityLabel: Record<string, string> = {
          ABOVE_NORMAL: 'Atenção',
          SEVERE: 'Alerta de Cheia',
          EXTREME: 'Emergência',
        };
        const label = severityLabel[booking.floodSeverity ?? 'ABOVE_NORMAL'] ?? 'Atenção';
        await new Promise<void>(resolve => {
          Alert.alert(
            `⚠️ ${label} — Risco de Cheia`,
            'Há risco de cheia na rota desta viagem. Sua reserva foi confirmada. Verifique as condições com o capitão antes de embarcar.',
            [{text: 'Entendi', onPress: () => resolve()}],
          );
        });
      }

      logBookingStarted(trip!.id, priceBreakdown?.finalPrice || 0);
      navigation.replace('Payment', {
        bookingId: booking.id,
        amount: priceBreakdown?.finalPrice || 0,
        paymentMethod,
      });
    } catch (_error: any) {
      setBookingErrorMessage(
        _error.message ||
          'Não foi possível processar sua reserva. Tente novamente.',
      );
      setShowBookingErrorModal(true);
    }
  };

  const paymentMethods = [
    {
      value: PaymentMethod.CREDIT_CARD,
      label: 'Cartão de Crédito',
      icon: 'credit-card',
    },
    {
      value: PaymentMethod.DEBIT_CARD,
      label: 'Cartão de Débito',
      icon: 'credit-card',
    },
    {value: PaymentMethod.PIX, label: 'PIX', icon: 'qr-code'},
    {value: PaymentMethod.CASH, label: 'Dinheiro', icon: 'payments'},
  ];

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
    hasChildren,
    childrenAges,
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
    paymentMethods,
    handleIncrement,
    handleDecrement,
    handleToggleChildren,
    handleAddChild,
    handleRemoveChild,
    handleChildAgeChange,
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
