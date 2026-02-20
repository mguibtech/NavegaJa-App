export type BoatType = 'lancha' | 'voadeira' | 'balsa' | 'recreio';

export interface Boat {
  id: string;
  name: string;
  captainId: string;
  capacity: number;
  type: BoatType | string;
  registrationNum: string;
  model?: string;
  year?: number;
  description?: string;
  amenities?: string[];
  photos?: string[];
  documentPhotos?: string[];
  isActive: boolean;
  isVerified: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatData {
  name: string;
  capacity: number;
  type: BoatType | string;
  registrationNum?: string;
  model?: string;
  year?: number;
  amenities?: string[];
  photos?: string[];
  documentPhotos?: string[];
}
