import {api} from '@api';

import {Route} from '../../routeTypes';

export async function getPopularRoutesUseCase(): Promise<Route[]> {
  const response = await api.get<Route[]>('/routes', {
    params: {popular: true},
  });
  return response;
}
