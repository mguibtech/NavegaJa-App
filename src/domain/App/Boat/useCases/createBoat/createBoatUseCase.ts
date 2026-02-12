import {api} from '@api';

import {Boat, CreateBoatData} from '../../boatTypes';

export async function createBoatUseCase(data: CreateBoatData): Promise<Boat> {
  const response = await api.post<Boat>('/boats', data);
  return response;
}
