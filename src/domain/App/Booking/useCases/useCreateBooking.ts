import {useState} from 'react';

import {bookingService} from '../bookingService';
import {Booking, CreateBookingData} from '../bookingTypes';

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function create(data: CreateBookingData): Promise<Booking> {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await bookingService.createBooking(data);
      setIsLoading(false);
      return booking;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {
    create,
    isLoading,
    error,
  };
}
