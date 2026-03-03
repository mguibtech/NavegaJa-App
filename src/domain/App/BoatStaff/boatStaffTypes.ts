export interface BoatStaff {
  id: string;
  userId: string;
  boatId: string;
  canCreateTrips: boolean;
  canConfirmPayments: boolean;
  canManageShipments: boolean;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string | null;
  };
  boat: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    isVerified: boolean;
  };
  createdAt: string;
}

export interface AddBoatStaffData {
  phone?: string;
  cpf?: string;
  boatId: string;
  canCreateTrips: boolean;
  canConfirmPayments: boolean;
  canManageShipments: boolean;
}

export interface UpdateBoatStaffData {
  canCreateTrips?: boolean;
  canConfirmPayments?: boolean;
  canManageShipments?: boolean;
  isActive?: boolean;
}

export interface UserLookupResult {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
}
