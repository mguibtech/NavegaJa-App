// ── Enums ──────────────────────────────────────────────

export enum UserRole {
  PASSENGER = 'passenger',
  CAPTAIN = 'captain',
  ADMIN = 'admin',
}

export enum TripStatus {
  SCHEDULED = 'scheduled',
  BOARDING = 'boarding',
  SAILING = 'sailing',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum ShipmentStatus {
  POSTED = 'posted',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum BoatType {
  LANCHA = 'lancha',
  VOADEIRA = 'voadeira',
  BALSA = 'balsa',
  RECREIO = 'recreio',
}

// ── Interfaces ─────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl: string | null;
  rating: string;
  totalTrips: number;
  createdAt: string;
  updatedAt: string;
  boats?: Boat[];
}

export interface Boat {
  id: string;
  ownerId: string;
  name: string;
  type: BoatType;
  capacity: number;
  photoUrl: string | null;
  registrationNum: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Route {
  id: string;
  originName: string;
  originLat: string;
  originLng: string;
  destinationName: string;
  destinationLat: string;
  destinationLng: string;
  distanceKm: string;
  durationMin: number;
  createdAt: string;
}

export interface Trip {
  id: string;
  captainId: string;
  captain?: User;
  boatId: string;
  boat?: Boat;
  routeId: string;
  route?: Route;
  departureAt: string;
  estimatedArrivalAt: string | null;
  price: string;
  cargoPriceKg: string;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  currentLat: string | null;
  currentLng: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  passengerId: string;
  passenger?: User;
  tripId: string;
  trip?: Trip;
  seats: number;
  totalPrice: string | number;
  status: BookingStatus;
  qrCode: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  senderId: string;
  sender?: User;
  tripId: string;
  trip?: Trip;
  description: string;
  weightKg: string;
  photoUrl: string | null;
  receiverName: string;
  receiverPhone: string;
  totalPrice: string;
  status: ShipmentStatus;
  deliveryPhotoUrl: string | null;
  deliveredAt: string | null;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer?: User;
  tripId: string;
  trip?: Trip;
  captainId: string;
  captain?: User;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ── Auth ───────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  role?: UserRole;
}

// ── API requests ───────────────────────────────────────

export interface CreateTripRequest {
  routeId: string;
  boatId: string;
  departureAt: string;
  price: number;
  cargoPriceKg: number;
  totalSeats: number;
  notes?: string;
}

export interface CreateBookingRequest {
  tripId: string;
  seats: number;
  paymentMethod: string;
}

export interface CreateShipmentRequest {
  tripId: string;
  description: string;
  weightKg: number;
  receiverName: string;
  receiverPhone: string;
  photoUrl?: string | null;
}

export interface CreateReviewRequest {
  tripId: string;
  captainId: string;
  rating: number;
  comment?: string;
}

export interface CreateBoatRequest {
  name: string;
  type: BoatType;
  capacity: number;
  photoUrl?: string | null;
  registrationNum?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UpdateLocationRequest {
  lat: number;
  lng: number;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}
