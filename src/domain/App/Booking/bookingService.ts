import AsyncStorage from '@react-native-async-storage/async-storage';

import {bookingAPI} from './bookingAPI';
import {Booking, CreateBookingData} from './bookingTypes';

const BOOKINGS_STORAGE_KEY = '@navegaja:bookings';

class BookingService {
  async getById(id: string): Promise<Booking> {
    return bookingAPI.getById(id);
  }

  async getMyBookings(): Promise<Booking[]> {
    const bookings = await bookingAPI.getMyBookings();

    // Save offline
    await this.saveOffline(bookings);

    return bookings;
  }

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const booking = await bookingAPI.create(data);

    // Save offline
    const stored = await this.loadOffline();
    await this.saveOffline([booking, ...stored]);

    return booking;
  }

  async cancelBooking(id: string, reason?: string): Promise<void> {
    await bookingAPI.cancel(id, {reason});

    // Remove from offline storage
    const stored = await this.loadOffline();
    const filtered = stored.filter(b => b.id !== id);
    await this.saveOffline(filtered);
  }

  async checkInBooking(id: string): Promise<Booking> {
    const booking = await bookingAPI.checkIn(id);

    // Update offline storage
    const stored = await this.loadOffline();
    const updated = stored.map(b => (b.id === id ? booking : b));
    await this.saveOffline(updated);

    return booking;
  }

  async loadOffline(): Promise<Booking[]> {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveOffline(bookings: Booking[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        BOOKINGS_STORAGE_KEY,
        JSON.stringify(bookings),
      );
    } catch (_error) {
      console.error('Error saving bookings offline:', _error);
    }
  }
}

export const bookingService = new BookingService();
