import {paymentMethodAPI} from './paymentMethodAPI';
import {StoredCard, AddCardPayload} from './paymentMethodTypes';

async function getAll(): Promise<StoredCard[]> {
  return paymentMethodAPI.getAll();
}

async function addCard(payload: AddCardPayload): Promise<StoredCard> {
  const normalized: AddCardPayload = {
    ...payload,
    cardNumber: payload.cardNumber.replace(/\s/g, ''),
    holderName: payload.holderName.toUpperCase(),
  };
  return paymentMethodAPI.addCard(normalized);
}

async function setDefault(id: string): Promise<StoredCard> {
  return paymentMethodAPI.setDefault(id);
}

async function remove(id: string): Promise<void> {
  return paymentMethodAPI.remove(id);
}

export const paymentMethodService = {
  getAll,
  addCard,
  setDefault,
  remove,
};
