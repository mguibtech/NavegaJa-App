import {api} from '@api';
import type {
  Favorite,
  CreateFavoriteDto,
  FavoriteResponse,
  CheckFavoriteDto,
  FavoriteType,
} from './favoriteTypes';

// GET /favorites - Listar todos (backend pode retornar array OU objeto)
async function getMyFavorites(type?: FavoriteType): Promise<FavoriteResponse | Favorite[]> {
  const params = type ? `?type=${type}` : '';
  return await api.get<FavoriteResponse | Favorite[]>(`/favorites${params}`);
}

// POST /favorites - Adicionar favorito
async function addFavorite(data: CreateFavoriteDto): Promise<Favorite> {
  return await api.post<Favorite>('/favorites', data);
}

// DELETE /favorites/:id - Remover favorito
async function removeFavorite(id: string): Promise<void> {
  await api.delete(`/favorites/${id}`);
}

// POST /favorites/check - Verificar se é favorito
async function checkFavorite(data: CheckFavoriteDto): Promise<{isFavorited: boolean; favorite?: Favorite}> {
  return await api.post<{isFavorited: boolean; favorite?: Favorite}>(
    '/favorites/check',
    data,
  );
}

// POST /favorites/toggle - Toggle favorito
async function toggleFavorite(data: CreateFavoriteDto): Promise<{action: 'added' | 'removed'; favorite?: Favorite}> {
  return await api.post<{action: 'added' | 'removed'; favorite?: Favorite}>(
    '/favorites/toggle',
    data,
  );
}

export const favoriteAPI = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
  toggleFavorite,
};
