import {renderHook, act} from '@testing-library/react-native';

import {useLocationLabel} from '../../domain/App/Location/useCases/useLocationLabel';
import {locationService} from '../../domain/App/Location/locationService';

jest.mock('../../domain/App/Location/locationService');

const mockService = locationService as jest.Mocked<typeof locationService>;

beforeEach(() => jest.clearAllMocks());

describe('useLocationLabel — fetchLabel', () => {
  it('define label com string retornada pelo serviço', async () => {
    mockService.getLocationLabel.mockResolvedValue({label: 'Rio Negro - Manaus, AM'});

    const {result} = renderHook(() => useLocationLabel());

    await act(async () => {
      await result.current.fetchLabel(-3.119, -60.022);
    });

    expect(result.current.label).toBe('Rio Negro - Manaus, AM');
  });

  it('chama getLocationLabel com lat e lng corretos', async () => {
    mockService.getLocationLabel.mockResolvedValue({label: 'Algum lugar'});

    const {result} = renderHook(() => useLocationLabel());

    await act(async () => {
      await result.current.fetchLabel(-3.5, -58.1);
    });

    expect(mockService.getLocationLabel).toHaveBeenCalledWith(-3.5, -58.1);
  });

  it('retorna string do label quando sucesso', async () => {
    mockService.getLocationLabel.mockResolvedValue({label: 'Parintins, AM'});

    const {result} = renderHook(() => useLocationLabel());

    let returned: string | null = undefined as any;
    await act(async () => {
      returned = await result.current.fetchLabel(-2.628, -56.735);
    });

    expect(returned).toBe('Parintins, AM');
  });

  it('retorna null e NÃO define erro quando serviço lança exceção', async () => {
    mockService.getLocationLabel.mockRejectedValue(new Error('GPS error'));

    const {result} = renderHook(() => useLocationLabel());

    let returned: string | null = undefined as any;
    await act(async () => {
      returned = await result.current.fetchLabel(-3.0, -60.0);
    });

    expect(returned).toBeNull();
    expect(result.current.label).toBeNull();
    // useLocationLabel captura silenciosamente — sem estado de erro exposto
  });

  it('isLoading é false após completar', async () => {
    mockService.getLocationLabel.mockResolvedValue({label: 'Manaus'});

    const {result} = renderHook(() => useLocationLabel());

    await act(async () => {
      await result.current.fetchLabel(-3.1, -60.0);
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useLocationLabel — clear', () => {
  it('zera o label', async () => {
    mockService.getLocationLabel.mockResolvedValue({label: 'Tefé, AM'});

    const {result} = renderHook(() => useLocationLabel());

    await act(async () => {
      await result.current.fetchLabel(-3.3, -64.7);
    });

    expect(result.current.label).toBe('Tefé, AM');

    act(() => result.current.clear());

    expect(result.current.label).toBeNull();
  });
});
