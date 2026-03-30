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
  // Campos extras retornados pelo GET /trips/:id
  rating?: string | number;
  reviewCount?: number;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;  // Changed from departureTime
  estimatedArrivalAt: string;  // Changed from arrivalTime
  price: number | string;  // Can be string from backend
  cargoPriceKg: number | string | null;
  acceptsShipments?: boolean;
  shipmentPricePerKg?: number | string | null;
  shipmentCapacityKg?: number | null;
  availableShipmentCapacityKg?: number | null;
  availableSeats: number;
  totalSeats: number;
  status: TripStatus;
  routeId: string | null;
  currentLat: string | null;
  currentLng: string | null;
  // Geocoding coordinates (set when trip is created via SearchableLocationInput)
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
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
  boatId: string | null;
  boatImageUrl?: string | null;
  boatImages?: string[];
}

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ── Manage endpoint (GET /trips/:id/manage) ──────────────────────────────────

export interface TripManagePassenger {
  bookingId: string;
  status: string;
  paymentStatus?: string;
  seats: number;
  seatNumber?: number | null;
  totalPrice: number;
  createdAt?: string;
  checkedInAt?: string | null;
  childrenCount?: number;
  childrenAges?: number[] | null;
  passenger: {
    id?: string;
    name: string;
    phone: string;
    avatarUrl?: string | null;
    passengerRating?: number | null;
  } | null;
}

export interface TripManageShipment {
  id?: string;
  trackingCode: string;
  validationCode?: string | null;
  status: string;
  description?: string | null;
  weightKg?: number;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string | null;
  senderName?: string;
  totalPrice?: number;
  paidBy?: 'sender' | 'recipient' | string;
  collectionPhotoUrl?: string | null;
  deliveryPhotoUrl?: string | null;
  createdAt?: string;
}

export interface TripManageData {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  estimatedArrivalAt: string;
  price: number | string;
  cargoPriceKg?: number | string | null;
  acceptsShipments?: boolean;
  shipmentPricePerKg?: number | string | null;
  shipmentCapacityKg?: number | null;
  availableShipmentCapacityKg?: number | null;
  availableSeats: number;
  totalSeats: number;
  status: TripStatus;
  notes?: string | null;
  passageiros: TripManagePassenger[];
  encomendas: TripManageShipment[];
  totalPassageiros: number;
  totalEncomendas: number;
}

export interface SearchTripsParams {
  routeId?: string | null;
  origin?: string;
  destination?: string;
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
