import {CreateTripRequest, Trip, UpdateLocationRequest} from '@types';

import {api} from './apiClient';

export const tripsApi = {
  async search(
    origin: string,
    destination: string,
    date?: string,
  ): Promise<Trip[]> {
    const params: any = {origin, destination};
    if (date) params.date = date;

    const response = await api.get<Trip[]>('/trips', {params});
    return response.data;
  },

  async getById(tripId: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${tripId}`);
    return response.data;
  },

  async create(data: CreateTripRequest): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response.data;
  },

  async update(tripId: string, data: Partial<CreateTripRequest>): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${tripId}`, data);
    return response.data;
  },

  async delete(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },

  async updateLocation(
    tripId: string,
    location: UpdateLocationRequest,
  ): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${tripId}/location`, location);
    return response.data;
  },
};
