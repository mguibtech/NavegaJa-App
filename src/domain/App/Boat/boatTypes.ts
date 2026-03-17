export type BoatType = 'lancha' | 'voadeira' | 'balsa' | 'recreio';

export type BoatFileReference =
  | string
  | {
      id?: string | number | null;
      url?: string | null;
      uri?: string | null;
      path?: string | null;
      photoUrl?: string | null;
      imageUrl?: string | null;
      fileUrl?: string | null;
      src?: string | null;
    };

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
  photos?: BoatFileReference[];
  documentPhotos?: BoatFileReference[];
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
