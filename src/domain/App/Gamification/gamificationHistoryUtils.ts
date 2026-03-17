export type GamificationHistoryCategory =
  | 'trip'
  | 'delivery'
  | 'review'
  | 'referral'
  | 'bonus'
  | 'other';

const ACTION_CATEGORY_MAP: Record<string, GamificationHistoryCategory> = {
  boat_owner_trip_completed: 'trip',
  boat_owner_passenger_completed: 'trip',
  boat_owner_shipment_delivered: 'delivery',
};

const CATEGORY_KEYWORDS: Record<GamificationHistoryCategory, string[]> = {
  trip: ['trip', 'viagem', 'booking', 'passenger', 'passageiro'],
  delivery: ['shipment', 'entrega', 'cargo', 'carga', 'delivered'],
  review: ['review', 'avali'],
  referral: ['referral', 'indica'],
  bonus: ['bonus', 'promo', 'first'],
  other: [],
};

export function getGamificationHistoryCategory(action: string | undefined | null): GamificationHistoryCategory {
  if (!action) return 'other';

  const normalizedAction = action.toLowerCase();
  const mappedCategory = ACTION_CATEGORY_MAP[normalizedAction];
  if (mappedCategory) {
    return mappedCategory;
  }

  const matchedCategory = (Object.entries(CATEGORY_KEYWORDS) as Array<[GamificationHistoryCategory, string[]]>)
    .find(([, keywords]) => keywords.some(keyword => normalizedAction.includes(keyword)));

  return matchedCategory?.[0] ?? 'other';
}

export function getGamificationTransactionIcon(action: string | undefined | null): string {
  const category = getGamificationHistoryCategory(action);

  if (category === 'trip') return 'directions-boat';
  if (category === 'delivery') return 'local-shipping';
  if (category === 'review') return 'star';
  if (category === 'referral') return 'person-add';
  if (category === 'bonus') return 'card-giftcard';

  return 'monetization-on';
}
