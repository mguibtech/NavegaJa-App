/**
 * @format
 */

import {shipmentAPI} from '../../src/domain/App/Shipment/shipmentAPI';
import {api} from '../../src/api';
import {ShipmentStatus, PaymentMethod} from '../../src/domain';

// Mock da API
jest.mock('../../src/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  },
}));

describe('ShipmentAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePrice', () => {
    it('should calculate shipment price', async () => {
      const mockRequest = {
        tripId: 'trip-1',
        weight: 2.5,
        dimensions: {length: 30, width: 20, height: 10},
        couponCode: 'FRETE10',
      };

      const mockResponse = {
        basePrice: 25.0,
        volumetricWeight: 1.0,
        actualWeight: 2.5,
        chargedWeight: 2.5,
        weightCharge: 25.0,
        pricePerKg: 10.0,
        couponDiscount: 2.5,
        couponCode: 'FRETE10',
        totalDiscount: 2.5,
        finalPrice: 22.5,
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.calculatePrice(mockRequest);

      expect(api.post).toHaveBeenCalledWith('/shipments/calculate-price', mockRequest);
      expect(result).toEqual(mockResponse);
      expect(result.finalPrice).toBe(22.5);
      expect(result.couponDiscount).toBe(2.5);
    });

    it('should calculate price without coupon', async () => {
      const mockRequest = {
        tripId: 'trip-1',
        weight: 1.5,
      };

      const mockResponse = {
        basePrice: 15.0,
        actualWeight: 1.5,
        chargedWeight: 1.5,
        weightCharge: 15.0,
        pricePerKg: 10.0,
        totalDiscount: 0,
        finalPrice: 15.0,
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.calculatePrice(mockRequest);

      expect(result.finalPrice).toBe(15.0);
      expect(result.couponDiscount).toBeUndefined();
    });
  });

  describe('getPresignedUrls', () => {
    it('should get presigned URLs for photo upload', async () => {
      const mockRequest = {
        count: 3,
        fileTypes: ['image/jpeg', 'image/jpeg', 'image/png'],
      };

      const mockResponse = {
        urls: [
          {
            uploadUrl: 'https://s3.amazonaws.com/upload1',
            publicUrl: 'https://cdn.example.com/photo1.jpg',
            key: 'shipments/123/photo1.jpg',
          },
          {
            uploadUrl: 'https://s3.amazonaws.com/upload2',
            publicUrl: 'https://cdn.example.com/photo2.jpg',
            key: 'shipments/123/photo2.jpg',
          },
          {
            uploadUrl: 'https://s3.amazonaws.com/upload3',
            publicUrl: 'https://cdn.example.com/photo3.png',
            key: 'shipments/123/photo3.png',
          },
        ],
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.getPresignedUrls(mockRequest);

      expect(api.post).toHaveBeenCalledWith('/shipments/upload/presigned-urls', mockRequest);
      expect(result.urls).toHaveLength(3);
      expect(result.urls[0].uploadUrl).toContain('s3.amazonaws.com');
    });
  });

  describe('create', () => {
    it('should create shipment with FormData', async () => {
      const mockFormData = new FormData();
      mockFormData.append('tripId', 'trip-1');
      mockFormData.append('weight', '2.5');
      mockFormData.append('recipientName', 'João Silva');

      const mockResponse = {
        id: 'shipment-1',
        senderId: 'user-1',
        recipientName: 'João Silva',
        recipientPhone: '(92) 99999-9999',
        recipientAddress: 'Rua Amazonas, 123',
        description: 'Documentos importantes',
        weight: 2.5,
        tripId: 'trip-1',
        trackingCode: 'NJ2024000001',
        status: ShipmentStatus.PENDING,
        qrCode: 'SHIPMENT-QR-CODE',
        price: 25.0,
        paymentMethod: PaymentMethod.PIX,
        photos: ['https://cdn.example.com/photo1.jpg'],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      (api.upload as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.create(mockFormData);

      expect(api.upload).toHaveBeenCalledWith('/shipments', mockFormData);
      expect(result.id).toBe('shipment-1');
      expect(result.trackingCode).toBe('NJ2024000001');
      expect(result.status).toBe(ShipmentStatus.PENDING);
    });
  });

  describe('getMyShipments', () => {
    it('should fetch user shipments', async () => {
      const mockShipments = [
        {
          id: 'shipment-1',
          trackingCode: 'NJ2024000001',
          status: ShipmentStatus.IN_TRANSIT,
          weight: 2.5,
          price: 25.0,
        },
        {
          id: 'shipment-2',
          trackingCode: 'NJ2024000002',
          status: ShipmentStatus.DELIVERED,
          weight: 1.0,
          price: 10.0,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue(mockShipments);

      const result = await shipmentAPI.getMyShipments();

      expect(api.get).toHaveBeenCalledWith('/shipments/my-shipments');
      expect(result).toHaveLength(2);
      expect(result[0].trackingCode).toBe('NJ2024000001');
    });

    it('should return empty array when no shipments', async () => {
      (api.get as jest.Mock).mockResolvedValue([]);

      const result = await shipmentAPI.getMyShipments();

      expect(result).toEqual([]);
    });
  });

  describe('track', () => {
    it('should track shipment by tracking code', async () => {
      const mockResponse = {
        shipment: {
          id: 'shipment-1',
          trackingCode: 'NJ2024000001',
          status: ShipmentStatus.IN_TRANSIT,
          weight: 2.5,
          recipientName: 'João Silva',
        },
        timeline: [
          {
            id: 'event-1',
            status: ShipmentStatus.PENDING,
            description: 'Encomenda criada',
            timestamp: '2024-01-01T10:00:00Z',
          },
          {
            id: 'event-2',
            status: ShipmentStatus.IN_TRANSIT,
            description: 'Encomenda em trânsito',
            location: 'Porto de Manaus',
            timestamp: '2024-01-01T14:00:00Z',
          },
        ],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.track('NJ2024000001');

      expect(api.get).toHaveBeenCalledWith('/shipments/track/NJ2024000001');
      expect(result.shipment.trackingCode).toBe('NJ2024000001');
      expect(result.timeline).toHaveLength(2);
    });

    it('should handle tracking code not found', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Código de rastreamento não encontrado',
      });

      await expect(shipmentAPI.track('INVALID')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('getById', () => {
    it('should fetch shipment by id', async () => {
      const mockShipment = {
        id: 'shipment-1',
        trackingCode: 'NJ2024000001',
        status: ShipmentStatus.PENDING,
        weight: 2.5,
        price: 25.0,
        qrCode: 'SHIPMENT-QR',
        photos: ['https://cdn.example.com/photo1.jpg'],
      };

      (api.get as jest.Mock).mockResolvedValue(mockShipment);

      const result = await shipmentAPI.getById('shipment-1');

      expect(api.get).toHaveBeenCalledWith('/shipments/shipment-1');
      expect(result.id).toBe('shipment-1');
      expect(result.qrCode).toBeDefined();
    });
  });

  describe('getTimeline', () => {
    it('should fetch shipment timeline', async () => {
      const mockTimeline = [
        {
          id: 'event-1',
          status: ShipmentStatus.PENDING,
          description: 'Encomenda criada',
          timestamp: '2024-01-01T10:00:00Z',
        },
        {
          id: 'event-2',
          status: ShipmentStatus.IN_TRANSIT,
          description: 'Encomenda coletada',
          location: 'Porto de Manaus',
          timestamp: '2024-01-01T11:00:00Z',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue(mockTimeline);

      const result = await shipmentAPI.getTimeline('shipment-1');

      expect(api.get).toHaveBeenCalledWith('/shipments/shipment-1/timeline');
      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('Encomenda criada');
    });
  });

  describe('cancel', () => {
    it('should cancel shipment with reason', async () => {
      (api.post as jest.Mock).mockResolvedValue(undefined);

      await shipmentAPI.cancel('shipment-1', {reason: 'Mudança de planos'});

      expect(api.post).toHaveBeenCalledWith('/shipments/shipment-1/cancel', {
        reason: 'Mudança de planos',
      });
    });

    it('should cancel shipment without reason', async () => {
      (api.post as jest.Mock).mockResolvedValue(undefined);

      await shipmentAPI.cancel('shipment-1');

      expect(api.post).toHaveBeenCalledWith('/shipments/shipment-1/cancel', undefined);
    });
  });

  describe('updateStatus', () => {
    it('should update shipment status', async () => {
      const mockShipment = {
        id: 'shipment-1',
        status: ShipmentStatus.IN_TRANSIT,
        updatedAt: '2024-01-01T12:00:00Z',
      };

      (api.patch as jest.Mock).mockResolvedValue(mockShipment);

      const result = await shipmentAPI.updateStatus('shipment-1', ShipmentStatus.IN_TRANSIT);

      expect(api.patch).toHaveBeenCalledWith('/shipments/shipment-1/status', {
        status: ShipmentStatus.IN_TRANSIT,
      });
      expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
    });
  });

  describe('confirmDelivery', () => {
    it('should confirm delivery', async () => {
      const mockShipment = {
        id: 'shipment-1',
        status: ShipmentStatus.DELIVERED,
        deliveredAt: '2024-01-01T15:00:00Z',
      };

      (api.patch as jest.Mock).mockResolvedValue(mockShipment);

      const result = await shipmentAPI.confirmDelivery('shipment-1');

      expect(api.patch).toHaveBeenCalledWith('/shipments/shipment-1/deliver');
      expect(result.status).toBe(ShipmentStatus.DELIVERED);
      expect(result.deliveredAt).toBeDefined();
    });
  });

  describe('createReview', () => {
    it('should create shipment review', async () => {
      const reviewData = {
        shipmentId: 'shipment-1',
        rating: 5,
        deliveryQuality: 5,
        timeliness: 4,
        comment: 'Entrega perfeita!',
      };

      const mockReview = {
        id: 'review-1',
        ...reviewData,
        senderId: 'user-1',
        createdAt: '2024-01-01T16:00:00Z',
        updatedAt: '2024-01-01T16:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue(mockReview);

      const result = await shipmentAPI.createReview(reviewData);

      expect(api.post).toHaveBeenCalledWith('/shipments/reviews', reviewData);
      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Entrega perfeita!');
    });
  });

  describe('getReviewByShipmentId', () => {
    it('should get review by shipment id', async () => {
      const mockReview = {
        id: 'review-1',
        shipmentId: 'shipment-1',
        rating: 5,
        deliveryQuality: 5,
        timeliness: 4,
      };

      (api.get as jest.Mock).mockResolvedValue(mockReview);

      const result = await shipmentAPI.getReviewByShipmentId('shipment-1');

      expect(api.get).toHaveBeenCalledWith('/shipments/shipment-1/review');
      expect(result?.rating).toBe(5);
    });

    it('should return null when review not found (404)', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Review not found',
      });

      const result = await shipmentAPI.getReviewByShipmentId('shipment-1');

      expect(result).toBeNull();
    });

    it('should throw error for other errors', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: 'Server error',
      });

      await expect(shipmentAPI.getReviewByShipmentId('shipment-1')).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment with receipt', async () => {
      const paymentData = {
        paymentProof: 'https://cdn.example.com/receipt.jpg',
      };

      const mockResponse = {
        shipment: {
          id: 'shipment-1',
          status: ShipmentStatus.PAID,
          paymentConfirmedAt: '2024-01-01T10:30:00Z',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.confirmPayment('shipment-1', paymentData);

      expect(api.post).toHaveBeenCalledWith('/shipments/shipment-1/confirm-payment', paymentData);
      expect(result.shipment.status).toBe(ShipmentStatus.PAID);
    });
  });

  describe('collectShipment', () => {
    it('should collect shipment with QR code and photo', async () => {
      const collectData = {
        validationCode: '123456',
        collectionPhoto: 'https://cdn.example.com/collection.jpg',
      };

      const mockResponse = {
        shipment: {
          id: 'shipment-1',
          status: ShipmentStatus.COLLECTED,
          collectedAt: '2024-01-01T11:00:00Z',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.collectShipment('shipment-1', collectData);

      expect(api.post).toHaveBeenCalledWith('/shipments/shipment-1/collect', collectData);
      expect(result.shipment.status).toBe(ShipmentStatus.COLLECTED);
    });
  });

  describe('validateDelivery', () => {
    it('should validate delivery with PIN and photo', async () => {
      const deliveryData = {
        validationCode: '123456',
        deliveryPhoto: 'https://cdn.example.com/delivery.jpg',
      };

      const mockResponse = {
        shipment: {
          id: 'shipment-1',
          status: ShipmentStatus.DELIVERED,
          deliveredAt: '2024-01-01T15:00:00Z',
        },
        navegaCoinsEarned: 50,
        message: 'Entrega validada com sucesso! Você ganhou 50 NavegaCoins.',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.validateDelivery('NJ2024000001', deliveryData);

      expect(api.post).toHaveBeenCalledWith(
        '/shipments/track/NJ2024000001/validate-delivery',
        deliveryData,
      );
      expect(result.shipment.status).toBe(ShipmentStatus.DELIVERED);
      expect(result.navegaCoinsEarned).toBe(50);
    });
  });

  describe('outForDelivery', () => {
    it('should mark shipment as out for delivery', async () => {
      const mockResponse = {
        shipment: {
          id: 'shipment-1',
          status: ShipmentStatus.OUT_FOR_DELIVERY,
          outForDeliveryAt: '2024-01-01T14:00:00Z',
        },
        message: 'Saiu para entrega com sucesso',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shipmentAPI.outForDelivery('shipment-1');

      expect(api.post).toHaveBeenCalledWith('/shipments/shipment-1/out-for-delivery');
      expect(result.shipment.status).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
      expect(result.message).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete shipment', async () => {
      (api.delete as jest.Mock).mockResolvedValue(undefined);

      await shipmentAPI.delete('shipment-1');

      expect(api.delete).toHaveBeenCalledWith('/shipments/shipment-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        statusCode: 401,
        message: 'Token inválido',
      });

      await expect(shipmentAPI.getMyShipments()).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should handle 404 not found', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Encomenda não encontrada',
      });

      await expect(shipmentAPI.getById('invalid-id')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should handle 500 server error', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: 'Erro interno do servidor',
      });

      await expect(
        shipmentAPI.calculatePrice({tripId: 'trip-1', weight: 1.0}),
      ).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });
});
