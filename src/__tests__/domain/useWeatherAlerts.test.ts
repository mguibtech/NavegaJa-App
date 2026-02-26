import {renderHook, act} from '@testing-library/react-native';

import {useWeatherAlerts} from '../../domain/App/Weather/useCases/useWeatherAlerts';
import {weatherService} from '../../domain/App/Weather/weatherService';
import {AlertSeverity} from '../../domain/App/Weather/weatherTypes';

jest.mock('../../domain/App/Weather/weatherService');

const mockService = weatherService as jest.Mocked<typeof weatherService>;

const MOCK_ALERTS = [
  {
    id: 'alert-1',
    event: 'Tempestade Severa',
    severity: AlertSeverity.SEVERE,
    headline: 'Ventos fortes esperados',
    description: 'Rajadas de 80 km/h possíveis',
    start: '2026-02-25T10:00:00Z',
    end: '2026-02-25T18:00:00Z',
    regions: ['manaus'],
  },
  {
    id: 'alert-2',
    event: 'Chuva Extrema',
    severity: AlertSeverity.EXTREME,
    headline: 'Inundações possíveis',
    description: 'Chuva acima de 100mm/h prevista',
    start: '2026-02-25T12:00:00Z',
    end: '2026-02-26T00:00:00Z',
    regions: ['manaus', 'iranduba'],
  },
];

beforeEach(() => jest.clearAllMocks());

describe('useWeatherAlerts — fetchAlerts (lat/lng)', () => {
  it('define alerts após sucesso', async () => {
    mockService.getAlerts.mockResolvedValue(MOCK_ALERTS);

    const {result} = renderHook(() => useWeatherAlerts());

    await act(async () => {
      await result.current.fetchAlerts(-3.119, -60.022);
    });

    expect(result.current.alerts).toHaveLength(2);
    expect(result.current.alerts[0].id).toBe('alert-1');
  });

  it('chama weatherService.getAlerts com lat e lng corretos', async () => {
    mockService.getAlerts.mockResolvedValue([]);

    const {result} = renderHook(() => useWeatherAlerts());

    await act(async () => {
      await result.current.fetchAlerts(-3.5, -58.1);
    });

    expect(mockService.getAlerts).toHaveBeenCalledWith(-3.5, -58.1);
  });

  it('define error e retorna [] quando serviço lança exceção', async () => {
    mockService.getAlerts.mockRejectedValue(new Error('Network error'));

    const {result} = renderHook(() => useWeatherAlerts());

    let returned: any;
    await act(async () => {
      returned = await result.current.fetchAlerts(-3.0, -60.0);
    });

    expect(returned).toEqual([]);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.alerts).toHaveLength(0);
  });

  it('isLoading é false após completar', async () => {
    mockService.getAlerts.mockResolvedValue(MOCK_ALERTS);

    const {result} = renderHook(() => useWeatherAlerts());

    await act(async () => {
      await result.current.fetchAlerts(-3.0, -60.0);
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useWeatherAlerts — fetchRegionAlerts', () => {
  it('define alerts por região após sucesso', async () => {
    mockService.getRegionAlerts.mockResolvedValue([MOCK_ALERTS[0]]);

    const {result} = renderHook(() => useWeatherAlerts());

    await act(async () => {
      await result.current.fetchRegionAlerts('manaus');
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].severity).toBe(AlertSeverity.SEVERE);
  });

  it('chama weatherService.getRegionAlerts com a region correta', async () => {
    mockService.getRegionAlerts.mockResolvedValue([]);

    const {result} = renderHook(() => useWeatherAlerts());

    await act(async () => {
      await result.current.fetchRegionAlerts('parintins');
    });

    expect(mockService.getRegionAlerts).toHaveBeenCalledWith('parintins');
  });

  it('retorna lista de alertas do fetchRegionAlerts', async () => {
    mockService.getRegionAlerts.mockResolvedValue(MOCK_ALERTS);

    const {result} = renderHook(() => useWeatherAlerts());

    let returned: any;
    await act(async () => {
      returned = await result.current.fetchRegionAlerts('manaus');
    });

    expect(returned).toHaveLength(2);
  });

  it('define error e retorna [] quando região lança exceção', async () => {
    mockService.getRegionAlerts.mockRejectedValue(new Error('Região indisponível'));

    const {result} = renderHook(() => useWeatherAlerts());

    let returned: any;
    await act(async () => {
      returned = await result.current.fetchRegionAlerts('manaus');
    });

    expect(returned).toEqual([]);
    expect(result.current.error?.message).toBe('Região indisponível');
  });

  it('lista de alertas inicia vazia', () => {
    const {result} = renderHook(() => useWeatherAlerts());

    expect(result.current.alerts).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
