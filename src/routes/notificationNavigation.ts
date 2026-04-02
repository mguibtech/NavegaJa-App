import {CommonActions} from '@react-navigation/native';

import {navigationRef} from './navigationRef';
import type {AppStackParamList} from './navigationTypes';

export type NotificationData = Record<string, string>;
type UserRoleLike = 'passenger' | 'captain' | 'boat_manager' | 'admin' | string | undefined;

type NavigationTarget<RouteName extends keyof AppStackParamList> = {
  name: RouteName;
  params: AppStackParamList[RouteName];
};

type NotificationNavigationTarget = {
  [RouteName in keyof AppStackParamList]: NavigationTarget<RouteName>;
}[keyof AppStackParamList];

const CAPTAIN_ONLY_ROUTES = new Set<keyof AppStackParamList>([
  'CaptainMyTrips',
  'CaptainCreateTrip',
  'CaptainTripManage',
  'CaptainMyBoats',
  'CaptainCreateBoat',
  'CaptainEditBoat',
  'CaptainChecklist',
  'CaptainStartTrip',
  'CaptainShipmentCollect',
  'CaptainTripLive',
  'KycSubmit',
  'KycStatus',
  'CaptainAnalytics',
  'ScanBookingQR',
  'CaptainBoatStaff',
]);

const PASSENGER_ONLY_ROUTES = new Set<keyof AppStackParamList>([
  'WeatherScreen',
  'SearchResults',
  'PopularRoutes',
  'TripDetails',
  'Favorites',
  'Booking',
  'Payment',
  'Ticket',
  'Tracking',
  'CreateShipment',
  'Shipments',
  'TripReview',
  'ValidateDelivery',
  'ScanShipmentQR',
  'PersonalContacts',
]);

function isManagerRole(role: UserRoleLike) {
  return role === 'captain' || role === 'boat_manager';
}

function canAccessNotificationRoute(
  routeName: keyof AppStackParamList,
  role: UserRoleLike,
): boolean {
  if (CAPTAIN_ONLY_ROUTES.has(routeName)) {
    return isManagerRole(role);
  }

  if (PASSENGER_ONLY_ROUTES.has(routeName)) {
    return !isManagerRole(role);
  }

  return true;
}

export function resolveNotificationNavigation(
  data: NotificationData,
  _role?: UserRoleLike,
): NotificationNavigationTarget | null {
  const {type, bookingId, tripId, shipmentId, boatId} = data;

  switch (type) {
    case 'booking_confirmed':
    case 'payment_confirmed':
      return bookingId ? {name: 'Ticket', params: {bookingId}} : null;

    case 'booking_cancelled':
      return {name: 'HomeTabs', params: undefined};

    case 'trip_started':
    case 'trip_cancelled':
      return bookingId ? {name: 'Tracking', params: {bookingId}} : null;

    case 'trip_completed':
      return tripId ? {name: 'TripReview', params: {tripId}} : null;

    case 'shipment_incoming':
    case 'shipment_collected':
    case 'shipment_in_transit':
    case 'shipment_arrived':
    case 'shipment_out_for_delivery':
    case 'shipment_delivered':
      return shipmentId ? {name: 'ShipmentDetails', params: {shipmentId}} : null;

    case 'new_booking':
      return tripId ? {name: 'CaptainTripManage', params: {tripId}} : null;

    case 'weather_alert':
      if (bookingId) {
        return {name: 'Ticket', params: {bookingId}};
      }

      return tripId ? {name: 'TripDetails', params: {tripId}} : null;

    case 'captain_verified':
    case 'boat_manager_assigned':
    case 'boat_manager_removed':
      return {name: 'HomeTabs', params: undefined};

    case 'captain_rejected':
      return {name: 'EditProfile', params: undefined};

    case 'boat_verified':
      return {name: 'CaptainMyBoats', params: undefined};

    case 'boat_rejected':
      if (boatId) {
        return {name: 'CaptainEditBoat', params: {boatId}};
      }

      return {name: 'CaptainMyBoats', params: undefined};

    case 'chat':
      return data.bookingId
        ? {
            name: 'Chat',
            params: {
              bookingId: data.bookingId,
              otherName: data.senderName,
            },
          }
        : null;

    case 'kyc_approved':
      return {name: 'KycStatus', params: undefined};

    case 'kyc_rejected':
      return {
        name: 'KycSubmit',
        params: {
          rejected: true,
          reason: data.rejectionReason,
        },
      };

    case 'referral_converted':
      return {name: 'Referrals', params: undefined};

    case 'sos_personal_contact':
      if (data.lat && data.lng && data.bookingId) {
        return {
          name: 'Tracking',
          params: {bookingId: data.bookingId},
        };
      }

      return {name: 'HomeTabs', params: undefined};

    default:
      return null;
  }
}

export function navigateFromNotificationData(
  data: NotificationData,
  role?: UserRoleLike,
) {
  if (!navigationRef.isReady()) {
    return;
  }

  const target = resolveNotificationNavigation(data, role);
  if (!target) {
    return;
  }

  if (!canAccessNotificationRoute(target.name, role)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'HomeTabs',
        params: undefined,
      }),
    );
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: target.name,
      params: target.params,
    }),
  );
}
