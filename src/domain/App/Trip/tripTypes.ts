// Passenger info (returned by GET /trips/:id/passengers)
export interface TripPassenger {
  id: string;        // booking ID
  userId: string;
  name: string;      // passenger name
  phone: string;     // passenger phone
  quantity: number;  // seats booked
  status: string;    // booking status string
  checkedInAt: string | null;
  createdAt: string;
}

// Captain info (populated from backend)
export interface TripCaptain {
  id: string;
  name: string;
  phone: string;
  role: string;
  rating: string | number;
  totalTrips: number;
  totalPoints: number;
  level: string;
  email: string | null;
  avatarUrl: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
}

// Boat info (populated from backend)
export interface TripBoat {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  capacity: number;
  model: string | null;
  year: number | null;
  photoUrl: string | null;
  amenities: string[];
  photos: string[];
  registrationNum: string;
  isVerified: boolean;
  createdAt: string;
  currentLocation?: {lat: number; lng: number};
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;  // Changed from departureTime
  estimatedArrivalAt: string;  // Changed from arrivalTime
  price: number | string;  // Can be string from backend
  cargoPriceKg: number | string;
  availableSeats: number;
  totalSeats: number;
  status: TripStatus;
  routeId: string | null;
  currentLat: string | null;
  currentLng: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // Discount fields (populated by backend)
  discount?: number;  // Percentage discount (0-100)
  basePrice?: number;  // Original price before discount
  discountedPrice?: number;  // Price after discount
  hasPromotion?: boolean;  // Flag for UI to show promo badge

  // Populated relations
  captain?: TripCaptain;  // Optional: populated when searching trips
  captainId: string;
  boat?: TripBoat;  // Optional: populated when searching trips
  boatId: string;
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
  // Filtros opcionais
  minPrice?: number;
  maxPrice?: number;
  departureTime?: 'morning' | 'afternoon' | 'night';
  minRating?: number;
}

export interface CreateTripData {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  cargoPriceKg?: number;
  totalSeats: number;
  boatId: string;
}
