import {
  getGamificationHistoryCategory,
  getGamificationTransactionIcon,
} from '../../domain/App/Gamification/gamificationHistoryUtils';

describe('gamificationHistoryUtils', () => {
  it('classifica boat_owner_trip_completed como viagem', () => {
    expect(getGamificationHistoryCategory('boat_owner_trip_completed')).toBe('trip');
    expect(getGamificationTransactionIcon('boat_owner_trip_completed')).toBe('directions-boat');
  });

  it('classifica boat_owner_passenger_completed como viagem', () => {
    expect(getGamificationHistoryCategory('boat_owner_passenger_completed')).toBe('trip');
    expect(getGamificationTransactionIcon('boat_owner_passenger_completed')).toBe('directions-boat');
  });

  it('classifica boat_owner_shipment_delivered como entrega', () => {
    expect(getGamificationHistoryCategory('boat_owner_shipment_delivered')).toBe('delivery');
    expect(getGamificationTransactionIcon('boat_owner_shipment_delivered')).toBe('local-shipping');
  });
});
