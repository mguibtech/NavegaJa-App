/**
 * Weather Service
 * Lógica de negócio e cache offline para sistema de clima
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {weatherAPI} from './weatherAPI';
import {
  CurrentWeather,
  WeatherForecast,
  NavigationSafetyAssessment,
  WeatherAlert,
  Region,
  TripWeather,
  RiverLevel,
} from './weatherTypes';

const WEATHER_CACHE_KEY = '@navegaja:weather_cache';
const FORECAST_CACHE_KEY = '@navegaja:forecast_cache';
const SAFETY_CACHE_KEY = '@navegaja:safety_cache';
const TRIP_WEATHER_CACHE_KEY = '@navegaja:trip_weather_cache';
const RIVER_LEVELS_CACHE_KEY = '@navegaja:river_levels_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (igual ao backend)

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// ========== CACHE HELPERS (private) ==========

/**
 * Verifica se o cache ainda é válido
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Gera chave de cache única
 */
function getCacheKey(
  prefix: string,
  lat?: number,
  lng?: number,
  region?: string,
): string {
  if (region) {
    return `${prefix}:${region}`;
  }
  if (lat !== undefined && lng !== undefined) {
    return `${prefix}:${lat.toFixed(3)},${lng.toFixed(3)}`;
  }
  return prefix;
}

/**
 * Salva dados no cache
 */
async function saveToCache<T>(key: string, data: T): Promise<void> {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Carrega dados do cache
 */
async function loadFromCache<T>(key: string): Promise<T | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;

    const cached: CachedData<T> = JSON.parse(stored);

    if (!isCacheValid(cached.timestamp)) {
      // Cache expirado, remover
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch {
    console.error('Error loading from cache:', error);
    return null;
  }
}

// ========== CURRENT WEATHER ==========

/**
 * Busca clima atual de uma região (com cache)
 */
async function getRegionWeather(region: Region): Promise<CurrentWeather> {
  const cacheKey = getCacheKey(WEATHER_CACHE_KEY, undefined, undefined, region);

  try {
    // Tenta buscar da API
    const weather = await weatherAPI.getRegionWeather(region);

    // Salva no cache
    await saveToCache(cacheKey, weather);

    return weather;
  } catch {
    // Se falhar, tenta carregar do cache
    console.warn('Failed to fetch weather from API, loading from cache');
    const cached = await loadFromCache<CurrentWeather>(cacheKey);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Busca clima atual por coordenadas (com cache)
 */
async function getCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
  const cacheKey = getCacheKey(WEATHER_CACHE_KEY, lat, lng);

  try {
    const weather = await weatherAPI.getCurrentWeather(lat, lng);
    await saveToCache(cacheKey, weather);
    return weather;
  } catch (error) {
    console.warn('Failed to fetch weather from API, loading from cache');
    const cached = await loadFromCache<CurrentWeather>(cacheKey);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// ========== WEATHER FORECAST ==========

/**
 * Busca previsão do tempo (com cache)
 */
async function getForecast(
  lat: number,
  lng: number,
  days: number = 5,
): Promise<WeatherForecast> {
  const cacheKey = getCacheKey(FORECAST_CACHE_KEY, lat, lng) + `:${days}`;

  try {
    const forecast = await weatherAPI.getForecast(lat, lng, days);
    await saveToCache(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.warn('Failed to fetch forecast from API, loading from cache');
    const cached = await loadFromCache<WeatherForecast>(cacheKey);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Busca previsão de uma região (com cache)
 */
async function getRegionForecast(
  region: Region,
  days: number = 5,
): Promise<WeatherForecast> {
  const cacheKey =
    getCacheKey(FORECAST_CACHE_KEY, undefined, undefined, region) +
    `:${days}`;

  try {
    const forecast = await weatherAPI.getRegionForecast(region, days);
    await saveToCache(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.warn('Failed to fetch forecast from API, loading from cache');
    const cached = await loadFromCache<WeatherForecast>(cacheKey);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// ========== NAVIGATION SAFETY ==========

/**
 * Avalia segurança para navegação (com cache)
 */
async function getNavigationSafety(
  lat: number,
  lng: number,
): Promise<NavigationSafetyAssessment> {
  const cacheKey = getCacheKey(SAFETY_CACHE_KEY, lat, lng);

  try {
    const safety = await weatherAPI.getNavigationSafety(lat, lng);
    await saveToCache(cacheKey, safety);
    return safety;
  } catch (error) {
    console.warn('Failed to fetch safety from API, loading from cache');
    const cached = await loadFromCache<NavigationSafetyAssessment>(
      cacheKey,
    );

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Avalia segurança de uma região (com cache)
 */
async function getRegionNavigationSafety(
  region: Region,
): Promise<NavigationSafetyAssessment> {
  const cacheKey = getCacheKey(
    SAFETY_CACHE_KEY,
    undefined,
    undefined,
    region,
  );

  try {
    const safety = await weatherAPI.getRegionNavigationSafety(region);
    await saveToCache(cacheKey, safety);
    return safety;
  } catch (error) {
    console.warn('Failed to fetch safety from API, loading from cache');
    const cached = await loadFromCache<NavigationSafetyAssessment>(
      cacheKey,
    );

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// ========== WEATHER ALERTS ==========

/**
 * Busca alertas meteorológicos (sem cache - sempre busca fresh)
 */
async function getAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
  return await weatherAPI.getAlerts(lat, lng);
}

/**
 * Busca alertas de uma região (sem cache - sempre busca fresh)
 */
async function getRegionAlerts(region: Region): Promise<WeatherAlert[]> {
  return await weatherAPI.getRegionAlerts(region);
}

// ========== TRIP WEATHER ==========

/**
 * Clima específico de uma viagem (com cache curto de 10 min)
 */
async function getTripWeather(tripId: string): Promise<TripWeather> {
  const cacheKey = `${TRIP_WEATHER_CACHE_KEY}:${tripId}`;

  try {
    const tripWeather = await weatherAPI.getTripWeather(tripId);
    await saveToCache(cacheKey, tripWeather);
    return tripWeather;
  } catch (error) {
    const cached = await loadFromCache<TripWeather>(cacheKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// ========== RIVER LEVELS ==========

/**
 * Nível dos rios monitorados (com cache de 30 min)
 */
async function getRiverLevels(): Promise<RiverLevel[]> {
  const cacheKey = RIVER_LEVELS_CACHE_KEY;

  try {
    const levels = await weatherAPI.getRiverLevels();
    await saveToCache(cacheKey, levels);
    return levels;
  } catch {
    const cached = await loadFromCache<RiverLevel[]>(cacheKey);
    if (cached) {
      return cached;
    }
    return [];
  }
}

/**
 * Nível de um rio específico (sem cache — fresh)
 */
async function getRiverLevel(stationCode: string): Promise<RiverLevel> {
  return await weatherAPI.getRiverLevel(stationCode);
}

// ========== CACHE MANAGEMENT ==========

/**
 * Limpa todo o cache de clima
 */
async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const weatherKeys = keys.filter(
      key =>
        key.startsWith(WEATHER_CACHE_KEY) ||
        key.startsWith(FORECAST_CACHE_KEY) ||
        key.startsWith(SAFETY_CACHE_KEY),
    );

    await AsyncStorage.multiRemove(weatherKeys);
    console.log('Weather cache cleared');
  } catch (error) {
    console.error('Error clearing weather cache:', error);
  }
}

/**
 * Limpa cache expirado
 */
async function clearExpiredCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const weatherKeys = keys.filter(
      key =>
        key.startsWith(WEATHER_CACHE_KEY) ||
        key.startsWith(FORECAST_CACHE_KEY) ||
        key.startsWith(SAFETY_CACHE_KEY),
    );

    for (const key of weatherKeys) {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const cached = JSON.parse(stored);
        if (!isCacheValid(cached.timestamp)) {
          await AsyncStorage.removeItem(key);
        }
      }
    }

    console.log('Expired weather cache cleared');
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}

export const weatherService = {
  getRegionWeather,
  getCurrentWeather,
  getForecast,
  getRegionForecast,
  getNavigationSafety,
  getRegionNavigationSafety,
  getAlerts,
  getRegionAlerts,
  getTripWeather,
  getRiverLevels,
  getRiverLevel,
  clearCache,
  clearExpiredCache,
};
