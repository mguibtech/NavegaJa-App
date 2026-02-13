export interface PopularCity {
  city: string;
  tripsCount: number;
}

export interface PopularRoute {
  origin: string;
  destination: string;
  tripsCount: number;
  minPrice: number;
  avgPrice: number;
}

export interface PopularDestinationsResponse {
  origins: PopularCity[];
  destinations: PopularCity[];
  routes: PopularRoute[];
}
