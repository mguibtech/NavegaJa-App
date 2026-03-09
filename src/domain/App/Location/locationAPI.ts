import {api} from '../../../api';

import {CepResult, City, LocationLabel, LocationSuggestion, ReverseGeocode, SuggestLocationPayload} from './locationTypes';

export const locationAPI = {
  async getCep(cep: string): Promise<CepResult> {
    const clean = cep.replace(/\D/g, '');
    return api.get<CepResult>(`/locations/cep/${clean}`);
  },

  async getCities(uf = 'AM'): Promise<City[]> {
    const url = uf === 'AM' ? '/locations/cities' : `/locations/cities/${uf}`;
    return api.get<City[]>(url);
  },

  async getLocationLabel(lat: number, lng: number): Promise<LocationLabel> {
    return api.get<LocationLabel>(`/locations/location-label?lat=${lat}&lng=${lng}`);
  },

  async getReverseGeocode(lat: number, lng: number): Promise<ReverseGeocode> {
    return api.get<ReverseGeocode>(`/locations/reverse-geocode?lat=${lat}&lng=${lng}`);
  },

  /** Geocoding: busca sugestões de localização por texto livre */
  async searchLocations(q: string): Promise<LocationSuggestion[]> {
    return api.get<LocationSuggestion[]>(`/trips/geocode?q=${encodeURIComponent(q)}`);
  },

  /** Sugere nova localização para o banco de dados do sistema */
  async suggestLocation(data: SuggestLocationPayload): Promise<void> {
    return api.post<void>('/locations/suggest', data);
  },
};
