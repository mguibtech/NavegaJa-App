import {
  BOOKING_PAYMENT_METHODS,
  buildPriceFallback,
  formatCPFInput,
  getCpfValidationError,
  getDuplicateCpfError,
  getErrorMessage,
  getFilledExtraAdults,
  getFreeChildrenCount,
  syncExtraAdults,
} from '../../screens/app/passenger/BookingScreen/bookingFormUtils';

describe('bookingFormUtils', () => {
  it('exposes the expected payment methods', () => {
    expect(BOOKING_PAYMENT_METHODS.map(method => method.value)).toEqual([
      'credit_card',
      'debit_card',
      'pix',
      'cash',
    ]);
  });

  it('formats CPF input incrementally', () => {
    expect(formatCPFInput('12345678909')).toBe('123.456.789-09');
    expect(formatCPFInput('abc123456')).toBe('123.456');
  });

  it('returns validation errors for empty, incomplete and invalid CPF', () => {
    expect(getCpfValidationError('')).toBe('CPF e obrigatorio');
    expect(getCpfValidationError('123.456.789')).toBe('CPF incompleto');
    expect(getCpfValidationError('123.456.789-00')).toBe('CPF invalido');
    expect(getCpfValidationError('123.456.789-09')).toBeNull();
  });

  it('syncs extra adults to the current passenger count', () => {
    expect(syncExtraAdults(1, [{name: 'A', cpf: '1'}])).toEqual([]);

    expect(syncExtraAdults(3, [])).toEqual([
      {name: '', cpf: ''},
      {name: '', cpf: ''},
    ]);

    expect(
      syncExtraAdults(2, [
        {name: 'Maria', cpf: '111'},
        {name: 'Joao', cpf: '222'},
      ]),
    ).toEqual([{name: 'Maria', cpf: '111'}]);
  });

  it('builds a fallback price breakdown', () => {
    expect(buildPriceFallback(25, 3)).toEqual({
      basePrice: 75,
      totalDiscount: 0,
      finalPrice: 75,
      discountsApplied: [],
      quantity: 3,
    });
  });

  it('counts free children and filters only completed extra adults', () => {
    expect(getFreeChildrenCount([{age: 4}, {age: 9}, {age: 10}])).toBe(2);

    expect(
      getFilledExtraAdults([
        {name: 'Maria', cpf: '111'},
        {name: ' ', cpf: '222'},
        {name: 'Joao', cpf: ''},
      ]),
    ).toEqual([{name: 'Maria', cpf: '111'}]);
  });

  it('detects duplicated CPF conflicts', () => {
    expect(
      getDuplicateCpfError('123.456.789-09', [
        {name: 'Maria', cpf: '12345678909'},
      ]),
    ).toBe('O seu CPF nao pode constar nos passageiros adicionais.');

    expect(
      getDuplicateCpfError('987.654.321-00', [
        {name: 'Maria', cpf: '12345678909'},
        {name: 'Joao', cpf: '123.456.789-09'},
      ]),
    ).toBe('Ha CPFs duplicados entre os passageiros adicionais.');

    expect(
      getDuplicateCpfError('987.654.321-00', [
        {name: 'Maria', cpf: '12345678909'},
      ]),
    ).toBeNull();
  });

  it('normalizes unknown errors to a fallback message', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
    expect(getErrorMessage('boom', 'fallback')).toBe('fallback');
  });
});
