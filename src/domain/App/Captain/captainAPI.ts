import {api} from '@api';

import {Trip, TripPassenger, CreateTripData} from '../Trip/tripTypes';
import {Shipment} from '../Shipment/shipmentTypes';
import {Boat, CreateBoatData} from '../Boat/boatTypes';
import {
  EarningsResponse,
  AdvancePaymentResponse,
  CaptainChecklist,
  UpdateChecklistData,
  CaptainChecklistStatusResponse,
  WeatherSafetyResponse,
} from './captainTypes';

// ─── Trips ────────────────────────────────────────────────────────────────
async function getMyTrips(): Promise<Trip[]> {
  return api.get<Trip[]>('/trips/captain/my-trips');
}

async function createTrip(data: CreateTripData): Promise<Trip> {
  return api.post<Trip>('/trips', data);
}

async function updateTripStatus(
  id: string,
  status: 'in_progress' | 'completed' | 'cancelled',
): Promise<Trip> {
  return api.patch<Trip>(`/trips/${id}/status`, {status});
}

async function updateTripLocation(id: string, lat: number, lng: number): Promise<Trip> {
  return api.patch<Trip>(`/trips/${id}/location`, {lat, lng});
}

async function getPassengers(tripId: string): Promise<TripPassenger[]> {
  return api.get<TripPassenger[]>(`/trips/${tripId}/passengers`);
}

async function getTripShipments(tripId: string): Promise<Shipment[]> {
  // Shipments are returned inside the trip detail
  const trip = await api.get<Trip & {shipments: Shipment[]}>(`/trips/${tripId}`);
  return (trip as any).shipments ?? [];
}

// ─── Boats ────────────────────────────────────────────────────────────────
async function getMyBoats(): Promise<Boat[]> {
  return api.get<Boat[]>('/boats/my-boats');
}

async function createBoat(data: CreateBoatData): Promise<Boat> {
  return api.post<Boat>('/boats', data);
}

async function updateBoat(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
  return api.patch<Boat>(`/boats/${id}`, data);
}

async function deleteBoat(id: string): Promise<void> {
  return api.delete(`/boats/${id}`);
}

// ─── Checklist ────────────────────────────────────────────────────────────
async function createChecklist(tripId: string): Promise<CaptainChecklist> {
  return api.post<CaptainChecklist>('/safety/checklists', {tripId});
}

async function updateChecklist(
  id: string,
  data: UpdateChecklistData,
): Promise<CaptainChecklist> {
  return api.patch<CaptainChecklist>(`/safety/checklists/${id}`, data);
}

async function getChecklistByTrip(tripId: string): Promise<CaptainChecklist | null> {
  return api.get<CaptainChecklist | null>(`/safety/checklists/trip/${tripId}`);
}

async function getChecklistStatus(tripId: string): Promise<CaptainChecklistStatusResponse> {
  return api.get<CaptainChecklistStatusResponse>(
    `/safety/checklists/trip/${tripId}/status`,
  );
}

// ─── Weather & Safety ─────────────────────────────────────────────────────
async function getWeatherSafety(lat: number, lng: number): Promise<WeatherSafetyResponse> {
  return api.get<WeatherSafetyResponse>(
    `/safety/weather-safety?lat=${lat}&lng=${lng}`,
  );
}

// ─── Shipments ────────────────────────────────────────────────────────────
async function getShipmentById(id: string): Promise<Shipment> {
  return api.get<Shipment>(`/shipments/${id}`);
}

async function collectShipment(
  id: string,
  validationCode: string,
  collectionPhotoUrl?: string,
): Promise<{shipment: Shipment; message: string}> {
  return api.post(`/shipments/${id}/collect`, {
    validationCode,
    ...(collectionPhotoUrl ? {collectionPhotoUrl} : {}),
  });
}

async function shipmentOutForDelivery(id: string): Promise<{shipment: Shipment; message: string}> {
  return api.post(`/shipments/${id}/out-for-delivery`, {});
}

// ─── Earnings ─────────────────────────────────────────────────────────────
async function getEarnings(): Promise<EarningsResponse> {
  return api.get<EarningsResponse>('/captain/earnings');
}

async function advancePayment(amount: number): Promise<AdvancePaymentResponse> {
  return api.post<AdvancePaymentResponse>('/captain/advance-payment', {amount});
}

export const captainAPI = {
  getMyTrips,
  createTrip,
  updateTripStatus,
  updateTripLocation,
  getPassengers,
  getTripShipments,
  getMyBoats,
  createBoat,
  updateBoat,
  deleteBoat,
  createChecklist,
  updateChecklist,
  getChecklistByTrip,
  getChecklistStatus,
  getWeatherSafety,
  getShipmentById,
  collectShipment,
  shipmentOutForDelivery,
  getEarnings,
  advancePayment,
};
