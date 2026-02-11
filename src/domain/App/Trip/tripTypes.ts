export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  boatId: string;
  captainId: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface SearchTripsParams {
  origin: string;
  destination: string;
  date?: string;
}

export interface CreateTripData {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  boatId: string;
}
