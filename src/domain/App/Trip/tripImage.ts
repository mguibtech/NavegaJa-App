import {Trip} from './tripTypes';

export function getTripBoatImageUrl(trip: Trip): string | null {
  return trip.boatImageUrl ?? trip.boat?.photoUrl ?? trip.boat?.photos?.[0] ?? null;
}
