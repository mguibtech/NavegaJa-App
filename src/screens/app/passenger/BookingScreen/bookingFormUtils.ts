import {
  ChildPassenger,
  ExtraPassenger,
  PaymentMethod,
  PriceBreakdown as PriceBreakdownType,
} from '@domain';

export const PAYMENT_PREF_KEY = '@navegaja:last-payment-method';

export const BOOKING_PAYMENT_METHODS = [
  {
    value: PaymentMethod.CREDIT_CARD,
    label: 'Cartao de Credito',
    icon: 'credit-card',
  },
  {
    value: PaymentMethod.DEBIT_CARD,
    label: 'Cartao de Debito',
    icon: 'credit-card',
  },
  {value: PaymentMethod.PIX, label: 'PIX', icon: 'qr-code'},
  {value: PaymentMethod.CASH, label: 'Dinheiro', icon: 'payments'},
] as const;

export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index++) {
    sum += parseInt(cleanCPF.charAt(index), 10) * (10 - index);
  }

  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  if (parseInt(cleanCPF.charAt(9), 10) !== digit1) return false;

  sum = 0;
  for (let index = 0; index < 10; index++) {
    sum += parseInt(cleanCPF.charAt(index), 10) * (11 - index);
  }

  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  return parseInt(cleanCPF.charAt(10), 10) === digit2;
}

export function formatCPFInput(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = numbers;

  if (numbers.length > 3) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length > 6) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  if (numbers.length > 9) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
      6,
      9,
    )}-${numbers.slice(9)}`;
  }

  return formatted;
}

export function isCPFComplete(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11;
}

export function getCpfValidationError(cpf: string): string | null {
  if (!cpf.trim()) {
    return 'CPF e obrigatorio';
  }

  if (!isCPFComplete(cpf)) {
    return 'CPF incompleto';
  }

  if (!isValidCPF(cpf)) {
    return 'CPF invalido';
  }

  return null;
}

export function syncExtraAdults(
  adults: number,
  previousAdults: ExtraPassenger[],
): ExtraPassenger[] {
  const extraCount = adults - 1;

  if (previousAdults.length === extraCount) {
    return previousAdults;
  }

  if (previousAdults.length < extraCount) {
    return [
      ...previousAdults,
      ...Array.from({length: extraCount - previousAdults.length}, () => ({
        name: '',
        cpf: '',
      })),
    ];
  }

  return previousAdults.slice(0, extraCount);
}

export function buildPriceFallback(
  tripPrice: number,
  totalPassengers: number,
): PriceBreakdownType {
  const basePrice = tripPrice * totalPassengers;

  return {
    basePrice,
    totalDiscount: 0,
    finalPrice: basePrice,
    discountsApplied: [],
    quantity: totalPassengers,
  };
}

export function getFreeChildrenCount(children: ChildPassenger[]): number {
  return children.filter(child => child.age <= 9).length;
}

export function getFilledExtraAdults(
  passengers: ExtraPassenger[],
): ExtraPassenger[] {
  return passengers.filter(passenger => passenger.name.trim() && passenger.cpf.trim());
}

export function getDuplicateCpfError(
  mainCpf: string,
  passengers: ExtraPassenger[],
): string | null {
  const mainCpfClean = mainCpf.replace(/\D/g, '');
  const extraCpfs = passengers.map(passenger => passenger.cpf.replace(/\D/g, ''));

  if (mainCpfClean && extraCpfs.includes(mainCpfClean)) {
    return 'O seu CPF nao pode constar nos passageiros adicionais.';
  }

  if (new Set(extraCpfs).size !== extraCpfs.length) {
    return 'Ha CPFs duplicados entre os passageiros adicionais.';
  }

  return null;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
