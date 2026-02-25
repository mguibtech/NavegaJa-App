import {reviewAPI} from './reviewAPI';
import {
  CanReviewResponse,
  CreateCaptainReviewData,
  CreatePassengerReviewData,
  MyReviewsResponse,
  Review,
} from './reviewTypes';

async function create(data: CreatePassengerReviewData): Promise<Review> {
  return reviewAPI.create(data);
}

async function captainReviewPassenger(data: CreateCaptainReviewData): Promise<Review> {
  return reviewAPI.captainReviewPassenger(data);
}

async function canReview(tripId: string): Promise<CanReviewResponse> {
  return reviewAPI.canReview(tripId);
}

async function getMyReviews(): Promise<MyReviewsResponse> {
  return reviewAPI.getMyReviews();
}

async function getByBoat(boatId: string): Promise<Review[]> {
  return reviewAPI.getByBoat(boatId);
}

async function getByCaptain(captainId: string): Promise<Review[]> {
  return reviewAPI.getByCaptain(captainId);
}

async function getByTrip(tripId: string): Promise<Review[]> {
  return reviewAPI.getByTrip(tripId);
}

export const reviewService = {
  create,
  captainReviewPassenger,
  canReview,
  getMyReviews,
  getByBoat,
  getByCaptain,
  getByTrip,
};
