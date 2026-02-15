/**
 * @format
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ThemeProvider} from '@shopify/restyle';

import {ShipmentCard} from '../../src/components/ShipmentCard/ShipmentCard';
import {Shipment, ShipmentStatus, PaymentMethod} from '../../src/domain';
import {theme} from '../../src/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockShipment: Shipment = {
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
  price: 25.0,
  paymentMethod: PaymentMethod.PIX,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

describe('ShipmentCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render shipment information', () => {
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={mockShipment} onPress={mockOnPress} />,
    );

    expect(getByText('João Silva')).toBeTruthy();
    expect(getByText('(92) 99999-9999')).toBeTruthy();
    expect(getByText('NJ2024000001')).toBeTruthy();
    expect(getByText('2.5kg')).toBeTruthy();
    expect(getByText('R$ 25.00')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={mockShipment} onPress={mockOnPress} />,
    );

    fireEvent.press(getByText('João Silva'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockShipment);
  });

  it('should render PENDING status correctly', () => {
    const pendingShipment = {...mockShipment, status: ShipmentStatus.PENDING};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={pendingShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Aguardando')).toBeTruthy();
  });

  it('should render IN_TRANSIT status correctly', () => {
    const inTransitShipment = {...mockShipment, status: ShipmentStatus.IN_TRANSIT};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={inTransitShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Em Trânsito')).toBeTruthy();
  });

  it('should render DELIVERED status correctly', () => {
    const deliveredShipment = {...mockShipment, status: ShipmentStatus.DELIVERED};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={deliveredShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Entregue')).toBeTruthy();
  });

  it('should render CANCELLED status correctly', () => {
    const cancelledShipment = {...mockShipment, status: ShipmentStatus.CANCELLED};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={cancelledShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Cancelada')).toBeTruthy();
  });

  it('should render trip information when available', () => {
    const shipmentWithTrip = {
      ...mockShipment,
      trip: {
        id: 'trip-1',
        origin: 'Manaus',
        destination: 'Parintins',
        departureDate: '2024-01-20T08:00:00Z',
        arrivalDate: '2024-01-20T18:00:00Z',
        price: 150,
        seats: 50,
        availableSeats: 30,
        status: 'scheduled' as const,
        boatId: 'boat-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={shipmentWithTrip} onPress={mockOnPress} />,
    );

    expect(getByText('Manaus → Parintins')).toBeTruthy();
  });

  it('should not render trip section when trip is null', () => {
    const {queryByText} = renderWithTheme(
      <ShipmentCard shipment={mockShipment} onPress={mockOnPress} />,
    );

    expect(queryByText('→')).toBeNull();
  });

  it('should format price with 2 decimal places', () => {
    const shipmentWithPrice = {...mockShipment, price: 10.5};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={shipmentWithPrice} onPress={mockOnPress} />,
    );

    expect(getByText('R$ 10.50')).toBeTruthy();
  });

  it('should display weight correctly', () => {
    const heavyShipment = {...mockShipment, weight: 15.75};
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={heavyShipment} onPress={mockOnPress} />,
    );

    expect(getByText('15.75kg')).toBeTruthy();
  });

  it('should display tracking code', () => {
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={mockShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Código de rastreamento')).toBeTruthy();
    expect(getByText('NJ2024000001')).toBeTruthy();
  });

  it('should display recipient information', () => {
    const {getByText} = renderWithTheme(
      <ShipmentCard shipment={mockShipment} onPress={mockOnPress} />,
    );

    expect(getByText('Destinatário')).toBeTruthy();
    expect(getByText('João Silva')).toBeTruthy();
    expect(getByText('(92) 99999-9999')).toBeTruthy();
  });
});
