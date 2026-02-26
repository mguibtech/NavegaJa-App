import {paymentMethodService} from '../../domain/App/PaymentMethod/paymentMethodService';
import {paymentMethodAPI} from '../../domain/App/PaymentMethod/paymentMethodAPI';

jest.mock('../../domain/App/PaymentMethod/paymentMethodAPI');

const mockAPI = paymentMethodAPI as jest.Mocked<typeof paymentMethodAPI>;

const MOCK_CARD = {
  id: 'card-1',
  type: 'credit_card' as const,
  brand: 'visa' as const,
  last4: '4242',
  holderName: 'JOÃO SILVA',
  expiryMonth: 12,
  expiryYear: 2028,
  isDefault: false,
  externalId: null,
  externalProvider: null,
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

// ─── addCard — normalização ────────────────────────────────────────────────

describe('paymentMethodService.addCard — normalização', () => {
  it('remove espaços do cardNumber antes de enviar para API', async () => {
    mockAPI.addCard.mockResolvedValue(MOCK_CARD);

    await paymentMethodService.addCard({
      cardNumber: '4111 1111 1111 1111',
      holderName: 'João Silva',
      expiryMonth: 12,
      expiryYear: 2028,
      type: 'credit_card',
      cvv: '123',
    });

    const payload = mockAPI.addCard.mock.calls[0][0];
    expect(payload.cardNumber).toBe('4111111111111111');
  });

  it('converte holderName para maiúsculas', async () => {
    mockAPI.addCard.mockResolvedValue(MOCK_CARD);

    await paymentMethodService.addCard({
      cardNumber: '4111111111111111',
      holderName: 'joão silva',
      expiryMonth: 12,
      expiryYear: 2028,
      type: 'credit_card',
      cvv: '123',
    });

    const payload = mockAPI.addCard.mock.calls[0][0];
    expect(payload.holderName).toBe('JOÃO SILVA');
  });

  it('preserva outros campos sem alteração', async () => {
    mockAPI.addCard.mockResolvedValue(MOCK_CARD);

    await paymentMethodService.addCard({
      cardNumber: '5500 0000 0000 0004',
      holderName: 'Maria',
      expiryMonth: 6,
      expiryYear: 2030,
      type: 'debit_card',
      cvv: '456',
      setAsDefault: true,
    });

    const payload = mockAPI.addCard.mock.calls[0][0];
    expect(payload.expiryMonth).toBe(6);
    expect(payload.expiryYear).toBe(2030);
    expect(payload.type).toBe('debit_card');
    expect(payload.cvv).toBe('456');
    expect(payload.setAsDefault).toBe(true);
  });

  it('retorna StoredCard retornado pela API', async () => {
    mockAPI.addCard.mockResolvedValue(MOCK_CARD);

    const result = await paymentMethodService.addCard({
      cardNumber: '4111111111111111',
      holderName: 'Test',
      expiryMonth: 1,
      expiryYear: 2029,
      type: 'credit_card',
      cvv: '000',
    });

    expect(result).toEqual(MOCK_CARD);
  });
});

// ─── getAll ────────────────────────────────────────────────────────────────

describe('paymentMethodService.getAll', () => {
  it('delega diretamente para a API', async () => {
    mockAPI.getAll.mockResolvedValue([MOCK_CARD]);

    const result = await paymentMethodService.getAll();

    expect(mockAPI.getAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([MOCK_CARD]);
  });

  it('retorna lista vazia quando API retorna []', async () => {
    mockAPI.getAll.mockResolvedValue([]);

    const result = await paymentMethodService.getAll();

    expect(result).toHaveLength(0);
  });
});

// ─── setDefault ────────────────────────────────────────────────────────────

describe('paymentMethodService.setDefault', () => {
  it('chama API com o id correto', async () => {
    mockAPI.setDefault.mockResolvedValue({...MOCK_CARD, isDefault: true});

    await paymentMethodService.setDefault('card-1');

    expect(mockAPI.setDefault).toHaveBeenCalledWith('card-1');
  });

  it('retorna StoredCard atualizado', async () => {
    const updated = {...MOCK_CARD, isDefault: true};
    mockAPI.setDefault.mockResolvedValue(updated);

    const result = await paymentMethodService.setDefault('card-1');

    expect(result.isDefault).toBe(true);
  });
});

// ─── remove ────────────────────────────────────────────────────────────────

describe('paymentMethodService.remove', () => {
  it('chama API com o id correto', async () => {
    mockAPI.remove.mockResolvedValue(undefined);

    await paymentMethodService.remove('card-1');

    expect(mockAPI.remove).toHaveBeenCalledWith('card-1');
  });
});
