import {api} from '@api';

import {StoredCard, AddCardPayload} from './paymentMethodTypes';

const BASE = '/payment-methods';

async function getAll(): Promise<StoredCard[]> {
  return api.get<StoredCard[]>(BASE);
}

async function addCard(payload: AddCardPayload): Promise<StoredCard> {
  return api.post<StoredCard>(BASE, payload);
}

async function setDefault(id: string): Promise<StoredCard> {
  return api.patch<StoredCard>(`${BASE}/${id}/default`);
}

async function remove(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export const paymentMethodAPI = {
  getAll,
  addCard,
  setDefault,
  remove,
};
