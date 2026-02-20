export enum ReviewType {
  PASSENGER_TO_CAPTAIN = 'passenger_to_captain',
  CAPTAIN_TO_PASSENGER = 'captain_to_passenger',
}

export interface ReviewUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Review {
  id: string;
  tripId: string;
  reviewerId: string;
  reviewedId: string;
  reviewType: ReviewType;
  // Passenger reviewing captain
  captainRating?: number;
  captainComment?: string;
  punctualityRating?: number;
  communicationRating?: number;
  // Passenger reviewing boat
  boatRating?: number;
  boatComment?: string;
  cleanlinessRating?: number;
  comfortRating?: number;
  boatPhotos?: string[];
  // Captain reviewing passenger
  passengerRating?: number;
  passengerComment?: string;
  // Populated relations (optional, depends on endpoint)
  reviewer?: ReviewUser;
  reviewed?: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  reason?: string;
  alreadyReviewed?: boolean;
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreatePassengerReviewData {
  tripId: string;
  captainRating: number;
  captainComment?: string;
  punctualityRating?: number;
  communicationRating?: number;
  boatRating?: number;
  boatComment?: string;
  cleanlinessRating?: number;
  comfortRating?: number;
  boatPhotos?: string[];
}

export interface CreateCaptainReviewData {
  tripId: string;
  passengerId: string;
  passengerRating: number;
  passengerComment?: string;
}

export interface MyReviewsResponse {
  given: Review[];
  received: Review[];
}
