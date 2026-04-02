import {PaymentMethod, PaymentStatus} from '@domain';

type BookingLike = {
  status?: string;
};

type PaymentStatusResult = {
  paymentStatus?: PaymentStatus;
  isExpired?: boolean;
};

export function getSecondsUntil(dateTime: string): number {
  const now = Date.now();
  const expiry = new Date(dateTime).getTime();

  return Math.max(0, Math.floor((expiry - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

export function shouldRedirectToTicket(
  booking: BookingLike | null | undefined,
  paymentMethod: PaymentMethod,
  isLoading: boolean,
): boolean {
  return Boolean(
    !isLoading &&
      booking &&
      paymentMethod !== PaymentMethod.PIX &&
      booking.status === 'confirmed',
  );
}

export function shouldShowPaidModal(status: PaymentStatusResult): boolean {
  return status.paymentStatus === PaymentStatus.PAID;
}

export function shouldShowExpiredModal(status: PaymentStatusResult): boolean {
  return Boolean(status.isExpired);
}

export function createPixShareMessage(
  amountLabel: string,
  bookingId: string,
  pixQrCode: string,
): string {
  return (
    'NavegaJa - Pagamento PIX\n\n' +
    `Valor: ${amountLabel}\n` +
    `Reserva: #${bookingId.slice(0, 8).toUpperCase()}\n\n` +
    `Codigo PIX (Copia e Cola):\n${pixQrCode}\n\n` +
    'Abra seu banco e use o codigo acima para pagar.'
  );
}
