import {api} from '@api';

import {Boat} from '../../boatTypes';

export async function getBoatByIdUseCase(id: string): Promise<Boat> {
  const response = await api.get<Boat>(`/boats/${id}`);
  return response;
}
