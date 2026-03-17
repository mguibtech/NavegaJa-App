import {Trip} from './tripTypes';

type TripCargoValue = number | string | null | undefined;

export function getTripCargoPricePerKg(cargoPriceKg: TripCargoValue): number | null {
  if (cargoPriceKg == null || cargoPriceKg === '') {
    return null;
  }

  const normalizedValue =
    typeof cargoPriceKg === 'number'
      ? cargoPriceKg
      : parseFloat(String(cargoPriceKg).replace(',', '.'));

  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
    return null;
  }

  return normalizedValue;
}

export function getTripShipmentPricePerKg(
  trip?: Pick<Trip, 'shipmentPricePerKg' | 'cargoPriceKg'> | null,
): number | null {
  return (
    getTripCargoPricePerKg(trip?.shipmentPricePerKg) ??
    getTripCargoPricePerKg(trip?.cargoPriceKg)
  );
}

export function tripAcceptsShipments(
  trip?: Pick<Trip, 'acceptsShipments' | 'shipmentPricePerKg' | 'cargoPriceKg'> | null,
): boolean {
  if (typeof trip?.acceptsShipments === 'boolean') {
    return trip.acceptsShipments;
  }

  return getTripShipmentPricePerKg(trip) != null;
}
