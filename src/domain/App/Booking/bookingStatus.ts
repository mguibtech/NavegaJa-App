import {BookingStatus} from './bookingTypes';

export function canCancelBooking(
  status: BookingStatus | string | null | undefined,
): boolean {
  return (
    status === BookingStatus.PENDING ||
    status === BookingStatus.CONFIRMED
  );
}

export function getBookingLockedCancellationLabel(
  status: BookingStatus | string | null | undefined,
): string | null {
  if (status === BookingStatus.CHECKED_IN) {
    return 'Embarque realizado';
  }

  if (status === BookingStatus.COMPLETED) {
    return 'Viagem concluida';
  }

  return null;
}
