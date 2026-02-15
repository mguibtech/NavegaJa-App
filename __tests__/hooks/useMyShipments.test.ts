/**
 * @format
 */

import {renderHook, act, waitFor} from '@testing-library/react-native';

import {useMyShipments} from '../../src/domain/App/Shipment/useCases/useMyShipments';
import {shipmentService} from '../../src/domain/App/Shipment/shipmentService';
import {ShipmentStatus, PaymentMethod} from '../../src/domain';

// Mock shipmentService
jest.mock('../../src/domain/App/Shipment/shipmentService');

describe('useMyShipments', () => {
  const mockShipments = [
    {
      id: 'shipment-1',
      senderId: 'user-1',
      recipientName: 'João Silva',
      recipientPhone: '(92) 99999-9999',
      recipientAddress: 'Rua Amazonas, 123',
      description: 'Documentos',
      weight: 2.5,
      tripId: 'trip-1',
      trackingCode: 'NJ2024000001',
      status: ShipmentStatus.PENDING,
      qrCode: 'QR-1',
      price: 25.0,
      paymentMethod: PaymentMethod.PIX,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'shipment-2',
      senderId: 'user-1',
      recipientName: 'Maria Santos',
      recipientPhone: '(92) 98888-8888',
      recipientAddress: 'Av. Brasil, 456',
      description: 'Roupas',
      weight: 5.0,
      tripId: 'trip-2',
      trackingCode: 'NJ2024000002',
      status: ShipmentStatus.DELIVERED,
      qrCode: 'QR-2',
      price: 50.0,
      paymentMethod: PaymentMethod.PIX,
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-16T15:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with empty shipments', () => {
    const {result} = renderHook(() => useMyShipments());

    expect(result.current.shipments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch shipments successfully', async () => {
    (shipmentService.getMyShipments as jest.Mock).mockResolvedValue(mockShipments);

    const {result} = renderHook(() => useMyShipments());

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.fetch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.shipments).toEqual(mockShipments);
    expect(result.current.shipments).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state while fetching', async () => {
    (shipmentService.getMyShipments as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockShipments), 100)),
    );

    const {result} = renderHook(() => useMyShipments());

    act(() => {
      result.current.fetch();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Network error');
    (shipmentService.getMyShipments as jest.Mock).mockRejectedValue(mockError);

    const {result} = renderHook(() => useMyShipments());

    await act(async () => {
      try {
        await result.current.fetch();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.shipments).toEqual([]);
  });

  it('should clear error on new fetch', async () => {
    const mockError = new Error('First error');
    (shipmentService.getMyShipments as jest.Mock).mockRejectedValueOnce(mockError);

    const {result} = renderHook(() => useMyShipments());

    // First fetch fails
    await act(async () => {
      try {
        await result.current.fetch();
      } catch {
        // Expected
      }
    });

    expect(result.current.error?.message).toBe('First error');

    // Second fetch succeeds
    (shipmentService.getMyShipments as jest.Mock).mockResolvedValue(mockShipments);

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.shipments).toEqual(mockShipments);
  });

  it('should update shipments on multiple fetches', async () => {
    const firstBatch = [mockShipments[0]];
    const secondBatch = mockShipments;

    (shipmentService.getMyShipments as jest.Mock).mockResolvedValueOnce(firstBatch);

    const {result} = renderHook(() => useMyShipments());

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.shipments).toHaveLength(1);

    (shipmentService.getMyShipments as jest.Mock).mockResolvedValueOnce(secondBatch);

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.shipments).toHaveLength(2);
  });
});
