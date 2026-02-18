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

class CaptainAPI {
  // ─── Trips ────────────────────────────────────────────────────────────────
  async getMyTrips(): Promise<Trip[]> {
    return api.get<Trip[]>('/trips/captain/my-trips');
  }

  async createTrip(data: CreateTripData): Promise<Trip> {
    return api.post<Trip>('/trips', data);
  }

  async updateTripStatus(
    id: string,
    status: 'in_progress' | 'completed' | 'cancelled',
  ): Promise<Trip> {
    return api.patch<Trip>(`/trips/${id}/status`, {status});
  }

  async updateTripLocation(id: string, lat: number, lng: number): Promise<Trip> {
    return api.patch<Trip>(`/trips/${id}/location`, {lat, lng});
  }

  async getPassengers(tripId: string): Promise<TripPassenger[]> {
    return api.get<TripPassenger[]>(`/trips/${tripId}/passengers`);
  }

  async getTripShipments(tripId: string): Promise<Shipment[]> {
    // Shipments are returned inside the trip detail
    const trip = await api.get<Trip & {shipments: Shipment[]}>(`/trips/${tripId}`);
    return (trip as any).shipments ?? [];
  }

  // ─── Boats ────────────────────────────────────────────────────────────────
  async getMyBoats(): Promise<Boat[]> {
    return api.get<Boat[]>('/boats/my-boats');
  }

  async createBoat(data: CreateBoatData): Promise<Boat> {
    return api.post<Boat>('/boats', data);
  }

  async updateBoat(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
    return api.put<Boat>(`/boats/${id}`, data);
  }

  async deleteBoat(id: string): Promise<void> {
    return api.delete(`/boats/${id}`);
  }

  // ─── Checklist ────────────────────────────────────────────────────────────
  async createChecklist(tripId: string): Promise<CaptainChecklist> {
    return api.post<CaptainChecklist>('/safety/checklists', {tripId});
  }

  async updateChecklist(
    id: string,
    data: UpdateChecklistData,
  ): Promise<CaptainChecklist> {
    return api.patch<CaptainChecklist>(`/safety/checklists/${id}`, data);
  }

  async getChecklistByTrip(tripId: string): Promise<CaptainChecklist | null> {
    return api.get<CaptainChecklist | null>(`/safety/checklists/trip/${tripId}`);
  }

  async getChecklistStatus(tripId: string): Promise<CaptainChecklistStatusResponse> {
    return api.get<CaptainChecklistStatusResponse>(
      `/safety/checklists/trip/${tripId}/status`,
    );
  }

  // ─── Weather & Safety ─────────────────────────────────────────────────────
  async getWeatherSafety(lat: number, lng: number): Promise<WeatherSafetyResponse> {
    return api.get<WeatherSafetyResponse>(
      `/safety/weather-safety?lat=${lat}&lng=${lng}`,
    );
  }

  // ─── Shipments ────────────────────────────────────────────────────────────
  async getShipmentById(id: string): Promise<Shipment> {
    return api.get<Shipment>(`/shipments/${id}`);
  }

  async collectShipment(
    id: string,
    validationCode: string,
    collectionPhotoUrl?: string,
  ): Promise<{shipment: Shipment; message: string}> {
    return api.post(`/shipments/${id}/collect`, {
      validationCode,
      ...(collectionPhotoUrl ? {collectionPhotoUrl} : {}),
    });
  }

  async shipmentOutForDelivery(id: string): Promise<{shipment: Shipment; message: string}> {
    return api.post(`/shipments/${id}/out-for-delivery`, {});
  }

  // ─── Earnings ─────────────────────────────────────────────────────────────
  async getEarnings(): Promise<EarningsResponse> {
    return api.get<EarningsResponse>('/captain/earnings');
  }

  async advancePayment(amount: number): Promise<AdvancePaymentResponse> {
    return api.post<AdvancePaymentResponse>('/captain/advance-payment', {amount});
  }
}

export const captainAPI = new CaptainAPI();
