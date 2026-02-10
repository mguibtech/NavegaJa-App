import {Route} from '@types';

import {api} from './apiClient';

export const routesApi = {
  async getAll(): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes');
    return response.data;
  },

  async getById(id: string): Promise<Route> {
    const response = await api.get<Route>(`/routes/${id}`);
    return response.data;
  },

  async search(origin: string, dest: string): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes/search', {
      params: {origin, dest},
    });
    return response.data;
  },
};
