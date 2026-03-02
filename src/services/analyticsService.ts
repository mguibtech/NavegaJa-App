import analytics from '@react-native-firebase/analytics';

/**
 * NavegaJá Analytics Service
 * Wraps Firebase Analytics with typed, domain-specific event helpers.
 * All calls are silently ignored on error — analytics must never block UX.
 */

export async function logLogin(method: 'phone' | 'google' = 'phone'): Promise<void> {
  try {
    await analytics().logLogin({method});
  } catch {}
}

export async function logSignUp(method: 'phone' | 'google' = 'phone'): Promise<void> {
  try {
    await analytics().logSignUp({method});
  } catch {}
}

export async function logSearch(origin: string, destination: string): Promise<void> {
  try {
    await analytics().logSearch({search_term: `${origin} → ${destination}`});
  } catch {}
}

export async function logTripView(tripId: string, origin: string, destination: string): Promise<void> {
  try {
    await analytics().logSelectContent({
      content_type: 'trip',
      item_id: tripId,
    });
    await analytics().logEvent('trip_view', {trip_id: tripId, origin, destination});
  } catch {}
}

export async function logBookingStarted(tripId: string, totalAmount: number): Promise<void> {
  try {
    await analytics().logBeginCheckout({
      value: totalAmount,
      currency: 'BRL',
      items: [{item_id: tripId, item_name: 'trip'}],
    });
  } catch {}
}

export async function logPurchase(
  bookingId: string,
  amount: number,
  paymentMethod: string,
): Promise<void> {
  try {
    await analytics().logPurchase({
      transaction_id: bookingId,
      value: amount,
      currency: 'BRL',
      items: [{item_id: bookingId, item_name: 'booking'}],
    });
    await analytics().logEvent('payment_completed', {
      booking_id: bookingId,
      payment_method: paymentMethod,
      amount,
    });
  } catch {}
}

export async function logShipmentCreated(): Promise<void> {
  try {
    await analytics().logEvent('shipment_created');
  } catch {}
}

export async function logScreen(screenName: string): Promise<void> {
  try {
    await analytics().logScreenView({screen_name: screenName, screen_class: screenName});
  } catch {}
}
