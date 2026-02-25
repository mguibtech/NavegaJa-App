/**
 * Weather API
 * Endpoints para sistema de clima em tempo real
 */

import {api} from '../../../api';
import {
  CurrentWeather,
  WeatherForecast,
  NavigationSafetyAssessment,
  WeatherAlert,
  Region,
} from './weatherTypes';

// ========== CURRENT WEATHER ==========

/**
 * GET /weather/region/:region
 * Busca clima atual de uma região específica
 * @param region - Nome da região (ex: "manaus", "parintins")
 */
async function getRegionWeather(region: Region): Promise<CurrentWeather> {
  const response = await api.get<CurrentWeather>(
    `/weather/region/${region}`,
  );
  return response;
}

/**
 * GET /weather/current?lat=X&lng=Y
 * Busca clima atual por coordenadas GPS
 * @param lat - Latitude
 * @param lng - Longitude
 */
async function getCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
  const response = await api.get<CurrentWeather>('/weather/current', {
    params: {lat, lng},
  });
  return response;
}

// ========== WEATHER FORECAST ==========

/**
 * GET /weather/forecast?lat=X&lng=Y&days=5
 * Busca previsão do tempo (padrão: 5 dias)
 * @param lat - Latitude
 * @param lng - Longitude
 * @param days - Número de dias (padrão: 5)
 */
async function getForecast(
  lat: number,
  lng: number,
  days: number = 5,
): Promise<WeatherForecast> {
  const response = await api.get<WeatherForecast>('/weather/forecast', {
    params: {lat, lng, days},
  });
  return response;
}

/**
 * GET /weather/region/:region/forecast?days=5
 * Busca previsão de uma região específica
 * @param region - Nome da região
 * @param days - Número de dias (padrão: 5)
 */
async function getRegionForecast(
  region: Region,
  days: number = 5,
): Promise<WeatherForecast> {
  const response = await api.get<WeatherForecast>(
    `/weather/region/${region}/forecast`,
    {
      params: {days},
    },
  );
  return response;
}

// ========== NAVIGATION SAFETY ==========

/**
 * GET /weather/navigation-safety?lat=X&lng=Y
 * Avalia segurança para navegação baseado no clima
 * @param lat - Latitude
 * @param lng - Longitude
 */
async function getNavigationSafety(
  lat: number,
  lng: number,
): Promise<NavigationSafetyAssessment> {
  const response = await api.get<NavigationSafetyAssessment>(
    '/weather/navigation-safety',
    {
      params: {lat, lng},
    },
  );
  return response;
}

/**
 * GET /weather/region/:region/navigation-safety
 * Avalia segurança para navegação de uma região
 * @param region - Nome da região
 */
async function getRegionNavigationSafety(
  region: Region,
): Promise<NavigationSafetyAssessment> {
  const response = await api.get<NavigationSafetyAssessment>(
    `/weather/region/${region}/navigation-safety`,
  );
  return response;
}

// ========== WEATHER ALERTS ==========

/**
 * GET /weather/alerts?lat=X&lng=Y
 * Busca alertas meteorológicos para uma localização
 * @param lat - Latitude
 * @param lng - Longitude
 */
async function getAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
  try {
    const response = await api.get<WeatherAlert[]>('/weather/alerts', {
      params: {lat, lng},
    });
    return response;
  } catch (error: any) {
    // Se não houver alertas, retorna array vazio
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * GET /weather/region/:region/alerts
 * Busca alertas meteorológicos de uma região
 * @param region - Nome da região
 */
async function getRegionAlerts(region: Region): Promise<WeatherAlert[]> {
  try {
    const response = await api.get<WeatherAlert[]>(
      `/weather/region/${region}/alerts`,
    );
    return response;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

// ========== HISTORICAL DATA (OPCIONAL) ==========

/**
 * GET /weather/history?lat=X&lng=Y&date=YYYY-MM-DD
 * Busca dados históricos de clima (se disponível)
 * @param lat - Latitude
 * @param lng - Longitude
 * @param date - Data no formato YYYY-MM-DD
 */
async function getHistorical(
  lat: number,
  lng: number,
  date: string,
): Promise<CurrentWeather> {
  const response = await api.get<CurrentWeather>('/weather/history', {
    params: {lat, lng, date},
  });
  return response;
}

export const weatherAPI = {
  getRegionWeather,
  getCurrentWeather,
  getForecast,
  getRegionForecast,
  getNavigationSafety,
  getRegionNavigationSafety,
  getAlerts,
  getRegionAlerts,
  getHistorical,
};
