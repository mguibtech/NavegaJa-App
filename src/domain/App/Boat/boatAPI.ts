import {api} from '@api';

import {Boat, CreateBoatData} from './boatTypes';

const PATH = '/boats';

async function getMyBoats(): Promise<Boat[]> {
  return api.get<Boat[]>(`${PATH}/my-boats`);
}

async function getById(id: string): Promise<Boat> {
  return api.get<Boat>(`${PATH}/${id}`);
}

async function create(data: CreateBoatData): Promise<Boat> {
  return api.post<Boat>(PATH, data);
}

async function update(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
  return api.patch<Boat>(`${PATH}/${id}`, data);
}

async function remove(id: string): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

export const boatAPI = {getMyBoats, getById, create, update, remove};
