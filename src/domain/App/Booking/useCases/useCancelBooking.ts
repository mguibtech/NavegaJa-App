import {useState} from 'react';

import {bookingAPI} from '../bookingAPI';

export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function cancel(bookingId: string, reason?: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      await bookingAPI.cancel(bookingId, reason ? {reason} : undefined);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {cancel, isLoading, error};
}
