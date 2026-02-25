import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useTripDetails,
  PaymentMethod,
  useCreateBooking,
  useCalculatePrice,
  PriceBreakdown as PriceBreakdownType,
  useCouponValidation,
} from '@domain';
import {AppStackParamList} from '@routes';

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
  const [passengers, setPassengers] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerCPF, setPassengerCPF] = useState('');
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CREDIT_CARD,
  );
  const [priceBreakdown, setPriceBreakdown] =
    useState<PriceBreakdownType | null>(null);

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showNameErrorModal, setShowNameErrorModal] = useState(false);
  const [showCpfErrorModal, setShowCpfErrorModal] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');

  const {calculate, isLoading: isCalculatingPrice} = useCalculatePrice();
  const couponValidation = useCouponValidation();

  // Error handling for trip load
  useEffect(() => {
    if (tripError) { setShowLoadErrorModal(true); }
  }, [tripError]);

  // Calculate price whenever trip, passengers, or coupon changes
  useEffect(() => {
    if (trip) {
      calculatePrice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, passengers, couponValidation.state]);

  async function calculatePrice() {
    if (!trip) return;

    try {
      const couponCode =
        couponValidation.state.status === 'VALID'
          ? couponValidation.state.data.code
          : undefined;

      const breakdown = await calculate({
        tripId: trip.id,
        quantity: passengers,
        couponCode,
      });
      setPriceBreakdown(breakdown);
    } catch (_error) {
      console.error('Failed to calculate price:', _error);
      const basePrice = Number(trip.price) * passengers;
      setPriceBreakdown({
        basePrice,
        totalDiscount: 0,
        finalPrice: basePrice,
        discountsApplied: [],
        quantity: passengers,
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
    if (trip && passengers < trip.availableSeats) {
      setPassengers(passengers + 1);
    }
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

  const handleConfirmBooking = async () => {
    if (!passengerName.trim()) {
      setShowNameErrorModal(true);
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
        quantity: passengers,
        paymentMethod,
        couponCode,
      });

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
    passengerName,
    setPassengerName,
    passengerCPF,
    cpfError,
    paymentMethod,
    setPaymentMethod,
    priceBreakdown,
    isCreatingBooking,
    isCalculatingPrice,
    couponValidation,
    showLoadErrorModal,
    showNameErrorModal,
    showCpfErrorModal,
    cpfErrorMessage,
    showBookingErrorModal,
    bookingErrorMessage,
    paymentMethods,
    handleIncrement,
    handleDecrement,
    handleCPFChange,
    handleConfirmBooking,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleGoBack,
    handleCloseLoadErrorModal,
    setShowNameErrorModal,
    setShowCpfErrorModal,
    setShowBookingErrorModal,
    formatTime,
    formatDate,
  };
}
