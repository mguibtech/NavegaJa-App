export interface StopReview {
  id: string;
  locationName: string;
  rating: number;
  comment?: string;
  photos?: string[];
  authorName: string;
  authorId: string;
  createdAt: string;
}

export interface TopStopReview {
  locationName: string;
  avgRating: number;
  totalReviews: number;
}

export interface CreateStopReviewData {
  locationName: string;
  rating: number;
  comment?: string;
  photos?: string[];
  tripId?: string;
  lat?: number;
  lng?: number;
}
