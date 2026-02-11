import {Route} from '@types';

import {api} from './apiClient';

export const routesApi = {
  async getPopular(): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes', {
      params: {popular: true},
    });
    return response.data;
  },

  async getById(routeId: string): Promise<Route> {
    const response = await api.get<Route>(`/routes/${routeId}`);
    return response.data;
  },

  async search(origin: string, destination: string): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes/search', {
      params: {origin, destination},
    });
    return response.data;
  },
};
