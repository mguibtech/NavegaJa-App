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
} from './weatherTypes';

const WEATHER_CACHE_KEY = '@navegaja:weather_cache';
const FORECAST_CACHE_KEY = '@navegaja:forecast_cache';
const SAFETY_CACHE_KEY = '@navegaja:safety_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (igual ao backend)

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class WeatherService {
  // ========== CACHE HELPERS ==========

  /**
   * Verifica se o cache ainda é válido
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  /**
   * Gera chave de cache única
   */
  private getCacheKey(
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
  private async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Carrega dados do cache
   */
  private async loadFromCache<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const cached: CachedData<T> = JSON.parse(stored);

      if (!this.isCacheValid(cached.timestamp)) {
        // Cache expirado, remover
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }

  // ========== CURRENT WEATHER ==========

  /**
   * Busca clima atual de uma região (com cache)
   */
  async getRegionWeather(region: Region): Promise<CurrentWeather> {
    const cacheKey = this.getCacheKey(WEATHER_CACHE_KEY, undefined, undefined, region);

    try {
      // Tenta buscar da API
      const weather = await weatherAPI.getRegionWeather(region);

      // Salva no cache
      await this.saveToCache(cacheKey, weather);

      return weather;
    } catch (error) {
      // Se falhar, tenta carregar do cache
      console.warn('Failed to fetch weather from API, loading from cache');
      const cached = await this.loadFromCache<CurrentWeather>(cacheKey);

      if (cached) {
        return cached;
      }

      throw error;
    }
  }

  /**
   * Busca clima atual por coordenadas (com cache)
   */
  async getCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
    const cacheKey = this.getCacheKey(WEATHER_CACHE_KEY, lat, lng);

    try {
      const weather = await weatherAPI.getCurrentWeather(lat, lng);
      await this.saveToCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.warn('Failed to fetch weather from API, loading from cache');
      const cached = await this.loadFromCache<CurrentWeather>(cacheKey);

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
  async getForecast(
    lat: number,
    lng: number,
    days: number = 5,
  ): Promise<WeatherForecast> {
    const cacheKey = this.getCacheKey(FORECAST_CACHE_KEY, lat, lng) + `:${days}`;

    try {
      const forecast = await weatherAPI.getForecast(lat, lng, days);
      await this.saveToCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.warn('Failed to fetch forecast from API, loading from cache');
      const cached = await this.loadFromCache<WeatherForecast>(cacheKey);

      if (cached) {
        return cached;
      }

      throw error;
    }
  }

  /**
   * Busca previsão de uma região (com cache)
   */
  async getRegionForecast(
    region: Region,
    days: number = 5,
  ): Promise<WeatherForecast> {
    const cacheKey =
      this.getCacheKey(FORECAST_CACHE_KEY, undefined, undefined, region) +
      `:${days}`;

    try {
      const forecast = await weatherAPI.getRegionForecast(region, days);
      await this.saveToCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.warn('Failed to fetch forecast from API, loading from cache');
      const cached = await this.loadFromCache<WeatherForecast>(cacheKey);

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
  async getNavigationSafety(
    lat: number,
    lng: number,
  ): Promise<NavigationSafetyAssessment> {
    const cacheKey = this.getCacheKey(SAFETY_CACHE_KEY, lat, lng);

    try {
      const safety = await weatherAPI.getNavigationSafety(lat, lng);
      await this.saveToCache(cacheKey, safety);
      return safety;
    } catch (error) {
      console.warn('Failed to fetch safety from API, loading from cache');
      const cached = await this.loadFromCache<NavigationSafetyAssessment>(
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
  async getRegionNavigationSafety(
    region: Region,
  ): Promise<NavigationSafetyAssessment> {
    const cacheKey = this.getCacheKey(
      SAFETY_CACHE_KEY,
      undefined,
      undefined,
      region,
    );

    try {
      const safety = await weatherAPI.getRegionNavigationSafety(region);
      await this.saveToCache(cacheKey, safety);
      return safety;
    } catch (error) {
      console.warn('Failed to fetch safety from API, loading from cache');
      const cached = await this.loadFromCache<NavigationSafetyAssessment>(
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
  async getAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
    return await weatherAPI.getAlerts(lat, lng);
  }

  /**
   * Busca alertas de uma região (sem cache - sempre busca fresh)
   */
  async getRegionAlerts(region: Region): Promise<WeatherAlert[]> {
    return await weatherAPI.getRegionAlerts(region);
  }

  // ========== CACHE MANAGEMENT ==========

  /**
   * Limpa todo o cache de clima
   */
  async clearCache(): Promise<void> {
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
  async clearExpiredCache(): Promise<void> {
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
          if (!this.isCacheValid(cached.timestamp)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }

      console.log('Expired weather cache cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

export const weatherService = new WeatherService();
