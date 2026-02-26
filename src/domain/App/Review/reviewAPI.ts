import {api} from '@api';

import {
  CanReviewResponse,
  CreateCaptainReviewData,
  CreatePassengerReviewData,
  MyReviewsResponse,
  Review,
} from './reviewTypes';

// Backend pode retornar array direto OU { reviews: Review[]; stats: {...} }
function extractReviews(data: unknown): Review[] {
  if (Array.isArray(data)) {
    return data as Review[];
  }
  if (data && typeof data === 'object' && 'reviews' in data) {
    const arr = (data as {reviews: unknown}).reviews;
    return Array.isArray(arr) ? (arr as Review[]) : [];
  }
  return [];
}

const PATH = '/reviews';

async function create(data: CreatePassengerReviewData): Promise<Review> {
  return api.post<Review>(PATH, data);
}

async function captainReviewPassenger(data: CreateCaptainReviewData): Promise<Review> {
  return api.post<Review>(`${PATH}/captain-review`, data);
}

async function canReview(tripId: string): Promise<CanReviewResponse> {
  return api.get<CanReviewResponse>(`${PATH}/can-review/${tripId}`);
}

async function getMyReviews(): Promise<MyReviewsResponse> {
  return api.get<MyReviewsResponse>(`${PATH}/my`);
}

async function getByBoat(boatId: string): Promise<Review[]> {
  const data = await api.get<unknown>(`${PATH}/boat/${boatId}`);
  return extractReviews(data);
}

async function getByCaptain(captainId: string): Promise<Review[]> {
  const data = await api.get<unknown>(`${PATH}/captain/${captainId}`);
  return extractReviews(data);
}

async function getByTrip(tripId: string): Promise<Review[]> {
  const data = await api.get<unknown>(`${PATH}/trip/${tripId}`);
  return extractReviews(data);
}

export const reviewAPI = {
  create,
  captainReviewPassenger,
  canReview,
  getMyReviews,
  getByBoat,
  getByCaptain,
  getByTrip,
};
