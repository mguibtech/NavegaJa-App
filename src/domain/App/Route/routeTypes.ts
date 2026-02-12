export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchRouteParams {
  origin: string;
  destination: string;
}
