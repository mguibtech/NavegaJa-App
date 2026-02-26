export interface CaptainAnalyticsSummary {
  totalRevenue: number;
  completedTrips: number;
  totalPassengers: number;
  avgRating: number;
  completionRate: number;
  totalShipments: number;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
  bookings: number;
}

export interface RouteAnalytics {
  origin: string;
  destination: string;
  totalTrips: number;
  totalRevenue: number;
  avgOccupancy: number;
}

export interface PassengerAnalytics {
  userId: string;
  name: string;
  totalTrips: number;
  totalSpent: number;
  lastTripAt: string;
}

export type AnalyticsPeriod = '7d' | '30d' | '90d';
