import {Boat, CreateBoatRequest} from '@types';

import {api} from './apiClient';

export const boatsApi = {
  async getMyBoats(): Promise<Boat[]> {
    const response = await api.get<Boat[]>('/boats/my-boats');
    return response.data;
  },

  async getById(id: string): Promise<Boat> {
    const response = await api.get<Boat>(`/boats/${id}`);
    return response.data;
  },

  async create(data: CreateBoatRequest): Promise<Boat> {
    const response = await api.post<Boat>('/boats', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateBoatRequest>): Promise<Boat> {
    const response = await api.patch<Boat>(`/boats/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/boats/${id}`);
  },
};
