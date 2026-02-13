import {api} from '@api';

import {CreateTripData, SearchTripsParams, Trip} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';

class TripAPI {
  async search(params: SearchTripsParams): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips', {params});
    return response;
  }

  async getById(id: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response;
  }

  async create(data: CreateTripData): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response;
  }

  async update(id: string, data: Partial<CreateTripData>): Promise<Trip> {
    const response = await api.put<Trip>(`/trips/${id}`, data);
    return response;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  }

  async getPopular(): Promise<PopularDestinationsResponse> {
    const response = await api.get<PopularDestinationsResponse>('/trips/popular');
    return response;
  }
}

export const tripAPI = new TripAPI();
