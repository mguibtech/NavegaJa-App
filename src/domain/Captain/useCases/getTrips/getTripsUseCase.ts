import {api} from '@api';

import {Trip} from '../../captainTypes';

export async function getTripsUseCase(status?: string): Promise<Trip[]> {
  const params = status ? {status} : {};
  const response = await api.get<Trip[]>('/captain/trips', {params});
  return response;
}
