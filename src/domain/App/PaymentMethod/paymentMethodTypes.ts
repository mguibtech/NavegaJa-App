export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'hipercard' | 'amex' | 'other';
export type CardType = 'credit_card' | 'debit_card';

/** Cartão salvo do usuário */
export interface StoredCard {
  id: string;
  type: CardType;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  externalId: string | null;
  externalProvider: string | null;
  createdAt: string;
}

export interface AddCardPayload {
  cardNumber: string;    // 13-19 dígitos, sem espaços
  holderName: string;
  expiryMonth: number;   // 1-12
  expiryYear: number;    // 4 dígitos
  type: CardType;
  cvv: string;
  setAsDefault?: boolean;
}
