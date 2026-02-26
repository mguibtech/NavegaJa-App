import {renderHook, waitFor} from '@testing-library/react-native';

import {useCities} from '../../domain/App/Location/useCases/useCities';
import {locationService} from '../../domain/App/Location/locationService';
import {AM_CITIES_FALLBACK} from '../../domain/App/Location/locationTypes';

jest.mock('../../domain/App/Location/locationService');

const mockService = locationService as jest.Mocked<typeof locationService>;

const MOCK_CITIES = [
  {nome: 'Manaus', codigoIbge: '1302603'},
  {nome: 'Parintins', codigoIbge: '1303403'},
  {nome: 'Itacoatiara', codigoIbge: '1301902'},
];

const FALLBACK_CITIES = AM_CITIES_FALLBACK.map(nome => ({nome, codigoIbge: ''}));

beforeEach(() => jest.clearAllMocks());

describe('useCities — carregamento inicial', () => {
  it('chama getCities automaticamente ao montar', async () => {
    mockService.getCities.mockResolvedValue(MOCK_CITIES);

    renderHook(() => useCities());

    await waitFor(() => expect(mockService.getCities).toHaveBeenCalledTimes(1));
  });

  it('popula cities e cityNames após sucesso', async () => {
    mockService.getCities.mockResolvedValue(MOCK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.cities).toHaveLength(3));

    expect(result.current.cities).toEqual(MOCK_CITIES);
    expect(result.current.cityNames).toEqual(['Manaus', 'Parintins', 'Itacoatiara']);
  });

  it('isLoading é false após carregamento concluído', async () => {
    mockService.getCities.mockResolvedValue(MOCK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

describe('useCities — fallback quando API falha', () => {
  it('usa getFallbackCities quando getCities lança exceção', async () => {
    mockService.getCities.mockRejectedValue(new Error('Network error'));
    mockService.getFallbackCities.mockReturnValue(FALLBACK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cities).toEqual(FALLBACK_CITIES);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('cityNames no fallback inclui Manaus e Parintins', async () => {
    mockService.getCities.mockRejectedValue(new Error('offline'));
    mockService.getFallbackCities.mockReturnValue(FALLBACK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cityNames).toContain('Manaus');
    expect(result.current.cityNames).toContain('Parintins');
  });

  it('fallback tem 21 cidades (AM_CITIES_FALLBACK)', async () => {
    mockService.getCities.mockRejectedValue(new Error('offline'));
    mockService.getFallbackCities.mockReturnValue(FALLBACK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cities).toHaveLength(AM_CITIES_FALLBACK.length);
  });
});

describe('useCities — cityNames derivado', () => {
  it('cityNames é array de strings dos campos nome', async () => {
    mockService.getCities.mockResolvedValue(MOCK_CITIES);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.cities).toHaveLength(3));

    expect(result.current.cityNames).toEqual(
      MOCK_CITIES.map(c => c.nome),
    );
  });

  it('cityNames é vazio quando cities é vazio', async () => {
    mockService.getCities.mockResolvedValue([]);

    const {result} = renderHook(() => useCities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cityNames).toHaveLength(0);
  });
});
