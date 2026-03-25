import {CommonActions} from '@react-navigation/native';

import {navigationRef} from './navigationRef';
import type {AppStackParamList} from './navigationTypes';

export type NotificationData = Record<string, string>;

type NavigationTarget<RouteName extends keyof AppStackParamList> = {
  name: RouteName;
  params: AppStackParamList[RouteName];
};

type NotificationNavigationTarget = {
  [RouteName in keyof AppStackParamList]: NavigationTarget<RouteName>;
}[keyof AppStackParamList];

export function resolveNotificationNavigation(
  data: NotificationData,
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
      if (data.lat && data.lng) {
        return {
          name: 'Tracking',
          params: {bookingId: data.bookingId ?? ''},
        };
      }

      return {name: 'HomeTabs', params: undefined};

    default:
      return null;
  }
}

export function navigateFromNotificationData(data: NotificationData) {
  if (!navigationRef.isReady()) {
    return;
  }

  const target = resolveNotificationNavigation(data);
  if (!target) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: target.name,
      params: target.params,
    }),
  );
}
