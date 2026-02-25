import {api} from '@api';

import {CreateTripData, SearchTripsParams, Trip, TripPassenger} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';
import {Shipment} from '../Shipment/shipmentTypes';

async function search(params: SearchTripsParams): Promise<Trip[]> {
  const response = await api.get<Trip[]>('/trips', {params});
  return response;
}

async function getById(id: string): Promise<Trip> {
  const response = await api.get<Trip>(`/trips/${id}`);
  return response;
}

async function create(data: CreateTripData): Promise<Trip> {
  const response = await api.post<Trip>('/trips', data);
  return response;
}

async function update(id: string, data: Partial<CreateTripData>): Promise<Trip> {
  const response = await api.put<Trip>(`/trips/${id}`, data);
  return response;
}

async function deleteTrip(id: string): Promise<void> {
  await api.delete(`/trips/${id}`);
}

async function getPopular(): Promise<PopularDestinationsResponse> {
  const response = await api.get<PopularDestinationsResponse>('/trips/popular');
  return response;
}

// Captain-specific endpoints
async function getMyTrips(): Promise<Trip[]> {
  const response = await api.get<Trip[]>('/trips/my-trips');
  return response;
}

async function start(id: string): Promise<Trip> {
  const response = await api.patch<Trip>(`/trips/${id}/start`);
  return response;
}

async function complete(id: string): Promise<Trip> {
  const response = await api.patch<Trip>(`/trips/${id}/complete`);
  return response;
}

async function getPassengers(id: string): Promise<TripPassenger[]> {
  const response = await api.get<TripPassenger[]>(`/trips/${id}/passengers`);
  return response;
}

async function getTripShipments(id: string): Promise<Shipment[]> {
  const response = await api.get<Shipment[]>(`/trips/${id}/shipments`);
  return response;
}

export const tripAPI = {
  search,
  getById,
  create,
  update,
  delete: deleteTrip,
  getPopular,
  getMyTrips,
  start,
  complete,
  getPassengers,
  getTripShipments,
};
