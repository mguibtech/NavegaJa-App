import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

import {Booking} from '@types';

const OFFLINE_BOOKINGS_KEY = '@navegaja:bookings';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  offlineBookings: Booking[];
  isLoading: boolean;

  // Actions
  createBooking: (
    tripId: string,
    seats: number,
    paymentMethod: string,
  ) => Promise<Booking>;
  getMyBookings: () => Promise<void>;
  getBookingById: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  syncOfflineBookings: () => Promise<void>;
  saveBookingOffline: (booking: Booking) => Promise<void>;
  loadOfflineBookings: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial State
  bookings: [],
  currentBooking: null,
  offlineBookings: [],
  isLoading: false,

  // Actions
  createBooking: async (
    tripId: string,
    seats: number,
    paymentMethod: string,
  ) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando bookingsApi estiver pronto
      // const booking = await bookingsApi.create({tripId, seats, paymentMethod});

      // Simular booking para demonstração
      const booking: Booking = {
        id: `offline-${Date.now()}`,
        passengerId: 'current-user-id',
        tripId,
        seats,
        totalPrice: '0',
        status: 'PENDING' as any,
        qrCode: `QR-${Date.now()}`,
        paymentMethod,
        paymentStatus: 'PENDING' as any,
        checkedInAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salvar offline first
      await get().saveBookingOffline(booking);

      set({currentBooking: booking, isLoading: false});
      return booking;
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  getMyBookings: async () => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando bookingsApi estiver pronto
      // const bookings = await bookingsApi.getMyBookings();
      // set({bookings, isLoading: false});

      // Carregar offline enquanto API não está pronta
      await get().loadOfflineBookings();
      const offlineBookings = get().offlineBookings;
      set({bookings: offlineBookings, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  getBookingById: async (bookingId: string) => {
    set({isLoading: true});
    try {
      // Primeiro tentar buscar da API
      // TODO: Implementar quando bookingsApi estiver pronto
      // const booking = await bookingsApi.getById(bookingId);
      // set({currentBooking: booking, isLoading: false});

      // Fallback: buscar offline
      const offlineBookings = get().offlineBookings;
      const booking = offlineBookings.find(b => b.id === bookingId);
      set({currentBooking: booking || null, isLoading: false});
    } catch (error) {
      // Se falhar, buscar offline
      const offlineBookings = get().offlineBookings;
      const booking = offlineBookings.find(b => b.id === bookingId);
      set({currentBooking: booking || null, isLoading: false});
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando bookingsApi estiver pronto
      // await bookingsApi.cancel(bookingId);

      // Atualizar lista
      await get().getMyBookings();
      set({isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  syncOfflineBookings: async () => {
    const offlineBookings = get().offlineBookings;
    // TODO: Enviar bookings offline para API quando houver conexão
    console.log('Sync offline bookings:', offlineBookings.length);
  },

  saveBookingOffline: async (booking: Booking) => {
    const current = get().offlineBookings;
    const updated = [...current, booking];
    await AsyncStorage.setItem(OFFLINE_BOOKINGS_KEY, JSON.stringify(updated));
    set({offlineBookings: updated});
  },

  loadOfflineBookings: async () => {
    try {
      const json = await AsyncStorage.getItem(OFFLINE_BOOKINGS_KEY);
      const bookings: Booking[] = json ? JSON.parse(json) : [];
      set({offlineBookings: bookings});
    } catch (error) {
      console.error('Error loading offline bookings:', error);
      set({offlineBookings: []});
    }
  },

  setLoading: (isLoading: boolean) => {
    set({isLoading});
  },
}));
