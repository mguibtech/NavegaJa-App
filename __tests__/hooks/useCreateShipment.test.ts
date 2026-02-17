/**
 * @format
 */

import {renderHook, act, waitFor} from '@testing-library/react-native';

import {useCreateShipment} from '../../src/domain/App/Shipment/useCases/useCreateShipment';
import {shipmentService} from '../../src/domain/App/Shipment/shipmentService';
import {Shipment, ShipmentStatus, PaymentMethod} from '../../src/domain';

// Mock shipmentService
jest.mock('../../src/domain/App/Shipment/shipmentService');

describe('useCreateShipment', () => {
  const mockShipmentData = {
    recipientName: 'João Silva',
    recipientPhone: '(92) 99999-9999',
    recipientAddress: 'Rua Amazonas, 123',
    description: 'Documentos importantes',
    weight: 2.5,
    tripId: 'trip-1',
    paymentMethod: PaymentMethod.PIX,
  };

  const mockPhotos = [
    {uri: 'file://photo1.jpg', type: 'image/jpeg', name: 'photo1.jpg'},
    {uri: 'file://photo2.jpg', type: 'image/jpeg', name: 'photo2.jpg'},
  ];

  const mockCreatedShipment: Shipment = {
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
    qrCode: 'QR-CODE',
    validationCode: '123456',
    price: 25.0,
    paymentMethod: PaymentMethod.PIX,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with initial state', () => {
    const {result} = renderHook(() => useCreateShipment());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should create shipment without photos', async () => {
    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    const {result} = renderHook(() => useCreateShipment());

    let createdShipment: Shipment | undefined;

    await act(async () => {
      createdShipment = await result.current.create(mockShipmentData, []);
    });

    expect(shipmentService.createShipment).toHaveBeenCalledWith(
      mockShipmentData,
      [],
    );
    expect(createdShipment).toEqual(mockCreatedShipment);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should create shipment with photos', async () => {
    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    const {result} = renderHook(() => useCreateShipment());

    let createdShipment: Shipment | undefined;

    await act(async () => {
      createdShipment = await result.current.create(
        mockShipmentData,
        mockPhotos,
      );
    });

    expect(shipmentService.createShipment).toHaveBeenCalledWith(
      mockShipmentData,
      mockPhotos,
    );
    expect(createdShipment).toEqual(mockCreatedShipment);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should create shipment with coupon', async () => {
    const dataWithCoupon = {
      ...mockShipmentData,
      couponCode: 'FRETE10',
    };

    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    const {result} = renderHook(() => useCreateShipment());

    await act(async () => {
      await result.current.create(dataWithCoupon, []);
    });

    expect(shipmentService.createShipment).toHaveBeenCalledWith(
      dataWithCoupon,
      [],
    );
  });

  it('should create shipment with dimensions', async () => {
    const dataWithDimensions = {
      ...mockShipmentData,
      dimensions: {length: 50, width: 30, height: 20},
    };

    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    const {result} = renderHook(() => useCreateShipment());

    await act(async () => {
      await result.current.create(dataWithDimensions, []);
    });

    expect(shipmentService.createShipment).toHaveBeenCalledWith(
      dataWithDimensions,
      [],
    );
  });

  it('should set loading state while creating', async () => {
    (shipmentService.createShipment as jest.Mock).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve(mockCreatedShipment), 100),
        ),
    );

    const {result} = renderHook(() => useCreateShipment());

    act(() => {
      result.current.create(mockShipmentData, []);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle creation error', async () => {
    const mockError = new Error('Upload failed');
    (shipmentService.createShipment as jest.Mock).mockRejectedValue(mockError);

    const {result} = renderHook(() => useCreateShipment());

    await act(async () => {
      try {
        await result.current.create(mockShipmentData, mockPhotos);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error?.message).toBe('Upload failed');
    expect(result.current.isLoading).toBe(false);
  });

  it('should throw error on failure', async () => {
    const mockError = new Error('Network error');
    (shipmentService.createShipment as jest.Mock).mockRejectedValue(mockError);

    const {result} = renderHook(() => useCreateShipment());

    await expect(
      act(async () => {
        await result.current.create(mockShipmentData, []);
      }),
    ).rejects.toThrow('Network error');
  });

  it('should clear error on new creation attempt', async () => {
    const mockError = new Error('First error');
    (shipmentService.createShipment as jest.Mock).mockRejectedValueOnce(
      mockError,
    );

    const {result} = renderHook(() => useCreateShipment());

    // First attempt fails
    await act(async () => {
      try {
        await result.current.create(mockShipmentData, []);
      } catch {
        // Expected
      }
    });

    expect(result.current.error?.message).toBe('First error');

    // Second attempt succeeds
    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    await act(async () => {
      await result.current.create(mockShipmentData, []);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle multiple photos', async () => {
    const manyPhotos = [
      {uri: 'file://photo1.jpg', type: 'image/jpeg', name: 'photo1.jpg'},
      {uri: 'file://photo2.jpg', type: 'image/jpeg', name: 'photo2.jpg'},
      {uri: 'file://photo3.jpg', type: 'image/jpeg', name: 'photo3.jpg'},
      {uri: 'file://photo4.jpg', type: 'image/jpeg', name: 'photo4.jpg'},
      {uri: 'file://photo5.jpg', type: 'image/jpeg', name: 'photo5.jpg'},
    ];

    (shipmentService.createShipment as jest.Mock).mockResolvedValue(
      mockCreatedShipment,
    );

    const {result} = renderHook(() => useCreateShipment());

    await act(async () => {
      await result.current.create(mockShipmentData, manyPhotos);
    });

    expect(shipmentService.createShipment).toHaveBeenCalledWith(
      mockShipmentData,
      manyPhotos,
    );
  });
});
