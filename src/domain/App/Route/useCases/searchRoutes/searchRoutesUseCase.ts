import {api} from '@api';

import {Route} from '../../routeTypes';

export async function searchRoutesUseCase(
  origin: string,
  destination: string,
): Promise<Route[]> {
  const response = await api.get<Route[]>('/routes/search', {
    params: {origin, destination},
  });
  return response;
}
