import {gamificationService} from '../../domain/App/Gamification/gamificationService';
import {gamificationAPI} from '../../domain/App/Gamification/gamificationAPI';

jest.mock('../../domain/App/Gamification/gamificationAPI');

const mockAPI = gamificationAPI as jest.Mocked<typeof gamificationAPI>;

describe('gamificationService.getHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('extrai itens do wrapper {data} da API', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [
        {id: '1', action: 'trip_completed', points: 100, description: 'Viagem concluída', createdAt: '2024-01-01'},
      ],
      total: 1,
      page: 1,
      lastPage: 1,
    });

    const result = await gamificationService.getHistory();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('1');
    expect(result.page).toBe(1);
  });

  it('deriva type="earned" para pontos positivos', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [{id: '1', action: 'trip_completed', points: 50, description: '', createdAt: '2024-01-01'}],
      total: 1, page: 1, lastPage: 1,
    });

    const {data: [item]} = await gamificationService.getHistory();

    expect(item.type).toBe('earned');
  });

  it('deriva type="spent" para pontos negativos', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [{id: '2', action: 'discount_used', points: -20, description: '', createdAt: '2024-01-01'}],
      total: 1, page: 1, lastPage: 1,
    });

    const {data: [item]} = await gamificationService.getHistory();

    expect(item.type).toBe('spent');
  });

  it('normaliza pontos negativos para valor absoluto', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [{id: '3', action: 'discount_used', points: -30, description: '', createdAt: '2024-01-01'}],
      total: 1, page: 1, lastPage: 1,
    });

    const {data: [item]} = await gamificationService.getHistory();

    expect(item.points).toBe(30);
  });

  it('preserva pontos positivos sem alterar', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [{id: '4', action: 'review_given', points: 10, description: '', createdAt: '2024-01-01'}],
      total: 1, page: 1, lastPage: 1,
    });

    const {data: [item]} = await gamificationService.getHistory();

    expect(item.points).toBe(10);
  });

  it('retorna lista vazia quando data está vazio', async () => {
    mockAPI.getHistory.mockResolvedValue({data: [], total: 0, page: 1, lastPage: 1});

    const result = await gamificationService.getHistory();

    expect(result.data).toHaveLength(0);
  });

  it('preserva userId e referenceId quando enviados pela API', async () => {
    mockAPI.getHistory.mockResolvedValue({
      data: [{
        id: '5',
        userId: 'user-1',
        action: 'boat_owner_shipment_delivered',
        points: 15,
        description: 'Entrega concluída',
        referenceId: 'shipment-9',
        createdAt: '2024-01-01',
      }],
      total: 1,
      page: 1,
      lastPage: 1,
    });

    const {data: [item]} = await gamificationService.getHistory();

    expect(item.userId).toBe('user-1');
    expect(item.referenceId).toBe('shipment-9');
  });
});

describe('gamificationService.getLeaderboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mapeia position → rank e id → userId', async () => {
    mockAPI.getLeaderboard.mockResolvedValue([
      {position: 1, id: 'user-abc', name: 'João', avatarUrl: null, level: 'Ouro', totalPoints: 500},
    ]);

    const [entry] = await gamificationService.getLeaderboard();

    expect(entry.rank).toBe(1);
    expect(entry.userId).toBe('user-abc');
  });

  it('preserva name, avatarUrl, level e totalPoints', async () => {
    mockAPI.getLeaderboard.mockResolvedValue([
      {position: 2, id: 'user-xyz', name: 'Maria', avatarUrl: 'https://example.com/avatar.png', level: 'Prata', totalPoints: 300},
    ]);

    const [entry] = await gamificationService.getLeaderboard();

    expect(entry.name).toBe('Maria');
    expect(entry.avatarUrl).toBe('https://example.com/avatar.png');
    expect(entry.level).toBe('Prata');
    expect(entry.totalPoints).toBe(300);
  });

  it('retorna lista vazia quando API retorna vazio', async () => {
    mockAPI.getLeaderboard.mockResolvedValue([]);

    const result = await gamificationService.getLeaderboard();

    expect(result).toHaveLength(0);
  });

  it('preserva ordem da API', async () => {
    mockAPI.getLeaderboard.mockResolvedValue([
      {position: 1, id: 'a', name: 'A', avatarUrl: null, level: 'Ouro', totalPoints: 500},
      {position: 2, id: 'b', name: 'B', avatarUrl: null, level: 'Prata', totalPoints: 300},
      {position: 3, id: 'c', name: 'C', avatarUrl: null, level: 'Bronze', totalPoints: 100},
    ]);

    const result = await gamificationService.getLeaderboard();

    expect(result.map(e => e.rank)).toEqual([1, 2, 3]);
    expect(result.map(e => e.userId)).toEqual(['a', 'b', 'c']);
  });
});
