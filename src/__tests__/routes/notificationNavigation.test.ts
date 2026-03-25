import {resolveNotificationNavigation} from '../../routes/notificationNavigation';

describe('resolveNotificationNavigation', () => {
  it('maps booking confirmation to Ticket', () => {
    expect(
      resolveNotificationNavigation({
        type: 'booking_confirmed',
        bookingId: 'booking-123',
      }),
    ).toEqual({
      name: 'Ticket',
      params: {bookingId: 'booking-123'},
    });
  });

  it('maps boat rejection with boat id to CaptainEditBoat', () => {
    expect(
      resolveNotificationNavigation({
        type: 'boat_rejected',
        boatId: 'boat-1',
      }),
    ).toEqual({
      name: 'CaptainEditBoat',
      params: {boatId: 'boat-1'},
    });
  });

  it('falls back to CaptainMyBoats when rejected boat has no id', () => {
    expect(
      resolveNotificationNavigation({
        type: 'boat_rejected',
      }),
    ).toEqual({
      name: 'CaptainMyBoats',
      params: undefined,
    });
  });

  it('prioritizes booking route for weather alerts', () => {
    expect(
      resolveNotificationNavigation({
        type: 'weather_alert',
        bookingId: 'booking-9',
        tripId: 'trip-9',
      }),
    ).toEqual({
      name: 'Ticket',
      params: {bookingId: 'booking-9'},
    });
  });

  it('uses trip route when weather alert has no booking', () => {
    expect(
      resolveNotificationNavigation({
        type: 'weather_alert',
        tripId: 'trip-9',
      }),
    ).toEqual({
      name: 'TripDetails',
      params: {tripId: 'trip-9'},
    });
  });

  it('maps sos contact with coordinates to Tracking', () => {
    expect(
      resolveNotificationNavigation({
        type: 'sos_personal_contact',
        bookingId: 'booking-7',
        lat: '-3.1',
        lng: '-60.0',
      }),
    ).toEqual({
      name: 'Tracking',
      params: {bookingId: 'booking-7'},
    });
  });

  it('falls back to HomeTabs when sos contact has no coordinates', () => {
    expect(
      resolveNotificationNavigation({
        type: 'sos_personal_contact',
      }),
    ).toEqual({
      name: 'HomeTabs',
      params: undefined,
    });
  });

  it('returns null for unsupported notifications', () => {
    expect(
      resolveNotificationNavigation({
        type: 'unknown_event',
      }),
    ).toBeNull();
  });
});
