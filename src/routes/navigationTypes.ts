import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PaymentMethod} from '@domain';
import {Promotion} from '../domain/App/Promotion/promotionTypes';

// ─── Param Lists ─────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {email: string};
};

// Telas compartilhadas entre passageiro e capitão
type SharedParamList = {
  ShipmentDetails: {shipmentId: string};
  ShipmentReview: {shipmentId: string};
  EditProfile: undefined;
  CaptainProfile: {
    captainId: string;
    captainName?: string;
    captainRating?: string | number;
    captainTotalTrips?: number;
    captainLevel?: string;
    captainCreatedAt?: string;
    captainAvatarUrl?: string | null;
    captainIsVerified?: boolean;
    captainHasLicensePhoto?: boolean;
  };
  BoatDetail: {
    boatId: string;
    boatName?: string;
    boatType?: string;
    boatCapacity?: number;
    boatModel?: string | null;
    boatYear?: number | null;
    boatAmenities?: string[];
    boatRegistrationNum?: string;
    boatIsVerified?: boolean;
    boatPhotoUrl?: string | null;
    boatCreatedAt?: string;
  };
  PaymentMethods: undefined;
  AddCard: undefined;
  Notifications: undefined;
  Gamification: undefined;
  MyReviews: undefined;
  Help: undefined;
  Terms: undefined;
  Privacy: undefined;
  EmergencyContacts: undefined;
  SosAlert: {tripId?: string};
};

// Stack do passageiro/navegador
export type PassengerStackParamList = {
  HomeTabs: undefined;
  SearchResults: {
    routeId?: string | null;
    origin: string;
    destination: string;
    date?: string;
    promotion?: Promotion;
    context?: 'booking' | 'shipment';
  };
  PopularRoutes: undefined;
  TripDetails: {
    tripId: string;
    promotion?: Promotion;
    context?: 'booking' | 'shipment';
  };
  Favorites: undefined;
  Booking: {tripId: string};
  Payment: {
    bookingId: string;
    amount: number;
    paymentMethod: PaymentMethod;
  };
  Ticket: {bookingId: string};
  Tracking: {bookingId: string};
  CreateShipment: {tripId: string};
  Shipments: undefined;
  TripReview: {
    tripId: string;
    captainName?: string;
    boatName?: string;
  };
  ValidateDelivery: {trackingCode?: string; pin?: string};
  ScanShipmentQR: undefined;
} & SharedParamList;

// Stack do capitão
export type CaptainStackParamList = {
  HomeTabs: undefined;
  CaptainMyTrips: undefined;
  CaptainCreateTrip: undefined;
  CaptainTripManage: {tripId: string};
  CaptainMyBoats: undefined;
  CaptainCreateBoat: undefined;
  CaptainEditBoat: {boatId: string};
  CaptainChecklist: {tripId: string};
  CaptainStartTrip: {tripId: string};
  CaptainShipmentCollect: {shipmentId: string};
  CaptainTripLive: {tripId: string; origin: string; destination: string};
} & SharedParamList;

// Lista completa para o navigationRef (FCM navigation)
export type AppStackParamList = PassengerStackParamList & CaptainStackParamList;

export type TabsParamList = {
  Home: undefined;
  Search: {context?: 'booking' | 'shipment'};
  Bookings: undefined;
  Shipments: undefined;
  Profile: undefined;
};

export type CaptainTabsParamList = {
  Dashboard: undefined;
  Operations: undefined;
  Financial: undefined;
  Profile: undefined;
};

// ─── Typed Screen Props ───────────────────────────────────────────────────────

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export type PassengerScreenProps<T extends keyof PassengerStackParamList> =
  NativeStackScreenProps<PassengerStackParamList, T>;

export type CaptainScreenProps<T extends keyof CaptainStackParamList> =
  NativeStackScreenProps<CaptainStackParamList, T>;

export type AppTabScreenProps<T extends keyof TabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<TabsParamList, T>,
    NativeStackScreenProps<PassengerStackParamList>
  >;

export type CaptainTabScreenProps<T extends keyof CaptainTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<CaptainTabsParamList, T>,
    NativeStackScreenProps<CaptainStackParamList>
  >;

// ─── Global Navigation Typing ─────────────────────────────────────────────────

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList {}
  }
}
