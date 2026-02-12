import {api} from '@api';

import {Booking} from '../../captainTypes';

export async function getPassengersUseCase(
  tripId: string,
): Promise<Booking[]> {
  const response = await api.get<Booking[]>(
    `/captain/trips/${tripId}/passengers`,
  );
  return response;
}
