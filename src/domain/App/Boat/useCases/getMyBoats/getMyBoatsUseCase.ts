import {api} from '@api';

import {Boat} from '../../boatTypes';

export async function getMyBoatsUseCase(): Promise<Boat[]> {
  const response = await api.get<Boat[]>('/boats/my-boats');
  return response;
}
