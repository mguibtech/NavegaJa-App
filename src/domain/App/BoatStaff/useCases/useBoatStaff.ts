import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {boatStaffService} from '../boatStaffService';
import {BoatStaff} from '../boatStaffTypes';

export function useBoatStaff() {
  const query = useQuery<BoatStaff[], Error>({
    queryKey: queryKeys.captain.staff(),
    queryFn: () => boatStaffService.getAll(),
  });

  return {
    staff: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
