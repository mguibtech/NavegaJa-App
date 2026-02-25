import {useMutation} from '@tanstack/react-query';

import {captainService} from '../../captainService';
import {CaptainChecklistStatusResponse} from '../../captainTypes';

export function useGetChecklistStatus() {
  const mutation = useMutation<CaptainChecklistStatusResponse, Error, string>({
    mutationFn: (tripId: string) => captainService.getChecklistStatus(tripId),
  });

  return {
    getStatus: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
