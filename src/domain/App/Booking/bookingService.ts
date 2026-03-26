import AsyncStorage from '@react-native-async-storage/async-storage';

import {bookingAPI} from './bookingAPI';
import {Booking, CreateBookingData, PaymentStatusResponse} from './bookingTypes';

const BOOKINGS_STORAGE_KEY = '@navegaja:bookings';

async function getById(id: string): Promise<Booking> {
  return bookingAPI.getById(id);
}

async function getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
  return bookingAPI.getPaymentStatus(id);
}

async function getMyBookings(): Promise<Booking[]> {
  try {
    const bookings = await bookingAPI.getMyBookings();

    // Save offline
    await saveOffline(bookings);

    return bookings;
  } catch {
    console.warn('Failed to fetch bookings from API, loading from cache');
    return await loadOffline();
  }
}

async function createBooking(data: CreateBookingData): Promise<Booking> {
  const booking = await bookingAPI.create(data);

  // Save offline
  const stored = await loadOffline();
  await saveOffline([booking, ...stored]);

  return booking;
}

async function cancelBooking(id: string, reason?: string): Promise<void> {
  await bookingAPI.cancel(id, {reason});

  // Remove from offline storage
  const stored = await loadOffline();
  const filtered = stored.filter(b => b.id !== id);
  await saveOffline(filtered);
}

async function checkInBooking(id: string): Promise<Booking> {
  const booking = await bookingAPI.checkIn(id);

  // Update offline storage
  const stored = await loadOffline();
  const updated = stored.map(b => (b.id === id ? booking : b));
  await saveOffline(updated);

  return booking;
}

async function loadOffline(): Promise<Booking[]> {
  try {
    const stored = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// private helper - NOT added to exported object
async function saveOffline(bookings: Booking[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      BOOKINGS_STORAGE_KEY,
      JSON.stringify(bookings),
    );
  } catch (_error) {
    console.error('Error saving bookings offline:', _error);
  }
}

export const bookingService = {
  getById,
  getPaymentStatus,
  getMyBookings,
  createBooking,
  cancelBooking,
  checkInBooking,
  loadOffline,
};
