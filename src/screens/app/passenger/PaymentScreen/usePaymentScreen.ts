import {useState, useEffect, useRef} from 'react';
import {Clipboard, Share} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PaymentMethod, useBookingDetails, usePaymentStatus} from '@domain';
import {useToast} from '@hooks';
import {formatBRL} from '@utils';
import type {AppStackParamList} from '@routes';
import {logPurchase} from '@services';
import {
  createPixShareMessage,
  formatCountdown,
  getSecondsUntil,
  shouldRedirectToTicket,
  shouldShowExpiredModal,
  shouldShowPaidModal,
} from './paymentScreenUtils';

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
    if (shouldRedirectToTicket(booking, paymentMethod, isLoading)) {
      navigation.replace('Ticket', {bookingId});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, isLoading]);

  useEffect(() => {
    if (!booking?.pixExpiresAt) return;
    const pixExpiresAt = booking.pixExpiresAt;

    setTimeLeft(getSecondsUntil(pixExpiresAt));

    const timer = setInterval(() => {
      const left = getSecondsUntil(pixExpiresAt);
      setTimeLeft(left);

      if (left <= 0) {
        clearInterval(timer);
        setShowExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking?.pixExpiresAt]);

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

      if (shouldShowPaidModal(status)) {
        setShowSuccessModal(true);
      } else if (shouldShowExpiredModal(status)) {
        setShowExpiredModal(true);
      }
    } catch {
      // Polling can race with navigation and expire naturally.
    } finally {
      if (isMounted.current) {
        setIsCheckingPayment(false);
      }
    }
  }

  function handleCopyPixCode() {
    if (booking?.pixQrCode) {
      Clipboard.setString(booking.pixQrCode);
      toast.showSuccess('Codigo PIX copiado!');
    }
  }

  async function handleSharePixCode() {
    if (!booking?.pixQrCode) return;

    try {
      await Share.share({
        title: 'Pagamento NavegaJa',
        message: createPixShareMessage(
          formatBRL(amount),
          bookingId,
          booking.pixQrCode,
        ),
      });
    } catch {
      // Ignore share errors triggered by user dismissal.
    }
  }

  function handlePaymentConfirmed() {
    setShowSuccessModal(false);
    logPurchase(bookingId, amount, paymentMethod);
    navigation.replace('Ticket', {bookingId});
  }

  function handleExpired() {
    setShowExpiredModal(false);
    navigation.goBack();
  }

  function formatTime(seconds: number): string {
    return formatCountdown(seconds);
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
