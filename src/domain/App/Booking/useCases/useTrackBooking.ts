import {useState, useEffect, useCallback} from 'react';

import {bookingService} from '../bookingService';
import {Booking} from '../bookingTypes';
import {TripStatus} from '../../Trip/tripTypes';

export type TrackingStatus =
  | 'scheduled'
  | 'boarding'
  | 'in_transit'
  | 'approaching'
  | 'arrived'
  | 'cancelled';

export interface TrackingInfo {
  booking: Booking;
  trackingStatus: TrackingStatus;
  progressPercent: number;
  estimatedArrival: string | null;
  currentLat: number | null;
  currentLng: number | null;
}

function calcProgress(departureAt: string, estimatedArrivalAt: string): number {
  const now = Date.now();
  const dep = new Date(departureAt).getTime();
  const arr = new Date(estimatedArrivalAt).getTime();
  if (now <= dep) {
    return 0;
  }
  if (now >= arr) {
    return 100;
  }
  return Math.round(((now - dep) / (arr - dep)) * 100);
}

function formatHHMM(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

function mapTripStatus(
  tripStatus: TripStatus,
  progress: number,
): TrackingStatus {
  switch (tripStatus) {
    case TripStatus.SCHEDULED:
      return 'scheduled';
    case TripStatus.IN_PROGRESS:
      if (progress >= 90) {
        return 'approaching';
      }
      if (progress <= 5) {
        return 'boarding';
      }
      return 'in_transit';
    case TripStatus.COMPLETED:
      return 'arrived';
    case TripStatus.CANCELLED:
      return 'cancelled';
  }
}

export function useTrackBooking(bookingId: string) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const booking = await bookingService.getById(bookingId);
      const trip = booking.trip;

      if (!trip) {
        setTrackingInfo({
          booking,
          trackingStatus: 'scheduled',
          progressPercent: 0,
          estimatedArrival: null,
          currentLat: null,
          currentLng: null,
        });
        return;
      }

      const progress =
        trip.status === TripStatus.COMPLETED
          ? 100
          : trip.status === TripStatus.IN_PROGRESS
          ? calcProgress(trip.departureAt, trip.estimatedArrivalAt)
          : 0;

      const trackingStatus = mapTripStatus(trip.status, progress);

      setTrackingInfo({
        booking,
        trackingStatus,
        progressPercent: progress,
        estimatedArrival: trip.estimatedArrivalAt
          ? formatHHMM(trip.estimatedArrivalAt)
          : null,
        currentLat:
          trip.currentLat != null ? parseFloat(trip.currentLat) : null,
        currentLng:
          trip.currentLng != null ? parseFloat(trip.currentLng) : null,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  return {trackingInfo, isLoading, error, refetch: fetch};
}
