export interface Review {
  id: string;
  tripId: string;
  passengerId: string;
  captainId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  tripId: string;
  rating: number;
  comment?: string;
}
