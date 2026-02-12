// ========================================
// ENUMS
// ========================================

export type TripStatus = 'scheduled' | 'boarding' | 'sailing' | 'arrived' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card';
export type UserRole = 'passenger' | 'captain' | 'admin';
export type LoyaltyLevel = 'Marinheiro' | 'Navegador' | 'Capitão' | 'Almirante';
export type BoatType = 'lancha' | 'voadeira' | 'balsa' | 'recreio';

// ========================================
// USER & AUTH
// ========================================

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  role: UserRole;
  rating: string;
  totalTrips: number;
  totalPoints: number;
  level: LoyaltyLevel;
  referralCode: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: UserRole;
  cpf?: string;
  referralCode?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// ========================================
// ROUTE
// ========================================

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
}

// ========================================
// BOAT
// ========================================

export interface Boat {
  id: string;
  captainId: string;
  name: string;
  type: BoatType;
  capacity: number;
  model: string | null;
  year: number | null;
  photoUrl: string | null;
  amenities: string[];
  photos: string[];
  registrationNum: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatRequest {
  name: string;
  type: BoatType;
  capacity: number;
  model?: string;
  year?: number;
  photoUrl?: string;
  amenities?: string[];
  photos?: string[];
  registrationNum?: string;
}

// ========================================
// CAPTAIN
// ========================================

export interface Captain {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  rating: string;
  totalTrips: number;
  avatarUrl: string | null;
}

// ========================================
// TRIP
// ========================================

export interface Trip {
  id: string;
  captainId: string;
  boatId: string;
  routeId: string;
  departureAt: string;
  estimatedArrivalAt: string;
  price: string;
  cargoPriceKg: string | null;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  currentLat: string | null;
  currentLng: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  captain?: Captain;
  boat?: Boat;
  route?: Route;
  reviews?: Review[];
  bookings?: Booking[];
}

export interface CreateTripRequest {
  routeId: string;
  boatId: string;
  departureAt: string;
  price: number;
  cargoPriceKg?: number;
  totalSeats: number;
  notes?: string;
}

export interface UpdateTripStatusRequest {
  status: TripStatus;
}

export interface UpdateTripLocationRequest {
  lat: number;
  lng: number;
}

// ========================================
// BOOKING
// ========================================

export interface Booking {
  id: string;
  passengerId: string;
  tripId: string;
  seats: number;
  totalPrice: string;
  status: BookingStatus;
  qrCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  passenger?: User;
  trip?: Trip;
}

export interface CreateBookingRequest {
  tripId: string;
  seats?: number;
  paymentMethod?: PaymentMethod;
}

// ========================================
// TRACKING
// ========================================

export interface TrackingTimeline {
  status: TripStatus;
  label: string;
  active: boolean;
}

export interface TrackingResponse {
  bookingId: string;
  bookingStatus: BookingStatus;
  qrCode: string;
  trip: {
    id: string;
    status: TripStatus;
    departureAt: string;
    estimatedArrivalAt: string;
    currentLat: number | null;
    currentLng: number | null;
  };
  route: {
    originName: string;
    originLat: string;
    originLng: string;
    destinationName: string;
    destinationLat: string;
    destinationLng: string;
    distanceKm: string;
    durationMin: number;
  };
  captain: {
    id: string;
    name: string;
    phone: string;
    rating: string;
    avatarUrl: string | null;
  };
  boat: {
    id: string;
    name: string;
    type: BoatType;
    photoUrl: string | null;
  };
  progress: number;
  timeline: TrackingTimeline[];
}

// ========================================
// REVIEW
// ========================================

export interface Review {
  id: string;
  reviewerId: string;
  tripId: string;
  captainId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateReviewRequest {
  tripId: string;
  captainId: string;
  rating: number;
  comment?: string;
}

// ========================================
// GAMIFICATION
// ========================================

export interface GamificationStats {
  totalPoints: number;
  level: LoyaltyLevel;
  nextLevel: LoyaltyLevel | null;
  pointsToNextLevel: number;
  discount: number;
}

export interface PointsHistory {
  id: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  level: LoyaltyLevel;
  avatarUrl: string | null;
}

// ========================================
// PAGINATION
// ========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ========================================
// API ERROR
// ========================================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ========================================
// API RESPONSE WRAPPER
// ========================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
