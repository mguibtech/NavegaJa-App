export interface Boat {
  id: string;
  name: string;
  captainId: string;
  capacity: number;
  type: string;
  registration: string;
  description?: string;
  amenities?: string[];
  photos?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatData {
  name: string;
  capacity: number;
  type: string;
  registration: string;
  description?: string;
  amenities?: string[];
  photos?: string[];
}
