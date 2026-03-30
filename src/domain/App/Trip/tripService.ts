import AsyncStorage from '@infra/storage';

import {tripAPI} from './tripAPI';
import {SearchTripsParams, Trip, TripManageData} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';

const SEARCH_CACHE_KEY = '@navegaja:trips_search_cache';
const POPULAR_CACHE_KEY = '@navegaja:popular_trips_cache';

async function searchTrips(params: SearchTripsParams): Promise<Trip[]> {
  try {
    const trips = await tripAPI.search(params);
    const sorted = trips.sort((a, b) => Number(a.price) - Number(b.price));

    // Salva última busca para offline
    await AsyncStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(sorted));

    return sorted;
  } catch (error) {
    console.warn('Failed to fetch trips from API, loading from cache');
    const cached = await AsyncStorage.getItem(SEARCH_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}

async function getTripById(id: string): Promise<Trip> {
  return await tripAPI.getById(id);
}

async function getPopular(): Promise<PopularDestinationsResponse> {
  try {
    const popular = await tripAPI.getPopular();
    await AsyncStorage.setItem(POPULAR_CACHE_KEY, JSON.stringify(popular));
    return popular;
  } catch (error) {
    const cached = await AsyncStorage.getItem(POPULAR_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}

async function getTripManage(id: string): Promise<TripManageData> {
  return await tripAPI.getTripManage(id);
}

/**
 * Carrega busca de viagens do cache offline
 */
async function loadSearchOffline(): Promise<Trip[]> {
  const cached = await AsyncStorage.getItem(SEARCH_CACHE_KEY);
  return cached ? JSON.parse(cached) : [];
}

export const tripService = {
  searchTrips,
  getTripById,
  getPopular,
  getTripManage,
  loadSearchOffline,
};
