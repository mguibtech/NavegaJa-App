import {renderHook, act} from '@testing-library/react-native';

import {useCepLookup} from '../../domain/App/Location/useCases/useCepLookup';
import {locationService} from '../../domain/App/Location/locationService';

jest.mock('../../domain/App/Location/locationService');

const mockService = locationService as jest.Mocked<typeof locationService>;

const MOCK_CEP_RESULT = {
  cep: '69037-400',
  logradouro: 'Rua Francisca Júlia',
  complemento: '',
  bairro: 'Nova Esperança',
  cidade: 'Manaus',
  uf: 'AM',
  estado: 'Amazonas',
  ddd: '92',
  ibge: '1302603',
};

beforeEach(() => jest.clearAllMocks());

describe('useCepLookup — lookup', () => {
  it('retorna null sem chamar serviço quando cep tem menos de 8 dígitos', async () => {
    const {result} = renderHook(() => useCepLookup());

    let returned: any;
    await act(async () => {
      returned = await result.current.lookup('1234567');
    });

    expect(mockService.getCep).not.toHaveBeenCalled();
    expect(returned).toBeNull();
  });

  it('aceita CEP com máscara e extrai os 8 dígitos', async () => {
    mockService.getCep.mockResolvedValue(MOCK_CEP_RESULT);

    const {result} = renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.lookup('69037-400');
    });

    expect(mockService.getCep).toHaveBeenCalledWith('69037400');
  });

  it('define result com CepResult após sucesso', async () => {
    mockService.getCep.mockResolvedValue(MOCK_CEP_RESULT);

    const {result} = renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.lookup('69037400');
    });

    expect(result.current.result).toEqual(MOCK_CEP_RESULT);
    expect(result.current.error).toBeNull();
  });

  it('define error e retorna null quando serviço lança exceção', async () => {
    mockService.getCep.mockRejectedValue(new Error('CEP não encontrado'));

    const {result} = renderHook(() => useCepLookup());

    let returned: any;
    await act(async () => {
      returned = await result.current.lookup('00000000');
    });

    expect(returned).toBeNull();
    expect(result.current.error?.message).toBe('CEP não encontrado');
    expect(result.current.result).toBeNull();
  });

  it('isLoading é false após completar', async () => {
    mockService.getCep.mockResolvedValue(MOCK_CEP_RESULT);

    const {result} = renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.lookup('69037400');
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useCepLookup — clear', () => {
  it('limpa result e error', async () => {
    mockService.getCep.mockRejectedValue(new Error('erro'));

    const {result} = renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.lookup('00000000');
    });

    expect(result.current.error).not.toBeNull();

    act(() => result.current.clear());

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
