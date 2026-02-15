/**
 * @format
 */

import React from 'react';
import {render, waitFor, act} from '@testing-library/react-native';
import {PaymentScreen} from '../../src/screens/app/PaymentScreen';
import {bookingAPI} from '../../src/domain/App/Booking/bookingAPI';
import {PaymentMethod, PaymentStatus, BookingStatus} from '../../src/domain';

// Mock dependencies
jest.mock('../../src/domain/App/Booking/bookingAPI');
jest.mock('@react-navigation/native-stack', () => ({
  ...jest.requireActual('@react-navigation/native-stack'),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as any;

const mockRoute = {
  params: {
    bookingId: 'booking-123',
    amount: 100,
    paymentMethod: PaymentMethod.PIX,
  },
} as any;

const mockToast = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

jest.mock('../../src/hooks', () => ({
  useToast: () => mockToast,
}));

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('PIX Payment Flow', () => {
    it('should render PIX payment screen with QR code', async () => {
      const mockBooking = {
        id: 'booking-123',
        tripId: 'trip-1',
        userId: 'user-1',
        quantity: 2,
        totalPrice: 100,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64,iVBORw0KG...',
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);

      const {getByText, queryByText} = render(
        <PaymentScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Pagamento')).toBeTruthy();
      });

      await waitFor(() => {
        expect(getByText('Valor a pagar')).toBeTruthy();
        expect(getByText('R$ 100.00')).toBeTruthy();
        expect(getByText('Escaneie o QR Code')).toBeTruthy();
        expect(getByText('PIX Copia e Cola')).toBeTruthy();
        expect(getByText('Copiar Código')).toBeTruthy();
      });

      expect(bookingAPI.getById).toHaveBeenCalledWith('booking-123');
    });

    it('should show timer countdown', async () => {
      const futureTime = new Date(Date.now() + 15 * 60 * 1000);
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: futureTime.toISOString(),
      } as any;

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);

      const {getByText} = render(
        <PaymentScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText(/Tempo restante:/)).toBeTruthy();
      });
    });

    it('should poll payment status every 5 seconds', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      } as any;

      const mockPaymentStatus = {
        bookingId: 'booking-123',
        paymentStatus: PaymentStatus.PENDING,
        status: BookingStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        totalPrice: 100,
        pixPaidAt: null,
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isExpired: false,
      };

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);
      (bookingAPI.getPaymentStatus as jest.Mock).mockResolvedValue(mockPaymentStatus);

      render(<PaymentScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(bookingAPI.getById).toHaveBeenCalled();
      });

      // Avançar 5 segundos
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(bookingAPI.getPaymentStatus).toHaveBeenCalledWith('booking-123');
      });

      // Avançar mais 5 segundos
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(bookingAPI.getPaymentStatus).toHaveBeenCalledTimes(2);
      });
    });

    it('should navigate to Ticket when payment is confirmed', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      } as any;

      const mockPaymentStatusPaid = {
        bookingId: 'booking-123',
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.PIX,
        totalPrice: 100,
        pixPaidAt: new Date().toISOString(),
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isExpired: false,
      };

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);
      (bookingAPI.getPaymentStatus as jest.Mock).mockResolvedValue(mockPaymentStatusPaid);

      const {getByText} = render(
        <PaymentScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(bookingAPI.getById).toHaveBeenCalled();
      });

      // Polling detecta pagamento
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(getByText('Pagamento Confirmado!')).toBeTruthy();
      });
    });

    it('should show expired modal when PIX expires', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: new Date(Date.now() + 1000).toISOString(), // Expira em 1 segundo
      } as any;

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);

      const {getByText} = render(
        <PaymentScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(bookingAPI.getById).toHaveBeenCalled();
      });

      // Avançar tempo para expirar
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText('Pagamento Expirado')).toBeTruthy();
      });
    });
  });

  describe('CASH Payment Flow', () => {
    it('should redirect to Ticket for CASH payment', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        qrCodeCheckin: 'NVGJ-abc123',
      } as any;

      const routeCash = {
        params: {
          bookingId: 'booking-123',
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
        },
      } as any;

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);

      render(<PaymentScreen navigation={mockNavigation} route={routeCash} />);

      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('Ticket', {
          bookingId: 'booking-123',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error and go back when booking fails to load', async () => {
      (bookingAPI.getById as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<PaymentScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(mockToast.showError).toHaveBeenCalledWith('Erro ao carregar dados de pagamento');
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    it('should handle payment status check errors gracefully', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: BookingStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      } as any;

      (bookingAPI.getById as jest.Mock).mockResolvedValue(mockBooking);
      (bookingAPI.getPaymentStatus as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<PaymentScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(bookingAPI.getById).toHaveBeenCalled();
      });

      // Polling deve continuar mesmo com erro
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(bookingAPI.getPaymentStatus).toHaveBeenCalled();
      });

      // Não deve quebrar a tela
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });
});
