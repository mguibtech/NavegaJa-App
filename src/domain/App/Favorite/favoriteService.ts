import AsyncStorage from '@react-native-async-storage/async-storage';

import {favoriteAPI} from './favoriteAPI';
import type {Favorite, CreateFavoriteDto, CheckFavoriteDto, FavoriteType} from './favoriteTypes';

const FAVORITES_STORAGE_KEY = '@navegaja:favorites';

class FavoriteService {
  // GET /favorites - Listar favoritos (com filtro opcional)
  async getMyFavorites(type?: FavoriteType): Promise<Favorite[]> {
    try {
      const response = await favoriteAPI.getMyFavorites(type);

      // Backend pode retornar array direto OU objeto {favorites: [...], total: X}
      const favorites = Array.isArray(response)
        ? response
        : (response?.favorites || []);

      await this.saveOffline(favorites);
      return favorites;
    } catch (_error) {
      // Fallback para offline
      console.log('Using offline favorites', _error);
      const offline = await this.loadOffline();
      // Filtra por tipo se especificado
      return type ? offline.filter(f => f.type === type) : offline;
    }
  }

  // POST /favorites/toggle - Toggle favorito (add ou remove)
  async toggleFavorite(data: CreateFavoriteDto): Promise<{
    action: 'added' | 'removed';
    favorite?: Favorite;
  }> {
    // Cria favorito local temporário
    const localFavorite: Favorite = {
      id: `local-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };

    try {
      // Tenta toggle no backend
      const result = await favoriteAPI.toggleFavorite(data);

      // Atualiza cache local baseado na ação
      const stored = await this.loadOffline();

      if (result.action === 'added' && result.favorite) {
        await this.saveOffline([result.favorite, ...stored]);
      } else if (result.action === 'removed') {
        // Remove do cache local
        const updated = stored.filter(f => !this.isSameFavorite(f, data));
        await this.saveOffline(updated);
      }

      return result;
    } catch {
      console.log('Backend not available, using offline toggle');

      // Toggle offline
      const stored = await this.loadOffline();
      const existingIndex = stored.findIndex(f => this.isSameFavorite(f, data));

      if (existingIndex >= 0) {
        // Remove
        const updated = stored.filter((_, i) => i !== existingIndex);
        await this.saveOffline(updated);
        return {action: 'removed'};
      } else {
        // Add
        await this.saveOffline([localFavorite, ...stored]);
        return {action: 'added', favorite: localFavorite};
      }
    }
  }

  // POST /favorites/check - Verificar se é favorito
  async checkFavorite(data: CheckFavoriteDto): Promise<boolean> {
    try {
      const result = await favoriteAPI.checkFavorite(data);
      return result.isFavorited;
    } catch {
      // Verifica offline
      const stored = await this.loadOffline();
      return stored.some(f => this.isSameFavorite(f, data));
    }
  }

  // Helper: Verifica se dois favoritos são iguais
  private isSameFavorite(
    favorite: Favorite,
    data: CreateFavoriteDto | CheckFavoriteDto,
  ): boolean {
    if (favorite.type !== data.type) return false;

    switch (data.type) {
      case 'destination':
        return (
          favorite.destination === data.destination &&
          (favorite.origin === data.origin || (!favorite.origin && !data.origin))
        );
      case 'boat':
        return favorite.boatId === data.boatId;
      case 'captain':
        return favorite.captainId === data.captainId;
      default:
        return false;
    }
  }

  // Carregar do AsyncStorage
  async loadOffline(): Promise<Favorite[]> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_error) {
      console.error('Error loading favorites offline:', _error);
      return [];
    }
  }

  // Salvar no AsyncStorage
  private async saveOffline(favorites: Favorite[]): Promise<void> {
    try {
      // Garante que sempre salva um array válido
      const validFavorites = Array.isArray(favorites) ? favorites : [];
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(validFavorites),
      );
    } catch (_error) {
      console.error('Error saving favorites offline:', _error);
    }
  }
}

export const favoriteService = new FavoriteService();
