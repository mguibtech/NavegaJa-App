// Enum de tipos - alinhado com backend
export enum FavoriteType {
  DESTINATION = 'destination',
  BOAT = 'boat',
  CAPTAIN = 'captain',
}

// Interface do Favorito - alinhado com backend
export interface Favorite {
  id: string;
  type: FavoriteType;

  // Campos de destino/rota
  destination?: string | null;
  origin?: string | null;

  // Campos de barco
  boatId?: string | null;
  boat?: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    photoUrl?: string | null;
  };

  // Campos de capitão
  captainId?: string | null;
  captain?: {
    id: string;
    name: string;
    rating: string;
    totalTrips: number;
    avatarUrl?: string | null;
  };

  createdAt: string;
}

// DTO para criar favorito - alinhado com backend
export interface CreateFavoriteDto {
  type: FavoriteType;

  // Para destinos
  destination?: string;
  origin?: string;

  // Para barcos
  boatId?: string;

  // Para capitães
  captainId?: string;
}

// Response da API
export interface FavoriteResponse {
  favorites: Favorite[];
  total: number;
}

// DTO para verificar se é favorito
export interface CheckFavoriteDto {
  type: FavoriteType;
  destination?: string;
  origin?: string;
  boatId?: string;
  captainId?: string;
}
