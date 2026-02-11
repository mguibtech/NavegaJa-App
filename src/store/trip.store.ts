import {create} from 'zustand';

import {BoatType, Route, Trip} from '@types';

interface TripFilters {
  boatType?: BoatType;
  minPrice?: number;
  maxPrice?: number;
  departureTime?: string;
}

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  popularRoutes: Route[];
  filters: TripFilters;
  isLoading: boolean;

  // Actions
  searchTrips: (
    origin: string,
    destination: string,
    date?: string,
  ) => Promise<void>;
  getTripById: (tripId: string) => Promise<void>;
  getPopularRoutes: () => Promise<void>;
  setFilters: (filters: TripFilters) => void;
  resetFilters: () => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  // Initial State
  trips: [],
  currentTrip: null,
  popularRoutes: [],
  filters: {},
  isLoading: false,

  // Actions
  searchTrips: async (origin: string, destination: string, date?: string) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando tripsApi estiver pronto
      // const trips = await tripsApi.search(origin, destination, date);
      // set({trips, isLoading: false});
      console.log('Search trips:', origin, destination, date);
      set({trips: [], isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  getTripById: async (tripId: string) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando tripsApi estiver pronto
      // const trip = await tripsApi.getById(tripId);
      // set({currentTrip: trip, isLoading: false});
      console.log('Get trip by ID:', tripId);
      set({currentTrip: null, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  getPopularRoutes: async () => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando routesApi estiver pronto
      // const routes = await routesApi.getPopular();
      // set({popularRoutes: routes, isLoading: false});
      console.log('Get popular routes');
      set({popularRoutes: [], isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  setFilters: (filters: TripFilters) => {
    set({filters: {...get().filters, ...filters}});
  },

  resetFilters: () => {
    set({filters: {}});
  },

  setCurrentTrip: (trip: Trip | null) => {
    set({currentTrip: trip});
  },

  setLoading: (isLoading: boolean) => {
    set({isLoading});
  },
}));
