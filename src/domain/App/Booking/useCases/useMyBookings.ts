import {useState, useEffect} from 'react';

import {bookingService} from '../bookingService';
import {Booking} from '../bookingTypes';

export function useMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load offline bookings on mount
  useEffect(() => {
    loadOfflineBookings();
  }, []);

  async function loadOfflineBookings() {
    const offline = await bookingService.loadOffline();
    setBookings(offline);
  }

  async function fetch(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingService.getMyBookings();
      setBookings(result);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      // Don't clear bookings on error - keep offline data
      throw error;
    }
  }

  return {
    bookings,
    fetch,
    isLoading,
    error,
  };
}
