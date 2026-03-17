import {
  ShipmentStatus,
  canCancelShipment,
  getShipmentLockedCancellationLabel,
} from '@domain';

describe('shipmentStatus helpers', () => {
  it('permite cancelamento apenas para pending e paid', () => {
    expect(canCancelShipment(ShipmentStatus.PENDING)).toBe(true);
    expect(canCancelShipment(ShipmentStatus.PAID)).toBe(true);
    expect(canCancelShipment(ShipmentStatus.COLLECTED)).toBe(false);
    expect(canCancelShipment(ShipmentStatus.IN_TRANSIT)).toBe(false);
    expect(canCancelShipment(ShipmentStatus.ARRIVED)).toBe(false);
    expect(canCancelShipment(ShipmentStatus.OUT_FOR_DELIVERY)).toBe(false);
    expect(canCancelShipment(ShipmentStatus.DELIVERED)).toBe(false);
    expect(canCancelShipment(ShipmentStatus.CANCELLED)).toBe(false);
  });

  it('retorna labels de bloqueio para estados logisticos e entregue', () => {
    expect(getShipmentLockedCancellationLabel(ShipmentStatus.COLLECTED)).toBe(
      'Encomenda em operacao logistica',
    );
    expect(getShipmentLockedCancellationLabel(ShipmentStatus.OUT_FOR_DELIVERY)).toBe(
      'Encomenda em operacao logistica',
    );
    expect(getShipmentLockedCancellationLabel(ShipmentStatus.DELIVERED)).toBe(
      'Entregue',
    );
    expect(getShipmentLockedCancellationLabel(ShipmentStatus.CANCELLED)).toBeNull();
  });
});
