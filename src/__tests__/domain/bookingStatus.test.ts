import {
  BookingStatus,
  canCancelBooking,
  getBookingLockedCancellationLabel,
} from '@domain';

describe('bookingStatus helpers', () => {
  it('permite cancelamento apenas para pending e confirmed', () => {
    expect(canCancelBooking(BookingStatus.PENDING)).toBe(true);
    expect(canCancelBooking(BookingStatus.CONFIRMED)).toBe(true);
    expect(canCancelBooking(BookingStatus.CHECKED_IN)).toBe(false);
    expect(canCancelBooking(BookingStatus.COMPLETED)).toBe(false);
    expect(canCancelBooking(BookingStatus.CANCELLED)).toBe(false);
  });

  it('retorna labels de bloqueio para estados nao cancelaveis relevantes', () => {
    expect(getBookingLockedCancellationLabel(BookingStatus.CHECKED_IN)).toBe(
      'Embarque realizado',
    );
    expect(getBookingLockedCancellationLabel(BookingStatus.COMPLETED)).toBe(
      'Viagem concluida',
    );
    expect(getBookingLockedCancellationLabel(BookingStatus.CANCELLED)).toBeNull();
  });
});
