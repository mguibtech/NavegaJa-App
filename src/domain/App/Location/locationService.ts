import AsyncStorage from '@infra/storage';

import {locationAPI} from './locationAPI';
import {CepResult, City, LocationLabel, AM_CITIES_FALLBACK} from './locationTypes';

const CITIES_CACHE_KEY = 'location_cities_am';
const CITIES_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const LABEL_CACHE_PREFIX = 'location_label_';
const LABEL_TTL_MS = 30 * 60 * 1000; // 30min

export const locationService = {
  /** Lista de municípios do AM — cache 24h, fallback para lista estática */
  async getCities(): Promise<City[]> {
    try {
      const raw = await AsyncStorage.getItem(CITIES_CACHE_KEY);
      if (raw) {
        const {data, ts} = JSON.parse(raw) as {data: City[]; ts: number};
        if (Date.now() - ts < CITIES_TTL_MS) {
          return data;
        }
      }
    } catch {}

    const data = await locationAPI.getCities();

    try {
      await AsyncStorage.setItem(
        CITIES_CACHE_KEY,
        JSON.stringify({data, ts: Date.now()}),
      );
    } catch {}

    return data;
  },

  /** Busca CEP — sem cache (dado pode mudar e raramente é consultado) */
  async getCep(cep: string): Promise<CepResult> {
    return locationAPI.getCep(cep);
  },

  /** Label de posição — cache 30min por coordenadas arredondadas a 3 casas */
  async getLocationLabel(lat: number, lng: number): Promise<LocationLabel> {
    const key = `${LABEL_CACHE_PREFIX}${lat.toFixed(3)}_${lng.toFixed(3)}`;

    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const {data, ts} = JSON.parse(raw) as {data: LocationLabel; ts: number};
        if (Date.now() - ts < LABEL_TTL_MS) {
          return data;
        }
      }
    } catch {}

    const data = await locationAPI.getLocationLabel(lat, lng);

    try {
      await AsyncStorage.setItem(key, JSON.stringify({data, ts: Date.now()}));
    } catch {}

    return data;
  },

  /** Cidades de fallback como City[] (sem ibge) — para uso offline */
  getFallbackCities(): City[] {
    return AM_CITIES_FALLBACK.map(nome => ({nome, codigoIbge: ''}));
  },
};
