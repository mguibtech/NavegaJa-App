import {useState, useEffect, useRef} from 'react';
import {Clipboard, Share} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PaymentMethod, PaymentStatus, useBookingDetails, usePaymentStatus} from '@domain';
import {useToast} from '@hooks';
import {formatBRL} from '@utils';
import type {AppStackParamList} from '@routes';

export function usePaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Payment'>>();
  const {bookingId, amount, paymentMethod} = route.params;
  const toast = useToast();
  const isMounted = useRef(true);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {booking, isLoading, error: bookingError} = useBookingDetails(bookingId);
  const {checkStatus} = usePaymentStatus();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (bookingError) {
      toast.showError('Erro ao carregar dados de pagamento');
      navigation.goBack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingError]);

  useEffect(() => {
    if (!isLoading && booking && paymentMethod !== PaymentMethod.PIX && booking.status === 'confirmed') {
      navigation.replace('Ticket', {bookingId});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, isLoading]);

  // Countdown timer para PIX
  useEffect(() => {
    if (!booking?.pixExpiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(booking.pixExpiresAt!).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        setShowExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking?.pixExpiresAt]);

  // Polling de status a cada 5s (apenas PIX)
  useEffect(() => {
    if (paymentMethod !== PaymentMethod.PIX || !booking) return;

    const pollingInterval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(pollingInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, paymentMethod]);

  async function checkPaymentStatus() {
    if (isCheckingPayment || !isMounted.current) return;
    try {
      setIsCheckingPayment(true);
      const status = await checkStatus(bookingId);
      if (!isMounted.current) return;
      if (status.paymentStatus === PaymentStatus.PAID) {
        setShowSuccessModal(true);
      } else if (status.isExpired) {
        setShowExpiredModal(true);
      }
    } catch {
      // silent — polling errors são esperados em transições de tela
    } finally {
      if (isMounted.current) setIsCheckingPayment(false);
    }
  }

  function handleCopyPixCode() {
    if (booking?.pixQrCode) {
      Clipboard.setString(booking.pixQrCode);
      toast.showSuccess('Código PIX copiado!');
    }
  }

  async function handleSharePixCode() {
    if (!booking?.pixQrCode) return;
    try {
      await Share.share({
        title: 'Pagamento NavegaJá',
        message:
          `🛥️ NavegaJá — Pagamento PIX\n\n` +
          `Valor: ${formatBRL(amount)}\n` +
          `Reserva: #${bookingId.slice(0, 8).toUpperCase()}\n\n` +
          `Código PIX (Copia e Cola):\n${booking.pixQrCode}\n\n` +
          `Abra seu banco e use o código acima para pagar.`,
      });
    } catch {
      // ignore share errors
    }
  }

  function handlePaymentConfirmed() {
    setShowSuccessModal(false);
    navigation.replace('Ticket', {bookingId});
  }

  function handleExpired() {
    setShowExpiredModal(false);
    navigation.goBack();
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return {
    bookingId,
    amount,
    paymentMethod,
    isLoading,
    booking,
    timeLeft,
    isCheckingPayment,
    showExpiredModal,
    showSuccessModal,
    handleCopyPixCode,
    handleSharePixCode,
    handlePaymentConfirmed,
    handleExpired,
    formatTime,
    goBack: () => navigation.goBack(),
  };
}
