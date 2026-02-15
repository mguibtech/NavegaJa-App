/**
 * @format
 */

import {bookingAPI} from '../../src/domain/App/Booking/bookingAPI';
import {api} from '../../src/api';
import {PaymentMethod, BookingStatus, PaymentStatus} from '../../src/domain/App/Booking/bookingTypes';

// Mock da API
jest.mock('../../src/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('BookingAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyBookings', () => {
    it('should fetch user bookings', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          tripId: 'trip-1',
          userId: 'user-1',
          quantity: 2,
          totalPrice: 100,
          status: BookingStatus.CONFIRMED,
          paymentMethod: PaymentMethod.PIX,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingAPI.getMyBookings();

      expect(api.get).toHaveBeenCalledWith('/bookings/my-bookings');
      expect(result).toEqual(mockBookings);
    });

    it('should handle error when fetching bookings', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(bookingAPI.getMyBookings()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch booking by id', async () => {
      const mockBooking = {
        id: 'booking-1',
        tripId: 'trip-1',
        userId: 'user-1',
        quantity: 2,
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.PIX,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: '2024-01-01T10:15:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      (api.get as jest.Mock).mockResolvedValue(mockBooking);

      const result = await bookingAPI.getById('booking-1');

      expect(api.get).toHaveBeenCalledWith('/bookings/booking-1');
      expect(result).toEqual(mockBooking);
      expect(result.pixQrCode).toBeDefined();
      expect(result.pixQrCodeImage).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create booking with PIX payment', async () => {
      const createData = {
        tripId: 'trip-1',
        quantity: 2,
        paymentMethod: PaymentMethod.PIX,
        couponCode: 'PROMO10',
      };

      const mockResponse = {
        id: 'booking-new',
        ...createData,
        userId: 'user-1',
        totalPrice: 90,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        pixQrCode: '00020126...',
        pixQrCodeImage: 'data:image/png;base64...',
        pixExpiresAt: '2024-01-01T10:15:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingAPI.create(createData);

      expect(api.post).toHaveBeenCalledWith('/bookings', createData);
      expect(result.id).toBe('booking-new');
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(result.pixQrCode).toBeDefined();
    });

    it('should create booking with CASH payment', async () => {
      const createData = {
        tripId: 'trip-1',
        quantity: 1,
        paymentMethod: PaymentMethod.CASH,
      };

      const mockResponse = {
        id: 'booking-cash',
        ...createData,
        userId: 'user-1',
        totalPrice: 50,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        qrCodeCheckin: 'NVGJ-abc123',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingAPI.create(createData);

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(result.qrCodeCheckin).toBeDefined();
      expect(result.pixQrCode).toBeUndefined();
    });

    it('should handle validation errors', async () => {
      const createData = {
        tripId: 'trip-1',
        quantity: 999, // Quantidade inválida
        paymentMethod: PaymentMethod.PIX,
      };

      (api.post as jest.Mock).mockRejectedValue({
        response: {
          status: 400,
          data: {message: 'Quantidade de assentos inválida'},
        },
      });

      await expect(bookingAPI.create(createData)).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });
  });

  describe('cancel', () => {
    it('should cancel booking', async () => {
      (api.post as jest.Mock).mockResolvedValue(undefined);

      await bookingAPI.cancel('booking-1', {reason: 'Não poderei viajar'});

      expect(api.post).toHaveBeenCalledWith('/bookings/booking-1/cancel', {
        reason: 'Não poderei viajar',
      });
    });

    it('should cancel booking without reason', async () => {
      (api.post as jest.Mock).mockResolvedValue(undefined);

      await bookingAPI.cancel('booking-1');

      expect(api.post).toHaveBeenCalledWith('/bookings/booking-1/cancel', undefined);
    });
  });

  describe('checkIn', () => {
    it('should check in booking', async () => {
      const mockResponse = {
        id: 'booking-1',
        tripId: 'trip-1',
        userId: 'user-1',
        quantity: 2,
        totalPrice: 100,
        status: BookingStatus.CHECKED_IN,
        paymentMethod: PaymentMethod.PIX,
        checkedInAt: '2024-01-01T11:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingAPI.checkIn('booking-1');

      expect(api.post).toHaveBeenCalledWith('/bookings/booking-1/checkin');
      expect(result.status).toBe(BookingStatus.CHECKED_IN);
      expect(result.checkedInAt).toBeDefined();
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status for pending PIX', async () => {
      const mockStatus = {
        bookingId: 'booking-1',
        paymentStatus: PaymentStatus.PENDING,
        status: BookingStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        totalPrice: 100,
        pixPaidAt: null,
        pixExpiresAt: '2024-01-01T10:15:00Z',
        isExpired: false,
      };

      (api.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await bookingAPI.getPaymentStatus('booking-1');

      expect(api.get).toHaveBeenCalledWith('/bookings/booking-1/payment-status');
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(result.isExpired).toBe(false);
    });

    it('should get payment status for paid PIX', async () => {
      const mockStatus = {
        bookingId: 'booking-1',
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.PIX,
        totalPrice: 100,
        pixPaidAt: '2024-01-01T10:10:00Z',
        pixExpiresAt: '2024-01-01T10:15:00Z',
        isExpired: false,
      };

      (api.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await bookingAPI.getPaymentStatus('booking-1');

      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.pixPaidAt).toBeDefined();
    });

    it('should get payment status for expired PIX', async () => {
      const mockStatus = {
        bookingId: 'booking-1',
        paymentStatus: PaymentStatus.PENDING,
        status: BookingStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        totalPrice: 100,
        pixPaidAt: null,
        pixExpiresAt: '2024-01-01T10:15:00Z',
        isExpired: true,
      };

      (api.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await bookingAPI.getPaymentStatus('booking-1');

      expect(result.isExpired).toBe(true);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: {
          status: 401,
          data: {message: 'Token inválido'},
        },
      });

      await expect(bookingAPI.getMyBookings()).rejects.toMatchObject({
        response: {status: 401},
      });
    });

    it('should handle 404 not found', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: {
          status: 404,
          data: {message: 'Reserva não encontrada'},
        },
      });

      await expect(bookingAPI.getById('invalid-id')).rejects.toMatchObject({
        response: {status: 404},
      });
    });

    it('should handle 500 server error', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: {
          status: 500,
          data: {message: 'Erro interno do servidor'},
        },
      });

      await expect(
        bookingAPI.create({
          tripId: 'trip-1',
          quantity: 1,
          paymentMethod: PaymentMethod.PIX,
        }),
      ).rejects.toMatchObject({
        response: {status: 500},
      });
    });
  });
});
