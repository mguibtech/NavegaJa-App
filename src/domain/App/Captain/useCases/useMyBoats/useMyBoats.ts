import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Boat} from '../../../Boat/boatTypes';

export function useMyBoats() {
  const query = useQuery<Boat[], Error>({
    queryKey: queryKeys.captain.boats(),
    queryFn: () => captainService.getMyBoats(),
  });

  return {
    boats: query.data ?? [],
    fetchBoats: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
