import {ShipmentStatus} from './shipmentTypes';

export function canCancelShipment(
  status: ShipmentStatus | string | null | undefined,
): boolean {
  return (
    status === ShipmentStatus.PENDING ||
    status === ShipmentStatus.PAID
  );
}

export function getShipmentLockedCancellationLabel(
  status: ShipmentStatus | string | null | undefined,
): string | null {
  if (
    status === ShipmentStatus.COLLECTED ||
    status === ShipmentStatus.IN_TRANSIT ||
    status === ShipmentStatus.ARRIVED ||
    status === ShipmentStatus.OUT_FOR_DELIVERY
  ) {
    return 'Encomenda em operacao logistica';
  }

  if (status === ShipmentStatus.DELIVERED) {
    return 'Entregue';
  }

  return null;
}
