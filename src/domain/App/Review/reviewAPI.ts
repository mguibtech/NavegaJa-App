import {api} from '@api';

import {
  CanReviewResponse,
  CreateCaptainReviewData,
  CreatePassengerReviewData,
  MyReviewsResponse,
  Review,
} from './reviewTypes';

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
  return api.get<Review[]>(`${PATH}/boat/${boatId}`);
}

async function getByCaptain(captainId: string): Promise<Review[]> {
  return api.get<Review[]>(`${PATH}/captain/${captainId}`);
}

async function getByTrip(tripId: string): Promise<Review[]> {
  return api.get<Review[]>(`${PATH}/trip/${tripId}`);
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
