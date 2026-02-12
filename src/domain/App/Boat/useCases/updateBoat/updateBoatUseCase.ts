import {api} from '@api';

import {Boat, CreateBoatData} from '../../boatTypes';

export async function updateBoatUseCase(
  id: string,
  data: Partial<CreateBoatData>,
): Promise<Boat> {
  const response = await api.patch<Boat>(`/boats/${id}`, data);
  return response;
}
