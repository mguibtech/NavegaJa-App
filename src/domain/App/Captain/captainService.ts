import {captainAPI} from './captainAPI';
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
  return captainAPI.getMyTrips();
}

async function createTrip(data: CreateTripData): Promise<Trip> {
  return captainAPI.createTrip(data);
}

async function updateTripStatus(
  id: string,
  status: 'in_progress' | 'completed' | 'cancelled',
): Promise<Trip> {
  return captainAPI.updateTripStatus(id, status);
}

async function updateTripLocation(id: string, lat: number, lng: number): Promise<Trip> {
  return captainAPI.updateTripLocation(id, lat, lng);
}

async function getPassengers(tripId: string): Promise<TripPassenger[]> {
  return captainAPI.getPassengers(tripId);
}

async function getTripShipments(tripId: string): Promise<Shipment[]> {
  return captainAPI.getTripShipments(tripId);
}

// ─── Boats ────────────────────────────────────────────────────────────────
async function getMyBoats(): Promise<Boat[]> {
  return captainAPI.getMyBoats();
}

async function createBoat(data: CreateBoatData): Promise<Boat> {
  return captainAPI.createBoat(data);
}

async function updateBoat(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
  return captainAPI.updateBoat(id, data);
}

async function deleteBoat(id: string): Promise<void> {
  return captainAPI.deleteBoat(id);
}

// ─── Checklist ────────────────────────────────────────────────────────────
async function createChecklist(tripId: string): Promise<CaptainChecklist> {
  return captainAPI.createChecklist(tripId);
}

async function updateChecklist(id: string, data: UpdateChecklistData): Promise<CaptainChecklist> {
  return captainAPI.updateChecklist(id, data);
}

async function getChecklistByTrip(tripId: string): Promise<CaptainChecklist | null> {
  return captainAPI.getChecklistByTrip(tripId);
}

async function getChecklistStatus(tripId: string): Promise<CaptainChecklistStatusResponse> {
  return captainAPI.getChecklistStatus(tripId);
}

// ─── Weather & Safety ─────────────────────────────────────────────────────
async function getWeatherSafety(lat: number, lng: number): Promise<WeatherSafetyResponse> {
  return captainAPI.getWeatherSafety(lat, lng);
}

// ─── Shipments ────────────────────────────────────────────────────────────
async function getShipmentById(id: string): Promise<Shipment> {
  return captainAPI.getShipmentById(id);
}

async function collectShipment(
  id: string,
  validationCode: string,
  collectionPhotoUrl?: string,
): Promise<{shipment: Shipment; message: string}> {
  return captainAPI.collectShipment(id, validationCode, collectionPhotoUrl);
}

async function shipmentOutForDelivery(id: string): Promise<{shipment: Shipment; message: string}> {
  return captainAPI.shipmentOutForDelivery(id);
}

// ─── Earnings ─────────────────────────────────────────────────────────────
async function getEarnings(): Promise<EarningsResponse> {
  return captainAPI.getEarnings();
}

async function advancePayment(amount: number): Promise<AdvancePaymentResponse> {
  return captainAPI.advancePayment(amount);
}

export const captainService = {
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
