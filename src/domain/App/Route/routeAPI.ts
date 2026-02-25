import {api} from '@api';

import {Route, SearchRouteParams} from './routeTypes';

async function getPopular(): Promise<Route[]> {
  const response = await api.get<Route[]>('/routes', {
    params: {popular: true},
  });
  return response;
}

async function getById(routeId: string): Promise<Route> {
  const response = await api.get<Route>(`/routes/${routeId}`);
  return response;
}

async function search(params: SearchRouteParams): Promise<Route[]> {
  const response = await api.get<Route[]>('/routes/search', {
    params,
  });
  return response;
}

export const routeAPI = {
  getPopular,
  getById,
  search,
};
