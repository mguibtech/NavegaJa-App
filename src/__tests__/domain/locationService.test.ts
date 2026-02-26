import AsyncStorage from '@react-native-async-storage/async-storage';

import {locationService} from '../../domain/App/Location/locationService';
import {locationAPI} from '../../domain/App/Location/locationAPI';
import {AM_CITIES_FALLBACK} from '../../domain/App/Location/locationTypes';

jest.mock('../../domain/App/Location/locationAPI');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockAPI = locationAPI as jest.Mocked<typeof locationAPI>;

const CITIES_CACHE_KEY = 'location_cities_am';
const LABEL_CACHE_PREFIX = 'location_label_';

const MOCK_CITIES = [
  {nome: 'Manaus', codigoIbge: '1302603'},
  {nome: 'Parintins', codigoIbge: '1303403'},
];

const MOCK_LABEL = {label: 'Rio Negro - Manaus, AM'};
const MOCK_CEP = {
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

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

// ─── getCities ─────────────────────────────────────────────────────────────

describe('locationService.getCities', () => {
  it('chama a API quando cache está vazio', async () => {
    mockAPI.getCities.mockResolvedValue(MOCK_CITIES);

    const result = await locationService.getCities();

    expect(mockAPI.getCities).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_CITIES);
  });

  it('persiste resultado no AsyncStorage após chamada à API', async () => {
    mockAPI.getCities.mockResolvedValue(MOCK_CITIES);

    await locationService.getCities();

    const raw = await AsyncStorage.getItem(CITIES_CACHE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.data).toEqual(MOCK_CITIES);
    expect(parsed.ts).toBeGreaterThan(0);
  });

  it('retorna cache sem chamar a API quando dentro do TTL de 24h', async () => {
    const cached = {data: MOCK_CITIES, ts: Date.now()};
    await AsyncStorage.setItem(CITIES_CACHE_KEY, JSON.stringify(cached));

    const result = await locationService.getCities();

    expect(mockAPI.getCities).not.toHaveBeenCalled();
    expect(result).toEqual(MOCK_CITIES);
  });

  it('chama a API novamente quando cache está expirado (>24h)', async () => {
    const expiredTs = Date.now() - 25 * 60 * 60 * 1000; // 25h atrás
    const stale = {data: [{nome: 'Antigo', codigoIbge: '0'}], ts: expiredTs};
    await AsyncStorage.setItem(CITIES_CACHE_KEY, JSON.stringify(stale));

    mockAPI.getCities.mockResolvedValue(MOCK_CITIES);

    const result = await locationService.getCities();

    expect(mockAPI.getCities).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_CITIES);
  });
});

// ─── getCep ────────────────────────────────────────────────────────────────

describe('locationService.getCep', () => {
  it('delega direto para a API sem cache', async () => {
    mockAPI.getCep.mockResolvedValue(MOCK_CEP);

    const result = await locationService.getCep('69037400');

    expect(mockAPI.getCep).toHaveBeenCalledWith('69037400');
    expect(result).toEqual(MOCK_CEP);
  });
});

// ─── getLocationLabel ──────────────────────────────────────────────────────

describe('locationService.getLocationLabel', () => {
  const LAT = -3.119;
  const LNG = -60.022;
  const cacheKey = `${LABEL_CACHE_PREFIX}${LAT.toFixed(3)}_${LNG.toFixed(3)}`;

  it('chama a API quando cache está vazio', async () => {
    mockAPI.getLocationLabel.mockResolvedValue(MOCK_LABEL);

    const result = await locationService.getLocationLabel(LAT, LNG);

    expect(mockAPI.getLocationLabel).toHaveBeenCalledWith(LAT, LNG);
    expect(result).toEqual(MOCK_LABEL);
  });

  it('persiste no AsyncStorage com chave arredondada a 3 casas', async () => {
    mockAPI.getLocationLabel.mockResolvedValue(MOCK_LABEL);

    await locationService.getLocationLabel(LAT, LNG);

    const raw = await AsyncStorage.getItem(cacheKey);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).data).toEqual(MOCK_LABEL);
  });

  it('retorna cache sem chamar API quando dentro do TTL de 30min', async () => {
    const cached = {data: MOCK_LABEL, ts: Date.now()};
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cached));

    const result = await locationService.getLocationLabel(LAT, LNG);

    expect(mockAPI.getLocationLabel).not.toHaveBeenCalled();
    expect(result).toEqual(MOCK_LABEL);
  });

  it('chama API novamente quando cache está expirado (>30min)', async () => {
    const expiredTs = Date.now() - 31 * 60 * 1000; // 31min atrás
    await AsyncStorage.setItem(cacheKey, JSON.stringify({data: {label: 'Velho'}, ts: expiredTs}));
    mockAPI.getLocationLabel.mockResolvedValue(MOCK_LABEL);

    const result = await locationService.getLocationLabel(LAT, LNG);

    expect(mockAPI.getLocationLabel).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_LABEL);
  });
});

// ─── getFallbackCities ─────────────────────────────────────────────────────

describe('locationService.getFallbackCities', () => {
  it('retorna City[] com nome e codigoIbge vazio para cada item de AM_CITIES_FALLBACK', () => {
    const result = locationService.getFallbackCities();

    expect(result).toHaveLength(AM_CITIES_FALLBACK.length);
    expect(result[0]).toEqual({nome: AM_CITIES_FALLBACK[0], codigoIbge: ''});
  });

  it('inclui Manaus e Parintins na lista de fallback', () => {
    const names = locationService.getFallbackCities().map(c => c.nome);

    expect(names).toContain('Manaus');
    expect(names).toContain('Parintins');
  });
});
