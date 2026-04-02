import {
  createPixShareMessage,
  formatCountdown,
  getSecondsUntil,
  shouldRedirectToTicket,
  shouldShowExpiredModal,
  shouldShowPaidModal,
} from '../../screens/app/passenger/PaymentScreen/paymentScreenUtils';
import {PaymentStatus} from '../../domain';

describe('paymentScreenUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-02T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes remaining seconds until expiry', () => {
    expect(getSecondsUntil('2026-04-02T12:01:30.000Z')).toBe(90);
    expect(getSecondsUntil('2026-04-02T11:59:00.000Z')).toBe(0);
  });

  it('formats countdown values', () => {
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(125)).toBe('02:05');
  });

  it('decides when to redirect to the ticket screen', () => {
    expect(
      shouldRedirectToTicket(
        {status: 'confirmed'},
        'credit_card' as any,
        false,
      ),
    ).toBe(true);

    expect(
      shouldRedirectToTicket(
        {status: 'confirmed'},
        'pix' as any,
        false,
      ),
    ).toBe(false);

    expect(shouldRedirectToTicket(undefined, 'cash' as any, false)).toBe(false);
  });

  it('maps payment status decisions', () => {
    expect(shouldShowPaidModal({paymentStatus: PaymentStatus.PAID})).toBe(true);
    expect(shouldShowPaidModal({paymentStatus: PaymentStatus.PENDING})).toBe(false);
    expect(shouldShowExpiredModal({isExpired: true})).toBe(true);
    expect(shouldShowExpiredModal({isExpired: false})).toBe(false);
  });

  it('builds the PIX share message', () => {
    expect(createPixShareMessage('R$ 10,00', 'booking-12345678', 'pix-code')).toContain(
      'Reserva: #BOOKING-',
    );
    expect(createPixShareMessage('R$ 10,00', 'booking-12345678', 'pix-code')).toContain(
      'pix-code',
    );
  });
});
