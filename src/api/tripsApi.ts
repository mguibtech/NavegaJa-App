import {CreateTripRequest, Trip, TripStatus, UpdateLocationRequest} from '@types';

import {api} from './apiClient';

interface TripsQuery {
  route_id?: string;
  date?: string;
}

export const tripsApi = {
  async getAvailable(query?: TripsQuery): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips', {params: query});
    return response.data;
  },

  async getById(id: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  },

  async create(data: CreateTripRequest): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response.data;
  },

  async updateStatus(id: string, status: TripStatus): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${id}/status`, {status});
    return response.data;
  },

  async updateLocation(id: string, data: UpdateLocationRequest): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${id}/location`, data);
    return response.data;
  },

  async getCaptainTrips(): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips/captain/my-trips');
    return response.data;
  },
};
