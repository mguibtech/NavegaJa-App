import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {boatService} from '../../boatService';
import {Boat} from '../../boatTypes';

export async function getBoatByIdUseCase(id: string): Promise<Boat> {
  return boatService.getById(id);
}

export function useGetBoatById(id: string) {
  const query = useQuery<Boat, Error>({
    queryKey: queryKeys.boats.detail(id),
    queryFn: () => boatService.getById(id),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
