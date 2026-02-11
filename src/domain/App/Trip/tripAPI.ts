import {api} from '@api';

import {CreateTripData, SearchTripsParams, Trip} from './tripTypes';

class TripAPI {
  async search(params: SearchTripsParams): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips', {params});
    return response.data;
  }

  async getById(id: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  }

  async create(data: CreateTripData): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateTripData>): Promise<Trip> {
    const response = await api.put<Trip>(`/trips/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  }
}

export const tripAPI = new TripAPI();
