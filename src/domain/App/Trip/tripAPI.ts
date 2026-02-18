import {api} from '@api';

import {CreateTripData, SearchTripsParams, Trip, TripPassenger} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';
import {Shipment} from '../Shipment/shipmentTypes';

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

  // Captain-specific endpoints
  async getMyTrips(): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips/my-trips');
    return response;
  }

  async start(id: string): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${id}/start`);
    return response;
  }

  async complete(id: string): Promise<Trip> {
    const response = await api.patch<Trip>(`/trips/${id}/complete`);
    return response;
  }

  async getPassengers(id: string): Promise<TripPassenger[]> {
    const response = await api.get<TripPassenger[]>(`/trips/${id}/passengers`);
    return response;
  }

  async getTripShipments(id: string): Promise<Shipment[]> {
    const response = await api.get<Shipment[]>(`/trips/${id}/shipments`);
    return response;
  }
}

export const tripAPI = new TripAPI();
